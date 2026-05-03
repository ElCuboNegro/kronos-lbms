import qrcode
from PIL import Image

DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

qr = qrcode.QRCode(box_size=5, border=1)
qr.add_data("UID:DARL-260428-061326-01")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
qr_px = fold_y - 2 # Leave 2 pixels for the fold line margin
qr_res = qr_img.resize((qr_px, qr_px))

back_img = Image.new('L', (width, fold_y), color=255)
back_img.paste(qr_res, (width - qr_px - 2, 1))
print("QR maxed out successfully")
