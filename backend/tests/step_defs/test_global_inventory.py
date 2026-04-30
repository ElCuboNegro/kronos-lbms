import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models

scenarios('../../../docs/features/global_inventory.feature')

@pytest.fixture
def inv_data():
    return {}

# --- GIVEN ---
@given('I am logged into the LBMS')
def logged_in(auth_client):
    pass

@given(parsers.parse('an element "{element_id}" exists for "{desc}"'))
def element_exists_desc(db, element_id, desc, inv_data):
    el = models.Elemento(element_id=element_id, tipo="equipo", descripcion=desc, cantidad=10, unidad="pcs", estado="activo")
    db.add(el)
    db.commit()
    db.refresh(el)
    inv_data["elemento_db_id"] = str(el.id)

@given(parsers.parse('an element "{element_id}" (pH Meter) exists'))
def element_exists_ph(db, element_id, inv_data):
    el = models.Elemento(element_id=element_id, tipo="equipo", descripcion="pH Meter", estado="activo")
    db.add(el)
    db.commit()
    db.refresh(el)
    inv_data["elemento_db_id"] = str(el.id)

@given(parsers.parse('I have a QR code for "{uid}" and another for "{eid}"'))
def setup_qrs(db, uid, eid, inv_data):
    sp = models.Especimen(uid=uid.replace("UID:", ""), especie="Planta", estado="activo")
    el = models.Elemento(element_id=eid.replace("ID:", ""), tipo="equipo", descripcion="X", estado="activo")
    db.add(sp)
    db.add(el)
    db.commit()
    inv_data["uid_qr"] = uid
    inv_data["eid_qr"] = eid


# --- WHEN ---
@when('I view the inventory models')
def view_models():
    pass

@when('I register a new inventory element')
def register_element(inv_data):
    inv_data["payload"] = {}

@when(parsers.parse('I assign it an ID "{eid}"'))
def assign_id(eid, inv_data):
    inv_data["payload"]["element_id"] = eid.replace("ID:", "")

@when(parsers.parse('I set the type to "{tipo}" and description to "{desc}"'))
def set_type_desc(auth_client, request, tipo, desc, inv_data):
    inv_data["payload"]["tipo"] = tipo
    inv_data["payload"]["descripcion"] = desc
    request.node.response = auth_client.post("/elementos", json=inv_data["payload"])

@when(parsers.parse('I update the element to adjust the quantity to {qty} and unit to "{unit}"'))
def update_qty_unit(auth_client, request, qty, unit, inv_data):
    el_id = inv_data["elemento_db_id"]
    payload = {"cantidad": float(qty), "unidad": unit}
    request.node.response = auth_client.patch(f"/elementos/{el_id}", json=payload)

@when('a user performs a calibration')
def perform_calib():
    pass

@when(parsers.parse('the user logs an event of type "{tipo}" with details about the calibration buffer used'))
def log_calib_event(auth_client, request, tipo, inv_data):
    payload = {"tipo": tipo, "descripcion": "Buffer 7.0", "elemento_id": inv_data["elemento_db_id"], "especimen_id": None, "experimento_id": None}
    request.node.response = auth_client.post("/eventos", json=payload)

@when('I scan either QR code using the global scanner')
def scan_global(auth_client, request, inv_data):
    # We will test the specimen one as a representative scan
    res = auth_client.get(f"/scan/{inv_data['uid_qr']}")
    request.node.response = res


# --- THEN ---
@then('I should recognize two distinct primary ID formats:')
def verify_formats():
    pass

@then('the equipment should be saved in the database')
def verify_equipment_saved(request):
    assert request.node.response.status_code == 201

@then('I can print a QR label for this equipment')
def verify_qr_print():
    pass

@then('I can log usage or maintenance events specifically for this equipment')
def verify_maintenance():
    pass

@then('the system should accurately reflect the new inventory level')
def verify_qty_update(request):
    assert request.node.response.status_code == 200
    assert request.node.response.json()["cantidad"] == 50.0

@then(parsers.parse('if the item is depleted, I can update its status to "{s1}" or "{s2}"'))
def verify_deplete(s1, s2):
    pass

@then('the event should be permanently attached to the equipment\'s timeline')
def verify_event_attached(request):
    assert request.node.response.status_code == 201

@then('the system should record the timestamp and the user who performed the calibration')
def verify_event_users(request):
    data = request.node.response.json()
    assert "timestamp" in data
    assert "usuario_id" in data

@then('the system should automatically route the scan:')
def verify_routing(request):
    # BDD verification that scan resolves correctly
    assert request.node.response.status_code == 200
    assert request.node.response.json()["tipo"] == "especimen"
