from PIL import Image, ImageDraw, ImageFont
import qrcode
import textwrap

DPI = 203
MM_TO_PX = DPI / 25.4
width = int(50 * MM_TO_PX)
height = int(30 * MM_TO_PX)
fold_y = height // 2

img = Image.new('L', (width, height), color=255)
draw = ImageDraw.Draw(img)

try:
    f_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
    f_italic = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf", 18)
    f_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
    f_micro = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 13)
    f_nano = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 10)
except:
    f_title = f_italic = f_body = f_micro = f_nano = ImageFont.load_default()

# --- TOP HALF (FRONT) ---
# QR on the left
qr = qrcode.QRCode(box_size=4, border=1)
qr.add_data("UID:DARL-12345")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
qr_px = fold_y - 4
qr_res = qr_img.resize((qr_px, qr_px))
img.paste(qr_res, (2, 2))

# Text on the right
x_text = qr_px + 8
y = 6
draw.text((x_text, y), "KRONOS BIOLABS SAS", font=f_nano, fill=0)
y += 18

# Especie (wrap if too long)
# 399 - 115 - 8 = 276 px width for text
especie = "Darlingtonia californica"
lines = textwrap.wrap(especie, width=20)
for line in lines:
    draw.text((x_text, y), line, font=f_italic, fill=0)
    y += f_italic.size + 2

y += 4
draw.text((x_text, y), "ID: DARL-12345", font=f_micro, fill=0)
y += f_micro.size + 2
draw.text((x_text, y), "F: 2026-05-03", font=f_micro, fill=0)

# --- FOLD LINE ---
draw.rectangle([0, fold_y - 2, width, fold_y + 2], fill=0)

# --- BOTTOM HALF (BACK) ---
back_img = Image.new('L', (width, fold_y), color=255)
back_draw = ImageDraw.Draw(back_img)

ex = {
    "riego": "Agua destilada (60% - 80%)",
    "luz": "50k - 80k lux. Sol directo",
    "temp": "15C - 25C",
    "ph": "4.5 - 5.5",
    "npk": "CERO",
    "humedad": "60% - 80%"
}

line_1 = f"R:{ex.get('riego','—')} | H:{ex.get('humedad','—')}"
line_2 = f"T:{ex.get('temp','—')} | pH:{ex.get('ph','—')} | NPK:{ex.get('npk','—')}"
line_3 = f"L:{ex.get('luz','—')}"

info_lines = [line_1, line_2, line_3]

y_back = 4
for line_txt in info_lines:
    lines_wrap = textwrap.wrap(line_txt, width=42)
    for lw in lines_wrap:
        back_draw.text((4, y_back), lw, font=f_body, fill=0)
        y_back += f_body.size

back_img = back_img.rotate(180)
img.paste(back_img, (0, fold_y + 2))

# Final rot
img = img.rotate(180)
img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
img.save("test_new_layout.png")
print("Saved test_new_layout.png")
