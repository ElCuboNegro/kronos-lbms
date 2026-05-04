import asyncio
import sys
import os
import httpx
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _local_print

async def main():
    # Obtener el lote de la lista (ya que no hay GET individual)
    lotes = await _api("GET", "/reactivos/lotes")
    lote = next((l for l in lotes if l["id"] == "7d0263c5-e552-458e-b631-2c4bb4278f5d"), None)

    if not lote:
        print("Lote no encontrado en la lista")
        return

    payload = {
        "nombre": lote["formulacion"]["nombre"],
        "uid": lote["uid"],
        "vencimiento": lote.get("fecha_expiracion", "N/A"),
        "preparador": lote.get("preparado_por_nombre", "Sistema"),
        "volumen": f"{lote['volumen_l']}L",
        "concentracion": f"{lote['concentracion_x']}x",
        "componentes": "BAP 1mg/ml (NaOH disolved)",
        "peligros": ["irritante"]
    }

    res = await _local_print("/imprimir", payload)
    print(res)

asyncio.run(main())
