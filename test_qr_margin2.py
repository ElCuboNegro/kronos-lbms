import qrcode
import numpy as np

qr = qrcode.QRCode(box_size=1, border=0)
qr.add_data("UID:123")
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white").convert('L')
arr = np.array(img)
# Is the first column all white?
print("First column sum:", np.sum(arr[:, 0]))
print("Is it all white?", np.all(arr[:, 0] == 255))
