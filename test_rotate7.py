from PIL import Image

width = 399
height = 239
fold_y = 119

img = Image.new('L', (width, height), color=255)
back_img = Image.new('L', (width, fold_y), color=255)

back_img_rot = back_img.rotate(180)

# If we paste back_img_rot (size: 399 x 119) at (0, fold_y + 2) => (0, 121)
# Top-left is (0, 121), bottom-right is (399, 121 + 119) => (399, 240)
# But height is 239! It overflows by 1 pixel. This is fine, Pillow just crops.

img.paste(back_img_rot, (0, fold_y + 2))
img_rot = img.rotate(180)

# Wait... what if rotate(180) is putting black pixels on the edges due to anti-aliasing or interpolation?
# No, rotate(180) should be exact if dimensions are exact.
# But 399x239 is an ODD size! Rotating an odd-sized image by 180 degrees using default interpolation might cause issues!
print("Img pixel 0,0:", img_rot.getpixel((0,0)))
