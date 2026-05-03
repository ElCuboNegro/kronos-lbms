from PIL import Image
width = 399
height = 239
img = Image.new('L', (width, height), color=255)
bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
raw_data = bw_img.tobytes()
print(f"Expected len: {50 * 239}, Actual len: {len(raw_data)}")
