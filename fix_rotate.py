import re

with open("printer_service/main.py", "r") as f:
    content = f.read()

# I will recreate the layout exactly with proper fillcolors to prevent black backgrounds
# AND I will ensure the bw_img point lambda is correct for the printer.

new_layout = """
        else:
            # ETIQUETA DOBLABLE (Especímenes)

            # --- MITAD SUPERIOR (FRENTE) ---
            # QR en la izquierda
            qr = qrcode.QRCode(box_size=5, border=1)
            qr.add_data(f"UID:{req.arg2}")
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')

            # Margen seguro de 8px (~1mm) para evitar cortes físicos
            qr_px = self.fold_y - 16
            qr_res = qr_img.resize((qr_px, qr_px))
            img.paste(qr_res, (8, 8))

            # Texto en la derecha
            x_text = qr_px + 16
            y = 8
            draw.text((x_text, y), "KRONOS BIOLABS SAS", font=f_nano, fill=0)
            y += 16

            # Especie (Wrap si es muy larga)
            especie_lines = textwrap.wrap(req.arg1, width=20)
            for line in especie_lines:
                draw.text((x_text, y), line, font=f_italic, fill=0)
                y += f_italic.size + 2

            y += 4
            draw.text((x_text, y), f"ID: {req.arg2}", font=f_micro, fill=0)
            y += f_micro.size + 4
            draw.text((x_text, y), f"F: {req.arg3 or date.today().isoformat()}", font=f_micro, fill=0)

            # ── LÍNEA DE DOBLADO ──
            draw.rectangle([0, self.fold_y - 2, self.width, self.fold_y + 2], fill=0)

            # ── MITAD INFERIOR (REVERSO) ──
            back_img = Image.new('L', (self.width, self.fold_y), color=255)
            back_draw = ImageDraw.Draw(back_img)

            # Texto reverso a ancho completo
            ex = req.extra or {}

            # Combine fields efficiently
            line_1 = f"R:{ex.get('riego','—')} | H:{ex.get('humedad','—')}"
            line_2 = f"T:{ex.get('temp','—')} | pH:{ex.get('ph','—')} | NPK:{ex.get('npk','—')}"
            line_3 = f"L:{ex.get('luz','—')}"

            info_lines = [line_1, line_2, line_3]

            y_back = 4
            for line_txt in info_lines:
                y_back = self.draw_text(back_draw, line_txt, f_body, 4, y_back, max_chars=40, spacing=2)

            back_img = back_img.rotate(180, fillcolor=255)
            img.paste(back_img, (0, self.fold_y + 2))

            # Rotación final para la GEZI
            return img.rotate(180, fillcolor=255)
"""

# Replace from `else:` to `return img.rotate(180)`
# Note that we use regex
import re
new_content = re.sub(r"        else:\n            # ETIQUETA DOBLABLE.*?(return img.rotate\(180\))", new_layout.strip(), content, flags=re.DOTALL)

with open("printer_service/main.py", "w") as f:
    f.write(new_content)
