from PIL import Image

# If I point() an image, mode='1', 0 is black, 1 is white.
# Is that what GEZI wants?
# In TSPL BITMAP command: 1 is black, 0 is white.
img = Image.new('L', (399, 239), color=0) # Black image
bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
import numpy as np
arr = np.array(bw_img)
print("Point of black image:", np.sum(arr))

img = Image.new('L', (399, 239), color=255) # White image
bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
arr = np.array(bw_img)
print("Point of white image:", np.sum(arr))

# Let's test the flip. If the user said "todo negro y dejaste un espacio en blanco de casi medio centimetro en el lado inferior"
# That means almost everything is 1s, but there is a chunk of 0s.
# Why would there be a chunk of 0s?
# Look at img.paste(back_img, (0, self.fold_y + 2))
# fold_y + 2 = 121
# back_img height = 119
# Paste from 121 to 240 (which is past 239).
# What happens to the space between `fold_y` (119) and `fold_y + 2` (121)?
# draw.rectangle([0, fold_y - 2, width, fold_y + 2], fill=0) -> this is black.
