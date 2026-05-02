import pytest
from app import models

class TestEspecimenIndiceRegresion:
    """Regresión para Issue #22: Campo Especimen.indice sin usar"""

    def test_crear_bulk_asigna_y_usa_indice(self, auth_client, db):
        import uuid

        # 1. Crear una especie
        esp_id = uuid.uuid4()
        esp = models.Especie(id=esp_id, nombre_cientifico="Test Specie Indice", codigo="TSIND")
        db.add(esp)
        db.commit()

        # 2. Hacer petición bulk (2 items)
        payload = {
            "especie_id": str(esp_id),
            "fecha_ingreso": "2026-05-02",
            "items": [{"cantidad": 2}]
        }
        res1 = auth_client.post("/especimenes/bulk", json=payload)
        assert res1.status_code == 201

        # 3. Verificar que los creados tengan el índice asginado
        data1 = res1.json()
        uids = [e["uid"] for e in data1]

        esp1 = db.query(models.Especimen).filter(models.Especimen.uid == uids[0]).first()
        esp2 = db.query(models.Especimen).filter(models.Especimen.uid == uids[1]).first()

        assert esp1.indice == 1
        assert esp2.indice == 2

        # 4. Hacer segunda petición bulk en el mismo día/segundo
        res2 = auth_client.post("/especimenes/bulk", json={"especie_id": str(esp_id), "fecha_ingreso": "2026-05-02", "items": [{"cantidad": 1}]})
        assert res2.status_code == 201

        # 5. El nuevo debe tener índice 3
        data2 = res2.json()
        esp3 = db.query(models.Especimen).filter(models.Especimen.uid == data2[0]["uid"]).first()

        assert esp3.indice == 3
