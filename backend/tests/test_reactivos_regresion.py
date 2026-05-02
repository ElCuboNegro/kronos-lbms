import pytest
from app import models


@pytest.fixture
def reactivo(db):
    r = models.Reactivo(nombre="Agua destilada", unidad_medida="mL")
    db.add(r)
    db.flush()
    return r


@pytest.fixture
def formulacion(db, reactivo):
    f = models.Formulacion(
        nombre="MS basal",
        descripcion="Murashige & Skoog",
        caducidad_dias=30,
    )
    db.add(f)
    db.flush()
    comp = models.FormulacionComponente(
        formulacion_id=f.id,
        reactivo_id=reactivo.id,
        cantidad_base=1.0,
    )
    db.add(comp)
    db.flush()
    return f


@pytest.fixture
def lote_con_expiracion(db, formulacion, inject_test_user):
    from datetime import datetime, timedelta
    lote = models.LotePreparado(
        uid="REAC-260101-001",
        formulacion_id=formulacion.id,
        preparado_por_id=inject_test_user.id,
        volumen_l=1.0,
        concentracion_x=1.0,
        fecha_expiracion=datetime.now() + timedelta(days=30),
        estado="disponible",
    )
    db.add(lote)
    db.flush()
    return lote


@pytest.fixture
def lote_sin_expiracion(db, formulacion, inject_test_user):
    """Regression: fecha_expiracion nullable — serialization must not crash."""
    lote = models.LotePreparado(
        uid="REAC-260101-002",
        formulacion_id=formulacion.id,
        preparado_por_id=inject_test_user.id,
        volumen_l=1.0,
        concentracion_x=1.0,
        fecha_expiracion=None,
        estado="disponible",
    )
    db.add(lote)
    db.flush()
    return lote


class TestRouteOrdering:
    """Issue #25: static routes must be registered before /{id}."""

    def test_get_formulaciones_no_interpretado_como_id(self, auth_client):
        """/reactivos/formulaciones no debe devolver 422 por UUID inválido."""
        res = auth_client.get("/reactivos/formulaciones")
        assert res.status_code == 200, res.text

    def test_get_lotes_no_interpretado_como_id(self, auth_client):
        """/reactivos/lotes no debe devolver 422 por UUID inválido."""
        res = auth_client.get("/reactivos/lotes")
        assert res.status_code == 200, res.text

    def test_get_reactivo_valido_con_id(self, auth_client, reactivo):
        """GET /{id} sigue funcionando con UUID real."""
        res = auth_client.get(f"/reactivos/{reactivo.id}")
        assert res.status_code == 200
        assert res.json()["nombre"] == reactivo.nombre

    def test_get_formulacion_valida_con_id(self, auth_client, formulacion):
        """GET /formulaciones/{id} sigue funcionando con UUID real."""
        res = auth_client.get(f"/reactivos/formulaciones/{formulacion.id}")
        assert res.status_code == 200
        assert res.json()["nombre"] == formulacion.nombre

    def test_get_id_inexistente_retorna_404(self, auth_client):
        """/{id} con UUID válido pero no existente retorna 404, no 422."""
        res = auth_client.get("/reactivos/00000000-0000-0000-0000-000000000000")
        assert res.status_code == 404


class TestLoteFechaExpiracion:
    """Issue #25: fecha_expiracion es nullable; el schema debe ser Optional."""

    def test_lote_con_expiracion_serializa(self, auth_client, lote_con_expiracion):
        res = auth_client.get("/reactivos/lotes")
        assert res.status_code == 200, res.text
        ids = [l["id"] for l in res.json()]
        assert str(lote_con_expiracion.id) in ids

    def test_lote_sin_expiracion_no_rompe_serializacion(self, auth_client, lote_sin_expiracion):
        """Regression #25: lista de lotes no debe crashear si fecha_expiracion es NULL."""
        res = auth_client.get("/reactivos/lotes")
        assert res.status_code == 200, res.text
        lote = next((l for l in res.json() if l["id"] == str(lote_sin_expiracion.id)), None)
        assert lote is not None
        assert lote["fecha_expiracion"] is None

    def test_lote_sin_expiracion_en_formulaciones_no_afecta(self, auth_client, lote_sin_expiracion):
        """Formulaciones sigue respondiendo 200 aunque existan lotes sin fecha_expiracion."""
        res = auth_client.get("/reactivos/formulaciones")
        assert res.status_code == 200, res.text
