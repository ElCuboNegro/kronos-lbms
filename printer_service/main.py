import os
import subprocess
import textwrap
import usb.core
import usb.util
import time
from datetime import date, datetime
from pathlib import Path
from typing import Optional, Dict, Any

import uvicorn
import qrcode
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont

app = FastAPI(title="Kronos Biolabs - GEZI Direct System")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── CONFIGURACIÓN DE HARDWARE ────────────────────────────────────────────────
DPI = 203
MM_TO_PX = DPI / 25.4
PAPER_W_MM = 50
PAPER_H_MM = 30

class LabelRequest(BaseModel):
    modo: str = "planta"
    arg1: str = ""
    arg2: str = ""
    arg3: Optional[str] = ""
    extra: Optional[Dict[str, Any]] = None

class LabelEngine:
    def __init__(self):
        self.width = int(PAPER_W_MM * MM_TO_PX)
        self.height = int(PAPER_H_MM * MM_TO_PX)
        self.fold_y = self.height // 2

    def draw_text(self, draw, text, font, x, y, max_chars=40, spacing=1):
        if not text: return y
        lines = textwrap.wrap(str(text), width=max_chars)
        curr_y = y
        for line in lines:
            draw.text((x, curr_y), line, font=font, fill=0)
            curr_y += font.size + spacing
        return curr_y

    def create_label_image(self, req: LabelRequest) -> Image:
        img = Image.new('L', (self.width, self.height), color=255)
        draw = ImageDraw.Draw(img)

        try:
            f_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
            f_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
            f_micro = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
            f_nano = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 12)
        except:
            f_title = f_body = f_micro = f_nano = ImageFont.load_default()

        if req.modo in ['reactivo', 'contenedor']:
            # --- DISEÑO TIPO CONTENEDOR (LAYOUT 1050c50 + ZONA RESERVA) ---
            qr_px = 130
            qr = qrcode.QRCode(box_size=4, border=1)
            qr.add_data(req.arg2)
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
            qr_res = qr_img.resize((qr_px, qr_px))

            x_col = 15
            y = 8
            ex = req.extra or {}

            # Cabecera
            lote = ex.get('preparador') or ex.get('lote') or '—'
            visual = ex.get('uid_visual', req.arg2)[:16]
            draw.text((x_col, y), f"LOTE: {lote[:10]} | {visual}", font=f_micro, fill=0)
            y += 18

            # Título
            y = self.draw_text(draw, req.arg1, f_title, x_col, y, max_chars=16)
            y += 6

            # Datos
            draw.text((x_col, y), f"VOL: {ex.get('volumen','—')} | CONC: {ex.get('conc. (%)','—')}", font=f_body, fill=0)
            y += 22

            fab = ex.get('formulado', 'N/A')[:10]
            ven = req.arg3[:10] if req.arg3 else 'N/A'
            draw.text((x_col, y), f"F: {fab} | V: {ven}", font=f_body, fill=0)
            y += 22

            # Componentes
            comps = ex.get('componentes') or ex.get('notas', '—')
            self.draw_text(draw, f"INFO: {comps}", f_nano, x_col, y, max_chars=35)

            # --- QR CON ZONA DE RESERVA (SILENCIO) ---
            qr_x = 240  # Movido para evitar borde físico tras rotación
            qr_y = 50
            # Zona de reserva blanca de 8px
            draw.rectangle([qr_x - 8, qr_y - 8, qr_x + qr_px + 8, qr_y + qr_px + 8], fill=255)
            img.paste(qr_res, (qr_x, qr_y))

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
                draw.text((x_text, y), line, font=f_body, fill=0)
                y += 18 + 2

            y += 4
            draw.text((x_text, y), f"ID: {req.arg2}", font=f_micro, fill=0)
            y += 18
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
    if dev is None: raise Exception("Impresora no encontrada")

    if dev.is_kernel_driver_active(0): dev.detach_kernel_driver(0)
    dev.set_configuration()

    cfg = dev.get_active_configuration()
    intf = cfg[(0,0)]
    ep = usb.util.find_descriptor(intf, custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT)

    # Wakeup
    ep.write(b'\x10\xff\xfe\x01')
    time.sleep(0.1)

    # GOLDEN POLARITY: 0=White, 1=Black (Verified by test_new_layout.py)
    bw_img = img.point(lambda x: 1 if x > 128 else 0, mode='1')
    raw_data = bw_img.tobytes()

    width_bytes = (img.width + 7) // 8
    header = f"SIZE 50 mm, 30 mm\r\nGAP 2 mm, 0\r\nDIRECTION 1\r\nCLS\r\nBITMAP 0,0,{width_bytes},{img.height},0,".encode()
    footer = b"\r\nPRINT 1\r\n"

    ep.write(header + raw_data + footer)
    time.sleep(0.5)
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
