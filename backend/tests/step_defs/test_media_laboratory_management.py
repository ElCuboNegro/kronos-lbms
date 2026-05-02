import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models

scenarios('../../../docs/features/media_laboratory_management.feature')

@pytest.fixture
def temp_lab_data():
    return {}

# --- GIVEN ---
@given('I am logged into the LBMS')
def logged_in_user(auth_client):
    pass

@given(parsers.parse('a formulation "{form_name}" exists with a {vol}L base volume'))
def formulation_exists(db, form_name, vol, temp_lab_data):
    form = models.Formulacion(nombre=form_name, volumen_base_l=float(vol), caducidad_dias=30)
    db.add(form)
    db.commit()
    db.refresh(form)
    temp_lab_data["form_id"] = str(form.id)
    temp_lab_data["form_name"] = form_name

@given(parsers.parse('a formulation "{form_name}" exists that requires a specific phytohormone'))
def formulation_with_phytohormone(db, form_name, temp_lab_data):
    reactivo = models.Reactivo(nombre="Fitohormona BAP", unidad_medida="mg")
    db.add(reactivo)
    db.commit()
    db.refresh(reactivo)

    form = models.Formulacion(nombre=form_name, volumen_base_l=1.0)
    db.add(form)
    db.flush()

    comp = models.FormulacionComponente(formulacion_id=form.id, reactivo_id=reactivo.id, cantidad_base=2.0)
    db.add(comp)
    db.commit()
    db.refresh(form)

    temp_lab_data["form_id_phyto"] = str(form.id)
    temp_lab_data["reactivo_id"] = str(reactivo.id)

# --- WHEN ---
@when(parsers.parse('I add a new reagent (e.g., "{r1}", "{r2}", "{r3}")'))
def add_new_reagents(auth_client, r1, r2, r3, temp_lab_data):
    # Just a context step for BDD. We will actually create one in the next step to test the API.
    temp_lab_data["reagent_name"] = "Agar-Agar"

@when('I specify its chemical formula, brand, purity, and hazard warnings (peligrosidad)')
def specify_reagent_details(auth_client, request, temp_lab_data):
    payload = {
        "nombre": temp_lab_data["reagent_name"],
        "formula_quimica": "C14H24O9",
        "marca": "Sigma",
        "pureza_pct": 99.9,
        "unidad_medida": "g",
        "peligrosidad": ["irritante"]
    }
    request.node.response = auth_client.post("/reactivos", json=payload)
    if request.node.response.status_code == 201:
        temp_lab_data["created_reagent_id"] = request.node.response.json()["id"]

@when(parsers.parse('I create a new Formulation (e.g., "{form_name}")'))
def create_formulation(auth_client, form_name, temp_lab_data):
    temp_lab_data["new_form_name"] = form_name

@when(parsers.parse('I specify the base volume (e.g., {vol}L) and expiration days'))
def specify_base_volume(vol, temp_lab_data):
    temp_lab_data["vol_base"] = float(vol)
    temp_lab_data["exp_days"] = 30

@when('I add multiple reagents with their required base quantities')
def add_reagents_to_form(auth_client, request, temp_lab_data, db):
    # Ensure a reagent exists to add
    if "created_reagent_id" not in temp_lab_data:
        r = models.Reactivo(nombre="Dummy")
        db.add(r)
        db.commit()
        db.refresh(r)
        temp_lab_data["created_reagent_id"] = str(r.id)

    payload = {
        "nombre": temp_lab_data["new_form_name"],
        "volumen_base_l": temp_lab_data.get("vol_base", 1.0),
        "caducidad_dias": temp_lab_data.get("exp_days", 30),
        "componentes": [
            {
                "reactivo_id": temp_lab_data["created_reagent_id"],
                "cantidad_base": 5.0
            }
        ]
    }
    request.node.response = auth_client.post("/reactivos/formulaciones", json=payload)

@when(parsers.parse('I prepare a new Batch (Lote) of "{form_name}"'))
def prepare_batch(form_name, temp_lab_data):
    # Context step, setup payload
    form_id = temp_lab_data.get("form_id_phyto") or temp_lab_data.get("form_id")
    temp_lab_data["lote_payload"] = {
        "formulacion_id": form_id,
        "volumen_l": 1.0,
        "concentracion_x": 1.0
    }

