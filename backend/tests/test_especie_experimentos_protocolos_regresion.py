"""
Regresión: experimentos y protocolos vinculados a una especie SOLO por
Experimento.especie_id (sin especímenes físicos, ej. experimentos en estado
"planificado") no aparecían en:
  GET /especies/{id}/experimentos
  GET /especies/{id}/protocolos
porque ambos endpoints solo buscaban a través de la tabla experimento_especimen
(individuos). Un experimento planificado sin frascos quedaba invisible en la
ficha de la especie.
"""
import pytest
from app import models


@pytest.fixture
def especie(db, inject_test_user):
    esp = models.Especie(
        codigo="ZREGRSEED",
        nombre_cientifico="Regressionis testus semilla",
        categoria="especie",
    )
    db.add(esp)
    db.flush()
    return esp


@pytest.fixture
def protocolo(db, inject_test_user):
    proto = models.Protocolo(
        codigo="ZZ-REGR-SIEMB",
        nombre="Siembra y germinación de semillas",
        tipo="propagacion_in_vitro",
        creado_por_id=inject_test_user.id,
    )
    db.add(proto)
    db.flush()
    return proto


@pytest.fixture
def experimento_planificado(db, inject_test_user, especie, protocolo):
    """Experimento ligado a la especie y al protocolo por FK directa,
    SIN especímenes (como los EXP-GERM-* en estado planificado)."""
    exp = models.Experimento(
        codigo="ZZ-REGR-EXP-GERM",
        nombre="Germinación de semillas",
        fecha_inicio="2026-07-28",
        estado="planificado",
        director_id=inject_test_user.id,
        especie_id=especie.id,
        protocolo_id=protocolo.id,
    )
    db.add(exp)
    db.flush()
    return exp


class TestExperimentosDirectosDeEspecie:
    def test_experimento_por_especie_id_sin_especimenes_aparece(
        self, auth_client, especie, experimento_planificado
    ):
        res = auth_client.get(f"/especies/{especie.id}/experimentos")
        assert res.status_code == 200, res.text
        exps = res.json()
        ids = [e["id"] for e in exps]
        assert str(experimento_planificado.id) in ids, \
            "El experimento planificado (sin frascos) debe aparecer en la ficha de la especie"
        item = next(e for e in exps if e["id"] == str(experimento_planificado.id))
        assert item["num_especimenes"] == 0


class TestProtocolosDirectosDeEspecie:
    def test_protocolo_via_experimento_por_especie_id_aparece(
        self, auth_client, especie, protocolo, experimento_planificado
    ):
        res = auth_client.get(f"/especies/{especie.id}/protocolos")
        assert res.status_code == 200, res.text
        ids = [p["id"] for p in res.json()]
        assert str(protocolo.id) in ids, \
            "El protocolo del experimento planificado debe aparecer en la ficha de la especie"
