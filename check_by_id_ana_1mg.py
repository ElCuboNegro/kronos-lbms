import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    # ANA 1 mg/ml stock formulation
    form = await _api("GET", "/reactivos/formulaciones/764a390f-0839-46b9-929a-cdd4255a5e32")
    print(json.dumps(form, indent=2, ensure_ascii=False))

asyncio.run(main())
