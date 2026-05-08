import pytest
from app import models
import uuid

def test_experimentos_de_especie_count(auth_client, db, inject_test_user):
    # 1. Crear especie
    esp = models.Especie(nombre_cientifico="Test Especie Perf", categoria="planta", codigo="PERF")
    db.add(esp)
    db.flush()

    # 2. Crear 2 experimentos
    exp1 = models.Experimento(nombre="Exp 1", director_id=inject_test_user.id)
    exp2 = models.Experimento(nombre="Exp 2", director_id=inject_test_user.id)
    db.add(exp1)
    db.add(exp2)
    db.flush()

    # 3. Crear especimenes de esta especie
    # Exp 1 tendrá 3 especimenes
    for i in range(3):
        e = models.Especimen(uid=f"E1-{i}", especie=esp.nombre_cientifico, especie_id=esp.id)
        db.add(e)
        db.flush()
        exp1.especimenes.append(e)

    # Exp 2 tendrá 5 especimenes
    for i in range(5):
        e = models.Especimen(uid=f"E2-{i}", especie=esp.nombre_cientifico, especie_id=esp.id)
        db.add(e)
        db.flush()
        exp2.especimenes.append(e)

    db.commit()

    # 4. Consultar endpoint
    res = auth_client.get(f"/especies/{esp.id}/experimentos")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2

    # Verificar conteos
    exp1_data = next(x for x in data if x["nombre"] == "Exp 1")
    assert exp1_data["num_especimenes"] == 3

    exp2_data = next(x for x in data if x["nombre"] == "Exp 2")
    assert exp2_data["num_especimenes"] == 5
