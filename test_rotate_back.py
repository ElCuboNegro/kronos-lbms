from PIL import Image, ImageDraw

width = 399
fold_y = 119

back_img = Image.new('L', (width, fold_y), color=255)
back_draw = ImageDraw.Draw(back_img)
back_draw.text((10, 10), "HOLA", fill=0)

# The rotation of back_img:
back_img = back_img.rotate(180)
# Remember, Pillow 12 default fillcolor might be black (0) for rotate without arguments!
# But wait, earlier I proved `back_img.rotate(180)` gives white pixel at (0,0) in mode L!
# Let's save back_img to check if it's white or black or empty.
back_img.save("test_back_img.png")
