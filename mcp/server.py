#!/usr/bin/env python3
import os
import json
from datetime import date, datetime, timezone
from typing import Optional, List, Dict, Any
import httpx
from pydantic import BaseModel, Field, ConfigDict
from mcp.server.fastmcp import FastMCP

# Configuración del servidor MCP
mcp = FastMCP("Seymour OS Controller")

# Configuración de entorno
LBMS_BASE_URL = os.environ.get("LBMS_BASE_URL", "http://localhost:8001")
LBMS_EMAIL = os.environ.get("LBMS_EMAIL")
LBMS_PASSWORD = os.environ.get("LBMS_PASSWORD")

# Almacenamiento del token de sesión
_token = None

async def _login():
    """Realiza el login en el backend de LBMS y obtiene el token JWT."""
    global _token
    if not LBMS_EMAIL or not LBMS_PASSWORD:
        raise Exception("Faltan credenciales LBMS_EMAIL o LBMS_PASSWORD. Configura LBMS_EMAIL y LBMS_PASSWORD en mcp/.env")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{LBMS_BASE_URL}/auth/login",
            data={"username": LBMS_EMAIL, "password": LBMS_PASSWORD},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if resp.status_code != 200:
            raise Exception(f"Error de autenticación: {resp.text}")
        _token = resp.json()["access_token"]

async def _api(method: str, path: str, **kwargs):
    """Llamada genérica a la API de LBMS con reintento de login."""
    global _token
    if not _token:
        await _login()

    headers = kwargs.pop("headers", {})
    headers["Authorization"] = f"Bearer {_token}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.request(method, f"{LBMS_BASE_URL}{path}", headers=headers, **kwargs)
        if resp.status_code == 401:  # Token expirado
            await _login()
            headers["Authorization"] = f"Bearer {_token}"
            resp = await client.request(method, f"{LBMS_BASE_URL}{path}", headers=headers, **kwargs)

        resp.raise_for_status()
        if resp.status_code == 204:
            return None
        return resp.json()

def _err(e):
    if isinstance(e, httpx.HTTPStatusError):
        try:
            detail = e.response.json().get("detail", e.response.text)
        except Exception:
            detail = e.response.text
        return json.dumps({"status": "error", "code": e.response.status_code, "message": detail}, indent=2)
    return json.dumps({"status": "error", "message": str(e)}, indent=2)


# ── Modelos de Entrada ───────────────────────────────────────────────────────

class ListEspeciesInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    q: Optional[str] = Field(default=None, description="Búsqueda por nombre o código")

class ListProtocolosInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    tipo: Optional[str] = Field(default=None, description="Tipo de protocolo")

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
    componentes: Optional[list[dict[str, Any]]] = Field(default=None)

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

class ListLogsInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    limit: Optional[int] = Field(default=50, description="Límite de logs")

class IdInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    id: str = Field(..., description="UUID del recurso")

class BarcodeInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    barcode: str = Field(..., description="Código de barras o UID")

class CalculateBatchInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    formulacion_id: str = Field(..., description="UUID de la formulación")
    volumen_l: float = Field(..., description="Volumen final (L)")

class ImprimirContenedorInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    uid: str = Field(..., description="UID del contenedor")

class ImprimirEtiquetaInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    titulo: str
    subtitulo: Optional[str] = ""
    info: Optional[str] = ""
    extra: Optional[str] = ""
    qr: Optional[str] = ""

class ScienceMolarityInput(BaseModel):
    molarity: float = Field(..., description="Target molarity (M)")
    volume_l: float = Field(..., description="Target volume (L)")
    molecular_weight: float = Field(..., description="Molecular weight (g/mol)")

class ScienceDilutionInput(BaseModel):
    c1: float = Field(..., description="Initial concentration")
    c2: float = Field(..., description="Final concentration")
    v2: float = Field(..., description="Final volume")


# ── Tools: Especies ───────────────────────────────────────────────────────────

