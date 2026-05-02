import pytest

class TestRouteOrderingReactivos:
    """Tests de regresión para el Issue #25: Orden de rutas en reactivos.py"""

    def test_get_formulaciones_no_es_interpretado_como_id(self, auth_client):
        """Si las rutas están en mal orden, /reactivos/formulaciones devolverá 422 
        porque FastAPI intentará validarlo como un UUID para la ruta /{id}"""
        res = auth_client.get("/reactivos/formulaciones")
        
        # En caso de fallo de orden devuelve 422 Unprocessable Entity
        # Debe devolver 200 OK (incluso si la lista está vacía)
        assert res.status_code == 200, res.text

    def test_get_lotes_no_es_interpretado_como_id(self, auth_client):
        """Si las rutas están en mal orden, /reactivos/lotes devolverá 422"""
        res = auth_client.get("/reactivos/lotes")
        
        assert res.status_code == 200, res.text
