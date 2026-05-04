import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    # Check "Solución Stock BAP (Altamente Alcalina)" - 5e58fa9e-e811-4a45-9fce-355c80b71b04
    form = await _api("GET", "/reactivos/formulaciones/5e58fa9e-e811-4a45-9fce-355c80b71b04")
    print(json.dumps(form, indent=2, ensure_ascii=False))

asyncio.run(main())
