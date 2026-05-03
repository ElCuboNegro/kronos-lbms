import pytest

class TestLoginRateLimitRegresion:
    """Regresión para el Issue #16: Sin rate limiting en login"""

    def test_login_limita_mas_de_25_intentos(self, client):
        """Verificar que tras múltiples intentos de login fallidos (fuerza bruta),
        la API responda con 429 Too Many Requests."""

        # 1. Ejecutar hasta 25 intentos
        hit_limit = False
        for _ in range(25):
            res = client.post("/auth/login", data={"username": "test@kronos.lab", "password": "wrongpassword"})
            if res.status_code == 429:
                hit_limit = True
                break

        # 2. Si no hemos llegado al límite, el 26vo debe definitivamente bloquear
        if not hit_limit:
            res = client.post("/auth/login", data={"username": "test@kronos.lab", "password": "wrongpassword"})
            assert res.status_code == 429

        # Independientemente de cuándo ocurrió, debe haber un mensaje de error
        # res ya contiene la última respuesta (que debe ser 429)
        assert "Rate limit exceeded" in res.text
