import qrcode
qr = qrcode.QRCode(box_size=1, border=0)
qr.add_data("UID:DARL-260428-061326-01")
qr.make(fit=True)
img = qr.make_image()
print(img.size)
