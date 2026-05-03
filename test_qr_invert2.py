from PIL import Image
# What about back_img?
back_img = Image.new('L', (399, 135), color=255)
# Rotate it
rot = back_img.rotate(180)
print(rot.getpixel((0,0)))
# If we rotate by 180, and the image is exactly the size, is there empty space? No.
