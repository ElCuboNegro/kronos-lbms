import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models

scenarios('../../../docs/features/protocol_management.feature')

@pytest.fixture
def proto_data():
    return {}

# --- GIVEN ---
@given('I am logged into the LBMS')
def logged_in(auth_client):
    pass

@given('a protocol exists in the system with an unvalidated state')
def proto_exists_unvalidated(auth_client, proto_data):
    res = auth_client.post("/protocolos", json={"nombre": "Proto A", "tipo": "propagacion_in_vitro", "version": "1.0", "pasos": []})
    assert res.status_code == 201
    proto_data["proto_id"] = res.json()["id"]

@given('a protocol exists in the system')
def proto_exists(auth_client, proto_data):
    res = auth_client.post("/protocolos", json={"nombre": "Proto B", "tipo": "desinfeccion", "version": "1.0", "pasos": []})
    assert res.status_code == 201
    proto_data["proto_id"] = res.json()["id"]

# --- WHEN ---
@when('I access the "Protocolos" section')
def access_protocolos(auth_client, request):
    request.node.response = auth_client.get("/protocolos")

@when('I initiate the creation of a new protocol')
def initiate_creation(proto_data):
    proto_data["payload"] = {"nombre": "New Proto"}

@when('I specify a valid type (e.g., "propagacion_in_vitro" or "desinfeccion")')
def specify_type(proto_data):
    proto_data["payload"]["tipo"] = "propagacion_in_vitro"

@when('I define the steps, required materials, and version')
def define_steps(proto_data):
    proto_data["payload"]["version"] = "1.0"
    proto_data["payload"]["pasos"] = []
    proto_data["payload"]["materiales"] = []

@when('I submit the protocol')
def submit_protocol(auth_client, request, proto_data):
    request.node.response = auth_client.post("/protocolos", json=proto_data["payload"])

@when('I submit a validation record for this protocol')
def submit_validation(proto_data):
    proto_data["val_payload"] = {"resultado": "", "observaciones": ""}

@when(parsers.parse('I mark the result as "{res}"'))
def mark_result(proto_data, res):
    proto_data["val_payload"]["resultado"] = res

@when('I provide metrics and observations')
def provide_metrics(proto_data):
    proto_data["val_payload"]["observaciones"] = "Looks good"
    proto_data["val_payload"]["metricas"] = {"survival_rate": 0.95}

@when('I provide the failure observations')
def provide_failure_obs(proto_data):
    proto_data["val_payload"]["observaciones"] = "Contamination observed"

@when(parsers.parse('I attempt to create a protocol with an invalid type (e.g., "{tipo}")'))
def attempt_invalid_type(auth_client, request, tipo):
    payload = {"nombre": "Bad Proto", "tipo": tipo, "version": "1.0", "pasos": []}
    request.node.response = auth_client.post("/protocolos", json=payload)

# --- THEN ---
@then('I should see a list of all registered protocols sorted by name')
def check_list(request):
    res = request.node.response
    assert res.status_code == 200
    assert isinstance(res.json(), list)

@then('the protocol should be saved with an initial unvalidated state')
def check_saved_unvalidated(request):
    res = request.node.response
    assert res.status_code == 201
    assert res.json()["estado_validacion"] == "borrador"

@then('my user ID should be recorded as the creator')
def check_creator(request):
    assert "creado_por_id" in request.node.response.json()

@then('the validation record should be saved')
def check_val_saved(auth_client, request, proto_data):
    pid = proto_data["proto_id"]
    res = auth_client.post(f"/protocolos/{pid}/validaciones", json=proto_data["val_payload"])
    request.node.response = res
    assert res.status_code == 201

@then('the protocol\'s overall validation state should be automatically updated to "validado"')
def check_proto_validated(auth_client, proto_data):
    pid = proto_data["proto_id"]
    res = auth_client.get(f"/protocolos/{pid}")
    assert res.json()["estado_validacion"] == "validado"

@then('the protocol\'s overall validation state should not be updated to "validado"')
def check_proto_not_validated(auth_client, proto_data):
    pid = proto_data["proto_id"]
    res = auth_client.get(f"/protocolos/{pid}")
    assert res.json()["estado_validacion"] != "validado"

@then('the system should reject the request with a 422 validation error')
def check_422(request):
    assert request.node.response.status_code == 422

@then('it should list the valid options (e.g., extraccion_meristema, propagacion_in_vitro, etc.)')
def check_valid_options_in_error(request):
    detail = request.node.response.json()["detail"].lower()
    assert "extraccion_meristema" in detail
