import asyncio
import sys
import os
import json
sys.path.insert(0, os.path.abspath('mcp'))
from server import lbms_calculate_batch, CalculateBatchInput

async def main():
    print("Calculando para 400ml (0.4 L) vía MCP...\n")

    # 1. Inducción de Callosidad (f38ee831)
    res_a = await lbms_calculate_batch(CalculateBatchInput(formulacion_id="f38ee831-92de-4a85-b2fc-f9a0e2b4b368", volumen_l=0.4))
    print("--- RECETA 1: CALLOSIDAD ---")
    print(res_a)

    # 2. Meristemos (c1e29af2)
    res_b = await lbms_calculate_batch(CalculateBatchInput(formulacion_id="c1e29af2-c40f-4410-94db-71ee5a95fc45", volumen_l=0.4))
    print("\n--- RECETA 2: MERISTEMOS ---")
    print(res_b)

asyncio.run(main())
