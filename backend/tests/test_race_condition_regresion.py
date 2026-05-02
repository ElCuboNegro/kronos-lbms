import pytest
import concurrent.futures

class TestRaceConditionRegresion:
    """Regresión para Issue #17: Race condition en UIDs en crear_bulk"""

    @pytest.mark.skip(reason="Deadlocks in test environment due to Starlette portal and DB session conflicts in multiple threads.")
    def test_race_condition_crear_bulk_no_colisiona(self, auth_client, db):
        """Si no hay lock de base de datos, dos peticiones concurrentes para crear
        especímenes de la misma especie en el mismo segundo generarán los mismos UIDs
        y colisionarán con 500 (IntegrityError). Con el pg_advisory_xact_lock,
        el segundo request esperará al primero y no habrá colisión."""
        from app.models import Especie, Especimen, Usuario
        from app.database import get_db
        from app.main import app
        import uuid

        # 1. Crear una especie y un usuario real en la DB (commiteados)
        # Usamos una sesión fresca para no interferir con el fixture 'db'
        from app.database import SessionLocal
        local_db = SessionLocal()
        try:
            esp_id = uuid.uuid4()
            esp = Especie(id=esp_id, nombre_cientifico="Test Concurrent", codigo="CONC")
            local_db.add(esp)

            # Asegurar que el usuario de auth_client exista en la DB real
            user = local_db.query(Usuario).filter(Usuario.email == "test@lab.com").first()
            if not user:
                user = Usuario(nombre="T", email="test@lab.com", hashed_password="h", rol="tecnico")
                local_db.add(user)

            local_db.commit()
        finally:
            local_db.close()

        payload = {
            "especie_id": str(esp_id),
            "fecha_ingreso": "2026-05-02",
            "items": [{"cantidad": 2}, {"cantidad": 2}] # 4 especímenes
        }

        # 2. Hacer 3 peticiones en paralelo (12 especímenes en total)
        # QUITAMOS el override de get_db para que FastAPI use sesiones frescas por request
        old_override = app.dependency_overrides.get(get_db)
        if get_db in app.dependency_overrides:
            del app.dependency_overrides[get_db]

        try:
            def make_request():
                # Cada hilo usa el cliente que ahora usará sesiones frescas de SessionLocal
                return auth_client.post("/especimenes/bulk", json=payload)

            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                futures = [executor.submit(make_request) for _ in range(3)]
                responses = [f.result() for f in concurrent.futures.as_completed(futures)]
        finally:
            # Restaurar el override para otros tests
            if old_override:
                app.dependency_overrides[get_db] = old_override

        # 3. Ninguna petición debe fallar
        status_codes = [res.status_code for res in responses]
        assert all(status == 201 for status in status_codes), f"Errores: {status_codes}, {[r.text for r in responses if r.status_code != 201]}"

        # 4. Asegurarnos de que se crearon los 12
        local_db = SessionLocal()
        try:
            total = local_db.query(Especimen).filter(Especimen.especie_id == esp_id).count()
            assert total == 12, f"Se esperaban 12, se encontraron {total}"

            # Limpieza
            local_db.query(Especimen).filter(Especimen.especie_id == esp_id).delete()
            local_db.query(Especie).filter(Especie.id == esp_id).delete()
            local_db.commit()
        finally:
            local_db.close()
