import os
from datetime import date, datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
import httpx
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/printer", tags=["printer"])

PRINTER_URL = os.environ.get("PRINTER_API_URL", "http://host.docker.internal:8000")


@router.post("/imprimir/{especimen_id}", status_code=200)
async def imprimir_etiqueta(
    especimen_id: str,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    esp = db.query(models.Especimen).filter(models.Especimen.id == especimen_id).first()
    if not esp:
        raise HTTPException(status_code=404, detail="Espécimen no encontrado")

    # ── Lógica de Jerarquía de Metadatos ──
    defaults = {}

    # 1. Base: Especie
    if esp.especie_id:
        especie = db.query(models.Especie).filter(models.Especie.id == esp.especie_id).first()
        if especie:
            if especie.requerimientos:
                # Map requerimientos text values to standard keys if config_estandar is missing them
                req = especie.requerimientos
                defaults['temperatura_c'] = req.get('temperatura_optima_c') or req.get('temperatura')
                defaults['humedad_relativa_pct'] = req.get('humedad_optima_pct') or req.get('humedad')
                defaults['ph_sustrato'] = req.get('ph_optimo') or req.get('ph')
                defaults['luz_lux'] = req.get('luz_optima_lux') or req.get('luz')
                defaults['npk'] = req.get('npk')
                defaults['riego'] = req.get('riego')
            if especie.config_estandar:
                defaults.update(especie.config_estandar)

    # 2. Sobrescribe: Línea
    if esp.linea_id:
        linea = db.query(models.Linea).filter(models.Linea.id == esp.linea_id).first()
        if linea and linea.config_estandar:
            defaults.update({k: v for k, v in linea.config_estandar.items() if v is not None})

    # 3. Sobrescribe: Variegación
    if esp.variegacion_id:
        var = db.query(models.Variegacion).filter(models.Variegacion.id == esp.variegacion_id).first()
        if var and var.config_estandar:
            defaults.update({k: v for k, v in var.config_estandar.items() if v is not None})

    # 4. Sobrescribe: Experimento activo
    exp_vinculado = (
        db.query(models.Experimento)
        .join(models.Experimento.especimenes)
        .filter(models.Especimen.id == especimen_id, models.Experimento.estado == 'activo')
        .order_by(models.Experimento.created_at.desc())
        .first()
    )
    if exp_vinculado and exp_vinculado.config_estandar:
        defaults.update({k: v for k, v in exp_vinculado.config_estandar.items() if v is not None})

    def fmt(val, unit=""):
        if val is None or val == "": return "—"
        v = str(val)
        if unit and not v.endswith(unit.strip()) and not v.endswith(unit[-1]):
            return f"{v}{unit}"
        return v

    extra = {
        "riego": fmt(defaults.get('riego') or defaults.get('humedad_sustrato_pct'), "%"),
        "humedad": fmt(defaults.get('humedad_relativa_pct'), "%"),
        "luz": fmt(defaults.get('luz_lux'), "lx"),
        "temp": fmt(defaults.get('temperatura_c'), "°C"),
        "ph": fmt(defaults.get('ph_sustrato')),
        "npk": fmt(defaults.get('npk'))
    }

    payload = {
        "modo": "planta",
        "arg1": esp.especie,
        "arg2": esp.uid,
        "arg3": esp.fecha_ingreso.isoformat() if esp.fecha_ingreso else date.today().isoformat(),
        "extra": extra
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(f"{PRINTER_URL}/imprimir", json=payload)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Error de impresora: {r.text}")
        return {"status": "impreso", "uid": esp.uid}
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Servicio de impresión no disponible ({type(exc).__name__})")


@router.post("/imprimir-reactivo/{reactivo_id}", status_code=200)
async def imprimir_reactivo(
    reactivo_id: str,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    reactivo = db.query(models.Reactivo).filter(models.Reactivo.id == reactivo_id).first()

    if not reactivo:
        raise HTTPException(status_code=404, detail="Reactivo no encontrado")

    payload = {
        "modo": "reactivo",
        "arg1": reactivo.nombre,
        "arg2": f"STOCK-{reactivo.id}",
        "arg3": reactivo.fecha_expiracion.isoformat() if reactivo.fecha_expiracion else "N/A",
        "extra": {
            "preparador": "Stock Puro",
            "marca": reactivo.marca or "S/M",
            "componentes": reactivo.formula_quimica or "N/A",
            "conc. (%)": f"{reactivo.pureza_pct}%" if reactivo.pureza_pct else "N/A",
            "peligros": reactivo.peligrosidad or []
        }
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(f"{PRINTER_URL}/imprimir", json=payload)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Error de impresora: {r.text}")
        return {"status": "impreso", "uid": f"STOCK-{reactivo.id}"}
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Servicio de impresión no disponible ({type(exc).__name__})")

@router.post("/imprimir-sustrato/{sustrato_id}", status_code=200)
async def imprimir_sustrato(
    sustrato_id: str,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    sustrato = db.query(models.Sustrato).filter(models.Sustrato.id == sustrato_id).first()

    if not sustrato:
        raise HTTPException(status_code=404, detail="Sustrato no encontrado")

    payload = {
        "modo": "reactivo",
        "arg1": sustrato.nombre,
        "arg2": f"SUST-{sustrato.codigo_formulacion}",
        "arg3": sustrato.tipo.upper(),
        "extra": {
            "pH Teórico": str(sustrato.ph_teorico) if sustrato.ph_teorico else "N/A",
            "EC Teórica": str(sustrato.conductividad_teorica) if sustrato.conductividad_teorica else "N/A",
            "notas": sustrato.notes or ""
        }
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(f"{PRINTER_URL}/imprimir", json=payload)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Error de impresora: {r.text}")
        return {"status": "impreso", "uid": f"SUST-{sustrato.codigo_formulacion}"}
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Servicio de impresión no disponible ({type(exc).__name__})")


@router.post("/imprimir-contenedor/{contenedor_uid}", status_code=200)
async def imprimir_contenedor(
    contenedor_uid: str,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    especimenes = db.query(models.Especimen).filter(models.Especimen.contenedor_uid == contenedor_uid).all()

    if not especimenes:
        raise HTTPException(status_code=404, detail="No hay especímenes asociados a este contenedor")

    # Resumen de lo que hay dentro
    tipos_origen = [e.notas or e.origen or "Explanto" for e in especimenes]
    resumen_componentes = ", ".join(tipos_origen[:4])
    if len(tipos_origen) > 4:
        resumen_componentes += f" (+{len(tipos_origen)-4} más)"

    payload = {
        "modo": "contenedor",
        "arg1": "Contenedor Múltiple",
        "arg2": contenedor_uid,
        "arg3": f"{len(especimenes)} Especímenes",
        "extra": {
            "especie": especimenes[0].especie,
            "componentes": resumen_componentes,
            "fecha_ingreso": especimenes[0].fecha_ingreso.isoformat() if especimenes[0].fecha_ingreso else "N/A"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(f"{PRINTER_URL}/imprimir", json=payload)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Error de impresora: {r.text}")
        return {"status": "impreso", "uid": contenedor_uid}
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Servicio de impresión no disponible ({type(exc).__name__})")

@router.post("/imprimir-lote/{lote_id}", status_code=200)
async def imprimir_lote(
    lote_id: str,
    db: Session = Depends(get_db),
    _=Depends(auth.get_current_user),
):
    lote = db.query(models.LotePreparado).options(
        joinedload(models.LotePreparado.formulacion).joinedload(models.Formulacion.componentes).joinedload(models.FormulacionComponente.reactivo),
        joinedload(models.LotePreparado.formulacion).joinedload(models.Formulacion.componentes).joinedload(models.FormulacionComponente.formulacion_ingrediente),
        joinedload(models.LotePreparado.preparado_por)
    ).filter(models.LotePreparado.id == lote_id).first()

    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")

    # Calcular ratio para componentes
    ratio = (lote.volumen_l / lote.formulacion.volumen_base_l) * lote.concentracion_x

    # Construir lista de componentes para la etiqueta
    comps = []
    peligros = set()
    for c in lote.formulacion.componentes:
        cant = c.cantidad_base * ratio
        es_reactivo = c.reactivo is not None
        nombre = c.reactivo.nombre if es_reactivo else c.formulacion_ingrediente.nombre
        unit = c.reactivo.unidad_medida if es_reactivo else 'ml'

        comps.append(f"{nombre}: {cant:.2f}{unit}")
        if es_reactivo and c.reactivo.peligrosidad:
            peligros.update(c.reactivo.peligrosidad)

    payload = {
        "modo": "reactivo",
        "arg1": lote.formulacion.nombre,
        "arg2": lote.uid,
        "arg3": lote.fecha_expiracion.strftime("%Y-%m-%d") if lote.fecha_expiracion else "N/A",
        "extra": {
            "preparador": lote.preparado_por.nombre,
            "volumen": f"{lote.volumen_l}L (x{lote.concentracion_x})",
            "concentracion": f"{lote.concentracion_x}x",
            "componentes": ", ".join(comps),
            "peligros": list(peligros)
        }
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(f"{PRINTER_URL}/imprimir", json=payload)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Error de impresora: {r.text}")
        return {"status": "impreso", "uid": lote.uid}
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Servicio de impresión no disponible ({type(exc).__name__})")


@router.get("/generar-uid", status_code=200)
def generar_uid(especie_id: UUID, db: Session = Depends(get_db), _=Depends(auth.get_current_user)):
    """Genera un UID compuesto: CODE-YYMMDDHH-INDEX."""
    esp = db.query(models.Especie).filter(models.Especie.id == especie_id).first()
    if not esp:
        raise HTTPException(status_code=404, detail="Especie no encontrada")

    code = esp.codigo or esp.nombre_cientifico[:4].upper()
    now = datetime.now() # Usamos hora local para que coincida con el reloj del técnico
    date_part = now.strftime("%y%m%d")
    time_part = now.strftime("%H%M%S")

    prefix = f"{code}-{date_part}-{time_part}-"

    # Buscar el último espécimen con este prefijo (mismo segundo)
    ultimo = db.query(models.Especimen).filter(
        models.Especimen.uid.like(f"{prefix}%")
    ).order_by(models.Especimen.uid.desc()).first()

    if ultimo:
        try:
            parts = ultimo.uid.split("-")
            idx = int(parts[-1]) + 1
        except (ValueError, IndexError):
            idx = 1
    else:
        idx = 1

    uid = f"{prefix}{idx:02d}"
    return {"uid": uid}

@router.post("/imprimir-etiqueta-libre", status_code=200)
async def imprimir_etiqueta_libre(
    payload: schemas.EtiquetaLibre,
    _=Depends(auth.get_current_user),
):
    """Permite imprimir una etiqueta con datos personalizados (ej. muestras de protocolos)."""
    try:
        # Preparamos el payload para el microservicio lab_printer_api
        print_data = {
            "modo": "reactivo",
            "arg1": payload.titulo,
            "arg2": payload.subtitulo,
            "arg3": payload.info,
            "extra": {
                "metodo": payload.extra
            },
            "qr": payload.qr
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{PRINTER_URL}/imprimir", json=print_data, timeout=5.0)
            if resp.status_code != 200:
                raise HTTPException(status_code=500, detail="Error en el servicio de impresión")

        return {"status": "ok", "message": "Impresión enviada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
