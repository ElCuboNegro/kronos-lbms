import re

with open("mcp/server.py", "r") as f:
    content = f.read()

# Definir la nueva herramienta de Insights Científicos
new_tool = """
@mcp.tool(
    name="lbms_get_technical_advice",
    annotations={"title": "Asesoría Técnica Científica", "readOnlyHint": True, "destructiveHint": False}
)
async def lbms_get_technical_advice(params: IdInput) -> str:
    \"\"\"Analiza una formulación o lote y devuelve recomendaciones técnicas de preparación y riesgos químicos.\"\"\"
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
"""

# Insertar antes del entry point
content = content.replace("# ── Entry point", new_tool + "\n\n# ── Entry point")

with open("mcp/server.py", "w") as f:
    f.write(content)
print("Tool added")
