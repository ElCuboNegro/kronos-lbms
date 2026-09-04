from datetime import date, datetime, timedelta
import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models
from app.services.diagnostico_service import DiagnosticoService as DS

scenarios('../../../docs/features/panel_diagnostico.feature')


@pytest.fixture
def ctx():
    return {}


def _usuario(db):
    u = db.query(models.Usuario).filter(models.Usuario.email == "bdd@lab.com").first()
    if not u:
        u = models.Usuario(nombre="BDD", email="bdd@lab.com",
                           hashed_password="x", rol="tecnico", activo=True)
        db.add(u); db.flush()
    return u


@given('que estoy autenticada en el LBMS')
def autenticada(auth_client):
    pass


@given('un espécimen activo con un evento de contaminación "confirmada"')
def sp_contaminado(db, ctx):
    u = _usuario(db)
    sp = models.Especimen(uid="BDD-CONT-1", especie="X", estado="activo",
                         fecha_ingreso=date(2026, 8, 1))
    db.add(sp); db.flush()
    db.add(models.Evento(tipo="contaminacion", descripcion="c", especimen_id=sp.id,
                        usuario_id=u.id, timestamp=datetime(2026, 8, 20),
                        meta={"contaminacion": "confirmada"}))
    db.flush()
    ctx["uid"] = "BDD-CONT-1"


@given(parsers.parse('una especie con "dias_germinar" esperado de {dias:d}'))
def especie_con_esperado(db, ctx, dias):
    esp = models.Especie(nombre_cientifico="BDD tardia",
                        config_estandar={"diagnostico": {"dias_germinar": dias}})
    db.add(esp); db.flush()
    ctx["especie_id"] = esp.id


@given('una especie sin "dias_germinar" definido')
def especie_sin_esperado(db, ctx):
    esp = models.Especie(nombre_cientifico="BDD sin esperado", config_estandar={})
    db.add(esp); db.flush()
    ctx["especie_id"] = esp.id


@given(parsers.parse('un espécimen de esa especie sembrado hace {dias:d} días sin germinar'))
def sp_sembrado(db, ctx, dias):
    sp = models.Especimen(uid=f"BDD-TARD-{dias}", especie="X", especie_id=ctx["especie_id"],
                         estado="activo", fecha_ingreso=date(2026, 8, 30) - timedelta(days=dias))
    db.add(sp); db.flush()
    ctx["uid"] = sp.uid


@when('pido el diagnóstico')
def pido_diagnostico(db, ctx):
    ctx["payload"] = DS.construir_diagnostico(db, hoy=date(2026, 8, 30))


@when('pido el diagnóstico un miércoles')
def pido_miercoles(db, ctx):
    ctx["payload"] = DS.construir_diagnostico(db, hoy=date(2026, 9, 2))


@when('pido el diagnóstico un jueves')
def pido_jueves(db, ctx):
    ctx["payload"] = DS.construir_diagnostico(db, hoy=date(2026, 9, 3))


@then('la alerta de contaminación incluye ese espécimen')
def then_contaminacion(ctx):
    uids = [a["uid"] for a in ctx["payload"]["alertas"]["contaminacion"]]
    assert ctx["uid"] in uids


@then('la alerta de germinación tardía incluye ese espécimen')
def then_tardia_si(ctx):
    uids = [a["uid"] for a in ctx["payload"]["alertas"]["germinacion_tardia"]]
    assert ctx["uid"] in uids


@then('la alerta de germinación tardía no incluye ese espécimen')
def then_tardia_no(ctx):
    uids = [a["uid"] for a in ctx["payload"]["alertas"]["germinacion_tardia"]]
    assert ctx["uid"] not in uids


@then('el recordatorio de revisión está activo')
def then_rec_si(ctx):
    assert ctx["payload"]["recordatorio_revision"]["activo"] is True


@then('el recordatorio de revisión no está activo')
def then_rec_no(ctx):
    assert ctx["payload"]["recordatorio_revision"]["activo"] is False
