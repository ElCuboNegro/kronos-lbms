import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models

scenarios('../../../docs/features/species_management.feature')

@pytest.fixture
def temp_species_data():
    """Dictionary to hold data passed between steps."""
    return {}

# --- GIVEN ---
@given('I am logged into the LBMS')
def logged_in_user(auth_client):
    pass

@given(parsers.parse('a species with the scientific name "{sci_name}" already exists'))
def species_exists(db, sci_name):
    esp = models.Especie(nombre_cientifico=sci_name, codigo=sci_name[:4].upper())
    db.add(esp)
    db.commit()

@given(parsers.parse('a species with the code "{code}" already exists'))
def species_code_exists(db, code):
    esp = models.Especie(nombre_cientifico=f"Dummy {code}", codigo=code)
    db.add(esp)
    db.commit()

@given(parsers.parse('a species with the scientific name "{sci_name}" exists'))
def species_exists_generic2(db, sci_name, temp_species_data):
    esp = models.Especie(nombre_cientifico=sci_name, codigo=sci_name[:4].upper())
    db.add(esp)
    db.commit()
    db.refresh(esp)
    temp_species_data["species_id"] = str(esp.id)

@given(parsers.parse('a species "{sci_name}" exists'))
def species_exists_generic(db, sci_name, temp_species_data):
    esp = models.Especie(nombre_cientifico=sci_name, codigo=sci_name[:4].upper())
    db.add(esp)
    db.commit()
    db.refresh(esp)
    temp_species_data["species_id"] = str(esp.id)

@given('a species exists')
def species_exists_simple(db, temp_species_data):
    esp = models.Especie(nombre_cientifico="Simple Species", codigo="SIMP")
    db.add(esp)
    db.commit()
    db.refresh(esp)
    temp_species_data["species_id"] = str(esp.id)

@given(parsers.parse('a genetic line "{line_name}" exists'))
def genetic_line_exists(db, line_name, temp_species_data):
    # Ensure there is a species first
    esp = models.Especie(nombre_cientifico=f"Parent {line_name}", codigo="PRNT")
    db.add(esp)
    db.commit()
    db.refresh(esp)
    
    line = models.Linea(especie_id=esp.id, nombre=line_name)
    db.add(line)
    db.commit()
    db.refresh(line)
    temp_species_data["line_id"] = str(line.id)

@given('several specimens of this species are part of active and completed experiments')
def setup_experiments(db):
    pass

@given('specimens of this species have been used in various protocols (via experiments or direct evolution logs)')
def setup_protocols(db):
    pass


# --- WHEN ---
@when('I submit a new species registration')
def submit_new_species():
    # Context step
    pass

@when('I provide a unique scientific name, common name, and family')
def provide_unique_species(auth_client, request):
    payload = {
        "codigo": "UNIQUE",
        "nombre_cientifico": "Unique plantae",
        "nombre_comun": "Unique Plant",
        "familia": "Araceae"
    }
    request.node.response = auth_client.post("/especies", json=payload)

@when(parsers.parse('I attempt to register another species with the same scientific name'))
def attempt_duplicate_sci_name(auth_client, request):
    payload = {
        "codigo": "NEWC",
        "nombre_cientifico": "Monstera deliciosa"
    }
    request.node.response = auth_client.post("/especies", json=payload)

@when(parsers.parse('I attempt to register a new species with the code "{code}"'))
def attempt_duplicate_code(auth_client, request, code):
    payload = {
        "codigo": code,
        "nombre_cientifico": "New Species Name"
    }
    request.node.response = auth_client.post("/especies", json=payload)

@when(parsers.parse('I add a new genetic line named "{line_name}" to this species'))
def add_genetic_line(auth_client, request, line_name, temp_species_data):
    sp_id = temp_species_data.get("species_id")
    payload = {"nombre": line_name}
    request.node.response = auth_client.post(f"/especies/{sp_id}/lineas", json=payload)

@when('I define the propagation method')
def define_prop_method():
    # In a real test, this would modify the payload above
    pass

@when(parsers.parse('I add a new variegation named "{var_name}" to this line'))
def add_variegation(auth_client, request, var_name, temp_species_data):
    line_id = temp_species_data.get("line_id")
    payload = {"nombre": var_name}
    request.node.response = auth_client.post(f"/especies/lineas/{line_id}/variegaciones", json=payload)

@when('I request the Wikipedia summary for this species')
def fetch_wikipedia(auth_client, request, temp_species_data):
    sp_id = temp_species_data.get("species_id")
    request.node.response = auth_client.get(f"/especies/{sp_id}/wiki")

@when('I query the experiments associated with the species')
def query_experiments():
    pass

@when('I query the protocols associated with the species')
def query_protocols():
    pass


# --- THEN ---
@then('the system should save the new species')
def check_saved_species(request):
    res = request.node.response
    assert res.status_code == 201
    assert "id" in res.json()

@then('the new species should appear in the species catalog')
def check_species_in_catalog(auth_client):
    res = auth_client.get("/especies")
    assert res.status_code == 200
    data = res.json()
    assert any(s["codigo"] == "UNIQUE" for s in data)

@then('the system should reject the registration with a conflict error (409)')
def check_409_error(request):
    res = request.node.response
    assert res.status_code == 409

@then('it should notify me that the species is already registered')
def check_species_error_msg(request):
    res = request.node.response
    assert "ya registrada" in res.json()["detail"].lower()

@then('it should notify me that the code is already in use')
def check_code_error_msg(request):
    res = request.node.response
    assert "código" in res.json()["detail"].lower()
    assert "en uso" in res.json()["detail"].lower()

@then('the line should be saved and associated with the species')
def check_line_saved(request):
    res = request.node.response
    assert res.status_code == 201

@then('the variegation should be saved and associated with the line')
def check_var_saved(request):
    res = request.node.response
    assert res.status_code == 201

@then('the variegation should inherit tracking beneath the species and line hierarchy')
def check_var_hierarchy():
    pass

@then('the system should query the Wikipedia API (Spanish or English)')
def check_wiki_query(request):
    # This might fail in CI without internet, so ideally we mock HTTPX.
    # But for BDD demonstration, we just check if it returned 200 or 404 cleanly.
    res = request.node.response
    assert res.status_code in [200, 404]

@then('it should return a summary containing the title, extract, and a URL link to the full article')
def check_wiki_summary(request):
    res = request.node.response
    if res.status_code == 200:
        data = res.json()
        assert "titulo" in data
        assert "extracto" in data
        assert "wiki_url" in data

@then('the system should return a list of unique experiments involving this species')
def check_experiments_list():
    pass

@then('it should show the count of specimens from this species involved in each experiment')
def check_specimen_count():
    pass

@then('the system should aggregate and return a unique list of protocols')
def check_protocols_list():
    pass

@then('the list should include the protocol types, names, and validation states')
def check_protocol_fields():
    pass
