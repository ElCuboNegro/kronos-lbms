import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    # Search for any label or reagent that contains "IBU" or "Alcalino"
    reactivos = await _api("GET", "/reactivos")
    for r in reactivos:
        if "IBU" in r["nombre"].upper() or "ALCALINO" in r["nombre"].upper():
            print("REAC:")
            print(json.dumps(r, indent=2, ensure_ascii=False))

    lotes = await _api("GET", "/reactivos/lotes")
    for l in lotes:
        if "IBU" in l["uid"] or "IBU" in l["formulacion"]["nombre"].upper() or "ALCALINO" in l["formulacion"]["nombre"].upper():
            print("LOTE:")
            print(json.dumps(l, indent=2, ensure_ascii=False))

asyncio.run(main())
