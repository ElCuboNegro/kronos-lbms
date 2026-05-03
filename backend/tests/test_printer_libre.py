import pytest
from httpx import AsyncClient

@pytest.mark.anyio
async def test_imprimir_etiqueta_libre_unauthorized(client):
    # Intentar imprimir sin token
    response = await client.post("/api/printer/imprimir-etiqueta-libre", json={
        "titulo": "TEST",
        "info": "pH 4.0"
    })
    assert response.status_code == 401

@pytest.mark.anyio
async def test_imprimir_etiqueta_libre_success(auth_client, monkeypatch):
    # Mockear la llamada al microservicio de la impresora para no necesitar la Jadens física en el test
    class MockResponse:
        status_code = 200
        def json(self): return {"status": "ok"}

    async def mock_post(*args, **kwargs):
        return MockResponse()

    import httpx
    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    payload = {
        "titulo": "MUESTRA TURBA",
        "subtitulo": "LOTE-2026",
        "info": "pH: 4.25",
        "extra": "Método 1:2 v/v",
        "qr": "TEST-QR-123"
    }

    response = await auth_client.post("/api/printer/imprimir-etiqueta-libre", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
