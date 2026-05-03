#!/usr/bin/env python3
"""
LBMS MCP Server — Laboratory Biological Management System

Provides direct tools for managing species, specimens, experiments, and protocols
in the LBMS API, eliminating the need to explore the codebase each session.

Configuration (env vars or mcp/.env file):
  LBMS_BASE_URL  - API base URL (default: http://localhost:8001)
  LBMS_EMAIL     - User email for authentication
  LBMS_PASSWORD  - User password for authentication
"""

import json
import os
from pathlib import Path
from typing import Any, Optional

import httpx
from pydantic import BaseModel, Field, ConfigDict
from mcp.server.fastmcp import FastMCP

# ── Load .env from mcp/ directory ────────────────────────────────────────────

_env_file = Path(__file__).parent / ".env"
if _env_file.exists():
    for line in _env_file.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())

# ── Constants ─────────────────────────────────────────────────────────────────

LBMS_BASE_URL = os.getenv("LBMS_BASE_URL", "http://localhost:8001")
LBMS_EMAIL = os.getenv("LBMS_EMAIL", "")
LBMS_PASSWORD = os.getenv("LBMS_PASSWORD", "")

mcp = FastMCP("lbms_mcp")

# ── Auth & HTTP client ────────────────────────────────────────────────────────

_token: Optional[str] = None


