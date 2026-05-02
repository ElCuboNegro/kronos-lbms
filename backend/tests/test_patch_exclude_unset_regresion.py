import pytest

class TestPatchExcludeUnsetRegresion:
    """Regresión para el Issue #7: PATCH no permite nullear campos debido a exclude_none=True"""

    def test_patch_permite_nullear_campo_opcional(self, auth_client, db):
        from app.models import Especie
        import uuid

        # 1. Crear entidad con un valor no nulo
        test_id = uuid.uuid4()
        esp = Especie(
            id=test_id,
            nombre_cientifico=f"Test Specie For Patch {test_id}",
            codigo="TEST-123",
            categoria="Planta"
        )
        db.add(esp)
        db.commit()

        # 2. Patch enviando el campo explícitamente a null
        res = auth_client.patch(f"/especies/{test_id}", json={"codigo": None})

        assert res.status_code == 200, res.text
        data = res.json()

        # 3. El campo debe haber sido actualizado a null en la respuesta
        assert data["codigo"] is None, "El código debería ser null, pero el parche fue ignorado"

        # 4. Verificar en Base de Datos
        db.refresh(esp)
        assert esp.codigo is None, "El valor nulo no persistió en la BD"
