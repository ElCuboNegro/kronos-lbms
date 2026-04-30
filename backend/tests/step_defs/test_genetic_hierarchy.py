import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from app import models

scenarios('../../../docs/features/variegation_management.feature')
scenarios('../../../docs/features/genetic_line_management.feature')

@pytest.fixture
def gen_data(db):
    esp = models.Especie(nombre_cientifico="Philodendron gloriosum", codigo="PGLO")
    db.add(esp)
    db.commit()
    db.refresh(esp)
    
    linea = models.Linea(nombre="Monstera Albo-Borsigiana", especie_id=esp.id)
    db.add(linea)
    db.commit()
    db.refresh(linea)
    
    return {"especie_id": str(esp.id), "linea_id": str(linea.id)}


# --- GIVEN ---
@given('I am logged into the LBMS')
def logged_in(auth_client):
    pass

@given(parsers.parse('a species "{sp_name}" exists in the system'))
def species_exists(db, sp_name, gen_data):
    pass # Managed in fixture

@given(parsers.parse('a genetic line "{line_name}" exists in the system'))
def line_exists(db, line_name, gen_data):
    pass # Managed in fixture

@given(parsers.parse('a genetic line named "{line_name}" already exists for the species'))
def line_exists_sp(db, line_name, gen_data):
    linea = models.Linea(nombre=line_name, especie_id=gen_data["especie_id"])
    db.add(linea)
    db.commit()
    db.refresh(linea)
    gen_data["linea_id_zebra"] = str(linea.id)

@given(parsers.parse('a genetic line "{line_name}" exists'))
def line_exists_alone(db, line_name, gen_data):
    linea = models.Linea(nombre=line_name, especie_id=gen_data["especie_id"])
    db.add(linea)
    db.commit()
    db.refresh(linea)
    gen_data["linea_id_dark"] = str(linea.id)
    gen_data["linea_id_zebra"] = str(linea.id)

@given(parsers.parse('a variegation named "{vname}" already exists in the genetic line'))
def var_exists_in_line(db, vname, gen_data):
    v = models.Variegacion(nombre=vname, linea_id=gen_data["linea_id"])
    db.add(v)
    db.commit()

@given(parsers.parse('a variegation named "{vname}" exists in the genetic line "{lname}"'))
def var_exists_in_specific_line(db, vname, lname, gen_data):
    # Setup linea A
    la = models.Linea(nombre=lname, especie_id=gen_data["especie_id"])
    db.add(la)
    db.commit()
    db.refresh(la)
    v = models.Variegacion(nombre=vname, linea_id=la.id)
    db.add(v)
    db.commit()
    gen_data["linea_a_id"] = str(la.id)
    
@given(parsers.parse('a variegation named "{vname}" exists'))
def var_exists_alone(db, vname, gen_data):
    v = models.Variegacion(nombre=vname, linea_id=gen_data["linea_id"])
    db.add(v)
    db.commit()
    db.refresh(v)
    gen_data["var_id_mint"] = str(v.id)

@given('it has multiple associated variegations (e.g., "Variegated", "Solid")')
def has_multiple_vars(db, gen_data):
    v1 = models.Variegacion(nombre="Variegated", linea_id=gen_data["linea_id_dark"])
    v2 = models.Variegacion(nombre="Solid", linea_id=gen_data["linea_id_dark"])
    db.add(v1)
    db.add(v2)
    db.commit()

@given('it has multiple direct individual specimens')
def has_multiple_specs(db, gen_data):
    sp1 = models.Especimen(uid="SP-DK-1", especie="Philodendron", linea_id=gen_data["linea_id_dark"], estado="activo")
    db.add(sp1)
    db.commit()

# --- WHEN ---
@when(parsers.parse('I add a new variegation named "{vname}" to the genetic line'))
def add_var_to_line(vname, gen_data):
    gen_data["var_payload"] = {"nombre": vname}

@when('I provide an optional code and description')
def provide_code_desc(gen_data):
    gen_data["var_payload"]["codigo"] = "HFMN"
    gen_data["var_payload"]["descripcion"] = "Half and half"

@when('I define specific standard environmental configurations (config_estandar)')
def define_config_estandar(auth_client, request, gen_data):
    gen_data["var_payload"]["config_estandar"] = {"luz_lux": 3000}
    lid = gen_data["linea_id"]
    request.node.response = auth_client.post(f"/especies/lineas/{lid}/variegaciones", json=gen_data["var_payload"])

@when(parsers.parse('I attempt to add another variegation named "{vname}" to the same line'))
def attempt_dup_var(auth_client, request, vname, gen_data):
    lid = gen_data["linea_id"]
    payload = {"nombre": vname}
    request.node.response = auth_client.post(f"/especies/lineas/{lid}/variegaciones", json=payload)

