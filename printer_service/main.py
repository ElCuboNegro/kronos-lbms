import os
import subprocess
import textwrap
import usb.core
import usb.util
from datetime import date, datetime
from pathlib import Path
from typing import Optional, Dict, Any

import uvicorn
import qrcode
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont

app = FastAPI(title="Kronos Biolabs - GEZI Direct System")

# ── CONFIGURACIÓN DE HARDWARE ────────────────────────────────────────────────
DPI = 203
MM_TO_PX = DPI / 25.4

PAPER_W_MM = 50  # Largo físico
PAPER_H_MM = 30  # Ancho físico

# Basado en el diagnóstico: Seguro entre 20px y 220px
SAFE_Y_START = 22
SAFE_Y_END = 218

OFFSET_X_PX = 16 # Pequeño ajuste lateral

class LabelRequest(BaseModel):
    modo: str
    arg1: str
    arg2: str
    arg3: Optional[str] = None
    extra: Optional[Dict[str, Any]] = None

class LabelEngine:
    def __init__(self):
        self.width = int(PAPER_W_MM * MM_TO_PX) # ~400
        self.height = int(PAPER_H_MM * MM_TO_PX) # ~240
        self.fold_y = self.height // 2

    def draw_text(self, draw, text, font, x, y, max_chars=40, spacing=1):
        lines = textwrap.wrap(text, width=max_chars)
        curr_y = y
        for line in lines:
            draw.text((x, curr_y), line, font=font, fill=0)
            curr_y += font.size + spacing
        return curr_y





    def create_label_image(self, req: LabelRequest) -> Image:
        # Lienzo base blanco (399x239)
        img = Image.new('L', (self.width, self.height), color=255)
        draw = ImageDraw.Draw(img)

        try:
            f_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
            f_italic = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf", 18)
            f_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
            f_micro = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 12)
            f_nano = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 10)
        except:
            f_title = f_italic = f_body = f_micro = f_nano = ImageFont.load_default()

        if req.modo in ['reactivo', 'contenedor']:
            # --- DISEÑO REACTIVO ---
            qr_px = 100
            qr = qrcode.QRCode(box_size=4, border=1)
            qr.add_data(req.arg2)
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
            qr_res = qr_img.resize((qr_px, qr_px))

            # Físicamente queremos QR a la IZQUIERDA.
            # En la imagen pre-rotación, lo ponemos a la DERECHA.
            # Margen físico: 24px (~3mm). 400 - 24 - 100 = 276.
            img.paste(qr_res, (276, 54))

            # Físicamente queremos TEXTO a la DERECHA.
            # En la imagen pre-rotación, lo ponemos a la IZQUIERDA.
            # Columna segura: x=20 hasta x=250.
            x_col = 20
            y = 19

            draw.text((x_col, y), "KRONOS BIOLABS", font=f_nano, fill=0)
            y += 15

            lote = req.extra.get('preparador', '—')
            draw.text((x_col, y), f"LOTE: {lote[:15]}", font=f_micro, fill=0)
            y += 24

            # Título (max_chars=18 para evitar solape central)
            y = self.draw_text(draw, req.arg1, f_title, x_col, y, max_chars=18)
            y += 8

            ex = req.extra or {}
            self.draw_text(draw, f"VOL: {ex.get('volumen','—')}", f_body, x_col, y, max_chars=20)
            y += 18
            self.draw_text(draw, f"CONC: {ex.get('conc. (%)','—')}", f_body, x_col, y, max_chars=20)
            y += 18

            self.draw_text(draw, f"FABR: {ex.get('formulado','—')}", f_micro, x_col, y, max_chars=22)
            y += 15
            self.draw_text(draw, f"VENCE: {req.arg3 or '—'}", f_body, x_col, y, max_chars=22)
            y += 20

            comps = ex.get('componentes', '—')
            y = self.draw_text(draw, f"COMP: {comps}", f_nano, x_col, y, max_chars=32)

            peligros = ex.get('peligros', [])
            if peligros:
                # Usar etiquetas de texto para evitar fallos de renderizado de Emojis
                p_labels = []
                for p in peligros:
                    p_up = p.upper()
                    if 'TOX' in p_up: p_labels.append("[TOX]")
                    elif 'IRR' in p_up: p_labels.append("[IRR]")
                    elif 'INF' in p_up: p_labels.append("[INF]")
                    elif 'COR' in p_up: p_labels.append("[COR]")
                    elif 'OXI' in p_up: p_labels.append("[OXI]")
                    else: p_labels.append(f"[{p_up}]")

                self.draw_text(draw, "RIESGO: " + " ".join(p_labels), f_nano, x_col, y + 4, max_chars=32)

            return img.transpose(Image.ROTATE_180)

        else:
            # --- ETIQUETA DOBLABLE (ESPECÍMENES) ---
            qr = qrcode.QRCode(box_size=5, border=0)
            qr.add_data(f"UID:{req.arg2}")
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')

            qr_px = self.fold_y - 24
            qr_res = qr_img.resize((qr_px, qr_px))
            img.paste(qr_res, (20, 12))

            x_text = qr_px + 28
            y = 12
            draw.text((x_text, y), "KRONOS BIOLABS SAS", font=f_nano, fill=0)
            y += 16

            especie_lines = textwrap.wrap(req.arg1, width=20)
            for line in especie_lines:
                draw.text((x_text, y), line, font=f_italic, fill=0)
                y += f_italic.size + 2

            y += 4
            draw.text((x_text, y), f"ID: {req.arg2}", font=f_micro, fill=0)
            y += f_micro.size + 4
            draw.text((x_text, y), f"F: {req.arg3 or date.today().isoformat()}", font=f_micro, fill=0)

            draw.rectangle([0, self.fold_y - 2, self.width, self.fold_y + 2], fill=0)

            back_img = Image.new('L', (self.width, self.fold_y), color=255)
            back_draw = ImageDraw.Draw(back_img)
            ex = req.extra or {}
            line_1 = f"R:{ex.get('riego','—')} | H:{ex.get('humedad','—')}"
            line_2 = f"T:{ex.get('temp','—')} | pH:{ex.get('ph','—')} | NPK:{ex.get('npk','—')}"
            line_3 = f"L:{ex.get('luz','—')}"
            info_lines = [line_1, line_2, line_3]

            y_back = 12
            for line_txt in info_lines:
                y_back = self.draw_text(back_draw, line_txt, f_body, 4, y_back, max_chars=40, spacing=2)

            back_img = back_img.transpose(Image.ROTATE_180)
            img.paste(back_img, (0, self.fold_y + 2))

            return img.transpose(Image.ROTATE_180)

