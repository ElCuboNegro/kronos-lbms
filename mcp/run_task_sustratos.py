import asyncio
import json
from server import lbms_list_sustratos

async def main():
    print("Sustratos:")
    res = await lbms_list_sustratos()
    sustratos = json.loads(res)
    for s in sustratos:
        print(f"\nSustrato: {s['nombre']} (ID: {s['id']})")
        for c in s.get('componentes', []):
            if c.get('reactivo'):
                print(f"  - Reactivo: {c['reactivo']['nombre']} ({c['cantidad_base']})")
            elif c.get('formulacion'):
                print(f"  - Formulacion: {c['formulacion']['nombre']} ({c['cantidad_base']})")
            elif c.get('sustrato_ingrediente'):
                print(f"  - Sustrato Ingrediente: {c['sustrato_ingrediente']['nombre']} ({c['cantidad_base']})")
            else:
                print(f"  - Otro: {c}")

if __name__ == "__main__":
    asyncio.run(main())
