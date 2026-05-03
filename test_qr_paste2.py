from PIL import Image, ImageDraw
import qrcode
DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

# ETIQUETA DOBLABLE (Especímenes)
draw.text((10, 10), "KRONOS BIOLABS SAS", fill=0)
y = 10 + 20
draw.text((10, y), "Darlingtonia", fill=0)
draw.text((10, fold_y - 40), f"ID: 123", fill=0)
draw.text((10, fold_y - 22), f"F: 2026-05-03", fill=0)

draw.rectangle([0, fold_y - 2, width, fold_y + 2], fill=0)

qr_px = int(17 * MM_TO_PX) # 1.7cm (70% larger than 10mm) -> 135px
back_h = max(height - fold_y - 2, qr_px) # max(239 - 119 - 2 = 118, 135) = 135px
back_img = Image.new('L', (width, back_h), color=255)
back_draw = ImageDraw.Draw(back_img)

qr = qrcode.QRCode(box_size=5, border=1)
qr.add_data(f"UID:123")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
qr_res = qr_img.resize((qr_px, qr_px))
back_img.paste(qr_res, (width - qr_px - 2, 0))

# Rotar y pegar
back_img = back_img.rotate(180)
# ¡¡AQUI ESTA EL ERROR!! Si back_h (135) es mayor que (height - fold_y) (119), al pegar en (0, height - back_h) (0, 104)
# estaremos SOBREESCRIBIENDO la parte superior de la etiqueta antes del pliegue!!
# Y ademas, estara fuera del limite del reverso.
print(f"Paste Y: {height - back_h}")
