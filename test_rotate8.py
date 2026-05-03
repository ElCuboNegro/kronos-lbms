from PIL import Image

width = 399
height = 239
fold_y = 119

img = Image.new('L', (width, height), color=255)
rot = img.rotate(180)

# If we don't use fillcolor=255, what are the borders?
pixels = rot.getdata()
num_black = sum(1 for p in pixels if p < 128)
print("Num black pixels:", num_black)
