import asyncio
import os
from server import _local_print

async def main():
    os.environ["LBMS_EMAIL"] = "jalban.arq@gmail.com"
    os.environ["LBMS_PASSWORD"] = "Kronos2026"

    payload_a = {
        "modo": "reactivo",
        "arg1": "Lote Experimental A (Amox)",
        "arg2": "REAC-260503-001-A",
        "arg3": "2026-06-03",
        "extra": {
            "preparador": "Usuario LBMS",
            "volumen": "0.06L (x1.0)",
            "conc. (%)": "1.0x",
            "componentes": "BASE: Inducción Darlingtonia (Dosis Bajas) \n+ 1.2mL Amoxicilina (Stock 1mg/ml)",
            "formulado": "2026-05-03",
            "peligros": ["irritante"]
        }
    }

    payload_c = {
        "modo": "reactivo",
        "arg1": "Lote Experimental C (Clotri)",
        "arg2": "REAC-260503-001-C",
        "arg3": "2026-06-03",
        "extra": {
            "preparador": "Usuario LBMS",
            "volumen": "0.06L (x1.0)",
            "conc. (%)": "1.0x",
            "componentes": "BASE: Inducción Darlingtonia (Dosis Bajas) \n+ 120µL Clotrimazol (Stock 1%)",
            "formulado": "2026-05-03",
            "peligros": ["irritante", "toxico"]
        }
    }

    payload_ac = {
        "modo": "reactivo",
        "arg1": "Lote Experimental AC (Mixto)",
        "arg2": "REAC-260503-001-AC",
        "arg3": "2026-06-03",
        "extra": {
            "preparador": "Usuario LBMS",
            "volumen": "0.06L (x1.0)",
            "conc. (%)": "1.0x",
            "componentes": "BASE: Inducción Darlingtonia \n+ 1.2mL Amox (Stock) \n+ 120µL Clotrimazol (Stock)",
            "formulado": "2026-05-03",
            "peligros": ["irritante", "toxico"]
        }
    }

    print("A:", await _local_print("/imprimir", payload_a))
    await asyncio.sleep(2)
    print("C:", await _local_print("/imprimir", payload_c))
    await asyncio.sleep(2)
    print("AC:", await _local_print("/imprimir", payload_ac))

if __name__ == "__main__":
    asyncio.run(main())
