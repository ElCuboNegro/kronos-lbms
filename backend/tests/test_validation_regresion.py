import pytest
from app import models

class TestValidationRegresion:
    """Regresión para Issue #20: Validaciones de rangos numéricos Pydantic"""

    def test_rango_ph_falla_con_fuera_de_limite(self, auth_client, db):
        import uuid

        # 1. Crear Espécimen
        test_esp_id = uuid.uuid4()
        esp = models.Especimen(
            id=test_esp_id,
            uid=f"TEST-{str(uuid.uuid4())[:8]}",
            especie="Test Specie",
            estado="activo"
        )
        db.add(esp)
        db.commit()

        # 2. Intentar registrar evolución con pH imposible (-5)
        payload = {
            "ph_sustrato": -5.0
        }
        res = auth_client.post(f"/especimenes/{test_esp_id}/evolucion", json=payload)

        assert res.status_code == 422
        assert "ph_sustrato" in res.text

    def test_rango_humedad_falla_con_fuera_de_limite(self, auth_client, db):
        import uuid
        test_esp_id = uuid.uuid4()
        esp = models.Especimen(id=test_esp_id, uid=f"TEST-{str(uuid.uuid4())[:8]}", especie="Test Specie", estado="activo")
        db.add(esp)
        db.commit()

        # 2. Intentar registrar evolución con humedad imposible (150%)
        payload = {
            "humedad_relativa_pct": 150.0
        }
        res = auth_client.post(f"/especimenes/{test_esp_id}/evolucion", json=payload)

        assert res.status_code == 422
        assert "humedad_relativa_pct" in res.text

    def test_rango_morfologico_falla_con_negativo(self, auth_client, db):
        import uuid
        test_esp_id = uuid.uuid4()
        esp = models.Especimen(id=test_esp_id, uid=f"TEST-{str(uuid.uuid4())[:8]}", especie="Test Specie", estado="activo")
        db.add(esp)
        db.commit()

        # 2. Intentar registrar evolución con altura negativa
        res1 = auth_client.post(f"/especimenes/{test_esp_id}/evolucion", json={"altura_cm": -10.0})
        assert res1.status_code == 422
        assert "altura_cm" in res1.text

        # 3. Intentar registrar evolución con número de hojas negativo
        res2 = auth_client.post(f"/especimenes/{test_esp_id}/evolucion", json={"num_hojas": -1})
        assert res2.status_code == 422
        assert "num_hojas" in res2.text
