import os
from datetime import date, datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
import httpx
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/printer", tags=["printer"])

PRINTER_URL = os.environ.get("PRINTER_API_URL", "http://host.docker.internal:8000")


@router.post("/imprimir/{especimen_id}", status_code=200)
async def imprimir_etiqueta(
    especimen_id: str,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    esp = db.query(models.Especimen).filter(models.Especimen.id == especimen_id).first()
    if not esp:
        raise HTTPException(status_code=404, detail="Espécimen no encontrado")

    # ── Lógica de Jerarquía de Metadatos ──
    defaults = {}

    # 1. Base: Especie
    if esp.especie_id:
        especie = db.query(models.Especie).filter(models.Especie.id == esp.especie_id).first()
        if especie and especie.config_estandar:
            defaults.update(especie.config_estandar)

    # 2. Sobrescribe: Línea
    if esp.linea_id:
        linea = db.query(models.Linea).filter(models.Linea.id == esp.linea_id).first()
        if linea and linea.config_estandar:
            defaults.update({k: v for k, v in linea.config_estandar.items() if v is not None})

    # 3. Sobrescribe: Variegación
    if esp.variegacion_id:
        var = db.query(models.Variegacion).filter(models.Variegacion.id == esp.variegacion_id).first()
        if var and var.config_estandar:
            defaults.update({k: v for k, v in var.config_estandar.items() if v is not None})

    # 4. Sobrescribe: Experimento activo
    exp_vinculado = (
        db.query(models.Experimento)
        .join(models.Experimento.especimenes)
        .filter(models.Especimen.id == especimen_id, models.Experimento.estado == 'activo')
        .order_by(models.Experimento.created_at.desc())
        .first()
    )
    if exp_vinculado and exp_vinculado.config_estandar:
        defaults.update({k: v for k, v in exp_vinculado.config_estandar.items() if v is not None})

    def fmt(val, unit=""):
        if val is None or val == "": return "—"
        return f"{val}{unit}"

    extra = {
        "riego": fmt(defaults.get('humedad_sustrato_pct') or defaults.get('humedad_relativa_pct'), "%"),
        "luz": fmt(defaults.get('luz_lux'), "lx"),
        "temp": fmt(defaults.get('temperatura_c'), "°C"),
        "ph": fmt(defaults.get('ph_sustrato')),
        "npk": fmt(defaults.get('npk'))
    }

    payload = {
        "modo": "planta",
        "arg1": esp.especie,
        "arg2": esp.uid,
        "arg3": esp.fecha_ingreso.isoformat() if esp.fecha_ingreso else date.today().isoformat(),
        "extra": extra
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(f"{PRINTER_URL}/imprimir", json=payload)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Error de impresora: {r.text}")
        return {"status": "impreso", "uid": esp.uid}
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Servicio de impresión no disponible ({type(exc).__name__})")


@router.get("/generar-uid", status_code=200)
def generar_uid(especie_id: UUID, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    """Genera un UID compuesto: CODE-YYMMDDHH-INDEX."""
    esp = db.query(models.Especie).filter(models.Especie.id == especie_id).first()
    if not esp:
        raise HTTPException(status_code=404, detail="Especie no encontrada")

    code = esp.codigo or esp.nombre_cientifico[:4].upper()
    now = datetime.now() # Usamos hora local para que coincida con el reloj del técnico
    date_part = now.strftime("%y%m%d")
    time_part = now.strftime("%H%M%S")
    
    prefix = f"{code}-{date_part}-{time_part}-"
    
    # Buscar el último espécimen con este prefijo (mismo segundo)
    ultimo = db.query(models.Especimen).filter(
        models.Especimen.uid.like(f"{prefix}%")
    ).order_by(models.Especimen.uid.desc()).first()
    
    if ultimo:
        try:
            parts = ultimo.uid.split("-")
            idx = int(parts[-1]) + 1
        except (ValueError, IndexError):
            idx = 1
    else:
        idx = 1
    
    uid = f"{prefix}{idx:02d}"
    return {"uid": uid}
