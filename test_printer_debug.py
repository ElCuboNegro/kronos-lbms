import usb.core
import usb.util
from PIL import Image, ImageDraw
import qrcode

VENDOR_ID = 0x0483
PRODUCT_ID = 0x5720

dev = usb.core.find(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)
if dev is None:
    print("No GEZI")
    exit(1)

dev.set_configuration()
cfg = dev.get_active_configuration()
intf = cfg[(0,0)]
ep = usb.util.find_descriptor(intf, custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT)

print("Imprimiendo test...")

DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

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

# Convert to 1 bit
bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
raw_data = bw_img.tobytes()

width_bytes = (img.width + 7) // 8
header = f"SIZE 50 mm, 30 mm\r\nGAP 2 mm, 0\r\nDIRECTION 1\r\nCLS\r\nBITMAP 0,0,{width_bytes},{img.height},0,".encode()
footer = b"\r\nPRINT 1\r\n"

full_command = header + raw_data + footer
ep.write(full_command)
usb.util.dispose_resources(dev)
print("Done")
