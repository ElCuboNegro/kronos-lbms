from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth
from app.services.specimen_service import SpecimenService
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
            return schemas.ScanResult(tipo="especimen", especimen=SpecimenService.map_to_out(esp))
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

    if qr_data.startswith("REAC-"):
        lote = db.query(models.LotePreparado).options(
            joinedload(models.LotePreparado.formulacion).joinedload(models.Formulacion.componentes).joinedload(models.FormulacionComponente.reactivo),
            joinedload(models.LotePreparado.preparado_por)
        ).filter(models.LotePreparado.uid == qr_data).first()
        if lote:
            from app.routers.reactivos import _map_lote
            return schemas.ScanResult(tipo="lote", lote=_map_lote(lote))
        raise HTTPException(status_code=404, detail=f"Lote Preparado con UID '{qr_data}' no encontrado")

    if qr_data.startswith("CONT-"):
        especimenes = db.query(models.Especimen).options(
            joinedload(models.Especimen.linea_rel),
            joinedload(models.Especimen.variegacion_rel)
        ).filter(models.Especimen.contenedor_uid == qr_data).all()

        if especimenes:
            return schemas.ScanResult(
                tipo="contenedor",
                contenedor={"contenedor_uid": qr_data, "especimenes": [SpecimenService.map_to_out(e) for e in especimenes]}
            )
        raise HTTPException(status_code=404, detail=f"Contenedor '{qr_data}' vacío o no encontrado")

    if qr_data.startswith("STOCK-"):
        rid = qr_data[6:]
        reactivo = db.query(models.Reactivo).filter(models.Reactivo.id == rid).first()
        if reactivo:
            return schemas.ScanResult(tipo="reactivo", reactivo=schemas.ReactivoOut.model_validate(reactivo))
        raise HTTPException(status_code=404, detail=f"Reactivo con ID '{rid}' no encontrado")

    if qr_data.startswith("SUST-"):
        codigo = qr_data[5:]
        sustrato = db.query(models.Sustrato).filter(models.Sustrato.codigo_formulacion == codigo).first()
        if sustrato:
            from app.routers.sustratos import _map_sustrato # Assuming it exists or we map it here
            return schemas.ScanResult(tipo="sustrato", sustrato=schemas.SustratoOut.model_validate(sustrato))
        raise HTTPException(status_code=404, detail=f"Sustrato con código '{codigo}' no encontrado")

    # Si no tiene prefijo o el prefijo no funcionó, probar como UID de planta directo
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
        return schemas.ScanResult(tipo="especimen", especimen=SpecimenService.map_to_out(esp))

    # Probar como código de barras de fábrica de un Reactivo
    codigo_barras_directo = qr_data
    reactivo_barras = db.query(models.Reactivo).filter(models.Reactivo.codigo_barras == codigo_barras_directo).first()
    if reactivo_barras:
        return schemas.ScanResult(tipo="reactivo", reactivo=schemas.ReactivoOut.model_validate(reactivo_barras))

    return schemas.ScanResult(tipo="desconocido")
