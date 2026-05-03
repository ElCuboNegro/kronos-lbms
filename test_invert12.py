from PIL import Image

# Wait!
# bw1 = img.point(lambda x: 0 if x > 128 else 1, mode='1')
# For x = 255 (white), x > 128 -> returns 0.
# So all white pixels become 0.
# My black line (x = 0) becomes 1.
# So `raw1[0]` covers the first 8 pixels, which are ALL BLACK (1).
# So `raw1[0]` should be 11111111 = 255.
# And `raw1[1]` should be 00000000 = 0.
# YES! This means 1 is black, 0 is white.

# But the user said: "imprimiste en negro con letras y QR blanco, como si hubieras invertido colores"
# This means the PRINTER interpreted 1 as WHITE and 0 as BLACK!
# Or maybe the command mode 0 means "OVERWRITE", but the printer expects `1 is white, 0 is black`?
# NO. Some ESC/POS printers or clones have BITMAP inverted!
# Let's just invert the logic to `1 if x > 128 else 0`.
