from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/protocolos", tags=["protocolos"])

TIPOS_VALIDOS = {
    "extraccion_meristema", "propagacion_in_vitro", "desinfeccion",
    "subcultivo", "enraizamiento", "aclimatacion", "otro"
}
RESULTADOS_VALIDOS = {"exitoso", "fallido", "parcial"}


@router.get("", response_model=list[schemas.ProtocoloListItem])
def listar(db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return db.query(models.Protocolo).order_by(models.Protocolo.nombre).all()


@router.post("", response_model=schemas.ProtocoloOut, status_code=201)
def crear(payload: schemas.ProtocoloCreate, db: Session = Depends(get_db),
          current_user: models.Usuario = Depends(auth.get_current_user)):
    if payload.tipo not in TIPOS_VALIDOS:
        raise HTTPException(status_code=422, detail=f"Tipo inválido. Opciones: {sorted(TIPOS_VALIDOS)}")
    proto = models.Protocolo(
        **payload.model_dump(),
        creado_por_id=current_user.id,
    )
    db.add(proto)
    db.commit()
    db.refresh(proto)
    return _get_full(proto.id, db)


@router.get("/{id}", response_model=schemas.ProtocoloOut)
def obtener(id: UUID, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return _get_full(id, db)


@router.patch("/{id}", response_model=schemas.ProtocoloOut)
def actualizar(id: UUID, payload: schemas.ProtocoloUpdate,
               db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    proto = db.query(models.Protocolo).filter(models.Protocolo.id == id).first()
    if not proto:
        raise HTTPException(status_code=404, detail="Protocolo no encontrado")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(proto, k, v)
    db.commit()
    return _get_full(id, db)


@router.post("/{id}/validaciones", response_model=schemas.ValidacionOut, status_code=201)
def agregar_validacion(
    id: UUID,
    payload: schemas.ValidacionCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(auth.get_current_user),
):
    proto = db.query(models.Protocolo).filter(models.Protocolo.id == id).first()
    if not proto:
        raise HTTPException(status_code=404, detail="Protocolo no encontrado")
    if payload.resultado not in RESULTADOS_VALIDOS:
        raise HTTPException(status_code=422, detail=f"Resultado inválido. Opciones: {sorted(RESULTADOS_VALIDOS)}")

    val = models.ValidacionProtocolo(
        protocolo_id=id,
        experimento_id=payload.experimento_id,
        usuario_id=current_user.id,
        resultado=payload.resultado,
        observaciones=payload.observaciones,
        metricas=payload.metricas,
    )
    db.add(val)

    # Actualizar estado si se alcanza validación exitosa
    if payload.resultado == "exitoso" and proto.estado_validacion not in ("validado", "obsoleto"):
        proto.estado_validacion = "validado"

    db.commit()
    db.refresh(val)
    return schemas.ValidacionOut(
        id=val.id,
        resultado=val.resultado,
        observaciones=val.observaciones,
        metricas=val.metricas,
        fecha=val.fecha,
        usuario_nombre=current_user.nombre,
    )


def _get_full(id: UUID, db: Session) -> schemas.ProtocoloOut:
    proto = (
        db.query(models.Protocolo)
        .options(
            joinedload(models.Protocolo.validaciones).joinedload(models.ValidacionProtocolo.usuario)
        )
        .filter(models.Protocolo.id == id)
        .first()
    )
    if not proto:
        raise HTTPException(status_code=404, detail="Protocolo no encontrado")

    return schemas.ProtocoloOut(
        id=proto.id,
        nombre=proto.nombre,
        tipo=proto.tipo,
        version=proto.version,
        descripcion=proto.descripcion,
        pasos=proto.pasos,
        materiales=proto.materiales,
        estado_validacion=proto.estado_validacion,
        creado_por_id=proto.creado_por_id,
        created_at=proto.created_at,
        updated_at=proto.updated_at,
        validaciones=[
            schemas.ValidacionOut(
                id=v.id,
                resultado=v.resultado,
                observaciones=v.observaciones,
                metricas=v.metricas,
                fecha=v.fecha,
                usuario_nombre=v.usuario.nombre,
            )
            for v in proto.validaciones
        ],
    )
