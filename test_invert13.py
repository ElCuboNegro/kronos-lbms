from PIL import Image

width = 399
height = 239

# 1. White image
img = Image.new('L', (width, height), color=255)
# 2. Point: white (255) -> 1
bw_img = img.point(lambda x: 1 if x > 128 else 0, mode='1')
raw = bw_img.tobytes()
print("Raw data length:", len(raw))
print("White image bytes sum:", sum(raw))

# Wait, if raw is all 255s, it means the TSPL command receives all 1s.
# TSPL says "1 is black, 0 is white".
# If I send 255s (all 1s), TSPL prints BLACK.
# So `1 if x > 128 else 0` prints BLACK for white pixels!

# But wait! Why did the user say "imprimiste en negro con letras y QR blanco" when I used:
# `lambda x: 0 if x > 128 else 1` ?
# With that, white pixels -> 0 -> TSPL prints WHITE.
# Let's check `test_invert11.py` again.
# In `test_invert11.py`:
# bw1 = img.point(lambda x: 0 if x > 128 else 1, mode='1')
# raw1 = bw1.tobytes()
# raw1 byte 0 was 11111111 (for the black line).
# So black -> 1 -> TSPL black. White -> 0 -> TSPL white.
# So `0 if x > 128 else 1` SHOULD BE CORRECT for TSPL where 1 is black and 0 is white!

# THEN WHY DID THE USER SAY IT WAS ALL BLACK?
# User: "todo negro y dejaste un espacio en blanco de casi medio centimetro en el lado inferior"
# When did they say this?
# 1. I wrote `img.rotate(180)` in the new layout code WITHOUT `fillcolor=255`.
# 2. They said "todo negro".
# Wait, did `img.rotate(180)` introduce black?
# I tested this in `test_rotate3.py` and `test_rotate21.py` and it DID NOT introduce black in Pillow 12.0.0.
# BUT WHAT IF THE SERVER IS RUNNING AN OLDER PILLOW VERSION?!
