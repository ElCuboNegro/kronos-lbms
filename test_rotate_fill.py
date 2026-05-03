from PIL import Image

width = 399
height = 239

img = Image.new('L', (width, height), color=255)
# In Pillow 12.0.0 rotate without fillcolor=255
rot = img.rotate(180)
# But wait, earlier I printed: Unique: [0, 255]
# Wait, look at test_back_img.png
# Unique colors had all shades from 6 to 255! Because of anti-aliased text (HOLA).
# But there is no 0!
# If the background was black, we would see 0.
# The user said: "todo negro y dejaste un espacio en blanco de casi medio centimetro en el lado inferior"
# What creates a black background?
