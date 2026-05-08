import asyncio
import json
import sys
from server import (
    lbms_list_reactivos, ListReactivosInput,
    lbms_list_formulaciones,
    lbms_update_formulacion, UpdateFormulacionInput
)

async def main():
    # 1. Buscar Amoxacilina y Clotrimazol
    print("1. Buscando reactivos...")
    amox_res = await lbms_list_reactivos(ListReactivosInput(buscar="Amoxacilina"))
    clotri_res = await lbms_list_reactivos(ListReactivosInput(buscar="Clotrimazol"))

    amox = json.loads(amox_res)
    clotri = json.loads(clotri_res)

    print(f"Amoxacilina: {[(r['id'], r['nombre']) for r in amox]}")
    print(f"Clotrimazol: {[(r['id'], r['nombre']) for r in clotri]}")

    # 2. Listar formulaciones
    print("\n2. Listando formulaciones...")
    form_res = await lbms_list_formulaciones()
    formulaciones = json.loads(form_res)

    target_names = ["Amox", "Clotri", "Amox + Clotri", "Control"]
    targets = []

    for f in formulaciones:
        if any(t in f['nombre'] for t in target_names):
            targets.append(f)
            print(f"Encontrada: {f['nombre']} (ID: {f['id']})")

    # 3 & 4. Reducir Agar-Agar en 15% y actualizar
    print("\n3 & 4. Actualizando cantidades de Agar-Agar...")
    report = []
    for f in targets:
        componentes = f.get('componentes', [])
        new_componentes = []
        updated = False

        for c in componentes:
            # Re-build component dictionary for update
            comp_data = {
                "cantidad_base": c["cantidad_base"]
            }
            if c.get("reactivo"):
                comp_data["reactivo_id"] = c["reactivo"]["id"]
            elif c.get("formulacion_ingrediente"):
                comp_data["formulacion_ingrediente_id"] = c["formulacion_ingrediente"]["id"]

            # Check if it's Agar-Agar
            name = ""
            if c.get("reactivo"):
                name = c["reactivo"].get("nombre", "").lower()
            elif c.get("formulacion_ingrediente"):
                name = c["formulacion_ingrediente"].get("nombre", "").lower()

            if "agar" in name:
                old_qty = c["cantidad_base"]
                new_qty = round(old_qty * 0.85, 4) # Reduce by 15%
                comp_data["cantidad_base"] = new_qty
                updated = True
                report.append(f"- {f['nombre']}: Agar reducido de {old_qty} a {new_qty}")

            new_componentes.append(comp_data)

        if updated:
            print(f"Actualizando {f['nombre']}...")
            update_res = await lbms_update_formulacion(UpdateFormulacionInput(
                formulacion_id=f['id'],
                componentes=new_componentes
            ))
            print(f"Resultado: {update_res[:50]}...")

    # 5. Reporte
    print("\n5. Reporte de cambios:")
    for r in report:
        print(r)

if __name__ == "__main__":
    asyncio.run(main())
