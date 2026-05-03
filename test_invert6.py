from PIL import Image, ImageDraw

width = 399
height = 239

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

# LÍNEA DE DOBLADO
draw.rectangle([0, 119 - 2, width, 119 + 2], fill=0)

# Back image
back_img = Image.new('L', (width, 119), color=255)
# When we rotate back_img without expand=False and without fillcolor...
# Oh! In my test_rotate3.py I showed that `back_img.rotate(180)` gives white pixel at 0,0.
# BUT wait! Look at the rotate in main.py:
# `return img.rotate(180)` -> This does NOT specify fillcolor!
# If it doesn't specify fillcolor, what is the fill color?
img_rot = img.rotate(180)
print("Rotated pixel:", img_rot.getpixel((0,0)))
