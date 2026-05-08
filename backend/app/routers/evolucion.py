import os
import shutil
from pathlib import Path
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
from app.models import ANGULOS

router = APIRouter(prefix="/especimenes", tags=["evolucion"])

UPLOAD_BASE = Path(os.environ.get("UPLOAD_DIR", "/app/uploads"))
UPLOADS = UPLOAD_BASE / "especimenes"
ALLOWED = {"image/jpeg", "image/png", "image/webp"}
def _reg_out(r: models.RegistroEvolucion) -> schemas.RegistroEvolucionOut:
    return schemas.RegistroEvolucionOut(
        id=r.id,
        especimen_id=r.especimen_id,
        registrado_por_id=r.registrado_por_id,
        registrado_por_nombre=r.registrado_por.nombre,
        protocolo_clonacion_id=r.protocolo_clonacion_id,
        protocolo_clonacion_nombre=r.protocolo_clonacion.nombre if r.protocolo_clonacion else None,
        fecha=r.fecha,
        altura_cm=r.altura_cm,
        ancho_hoja_max_cm=r.ancho_hoja_max_cm,
        largo_hoja_max_cm=r.largo_hoja_max_cm,
        num_hojas=r.num_hojas,
        num_brotes=r.num_brotes,
        num_hijuelos=r.num_hijuelos,
        num_nodos=r.num_nodos,
        diametro_tallo_mm=r.diametro_tallo_mm,
        porcentaje_variegacion=r.porcentaje_variegacion,
        patron_variegacion=r.patron_variegacion,
        color_variegacion=r.color_variegacion,
        sustrato=r.sustrato,
        sustrato_id=r.sustrato_id,
        sustrato_nombre=r.sustrato_rel.nombre if r.sustrato_rel else None,
        tipo_contenedor=r.tipo_contenedor,
        diametro_contenedor_cm=r.diametro_contenedor_cm,
        temperatura_c=r.temperatura_c,
        humedad_relativa_pct=r.humedad_relativa_pct,
        humedad_sustrato_pct=r.humedad_sustrato_pct,
        ph_sustrato=r.ph_sustrato,
        luz_lux=r.luz_lux,
        conductividad_ec=r.conductividad_ec,
        npk=r.npk,
        ppm=r.ppm,
        fotos=r.fotos,
        notas=r.notas,
    )



@router.get("/{especimen_id}/evolucion", response_model=list[schemas.RegistroEvolucionOut])
def listar_registros(especimen_id: UUID, db: Session = Depends(get_db),
                     _=Depends(auth.get_current_user)):
    regs = (
        db.query(models.RegistroEvolucion)
        .filter(models.RegistroEvolucion.especimen_id == especimen_id)
        .order_by(models.RegistroEvolucion.fecha.desc())
        .all()
    )
    return [_reg_out(r) for r in regs]


