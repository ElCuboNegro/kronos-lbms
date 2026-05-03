from PIL import Image, ImageDraw
import qrcode
import textwrap

DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

# Top-half: 0 to fold_y (119).
# User says: "muevelo 3 pixeles a la derecha, elimina el margen izquierdo."
# Originally I had `qr = qrcode.QRCode(box_size=5, border=1)`.
# `border=1` creates a 1-module margin INSIDE the QR image (the "Quiet Zone").
# So even if we paste it at x=0, there's a white border.
# The user wants to paste it at x=3.
# Wait, "elimina el margen izquierdo": this probably means `border=0`!
# Let's set `border=0`.
qr = qrcode.QRCode(box_size=5, border=0)
qr.add_data("UID:DARL-1234567")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
# Now, since border=0, there's NO white padding.
# The user wants it moved 3 pixels to the right.
# Let's paste at (3, 8) instead of (8, 8).
# Wait, if we use border=0, the QR code modules touch the exact edge of the image!
