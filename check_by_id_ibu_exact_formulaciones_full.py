import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    forms = await _api("GET", "/reactivos/formulaciones")
    for f in forms:
         print(f"- {f['id']} | {f['nombre']}")

asyncio.run(main())