engine = LabelEngine()

def send_to_printer(img: Image):
    VENDOR_ID = 0x0483
    PRODUCT_ID = 0x5720

    dev = usb.core.find(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)
    if dev is None:
        raise Exception("Impresora GEZI no encontrada en USB")

    if dev.is_kernel_driver_active(0):
        dev.detach_kernel_driver(0)

    dev.set_configuration()

    # Obtener el endpoint de salida
    cfg = dev.get_active_configuration()
    intf = cfg[(0,0)]
    ep = usb.util.find_descriptor(
        intf,
        custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT
    )

    if ep is None:
        raise Exception("No se encontró el endpoint de salida USB")

    # Preparar comandos TSPL
    # El comando BITMAP requiere los datos en formato bit-stream
    # Cada byte = 8 píxeles. 1 es negro, 0 es blanco.
    # Invertimos la imagen (L) porque en TSPL BITMAP 1 es negro.
    # Nuestra imagen original es 255 (blanco), 0 (negro).
    bw_img = img.point(lambda x: 1 if x > 128 else 0, mode='1')
    raw_data = bw_img.tobytes()

    width_bytes = (img.width + 7) // 8
    header = f"SIZE 50 mm, 30 mm\r\nGAP 2 mm, 0\r\nDIRECTION 1\r\nCLS\r\nBITMAP 0,0,{width_bytes},{img.height},0,".encode()
    footer = b"\r\nPRINT 1\r\n"

    full_command = header + raw_data + footer
    ep.write(full_command)
    usb.util.dispose_resources(dev)

@app.post("/imprimir")
async def imprimir_api(req: LabelRequest):
    try:
        img = engine.create_label_image(req)
        send_to_printer(img)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
