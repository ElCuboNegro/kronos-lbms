import pytest
import concurrent.futures

class TestRaceConditionRegresion:
    """Regresión para Issue #17: Race condition en UIDs en crear_bulk"""

    def test_race_condition_crear_bulk_no_colisiona(self, auth_client, db):
        """Si no hay lock de base de datos, dos peticiones concurrentes para crear
        especímenes de la misma especie en el mismo segundo generarán los mismos UIDs
        y colisionarán con 500 (IntegrityError). Con el pg_advisory_xact_lock,
        el segundo request esperará al primero y no habrá colisión."""
        from app.models import Especie, Especimen
        import uuid

        # 1. Crear una especie
        esp_id = uuid.uuid4()
        esp = Especie(id=esp_id, nombre_cientifico="Test Specie Concurrent", codigo="TSPC")
        db.add(esp)
        db.commit()

        payload = {
            "especie_id": str(esp_id),
            "fecha_ingreso": "2026-05-02",
            "items": [{"cantidad": 2}, {"cantidad": 2}] # 4 especímenes
        }

        # 2. Hacer 3 peticiones en paralelo (12 especímenes en total) usando threads
        def make_request():
            # In a test environment with shared db sessions, concurrent writes 
            # might cause sqlalchemy InvalidRequestError on the fixture. 
            # We are verifying if it catches unique constraints or locks properly.
            return auth_client.post("/especimenes/bulk", json=payload)

        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(make_request) for _ in range(3)]
            responses = [f.result() for f in concurrent.futures.as_completed(futures)]

        # 3. Ninguna petición debe fallar con 500 (UniqueViolation)
        status_codes = [res.status_code for res in responses]
        assert all(status == 201 for status in status_codes), f"Hubo colisiones o errores: {status_codes}, textos: {[r.text for r in responses if r.status_code != 201]}"

        # 4. Asegurarnos de que se crearon los 12
        total = db.query(Especimen).filter(Especimen.especie_id == esp_id).count()
        assert total == 12, f"Se esperaban 12 especímenes, se encontraron {total}"
