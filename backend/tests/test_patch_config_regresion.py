import pytest
from app import models
import uuid

def test_patch_experimento_preserves_config_estandar(auth_client, db, inject_test_user):
    # 1. Crear experimento con una config inicial
    exp_id = uuid.uuid4()
    exp = models.Experimento(
        id=exp_id,
        nombre="Exp Config Test",
        director_id=inject_test_user.id,
        config_estandar={"field_to_preserve": "keep_me", "temp": 25.0}
    )
    db.add(exp)
    db.commit()

    # 2. Patch solo un campo de config (simulando lo que haria el frontend)
    # El frontend manda el objeto completo que quiere persistir
    new_config = {"field_to_preserve": "keep_me", "temp": 30.0, "new_field": "added"}

    res = auth_client.patch(f"/experimentos/{exp_id}", json={"config_estandar": new_config})
    assert res.status_code == 200

    data = res.json()
    assert data["config_estandar"]["field_to_preserve"] == "keep_me"
    assert data["config_estandar"]["temp"] == 30.0
    assert data["config_estandar"]["new_field"] == "added"

    # 3. Patch con null para borrar config
    res2 = auth_client.patch(f"/experimentos/{exp_id}", json={"config_estandar": None})
    assert res2.status_code == 200
    assert res2.json()["config_estandar"] is None
