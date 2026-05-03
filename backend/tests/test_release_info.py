from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_release_info_public_endpoint():
    """Verifica que el endpoint de información de release sea público y devuelva el formato correcto."""
    response = client.get("/app/release-info")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert "url" in data
    assert "required" in data
    assert isinstance(data["version"], str)
    assert data["version"] == "1.9.0"
