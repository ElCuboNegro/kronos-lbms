from PIL import Image, ImageDraw

width = 399
height = 239
fold_y = 119

img = Image.new('L', (width, height), color=255)
# In mode L, 255 is white.
img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
# Now mode 1, 0 is True (white?) or False (black)?
# Let's see what `tobytes` does.
raw = img.tobytes()
print("White image bytes sum:", sum(raw))

img2 = Image.new('L', (width, height), color=0)
img2 = img2.point(lambda x: 0 if x > 128 else 1, mode='1')
raw2 = img2.tobytes()
print("Black image bytes sum:", sum(raw2))
