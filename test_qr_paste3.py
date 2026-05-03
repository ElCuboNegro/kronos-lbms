from PIL import Image, ImageDraw
import qrcode
DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

# El QR maximo es fold_y - 2 (117 pixeles), que equivale a 117 / 8 = 14.6 milimetros.
# Si intentamos hacerlo mas grande que la mitad de la etiqueta, tendria que sobresalir
# por los bordes fisicos o superponerse a la otra cara.
# Vamos a fijarlo en el tamano maximo exacto: 14.5mm
qr_px = fold_y - 2
print(f"Max qr_px: {qr_px}")
