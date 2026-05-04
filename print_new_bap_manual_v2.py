import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _local_print

async def main():
    # 1. Obtener el lote de la lista
    lotes = await _api("GET", "/reactivos/lotes")
    lote = next((l for l in lotes if l["id"] == "7d0263c5-e552-458e-b631-2c4bb4278f5d"), None)

    if not lote:
        print("Lote no encontrado")
        return

    # 2. Formatear payload exacto para LabelRequest (Pydantic model)
    payload = {
        "modo": "reactivo",
        "arg1": lote["formulacion"]["nombre"],
        "arg2": lote["uid"],
        "arg3": lote.get("fecha_expiracion")[:10] if lote.get("fecha_expiracion") else "N/A",
        "extra": {
            "preparador": lote.get("preparado_por_nombre", "Sistema"),
            "volumen": f"{lote['volumen_l']}L",
            "conc. (%)": f"{lote['concentracion_x']}x",
            "formulado": lote.get("fecha_preparacion")[:10],
            "componentes": "BAP 1mg/ml (NaOH disolved)",
            "peligros": ["irritante"]
        }
    }

    # 3. Imprimir
    res = await _local_print("/imprimir", payload)
    print(res)

asyncio.run(main())
