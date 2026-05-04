import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import lbms_calculate_batch, CalculateBatchInput

async def main():
    # El usuario quiere 8 frascos en total (240ml totales -> 30ml por frasco)
    # Distribución:
    # 2 frascos Callosidad + Clotri (30ml * 2 = 60ml = 0.06L)
    # 3 frascos Callosidad + Clotri + Amox (30ml * 3 = 90ml = 0.09L)
    # Matraz A (Callosidad): 0.06 + 0.09 = 0.15L

    # 3 frascos Meristemos (30ml * 3 = 90ml = 0.09L)
    # Matraz B (Meristemos): 0.09L

    res_a = await lbms_calculate_batch(CalculateBatchInput(
        formulacion_id="f38ee831-92de-4a85-b2fc-f9a0e2b4b368",
        volumen_l=0.15
    ))

    res_b = await lbms_calculate_batch(CalculateBatchInput(
        formulacion_id="c1e29af2-c40f-4410-94db-71ee5a95fc45",
        volumen_l=0.09
    ))

    print("--- RESULTADO MATRAZ A (CALLOSIDAD - 150ml) ---")
    print(res_a)
    print("\n--- RESULTADO MATRAZ B (MERISTEMOS - 90ml) ---")
    print(res_b)

asyncio.run(main())
