import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    formulaciones = await _api("GET", "/reactivos/formulaciones")
    print("FORMULACIONES:")
    for f in formulaciones:
        if "Darlingtonia" in f.get("nombre", "") or "MS" in f.get("nombre", ""):
            print(json.dumps(f, indent=2, ensure_ascii=False))

    reactivos = await _api("GET", "/reactivos")
    print("\nREACTIVOS:")
    for r in reactivos:
        if "MS" in r.get("nombre", "") or "Murashige" in r.get("nombre", ""):
            print(json.dumps(r, indent=2, ensure_ascii=False))

asyncio.run(main())
