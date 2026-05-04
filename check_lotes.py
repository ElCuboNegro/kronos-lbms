import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    lotes = await _api("GET", "/reactivos/lotes")
    print("LOTES PREPARADOS (BATCHES):")
    for l in lotes:
        nombre = l["formulacion"]["nombre"]
        if any(x in nombre.upper() for x in ["ANA", "IBU", "BAP"]):
            print(f"- ID: {l['id']} | Nombre: {nombre} | Conc: {l['concentracion_x']}x | Vol: {l['volumen_l']}L")

asyncio.run(main())
