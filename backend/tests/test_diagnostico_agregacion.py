from datetime import date, datetime, timedelta
from app import models
from app.services.diagnostico_service import DiagnosticoService as DS


def _usuario(db):
    u = db.query(models.Usuario).filter(models.Usuario.email == "diag@lab.com").first()
    if not u:
        u = models.Usuario(nombre="Diag", email="diag@lab.com",
                            hashed_password="x", rol="tecnico", activo=True)
        db.add(u); db.flush()
    return u


def test_contaminacion_y_germinacion_tardia(db):
    u = _usuario(db)
    esp = models.Especie(nombre_cientifico="Testus contaminata",
                         nombre_comun="TestC",
                         config_estandar={"diagnostico": {"dias_germinar": 21}})
    db.add(esp); db.flush()

    sp = models.Especimen(uid="DIAG-SP-1", especie="TestC", especie_id=esp.id,
                          estado="activo", fecha_ingreso=date(2026, 8, 1))
    db.add(sp); db.flush()
    db.add(models.Evento(tipo="contaminacion", descripcion="cont",
                         especimen_id=sp.id, usuario_id=u.id,
                         timestamp=datetime(2026, 8, 20),
                         meta={"contaminacion": "confirmada"}))
    db.flush()

    payload = DS.construir_diagnostico(db, hoy=date(2026, 8, 30))

    cont_uids = [a["uid"] for a in payload["alertas"]["contaminacion"]]
    tard_uids = [a["uid"] for a in payload["alertas"]["germinacion_tardia"]]
    assert "DIAG-SP-1" in cont_uids
    assert "DIAG-SP-1" in tard_uids


def test_recordatorio_miercoles(db):
    payload_mie = DS.construir_diagnostico(db, hoy=date(2026, 9, 2))   # miércoles
    payload_jue = DS.construir_diagnostico(db, hoy=date(2026, 9, 3))   # jueves
    assert payload_mie["recordatorio_revision"]["activo"] is True
    assert payload_jue["recordatorio_revision"]["activo"] is False
