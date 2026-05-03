from PIL import Image

img = Image.new('L', (399, 239), color=255)
rot = img.rotate(180)
print("Rotated 255 img without fillcolor:", rot.getpixel((0,0)))

rot_expand = img.rotate(180, expand=True)
print("Rotated with expand:", rot_expand.getpixel((0,0)))
