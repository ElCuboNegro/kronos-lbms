import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import lbms_imprimir_lote, ImprimirIdInput

async def main():
    # ID del lote "Solución Stock BAP (1 mg/ml)" - REAC-260501-01
    # Found previously in the DB queries
    res = await lbms_imprimir_lote(ImprimirIdInput(id="50702275-dabc-4f63-90be-8c736f1d94ca"))
    print(res)

asyncio.run(main())
