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
         if "IBU" in l["uid"] or "IBU" in l["formulacion"]["nombre"].upper() or "IBU" in (l.get("notas") or "").upper():
            print(json.dumps(l, indent=2, ensure_ascii=False))

asyncio.run(main())
