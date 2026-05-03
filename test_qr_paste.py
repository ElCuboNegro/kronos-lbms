import qrcode
from PIL import Image, ImageDraw

DPI = 203
MM_TO_PX = DPI / 25.4

width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

print(f"Full H: {height}, fold_y: {fold_y}")
qr_px = int(17 * MM_TO_PX) # 1.7cm (70% larger than 10mm)
back_h = max(height - fold_y - 2, qr_px)

print(f"back_h: {back_h}, qr_px: {qr_px}")

back_img = Image.new('L', (width, back_h), color=255)
qr = qrcode.QRCode(box_size=5, border=1)
qr.add_data("UID:123")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
qr_res = qr_img.resize((qr_px, qr_px))
back_img.paste(qr_res, (width - qr_px - 2, 0))

# Rotation 180
back_img = back_img.rotate(180)

img = Image.new('L', (width, height), color=200)
img.paste(back_img, (0, height - back_h))
img.save("test_qr_final.png")
print(f"img size: {img.size}")
