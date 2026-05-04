import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import lbms_calculate_batch, CalculateBatchInput

async def main():
    # Matraz A: 375ml (0.375L) de Inducción Darlingtonia
    res_a = await lbms_calculate_batch(CalculateBatchInput(formulacion_id="f38ee831-92de-4a85-b2fc-f9a0e2b4b368", volumen_l=0.375))
    print("MATRAZ A (CALLOSIDAD - 375ml):")
    print(res_a)

    # Matraz B: 225ml (0.225L) de Meristemos (Usando la base de 1/3 MS Meristemos c1e29af2)
    res_b = await lbms_calculate_batch(CalculateBatchInput(formulacion_id="c1e29af2-c40f-4410-94db-71ee5a95fc45", volumen_l=0.225))
    print("\nMATRAZ B (MERISTEMOS - 225ml):")
    print(res_b)

asyncio.run(main())
