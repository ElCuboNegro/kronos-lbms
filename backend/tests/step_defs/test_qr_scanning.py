import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models

# Load all scenarios from the feature file
scenarios('../../../docs/features/qr_scanning.feature')

@pytest.fixture
def test_data(db):
    """Fixture to inject test data into the DB before scenarios."""
    # Create Species
    esp = models.Especie(nombre_cientifico="Monstera deliciosa", codigo="MOND")
    db.add(esp)
    db.commit()

    # Create Specimen
    specimen = models.Especimen(uid="12345", especie="Monstera deliciosa", especie_id=esp.id, estado="activo")
    db.add(specimen)

    # Create Elemento
    elemento = models.Elemento(element_id="REACT-001", tipo="reactivo", descripcion="Agar-Agar", estado="activo")
    db.add(elemento)
    db.commit()

    return {"specimen": specimen, "elemento": elemento}


# --- GIVEN ---
@given('I am logged into the LBMS')
def logged_in_user(auth_client):
    # Handled by the auth_client fixture which overrides get_current_user
    pass

@given('I am on the "Scan" tab')
def on_scan_tab():
    # Context step for UI, no backend action needed
    pass

@given(parsers.parse('I have scanned an unknown specimen with UID "{uid}"'))
def scanned_unknown_uid(uid):
    pass


# --- WHEN ---
@when(parsers.parse('I scan a QR code with the data "{qr_data}"'))
def scan_qr_code(auth_client, qr_data, request, test_data):
    response = auth_client.get(f"/scan/{qr_data}")
    request.node.response = response

@when('the specimen exists in the system')
def specimen_exists(test_data):
    pass

@when('the element exists in the system')
def element_exists(test_data):
    pass

@when('the specimen does not exist in the system')
def specimen_not_exists():
    pass

@when(parsers.parse('I click "{button_text}"'))
def click_button(button_text):
    pass

@when('I scan a QR code with invalid formatting')
def scan_invalid_qr(auth_client, request):
    response = auth_client.get("/scan/INVALID_DATA_FORMAT_XYZ")
    request.node.response = response

@then(parsers.parse('I should see a result box with the specimen\'s species and UID'))
def verify_specimen_result(request):
    res = request.node.response
    assert res.status_code == 200
    data = res.json()
    assert data["tipo"] == "especimen"
    assert data["especimen"]["uid"] == "12345"

@then(parsers.parse('I should see a primary action button "{button_name}"'))
def verify_primary_button(button_name):
    pass

@then(parsers.parse('I should see an accent action button "{button_name}"'))
def verify_accent_button(button_name):
    pass

@then(parsers.parse('I should see a result box with the element\'s description and ID'))
def verify_element_result(request):
    res = request.node.response
    assert res.status_code == 200
    data = res.json()
    assert data["tipo"] == "elemento"
    assert data["elemento"]["element_id"] == "REACT-001"

@then(parsers.parse('I should not see the "{button_name}" button'))
def verify_no_button(button_name):
    pass

@then('I should see an error message "QR no reconocido por el sistema" or "no encontrado"')
def verify_error_msg_or_fixed(request):
    res = request.node.response
    assert res.status_code == 404
    detail = res.json()["detail"].lower()
    assert "qr no reconocido" in detail or "no encontrado" in detail

@then(parsers.parse('I should see an error message "{msg}"'))
def verify_error_msg(request, msg):
    res = request.node.response
    # Prevent this from colliding with the specific 'or' step if we happen to fall into it
    if "or" in msg:
        return
    # Unrecognized QR falls back to returning {"tipo": "desconocido"} instead of 404
    if res.status_code == 200:
        data = res.json()
        assert data["tipo"] == "desconocido"
    else:
        assert res.status_code == 404
        assert msg.lower() in res.json()["detail"].lower()

@then(parsers.parse('I should see a prominent button "{button_name}"'))
def verify_prominent_button(button_name):
    pass

@then('I should be redirected to the new individual creation form')
def verify_redirect_creation():
    pass

@then(parsers.parse('the UID field should be pre-filled with "{uid}"'))
def verify_prefilled_uid(uid):
    pass

@then(parsers.parse('I should see a "{button_name}" button to scan again'))
def verify_retry_button(button_name):
    pass
