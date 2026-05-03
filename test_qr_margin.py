import qrcode
from PIL import Image, ImageDraw

DPI = 203
MM_TO_PX = DPI / 25.4

width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

# Top-half: 0 to fold_y (119).
# QR size is `fold_y - 4` (115).
# Paster at (2, 2).
# Bottom of QR is 2 + 115 = 117.
# Fold line starts at `fold_y - 2` (117).
# So the QR bottom EXACTLY touches the fold line!
# If the printer's calibration is slightly off, the fold line or the physical gap will cut the bottom.
# And the left edge is at x=2. If the paper shifts 0.5mm, the left edge is cut!

# We need to give it more breathing room (Quiet Zone) in pixels.
# Let's say we put it at x=8 (1mm margin) and y=8.
# Then `qr_px` should be `fold_y - 16` (to leave 8px margin at top and bottom).
# 119 - 16 = 103 pixels.
# 103 pixels / 8 px/mm = 12.8 mm. This is still plenty big!

print(f"New QR size: 103 pixels ({103/8} mm)")
