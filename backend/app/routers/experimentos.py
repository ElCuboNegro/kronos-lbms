from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth
from app.services.experiment_service import ExperimentService

router = APIRouter(prefix="/experimentos", tags=["experimentos"])


def _exp_out(exp: models.Experimento) -> schemas.ExperimentoOut:
    especimenes_list = []
    for e in exp.especimenes:
        especimenes_list.append(schemas.EspecimenListItem(
            id=e.id,
            uid=e.uid,
            contenedor_uid=e.contenedor_uid,
            especie=e.especie_rel.nombre_cientifico if e.especie_rel else e.especie,
            especie_id=e.especie_id,
            linea_id=e.linea_id,
            linea_nombre=e.linea_rel.nombre if e.linea_rel else None,
            variegacion_nombre=e.variegacion_rel.nombre if e.variegacion_rel else None,
            estado=e.estado,
            fecha_ingreso=e.fecha_ingreso,
            notas=e.notas
        ))

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
        especimenes=especimenes_list
    )


@router.get("", response_model=list[schemas.ExperimentoListItem])
def listar(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user)
):
    return (
        db.query(models.Experimento)
        .options(
            joinedload(models.Experimento.director),
            joinedload(models.Experimento.operador)
        )
        .order_by(models.Experimento.fecha_inicio.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("", response_model=schemas.ExperimentoOut, status_code=201)
def crear(payload: schemas.ExperimentoCreate, db: Session = Depends(get_db),
          current_user: models.Usuario = Depends(auth.get_current_user)):
    director_id = payload.director_id or current_user.id
    return ExperimentService.create_experiment(db, payload, director_id)
def _query_exp(db: Session):
    return db.query(models.Experimento).options(
        joinedload(models.Experimento.director),
        joinedload(models.Experimento.operador),
        joinedload(models.Experimento.especimenes).joinedload(models.Especimen.especie_rel),
        joinedload(models.Experimento.especimenes).joinedload(models.Especimen.linea_rel),
        joinedload(models.Experimento.especimenes).joinedload(models.Especimen.variegacion_rel),
    )


@router.get("/{id_or_code}", response_model=schemas.ExperimentoOut)
def obtener(id_or_code: str, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    try:
        parsed_id = UUID(str(id_or_code))
        exp = _query_exp(db).filter(models.Experimento.id == parsed_id).first()
    except ValueError:
        exp = _query_exp(db).filter(models.Experimento.codigo.ilike(id_or_code)).first()

    if not exp:
        raise HTTPException(status_code=404, detail="Experimento no encontrado")
    return _exp_out(exp)


@router.patch("/{id}", response_model=schemas.ExperimentoOut)
def actualizar(id: UUID, payload: schemas.ExperimentoUpdate,
               db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    exp = db.query(models.Experimento).filter(models.Experimento.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experimento no encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(exp, k, v)
    db.commit()
    exp = _query_exp(db).filter(models.Experimento.id == id).first()
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
