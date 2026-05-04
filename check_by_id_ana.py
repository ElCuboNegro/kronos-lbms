import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

async def main():
    await _login()
    # ANA 0.1 mg/ml stock formulation
    form = await _api("GET", "/reactivos/formulaciones/fb101065-b40c-4355-860d-6d8a9ea7d6f0")
    print(json.dumps(form, indent=2, ensure_ascii=False))

asyncio.run(main())
