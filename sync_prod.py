import json
import urllib.request
import urllib.parse
import getpass

API_BASE = "https://lbms.kronosb.com/api"
ESPECIE_ID = "d815c9e0-7fbd-4420-8256-11af5e1a6e51"

print("--- Sincronización a Producción (lbms.kronosb.com) ---")
email = input("Email de tu usuario Admin: ")
password = getpass.getpass("Contraseña: ")

# 1. Login
try:
    data = urllib.parse.urlencode({"username": email, "password": password}).encode("utf-8")
    req = urllib.request.Request(f"{API_BASE}/auth/login", data=data)
    with urllib.request.urlopen(req) as res:
        token = json.loads(res.read().decode())["access_token"]
except Exception as e:
    print("❌ Error de login. Verifica tus credenciales.")
    exit(1)

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# 2. Crear Protocolo Adaptado a Concentraciones Locales
protocolo_payload = {
    "nombre": "Propagación in vitro de Cotyledon tomentosa (Garrita de oso)",
    "tipo": "propagacion_in_vitro",
    "version": "1.1",
    "descripcion": "Protocolo de desinfección química y siembra in vitro para Cotyledon tomentosa extraído de video de referencia y adaptado a los stocks del laboratorio.",
    "pasos": [
        {"orden": 1, "titulo": "Preparación de Medio (Adaptado)", "descripcion": "Preparar 'Medio MS Basal (1x) Completo' a 41.47 g/L (ya incluye sacarosa y agar). Para Multiplicación: añadir 1 a 2 ml/L de 'Solución Stock BAP (1 mg/ml)'. Para Enraizamiento: añadir 0.5 a 1 ml/L de 'Solución Stock ANA (1 mg/ml)'. Ajustar pH a 5.8 y esterilizar (116°C x 30min)."},
        {"orden": 2, "titulo": "Selección y prelavado", "descripcion": "Cortar esquejes sanos. Lavar con agua corriente y jabón para remover suciedad superficial."},
        {"orden": 3, "titulo": "Desinfección química", "descripcion": "En campana de flujo laminar: Sumergir en lejía al 10% + 1 gota de Tween 20 durante 10 a 15 minutos."},
        {"orden": 4, "titulo": "Enjuague", "descripcion": "Realizar 3 lavados consecutivos con agua destilada estéril."},
        {"orden": 5, "titulo": "Corte e Inoculación", "descripcion": "Cortar con bisturí estéril los bordes oxidados/quemados por el cloro y sembrar en el medio preparado en el paso 1. Sellar frasco."}
    ],
    "materiales": ["Medio MS Basal (1x) Completo", "Solución Stock BAP (1 mg/ml)", "Solución Stock ANA (1 mg/ml)", "Agua corriente", "Jabón", "Lejía (10%)", "Tween 20", "Agua destilada estéril", "Bisturí"],
    "estado_validacion": "borrador"
}

try:
    req = urllib.request.Request(f"{API_BASE}/protocolos", data=json.dumps(protocolo_payload).encode("utf-8"), headers=headers, method="POST")
    with urllib.request.urlopen(req) as res:
        print("✅ Protocolo de Cotyledon (v1.1) creado en producción con medidas exactas!")
except Exception as e:
    print("❌ Error creando protocolo:", e.read().decode() if hasattr(e, 'read') else str(e))

# 3. Actualizar Especie
try:
    req = urllib.request.Request(f"{API_BASE}/especies/{ESPECIE_ID}", headers=headers)
    with urllib.request.urlopen(req) as res:
        esp_data = json.loads(res.read().decode())

    config = esp_data.get("config_estandar") or {}
    config.update({
        "temperatura_c": 23.5,
        "ph_sustrato": 5.8,
        "luz_lux": 10000,
        "notas_ambientales": "Fotoperiodo 16h luz (LED espectro completo)"
    })

    req = urllib.request.Request(f"{API_BASE}/especies/{ESPECIE_ID}", data=json.dumps({"config_estandar": config}).encode("utf-8"), headers=headers, method="PATCH")
    with urllib.request.urlopen(req) as res:
        print("✅ Ficha de Cotyledon tomentosa actualizada en producción!")
except Exception as e:
    print("❌ Error actualizando especie:", e.read().decode() if hasattr(e, 'read') else str(e))
