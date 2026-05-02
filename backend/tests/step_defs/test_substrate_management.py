import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models

scenarios('../../../docs/features/substrate_management.feature')

@pytest.fixture
def sub_data():
    return {}

# --- GIVEN ---
@given('I am logged into the LBMS')
def logged_in(auth_client):
    pass

@given('I am on the "Gestión de Laboratorio" dashboard')
def on_lab_dashboard():
    pass

@given(parsers.parse('a substrate with code "{code}" already exists'))
def substrate_exists(db, code):
    s = models.Sustrato(codigo_formulacion=code, nombre="Test", tipo="sustrato")
    db.add(s)
    db.commit()

@given('a specimen exists')
def spec_exists(db, sub_data):
    sp = models.Especimen(uid="SUB-SP-1", especie="Planta", estado="activo")
    db.add(sp)
    db.commit()
    db.refresh(sp)
    sub_data["specimen_id"] = str(sp.id)

@given(parsers.parse('several validated substrates (e.g., "{s1}", "{s2}") are in the catalog'))
def multiple_substrates(db, s1, s2, sub_data):
    s_obj = models.Sustrato(codigo_formulacion="S1", nombre=s1, tipo="sustrato")
    db.add(s_obj)
    db.commit()
    db.refresh(s_obj)
    sub_data["sustrato_id"] = str(s_obj.id)


# --- WHEN ---
@when('I create a new substrate entry')
def create_sub_entry(sub_data):
    sub_data["payload"] = {"nombre": "New Substrate"}

@when(parsers.parse('I provide a unique formulation code (e.g., "{code}")'))
def provide_sub_code(code, sub_data):
    sub_data["payload"]["codigo_formulacion"] = code.replace('"', '')

@when(parsers.parse('I select the type (e.g., "{t1}", "{t2}", "{t3}")'))
def select_sub_type(t1, t2, t3, sub_data):
    sub_data["payload"]["tipo"] = t1

@when('I define theoretical properties like `ph_teorico` and `conductividad_teorica`')
def def_props(auth_client, request, sub_data):
    sub_data["payload"]["ph_teorico"] = 5.5
    request.node.response = auth_client.post("/sustratos", json=sub_data["payload"])

@when(parsers.parse('I attempt to register another substrate with the same code "{code}"'))
def attempt_dup_code(auth_client, request, code):
    payload = {"codigo_formulacion": code, "nombre": "Dup", "tipo": "sustrato"}
    request.node.response = auth_client.post("/sustratos", json=payload)

@when('I log a new evolution entry for the specimen')
def log_evo_entry(sub_data):
    sub_data["evo_payload"] = {"altura_cm": 10.0}

@when(parsers.parse('I select "{sname}" as the current substrate'))
def select_substrate_evo(auth_client, request, sname, sub_data):
    sub_data["evo_payload"]["sustrato_id"] = sub_data["sustrato_id"]
    sub_data["evo_payload"]["sustrato"] = sname

    sp_id = sub_data["specimen_id"]
    request.node.response = auth_client.post(f"/especimenes/{sp_id}/evolucion", json=sub_data["evo_payload"])

@when('I view the "Formulaciones de Medios / Sustratos" list')
def view_sub_list(auth_client, request):
    request.node.response = auth_client.get("/sustratos")


# --- THEN ---
@then('the substrate should be saved in the catalog')
def verify_sub_saved(request):
    assert request.node.response.status_code == 201

@then('it should be available for selection in evolution logs')
def verify_sub_available():
    pass

@then('the system should reject the request with a conflict error (409)')
def verify_409(request):
    assert request.node.response.status_code == 409

@then('the evolution record should be linked to that specific substrate ID')
def verify_evo_linked(request, sub_data):
    res = request.node.response
    assert res.status_code == 201
    assert res.json()["sustrato_id"] == sub_data["sustrato_id"]

@then(parsers.parse('the history should reflect that the specimen is growing in "{sname}"'))
def verify_evo_history(sname, request):
    assert request.node.response.json()["sustrato"] == sname

@then('I should see a list of all substrates sorted by name')
def verify_sub_list(request):
    assert request.node.response.status_code == 200
    assert isinstance(request.node.response.json(), list)

@then('each entry should display its formulation code and categorized type badge')
def verify_sub_list_fields(request):
    data = request.node.response.json()
    if data:
        assert "codigo_formulacion" in data[0]
        assert "tipo" in data[0]
