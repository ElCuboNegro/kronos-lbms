from PIL import Image

width = 399
height = 239

img = Image.new('L', (width, height), color=255)
# In my `test_new_layout.py` I had this line:
# img = img.point(lambda x: 0 if x > 128 else 1, mode='1')

# This `point()` operation converts white (255) to 0, and black (0) to 1.
# In PIL mode '1', 0 is displayed as black, and 1 is displayed as white.
# So saving it as PNG makes the originally white background look black!
# BUT IN TSPL, 0 is white, and 1 is black!
# So for TSPL, this `bw_img` byte array is CORRECT.

# BUT WAIT.
# Why did the user say: "imprimiste en negro con letras y QR blanco, como si hubieras invertido colores."?
# It means the PRINTER ALSO printed black background and white text.
# Why would the printer print black background if TSPL says 0 is white?
# Let's check TSPL BITMAP mode again.
