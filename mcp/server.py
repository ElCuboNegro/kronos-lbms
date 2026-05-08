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

class ListReactivosInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    buscar: Optional[str] = Field(default=None, description="Filtro de texto por nombre de reactivo")

class UpdateFormulacionInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    formulacion_id: str = Field(..., description="UUID de la formulación")
    nombre: Optional[str] = Field(default=None)
    descripcion: Optional[str] = Field(default=None)
    procedimiento: Optional[str] = Field(default=None)
    volumen_base_l: Optional[float] = Field(default=None)
    caducidad_dias: Optional[int] = Field(default=None)
    componentes: Optional[list[dict[str, Any]]] = Field(default=None, description="Lista de componentes con reactivo_id o formulacion_ingrediente_id y cantidad_base")

class UpdateSustratoInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    sustrato_id: str = Field(..., description="UUID del sustrato")
    nombre: Optional[str] = Field(default=None)
    descripcion: Optional[str] = Field(default=None)
    ph_teorico: Optional[float] = Field(default=None)
    conductividad_teorica: Optional[float] = Field(default=None)
    componentes: Optional[list[dict[str, Any]]] = Field(default=None)

class SustratoIdInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    sustrato_id: str = Field(..., description="UUID del sustrato")

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


# ── Tools: Laboratorio (Reactivos, Formulaciones, Sustratos) ─────────────────

@mcp.tool(
    name="lbms_list_reactivos",
    annotations={"title": "Listar reactivos", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_reactivos(params: ListReactivosInput) -> str:
    """Lista todos los reactivos en el inventario.

    Returns:
        str: JSON lista de reactivos.
    """
    try:
        data = await _api("GET", "/reactivos")
        if params.buscar:
            q = params.buscar.lower()
            data = [r for r in data if q in r.get("nombre", "").lower()]
        return json.dumps(data, indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_list_formulaciones",
    annotations={"title": "Listar formulaciones (recetas)", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_formulaciones() -> str:
    """Lista todas las formulaciones (recetas) registradas.

    Returns:
        str: JSON lista de formulaciones con sus componentes.
    """
    try:
        return json.dumps(await _api("GET", "/reactivos/formulaciones"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_update_formulacion",
    annotations={"title": "Actualizar formulación", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_update_formulacion(params: UpdateFormulacionInput) -> str:
    """Actualiza una formulación existente (nombre, descripción o componentes).

    Returns:
        str: JSON de la formulación actualizada.
    """
    try:
        patch = params.model_dump(exclude_unset=True, exclude={"formulacion_id"})
        result = await _api("PATCH", f"/reactivos/formulaciones/{params.formulacion_id}", json=patch)
        return json.dumps(result, indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_list_sustratos",
    annotations={"title": "Listar sustratos", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_sustratos() -> str:
    """Lista todos los sustratos (mezclas, agares) registrados.

    Returns:
        str: JSON lista de sustratos.
    """
    try:
        return json.dumps(await _api("GET", "/sustratos"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_get_sustrato",
    annotations={"title": "Obtener detalle de sustrato", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_sustrato(params: SustratoIdInput) -> str:
    """Obtiene el detalle completo de un sustrato.

    Returns:
        str: JSON con el sustrato.
    """
    try:
        return json.dumps(await _api("GET", f"/sustratos/{params.sustrato_id}"),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_update_sustrato",
    annotations={"title": "Actualizar sustrato", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_update_sustrato(params: UpdateSustratoInput) -> str:
    """Actualiza la información de un sustrato (nombre, descripción, pH, EC).

    Returns:
        str: JSON del sustrato actualizado.
    """
    try:
        patch = params.model_dump(exclude_unset=True, exclude={"sustrato_id"})
        result = await _api("PATCH", f"/sustratos/{params.sustrato_id}", json=patch)
        return json.dumps(result, indent=2, ensure_ascii=False, default=str)
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

# ── Tools: Science & Calculations ───────────────────────────────────────────

class MolarityInput(BaseModel):
    molarity: float = Field(..., description="Target molarity (M)")
    volume_l: float = Field(..., description="Target volume in liters (L)")
    molecular_weight: float = Field(..., description="Molecular weight of the substance (g/mol)")

class DilutionInput(BaseModel):
    c1: float = Field(..., description="Initial concentration")
    c2: float = Field(..., description="Final concentration")
    v2: float = Field(..., description="Final volume")

@mcp.tool()
async def science_calculate_molarity(params: MolarityInput) -> str:
    """Calculates the mass required for a specific molarity and volume."""
    try:
        res = await _api("POST", "/science/calculate/molarity", json=params.model_dump())
        return json.dumps(res, indent=2)
    except Exception as e:
        return _err(e)

@mcp.tool()
async def science_calculate_dilution(params: DilutionInput) -> str:
    """Calculates V1 required for a C1V1 dilution."""
    try:
        res = await _api("POST", "/science/calculate/dilution", json=params.model_dump())
        return json.dumps(res, indent=2)
    except Exception as e:
        return _err(e)