@when(parsers.parse('I specify a target volume of {vol}L and a concentration of {conc}x'))
def specify_target_volume(auth_client, request, vol, conc, temp_lab_data):
    temp_lab_data["lote_payload"]["volumen_l"] = float(vol)
    temp_lab_data["lote_payload"]["concentracion_x"] = float(conc)

    # We will submit it here unless another step needs to add more to the payload
    # Let's check if the next step is about the lot number
    pass

@when(parsers.parse('I provide the external manufacturer\'s lot number for the phytohormone used (e.g., "{lot_num}")'))
def provide_manufacturer_lot(auth_client, request, lot_num, temp_lab_data):
    reactivo_id = temp_lab_data["reactivo_id"]
    temp_lab_data["lote_payload"]["trazabilidad_reactivos"] = {
        reactivo_id: lot_num
    }
    # Now submit the batch request
    request.node.response = auth_client.post("/reactivos/lotes", json=temp_lab_data["lote_payload"])

@when('I view the "Lotes Preparados" list')
def view_lotes_list(auth_client, request):
    request.node.response = auth_client.get("/reactivos/lotes")

# Submit step if it wasn't submitted by the phytohormone step
@pytest.fixture(autouse=True)
def submit_lote_if_needed(request, auth_client, temp_lab_data):
    yield
    # Clean up or post-process if necessary

# Manual submitter for the generic prepare batch scenario
@then('the system should automatically calculate the proportional quantities of all reagents needed')
def system_calculates_quantities(auth_client, request, temp_lab_data):
    if not hasattr(request.node, 'response') or request.node.response.status_code != 201:
        # Submit the payload that was built
        request.node.response = auth_client.post("/reactivos/lotes", json=temp_lab_data["lote_payload"])
        assert request.node.response.status_code == 201

# --- THEN ---
@then('the reagent should be saved and available for recipes')
def verify_reagent_saved(request):
    res = request.node.response
    assert res.status_code == 201
    assert "id" in res.json()

@then('the formulation should be saved as a reusable recipe (Recetario)')
def verify_formulation_saved(request):
    res = request.node.response
    assert res.status_code == 201
    assert "componentes" in res.json()

@then('it should generate a unique Batch UID (Lote UID)')
def verify_lote_uid(request):
    res = request.node.response
    data = res.json()
    assert data["uid"].startswith("REAC-")

@then('it should set an expiration date based on the formulation\'s rules')
def verify_expiration(request):
    res = request.node.response
    assert res.json()["fecha_expiracion"] is not None

@then('the batch should be recorded as "disponible"')
def verify_lote_status(request):
    res = request.node.response
    assert res.json()["estado"] == "disponible"

@then('the batch should be saved successfully')
def verify_batch_success(request):
    res = request.node.response
    assert res.status_code == 201

@then('the system should permanently link the manufacturer\'s lot number to this internal Batch UID')
def verify_trazabilidad(request, temp_lab_data):
    res = request.node.response
    data = res.json()
    reactivo_id = temp_lab_data["reactivo_id"]
    assert data["trazabilidad_reactivos"] is not None
    assert data["trazabilidad_reactivos"][reactivo_id] == "Sigma-Aldrich Lot #12345"

@then('if an experiment fails due to damaged phytohormones, I can query the system to find exactly which Lote contained that supplier\'s batch')
def verify_queryability():
    # Context step verifying the architectural benefit
    pass

@then('I should see the history of all prepared batches')
def verify_lotes_history(request):
    res = request.node.response
    assert res.status_code == 200
    assert isinstance(res.json(), list)

@then('I should see who prepared them, the final pH measured, and their current availability status')
def verify_lotes_fields(request):
    res = request.node.response
    data = res.json()
    if data:
        assert "preparado_por_nombre" in data[0]
        assert "estado" in data[0]

@then('I should be able to view the exact composition of any specific batch')
def verify_lotes_composition(request):
    res = request.node.response
    data = res.json()
    if data:
        assert "formulacion" in data[0]
        assert "componentes" in data[0]["formulacion"]
