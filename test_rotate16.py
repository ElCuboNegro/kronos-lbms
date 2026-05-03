from PIL import Image

width = 399
height = 239
fold_y = 119

img = Image.new('L', (width, height), color=255)
back_img = Image.new('L', (width, fold_y), color=255)

# If we don't specify fillcolor in rotate, it uses black in Pillow < 5.2.0.
# We checked we are on Pillow 12.0.0. BUT...
# If we rotate by 180, it rotates around the center.
# Let's save the image locally to inspect it exactly as the printer sees it.

qr_px = fold_y - 4
qr_img = Image.new('L', (qr_px, qr_px), color=0)
back_img.paste(qr_img, (width - qr_px - 4, 2))

back_img = back_img.rotate(180)
img.paste(back_img, (0, fold_y + 2))

# Convert to 1 bit to mimic GEZI
img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
img.save("gezi_out.png")
print("Image saved to gezi_out.png")
