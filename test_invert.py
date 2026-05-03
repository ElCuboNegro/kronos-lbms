from PIL import Image

width = 399
height = 239

# 1) Image is created as WHITE (255)
img = Image.new('L', (width, height), color=255)

# 2) Point operation
# For pixels > 128 (white), return 0.
# For pixels <= 128 (black text/QR), return 1.
# mode='1' means 1-bit pixels.
bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')

# 3) Convert to bytes
raw = bw_img.tobytes()

import numpy as np
# Let's count how many 1s and 0s are in the bits
# Since it's tobytes(), each byte has 8 bits.
# If the image was originally WHITE, it should now be 0. So raw should be all 0 bytes.
print("Raw data length:", len(raw))
print("Sum of all bytes (should be 0 if white is mapped to 0):", sum(raw))

# Wait, what if TSPL "BITMAP 0,0,x,y,0"
# Mode '0' in TSPL BITMAP means "Overwriting mode".
# Let's check TSPL manual for BITMAP command.
# BITMAP X,Y,width,height,mode,bitmap_data
# mode:
# 0: OVERWRITE
# 1: OR
# 2: XOR
# bitmap_data: "The bitmap data is a raw byte sequence. Each bit represents a pixel. 1 is black, 0 is white."
