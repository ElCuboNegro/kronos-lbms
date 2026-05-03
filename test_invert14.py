from PIL import Image, ImageDraw

width = 399
height = 239

img = Image.new('L', (width, height), color=255)
# If I use fill=0 for text, it's black text on white background.
# Then I use point(lambda x: 0 if x > 128 else 1, mode='1')
# White (255) -> 0. Black (0) -> 1.
# But wait! I checked `raw1[0]` before and it was `0b11111111` for a BLACK block (0).
# So 1 is black, 0 is white.
# Is it possible that `qr_make_image(fill_color="black", back_color="white")` produces something that gets inverted differently?
import qrcode
qr = qrcode.QRCode(box_size=5, border=1)
qr.add_data("UID:123")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
qr_px = 103
qr_res = qr_img.resize((qr_px, qr_px))
img.paste(qr_res, (8, 8))

# Let's save `img` before convert
img.save("test_invert_final.png")

bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')

import numpy as np
# Let's see how many pixels are 1 (black)
arr = np.array(bw_img)
print("Black pixels (1s):", np.sum(arr == True))
print("White pixels (0s):", np.sum(arr == False))
