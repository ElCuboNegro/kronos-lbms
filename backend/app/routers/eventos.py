from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/eventos", tags=["eventos"])

TIPOS_VALIDOS = {
    "siembra", "transferencia", "contaminacion", "observacion",
    "cosecha", "entrada", "salida", "sanitizacion",
    "inicio_experimento", "fin_experimento", "otro",
    "mantenimiento", "calibracion", "clonacion"
}


@router.post("", response_model=schemas.EventoOut, status_code=201)
def registrar(
    payload: schemas.EventoCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(auth.get_current_user),
):
    if payload.tipo not in TIPOS_VALIDOS:
        raise HTTPException(status_code=422, detail=f"Tipo inválido. Opciones: {sorted(TIPOS_VALIDOS)}")
    if not any([payload.especimen_id, payload.elemento_id, payload.experimento_id]):
        raise HTTPException(status_code=422, detail="Debe indicar especimen_id, elemento_id o experimento_id")

    if payload.especimen_id and not db.query(models.Especimen).filter(
            models.Especimen.id == payload.especimen_id).first():
        raise HTTPException(status_code=404, detail="Espécimen no encontrado")
    if payload.elemento_id and not db.query(models.Elemento).filter(
            models.Elemento.id == payload.elemento_id).first():
        raise HTTPException(status_code=404, detail="Elemento no encontrado")
    if payload.experimento_id and not db.query(models.Experimento).filter(
            models.Experimento.id == payload.experimento_id).first():
        raise HTTPException(status_code=404, detail="Experimento no encontrado")
    if payload.ejecutado_por_id and not db.query(models.Usuario).filter(
            models.Usuario.id == payload.ejecutado_por_id).first():
        raise HTTPException(status_code=404, detail="Usuario ejecutor no encontrado")

    evento = models.Evento(
        tipo=payload.tipo,
        descripcion=payload.descripcion,
        especimen_id=payload.especimen_id,
        elemento_id=payload.elemento_id,
        experimento_id=payload.experimento_id,
        usuario_id=current_user.id,
        ejecutado_por_id=payload.ejecutado_por_id,
        meta=payload.meta,
    )
    db.add(evento)

    if payload.tipo == "contaminacion" and payload.especimen_id:
        esp = db.query(models.Especimen).filter(models.Especimen.id == payload.especimen_id).first()
        if esp:
            esp.estado = "contaminado"

    if payload.meta and payload.meta.get("contaminacion") == "descartada" and payload.especimen_id:
        esp = db.query(models.Especimen).filter(models.Especimen.id == payload.especimen_id).first()
        if esp:
            esp.estado = "activo"

    db.commit()
    db.refresh(evento)

    ejecutado_nombre = None
    if evento.ejecutado_por_id:
        u = db.query(models.Usuario).filter(models.Usuario.id == evento.ejecutado_por_id).first()
        ejecutado_nombre = u.nombre if u else None

    return schemas.EventoOut(
        id=evento.id,
        tipo=evento.tipo,
        descripcion=evento.descripcion,
        especimen_id=evento.especimen_id,
        elemento_id=evento.elemento_id,
        experimento_id=evento.experimento_id,
        usuario_id=evento.usuario_id,
        ejecutado_por_id=evento.ejecutado_por_id,
        ejecutado_por_nombre=ejecutado_nombre,
        timestamp=evento.timestamp,
        meta=evento.meta,
    )
