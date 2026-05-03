from PIL import Image, ImageDraw

width = 399
height = 239

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

# LÍNEA DE DOBLADO (black line)
draw.rectangle([0, 119 - 2, width, 119 + 2], fill=0)

# 1) What happens when we convert to mode '1'?
# point() maps 255 (white) to 0. It maps 0 (black line) to 1.
# But then mode='1' packs 8 pixels into 1 byte.
# In PIL mode '1', the MSB is the leftmost pixel.
# Let's check how TSPL expects the bits.
# Usually, TSPL expects MSB to be leftmost.

# Is it possible that the ENTIRE image became black because I used `img.rotate(180)` somewhere without fillcolor,
# and it introduced black pixels? Let's check the code for rotate.
