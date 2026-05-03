import qrcode
from PIL import Image, ImageDraw
import math

DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

print(f"Height: {height}, Fold: {fold_y}")

qr = qrcode.QRCode(box_size=4, border=0)
qr.add_data("UID:DARL-260428-061326-01")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
qr_px = int(16 * MM_TO_PX)
print(f"QR size 16mm: {qr_px} px")

qr_res = qr_img.resize((qr_px, qr_px))

back_img = Image.new('L', (width, fold_y), color=255)
paste_y = (fold_y - qr_px) // 2
print(f"Paste Y: {paste_y}")

back_img.paste(qr_res, (width - qr_px - 4, paste_y))
back_img.save("test_qr.png")