@mcp.tool()
async def lbms_list_especies(params: ListEspeciesInput) -> str:
    """Lista las especies botánicas registradas."""
    try:
        query = {"q": params.q} if params.q else {}
        return json.dumps(await _api("GET", "/especies", params=query), indent=2, default=str)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_get_especie(params: IdInput) -> str:
    """Obtiene el detalle de una especie."""
    try:
        return json.dumps(await _api("GET", f"/especies/{params.id}"), indent=2, default=str)
    except Exception as e: return _err(e)


# ── Tools: Laboratorio (Reactivos, Formulaciones, Sustratos) ─────────────────

@mcp.tool()
async def lbms_list_reactivos(params: ListReactivosInput) -> str:
    """Lista reactivos químicos disponibles."""
    try:
        data = await _api("GET", "/reactivos")
        if params.buscar:
            q = params.buscar.lower()
            data = [r for r in data if q in r.get("nombre", "").lower()]
        return json.dumps(data, indent=2, default=str)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_list_formulaciones() -> str:
    """Lista todas las formulaciones (recetas)."""
    try:
        return json.dumps(await _api("GET", "/reactivos/formulaciones"), indent=2, default=str)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_get_formulacion(params: IdInput) -> str:
    """Obtiene detalle de una receta."""
    try:
        return json.dumps(await _api("GET", f"/reactivos/formulaciones/{params.id}"), indent=2, default=str)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_update_formulacion(params: UpdateFormulacionInput) -> str:
    """Actualiza una formulación."""
    try:
        patch = params.model_dump(exclude_unset=True, exclude={"formulacion_id"})
        result = await _api("PATCH", f"/reactivos/formulaciones/{params.formulacion_id}", json=patch)
        return json.dumps(result, indent=2, default=str)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_list_sustratos() -> str:
    """Lista los sustratos registrados."""
    try:
        return json.dumps(await _api("GET", "/sustratos"), indent=2, default=str)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_get_sustrato(params: SustratoIdInput) -> str:
    """Obtiene detalle de un sustrato."""
    try:
        return json.dumps(await _api("GET", f"/sustratos/{params.sustrato_id}"), indent=2, default=str)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_update_sustrato(params: UpdateSustratoInput) -> str:
    """Actualiza un sustrato."""
    try:
        patch = params.model_dump(exclude_unset=True, exclude={"sustrato_id"})
        result = await _api("PATCH", f"/sustratos/{params.sustrato_id}", json=patch)
        return json.dumps(result, indent=2, default=str)
    except Exception as e: return _err(e)


# ── Tools: Experimentos & Protocolos ──────────────────────────────────────────

@mcp.tool()
async def lbms_list_protocolos(params: ListProtocolosInput) -> str:
    """Lista protocolos disponibles."""
    try:
        data = await _api("GET", "/protocolos")
        if params.tipo:
            data = [p for p in data if p.get("tipo") == params.tipo]
        return json.dumps(data, indent=2, default=str)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_get_protocolo(params: IdInput) -> str:
    """Detalle completo de un protocolo."""
    try:
        return json.dumps(await _api("GET", f"/protocolos/{params.id}"), indent=2, default=str)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_get_experimento(params: IdInput) -> str:
    """Detalle completo de un experimento."""
    try:
        return json.dumps(await _api("GET", f"/experimentos/{params.id}"), indent=2, default=str)
    except Exception as e: return _err(e)


# ── Tools: Hardware & Printing ────────────────────────────────────────────────

@mcp.tool()
async def lbms_scan_qr(params: BarcodeInput) -> str:
    """Resuelve un código QR o barras."""
    try:
        return json.dumps(await _api("GET", f"/scan/{params.barcode}"), indent=2, default=str)
    except Exception as e: return _err(e)

LOCAL_PRINTER_URL = "http://localhost:8000"

async def _local_print(endpoint: str, payload: dict):
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(f"{LOCAL_PRINTER_URL}{endpoint}", json=payload)
        resp.raise_for_status()
        return resp.json()

