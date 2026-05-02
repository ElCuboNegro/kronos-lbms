from datetime import datetime, timedelta
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/reactivos", tags=["reactivos"])

# ── Reactivos ──────────────────────────────────────────────────────────────

@router.get("", response_model=list[schemas.ReactivoOut])
def listar_reactivos(db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return db.query(models.Reactivo).order_by(models.Reactivo.nombre).all()

@router.post("", response_model=schemas.ReactivoOut, status_code=201)
def crear_reactivo(payload: schemas.ReactivoCreate, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    r = models.Reactivo(**payload.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    return r

@router.get("/{id}", response_model=schemas.ReactivoOut)
def obtener_reactivo(id: UUID, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    r = db.query(models.Reactivo).filter(models.Reactivo.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reactivo no encontrado")
    return r

@router.patch("/{id}", response_model=schemas.ReactivoOut)
def actualizar_reactivo(id: UUID, payload: schemas.ReactivoUpdate, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    r = db.query(models.Reactivo).filter(models.Reactivo.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reactivo no encontrado")
    
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(r, k, v)
        
    db.commit()
    db.refresh(r)
    return r

# ── Formulaciones ─────────────────────────────────────────────────────────

@router.get("/formulaciones", response_model=list[schemas.FormulacionOut])
def listar_formulaciones(db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return (
        db.query(models.Formulacion)
        .options(
            joinedload(models.Formulacion.componentes).joinedload(models.FormulacionComponente.reactivo),
            joinedload(models.Formulacion.componentes).joinedload(models.FormulacionComponente.formulacion_ingrediente)
        )
        .all()
    )

@router.post("/formulaciones", response_model=schemas.FormulacionOut, status_code=201)
def crear_formulacion(payload: schemas.FormulacionCreate, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    # 1. Crear la base de la formulación
    f_data = payload.model_dump()
    componentes_data = f_data.pop('componentes')

    if not componentes_data:
        raise HTTPException(status_code=422, detail="La formulación debe tener al menos un componente")

    f = models.Formulacion(**f_data)
    db.add(f)
    db.flush() # Para obtener f.id

    # 2. Agregar componentes
    for comp in componentes_data:
        if not comp.get('reactivo_id') and not comp.get('formulacion_ingrediente_id'):
            raise HTTPException(status_code=422, detail="Cada componente debe especificar un reactivo o una formulación origen")
        c = models.FormulacionComponente(formulacion_id=f.id, **comp)
        db.add(c)

    db.commit()
    db.refresh(f)
    return (
        db.query(models.Formulacion)
        .options(
            joinedload(models.Formulacion.componentes).joinedload(models.FormulacionComponente.reactivo),
            joinedload(models.Formulacion.componentes).joinedload(models.FormulacionComponente.formulacion_ingrediente)
        )
        .filter(models.Formulacion.id == f.id)
        .first()
    )

@router.get("/formulaciones/{id}", response_model=schemas.FormulacionOut)
def obtener_formulacion(id: UUID, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    f = (
        db.query(models.Formulacion)
        .options(
            joinedload(models.Formulacion.componentes).joinedload(models.FormulacionComponente.reactivo),
            joinedload(models.Formulacion.componentes).joinedload(models.FormulacionComponente.formulacion_ingrediente)
        )
        .filter(models.Formulacion.id == id)
        .first()
    )
    if not f:
        raise HTTPException(status_code=404, detail="Formulación no encontrada")
    return f

# ── Lotes Preparados (Batch Tracking) ──────────────────────────────────────

@router.get("/lotes", response_model=list[schemas.LotePreparadoOut])
def listar_lotes(db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    lotes = db.query(models.LotePreparado).options(
        joinedload(models.LotePreparado.formulacion).joinedload(models.Formulacion.componentes).joinedload(models.FormulacionComponente.reactivo),
        joinedload(models.LotePreparado.preparado_por)
    ).order_by(models.LotePreparado.fecha_preparacion.desc()).all()
    
    return [_map_lote(l) for l in lotes]

@router.post("/lotes", response_model=schemas.LotePreparadoOut, status_code=201)
def preparar_lote(payload: schemas.LotePreparadoCreate, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    f = db.query(models.Formulacion).filter(models.Formulacion.id == payload.formulacion_id).first()
    if not f: raise HTTPException(status_code=404, detail="Formulación no encontrada")
    
    # Generar UID: REAC-YYMMDD-XXX
    now = datetime.now()
    prefix = f"REAC-{now.strftime('%y%m%d')}-"
    lotes_del_dia = db.query(models.LotePreparado).filter(models.LotePreparado.uid.like(f"{prefix}%")).all()
    
    max_idx = 0
    for l in lotes_del_dia:
        try:
            val = int(l.uid.split("-")[-1])
            if val > max_idx:
                max_idx = val
        except:
            pass
            
    idx = max_idx + 1
    uid = f"{prefix}{idx:03d}"
    
    # Calcular expiración
    exp = now + timedelta(days=f.caducidad_dias)
    
    lote = models.LotePreparado(
        uid=uid,
        preparado_por_id=user.id,
        fecha_expiracion=exp,
        **payload.model_dump()
    )
    db.add(lote)
    db.commit()
    db.refresh(lote)
    
    # Re-cargar con relaciones para el return
    full_lote = db.query(models.LotePreparado).options(
        joinedload(models.LotePreparado.formulacion).joinedload(models.Formulacion.componentes).joinedload(models.FormulacionComponente.reactivo),
        joinedload(models.LotePreparado.preparado_por)
    ).filter(models.LotePreparado.id == lote.id).first()
    
    return _map_lote(full_lote)

def _map_lote(l):
    return schemas.LotePreparadoOut(
        id=l.id,
        uid=l.uid,
        formulacion=l.formulacion,
        preparado_por_nombre=l.preparado_por.nombre,
        fecha_preparacion=l.fecha_preparacion,
        fecha_expiracion=l.fecha_expiracion,
        volumen_l=l.volumen_l,
        concentracion_x=l.concentracion_x,
        ph_final=l.ph_final,
        trazabilidad_reactivos=l.trazabilidad_reactivos,
        estado=l.estado,
        notas=l.notas
    )
