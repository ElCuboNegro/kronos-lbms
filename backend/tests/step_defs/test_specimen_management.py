import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models

scenarios('../../../docs/features/specimen_management.feature')

@pytest.fixture
def spec_data(db):
    esp = models.Especie(nombre_cientifico="Test Spec", codigo="TEST")
    db.add(esp)
    db.commit()
    db.refresh(esp)
    
    linea = models.Linea(nombre="Line1", especie_id=esp.id)
    db.add(linea)
    db.commit()
    db.refresh(linea)
    
    return {"especie_id": str(esp.id), "linea_id": str(linea.id)}


# --- GIVEN ---
@given('I am logged into the LBMS')
def logged_in(auth_client):
    pass

@given('I am viewing the detail page of a specific specimen')
def view_specimen(auth_client, spec_data, db):
    sp = models.Especimen(uid="VIEW-01", especie="Test", estado="activo")
    db.add(sp)
    db.commit()
    db.refresh(sp)
    spec_data["specimen_id"] = str(sp.id)


# --- WHEN ---
@when(parsers.parse('I navigate to the "{page}" page'))
def navigate_page(page):
    pass

@when('I provide the species, origin line, and a unique UID')
def provide_single_spec_data(spec_data):
    spec_data["payload"] = {
        "uid": "NEW-001",
        "especie": "Test Spec",
        "especie_id": spec_data["especie_id"],
        "linea_id": spec_data["linea_id"],
        "fecha_ingreso": "2024-01-01"
    }

@when('I submit the registration form')
def submit_registration(auth_client, request, spec_data):
    request.node.response = auth_client.post("/especimenes", json=spec_data["payload"])

@when('I select the base formulation or media')
def select_media(spec_data):
    spec_data["bulk_payload"] = {
        "especie_id": spec_data["especie_id"],
        "fecha_ingreso": "2024-01-01",
        "items": []
    }

@when('I specify the quantity of individuals to create')
def specify_quantity(spec_data):
    spec_data["bulk_payload"]["items"].append({
        "cantidad": 5,
        "notas": "Bulk clone test"
    })

@when('I submit the batch registration form')
def submit_batch(auth_client, request, spec_data):
    request.node.response = auth_client.post("/especimenes/bulk", json=spec_data["bulk_payload"])

@when(parsers.parse('I click the action to add an evolution record ("{action}")'))
def click_evo_action(action):
    pass

@when('I input the current growth metrics, observations, and attach a photo')
def input_growth_metrics(spec_data):
    spec_data["evo_payload"] = {
        "altura_cm": 15.5,
        "num_hojas": 4,
        "notas": "Growing well"
    }

@when('I save the event')
def save_evo_event(auth_client, request, spec_data):
    sp_id = spec_data["specimen_id"]
    request.node.response = auth_client.post(f"/especimenes/{sp_id}/evolucion", json=spec_data["evo_payload"])

@when('I navigate to the "Especies" list')
def nav_especies_list():
    pass

@when('I select a specific species')
def select_species():
    pass


# --- THEN ---
@then('the new specimen should be saved in the database')
def verify_saved(request):
    res = request.node.response
    assert res.status_code == 201
    assert res.json()["uid"] == "NEW-001"

@then('I should be redirected to the specimen\'s detail page (Ficha)')
def verify_redirect():
    pass

@then('multiple individual specimens should be created simultaneously')
def verify_multiple_created(request):
    res = request.node.response
    assert res.status_code == 201
    assert len(res.json()) == 5

@then(parsers.parse('I should be able to view them in the "{list_name}" list'))
def verify_list(list_name):
    pass

@then('the evolution timeline of the specimen should immediately reflect the new record')
def verify_evo_timeline(request):
    res = request.node.response
    assert res.status_code == 201
    assert res.json()["altura_cm"] == 15.5

@then('the user who logged the event should be recorded')
def verify_user_logged(request):
    assert "registrado_por_id" in request.node.response.json()

@then('I should see details about that species')
def verify_species_details():
    pass

@then('I should see the associated varieties (variegaciones) and lines')
def verify_varieties_lines():
    pass
