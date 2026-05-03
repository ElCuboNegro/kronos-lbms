from PIL import Image

width = 399
height = 239
fold_y = 119

img = Image.new('L', (width, height), color=255)
back_img = Image.new('L', (width, fold_y), color=255)

qr_px = fold_y - 4
qr_img = Image.new('L', (qr_px, qr_px), color=0)
back_img.paste(qr_img, (width - qr_px - 4, 2))

back_img = back_img.rotate(180, fillcolor=255) # Add explicit fillcolor
img.paste(back_img, (0, fold_y + 2))

img = img.rotate(180, fillcolor=255) # Also here!

img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
img.save("gezi_out2.png")
import numpy as np
arr = np.array(img)
print('Total black pixels with explicit fillcolor 255:', np.sum(arr == 0))

# Wait, if we use img.point(lambda x: 0 if x > 128 else 1, mode='1')
# For PIL mode '1', 0 means black, 1 means white.
# Wait! In TSPL `BITMAP` command: 1 is black, 0 is white.
# If `img.point(lambda x: 0 if x > 128 else 1, mode='1')` creates a mode '1' image.
# When calling `tobytes()`, does it map 1 to 1 and 0 to 0?
# In PIL mode '1', True (1) is usually white (255) and False (0) is black (0) for display.
# But `point` changes values: x > 128 -> 0. x <= 128 -> 1.
# So white (255) becomes 0. Black (0) becomes 1.
# THEN `tobytes()` packs these 0s and 1s into bytes.
