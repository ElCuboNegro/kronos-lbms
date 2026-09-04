def test_diagnostico_requiere_auth(client):
    res = client.get("/diagnostico")
    assert res.status_code in (401, 403)


def test_diagnostico_devuelve_estructura(auth_client):
    res = auth_client.get("/diagnostico")
    assert res.status_code == 200
    body = res.json()
    assert "recordatorio_revision" in body
    assert "alertas" in body
    assert set(["contaminacion", "germinacion_tardia", "sin_revisar"]).issubset(body["alertas"])
    assert "metodo_resultado" in body
    assert "germinacion_crecimiento" in body
