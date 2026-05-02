from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/especimenes", tags=["especimenes"])


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
    esp_obj = db.query(models.Especie).filter(models.Especie.id == payload.especie_id).first()
    if not esp_obj:
        raise HTTPException(status_code=404, detail="Especie no encontrada")

    # ── Lógica de Jerarquía de Valores por Defecto ──
    defaults = {}
    # 1. Especie
    if esp_obj.config_estandar:
        defaults.update(esp_obj.config_estandar)

    # 2. Línea
    if payload.linea_id:
        linea = db.query(models.Linea).filter(models.Linea.id == payload.linea_id).first()
        if linea and linea.config_estandar:
            defaults.update({k: v for k, v in linea.config_estandar.items() if v is not None})

    # Nota: En bulk create usualmente no hay un Experimento definido todavía,
    # pero si lo hubiera en el futuro, iría aquí.

    code = esp_obj.codigo or esp_obj.nombre_cientifico[:4].upper()
    now = datetime.now()
    date_part = now.strftime("%y%m%d")
    time_part = now.strftime("%H%M%S")
    prefix = f"{code}-{date_part}-{time_part}-"

    from sqlalchemy import text
    import hashlib
    # Generar un hash determinista de 32-bits (positivo) a partir del prefijo para el lock
    lock_key = int(hashlib.md5(prefix.encode()).hexdigest()[:8], 16) % (2**31)
    db.execute(text("SELECT pg_advisory_xact_lock(:k)"), {"k": lock_key})

    # Get last index for the same second
    ultimo = db.query(models.Especimen).filter(
        models.Especimen.uid.like(f"{prefix}%")
    ).order_by(models.Especimen.indice.desc().nullslast(), models.Especimen.uid.desc()).first()

    if ultimo:
        if ultimo.indice is not None:
            idx = ultimo.indice
        else:
            try:
                idx = int(ultimo.uid.split("-")[-1])
            except (ValueError, IndexError):
                idx = 0
    else:
        idx = 0

    nuevos = []

    for item in payload.items:
        for _ in range(item.cantidad):
            idx += 1
            uid = f"{prefix}{idx:02d}"

            nuevo_esp = models.Especimen(
                uid=uid,
                indice=idx,
                contenedor_uid=payload.contenedor_uid,
                especie=esp_obj.nombre_cientifico,
                especie_id=payload.especie_id,
                linea_id=payload.linea_id,
                variegacion_id=payload.variegacion_id,
                madre_id=payload.madre_id,
                padre_id=payload.padre_id,
                fecha_ingreso=payload.fecha_ingreso,
                origen=payload.origen,
                coordenadas=payload.coordenadas,
                estado=payload.estado,
                notas=item.notas
            )
            db.add(nuevo_esp)
            db.flush()

            # Crear registro de evolución inicial con herencia
            evo_data = {
                "especimen_id": nuevo_esp.id,
                "registrado_por_id": user.id,
                "protocolo_clonacion_id": item.protocolo_id,
                "fecha": now,
                "notas": item.notas or "Registro inicial automático (Clonación Masiva)"
            }

            # Auto-completar campos técnicos heredados
            campos_tecnicos = [
                'temperatura_c', 'humedad_relativa_pct', 'humedad_sustrato_pct',
                'ph_sustrato', 'luz_lux', 'conductividad_ec', 'npk', 'ppm',
                'sustrato', 'sustrato_id', 'tipo_contenedor', 'diametro_contenedor_cm'
            ]
            for campo in campos_tecnicos:
                if campo in defaults:
                    evo_data[campo] = defaults[campo]

            db.add(models.RegistroEvolucion(**evo_data))

            # Evento de clonación
            evento = models.Evento(
                tipo="clonacion",
                descripcion=f"Clonado masivamente bajo protocolo",
                especimen_id=nuevo_esp.id,
                usuario_id=user.id,
                timestamp=now
            )
            db.add(evento)

            nuevos.append(nuevo_esp)

    db.commit()

    ids_creados = [e.id for e in nuevos]

    # Hacer una sola consulta grande en lugar de N consultas individuales
    especimenes_creados = (
        db.query(models.Especimen)
        .options(
            joinedload(models.Especimen.eventos).joinedload(models.Evento.usuario),
            joinedload(models.Especimen.eventos).joinedload(models.Evento.ejecutado_por),
            joinedload(models.Especimen.linea_rel),
            joinedload(models.Especimen.variegacion_rel),
            joinedload(models.Especimen.madre),
            joinedload(models.Especimen.padre),
        )
        .filter(models.Especimen.id.in_(ids_creados))
        .all()
    )

    return [_especimen_out(e) for e in especimenes_creados]


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


@router.get("/{id}", response_model=schemas.EspecimenOut)
def obtener(id: UUID, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return _get_full(id, db)


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
    return schemas.EspecimenOut(
        id=esp.id,
        uid=esp.uid,
        especie=esp.especie,
        especie_id=esp.especie_id,
        linea_id=esp.linea_id,
        linea_nombre=esp.linea_rel.nombre if esp.linea_rel else None,
        variegacion_id=esp.variegacion_id,
        variegacion_nombre=esp.variegacion_rel.nombre if esp.variegacion_rel else None,
        madre_id=esp.madre_id,
        madre_uid=esp.madre.uid if esp.madre else None,
        padre_id=esp.padre_id,
        padre_uid=esp.padre.uid if esp.padre else None,
        fecha_ingreso=esp.fecha_ingreso,
        origen=esp.origen,
        coordenadas=esp.coordenadas,
        estado=esp.estado,
        notas=esp.notas,
        created_at=esp.created_at,
        eventos=_build_summary(esp.eventos),
    )
