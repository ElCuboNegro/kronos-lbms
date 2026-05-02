from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/sustratos", tags=["sustratos"])

@router.get("", response_model=list[schemas.SustratoOut])
def listar_sustratos(db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return (
        db.query(models.Sustrato)
        .options(
            joinedload(models.Sustrato.formulacion).joinedload(models.Formulacion.componentes),
            joinedload(models.Sustrato.lote).joinedload(models.LotePreparado.formulacion)
        )
        .order_by(models.Sustrato.nombre)
        .all()
    )

@router.post("", response_model=schemas.SustratoOut, status_code=201)
def crear_sustrato(payload: schemas.SustratoCreate, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    if db.query(models.Sustrato).filter(models.Sustrato.codigo_formulacion == payload.codigo_formulacion).first():
        raise HTTPException(status_code=409, detail="Código de formulación ya existe")
    
    data = payload.model_dump()
    # No procesamos componentes por ahora si se guardan como JSONB directo
    s = models.Sustrato(**data)
    db.add(s)
    db.commit()
    db.refresh(s)
    return (
        db.query(models.Sustrato)
        .options(
            joinedload(models.Sustrato.formulacion),
            joinedload(models.Sustrato.lote)
        )
        .filter(models.Sustrato.id == s.id)
        .first()
    )

@router.get("/{id}", response_model=schemas.SustratoOut)
def obtener_sustrato(id: UUID, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    s = (
        db.query(models.Sustrato)
        .options(
            joinedload(models.Sustrato.formulacion),
            joinedload(models.Sustrato.lote)
        )
        .filter(models.Sustrato.id == id)
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Sustrato no encontrado")
    return s
