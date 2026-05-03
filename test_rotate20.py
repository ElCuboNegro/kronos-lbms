from PIL import Image, ImageDraw

width = 399
height = 239

img = Image.new('L', (width, height), color=255)
# Make a black block at the bottom
draw = ImageDraw.Draw(img)
draw.rectangle([0, 200, width, height], fill=0)

bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
raw = bw_img.tobytes()
print("Raw data length:", len(raw))
