import sys
import os
import re

with open("mcp/server.py", "r") as f:
    content = f.read()

# Lógica recursiva para aplastar componentes
recursive_logic = """
async def _flatten_components(form_id, ratio, api_func):
    form = await api_func("GET", f"/reactivos/formulaciones/{form_id}")
    flattened = []
    for comp in form.get("componentes", []):
        cant_escalada = comp["cantidad_base"] * ratio
        if comp.get("formulacion_ingrediente_id") and not comp.get("reactivo"):
            # Es una sub-formulación, entramos recursivamente
            sub_ratio = cant_escalada / 1.0 # Basado en volumen_base_l = 1.0 por defecto
            sub_comps = await _flatten_components(comp["formulacion_ingrediente_id"], sub_ratio, api_func)
            flattened.extend(sub_comps)
        else:
            flattened.append({
                "reactivo": comp.get("reactivo"),
                "ingrediente": comp.get("formulacion_ingrediente"),
                "cantidad": cant_escalada
            })
    return flattened
"""

# Insertamos la función y actualizamos lbms_calculate_batch
content = content.replace("async def lbms_calculate_batch(params: CalculateBatchInput) -> str:",
                         recursive_logic + "\\n@mcp.tool(\\n    name=\\"lbms_calculate_batch\\",\\n    annotations={\\"title\\": \\"Calcular escalado de lote\\", \\"readOnlyHint\\": True, \\"destructiveHint\\": False}\\n)\\nasync def lbms_calculate_batch(params: CalculateBatchInput) -> str:")

with open("mcp/server.py", "w") as f:
    f.write(content)
