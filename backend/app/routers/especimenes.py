from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth
from app.services.specimen_service import SpecimenService

router = APIRouter(prefix="/especimenes", tags=["especimenes"])


def _build_summary(eventos):
    return SpecimenService.build_event_summary(eventos)


@router.get("", response_model=list[schemas.EspecimenListItem])
def listar(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user)
):
    especimenes = (
        db.query(models.Especimen)
        .options(
            joinedload(models.Especimen.linea_rel),
            joinedload(models.Especimen.variegacion_rel),
        )
        .order_by(models.Especimen.fecha_ingreso.desc(), models.Especimen.uid.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        schemas.EspecimenListItem(
            id=e.id,
            uid=e.uid,
            especie=e.especie,
            especie_id=e.especie_id,
            linea_id=e.linea_id,
            linea_nombre=e.linea_rel.nombre if e.linea_rel else None,
            variegacion_nombre=e.variegacion_rel.nombre if e.variegacion_rel else None,
            estado=e.estado,
            fecha_ingreso=e.fecha_ingreso,
        )
        for e in especimenes
    ]


@router.post("", response_model=schemas.EspecimenOut, status_code=201)
def crear(payload: schemas.EspecimenCreate, db: Session = Depends(get_db),
          _=Depends(auth.get_current_user)):
    if db.query(models.Especimen).filter(models.Especimen.uid == payload.uid).first():
        raise HTTPException(status_code=409, detail="UID ya registrado")
    esp = models.Especimen(**payload.model_dump())
    db.add(esp)
    db.commit()
    db.refresh(esp)
    return _get_full(esp.id, db)


@router.post("/bulk", response_model=list[schemas.EspecimenOut], status_code=201)
def crear_bulk(payload: schemas.EspecimenBulkRequest, db: Session = Depends(get_db),
               user=Depends(auth.get_current_user)):
    """Delega la creación masiva al SpecimenService."""
    return SpecimenService.create_bulk(db, payload, user.id)


@router.get("/by-uid/{uid}", response_model=schemas.EspecimenOut)
def por_uid(uid: str, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    esp = (
        db.query(models.Especimen)
        .options(joinedload(models.Especimen.eventos).joinedload(models.Evento.usuario))
        .filter(models.Especimen.uid == uid)
        .first()
    )
    if not esp:
        raise HTTPException(status_code=404, detail="Espécimen no encontrado")
    return _especimen_out(esp)


@router.get("/{id_or_uid}", response_model=schemas.EspecimenOut)
def obtener(id_or_uid: str, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    try:
        parsed_id = UUID(id_or_uid)
        esp = db.query(models.Especimen).filter(models.Especimen.id == parsed_id).first()
    except ValueError:
        esp = db.query(models.Especimen).filter(models.Especimen.uid == id_or_uid).first()

    if not esp:
        raise HTTPException(status_code=404, detail="Espécimen no encontrado")

    return _get_full(esp.id, db)


@router.post("/contenedores/mover", status_code=200)
def mover_a_contenedor(
    payload: schemas.MoverContenedorRequest,
    db: Session = Depends(get_db),
    user=Depends(auth.get_current_user)
):
    especimenes = db.query(models.Especimen).filter(models.Especimen.id.in_(payload.especimen_ids)).all()
    if not especimenes:
        raise HTTPException(status_code=404, detail="No se encontraron especímenes")

    now = datetime.now()
    for esp in especimenes:
        esp.contenedor_uid = payload.destino_contenedor_uid
        # Log event
        db.add(models.Evento(
            tipo="transferencia",
            descripcion=f"Movido al contenedor {payload.destino_contenedor_uid}",
            especimen_id=esp.id,
            usuario_id=user.id,
            timestamp=now,
            meta={"notas": payload.notas} if payload.notas else None
        ))

    db.commit()
    return {"status": "ok", "moved": len(especimenes), "destino": payload.destino_contenedor_uid}


@router.patch("/{id}", response_model=schemas.EspecimenOut)
def actualizar(id: UUID, payload: schemas.EspecimenUpdate,
               db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    esp = db.query(models.Especimen).filter(models.Especimen.id == id).first()
    if not esp:
        raise HTTPException(status_code=404, detail="Espécimen no encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(esp, k, v)
    db.commit()
    return _get_full(id, db)


def _get_full(id: UUID, db: Session) -> schemas.EspecimenOut:
    esp = (
        db.query(models.Especimen)
        .options(
            joinedload(models.Especimen.especie_rel),
            joinedload(models.Especimen.eventos).joinedload(models.Evento.usuario),
            joinedload(models.Especimen.eventos).joinedload(models.Evento.ejecutado_por),
            joinedload(models.Especimen.linea_rel),
            joinedload(models.Especimen.variegacion_rel),
            joinedload(models.Especimen.madre),
            joinedload(models.Especimen.padre),
        )
        .filter(models.Especimen.id == id)
        .first()
    )
    if not esp:
        raise HTTPException(status_code=404, detail="Espécimen no encontrado")
    return _especimen_out(esp)


def _especimen_out(esp: models.Especimen) -> schemas.EspecimenOut:
    """Mapeo compatible con el servicio."""
    return SpecimenService.map_to_out(esp)

@router.patch("/{id}/coordenadas")
def actualizar_coordenadas(
    id: UUID,
    coordenadas: dict[str, float],
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user)
):
    """Actualiza la posición física de un espécimen dentro de su contenedor."""
    esp = db.query(models.Especimen).filter(models.Especimen.id == id).first()
    if not esp:
        raise HTTPException(status_code=404, detail="Espécimen no encontrado")
    esp.coordenadas = coordenadas
    db.commit()
    return {"status": "ok", "coordenadas": esp.coordenadas}
