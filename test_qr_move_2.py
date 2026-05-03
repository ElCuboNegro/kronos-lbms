from PIL import Image, ImageDraw
import qrcode

DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

# We used `qr_px = self.fold_y - 16`
# fold_y = 119
# qr_px = 119 - 16 = 103 pixels.
# The user says: "estas cortando el QR a la mitad del cuadrado grande. mueve el QR a la derecha sin modificar el margen de la etiqueta"
# The "cuadrado grande" is the Finder Pattern of the QR code (the big square in the corner).
# If the finder pattern is cut in half, it means `x=3` is not far enough to the right to escape the printer's unprintable margin!
# Wait, if x=3 is cutting the QR in half, how many pixels is the unprintable margin?
# The square in the corner is 7 modules wide.
# Let's say box_size=5, but we resize it to 103px.
# How many modules is the QR code?
qr = qrcode.QRCode(box_size=1, border=0)
qr.add_data("UID:DARL-260428-061326-01")
qr.make(fit=True)
img_raw = qr.make_image(fill_color="black", back_color="white")
print("QR modules:", img_raw.size)

# If it's 29 modules, 103px / 29 = 3.55 px per module.
# The finder pattern is 7 modules wide -> 7 * 3.55 = 24.8 pixels.
# If it's cut in HALF, it means about 12 pixels are being cropped by the printer!
# So we need to move it at least 15 pixels to the right.
# Let's use `x = 18` (about 2mm).
# We also need to move the text further to the right.
