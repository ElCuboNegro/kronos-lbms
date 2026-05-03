from PIL import Image, ImageDraw

width = 399
height = 239
fold_y = 119

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)
draw.rectangle([0, fold_y - 2, width, fold_y + 2], fill=0)

back_img = Image.new('L', (width, fold_y), color=255)
back_draw = ImageDraw.Draw(back_img)
back_draw.text((10, 10), "HOLA", fill=0)

back_img = back_img.rotate(180)
# This was my latest code:
img.paste(back_img, (0, fold_y + 2))
img = img.rotate(180)

# Check colors
print("Top left (should be white):", img.getpixel((0,0)))
# If we have a black line at the bottom?
print("Bottom left (should be white):", img.getpixel((0, height-1)))

bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
raw = bw_img.tobytes()
print("Raw length:", len(raw))

import numpy as np
arr = np.array(bw_img)
print("Black pixels:", np.sum(arr))
