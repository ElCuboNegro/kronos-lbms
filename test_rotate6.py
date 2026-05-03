from PIL import Image, ImageDraw
import qrcode
import numpy as np

DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

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

# Here is the BUG!
# Pillow rotate without `expand=True` does NOT resize. But that's fine here because sizes are symmetric.
# But wait! If you don't specify fillcolor in rotate(), is it really white?
back_img_rot = back_img.rotate(180, fillcolor=255)
img.paste(back_img_rot, (0, height - fold_y))

img_rot = img.rotate(180, fillcolor=255)

bw_img = img_rot.point(lambda x: 0 if x > 128 else 1, mode='1')

arr = np.array(bw_img)
print(f"Total pixels: {arr.size}")
print(f"Black pixels: {np.sum(arr)}")
print(f"White pixels: {arr.size - np.sum(arr)}")
