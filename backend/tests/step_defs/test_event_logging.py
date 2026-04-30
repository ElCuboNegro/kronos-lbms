import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models

scenarios('../../../docs/features/event_logging.feature')

@pytest.fixture
def event_data():
    return {}

# --- GIVEN ---
@given('I am logged into the LBMS')
def logged_in(auth_client):
    pass

@given('a specimen is currently in an "activo" state')
def specimen_activo(db, event_data):
    sp = models.Especimen(uid="EVENT-SP-1", especie="Planta", estado="activo")
    db.add(sp)
    db.commit()
    db.refresh(sp)
    event_data["specimen_id"] = str(sp.id)

@given('a piece of lab equipment (Elemento) exists')
def equipment_exists(db, event_data):
    el = models.Elemento(element_id="EQ-100", tipo="equipo", descripcion="Microscopio", estado="activo")
    db.add(el)
    db.commit()
    db.refresh(el)
    event_data["elemento_id"] = str(el.id)


# --- WHEN ---
@when(parsers.parse('I register an event of type "{event_type}" (e.g., moving a plant to a new room)'))
def register_event_type(event_data, event_type):
    event_data["payload"] = {"tipo": event_type, "descripcion": "Moved"}

@when('I attach it to a specific specimen UID')
def attach_specimen(db, event_data):
    sp = models.Especimen(uid="EVENT-SP-2", especie="Planta", estado="activo")
    db.add(sp)
    db.commit()
    event_data["payload"]["especimen_id"] = str(sp.id)

@when('I indicate that I registered it, but another user (ejecutado_por) actually performed the physical work')
def indicate_executor(db, event_data):
    # Need another user
    u = models.Usuario(nombre="Helper", email="helper@lab.com", hashed_password="x", rol="tecnico")
    db.add(u)
    db.commit()
    event_data["payload"]["ejecutado_por_id"] = str(u.id)

@when(parsers.parse('I register an event of type "{event_type}" for this specimen'))
def register_contamination(event_type, event_data):
    event_data["payload"] = {
        "tipo": event_type,
        "descripcion": "Found mold",
        "especimen_id": event_data["specimen_id"]
    }

@when('I provide notes about the type of fungus or bacteria observed')
def provide_notes():
    pass

@when(parsers.parse('I register an event of type "{event_type}" or "{other}" linked to the equipment\'s ID'))
def register_equipment_event(event_type, other, event_data):
    # BDD step says 'sanitizacion" or "mantenimiento"'. We'll use the first captured one.
    clean_type = event_type.replace('"', '').strip()
    event_data["payload"] = {
        "tipo": clean_type,
        "descripcion": "Cleaned lenses",
        "elemento_id": event_data["elemento_id"]
    }

@when(parsers.parse('I attempt to log an event with an unrecognized type like "{event_type}"'))
def attempt_invalid_event(auth_client, request, event_type):
    payload = {"tipo": event_type, "descripcion": "Boom", "especimen_id": None, "elemento_id": None}
    request.node.response = auth_client.post("/eventos", json=payload)


# --- THEN ---
@then('the event should be saved to the specimen\'s timeline')
def verify_event_saved(auth_client, request, event_data):
    res = auth_client.post("/eventos", json=event_data["payload"])
    request.node.response = res
    assert res.status_code == 201

@then('the system should record both the registering user and the executing user')
def verify_users(request):
    data = request.node.response.json()
    assert "usuario_id" in data
    assert data["ejecutado_por_id"] is not None

@then('the event should be logged to the timeline')
def verify_contamination_logged(auth_client, request, event_data):
    res = auth_client.post("/eventos", json=event_data["payload"])
    request.node.response = res
    assert res.status_code == 201

@then(parsers.parse('the system should automatically change the specimen\'s master state to "{state}"'))
def verify_specimen_state(auth_client, event_data, state):
    sp_id = event_data["specimen_id"]
    res = auth_client.get(f"/especimenes/{sp_id}")
    assert res.json()["estado"] == state

@then('the event should be appended to the equipment\'s historical timeline')
def verify_equipment_event(auth_client, request, event_data):
    res = auth_client.post("/eventos", json=event_data["payload"])
    request.node.response = res
    assert res.status_code == 201

@then('the specific specimen ID or experiment ID fields should remain cleanly null')
def verify_clean_nulls(request):
    data = request.node.response.json()
    assert data["especimen_id"] is None
    assert data["experimento_id"] is None

@then('the system should reject the request with a validation error (Status 422)')
def verify_422(request):
    assert request.node.response.status_code == 422

@then('it should return the list of allowed standard event types (e.g., siembra, contaminacion, cosecha)')
def verify_allowed_types(request):
    detail = request.node.response.json()["detail"].lower()
    assert "siembra" in detail
    assert "contaminacion" in detail
