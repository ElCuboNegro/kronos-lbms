from PIL import Image

width = 399
height = 239

img = Image.new('L', (width, height), color=255)
# In Pillow 12, mode '1' might behave slightly differently with `tobytes()`.
# Let's inspect raw_data when image is empty (all white).
# It should be all zeros.
bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
raw_data = bw_img.tobytes()
print("Empty image raw_data sum:", sum(raw_data))

# What happens if we do a rotate(180)?
rot = img.rotate(180)
bw_img2 = rot.point(lambda x: 0 if x > 128 else 1, mode='1')
raw_data2 = bw_img2.tobytes()
print("Rotated empty image raw_data sum:", sum(raw_data2))
