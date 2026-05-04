# Formulación F38EE831: Inducción de Callosidad (Dosis Bajas) - Darlingtonia
# Volumen base = 0.24L (240ml)

# Reactivos (ingredientes directos en polvo/volumen base):
# cbe83383 (MS Basal) = 0.35
# 2eb9bd52 (Sacarosa) = 5.6
# 3a3c7699 (Agar-Agar) = 1.68

# Formulaciones agregadas:
# 9545776f (BAP 1 mg/ml) = 0.18 ml por cada 240ml de base
# fb101065 (ANA 0.1 mg/ml) = 0.12 ml por cada 240ml de base

# El lote base se dividió en 4 frascos de 60ml (0.06L) cada uno.
# - A: Medio + BAP
# - C: Medio + Clotrimazol
# - AC: Medio + BAP + Clotrimazol
# - CTL: Control (Solo MS, sin hormonas ni antibioticos)

print("==== CÁLCULO DE FORMULACIÓN ====")
print("LOTE A (60 ml): Requiere BAP")
print(f"BAP (1 mg/ml): {0.18 / 4} ml = {(0.18 / 4) * 1000} uL")
print(f"ANA (0.1 mg/ml): {0.12 / 4} ml = {(0.12 / 4) * 1000} uL (Segun la base, ANA se asume constante en todos menos control? La receta de la BD solo tiene ANA y BAP base)")
print("Pero espera, la bitácora dice: 'cuanto debo agregar de DEX y de AMOX'.")
