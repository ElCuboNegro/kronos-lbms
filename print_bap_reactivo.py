import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import lbms_imprimir_reactivo, ImprimirIdInput

async def main():
    # ID del reactivo puro "BAP (6-Benzylaminopurine)" - 71e19d23-ee4e-48ff-8696-20a17bd4b8ac
    res = await lbms_imprimir_reactivo(ImprimirIdInput(id="71e19d23-ee4e-48ff-8696-20a17bd4b8ac"))
    print(res)

asyncio.run(main())
