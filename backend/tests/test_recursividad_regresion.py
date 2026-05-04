import pytest
from uuid import uuid4
from sqlalchemy import text
from app import models

def test_flatten_recursive_formulation(auth_client, db):
    # 1. Crear un reactivo base
    reac_id = uuid4()
    reac = models.Reactivo(
        id=reac_id,
        nombre="Sal Test",
        unidad_medida="g"
    )
    db.add(reac)
    db.flush()

    # 2. Crear Receta A (Base)
    form_a_id = uuid4()
    form_a = models.Formulacion(
        id=form_a_id,
        nombre="Receta A",
        volumen_base_l=1.0
    )
    db.add(form_a)
    db.flush()

    comp_a = models.FormulacionComponente(
        id=uuid4(),
        formulacion_id=form_a_id,
        reactivo_id=reac_id,
        cantidad_base=10.0
    )
    db.add(comp_a)
    db.flush()

    # 3. Crear Receta B (Modular) que usa 0.5L de Receta A
    form_b_id = uuid4()
    form_b = models.Formulacion(
        id=form_b_id,
        nombre="Receta B",
        volumen_base_l=1.0
    )
    db.add(form_b)
    db.flush()

    comp_b = models.FormulacionComponente(
        id=uuid4(),
        formulacion_id=form_b_id,
        formulacion_ingrediente_id=form_a_id,
        cantidad_base=0.5
    )
    db.add(comp_b)
    db.flush()
    db.commit()

    # 4. Consultar el aplanamiento de Receta B
    response = auth_client.get(f"/reactivos/formulaciones/{form_b_id}/flatten")
    assert response.status_code == 200
    data = response.json()

    # Debe haber 1 solo reactivo físico al final
    assert len(data) == 1
    # La cantidad debe estar escalada: 10g (en A) * 0.5 (proporción de A en B) = 5.0g
    assert data[0]["cantidad_base"] == 5.0
    assert data[0]["reactivo"]["nombre"] == "Sal Test"

def test_flatten_deep_recursion(auth_client, db):
    # Crear reactivo
    r_id = uuid4()
    db.add(models.Reactivo(id=r_id, nombre="Deep Sal", unidad_medida="g"))

    # Nivel 1 (Base)
    f1_id = uuid4()
    db.add(models.Formulacion(id=f1_id, nombre="L1", volumen_base_l=1.0))
    db.add(models.FormulacionComponente(id=uuid4(), formulacion_id=f1_id, reactivo_id=r_id, cantidad_base=100.0))

    # Nivel 2 (usa 0.1 de L1) -> Debería tener 10.0g de sal
    f2_id = uuid4()
    db.add(models.Formulacion(id=f2_id, nombre="L2", volumen_base_l=1.0))
    db.add(models.FormulacionComponente(id=uuid4(), formulacion_id=f2_id, formulacion_ingrediente_id=f1_id, cantidad_base=0.1))

    # Nivel 3 (usa 0.1 de L2) -> Debería tener 1.0g de sal
    f3_id = uuid4()
    db.add(models.Formulacion(id=f3_id, nombre="L3", volumen_base_l=1.0))
    db.add(models.FormulacionComponente(id=uuid4(), formulacion_id=f3_id, formulacion_ingrediente_id=f2_id, cantidad_base=0.1))

    db.commit()

    response = auth_client.get(f"/reactivos/formulaciones/{f3_id}/flatten")
    data = response.json()
    assert data[0]["cantidad_base"] == pytest.approx(1.0)
