from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/elementos", tags=["elementos"])


def _build_summary(eventos):
    return [
        schemas.EventoSummary(
            id=e.id,
            tipo=e.tipo,
            descripcion=e.descripcion,
            timestamp=e.timestamp,
            usuario_nombre=e.usuario.nombre,
            ejecutado_por_nombre=e.ejecutado_por.nombre if e.ejecutado_por else None,
        )
        for e in eventos
    ]


@router.get("", response_model=list[schemas.ElementoListItem])
def listar(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user)
):
    return db.query(models.Elemento).order_by(models.Elemento.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=schemas.ElementoOut, status_code=201)
def crear(payload: schemas.ElementoCreate, db: Session = Depends(get_db),
          _=Depends(auth.get_current_user)):
    if db.query(models.Elemento).filter(models.Elemento.element_id == payload.element_id).first():
        raise HTTPException(status_code=409, detail="ID ya registrado")
    el = models.Elemento(**payload.model_dump())
    db.add(el)
    db.commit()
    db.refresh(el)
    return _get_full(el.id, db)


@router.get("/by-id/{element_id}", response_model=schemas.ElementoOut)
def por_id(element_id: str, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    el = (
        db.query(models.Elemento)
        .options(joinedload(models.Elemento.eventos).joinedload(models.Evento.usuario))
        .filter(models.Elemento.element_id == element_id)
        .first()
    )
    if not el:
        raise HTTPException(status_code=404, detail="Elemento no encontrado")
    return _elemento_out(el)


@router.get("/{id}", response_model=schemas.ElementoOut)
def obtener(id: UUID, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return _get_full(id, db)


@router.patch("/{id}", response_model=schemas.ElementoOut)
def actualizar(id: UUID, payload: schemas.ElementoUpdate,
               db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    el = db.query(models.Elemento).filter(models.Elemento.id == id).first()
    if not el:
        raise HTTPException(status_code=404, detail="Elemento no encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(el, k, v)
    db.commit()
    return _get_full(id, db)


def _get_full(id: UUID, db: Session) -> schemas.ElementoOut:
    el = (
        db.query(models.Elemento)
        .options(joinedload(models.Elemento.eventos).joinedload(models.Evento.usuario))
        .filter(models.Elemento.id == id)
        .first()
    )
    if not el:
        raise HTTPException(status_code=404, detail="Elemento no encontrado")
    return _elemento_out(el)


def _elemento_out(el: models.Elemento) -> schemas.ElementoOut:
    return schemas.ElementoOut(
        id=el.id,
        element_id=el.element_id,
        tipo=el.tipo,
        descripcion=el.descripcion,
        cantidad=el.cantidad,
        unidad=el.unidad,
        estado=el.estado,
        notas=el.notas,
        created_at=el.created_at,
        eventos=_build_summary(el.eventos),
    )
