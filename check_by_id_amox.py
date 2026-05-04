import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    # Looking for Amoxicilina stock
    reactivos = await _api("GET", "/reactivos")
    for r in reactivos:
        if "AMOX" in r["nombre"].upper():
            print(json.dumps(r, indent=2, ensure_ascii=False))

asyncio.run(main())
