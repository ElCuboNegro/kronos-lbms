from PIL import Image, ImageDraw
import qrcode
DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

# ETIQUETA DOBLABLE (Especímenes)
draw.text((10, 10), "KRONOS BIOLABS SAS", fill=0)

draw.rectangle([0, fold_y - 2, width, fold_y + 2], fill=0)

back_img = Image.new('L', (width, fold_y), color=255)
back_draw = ImageDraw.Draw(back_img)

qr = qrcode.QRCode(box_size=5, border=0)
qr.add_data(f"UID:123")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
qr_px = fold_y - 4
qr_res = qr_img.resize((qr_px, qr_px))
back_img.paste(qr_res, (width - qr_px - 4, 2))

print("Color of back_img before rotate:", back_img.getpixel((0,0)))
back_img = back_img.rotate(180)
print("Color of back_img after rotate:", back_img.getpixel((0,0)))

img.paste(back_img, (0, fold_y + 2))
print("Color of final img (top left):", img.getpixel((0,0)))
print("Color of final img (bottom left, after paste):", img.getpixel((0, height - 1)))

img = img.rotate(180)
print("Color of final img after final rotate (top left):", img.getpixel((0,0)))
print("Color of final img after final rotate (bottom left):", img.getpixel((0, height - 1)))

# If color is 0, it means it's black!
