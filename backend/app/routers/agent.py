from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, auth
from pydantic import BaseModel

router = APIRouter(prefix="/agent", tags=["agent"])

class VoiceCommand(BaseModel):
    text: str
    context_url: str

@router.post("/command")
async def process_voice_command(cmd: VoiceCommand, db: Session = Depends(get_db),
                               user: models.Usuario = Depends(auth.get_current_user)):
    text = cmd.text.lower()

    # Lógica de mapeo de intención (Simple para el MVP)
    if "contaminado" in text or "murió" in text:
        # Extraer ID del contexto si estamos en una ficha
        if "/especimen/" in cmd.context_url:
            uid_or_id = cmd.context_url.split("/")[-1].split("?")[0]
            # Aquí dispararíamos la actualización de estado
            return {"action": "update_status", "status": "contaminado", "target": uid_or_id, "msg": f"Marcando {uid_or_id} como contaminado."}

    if "foto" in text or "fotografía" in text:
        return {"action": "open_camera", "msg": "Abriendo cámara para nuevo registro de evolución."}

    return {"action": "none", "msg": f"Escuché: '{cmd.text}', pero no sé cómo procesarlo aún."}
