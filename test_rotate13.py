from PIL import Image

width = 399
height = 239
fold_y = 119

img = Image.new('L', (width, height), color=255)
# What if we explicitly set fillcolor=255 ?
img = img.rotate(180, fillcolor=255)
print("Done")
