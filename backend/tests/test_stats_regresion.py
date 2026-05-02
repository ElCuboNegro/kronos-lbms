import pytest

class TestStatsEndpointRegresion:
    """Regresión para el Issue #9: Crear endpoint de stats liviano"""

    def test_get_stats_devuelve_conteos_correctos(self, auth_client, db):
        from app.models import Especie, Especimen, Experimento, Protocolo
        import uuid

        # Limpiar algunas tablas para asegurar conteos base si es necesario
        # o simplemente crear y verificar aumento

        base_res = auth_client.get("/stats")
        base_data = base_res.json()
        
        esp_count = base_data["especies"]
        ind_count = base_data["individuos"]
        exp_count = base_data["experimentos_activos"]
        prot_count = base_data["protocolos"]

        # 1. Crear un experimento activo
        exp = Experimento(
            nombre="Exp Test Stats",
            estado="activo",
            director_id=auth_client.get("/auth/me").json()["id"]
        )
        db.add(exp)
        db.commit()

        # 2. Consultar de nuevo
        res = auth_client.get("/stats")
        assert res.status_code == 200
        
        data = res.json()
        assert data["experimentos_activos"] == exp_count + 1
        assert "especies" in data
        assert "individuos" in data
        assert "protocolos" in data
