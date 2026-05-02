import pytest
from app.models import Especie, Linea, Variegacion, Especimen
import uuid

class TestEspecieTotalIndividuosRegresion:
    """Regresión para el Issue #45: total_individuos cuenta mal."""

    def test_total_individuos_incluye_lineas_y_variegaciones(self, auth_client, db):
        # 1. Crear especie, linea, variegacion
        esp_id = uuid.uuid4()
        lin_id = uuid.uuid4()
        var_id = uuid.uuid4()

        db.add(Especie(id=esp_id, nombre_cientifico=f"Specie Total {esp_id}", codigo="STOT"))
        db.add(Linea(id=lin_id, especie_id=esp_id, nombre="Linea Total"))
        db.add(Variegacion(id=var_id, linea_id=lin_id, nombre="Var Total"))
        db.commit()

        # 2. Agregar especimenes
        # - 2 directos
        db.add(Especimen(id=uuid.uuid4(), uid=f"T1-{uuid.uuid4().hex[:4]}", especie_id=esp_id, especie="S", estado="activo"))
        db.add(Especimen(id=uuid.uuid4(), uid=f"T2-{uuid.uuid4().hex[:4]}", especie_id=esp_id, especie="S", estado="activo"))

        # - 5 en linea
        for i in range(5):
            db.add(Especimen(id=uuid.uuid4(), uid=f"TL{i}-{uuid.uuid4().hex[:4]}", especie_id=esp_id, linea_id=lin_id, especie="S", estado="activo"))

        # - 3 en variegacion
        for i in range(3):
            db.add(Especimen(id=uuid.uuid4(), uid=f"TV{i}-{uuid.uuid4().hex[:4]}", especie_id=esp_id, linea_id=lin_id, variegacion_id=var_id, especie="S", estado="activo"))

        db.commit()

        # 3. Testear listado
        res_list = auth_client.get("/especies")
        assert res_list.status_code == 200
        data_list = res_list.json()
        item = next(e for e in data_list if e["id"] == str(esp_id))

        # Debería sumar 2 + 5 + 3 = 10
        assert item["total_individuos"] == 10

        # 4. Testear detalle
        res_detail = auth_client.get(f"/especies/{esp_id}")
        assert res_detail.status_code == 200
        data_detail = res_detail.json()
        assert data_detail["total_individuos"] == 10
