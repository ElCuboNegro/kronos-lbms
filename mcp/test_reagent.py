from printer_service.main import LabelEngine, LabelRequest

req = LabelRequest(
    modo="reactivo",
    arg1="Lote Experimental AC (Mixto)",
    arg2="REAC-260503-001-AC",
    arg3="2026-06-03",
    extra={
        "preparador": "Usuario LBMS",
        "volumen": "0.06L (x1.0)",
        "conc. (%)": "1.0x",
        "componentes": "BASE: Inducción Darlingtonia \n+ 1.2mL Amox (Stock) \n+ 120µL Clotrimazol (Stock)",
        "formulado": "2026-05-03",
        "peligros": ["irritante", "toxico"]
    }
)
eng = LabelEngine()
img = eng.create_label_image(req)
img.save("reagent_test2.png")
print("Saved")
