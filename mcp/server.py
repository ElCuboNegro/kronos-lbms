import os
import json
from datetime import date, datetime
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
        raise Exception("Faltan credenciales LBMS_EMAIL o LBMS_PASSWORD")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{LBMS_BASE_URL}/auth/login",
            data={"username": LBMS_EMAIL, "password": LBMS_PASSWORD}
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
        return resp.json()

def _err(e):
    return json.dumps({"status": "error", "message": str(e)}, indent=2)


# ── Modelos de Entrada ───────────────────────────────────────────────────────

class ListEspeciesInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    q: Optional[str] = Field(default=None, description="Búsqueda por nombre o código")


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


class CalculateBatchInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    formulacion_id: str = Field(..., description="UUID de la formulación base")
    volumen_l: float = Field(..., description="Volumen final deseado en litros")


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
    """Lista las especies botánicas registradas en Seymour OS."""
    try:
        query = {"q": params.q} if params.q else {}
        return json.dumps(await _api("GET", "/especies", params=query),
                          indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_get_especie",
    annotations={"title": "Obtener especie", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_especie(params: IdInput) -> str:
    """Obtiene el detalle biológico, requerimientos y ficha técnica de una especie."""
    try:
        return json.dumps(await _api("GET", f"/especies/{params.id}"),
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


# ── Tools: Gestión de Experimentos & Protocolos ───────────────────────────────

@mcp.tool(
    name="lbms_list_protocolos",
    annotations={"title": "Listar protocolos", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_list_protocolos(params: ListProtocolosInput) -> str:
    """Lista los protocolos estándar disponibles para ejecución."""
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


# ── Tools: Hardware & Printing (BRIDGE MODE) ──────────────────────────────────

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


# Constante para el servicio de impresión LOCAL
LOCAL_PRINTER_URL = "http://localhost:8000"

async def _local_print(endpoint: str, payload: dict) -> dict:
    """Envía la orden al servicio de impresión que corre localmente en el laboratorio."""
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(f"{LOCAL_PRINTER_URL}{endpoint}", json=payload)
        resp.raise_for_status()
        return resp.json()


@mcp.tool(
    name="lbms_imprimir_especimen",
    annotations={"title": "Imprimir etiqueta de espécimen", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_especimen(params: IdInput) -> str:
    """Puente IA: Obtiene datos del VPS y los envía a la impresora LOCAL."""
    try:
        # 1. Obtener datos biológicos de la NUBE (VPS)
        esp_data = await _api("GET", f"/especimenes/{params.id}")

        # 2. Preparar el payload normalizado para el hardware
        # Mapeamos requerimientos si existen
        reqs = esp_data.get("especie_rel", {}).get("requerimientos", {}) or {}

        payload = {
            "nombre_cientifico": esp_data.get("especie", "Desconocido"),
            "uid": esp_data.get("uid"),
            "fecha": esp_data.get("fecha_ingreso", date.today().isoformat()),
            "requerimientos": {
                "T": reqs.get("temperatura", "—"),
                "H": reqs.get("humedad", "—"),
                "pH": reqs.get("ph", "—"),
                "L": reqs.get("luz", "—")
            }
        }

        # 3. Enviar al hardware LOCAL
        result = await _local_print("/imprimir", payload)
        return json.dumps({"status": "success", "local_result": result, "entity": payload["uid"]}, indent=2)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_imprimir_reactivo",
    annotations={"title": "Imprimir etiqueta de reactivo", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_reactivo(params: IdInput) -> str:
    """Puente IA: Obtiene datos del reactivo de la NUBE y los imprime LOCALMENTE."""
    try:
        reac = await _api("GET", f"/reactivos/{params.id}")

        # El QR debe llevar el prefijo STOCK- para que el sistema lo reconozca como reactivo
        qr_data = f"STOCK-{reac['id']}"

        # El texto visual (UID) mostrará el código de barras si existe, o los últimos 8 chars del UUID
        visual_id = reac.get("codigo_barras")
        if not visual_id:
            visual_id = f"REF-{reac['id'][:8].upper()}"

        payload = {
            "modo": "reactivo",
            "arg1": reac["nombre"],
            "arg2": qr_data,           # Esto va al QR
            "arg3": reac.get("fecha_expiracion") or "N/A",
            "extra": {
                "uid_visual": visual_id, # Nuevo campo para el texto humano
                "preparador": "Stock Puro",
                "marca": reac.get("marca") or "S/M",
                "componentes": reac.get("formula_quimica") or "N/A",
                "conc. (%)": f"{reac['pureza_pct']}%" if reac.get("pureza_pct") else "N/A",
                "peligros": reac.get("peligrosidad") or []
            }
        }
        result = await _local_print("/imprimir", payload)
        return json.dumps({"status": "success", "local_result": result}, indent=2)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_imprimir_sustrato",
    annotations={"title": "Imprimir etiqueta de sustrato", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_sustrato(params: IdInput) -> str:
    """Puente IA: Obtiene datos del sustrato de la NUBE e imprime LOCALMENTE."""
    try:
        sustrato = await _api("GET", f"/sustratos/{params.id}")
        payload = {
            "nombre": sustrato["nombre"],
            "uid": f"SUST-{sustrato['codigo_formulacion']}",
            "tipo": sustrato["tipo"].upper(),
            "ph_teorico": str(sustrato.get("ph_teorico", "N/A")),
            "ec_teorica": str(sustrato.get("conductividad_teorica", "N/A")),
            "notas": sustrato.get("descripcion", "")
        }
        result = await _local_print("/imprimir", payload)
        return json.dumps({"status": "success", "local_result": result}, indent=2)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_imprimir_lote",
    annotations={"title": "Imprimir etiqueta de lote preparado", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_lote(params: IdInput) -> str:
    """Puente IA: Obtiene datos del lote de la NUBE e imprime LOCALMENTE."""
    try:
        lote = await _api("GET", f"/reactivos/lotes/{params.id}")
        payload = {
            "nombre": lote["formulacion"]["nombre"],
            "uid": lote["uid"],
            "vencimiento": lote.get("fecha_expiracion", "N/A"),
            "preparador": lote.get("preparado_por", {}).get("nombre", "Sistema"),
            "volumen": f"{lote['volumen_l']}L",
            "concentracion": f"{lote['concentracion_x']}x",
            "componentes": "Consultar en Seymour OS",
            "peligros": []
        }
        result = await _local_print("/imprimir", payload)
        return json.dumps({"status": "success", "local_result": result}, indent=2)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_imprimir_contenedor",
    annotations={"title": "Imprimir etiqueta de contenedor", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_contenedor(params: ImprimirContenedorInput) -> str:
    """Puente IA: Imprime etiqueta de contenedor LOCALMENTE con datos de la NUBE."""
    try:
        payload = {
            "uid": params.uid,
            "especie": "Consulta Seymour OS",
            "cantidad": "Múltiple",
            "fecha_ingreso": date.today().isoformat(),
            "componentes": "Inventario dinámico"
        }
        result = await _local_print("/imprimir", payload)
        return json.dumps({"status": "success", "local_result": result}, indent=2)
    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_imprimir_etiqueta_libre",
    annotations={"title": "Imprimir etiqueta libre", "readOnlyHint": False, "destructiveHint": False}
)
async def lbms_imprimir_etiqueta_libre(params: ImprimirEtiquetaInput) -> str:
    """Envía una orden de impresión con campos libres a la impresora LOCAL."""
    try:
        payload = {
            "titulo": params.titulo,
            "subtitulo": params.subtitulo,
            "info": params.info,
            "extra": params.extra,
            "qr": params.qr
        }
        result = await _local_print("/imprimir", payload)
        return json.dumps({"status": "success", "local_result": result}, indent=2)
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



@mcp.tool(
    name="lbms_calculate_batch",
    annotations={"title": "Calcular escalado de lote", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_calculate_batch(params: CalculateBatchInput) -> str:
    """Calcula las cantidades precisas de reactivos para un volumen específico,
    verificando cada ID de reactivo para detectar componentes pre-mezclados y
    descontarlos de los suplementos (Sacarosa/Agar).
    """
    try:
        # 1. Obtener formulación base
        form = await _api("GET", f"/reactivos/formulaciones/{params.formulacion_id}")
        ratio = params.volumen_l / form["volumen_base_l"]

        # Variables de control
        ingredientes_finales = []
        descuentos = {"Sacarosa": 0.0, "Agar": 0.0}
        volumen_stocks_ml = 0.0

        # 2. Primera pasada: Identificar pre-mezclas (Reactivos ID check)
        for comp in form["componentes"]:
            reac = comp.get("reactivo")
            if reac:
                notas = (reac.get("notas") or "").upper()
                cant_escalada = comp["cantidad_base"] * ratio

                # Detección de MS Mixto (basado en ficha técnica)
                if "SACAROSA" in notas and "AGAR" in notas:
                    descuentos["Sacarosa"] += cant_escalada * 0.7186
                    descuentos["Agar"] += cant_escalada * 0.1677

        # 3. Segunda pasada: Calcular cantidades finales con descuentos y stocks
        for comp in form["componentes"]:
            cant_escalada = comp["cantidad_base"] * ratio
            nombre = ""
            reac_id = ""
            unidad = "g"

            reac = comp.get("reactivo")
            ing = comp.get("formulacion_ingrediente")

            if reac:
                nombre = reac["nombre"]
                reac_id = reac["id"]
                unidad = reac["unidad_medida"]
            elif ing:
                nombre = ing["nombre"]
                reac_id = ing["id"]
                unidad = ing.get("unidad_medida", "ml")
            else:
                continue

            # Aplicar descuentos si es suplemento puro
            if nombre == "Sacarosa" and descuentos["Sacarosa"] > 0:
                original = cant_escalada
                cant_escalada = max(0, cant_escalada - descuentos["Sacarosa"])
                notas_calc = f"Suplemento extra (Descontados {descuentos['Sacarosa']:.2f}g presentes en el polvo base)"
            elif "Agar" in nombre and descuentos["Agar"] > 0:
                original = cant_escalada
                cant_escalada = max(0, cant_escalada - descuentos["Agar"])
                # Aplicar el ajuste de compensación por dilución líquida (+10% si hay stocks)
                notas_calc = f"Suplemento extra (Descontados {descuentos['Agar']:.2f}g presentes en el polvo base)"
            else:
                notas_calc = "Cantidad escalada estándar"

            if unidad == "ml":
                volumen_stocks_ml += cant_escalada

            ingredientes_finales.append({
                "id": reac_id,
                "nombre": nombre,
                "cantidad": round(cant_escalada, 3),
                "unidad": unidad,
                "nota_calculo": notas_calc
            })

        # 4. Cálculo de Agua Destilada (Desplazamiento)
        agua_destilada_ml = (params.volumen_l * 1000) - volumen_stocks_ml

        return json.dumps({
            "formulacion": form["nombre"],
            "volumen_objetivo_l": params.volumen_l,
            "mise_en_place": ingredientes_finales,
            "preparacion": {
                "agua_destilada_ml": round(agua_destilada_ml, 2),
                "volumen_total_stocks_ml": round(volumen_stocks_ml, 2),
                "ph_objetivo": "5.7 - 5.8",
                "instrucciones": [
                    f"1. Disolver los componentes sólidos en {agua_destilada_ml:.1f} ml de agua.",
                    "2. Ajustar pH antes de esterilizar.",
                    "3. Si hay componentes sensibles (antibióticos), añadir tras enfriar a <45°C."
                ]
            }
        }, indent=2, ensure_ascii=False)

    except Exception as e:
        return _err(e)


@mcp.tool(
    name="lbms_get_technical_advice",
    annotations={"title": "Asesoría Técnica Científica", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_technical_advice(params: IdInput) -> str:
    """Analiza una formulación o lote y devuelve recomendaciones técnicas de preparación y riesgos químicos."""
    try:
        # 1. Obtener detalles de la formulación
        form = await _api("GET", f"/reactivos/formulaciones/{params.id}")

        insights = []
        warnings = []

        # Heurística 1: Volumen de Stocks
        vol_total = form.get("volumen_base_l", 1.0)
        vol_stocks = 0
        sensibles = []

        for comp in form.get("componentes", []):
            if comp.get("reactivo_id"):
                nombre = comp["reactivo"]["nombre"].upper()
                # Detección de termolábiles
                if any(x in nombre for x in ["AMOX", "CLOTRI", "BAP", "ANA", "GIB", "ZEAT", "VIT"]):
                    sensibles.append(comp["reactivo"]["nombre"])

                # Cálculo de volumen líquido (si es ml)
                if comp["reactivo"].get("unidad_medida") == "ml":
                    vol_stocks += comp["cantidad_base"]

        # Alerta de dilución
        pct_stock = (vol_stocks / (vol_total * 1000)) * 100
        if pct_stock > 1.5:
            warnings.append(f"ALERTA VOLUMÉTRICA: Los componentes líquidos representan el {pct_stock:.2f}% del medio. Esto puede ablandar el Agar. Se recomienda aumentar el Agar en un 10% para compensar.")

        if sensibles:
            insights.append(f"COMPONENTES SENSIBLES DETECTADOS: {', '.join(sensibles)}. Recuerda: No autoclavar si el pH es extremo o añadir después del ciclo de calor si son termolábiles.")

        if "AMOX" in str(sensibles).upper():
            insights.append("TIP BACTERICIDA: La Amoxicilina es altamente sensible al calor. Añadir exclusivamente por filtración 0.22µm cuando el medio esté a < 45°C.")

        if not warnings and not insights:
            insights.append("La formulación parece estándar y equilibrada para procesos generales.")

        return json.dumps({
            "formulación": form["nombre"],
            "diagnostico": {
                "porcentaje_liquido_stocks": f"{pct_stock:.2f}%",
                "ingredientes_criticos": sensibles
            },
            "recomendaciones": insights,
            "alertas_criticas": warnings
        }, indent=2, ensure_ascii=False)

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
