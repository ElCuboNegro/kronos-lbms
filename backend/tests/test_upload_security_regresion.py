import pytest

class TestUploadSecurityRegresion:
    """Regresión para Issue #21: Subida de fotos sin validar extensión"""

    def test_upload_foto_perfil_rechaza_extension_php(self, auth_client):
        # Enviar content-type de imagen válido pero con extensión .php
        files = {
            "file": ("shell.php", b"<?php system('whoami'); ?>", "image/jpeg")
        }
        res = auth_client.post("/auth/me/foto", files=files)

        assert res.status_code == 415
        assert "Formato no permitido" in res.text

    def test_upload_foto_evolucion_rechaza_extension_sh(self, auth_client, db):
        from app.models import Especie, Especimen, RegistroEvolucion
        import uuid

        # 0. Obtener usuario
        user_id = auth_client.get("/auth/me").json()["id"]

        # 1. Crear Espécimen y Registro
        test_esp_id = uuid.uuid4()
        esp = Especimen(
            id=test_esp_id,
            uid=f"TEST-{str(uuid.uuid4())[:8]}",
            especie="Test Specie",
            estado="activo"
        )
        db.add(esp)
        db.flush()

        test_reg_id = uuid.uuid4()
        reg = RegistroEvolucion(
            id=test_reg_id,
            especimen_id=test_esp_id,
            registrado_por_id=user_id,
            notas="Test Reg"
        )
        db.add(reg)
        db.commit()

        # 2. Intentar subir shell.sh
        files = {
            "file": ("script.sh", b"#!/bin/bash\nrm -rf /", "image/png")
        }
        res = auth_client.post(f"/especimenes/{test_esp_id}/evolucion/{test_reg_id}/fotos/arriba", files=files)

        assert res.status_code == 415
        assert "Formato no permitido" in res.text