@router.post("/{especimen_id}/evolucion", response_model=schemas.RegistroEvolucionOut, status_code=201)
def crear_registro(
    especimen_id: UUID,
    payload: schemas.RegistroEvolucionCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(auth.get_current_user),
):
    esp = db.query(models.Especimen).filter(models.Especimen.id == especimen_id).first()
    if not esp:
        raise HTTPException(status_code=404, detail="Espécimen no encontrado")
    if payload.protocolo_clonacion_id and not db.query(models.Protocolo).filter(
            models.Protocolo.id == payload.protocolo_clonacion_id).first():
        raise HTTPException(status_code=404, detail="Protocolo no encontrado")

    # ── Lógica de Jerarquía de Valores por Defecto ──
    # Prioridad: Experimento > Línea > Especie
    data = payload.model_dump()
    defaults = {}

    # 1. Base: Especie
    if esp.especie_id:
        especie = db.query(models.Especie).filter(models.Especie.id == esp.especie_id).first()
        if especie and especie.config_estandar:
            defaults.update(especie.config_estandar)

    # 2. Sobrescribe con: Línea
    if esp.linea_id:
        linea = db.query(models.Linea).filter(models.Linea.id == esp.linea_id).first()
        if linea and linea.config_estandar:
            defaults.update({k: v for k, v in linea.config_estandar.items() if v is not None})

    # 3. Sobrescribe con: Variegación
    if esp.variegacion_id:
        var = db.query(models.Variegacion).filter(models.Variegacion.id == esp.variegacion_id).first()
        if var and var.config_estandar:
            defaults.update({k: v for k, v in var.config_estandar.items() if v is not None})

    # 4. Sobrescribe con: Experimento activo (si el especimen está en uno)
    # Buscamos el experimento activo donde esté participando este especimen
    exp_vinculado = (
        db.query(models.Experimento)
        .join(models.Experimento.especimenes)
        .filter(models.Especimen.id == especimen_id, models.Experimento.estado == 'activo')
        .order_by(models.Experimento.created_at.desc())
        .first()
    )
    if exp_vinculado and exp_vinculado.config_estandar:
        defaults.update({k: v for k, v in exp_vinculado.config_estandar.items() if v is not None})

    # Campos a auto-completar si vienen como None
    campos_tecnicos = [
        'temperatura_c', 'humedad_relativa_pct', 'humedad_sustrato_pct',
        'ph_sustrato', 'luz_lux', 'conductividad_ec', 'npk', 'ppm',
        'sustrato', 'sustrato_id', 'tipo_contenedor', 'diametro_contenedor_cm'
    ]
    for campo in campos_tecnicos:
        if data.get(campo) is None and campo in defaults:
            data[campo] = defaults[campo]

    reg = models.RegistroEvolucion(
        especimen_id=especimen_id,
        registrado_por_id=current_user.id,
        fotos={},
        **data,
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return _reg_out(reg)


@router.post("/{especimen_id}/evolucion/{registro_id}/fotos/{angulo}")
def subir_foto_evolucion(
    especimen_id: UUID,
    registro_id: UUID,
    angulo: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    if angulo not in ANGULOS:
        raise HTTPException(status_code=422, detail=f"Ángulo inválido. Opciones: {ANGULOS}")
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=415, detail="Solo JPEG, PNG o WebP")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in {"jpg", "jpeg", "png", "webp"}:
        raise HTTPException(status_code=415, detail="Formato no permitido. Usa: jpg, jpeg, png, webp")

    reg = db.query(models.RegistroEvolucion).filter(
        models.RegistroEvolucion.id == registro_id,
        models.RegistroEvolucion.especimen_id == especimen_id,
    ).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    dest_dir = UPLOADS / str(especimen_id) / "evolucion"
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{registro_id}_{angulo}.{ext}"
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    fotos = dict(reg.fotos or {})
    fotos[angulo] = f"/especimenes/{especimen_id}/evolucion/{registro_id}/fotos/{angulo}"
    reg.fotos = fotos
    db.commit()

    return {"angulo": angulo, "url": fotos[angulo]}


@router.get("/{especimen_id}/evolucion/{registro_id}/fotos/{angulo}")
def ver_foto_evolucion(
    especimen_id: UUID,
    registro_id: UUID,
    angulo: str,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    base = UPLOADS / str(especimen_id) / "evolucion"
    for ext in ("jpg", "jpeg", "png", "webp"):
        p = base / f"{registro_id}_{angulo}.{ext}"
        if p.exists():
            return FileResponse(p)
    raise HTTPException(status_code=404, detail="Foto no encontrada")

@router.post("/contenedores/{uid}/evolucion", response_model=list[schemas.RegistroEvolucionOut])
def crear_registro_grupal(
    uid: str,
    payload: schemas.RegistroEvolucionCreate,
    db: Session = Depends(get_db),
    user: models.Usuario = Depends(auth.get_current_user)
):
    """Crea registros de evolución para TODOS los especímenes de un contenedor."""
    especimenes = db.query(models.Especimen).filter(models.Especimen.contenedor_uid == uid).all()
    if not especimenes:
        raise HTTPException(status_code=404, detail="Contenedor vacío o no encontrado")

    registros = []
    for esp in especimenes:
        reg = models.RegistroEvolucion(
            **payload.model_dump(exclude_unset=True),
            especimen_id=esp.id,
            registrado_por_id=user.id
        )
        db.add(reg)
        registros.append(reg)

    db.commit()
    for r in registros: db.refresh(r)
    return [_reg_out(r) for r in registros]

@router.post("/evolucion-grupal/{registro_id}/fotos/{angulo}")
async def subir_foto_grupal(
    registro_id: UUID,
    angulo: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.Usuario = Depends(auth.get_current_user)
):
    """Sincroniza una foto a todos los registros del mismo contenedor creados en el mismo lote."""
    # 1. Obtener el registro base
    reg_base = db.query(models.RegistroEvolucion).get(registro_id)
    if not reg_base: raise HTTPException(status_code=404, detail="Registro no encontrado")

    # 2. Guardar el archivo físicamente una sola vez
    if angulo not in ANGULOS: raise HTTPException(status_code=400, detail="Ángulo inválido")
    if file.content_type not in ALLOWED: raise HTTPException(status_code=400, detail="Formato no permitido")

    ext = Path(file.filename).suffix
    filename = f"{reg_base.especimen_id}_{angulo}_{int(datetime.now().timestamp())}{ext}"
    target = UPLOADS / filename
    target.parent.mkdir(parents=True, exist_ok=True)

    with target.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"/especimenes/evolucion/fotos/{filename}"

    # 3. Buscar registros hermanos (mismo contenedor, misma fecha/hora aproximada)
    # Para simplificar, buscamos los creados por el mismo usuario en los últimos 2 minutos
    # que pertenezcan a especímenes del mismo contenedor.
    esp_base = db.query(models.Especimen).get(reg_base.especimen_id)
    siblings = db.query(models.RegistroEvolucion).join(models.Especimen).filter(
        models.Especimen.contenedor_uid == esp_base.contenedor_uid,
        models.RegistroEvolucion.registrado_por_id == user.id,
        models.RegistroEvolucion.fecha >= reg_base.fecha
    ).all()

    for reg in siblings:
        fotos = dict(reg.fotos or {})
        fotos[angulo] = url
        reg.fotos = fotos

    db.commit()
    return {"status": "ok", "url": url, "synced_count": len(siblings)}
