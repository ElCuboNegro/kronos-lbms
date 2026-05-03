from PIL import Image, ImageDraw

width = 399
height = 239
fold_y = height // 2

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

# QR
qr_px = fold_y - 4
qr_res = Image.new('L', (qr_px, qr_px), color=0)
img.paste(qr_res, (2, 2))

# LÍNEA DE DOBLADO
draw.rectangle([0, fold_y - 2, width, fold_y + 2], fill=0)

# MITAD INFERIOR (REVERSO)
back_img = Image.new('L', (width, fold_y), color=255)
back_draw = ImageDraw.Draw(back_img)

back_img = back_img.rotate(180)
# THIS is the bug! `img.paste(back_img, (0, self.fold_y + 2))`
# Wait, self.fold_y + 2 = 121. Height is 239.
# The size of back_img is `fold_y` which is 119.
# 121 + 119 = 240. It overflows by 1 pixel.
# In PIL, `paste` does NOT crop the pasted image, it crops the bounding box.
img.paste(back_img, (0, fold_y + 2))

# Rotación final
img = img.rotate(180)

# The default behavior of Image.rotate(180) without expand=True or fillcolor
# It rotates. In PIL 12, fillcolor defaults to 0 (black).
# In `test_rotate3.py` I checked `getpixel((0,0))` on a 399x119 image rotated, and it was 255.
# But wait! Look at my `test_rotate16.py` and `test_rotate17.py`:
# The image `gezi_out.png` was 80%+ black!
# Let's save `img` before convert to 1-bit and see.
img.save("test_invert_final.png")
