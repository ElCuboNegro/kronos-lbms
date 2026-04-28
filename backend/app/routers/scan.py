from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth
from app.routers.especimenes import _especimen_out
from app.routers.elementos import _elemento_out

router = APIRouter(prefix="/scan", tags=["scan"])


@router.get("/{qr_data:path}", response_model=schemas.ScanResult)
def resolver_qr(
    qr_data: str,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    qr_data = qr_data.strip()

    if qr_data.startswith("UID:"):
        uid = qr_data[4:]
        esp = (
            db.query(models.Especimen)
            .options(
                joinedload(models.Especimen.eventos).joinedload(models.Evento.usuario),
                joinedload(models.Especimen.eventos).joinedload(models.Evento.ejecutado_por),
                joinedload(models.Especimen.linea_rel),
                joinedload(models.Especimen.variegacion_rel),
            )
            .filter(models.Especimen.uid == uid)
            .first()
        )
        if esp:
            return schemas.ScanResult(tipo="especimen", especimen=_especimen_out(esp))
        raise HTTPException(status_code=404, detail=f"Espécimen con UID '{uid}' no encontrado")

    if qr_data.startswith("ID:"):
        eid = qr_data[3:]
        el = (
            db.query(models.Elemento)
            .options(joinedload(models.Elemento.eventos).joinedload(models.Evento.usuario))
            .filter(models.Elemento.element_id == eid)
            .first()
        )
        if el:
            return schemas.ScanResult(tipo="elemento", elemento=_elemento_out(el))
        raise HTTPException(status_code=404, detail=f"Elemento con ID '{eid}' no encontrado")

    # Si no tiene prefijo o el prefijo no funcionó, probar como UID directo (para códigos de barras)
    uid_directo = qr_data[4:] if qr_data.startswith("UID:") else qr_data
    esp = (
        db.query(models.Especimen)
        .options(
            joinedload(models.Especimen.eventos).joinedload(models.Evento.usuario),
            joinedload(models.Especimen.eventos).joinedload(models.Evento.ejecutado_por),
            joinedload(models.Especimen.linea_rel),
            joinedload(models.Especimen.variegacion_rel),
        )
        .filter(models.Especimen.uid == uid_directo)
        .first()
    )
    if esp:
        return schemas.ScanResult(tipo="especimen", especimen=_especimen_out(esp))

    return schemas.ScanResult(tipo="desconocido")
