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
             print(json.dumps(r, indent=2, ensure_ascii=False))

asyncio.run(main())
