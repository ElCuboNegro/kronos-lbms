import pytest
from app import models


@pytest.fixture
def especie_sin_codigo(db):
    """Regression #6: codigo es nullable en el modelo pero estaba marcado str en el schema."""
    e = models.Especie(
        nombre_cientifico="Monstera deliciosa",
        categoria="planta",
        codigo=None,
    )
    db.add(e)
    db.flush()
    return e


@pytest.fixture
def especie_con_codigo(db):
    e = models.Especie(
        nombre_cientifico="Monstera adansonii",
        categoria="planta",
        codigo="MONA",
    )
    db.add(e)
    db.flush()
    return e


@pytest.fixture
def linea(db, especie_con_codigo):
    l = models.Linea(
        especie_id=especie_con_codigo.id,
        nombre="Estaca apical",
        metodo_propagacion="estaca",
    )
    db.add(l)
    db.flush()
    return l


@pytest.fixture
def variegacion_sin_codigo(db, linea):
    """Regression #6: VariegacionOut.codigo tambien era Optional[str] sin default."""
    v = models.Variegacion(
        linea_id=linea.id,
        nombre="Albo variegata",
        codigo=None,
    )
    db.add(v)
    db.flush()
    return v


class TestEspecieCodigoOptional:
    """Issue #6: Especie.codigo es nullable — los schemas Out deben usar Optional[str]=None."""

    def test_listar_especies_con_codigo_nulo_no_crashea(self, auth_client, especie_sin_codigo):
        res = auth_client.get("/especies")
        assert res.status_code == 200, res.text
        item = next((e for e in res.json() if e["id"] == str(especie_sin_codigo.id)), None)
        assert item is not None
        assert item["codigo"] is None

    def test_obtener_especie_con_codigo_nulo_no_crashea(self, auth_client, especie_sin_codigo):
        res = auth_client.get(f"/especies/{especie_sin_codigo.id}")
        assert res.status_code == 200, res.text
        assert res.json()["codigo"] is None

    def test_especie_con_codigo_sigue_funcionando(self, auth_client, especie_con_codigo):
        res = auth_client.get(f"/especies/{especie_con_codigo.id}")
        assert res.status_code == 200
        assert res.json()["codigo"] == "MONA"

    def test_variegacion_con_codigo_nulo_serializa(self, auth_client, variegacion_sin_codigo, linea):
        res = auth_client.get(f"/especies/{linea.especie_id}")
        assert res.status_code == 200, res.text
        lineas_data = res.json().get("lineas", [])
        variegaciones = [v for l in lineas_data for v in l.get("variegaciones", [])]
        v = next((v for v in variegaciones if v["id"] == str(variegacion_sin_codigo.id)), None)
        assert v is not None
        assert v["codigo"] is None
