"""Cimientos del diseño factorial (ADR-0001, Plan 1): modelos y relaciones."""
import pytest
from app import models


@pytest.fixture
def director(db):
    u = models.Usuario(nombre="Dir Test", email="dir-factorial@test.lab",
                       hashed_password="x", rol="admin")
    db.add(u)
    db.flush()
    return u


@pytest.fixture
def experimento(db, director):
    exp = models.Experimento(codigo="EXP-FACT-1", nombre="Ensayo factorial",
                             director_id=director.id, tipo_diseno="factorial")
    db.add(exp)
    db.flush()
    return exp


def test_factor_con_niveles(db, experimento):
    factor = models.Factor(experimento_id=experimento.id, nombre="auxina",
                           unidad="mg/L", tipo="continuo")
    factor.niveles.append(models.NivelFactor(etiqueta="0.5", valor_num=0.5, orden=1))
    factor.niveles.append(models.NivelFactor(etiqueta="1.0", valor_num=1.0, orden=2))
    db.add(factor)
    db.flush()

    assert factor.experimento.id == experimento.id
    assert len(factor.niveles) == 2
    assert factor.niveles[0].etiqueta == "0.5"


def test_tratamiento_referencia_niveles(db, experimento):
    factor = models.Factor(experimento_id=experimento.id, nombre="sustrato", tipo="categorico")
    nivel_a = models.NivelFactor(etiqueta="A", orden=1)
    factor.niveles.append(nivel_a)
    db.add(factor)
    db.flush()

    trat = models.Tratamiento(experimento_id=experimento.id, codigo="T1",
                              nombre="sustrato=A", es_control=False)
    trat.niveles.append(nivel_a)
    db.add(trat)
    db.flush()

    assert trat.experimento.id == experimento.id
    assert trat.niveles[0].etiqueta == "A"
    assert experimento.tratamientos[0].codigo == "T1"


from app.services.experiment_service import ExperimentService


def test_generar_tratamientos_producto_cartesiano(db, experimento):
    sustrato = models.Factor(experimento_id=experimento.id, nombre="sustrato", tipo="categorico")
    sustrato.niveles.append(models.NivelFactor(etiqueta="A", orden=1))
    sustrato.niveles.append(models.NivelFactor(etiqueta="B", orden=2))
    auxina = models.Factor(experimento_id=experimento.id, nombre="auxina", unidad="mg/L", tipo="continuo")
    auxina.niveles.append(models.NivelFactor(etiqueta="0.5", valor_num=0.5, orden=1))
    auxina.niveles.append(models.NivelFactor(etiqueta="1.0", valor_num=1.0, orden=2))
    db.add_all([sustrato, auxina])
    db.flush()

    tratamientos = ExperimentService.generar_tratamientos(db, experimento.id)

    # 2 niveles × 2 niveles = 4 tratamientos
    assert len(tratamientos) == 4
    # cada tratamiento referencia un nivel por factor (2 niveles)
    assert all(len(t.niveles) == 2 for t in tratamientos)
    codigos = {t.codigo for t in tratamientos}
    assert codigos == {"T1", "T2", "T3", "T4"}


def test_api_crear_factor_y_generar_tratamientos(auth_client, db, experimento):
    eid = str(experimento.id)

    # crear dos factores con niveles vía API
    r1 = auth_client.post(f"/experimentos/{eid}/factores", json={
        "nombre": "sustrato", "tipo": "categorico",
        "niveles": [{"etiqueta": "A", "orden": 1}, {"etiqueta": "B", "orden": 2}],
    })
    assert r1.status_code == 201, r1.text
    assert len(r1.json()["niveles"]) == 2

    auth_client.post(f"/experimentos/{eid}/factores", json={
        "nombre": "auxina", "unidad": "mg/L", "tipo": "continuo",
        "niveles": [{"etiqueta": "0.5", "valor_num": 0.5, "orden": 1},
                    {"etiqueta": "1.0", "valor_num": 1.0, "orden": 2}],
    })

    # generar tratamientos
    r2 = auth_client.post(f"/experimentos/{eid}/tratamientos/generar")
    assert r2.status_code == 201, r2.text
    assert len(r2.json()) == 4

    # listarlos
    r3 = auth_client.get(f"/experimentos/{eid}/tratamientos")
    assert r3.status_code == 200
    assert len(r3.json()) == 4
