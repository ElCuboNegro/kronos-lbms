from uuid import UUID
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import distinct, func
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/especies", tags=["especies"])


# ── helpers ───────────────────────────────────────────────────────────────────

def _var_out(v: models.Variegacion) -> schemas.VariegacionOut:
    return schemas.VariegacionOut(
        id=v.id,
        linea_id=v.linea_id,
        nombre=v.nombre,
        codigo=v.codigo,
        descripcion=v.descripcion,
        config_estandar=v.config_estandar,
        notas=v.notas,
        created_at=v.created_at,
        total_individuos=len(v.especimenes),
    )


def _linea_out(l: models.Linea) -> schemas.LineaOut:
    return schemas.LineaOut(
        id=l.id,
        especie_id=l.especie_id,
        nombre=l.nombre,
        metodo_propagacion=l.metodo_propagacion,
        descripcion=l.descripcion,
        config_estandar=l.config_estandar,
        notas=l.notas,
        created_at=l.created_at,
        variegaciones=[_var_out(v) for v in l.variegaciones],
        total_individuos=sum(len(v.especimenes) for v in l.variegaciones) + len(l.especimenes),
    )


def _especie_out(e: models.Especie) -> schemas.EspecieOut:
    return schemas.EspecieOut(
        id=e.id,
        codigo=e.codigo,
        nombre_cientifico=e.nombre_cientifico,
        categoria=e.categoria,
        nombre_comun=e.nombre_comun,
        familia=e.familia,
        genero=e.genero,
        descripcion=e.descripcion,
        requerimientos=e.requerimientos,
        config_estandar=e.config_estandar,
        ficha=e.ficha,
        created_at=e.created_at,
        lineas=[_linea_out(l) for l in e.lineas],
        total_individuos=len(e.especimenes),
    )

def _load_especie(id_or_code, db: Session) -> models.Especie:
    query = (
        db.query(models.Especie)
        .options(
            joinedload(models.Especie.lineas)
            .joinedload(models.Linea.variegaciones)
            .joinedload(models.Variegacion.especimenes),
            joinedload(models.Especie.lineas)
            .joinedload(models.Linea.especimenes),
            joinedload(models.Especie.especimenes),
        )
    )

    try:
        parsed_id = UUID(str(id_or_code))
        e = query.filter(models.Especie.id == parsed_id).first()
    except ValueError:
        e = query.filter(models.Especie.codigo.ilike(id_or_code)).first()

    if not e:
        raise HTTPException(status_code=404, detail="Especie no encontrada")
    return e

# ── Especies ──────────────────────────────────────────────────────────────────

@router.get("", response_model=list[schemas.EspecieListItem])
def listar(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user)
):
    # Subconsultas para contar sin cargar todos los objetos en memoria (Issue #9)
    lineas_subq = (
        db.query(models.Linea.especie_id, func.count(models.Linea.id).label("total_lineas"))
        .group_by(models.Linea.especie_id)
        .subquery()
    )
    especimenes_subq = (
        db.query(models.Especimen.especie_id, func.count(models.Especimen.id).label("total_individuos"))
        .group_by(models.Especimen.especie_id)
        .subquery()
    )

    results = (
        db.query(
            models.Especie,
            func.coalesce(lineas_subq.c.total_lineas, 0).label("total_lineas"),
            func.coalesce(especimenes_subq.c.total_individuos, 0).label("total_individuos")
        )
        .outerjoin(lineas_subq, models.Especie.id == lineas_subq.c.especie_id)
        .outerjoin(especimenes_subq, models.Especie.id == especimenes_subq.c.especie_id)
        .order_by(models.Especie.nombre_cientifico)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        schemas.EspecieListItem(
            id=e.id,
            codigo=e.codigo,
            nombre_cientifico=e.nombre_cientifico,
            categoria=e.categoria,
            nombre_comun=e.nombre_comun,
            familia=e.familia,
            total_lineas=total_lineas,
            total_individuos=total_individuos,
        )
        for e, total_lineas, total_individuos in results
    ]


