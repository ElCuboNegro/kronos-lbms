import asyncio
import sys
import os
import json
import uuid
sys.path.insert(0, os.path.abspath('mcp'))
from server import _api, _login

os.environ["LBMS_EMAIL"] = "jalban.arq@gmail.com"
os.environ["LBMS_PASSWORD"] = "Kronos2026"

async def test():
    await _login()

    forms = await _api("GET", "/reactivos/formulaciones")
    target = next((f for f in forms if f["codigo_referencia"] == "EXP-DARL-MIX"), None)

    if not target:
        print("ERROR: No se encontró la receta EXP-DARL-MIX")
        return

    print(f"Probando aplanamiento para: {target['nombre']} ({target['id']})")
    flat = await _api("GET", f"/reactivos/formulaciones/{target['id']}/flatten")

    # Validaciones reales basadas en los nombres exactos en la DB
    has_ms = any("MS Basal" in (c["reactivo"]["nombre"] if c["reactivo"] else "") for c in flat)
    has_cytokinin = any(("BA" in (c["reactivo"]["nombre"] if c["reactivo"] else "")) or
                        ("BAP" in (c["reactivo"]["nombre"] if c["reactivo"] else "")) for c in flat)
    has_clotri = any("Clotrimazol" in (c["reactivo"]["nombre"] if c["reactivo"] else "") for c in flat)

    if has_ms and has_cytokinin and has_clotri:
        print("\n✅ TEST INTEGRACIÓN EXITOSO: La recursividad resolvió todos los niveles.")
        print(f"   (Componentes totales aplanados: {len(flat)})")
    else:
        print("\n❌ TEST INTEGRACIÓN FALLIDO")
        if not has_ms: print("   - Falta MS Basal")
        if not has_cytokinin: print("   - Falta BAP/BA")
        if not has_clotri: print("   - Falta Clotrimazol")

if __name__ == "__main__":
    asyncio.run(test())