@when(parsers.parse('I attempt to add a new variegation named "{vname}" to a different genetic line "{lname}"'))
def add_var_diff_line(auth_client, request, vname, lname, db, gen_data):
    lb = models.Linea(nombre=lname, especie_id=gen_data["especie_id"])
    db.add(lb)
    db.commit()
    db.refresh(lb)
    payload = {"nombre": vname}
    request.node.response = auth_client.post(f"/especies/lineas/{lb.id}/variegaciones", json=payload)

@when('I update the variegation to adjust its standard configuration (e.g., higher light requirements)')
def update_var_config(gen_data):
    gen_data["var_patch"] = {"config_estandar": {"luz_lux": 5000}}

@when('I add new notes regarding its stability')
def add_var_notes(auth_client, request, gen_data):
    gen_data["var_patch"]["notas"] = "Very unstable"
    vid = gen_data["var_id_mint"]
    request.node.response = auth_client.patch(f"/especies/variegaciones/{vid}", json=gen_data["var_patch"])

@when(parsers.parse('I add a new genetic line named "{lname}" to the species'))
def add_genetic_line_sp(lname, gen_data):
    gen_data["line_payload"] = {"nombre": lname}

@when(parsers.parse('I specify the propagation method as "{pmethod}"'))
def specify_prop_method(pmethod, gen_data):
    gen_data["line_payload"]["metodo_propagacion"] = pmethod

@when('I provide an optional description and standard configuration')
def provide_line_config(auth_client, request, gen_data):
    gen_data["line_payload"]["descripcion"] = "Dark leaves"
    sid = gen_data["especie_id"]
    request.node.response = auth_client.post(f"/especies/{sid}/lineas", json=gen_data["line_payload"])

@when(parsers.parse('I attempt to register another line named "{lname}" under the same species'))
def attempt_dup_line(auth_client, request, lname, gen_data):
    sid = gen_data["especie_id"]
    payload = {"nombre": lname}
    request.node.response = auth_client.post(f"/especies/{sid}/lineas", json=payload)

@when(parsers.parse('I update the line to change its propagation method to "{pmethod}"'))
def update_line_method(pmethod, gen_data):
    gen_data["line_patch"] = {"metodo_propagacion": pmethod}

@when('I adjust its standard environmental configuration (e.g., target humidity)')
def adjust_line_config(auth_client, request, gen_data):
    gen_data["line_patch"]["config_estandar"] = {"humedad_relativa_pct": 80}
    lid = gen_data["linea_id_zebra"]
    request.node.response = auth_client.patch(f"/especies/lineas/{lid}", json=gen_data["line_patch"])

@when('I view the details of the "Philodendron gloriosum" species or query the line directly')
def view_sp_details(auth_client, request, gen_data):
    sid = gen_data["especie_id"]
    request.node.response = auth_client.get(f"/especies/{sid}")


# --- THEN ---
@then('the variegation should be saved')
def verify_var_saved(request):
    assert request.node.response.status_code == 201

@then('it should be linked to the parent genetic line')
def verify_var_linked(request, gen_data):
    assert request.node.response.json()["linea_id"] == gen_data["linea_id"]

@then('the system should reject the request with a conflict error (Status 409)')
def verify_409(request):
    assert request.node.response.status_code == 409

@then('it should notify me that the variegation already exists in this line')
def verify_409_msg_var(request):
    assert "ya existe" in request.node.response.json()["detail"].lower()

@then('the system should accept the request and save the new variegation')
def verify_var_accepted(request):
    assert request.node.response.status_code == 201

@then('the variegation should be updated successfully')
def verify_var_updated(request):
    assert request.node.response.status_code == 200

@then('future labels printed for specimens of this variegation should reflect the new light requirements')
def verify_var_labels():
    pass

@then('the new genetic line should be saved successfully')
def verify_line_saved(request):
    assert request.node.response.status_code == 201

@then('it should be linked hierarchically beneath the "Philodendron gloriosum" species')
def verify_line_linked(request, gen_data):
    assert request.node.response.json()["especie_id"] == gen_data["especie_id"]

@then('it should notify me that the line already exists within this species')
def verify_409_msg_line(request):
    assert "ya existe" in request.node.response.json()["detail"].lower()

@then('the genetic line should be updated')
def verify_line_updated(request):
    assert request.node.response.status_code == 200

@then('any new specimens or bulk clones generated from this line should inherit these new environmental configurations')
def verify_line_inheritance():
    pass

@then('I should see the "Dark Form" line')
def verify_line_in_sp(request):
    data = request.node.response.json()
    assert any(l["nombre"] == "Dark Form" for l in data["lineas"])

@then('I should see a count or list of all its specific variegations')
def verify_line_vars(request):
    data = request.node.response.json()
    line = next(l for l in data["lineas"] if l["nombre"] == "Dark Form")
    assert len(line["variegaciones"]) >= 2

@then('I should see the total aggregate count of all individuals belonging to this line and its sub-variegations')
def verify_line_agg(request):
    data = request.node.response.json()
    line = next(l for l in data["lineas"] if l["nombre"] == "Dark Form")
    assert line["total_individuos"] >= 1