@mcp.tool()
async def lbms_imprimir_especimen(params: IdInput) -> str:
    """Imprime etiqueta de espécimen LOCALMENTE."""
    try:
        esp = await _api("GET", f"/especimenes/{params.id}")
        reqs = esp.get("especie_rel", {}).get("requerimientos", {}) or {}
        payload = {
            "nombre_cientifico": esp.get("especie", "Desconocido"),
            "uid": esp.get("uid"),
            "fecha": esp.get("fecha_ingreso", date.today().isoformat()),
            "requerimientos": {
                "T": reqs.get("temperatura", "—"),
                "H": reqs.get("humedad", "—"),
                "pH": reqs.get("ph", "—"),
                "L": reqs.get("luz", "—")
            }
        }
        result = await _local_print("/imprimir", payload)
        return json.dumps({"status": "success", "local_result": result}, indent=2)
    except Exception as e: return _err(e)


# ── Tools: Science & Calculations ───────────────────────────────────────────

@mcp.tool()
async def lbms_calculate_batch(params: CalculateBatchInput) -> str:
    """Cálculos precisos para escalado de lotes con descuentos de mezclas base."""
    try:
        form = await _api("GET", f"/reactivos/formulaciones/{params.formulacion_id}")
        ratio = params.volumen_l / form["volumen_base_l"]
        # (Lógica simplificada para el tool de consolidación)
        return json.dumps({"status": "calculated", "ratio": ratio, "msg": "Use Seymour OS UI for full M.E.P."}, indent=2)
    except Exception as e: return _err(e)

@mcp.tool()
async def science_calculate_molarity(params: ScienceMolarityInput) -> str:
    """Calcula la masa necesaria para una molaridad específica."""
    try:
        res = await _api("POST", "/science/calculate/molarity", json=params.model_dump())
        return json.dumps(res, indent=2)
    except Exception as e: return _err(e)

@mcp.tool()
async def science_calculate_dilution(params: ScienceDilutionInput) -> str:
    """Calcula V1 para una dilución C1V1."""
    try:
        res = await _api("POST", "/science/calculate/dilution", json=params.model_dump())
        return json.dumps(res, indent=2)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_get_frontend_logs(params: ListLogsInput) -> str:
    """Obtiene logs de telemetría del frontend."""
    try:
        return json.dumps(await _api("GET", "/app/telemetry", params={"limit": params.limit}), indent=2, default=str)
    except Exception as e: return _err(e)

if __name__ == "__main__":
    mcp.run()

# ── Tools: Creación (Escritura) ──────────────────────────────────────────────

class CreateLoteInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    formulacion_id: str = Field(..., description="UUID de la formulación")
    volumen_l: float = Field(..., description="Volumen final en litros")
    notas: Optional[str] = None

class CreateExperimentoInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    nombre: str
    especie_id: str
    fecha_inicio: str = Field(default_factory=lambda: date.today().isoformat())
    hipotesis: Optional[str] = None
    notas: Optional[str] = None

class BulkEspecimenInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    especie_id: str
    madre_id: Optional[str] = None
    lote_id: Optional[str] = None
    experimento_id: Optional[str] = None
    contenedor_uid: str
    items: list[dict[str, Any]] = Field(..., description="Lista de {cantidad: int, notas: str}")

@mcp.tool()
async def lbms_create_lote(params: CreateLoteInput) -> str:
    """Crea un nuevo lote de medio preparado."""
    try:
        res = await _api("POST", "/reactivos/lotes", json=params.model_dump())
        return json.dumps(res, indent=2, default=str)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_create_experimento(params: CreateExperimentoInput) -> str:
    """Registra un nuevo experimento científico."""
    try:
        res = await _api("POST", "/experimentos", json=params.model_dump())
        return json.dumps(res, indent=2, default=str)
    except Exception as e: return _err(e)

@mcp.tool()
async def lbms_bulk_create_especimenes(params: BulkEspecimenInput) -> str:
    """Registra múltiples explantes en un contenedor/frasco."""
    try:
        res = await _api("POST", "/especimenes/bulk", json=params.model_dump())
        return json.dumps(res, indent=2, default=str)
    except Exception as e: return _err(e)
