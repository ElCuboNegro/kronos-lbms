import pytest

class TestCorsSecurityRegresion:
    """Regresión para Issue #8: CORS wildcard con credenciales"""

    def test_cors_rechaza_origen_no_confiable(self, client):
        # Intentar acceder con un Origin malicioso
        headers = {
            "Origin": "http://evil-hacker-site.com",
            "Access-Control-Request-Method": "GET"
        }
        res = client.options("/health", headers=headers)

        # Debe fallar silenciosamente omitiendo los headers de CORS, o devolver 400
        # En Starlette, si el origen no está permitido, no incluye Access-Control-Allow-Origin
        assert "access-control-allow-origin" not in res.headers, "Se permitió un Origin no confiable"

    def test_cors_permite_origen_confiable(self, client):
        # Origen por defecto que vamos a configurar (localhost)
        headers = {
            "Origin": "http://localhost",
            "Access-Control-Request-Method": "GET"
        }
        res = client.options("/health", headers=headers)

        # Debe incluir los headers de CORS para el origen confiable
        assert res.headers.get("access-control-allow-origin") == "http://localhost"
        assert res.headers.get("access-control-allow-credentials") == "true"
