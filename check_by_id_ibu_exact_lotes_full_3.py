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
         if "SOLUCIÓN" in l["formulacion"]["nombre"].upper() and "STOCK" in l["formulacion"]["nombre"].upper():
            print(f"- {l['uid']} | {l['formulacion']['nombre']} | ID: {l['id']}")

asyncio.run(main())
