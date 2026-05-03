from PIL import Image, ImageDraw
width = 399
fold_y = 119
back_img = Image.new('L', (width, fold_y), color=255)
# When we rotate by 180, what does Image.rotate do if we don't specify fillcolor?
# Prior to Pillow 5.2.0, fillcolor defaulted to 0 (black).
# However, if mode is 'L', rotate without expand might still pad with 0!
rot = back_img.rotate(180)
print("Pixel (0,0) without fillcolor:", rot.getpixel((0,0)))
# Try with fillcolor
rot2 = back_img.rotate(180, fillcolor=255)
print("Pixel (0,0) with fillcolor=255:", rot2.getpixel((0,0)))
