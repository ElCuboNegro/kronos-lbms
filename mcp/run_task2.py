import asyncio
import json
from server import lbms_list_reactivos, ListReactivosInput, lbms_list_formulaciones

async def main():
    print("Reactivos con 'Amox' o 'Clot':")
    res = await lbms_list_reactivos(ListReactivosInput())
    reactivos = json.loads(res)
    for r in reactivos:
        if 'amox' in r['nombre'].lower() or 'clot' in r['nombre'].lower():
            print(f"- {r['nombre']} (ID: {r['id']})")

    print("\nFormulaciones:")
    form_res = await lbms_list_formulaciones()
    formulaciones = json.loads(form_res)
    for f in formulaciones:
        print(f"\nFormulacion: {f['nombre']} (ID: {f['id']})")
        for c in f.get('componentes', []):
            if c.get('reactivo'):
                print(f"  - Reactivo: {c['reactivo']['nombre']} ({c['cantidad_base']})")
            elif c.get('formulacion_ingrediente'):
                print(f"  - Ingrediente (Formulacion): {c['formulacion_ingrediente']['nombre']} ({c['cantidad_base']})")
            else:
                print(f"  - Otro: {c}")

if __name__ == "__main__":
    asyncio.run(main())
