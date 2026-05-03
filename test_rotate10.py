from PIL import Image, ImageDraw
import qrcode
import numpy as np

DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

# LÍNEA DE DOBLADO
draw.rectangle([0, fold_y - 2, width, fold_y + 2], fill=0)

back_img = Image.new('L', (width, fold_y), color=255)

# Rotar y pegar
back_img = back_img.rotate(180, fillcolor=255)
img.paste(back_img, (0, fold_y + 2))

# Rotación final
img = img.rotate(180, fillcolor=255)
# Wait! `rotate` WITH `expand=False` (default) on an odd size image might misalign!
# But wait, look at the error: "todo negro y dejaste un espacio en blanco de casi medio centimetro en el lado inferior"
# "Todo negro" = everything is 1.
# But wait, earlier I printed:
# Point of white image: 0
# Point of black image: 95361
# So if it's "todo negro" it means the image is FULL OF 1s!
# Why would `img` be full of 1s BEFORE `point()`? It means it was full of 0s (black)!
# When would `img` be full of black?
# Image.new('L', (self.width, self.height), color=255) -> it starts white!
# What if `rotate(180)` puts black? No, test_rotate3 proved it doesn't.
