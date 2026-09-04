from datetime import date
from app import models


def _sp_contaminado(db, uid="UNDO-EP-1"):
    sp = db.query(models.Especimen).filter(models.Especimen.uid == uid).first()
    if not sp:
        sp = models.Especimen(uid=uid, especie="X", estado="contaminado",
                             fecha_ingreso=date(2026, 8, 1))
        db.add(sp); db.flush()
    else:
        sp.estado = "contaminado"; db.flush()
    return sp


def test_evento_descartada_regresa_estado_activo(auth_client, db):
    sp = _sp_contaminado(db)
    res = auth_client.post("/eventos", json={
        "tipo": "observacion",
        "descripcion": "Marca de contaminación deshecha",
        "especimen_id": str(sp.id),
        "meta": {"contaminacion": "descartada"},
    })
    assert res.status_code == 201
    refreshed = db.query(models.Especimen).filter(models.Especimen.id == sp.id).first()
    assert refreshed.estado == "activo"
