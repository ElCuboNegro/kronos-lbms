from PIL import Image
import numpy as np

img = Image.new('L', (400, 240), color=255)
# Draw a black line at top left
for x in range(8):
    img.putpixel((x, 0), 0)

bw1 = img.point(lambda x: 0 if x > 128 else 1, mode='1')
raw1 = bw1.tobytes()
print("raw1 byte 0:", bin(raw1[0]))

bw2 = img.point(lambda x: 1 if x > 128 else 0, mode='1')
raw2 = bw2.tobytes()
print("raw2 byte 0:", bin(raw2[0]))
