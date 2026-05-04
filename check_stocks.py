import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    reactivos = await _api("GET", "/reactivos")
    print("REACIVOS EN STOCK:")
    for r in reactivos:
        if any(x in r["nombre"].upper() for x in ["ANA", "IBU", "BAP"]):
            print(f"- ID: {r['id']} | Nombre: {r['nombre']} | Conc: {r.get('concentracion_gl')} g/L | Notas: {r.get('notas')}")

asyncio.run(main())
