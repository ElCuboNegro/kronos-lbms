from PIL import Image, ImageDraw

width = 399
height = 239
fold_y = 119

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

# Linea de doblado
draw.rectangle([0, fold_y - 2, width, fold_y + 2], fill=0)

back_img = Image.new('L', (width, fold_y), color=255)
# Add some text to see what happens
back_draw = ImageDraw.Draw(back_img)
back_draw.text((10, 10), "HOLA", fill=0)

back_img = back_img.rotate(180, fillcolor=255)
img.paste(back_img, (0, fold_y + 2))

# img = img.rotate(180, fillcolor=255)

bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
raw = bw_img.tobytes()
print("Raw data length:", len(raw))
print("Expected length:", 50 * 239)
