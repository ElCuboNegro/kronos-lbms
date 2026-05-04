import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    # Let's see if there is any reagent with IBU at the end of the list
    reacs = await _api("GET", "/reactivos")
    print(f"Total reactivos: {len(reacs)}")
    for r in reacs:
         if "IBU" in r["nombre"].upper():
             print(r["nombre"])

asyncio.run(main())
