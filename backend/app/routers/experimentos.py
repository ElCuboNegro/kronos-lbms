from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/experimentos", tags=["experimentos"])


def _exp_out(exp: models.Experimento) -> schemas.ExperimentoOut:
    return schemas.ExperimentoOut(
        id=exp.id,
        nombre=exp.nombre,
        hipotesis=exp.hipotesis,
        protocolo_id=exp.protocolo_id,
        especie_id=exp.especie_id,
        linea_id=exp.linea_id,
        variegacion_id=exp.variegacion_id,
        fecha_inicio=exp.fecha_inicio,
        fecha_fin=exp.fecha_fin,
        estado=exp.estado,
        director_id=exp.director_id,
        director_nombre=exp.director.nombre if exp.director else None,
        operador_id=exp.operador_id,
        operador_nombre=exp.operador.nombre if exp.operador else None,
        config_estandar=exp.config_estandar,
        notas=exp.notas,
        created_at=exp.created_at,
    )


@router.get("", response_model=list[schemas.ExperimentoListItem])
def listar(db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return db.query(models.Experimento).order_by(models.Experimento.fecha_inicio.desc()).all()


@router.post("", response_model=schemas.ExperimentoOut, status_code=201)
def crear(payload: schemas.ExperimentoCreate, db: Session = Depends(get_db),
          current_user: models.Usuario = Depends(auth.get_current_user)):
    director_id = payload.director_id or current_user.id

    if not db.query(models.Usuario).filter(models.Usuario.id == director_id).first():
        raise HTTPException(status_code=404, detail="Director no encontrado")
    if payload.operador_id and not db.query(models.Usuario).filter(
            models.Usuario.id == payload.operador_id).first():
        raise HTTPException(status_code=404, detail="Operador no encontrado")

    data = payload.model_dump(exclude={"especimen_ids", "elemento_ids", "director_id"})
    exp = models.Experimento(**data, director_id=director_id)
    db.add(exp)
    db.flush()

    for eid in payload.especimen_ids:
        esp = db.query(models.Especimen).filter(models.Especimen.id == eid).first()
        if esp:
            exp.especimenes.append(esp)
            if esp.estado == "activo":
                esp.estado = "en_experimento"

    for eid in payload.elemento_ids:
        el = db.query(models.Elemento).filter(models.Elemento.id == eid).first()
        if el:
            exp.elementos.append(el)

    db.commit()
    db.refresh(exp)
    return _exp_out(exp)


@router.get("/{id}", response_model=schemas.ExperimentoOut)
def obtener(id: UUID, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    exp = db.query(models.Experimento).filter(models.Experimento.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experimento no encontrado")
    return _exp_out(exp)


@router.patch("/{id}", response_model=schemas.ExperimentoOut)
def actualizar(id: UUID, payload: schemas.ExperimentoUpdate,
               db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    exp = db.query(models.Experimento).filter(models.Experimento.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experimento no encontrado")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(exp, k, v)
    db.commit()
    db.refresh(exp)
    return _exp_out(exp)


@router.get("/{id}/resultados", response_model=list[schemas.ResultadoOut])
def listar_resultados(id: UUID, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return (
        db.query(models.ResultadoInvestigacion)
        .filter(models.ResultadoInvestigacion.experimento_id == id)
        .order_by(models.ResultadoInvestigacion.fecha.desc())
        .all()
    )


@router.post("/{id}/resultados", response_model=schemas.ResultadoOut, status_code=201)
def agregar_resultado(
    id: UUID,
    payload: schemas.ResultadoCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(auth.get_current_user),
):
    if not db.query(models.Experimento).filter(models.Experimento.id == id).first():
        raise HTTPException(status_code=404, detail="Experimento no encontrado")
    res = models.ResultadoInvestigacion(
        experimento_id=id,
        registrado_por_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return res
