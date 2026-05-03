from PIL import Image

width = 399
height = 239

img = Image.new('L', (width, height), color=255)

img = img.rotate(180, expand=False, fillcolor=255)

bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')

import numpy as np
arr = np.array(bw_img)
print("Black pixels in empty image:", np.sum(arr))