@router.post("", response_model=schemas.EspecieOut, status_code=201)
def crear(payload: schemas.EspecieCreate, db: Session = Depends(get_db),
          _=Depends(auth.get_current_user)):
    if db.query(models.Especie).filter(
        models.Especie.nombre_cientifico == payload.nombre_cientifico
    ).first():
        raise HTTPException(status_code=409, detail="Especie ya registrada")

    if db.query(models.Especie).filter(models.Especie.codigo == payload.codigo).first():
        raise HTTPException(status_code=409, detail="Código de especie ya en uso")

    e = models.Especie(**payload.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return _especie_out(_load_especie(e.id, db))


@router.get("/{id_or_code}", response_model=schemas.EspecieOut)
def obtener(id_or_code: str, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    return _especie_out(_load_especie(id_or_code, db))


@router.patch("/{id}", response_model=schemas.EspecieOut)
def actualizar(id: UUID, payload: schemas.EspecieUpdate,
               db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    e = db.query(models.Especie).filter(models.Especie.id == id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Especie no encontrada")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(e, k, v)
    db.commit()
    return _especie_out(_load_especie(id, db))


# ── Líneas ────────────────────────────────────────────────────────────────────

@router.post("/{especie_id}/lineas", response_model=schemas.LineaOut, status_code=201)
def crear_linea(especie_id: UUID, payload: schemas.LineaCreate,
                db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    if not db.query(models.Especie).filter(models.Especie.id == especie_id).first():
        raise HTTPException(status_code=404, detail="Especie no encontrada")
    if db.query(models.Linea).filter(
        models.Linea.especie_id == especie_id,
        models.Linea.nombre == payload.nombre,
    ).first():
        raise HTTPException(status_code=409, detail="Línea ya existe en esta especie")
    l = models.Linea(especie_id=especie_id, **payload.model_dump())
    db.add(l)
    db.commit()
    db.refresh(l)
    return _linea_out(l)


@router.patch("/lineas/{linea_id}", response_model=schemas.LineaOut)
def actualizar_linea(linea_id: UUID, payload: schemas.LineaUpdate,
                     db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    l = db.query(models.Linea).filter(models.Linea.id == linea_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Línea no encontrada")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(l, k, v)
    db.commit()
    db.refresh(l)
    return _linea_out(l)


# ── Variegaciones ─────────────────────────────────────────────────────────────

@router.post("/lineas/{linea_id}/variegaciones", response_model=schemas.VariegacionOut, status_code=201)
def crear_variegacion(linea_id: UUID, payload: schemas.VariegacionCreate,
                      db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    if not db.query(models.Linea).filter(models.Linea.id == linea_id).first():
        raise HTTPException(status_code=404, detail="Línea no encontrada")
    if db.query(models.Variegacion).filter(
        models.Variegacion.linea_id == linea_id,
        models.Variegacion.nombre == payload.nombre,
    ).first():
        raise HTTPException(status_code=409, detail="Variegación ya existe en esta línea")
    v = models.Variegacion(linea_id=linea_id, **payload.model_dump())
    db.add(v)
    db.commit()
    db.refresh(v)
    return _var_out(v)


@router.patch("/variegaciones/{var_id}", response_model=schemas.VariegacionOut)
def actualizar_variegacion(var_id: UUID, payload: schemas.VariegacionUpdate,
                           db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    v = db.query(models.Variegacion).filter(models.Variegacion.id == var_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Variegación no encontrada")
    for k, v2 in payload.model_dump(exclude_unset=True).items():
        setattr(v, k, v2)
    db.commit()
    db.refresh(v)
    return _var_out(v)


# ── Wikipedia ─────────────────────────────────────────────────────────────────

async def _fetch_wiki(term: str, lang: str) -> dict | None:
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{term.replace(' ', '_')}"
    async with httpx.AsyncClient(timeout=8) as client:
        r = await client.get(url, headers={"User-Agent": "LBMS/1.0"})
        if r.status_code != 200:
            return None
        data = r.json()
        if data.get("type") == "disambiguation":
            return None
        return data


@router.get("/{id}/wiki", response_model=schemas.WikiResult)
async def buscar_wikipedia(id: UUID, db: Session = Depends(get_db),
                           _=Depends(auth.get_current_user)):
    e = db.query(models.Especie).filter(models.Especie.id == id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Especie no encontrada")

    term = e.nombre_cientifico
    data = await _fetch_wiki(term, "es") or await _fetch_wiki(term, "en")
    if not data:
        raise HTTPException(status_code=404, detail="No encontrado en Wikipedia")

    lang = "es" if data.get("lang", "es") == "es" else "en"
    return schemas.WikiResult(
        titulo=data.get("title", term),
        descripcion_corta=data.get("description"),
        extracto=data.get("extract"),
        wiki_url=data.get("content_urls", {}).get("desktop", {}).get("page"),
        wiki_lang=lang,
    )


# ── Experimentos relacionados ─────────────────────────────────────────────────

@router.get("/{id}/experimentos", response_model=list[schemas.EspecieExperimentoItem])
def experimentos_de_especie(id: UUID, db: Session = Depends(get_db),
                            _=Depends(auth.get_current_user)):
    if not db.query(models.Especie).filter(models.Especie.id == id).first():
        raise HTTPException(status_code=404, detail="Especie no encontrada")

    # Optimización N+1: Contar especímenes por experimento usando subquery para evitar GroupingError en Postgres
    counts_subq = (
        db.query(
            models.experimento_especimen.c.experimento_id,
            func.count(models.Especimen.id).label("num_especimenes")
        )
        .join(models.Especimen,
              models.Especimen.id == models.experimento_especimen.c.especimen_id)
        .filter(models.Especimen.especie_id == id)
        .group_by(models.experimento_especimen.c.experimento_id)
        .subquery()
    )

    exps_with_counts = (
        db.query(models.Experimento, counts_subq.c.num_especimenes)
        .join(counts_subq, models.Experimento.id == counts_subq.c.experimento_id)
        .options(joinedload(models.Experimento.director))
        .all()
    )

    # Experimentos ligados directamente a la especie por FK (Experimento.especie_id),
    # aunque todavía no tengan especímenes (p. ej. experimentos "planificado").
    exps_directos = (
        db.query(models.Experimento)
        .filter(models.Experimento.especie_id == id)
        .options(joinedload(models.Experimento.director))
        .all()
    )

    # Combinar ambas fuentes sin duplicar; num_especimenes = 0 si solo viene por FK.
    por_id = {}
    for exp, num_esp in exps_with_counts:
        por_id[exp.id] = (exp, num_esp)
    for exp in exps_directos:
        if exp.id not in por_id:
            por_id[exp.id] = (exp, 0)

    result = []
    for exp, num_esp in por_id.values():
        result.append(schemas.EspecieExperimentoItem(
            id=exp.id,
            nombre=exp.nombre,
            estado=exp.estado,
            fecha_inicio=exp.fecha_inicio,
            director_nombre=exp.director.nombre if exp.director else None,
            num_especimenes=num_esp,
        ))
    return result


# ── Protocolos relacionados ───────────────────────────────────────────────────

@router.get("/{id}/protocolos", response_model=list[schemas.EspecieProtocoloItem])
def protocolos_de_especie(id: UUID, db: Session = Depends(get_db),
                          _=Depends(auth.get_current_user)):
    if not db.query(models.Especie).filter(models.Especie.id == id).first():
        raise HTTPException(status_code=404, detail="Especie no encontrada")

    # Protocolos via experimentos que contienen especimenes de esta especie
    proto_via_exp = (
        db.query(models.Protocolo)
        .join(models.Experimento, models.Experimento.protocolo_id == models.Protocolo.id)
        .join(models.experimento_especimen,
              models.Experimento.id == models.experimento_especimen.c.experimento_id)
        .join(models.Especimen,
              models.Especimen.id == models.experimento_especimen.c.especimen_id)
        .filter(models.Especimen.especie_id == id)
        .all()
    )

    # Protocolos via registros de evolución de especimenes de esta especie
    proto_via_evol = (
        db.query(models.Protocolo)
        .join(models.RegistroEvolucion,
              models.RegistroEvolucion.protocolo_clonacion_id == models.Protocolo.id)
        .join(models.Especimen,
              models.Especimen.id == models.RegistroEvolucion.especimen_id)
        .filter(models.Especimen.especie_id == id)
        .all()
    )

    # Protocolos via experimentos ligados directamente a la especie por FK,
    # aunque el experimento aún no tenga especímenes (p. ej. "planificado").
    proto_via_exp_directo = (
        db.query(models.Protocolo)
        .join(models.Experimento, models.Experimento.protocolo_id == models.Protocolo.id)
        .filter(models.Experimento.especie_id == id)
        .all()
    )

    seen = set()
    result = []
    for p in proto_via_exp + proto_via_evol + proto_via_exp_directo:
        if p.id not in seen:
            seen.add(p.id)
            result.append(schemas.EspecieProtocoloItem(
                id=p.id,
                nombre=p.nombre,
                tipo=p.tipo,
                version=p.version,
                estado_validacion=p.estado_validacion,
            ))
    return result

@router.get("/{id}/galeria", response_model=list[schemas.GaleriaFotoOut])
def galeria_de_especie(id: UUID, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    from sqlalchemy import text
    regs = (
        db.query(models.RegistroEvolucion, models.Especimen.uid)
        .join(models.Especimen, models.Especimen.id == models.RegistroEvolucion.especimen_id)
        .filter(models.Especimen.especie_id == id)
        .filter(text("fotos::text != '{}'"))
        .order_by(models.RegistroEvolucion.fecha.desc())
        .all()
    )

    resultados = []
    for reg, uid in regs:
        if reg.fotos:
            for angulo, url in reg.fotos.items():
                resultados.append(schemas.GaleriaFotoOut(
                    url=url,
                    angulo=angulo,
                    fecha=reg.fecha,
                    especimen_id=reg.especimen_id,
                    especimen_uid=uid
                ))
    return resultados
