# Amoxicilina es "Solución Antibiótica Amoxicilina (1 mg/ml)"
# El usuario dice: "+amox, control... etc"
# En la orden que imprimimos: "REAC-260503-001-A" era Medio + BAP. Wait, "A" stands for AMOX?
# El usuario dijo: "las etiquetas de los medios que tengo que preparar (+amox, control... etc)"
# Ah! A = Amox! C = Control! AC = Amox + Clotrimazol?
# Let's see the payload I used for printing!
# payload1 = "arg2": "REAC-260503-001-A", "extra": {"componentes": "MS Basal, Sacarosa, Agar, BAP", "peligros": ["irritante"]}  (Wait, I said BAP!).
# Wait, if "A" means Amox, and "C" means Clotrimazol...
# Let's check the formulation 'Inducción de Callosidad (Dosis Bajas) - Darlingtonia'
print("Revisemos la dosis de Amox en protocolos...")
