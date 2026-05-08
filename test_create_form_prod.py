import urllib.request, urllib.parse, json, getpass

API_BASE = "https://lbms.kronosb.com/api"

print("--- Crear Formulación MS para Cotyledon ---")
email = input("Email Admin: ")
password = getpass.getpass("Contraseña: ")

try:
    data = urllib.parse.urlencode({"username": email, "password": password}).encode("utf-8")
    req = urllib.request.Request(f"{API_BASE}/auth/login", data=data)
    with urllib.request.urlopen(req) as res:
        token = json.loads(res.read().decode())["access_token"]
except Exception as e:
    print("❌ Error login")
    exit(1)

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# 1. Obtener IDs de las formulaciones existentes para anidarlas
try:
    req = urllib.request.Request(f"{API_BASE}/reactivos/formulaciones", headers=headers)
    with urllib.request.urlopen(req) as res:
        forms = json.loads(res.read().decode())

        ms_basal = next((f for f in forms if "MS Basal" in f["nombre"]), None)
        bap_stock = next((f for f in forms if "BAP" in f["nombre"] and "1 mg/ml" in f["nombre"]), None)
        ana_stock = next((f for f in forms if "ANA" in f["nombre"] and "1 mg/ml" in f["nombre"]), None)
except Exception as e:
    print("Error obteniendo formulaciones")
    exit(1)

# 2. Crear la nueva "Receta" (Formulacion anidando otras formulaciones)
nueva_receta = {
    "nombre": "Medio MS Modificado para Cotyledon tomentosa",
    "codigo_referencia": "MS-CTY-01",
    "descripcion": "Medio MS Basal suplementado específico para propagación in vitro de Garrita de Oso según protocolo de video.",
    "procedimiento": "Mezclar el Medio MS Basal con las concentraciones de stock de BAP o ANA según la fase deseada (multiplicación o enraizamiento). Ajustar pH a 5.8 estricto y esterilizar a 116°C por 30 mins.",
    "volumen_base_l": 1.0,
    "caducidad_dias": 30,
    "componentes": [
        {
            "formulacion_ingrediente_id": ms_basal["id"] if ms_basal else None,
            "cantidad_base": 1.0,
            "notas_pesaje": "1 Litro de Medio Basal completo (que ya incluye 30g Sacarosa y 7g Agar)"
        },
        {
            "formulacion_ingrediente_id": bap_stock["id"] if bap_stock else None,
            "cantidad_base": 1.5,
            "notas_pesaje": "Añadir 1 a 2 ml para fase de multiplicación."
        },
        {
            "formulacion_ingrediente_id": ana_stock["id"] if ana_stock else None,
            "cantidad_base": 0.5,
            "notas_pesaje": "Añadir 0.5 a 1 ml en lugar de BAP si se desea fase de enraizamiento."
        }
    ]
}

# Filtrar nulos si faltan en DB
nueva_receta["componentes"] = [c for c in nueva_receta["componentes"] if c["formulacion_ingrediente_id"] is not None]

try:
    req = urllib.request.Request(f"{API_BASE}/reactivos/formulaciones", data=json.dumps(nueva_receta).encode("utf-8"), headers=headers, method="POST")
    with urllib.request.urlopen(req) as res:
        print("✅ Receta (Formulación) CREADA en producción!")
except Exception as e:
    print("❌ Error:", e.read().decode() if hasattr(e, 'read') else str(e))
