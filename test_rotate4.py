from PIL import Image, ImageDraw

DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

print(f"Total height: {height}, fold_y: {fold_y}")
print(f"Paste position: {fold_y + 2}")
print(f"Bottom boundary: {fold_y + 2 + fold_y}")
print(f"Height Difference: {height - (fold_y + 2 + fold_y)}")
