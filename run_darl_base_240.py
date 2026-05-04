import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import lbms_calculate_batch, CalculateBatchInput

async def main():
    # Calcular para 240ml (0.24L) de la nueva receta Base Darlingtonia
    res = await lbms_calculate_batch(CalculateBatchInput(
        formulacion_id="5f55330e-6667-42da-8ea3-de3c627c0576",
        volumen_l=0.24
    ))
    print(res)

asyncio.run(main())
