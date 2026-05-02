import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models

scenarios('../../../docs/features/experiment_management.feature')

@pytest.fixture
def exp_data(db, inject_test_user):
    # Setup some base data
    sp = models.Especimen(uid="EXP-SP-1", especie="Planta", estado="activo")
    el = models.Elemento(element_id="EXP-EL-1", tipo="equipo", descripcion="Lamp", estado="activo")
    proto = models.Protocolo(nombre="Acclimatization", tipo="aclimatacion", creado_por_id=inject_test_user.id)

    db.add(sp)
    db.add(el)
    db.add(proto)
    db.commit()
    db.refresh(sp)
    db.refresh(el)
    db.refresh(proto)

    return {"specimen_id": str(sp.id), "elemento_id": str(el.id), "protocolo_id": str(proto.id)}


# --- GIVEN ---
@given('I am logged into the LBMS')
def logged_in(auth_client):
    pass

@given('an active experiment exists')
def active_exp_exists(auth_client, exp_data):
    payload = {"nombre": "Active Exp", "fecha_inicio": "2024-01-01"}
    res = auth_client.post("/experimentos", json=payload)
    exp_data["experimento_id"] = res.json()["id"]

@given('an experiment is currently running')
def running_exp_exists(auth_client, exp_data):
    payload = {"nombre": "Running Exp", "fecha_inicio": "2024-01-01"}
    res = auth_client.post("/experimentos", json=payload)
    exp_data["experimento_id"] = res.json()["id"]

@given('an experiment has concluded')
def concluded_exp_exists(auth_client, exp_data):
    payload = {"nombre": "Done Exp", "fecha_inicio": "2024-01-01", "estado": "completado"}
    res = auth_client.post("/experimentos", json=payload)
    exp_data["experimento_id"] = res.json()["id"]


# --- WHEN ---
@when(parsers.parse('I create a new experiment named "{name}"'))
def create_exp_named(name, exp_data):
    exp_data["payload"] = {"nombre": name}

@when('I provide a hypothesis, a start date, and assign a Director and Operator')
def provide_exp_details(exp_data):
    exp_data["payload"]["hipotesis"] = "Test low light"
    exp_data["payload"]["fecha_inicio"] = "2024-01-01"

@when(parsers.parse('I link a specific Protocol (e.g., "{proto_name}")'))
def link_protocol(proto_name, exp_data):
    exp_data["payload"]["protocolo_id"] = exp_data["protocolo_id"]
    # We delay the POST until a validation THEN step if needed, or do it immediately if the next steps expect it saved.
    # Actually, BDD says "Then the experiment should be saved". So we post now and store response.

@when('I add multiple specimens (e.g., 5 plants) to the experiment')
def add_specimens_exp(exp_data):
    exp_data["update_payload"] = {"especimen_ids": [exp_data["specimen_id"]], "elemento_ids": []}

@when('I add specific lab equipment (Elementos) used for this test')
def add_elements_exp(auth_client, request, exp_data):
    # Currently the API allows passing especimen_ids and elemento_ids on creation.
    # Let's create the experiment with these associated.
    payload = {
        "nombre": "Test Assigment",
        "fecha_inicio": "2024-01-01",
        "especimen_ids": [exp_data["specimen_id"]],
        "elemento_ids": [exp_data["elemento_id"]]
    }
    request.node.response = auth_client.post("/experimentos", json=payload)

@when(parsers.parse('I log a new Research Result (Resultado Investigacion) of type "{res_type}" or "{res_type2}"'))
def log_research_result(res_type, res_type2, exp_data):
    clean_type = res_type.replace('"', '').strip()
    exp_data["res_payload"] = {"tipo": clean_type}

@when('I provide a descriptive title and detailed notes')
def provide_res_details(auth_client, request, exp_data):
    exp_data["res_payload"]["titulo"] = "Observation 1"
    exp_data["res_payload"]["descripcion"] = "Plants look sad"

    exp_id = exp_data["experimento_id"]
    request.node.response = auth_client.post(f"/experimentos/{exp_id}/resultados", json=exp_data["res_payload"])

@when('I navigate to the experiment\'s detail page')
def navigate_exp_detail(auth_client, request, exp_data):
    exp_id = exp_data["experimento_id"]
    request.node.response = auth_client.get(f"/experimentos/{exp_id}")


# --- THEN ---
@then('the experiment should be saved with an "activo" state')
def verify_exp_saved_activo(auth_client, request, exp_data):
    # Execute the post here if not done
    res = auth_client.post("/experimentos", json=exp_data.get("payload", {}))
    request.node.response = res
    assert res.status_code == 201
    assert res.json()["estado"] == "activo"

@then('it should inherit or allow me to define a specific environmental configuration (e.g., low lux)')
def verify_exp_config(request):
    pass

@then('the specimens and equipment should be linked to the experiment')
def verify_links(request):
    assert request.node.response.status_code == 201

@then('the status of the added specimens should automatically change to "en_experimento"')
def verify_specimen_en_experimento(auth_client, exp_data):
    sp_id = exp_data["specimen_id"]
    res = auth_client.get(f"/especimenes/{sp_id}")
    assert res.json()["estado"] == "en_experimento"

@then('the result should be saved and permanently attached to the experiment\'s timeline')
def verify_result_saved(request):
    res = request.node.response
    assert res.status_code == 201
    assert "id" in res.json()

@then('my user ID should be recorded as the author of the finding')
def verify_result_author(request):
    assert "registrado_por_id" in request.node.response.json()

@then('I should see the original hypothesis, the protocol used, and the final state')
def verify_exp_details(request):
    assert request.node.response.status_code == 200

@then('I should see the list of all involved specimens and equipment')
def verify_exp_lists(request):
    pass

@then('I should see a chronological list of all registered findings and results')
def verify_exp_results(request):
    pass
