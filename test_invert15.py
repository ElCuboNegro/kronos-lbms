from PIL import Image

width = 399
height = 239

img = Image.new('L', (width, height), color=255)
# In mode L, 255 is white.
img = img.point(lambda x: 1 if x > 128 else 0, mode='1')

import numpy as np
arr = np.array(img)
print("Black pixels (0s) when white is mapped to 1:", np.sum(arr == False))
print("White pixels (1s) when white is mapped to 1:", np.sum(arr == True))

raw = img.tobytes()
print("Raw data length:", len(raw))
print("Sum of all bytes (white mapped to 1):", sum(raw))
