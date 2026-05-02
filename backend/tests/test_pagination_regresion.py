import pytest

class TestPaginationRegresion:
    """Regresión para Issue #18: Paginación en endpoints de listado"""

    def test_listado_especimenes_paginacion(self, auth_client, db):
        from app.models import Especimen
        import uuid

        # Limpiar temporalmente creando con un prefijo unico para contar exacto
        prefix = f"PAG-{uuid.uuid4().hex[:4]}"
        for i in range(3):
            db.add(Especimen(id=uuid.uuid4(), uid=f"{prefix}-{i}", especie="Test Pag", estado="activo"))
        db.commit()

        # Obtener lista completa para saber la posición
        total_prev = len(auth_client.get("/especimenes").json())

        # Debe retornar solo 2 si limit=2
        res = auth_client.get("/especimenes?skip=0&limit=2")
        assert res.status_code == 200
        assert len(res.json()) == 2

        # Debe saltarse 2
        res2 = auth_client.get("/especimenes?skip=2&limit=2")
        assert res2.status_code == 200

    def test_listado_especies_paginacion(self, auth_client, db):
        from app.models import Especie
        import uuid
        for i in range(3):
            db.add(Especie(id=uuid.uuid4(), nombre_cientifico=f"Specie Pag {uuid.uuid4()}", categoria="planta"))
        db.commit()

        res = auth_client.get("/especies?limit=2")
        assert len(res.json()) == 2

    def test_listado_elementos_paginacion(self, auth_client, db):
        from app.models import Elemento
        import uuid
        for i in range(3):
            db.add(Elemento(id=uuid.uuid4(), element_id=f"EL-PAG-{uuid.uuid4().hex[:4]}", descripcion=f"Item {i}", tipo="insumo", cantidad=1, unidad="u"))
        db.commit()

        res = auth_client.get("/elementos?limit=2")
        assert len(res.json()) == 2

    def test_listado_protocolos_paginacion(self, auth_client, db):
        from app.models import Protocolo
        import uuid
        user_id = auth_client.get("/auth/me").json()["id"]
        for i in range(3):
            db.add(Protocolo(id=uuid.uuid4(), nombre=f"Proto Pag {uuid.uuid4()}", tipo="otro", version="1.0", descripcion="test", pasos=[], creado_por_id=user_id))
        db.commit()

        res = auth_client.get("/protocolos?limit=2")
        assert len(res.json()) == 2

    def test_listado_experimentos_paginacion(self, auth_client, db):
        from app.models import Experimento
        import uuid
        user_id = auth_client.get("/auth/me").json()["id"]
        for i in range(3):
            db.add(Experimento(id=uuid.uuid4(), nombre=f"Exp Pag {uuid.uuid4()}", fecha_inicio="2026-05-02", director_id=user_id))
        db.commit()

        res = auth_client.get("/experimentos?limit=2")
        assert len(res.json()) == 2
