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
         if l["uid"] == "REAC-260503-001":
            print(json.dumps(l, indent=2, ensure_ascii=False))

asyncio.run(main())
