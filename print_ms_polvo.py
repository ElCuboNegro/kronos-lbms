import asyncio
import sys
import os
sys.path.insert(0, os.path.abspath('mcp'))
from server import lbms_imprimir_reactivo, ImprimirIdInput

async def main():
    # ID del reactivo: MS Basal medium con sacarosa y agar (Polvo)
    res = await lbms_imprimir_reactivo(ImprimirIdInput(id="cbe83383-5736-425b-b54a-de0bb4a65c7e"))
    print(res)

asyncio.run(main())
