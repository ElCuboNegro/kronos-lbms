import os
import json
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth

# Import Google GenAI (using the new official SDK)
from google import genai
from google.genai import types

router = APIRouter(prefix="/protocolos", tags=["protocolos"])

TIPOS_VALIDOS = {
    "extraccion_meristema", "propagacion_in_vitro", "desinfeccion",
    "subcultivo", "enraizamiento", "aclimatacion", "otro"
}
RESULTADOS_VALIDOS = {"exitoso", "fallido", "parcial"}


@router.post("/extract", response_model=schemas.ProtocoloCreate)
async def extraer_de_documento(
    file: UploadFile = File(...),
    _=Depends(auth.get_current_user)
):
    """
    Analiza una imagen o documento (PDF) y extrae los pasos y materiales
    para generar un borrador de protocolo usando Google Gemini 1.5.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY no configurada en el servidor.")

    if not file.content_type.startswith("image/") and file.content_type != "application/pdf":
        raise HTTPException(status_code=415, detail="Solo se soportan imágenes y PDFs.")

    try:
        client = genai.Client(api_key=api_key)

        file_bytes = await file.read()
        document_part = types.Part.from_bytes(data=file_bytes, mime_type=file.content_type)

        prompt = f"""
        Eres un asistente experto en laboratorios biológicos.
        Lee este documento que describe un protocolo de laboratorio.
        Extrae la información en un formato JSON estricto que cumpla con el siguiente esquema.
        Asegúrate de inferir el 'tipo' de protocolo lo mejor que puedas usando solo estos valores válidos:
        {list(TIPOS_VALIDOS)}.

        Extrae todos los materiales mencionados.
        Extrae los pasos en orden. Si mencionan tiempos de espera o temporizadores, ponlos en 'tiempo_minutos'.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[document_part, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schemas.ProtocoloCreate,
                temperature=0.1
            ),
        )

        data = json.loads(response.text)
        # Asegurar tipo válido
        if data.get("tipo") not in TIPOS_VALIDOS:
            data["tipo"] = "otro"

        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la extracción AI: {str(e)}")


@router.get("", response_model=list[schemas.ProtocoloListItem])
def listar(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user)
):
    return db.query(models.Protocolo).order_by(models.Protocolo.nombre).offset(skip).limit(limit).all()


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
    for k, v in payload.model_dump(exclude_unset=True).items():
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
