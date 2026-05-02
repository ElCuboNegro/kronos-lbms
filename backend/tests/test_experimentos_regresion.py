"""
Regresión para issue #5:
  _exp_out accedía a e.especie.nombre_cientifico (Column String),
  e.linea.nombre y e.variegacion.nombre (atributos inexistentes).
  Resultado: AttributeError en GET /experimentos/{id} con especímenes asignados.
"""
import pytest
from app import models


@pytest.fixture
def especie(db, inject_test_user):
    esp = models.Especie(
        codigo="TEST",
        nombre_cientifico="Monstera deliciosa",
        categoria="especie",
    )
    db.add(esp)
    db.flush()
    return esp


@pytest.fixture
def linea(db, especie):
    l = models.Linea(
        especie_id=especie.id,
        nombre="Línea TEST",
        metodo_propagacion="clonacion",
    )
    db.add(l)
    db.flush()
    return l


@pytest.fixture
def variegacion(db, linea):
    v = models.Variegacion(
        linea_id=linea.id,
        nombre="Albo",
        codigo="ALBO",
    )
    db.add(v)
    db.flush()
    return v


@pytest.fixture
def especimen_con_relaciones(db, inject_test_user, especie, linea, variegacion):
    esp = models.Especimen(
        uid="REGR-001",
        especie=especie.nombre_cientifico,
        especie_id=especie.id,
        linea_id=linea.id,
        variegacion_id=variegacion.id,
        estado="activo",
    )
    db.add(esp)
    db.flush()
    return esp


@pytest.fixture
def especimen_sin_relaciones(db, inject_test_user):
    """Espécimen creado solo con el campo texto libre especie (sin FK)."""
    esp = models.Especimen(
        uid="REGR-002",
        especie="Especie manual",
        estado="activo",
    )
    db.add(esp)
    db.flush()
    return esp


@pytest.fixture
def experimento(db, inject_test_user):
    exp = models.Experimento(
        nombre="Experimento de regresión",
        fecha_inicio="2024-01-01",
        director_id=inject_test_user.id,
    )
    db.add(exp)
    db.flush()
    return exp


class TestExpOutAtributos:
    """GET /experimentos/{id} no debe crashear con especímenes asignados."""

    def test_experimento_sin_especimenes_retorna_200(self, auth_client, experimento):
        res = auth_client.get(f"/experimentos/{experimento.id}")
        assert res.status_code == 200
        assert res.json()["especimenes"] == []

    def test_experimento_con_especimen_completo_retorna_200(
        self, auth_client, db, experimento, especimen_con_relaciones, especie, linea, variegacion
    ):
        """Regresión directa del bug: e.especie.nombre_cientifico sobre Column(String) crasheaba."""
        experimento.especimenes.append(especimen_con_relaciones)
        db.flush()

        res = auth_client.get(f"/experimentos/{experimento.id}")

        assert res.status_code == 200, res.text
        especimenes = res.json()["especimenes"]
        assert len(especimenes) == 1

        esp_out = especimenes[0]
        assert esp_out["especie"] == especie.nombre_cientifico
        assert esp_out["linea_nombre"] == linea.nombre
        assert esp_out["variegacion_nombre"] == variegacion.nombre

    def test_experimento_con_especimen_sin_fk_retorna_200(
        self, auth_client, db, experimento, especimen_sin_relaciones
    ):
        """Espécimen sin especie_id/linea_id usa el campo texto como fallback."""
        experimento.especimenes.append(especimen_sin_relaciones)
        db.flush()

        res = auth_client.get(f"/experimentos/{experimento.id}")

        assert res.status_code == 200, res.text
        esp_out = res.json()["especimenes"][0]
        assert esp_out["especie"] == "Especie manual"
        assert esp_out["linea_nombre"] is None
        assert esp_out["variegacion_nombre"] is None

    def test_crear_experimento_con_especimenes_retorna_201(
        self, auth_client, db, inject_test_user, especimen_con_relaciones, especie, linea, variegacion
    ):
        """POST /experimentos con especimen_ids no debe crashear al serializar."""
        payload = {
            "nombre": "Exp nuevo con especimen",
            "fecha_inicio": "2024-06-01",
            "especimen_ids": [str(especimen_con_relaciones.id)],
            "elemento_ids": [],
        }
        res = auth_client.post("/experimentos", json=payload)

        assert res.status_code == 201, res.text
        especimenes = res.json()["especimenes"]
        assert len(especimenes) == 1
        assert especimenes[0]["especie"] == especie.nombre_cientifico
        assert especimenes[0]["linea_nombre"] == linea.nombre

    def test_patch_experimento_con_especimenes_retorna_200(
        self, auth_client, db, experimento, especimen_con_relaciones
    ):
        """PATCH /experimentos/{id} también usa _query_exp y no debe crashear."""
        experimento.especimenes.append(especimen_con_relaciones)
        db.flush()

        res = auth_client.patch(
            f"/experimentos/{experimento.id}",
            json={"notas": "actualizado en test"},
        )

        assert res.status_code == 200, res.text
        assert res.json()["notas"] == "actualizado en test"
        assert len(res.json()["especimenes"]) == 1

    def test_experimento_no_encontrado_retorna_404(self, auth_client):
        fake_id = "00000000-0000-0000-0000-000000000000"
        res = auth_client.get(f"/experimentos/{fake_id}")
        assert res.status_code == 404
