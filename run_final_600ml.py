import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import lbms_calculate_batch, CalculateBatchInput

async def main():
    # 1. MATRAZ A: Inducción de Callosidad (Para 5 frascos de 75ml = 375ml = 0.375L)
    # Formulación: f38ee831-92de-4a85-b2fc-f9a0e2b4b368
    res_a = await lbms_calculate_batch(CalculateBatchInput(
        formulacion_id="f38ee831-92de-4a85-b2fc-f9a0e2b4b368",
        volumen_l=0.375
    ))

    # 2. MATRAZ B: Meristemos (Para 3 frascos de 75ml = 225ml = 0.225L)
    # Formulación: c1e29af2-c40f-4410-94db-71ee5a95fc45
    res_b = await lbms_calculate_batch(CalculateBatchInput(
        formulacion_id="c1e29af2-c40f-4410-94db-71ee5a95fc45",
        volumen_l=0.225
    ))

    print("--- RESULTADO MATRAZ A (CALLOSIDAD) ---")
    print(res_a)
    print("\n--- RESULTADO MATRAZ B (MERISTEMOS) ---")
    print(res_b)

asyncio.run(main())
