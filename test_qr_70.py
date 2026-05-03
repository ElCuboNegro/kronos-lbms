from PIL import Image, ImageDraw
import qrcode
import textwrap

DPI = 203
MM_TO_PX = DPI / 25.4

width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

# QR 70% larger than 10mm -> 17mm
qr_px = int(17 * MM_TO_PX)
print(f"QR size: {qr_px} pixels")

qr = qrcode.QRCode(box_size=5, border=1)
qr.add_data("UID:DARL-260428-061326-01")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
qr_res = qr_img.resize((qr_px, qr_px))

back_h = max(height - fold_y - 2, qr_px)
back_img = Image.new('L', (width, back_h), color=255)

# Paste QR
back_img.paste(qr_res, (width - qr_px - 2, 0))

print("Back image size:", back_img.size)
