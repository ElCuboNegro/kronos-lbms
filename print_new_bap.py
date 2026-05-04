import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import lbms_imprimir_lote, ImprimirIdInput

async def main():
    # ID del lote recién creado: 7d0263c5-e552-458e-b631-2c4bb4278f5d
    res = await lbms_imprimir_lote(ImprimirIdInput(id="7d0263c5-e552-458e-b631-2c4bb4278f5d"))
    print(res)

asyncio.run(main())
