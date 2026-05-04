import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import lbms_calculate_batch, CalculateBatchInput

async def main():
    # 240ml exclusivamente para Inducción de Callosidad
    res = await lbms_calculate_batch(CalculateBatchInput(
        formulacion_id="f38ee831-92de-4a85-b2fc-f9a0e2b4b368",
        volumen_l=0.24
    ))

    print("--- RESULTADO MATRAZ ÚNICO (CALLOSIDAD - 240ml) ---")
    print(res)

asyncio.run(main())
