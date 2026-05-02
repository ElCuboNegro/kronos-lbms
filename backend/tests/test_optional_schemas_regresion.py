import pytest
from app.schemas import ExperimentoOut
from datetime import datetime
from uuid import uuid4

class TestOptionalSchemasRegresion:
    """Regresión para Issue #44: Optional sin default falla en Pydantic V2"""

    def test_experimento_out_se_instancia_sin_opcionales(self):
        # En Pydantic v2, si no hay '= None', esto lanzaría ValidationError
        exp = ExperimentoOut(
            id=uuid4(),
            nombre="Test",
            estado="activo",
            fecha_inicio=datetime.now().date(),
            director_id=uuid4(),
            created_at=datetime.now(),
            especimenes=[]
        )
        assert exp.hipotesis is None
