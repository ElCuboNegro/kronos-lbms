DPI = 203
MM_TO_PX = DPI / 25.4
qr_px = int(14 * MM_TO_PX)
print(f"QR Size PX: {qr_px}")
fold_y = int(30 * MM_TO_PX) // 2
print(f"Fold Y PX: {fold_y}")
print(f"Y position: {(fold_y - qr_px) // 2}")
