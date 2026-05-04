import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    reactivos = await _api("GET", "/reactivos")
    print("ALL REAGENTS:")
    for r in reactivos:
         print(f"- {r['nombre']} (ID: {r['id']})")

asyncio.run(main())
