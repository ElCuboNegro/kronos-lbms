import pytest

class TestLoginRateLimitRegresion:
    """Regresión para el Issue #16: Sin rate limiting en login"""

    def test_login_limita_mas_de_10_intentos(self, client):
        """Verificar que tras múltiples intentos de login fallidos (fuerza bruta),
        la API responda con 429 Too Many Requests."""

        # 1. Ejecutar 10 intentos
        for _ in range(10):
            res = client.post("/auth/login", data={"username": "test@kronos.lab", "password": "wrongpassword"})
            # Puede ser 401 si las credenciales son malas, pero no 429 todavía
            assert res.status_code != 429

        # 2. El 11vo intento en el mismo minuto debe ser bloqueado por SlowAPI
        res = client.post("/auth/login", data={"username": "test@kronos.lab", "password": "wrongpassword"})
        assert res.status_code == 429
        assert "Rate limit exceeded" in res.text
