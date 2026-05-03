from PIL import Image

width = 399
height = 239

img = Image.new('L', (width, height), color=255)
# In Pillow 12.0.0, the default fillcolor for `rotate` might be black!
rot = img.rotate(180)
print("Pixel at 0,0:", rot.getpixel((0,0)))
