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
fold_y = 119

# CUAL ES LA FORMA ORIGINAL?
# Cuando la etiqueta Sphagnum (Grande) se imprimio BIEN, ¿Qué codigo habia?
# Yo habia hecho:
# img.point(lambda x: 0 if x > 128 else 1, mode='1')
# Y se imprimio bien!
# Y cuando hice la Darlingtonia, la mitad inferior quedaba vacía.
# ¿Por que? Porque yo habia usado `img.paste` con una rotación mal calculada.

# Vamos a hacer una prueba super minimalista:
img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)
draw.text((10, 10), "TEST 1: KRONOS", fill=0)

bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
raw_data = bw_img.tobytes()

width_bytes = (img.width + 7) // 8
header = f"SIZE 50 mm, 30 mm\r\nGAP 2 mm, 0\r\nDIRECTION 1\r\nCLS\r\nBITMAP 0,0,{width_bytes},{img.height},0,".encode()
footer = b"\r\nPRINT 1\r\n"

ep.write(header + raw_data + footer)
usb.util.dispose_resources(dev)
print("Enviado test basico")
