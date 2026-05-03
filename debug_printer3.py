import usb.core
import usb.util
from PIL import Image, ImageDraw
import qrcode

VENDOR_ID = 0x0483
PRODUCT_ID = 0x5720
dev = usb.core.find(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)
dev.set_configuration()
cfg = dev.get_active_configuration()
ep = usb.util.find_descriptor(cfg[(0,0)], custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT)

width = 399
height = 239
fold_y = height // 2

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

# LÍNEA DE DOBLADO
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
img.paste(qr_res, (3, 8))

back_img = back_img.rotate(180, fillcolor=255)
img.paste(back_img, (0, fold_y + 2))

img = img.rotate(180, fillcolor=255)

# TEST 3: Original conversion logic that WORKED for Sphagnum
# 0 if x > 128 else 1
bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
raw_data = bw_img.tobytes()

width_bytes = (img.width + 7) // 8
header = f"SIZE 50 mm, 30 mm\r\nGAP 2 mm, 0\r\nDIRECTION 1\r\nCLS\r\nBITMAP 0,0,{width_bytes},{img.height},0,".encode()
footer = b"\r\nPRINT 1\r\n"

ep.write(header + raw_data + footer)
usb.util.dispose_resources(dev)
print("Enviado test basico 3 (Rotate 180 fillcolor=255 + point 0:1)")
