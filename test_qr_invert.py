import qrcode
from PIL import Image, ImageDraw

# Create small QR
qr = qrcode.QRCode(box_size=5, border=1)
qr.add_data("UID:123")
qr.make(fit=True)
# Ensure we make the QR with standard colors (black on white)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
print("QR img mode:", qr_img.mode)
# If we rotate it, what happens to empty space?
rot = qr_img.rotate(180, fillcolor=255) # Oh! Default fill color is 0 (black)!
print("Rotated with default fill:", qr_img.rotate(180).getpixel((0,0)))
print("Rotated with 255 fill:", qr_img.rotate(180, fillcolor=255).getpixel((0,0)))
