import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    reactivos = await _api("GET", "/reactivos")
    print("BUSCANDO IBU...")
    for r in reactivos:
        if "IBU" in r["nombre"].upper() or "IBUPROFENO" in r["nombre"].upper():
            print(f"- ID: {r['id']} | Nombre: {r['nombre']} | Conc: {r.get('concentracion_gl')} g/L")

asyncio.run(main())
