import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    lotes = await _api("GET", "/reactivos/lotes")
    for l in lotes:
         if "ANA" in l["formulacion"]["nombre"].upper() and "STOCK" in l["formulacion"]["nombre"].upper():
            print(f"- ID: {l['id']} | UID: {l['uid']} | Nombre: {l['formulacion']['nombre']} | Vol: {l['volumen_l']}L | Estado: {l['estado']} | Creado: {l['fecha_preparacion']}")

asyncio.run(main())
