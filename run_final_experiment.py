import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import lbms_calculate_batch, CalculateBatchInput

async def main():
    # 1. Receta Experimental MIX (Clotri + Amox) - ID: e81e3ec8
    res = await lbms_calculate_batch(CalculateBatchInput(
        formulacion_id="e81e3ec8-80df-4981-9a35-de6a75d19785",
        volumen_l=0.24
    ))
    print(res)

asyncio.run(main())