async def _login() -> str:
    global _token
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(
            f"{LBMS_BASE_URL}/auth/login",
            data={"username": LBMS_EMAIL, "password": LBMS_PASSWORD},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        r.raise_for_status()
        _token = r.json()["access_token"]
    return _token


async def _api(method: str, path: str, **kwargs) -> Any:
    global _token
    if not _token:
        await _login()

    headers = {"Authorization": f"Bearer {_token}"}
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.request(method, f"{LBMS_BASE_URL}{path}", headers=headers, **kwargs)
        if r.status_code == 401:
            await _login()
            headers["Authorization"] = f"Bearer {_token}"
            r = await c.request(method, f"{LBMS_BASE_URL}{path}", headers=headers, **kwargs)
        r.raise_for_status()
        if r.status_code == 204:
            return None
        return r.json()


def _err(e: Exception) -> str:
    if isinstance(e, httpx.HTTPStatusError):
        try:
            detail = e.response.json().get("detail", e.response.text)
        except Exception:
            detail = e.response.text
        return f"Error HTTP {e.response.status_code}: {detail}"
    if isinstance(e, httpx.TimeoutException):
        return "Error: timeout al contactar LBMS. ¿Está corriendo el backend?"
    if not LBMS_EMAIL or not LBMS_PASSWORD:
        return "Error: configura LBMS_EMAIL y LBMS_PASSWORD en mcp/.env"
    return f"Error {type(e).__name__}: {e}"


# ── Input models ──────────────────────────────────────────────────────────────

class EspecieIdInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    especie_id: str = Field(..., description="UUID de la especie (ej: 'ce8f5267-3380-407b-9722-2aa9c18b55c3')")


class ListEspeciesInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    buscar: Optional[str] = Field(default=None, description="Filtro de texto (nombre científico o común)")


class ListEspecimenesInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    especie_id: Optional[str] = Field(default=None, description="UUID de especie para filtrar")
    linea_id: Optional[str] = Field(default=None, description="UUID de línea genética para filtrar")
    estado: Optional[str] = Field(default=None, description="Estado: activo, en_experimento, archivado, contaminado")

class EspecimenIdInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    especimen_id: str = Field(..., description="UUID del especimen")

class UpdateEspecieInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    especie_id: str = Field(..., description="UUID de la especie a actualizar")
    descripcion: Optional[str] = Field(default=None, description="Descripción general (acepta texto de Wikipedia u otra fuente)")
    ciclo_vida: Optional[str] = Field(default=None, description="Descripción del ciclo de vida completo")
    maduracion: Optional[str] = Field(default=None, description="Tiempo e indicadores de maduración")
    notas_cultivo: Optional[str] = Field(default=None, description="Notas de cultivo, aclimatación, rescate")
    temperatura: Optional[str] = Field(default=None, description="Rango de temperatura óptima (ej: '22°C - 28°C día')")
    humedad: Optional[str] = Field(default=None, description="Humedad relativa óptima (ej: '60% - 80%')")
    luz: Optional[str] = Field(default=None, description="Requerimiento de luz (ej: '15000-30000 lux, indirecta')")
    sustrato: Optional[str] = Field(default=None, description="Sustrato recomendado")
    ph: Optional[str] = Field(default=None, description="Rango de pH (ej: '4.5 - 5.5')")
    riego: Optional[str] = Field(default=None, description="Instrucciones de riego")
    notas_requerimientos: Optional[str] = Field(default=None, description="Notas adicionales sobre condiciones")

class ListExperimentosInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    estado: Optional[str] = Field(default=None, description="Estado: planificado, activo, pausado, completado, cancelado")

class ListProtocolosInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    tipo: Optional[str] = Field(default=None, description="Tipo: extraccion_meristema, propagacion_in_vitro, desinfeccion, subcultivo, enraizamiento, aclimatacion, otro")


class ListLogsInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    limit: Optional[int] = Field(default=50, description="Número máximo de logs a retornar")


class IdInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    id: str = Field(..., description="UUID del recurso")


class BarcodeInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    barcode: str = Field(..., description="Código de barras o UID a escanear")


class ImprimirIdInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    id: str = Field(..., description="UUID del registro (especimen, reactivo, sustrato o lote)")


class ImprimirContenedorInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    uid: str = Field(..., description="UID del contenedor a etiquetar")


class ImprimirEtiquetaInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    titulo: str = Field(..., description="Título principal de la etiqueta")
    subtitulo: Optional[str] = Field(default="", description="Subtítulo o Lote")
    info: Optional[str] = Field(default="", description="Información técnica (ej: pH, Conc)")
    extra: Optional[str] = Field(default="", description="Notas adicionales o método")
    qr: Optional[str] = Field(default="", description="Contenido del código QR")


# ── Tools: Especies ───────────────────────────────────────────────────────────

@mcp.tool(
    name="lbms_list_especies",
    annotations={"title": "Listar especies", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_especies(params: ListEspeciesInput) -> str:
    """Lista todas las especies registradas en LBMS.

    Retorna nombre científico, común, familia, totales de líneas e individuos.
    Usa params.buscar para filtrar por texto (nombre científico o común).

    Returns:
        str: JSON con lista de especies. Campos por ítem:
            id, codigo, nombre_cientifico, nombre_comun, familia,
            total_lineas, total_individuos
    """
    try:
        data: list = await _api("GET", "/especies")
        if params.buscar:
            q = params.buscar.lower()
            data = [e for e in data if
                    q in (e.get("nombre_cientifico") or "").lower() or
                    q in (e.get("nombre_comun") or "").lower()]
        return json.dumps(data, indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_get_especie",
    annotations={"title": "Obtener detalle de especie", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_especie(params: EspecieIdInput) -> str:
    """Obtiene el detalle completo de una especie: ficha biológica, requerimientos,
    líneas genéticas (con variegaciones), y conteo de individuos.

    Returns:
        str: JSON con especie completa. Campos destacados:
            id, codigo, nombre_cientifico, nombre_comun, familia, genero,
            descripcion, requerimientos{temperatura,humedad,luz,sustrato,ph,riego},
            ficha{ciclo_vida,maduracion,notas_cultivo,wiki_url},
            lineas[]{nombre, metodo_propagacion, variegaciones[], total_individuos},
            total_individuos
    """
    try:
        return json.dumps(await _api("GET", f"/especies/{params.especie_id}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_get_especie_experimentos",
    annotations={"title": "Experimentos de una especie", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_especie_experimentos(params: EspecieIdInput) -> str:
    """Lista los experimentos que tienen especímenes de esta especie.

    Returns:
        str: JSON lista de experimentos. Campos por ítem:
            id, nombre, estado, fecha_inicio, director_nombre, num_especimenes
    """
    try:
        return json.dumps(await _api("GET", f"/especies/{params.especie_id}/experimentos"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_get_especie_protocolos",
    annotations={"title": "Protocolos de una especie", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_especie_protocolos(params: EspecieIdInput) -> str:
    """Lista los protocolos aplicados a especímenes de esta especie
    (vía experimentos o registros de evolución/clonación).

    Returns:
        str: JSON lista de protocolos. Campos por ítem:
            id, nombre, tipo, version, estado_validacion
    """
    try:
        return json.dumps(await _api("GET", f"/especies/{params.especie_id}/protocolos"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_buscar_wikipedia",
    annotations={"title": "Buscar info en Wikipedia", "readOnlyHint": True,
                  "destructiveHint": False, "openWorldHint": True}
)
async def lbms_buscar_wikipedia(params: EspecieIdInput) -> str:
    """Busca información de la especie en Wikipedia (español primero, luego inglés)
    usando el nombre científico. NO guarda los datos — solo los retorna para revisión.

    Returns:
        str: JSON con resultado de Wikipedia:
            titulo, descripcion_corta, extracto, wiki_url, wiki_lang
        o "Error: No encontrado en Wikipedia"
    """
    try:
        return json.dumps(await _api("GET", f"/especies/{params.especie_id}/wiki"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_update_especie",
    annotations={"title": "Actualizar ficha de especie", "readOnlyHint": False,
                  "destructiveHint": False, "idempotentHint": True}
)
async def lbms_update_especie(params: UpdateEspecieInput) -> str:
    """Actualiza la información de una especie: descripción, condiciones óptimas,
    ciclo de vida, maduración y notas de cultivo. Solo actualiza los campos
    proporcionados, deja el resto intacto.

    Campos de requerimientos (condiciones óptimas):
        temperatura, humedad, luz, sustrato, ph, riego, notas_requerimientos

    Campos de ficha biológica:
        ciclo_vida, maduracion, notas_cultivo

    Returns:
        str: JSON de la especie actualizada, o mensaje de error
    """
    try:
        patch: dict[str, Any] = {}
        if params.descripcion is not None:
            patch["descripcion"] = params.descripcion

        req_fields = {
            "temperatura": params.temperatura,
            "humedad": params.humedad,
            "luz": params.luz,
            "sustrato": params.sustrato,
            "ph": params.ph,
            "riego": params.riego,
            "notas": params.notas_requerimientos,
        }
        req_updates = {k: v for k, v in req_fields.items() if v is not None}
        if req_updates:
            current = await _api("GET", f"/especies/{params.especie_id}")
            existing_req = current.get("requerimientos") or {}
            patch["requerimientos"] = {**existing_req, **req_updates}

        ficha_fields = {
            "ciclo_vida": params.ciclo_vida,
            "maduracion": params.maduracion,
            "notas_cultivo": params.notas_cultivo,
        }
        ficha_updates = {k: v for k, v in ficha_fields.items() if v is not None}
        if ficha_updates:
            if "current" not in dir():
                current = await _api("GET", f"/especies/{params.especie_id}")
            existing_ficha = current.get("ficha") or {}
            patch["ficha"] = {**existing_ficha, **ficha_updates}

        if not patch:
            return "No se proporcionaron campos a actualizar."

        result = await _api("PATCH", f"/especies/{params.especie_id}", json=patch)
        return json.dumps(result, indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


# ── Tools: Especímenes ────────────────────────────────────────────────────────

@mcp.tool(
    name="lbms_list_especimenes",
    annotations={"title": "Listar especímenes", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_especimenes(params: ListEspecimenesInput) -> str:
    """Lista especímenes (individuos) con filtros opcionales por especie,
    línea genética y/o estado.

    Returns:
        str: JSON lista de especímenes. Campos por ítem:
            id, uid, especie, linea_nombre, variegacion_nombre, estado, fecha_ingreso
    """
    try:
        query: dict = {}
        if params.especie_id:
            query["especie"] = params.especie_id
        if params.linea_id:
            query["linea"] = params.linea_id
        if params.estado:
            query["estado"] = params.estado
        return json.dumps(await _api("GET", "/especimenes", params=query),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_get_especimen",
    annotations={"title": "Obtener detalle de especimen", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_especimen(params: EspecimenIdInput) -> str:
    """Obtiene el detalle completo de un especimen: genealogía (madre/padre),
    experimentos vinculados, eventos recientes y registros de evolución.

    Returns:
        str: JSON con especimen completo. Campos destacados:
            id, uid, especie, estado, origen, fecha_ingreso,
            madre_uid, padre_uid, eventos[], experimentos[]
    """
    try:
        return json.dumps(await _api("GET", f"/especimenes/{params.especimen_id}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


# ── Tools: Experimentos ───────────────────────────────────────────────────────

@mcp.tool(
    name="lbms_list_experimentos",
    annotations={"title": "Listar experimentos", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_experimentos(params: ListExperimentosInput) -> str:
    """Lista todos los experimentos registrados en LBMS, con filtro opcional por estado.

    Returns:
        str: JSON lista de experimentos. Campos por ítem:
            id, nombre, estado, fecha_inicio
    """
    try:
        data = await _api("GET", "/experimentos")
        if params.estado:
            data = [e for e in data if e.get("estado") == params.estado]
        return json.dumps(data, indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


# ── Tools: Protocolos ─────────────────────────────────────────────────────────

@mcp.tool(
    name="lbms_list_protocolos",
    annotations={"title": "Listar protocolos", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_protocolos(params: ListProtocolosInput) -> str:
    """Lista todos los protocolos registrados en LBMS, con filtro opcional por tipo.

    Tipos disponibles: extraccion_meristema, propagacion_in_vitro, desinfeccion,
    subcultivo, enraizamiento, aclimatacion, otro

    Returns:
        str: JSON lista de protocolos. Campos por ítem:
            id, nombre, tipo, version, estado_validacion
    """
    try:
        data = await _api("GET", "/protocolos")
        if params.tipo:
            data = [p for p in data if p.get("tipo") == params.tipo]
        return json.dumps(data, indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_get_protocolo",
    annotations={"title": "Obtener detalle de protocolo", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_protocolo(params: IdInput) -> str:
    """Obtiene el detalle completo de un protocolo, incluyendo sus pasos (Run Mode)
    y materiales requeridos.
    """
    try:
        return json.dumps(await _api("GET", f"/protocolos/{params.id}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_get_experimento",
    annotations={"title": "Obtener detalle de experimento", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_experimento(params: IdInput) -> str:
    """Obtiene el detalle completo de un experimento: estado, especímenes asignados,
    y lista de resultados (mediciones, observaciones).
    """
    try:
        return json.dumps(await _api("GET", f"/experimentos/{params.id}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


# ── Tools: Inventario & Reactivos ─────────────────────────────────────────────

@mcp.tool(
    name="lbms_list_reactivos",
    annotations={"title": "Listar reactivos químicos", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_reactivos() -> str:
    """Lista el catálogo de reactivos químicos disponibles, su stock y pureza."""
    try:
        return json.dumps(await _api("GET", "/reactivos"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_list_formulaciones",
    annotations={"title": "Listar recetario de medios", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_formulaciones() -> str:
    """Lista las formulaciones de medios y buffers registradas en el recetario."""
    try:
        return json.dumps(await _api("GET", "/formulaciones"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_get_formulacion",
    annotations={"title": "Obtener receta de medio", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_formulacion(params: IdInput) -> str:
    """Obtiene la receta detallada (mise en place) de una formulación específica."""
    try:
        return json.dumps(await _api("GET", f"/formulaciones/{params.id}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_list_lotes",
    annotations={"title": "Listar lotes preparados", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_lotes() -> str:
    """Lista los lotes de medios o buffers ya preparados y disponibles para usar."""
    try:
        return json.dumps(await _api("GET", "/reactivos/lotes"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


# ── Tools: Físico & Sustratos ─────────────────────────────────────────────────

@mcp.tool(
    name="lbms_list_sustratos",
    annotations={"title": "Listar sustratos", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_sustratos() -> str:
    """Lista los sustratos (orgánicos e inorgánicos) y sus propiedades teóricas."""
    try:
        return json.dumps(await _api("GET", "/sustratos"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_list_elementos",
    annotations={"title": "Listar equipamiento", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_elementos() -> str:
    """Lista el equipamiento y elementos físicos del laboratorio."""
    try:
        return json.dumps(await _api("GET", "/elementos"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


# ── Tools: Hardware & Printing ────────────────────────────────────────────────

@mcp.tool(
    name="lbms_scan_qr",
    annotations={"title": "Escanear código", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_scan_qr(params: BarcodeInput) -> str:
    """Resuelve un código de barras o UID para identificar qué entidad es (especimen, reactivo, etc)."""
    try:
        return json.dumps(await _api("GET", f"/scan/{params.barcode}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_imprimir_especimen",
    annotations={"title": "Imprimir etiqueta de espécimen", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_especimen(params: ImprimirIdInput) -> str:
    """Imprime una etiqueta normalizada para un espécimen biológico, incluyendo su
    especie, UID y requerimientos de cultivo automáticos.
    """
    try:
        return json.dumps(await _api("POST", f"/printer/imprimir/{params.id}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_imprimir_reactivo",
    annotations={"title": "Imprimir etiqueta de reactivo", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_reactivo(params: ImprimirIdInput) -> str:
    """Imprime una etiqueta para un frasco de reactivo puro (Stock), incluyendo
    pureza, fórmula química y pictogramas de peligrosidad.
    """
    try:
        return json.dumps(await _api("POST", f"/printer/imprimir-reactivo/{params.id}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_imprimir_sustrato",
    annotations={"title": "Imprimir etiqueta de sustrato", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_sustrato(params: ImprimirIdInput) -> str:
    """Imprime una etiqueta para un contenedor de sustrato (ej. Sphagnum, Turba),
    incluyendo pH y conductividad teórica.
    """
    try:
        return json.dumps(await _api("POST", f"/printer/imprimir-sustrato/{params.id}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_imprimir_lote",
    annotations={"title": "Imprimir etiqueta de lote preparado", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_lote(params: ImprimirIdInput) -> str:
    """Imprime una etiqueta para un medio o buffer preparado, con desglose de
    componentes calculados, fecha de vencimiento y preparador.
    """
    try:
        return json.dumps(await _api("POST", f"/printer/imprimir-lote/{params.id}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_imprimir_contenedor",
    annotations={"title": "Imprimir etiqueta de contenedor", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_contenedor(params: ImprimirContenedorInput) -> str:
    """Imprime una etiqueta resumen para un contenedor que agrupa múltiples especímenes."""
    try:
        return json.dumps(await _api("POST", f"/printer/imprimir-contenedor/{params.uid}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_imprimir_etiqueta_libre",
    annotations={"title": "Imprimir etiqueta libre", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_etiqueta_libre(params: ImprimirEtiquetaInput) -> str:
    """Envía una orden de impresión con campos libres a la impresora Jadens."""
    try:
        payload = {
            "titulo": params.titulo,
            "subtitulo": params.subtitulo,
            "info": params.info,
            "extra": params.extra,
            "qr": params.qr
        }
        return json.dumps(await _api("POST", "/printer/imprimir-etiqueta-libre", json=payload),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_get_frontend_logs",
    annotations={"title": "Obtener logs del frontend", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_frontend_logs(params: ListLogsInput) -> str:
    """Retorna los últimos reportes de errores y crashes capturados por la telemetría de las apps cliente."""
    try:
        query = {"limit": params.limit}
        return json.dumps(await _api("GET", "/app/telemetry", params=query),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if not LBMS_EMAIL or not LBMS_PASSWORD:
        import sys
        print(
            "ERROR: Configura LBMS_EMAIL y LBMS_PASSWORD en /home/elcubonegro/lbms/mcp/.env",
            file=sys.stderr,
        )
        sys.exit(1)
    mcp.run()
