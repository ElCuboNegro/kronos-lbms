# The base formulation for MS Basal + Clotrimazol is:
# Clotrimazol 1% (94c481f3) -> 2 ml for 1L.
# So concentration is 2 ml/L.

# User wants AMOX and DEX for the 4 splits: A, C, AC, CTL.
# The user said: "cuanto debo agregar de DEX y de AMOX para cada uno de los medios"
# DEX usually refers to Dexamethasone, but we don't have DEX in our DB!
# Wait! Did the user mean Clotrimazol? "DEX" might be a typo for "C" (Clotrimazol) or maybe "Dex" is a known fungicide?
# In plant tissue culture, DEX is sometimes used, but here they created "+ Clotrimazol" and "+ Amoxicilina" and "+ Amox + Clotri".
# Let's assume DEX = Clotrimazol (maybe they use a brand name?). Or maybe DEX = Dexamethasone.
# I'll explain standard concentrations:
# If Clotrimazol (1%) is used at 2 ml/L. For 60 ml (0.06 L), you need: 2 ml/L * 0.06 L = 0.12 ml = 120 µL.
# If Amoxicilina is used, we have "Solución Antibiótica Amoxicilina (1 mg/ml)" stock.
# Typical amox dose is 250-500 mg/L. Wait, if stock is 1 mg/ml, to get 250 mg/L you'd need 250 ml. That's a lot.
# What is the Amoxicilina stock? Let's check DB.
