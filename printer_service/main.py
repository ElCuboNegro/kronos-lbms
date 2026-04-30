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

app = FastAPI(title="Kronos BioLabs - GEZI Direct System")

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
        img = Image.new('L', (self.width, self.height), color=255)
        draw = ImageDraw.Draw(img)
        
        try:
            f_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
            f_italic = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf", 20)
            f_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
            f_micro = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 13)
            f_nano = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 10)
        except:
            f_title = f_italic = f_body = f_micro = f_nano = ImageFont.load_default()

        # ── MITAD SUPERIOR (FRENTE) ──
        # Usamos SAFE_Y_START para que no se corte
        y_cursor = SAFE_Y_START + 4
        x_base = OFFSET_X_PX + 4
        
        draw.text((x_base, y_cursor), "KRONOS BIOTECH SAS", font=f_nano, fill=0)
        
        if req.modo == 'reactivo':
            draw.text((self.width - 150, y_cursor), f"P:{req.extra.get('preparador','—')[:10]}", font=f_nano, fill=0)
            y = y_cursor + 18
            y = self.draw_text(draw, req.arg1, f_title, x_base, y, max_chars=18)
            draw.text((x_base, self.fold_y - 40), f"VOL:{req.extra.get('volumen','—')} C:{req.extra.get('concentracion','—')}", font=f_micro, fill=0)
            draw.text((x_base, self.fold_y - 22), f"EXP: {req.arg3}", font=f_micro, fill=0)
        else:
            y = y_cursor + 20
            y = self.draw_text(draw, req.arg1, f_italic, x_base, y, max_chars=18)
            draw.text((x_base, self.fold_y - 40), f"ID: {req.arg2}", font=f_micro, fill=0)
            draw.text((x_base, self.fold_y - 22), f"F: {req.arg3 or date.today().isoformat()}", font=f_micro, fill=0)

        # ── LÍNEA DE DOBLADO ──
        draw.rectangle([0, self.fold_y - 2, self.width, self.fold_y + 2], fill=0)

        # ── MITAD INFERIOR (REVERSO) ──
        back_img = Image.new('L', (self.width, self.fold_y), color=255)
        back_draw = ImageDraw.Draw(back_img)

        # QR
        qr = qrcode.QRCode(box_size=3, border=0)
        qr_data = req.arg2 if req.modo == 'reactivo' else f"UID:{req.arg2}"
        qr.add_data(qr_data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
        qr_px = int(10 * MM_TO_PX)
        qr_res = qr_img.resize((qr_px, qr_px))
        back_img.paste(qr_res, (self.width - qr_px - 10, (self.fold_y - qr_px) // 2))

        # Texto reverso
        ex = req.extra or {}
        if req.modo == 'reactivo':
            comps = ex.get('componentes', '—')
            info_lines = [f"LOTE: {req.arg2}", f"COMP: {comps[:55]}..."]
            peligros = ex.get('peligros', [])
            if peligros: info_lines.append("PELIGRO: " + " ".join([p.upper() for p in peligros]))
        else:
            info_lines = [f"R:{ex.get('riego','—')}", f"L:{ex.get('luz','—')}", f"T:{ex.get('temp','—')}", f"pH:{ex.get('ph','—')} | NPK:{ex.get('npk','—')}"]
        
        y_back = 10 
        for line_txt in info_lines:
            y_back = self.draw_text(back_draw, line_txt, f_body, x_base, y_back, max_chars=32, spacing=1)

        back_img = back_img.rotate(180)
        img.paste(back_img, (0, self.fold_y + 2))

        # Rotación final para la GEZI
        return img.rotate(180)

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
    bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')
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
