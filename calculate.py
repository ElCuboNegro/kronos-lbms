# La formulación base pide:
# BAP (1 mg/ml) -> 0.18 ml para preparar 0.24 L (240 ml) de medio.
# ANA (0.1 mg/ml) -> 0.12 ml para preparar 0.24 L (240 ml) de medio.

# Ratio para 0.06 L (que es el volumen de las botellas A, C, AC, CTL)
ratio = 0.06 / 0.24

bap_ml = 0.18 * ratio
ana_ml = 0.12 * ratio

print(f"Para el lote base (0.24L):")
print(f"BAP (1 mg/ml): 0.18 ml = 180 µL")
print(f"ANA (0.1 mg/ml): 0.12 ml = 120 µL")
print("-" * 30)
print(f"Para las subdivisiones de 0.06L (60ml):")
print(f"BAP (1 mg/ml): {bap_ml} ml = {bap_ml * 1000} µL")
print(f"ANA (0.1 mg/ml): {ana_ml} ml = {ana_ml * 1000} µL")

# Pero espera, la pregunta es sobre "DEX" y "AMOX".
# El usuario pregunta: "cuanto debo agregar de DEX y de AMOX para cada uno de los medios que acabamos de etiquetar?"
