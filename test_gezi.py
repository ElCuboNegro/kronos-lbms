from PIL import Image, ImageDraw
import qrcode

width = 399
height = 239
fold_y = 119

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

# TEXT FRONT
draw.text((10, 10), "KRONOS", fill=0)

# FOLD
draw.rectangle([0, fold_y - 2, width, fold_y + 2], fill=0)

# BACK
back_img = Image.new('L', (width, fold_y), color=255)
back_draw = ImageDraw.Draw(back_img)
back_draw.text((10, 10), "HOLA", fill=0)

qr = qrcode.QRCode(box_size=5, border=0)
qr.add_data("UID:123")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
qr_px = fold_y - 4
qr_res = qr_img.resize((qr_px, qr_px))
back_img.paste(qr_res, (width - qr_px - 4, 2))

back_img = back_img.rotate(180)
img.paste(back_img, (0, fold_y + 2))
img = img.rotate(180)

# save to view
img.save("test_gezi.png")
