import pytest

class TestExperimentoResultadosRegresion:
    """Regresión para Issue #15: ExperimentoDetail sin resultados"""

    def test_frontend_debe_poder_listar_resultados(self, auth_client, db):
        from app.models import Experimento, ResultadoInvestigacion
        import uuid
        
        # 1. Crear Experimento
        exp_id = uuid.uuid4()
        user_id = auth_client.get("/auth/me").json()["id"]
        
        exp = Experimento(
            id=exp_id,
            nombre="Exp Resultados Test",
            director_id=user_id,
            estado="activo"
        )
        db.add(exp)
        db.commit()

        # 2. Agregar Resultado
        res = auth_client.post(f"/experimentos/{exp_id}/resultados", json={
            "titulo": "Hallazgo 1",
            "tipo": "observacion",
            "descripcion": "Callo en formación"
        })
        assert res.status_code == 201

        # 3. Listar Resultados
        res_list = auth_client.get(f"/experimentos/{exp_id}/resultados")
        assert res_list.status_code == 200
        data = res_list.json()
        assert len(data) == 1
        assert data[0]["titulo"] == "Hallazgo 1"
