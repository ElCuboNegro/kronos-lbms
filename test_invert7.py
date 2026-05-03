from PIL import Image

width = 399
height = 239

img = Image.new('L', (width, height), color=255)

# Wait. I said "El ONLY THING THAT CHANGED between the working Sphagnum label and this broken one is THE NEW LAYOUT CODE!".
# Let's check `test_new_layout.py` again.
img = img.rotate(180)
# Ah! In my `test_new_layout.py` I had this:
# img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
# img.save("test_new_layout.png")
# And what did test_new_layout.png look like?
