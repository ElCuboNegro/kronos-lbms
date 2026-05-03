from PIL import Image

width = 399
height = 239

img = Image.new('L', (width, height), color=255)
# Make a black block
import ImageDraw
draw = ImageDraw.Draw(img)
draw.rectangle([0,0,10,10], fill=0)

# Convert to 1 bit
bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')

import numpy as np
# the numpy array for a '1' mode image: 0 is False (black visually), 1 is True (white visually).
arr = np.array(bw_img)
print("Unique in bw:", np.unique(arr))
# The sum of True pixels (1)
print("Sum of 1s:", np.sum(arr == True))
print("Sum of 0s:", np.sum(arr == False))

raw = bw_img.tobytes()
print("Raw data sum:", sum(raw))
