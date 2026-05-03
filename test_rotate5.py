from PIL import Image, ImageDraw
import qrcode

DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

img = Image.new('1', (width, height), color=1) # 1 is white in 1-bit? No, let's stick to L
img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

# LÍNEA DE DOBLADO
draw.rectangle([0, fold_y - 2, width, fold_y + 2], fill=0)

back_img = Image.new('L', (width, fold_y), color=255)
back_draw = ImageDraw.Draw(back_img)

qr = qrcode.QRCode(box_size=5, border=0)
qr.add_data("UID:123")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
qr_px = fold_y - 4
qr_res = qr_img.resize((qr_px, qr_px))
back_img.paste(qr_res, (width - qr_px - 4, 2))

# Here is the rotation!
back_img = back_img.rotate(180)
# Paste it on the bottom
img.paste(back_img, (0, fold_y + 2))

# Final rotation
img = img.rotate(180)

# Convert to bw
bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')

import numpy as np
# Let's check how many pixels are 1 (black) in bw_img
arr = np.array(bw_img)
print(f"Total pixels: {arr.size}")
print(f"Black pixels: {np.sum(arr)}")
print(f"White pixels: {arr.size - np.sum(arr)}")
