from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import auth
from app.services.diagnostico_service import DiagnosticoService

router = APIRouter(prefix="/diagnostico", tags=["diagnostico"])


@router.get("")
def obtener_diagnostico(db: Session = Depends(get_db),
                        _=Depends(auth.get_current_user)):
    hoy = datetime.now(timezone.utc).date()
    return DiagnosticoService.construir_diagnostico(db, hoy=hoy)
