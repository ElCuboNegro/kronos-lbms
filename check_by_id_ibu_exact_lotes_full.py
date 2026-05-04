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
         print(f"- {l['uid']} | {l['formulacion']['nombre']}")

asyncio.run(main())
