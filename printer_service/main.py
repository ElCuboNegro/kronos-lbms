import os
import subprocess
import textwrap
from datetime import date
from pathlib import Path
from typing import Optional, Dict, Any, Literal

import uvicorn
import qrcode
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont

app = FastAPI(title="Kronos BioLabs - Final Precision Fold System")

# ── CONFIGURACIÓN DE HARDWARE ────────────────────────────────────────────────
DPI = 203
MM_TO_PX = DPI / 25.4

PAPER_W_MM = 50  # Largo (X)
PAPER_H_MM = 30  # Ancho total (Y)

OFFSET_X_MM = 10 # Margen izquierdo 1cm
FOLD_Y_MM = 15   # Línea de doblez

class LabelRequest(BaseModel):
    modo: str
    arg1: str
    arg2: str
    arg3: Optional[str] = None
    extra: Optional[Dict[str, Any]] = None 

class LabelEngine:
    def __init__(self):
        self.width = int(PAPER_W_MM * MM_TO_PX)
        self.height = int(PAPER_H_MM * MM_TO_PX)
        self.offset_x = int(OFFSET_X_MM * MM_TO_PX)
        self.fold_y = int(FOLD_Y_MM * MM_TO_PX)
        
    def mm_to_px(self, mm: float) -> int:
        return int(mm * MM_TO_PX)

    def draw_text(self, draw, text, font, x, y, max_chars=40, spacing=1):
        lines = textwrap.wrap(text, width=max_chars)
        curr_y = y
        for line in lines:
            draw.text((x, curr_y), line, font=font, fill=0)
            curr_y += font.size + spacing
        return curr_y

    def create_label(self, req: LabelRequest) -> str:
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

        # ── MITAD SUPERIOR (FRENTE: 0-15mm) ──
        # Empujamos el texto más hacia el borde exterior (0mm)
        x_base = self.offset_x + 4
        draw.text((x_base, 6), "KRONOS BIOTECH SAS", font=f_nano, fill=0)
        y = 24
        y = self.draw_text(draw, req.arg1, f_italic, x_base, y, max_chars=18)
        # IDs cerca de la línea negra
        draw.text((x_base, self.fold_y - 42), f"ID: {req.arg2}", font=f_micro, fill=0)
        draw.text((x_base, self.fold_y - 24), f"F: {req.arg3 or date.today().isoformat()}", font=f_micro, fill=0)

        # ── LÍNEA DE DOBLADO (Horizontal a los 15mm) ──
        line_h = self.mm_to_px(1)
        draw.rectangle([0, self.fold_y - line_h//2, self.width, self.fold_y + line_h//2], fill=0)

        # ── MITAD INFERIOR (REVERSO: 15-30mm) ──
        back_img = Image.new('L', (self.width, self.fold_y), color=255)
        back_draw = ImageDraw.Draw(back_img)

        # QR a la derecha
        qr = qrcode.QRCode(box_size=3, border=0)
        qr_data = f"UID:{req.arg2}" if req.modo in ['planta', 'especimen'] else f"ID:{req.arg2}"
        qr.add_data(qr_data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
        qr_px = self.mm_to_px(10)
        qr_res = qr_img.resize((qr_px, qr_px))
        # Centrado vertical en la franja de 15mm
        back_img.paste(qr_res, (self.width - qr_px - 10, (self.fold_y - qr_px) // 2))

        # Texto de cuidados: EMPUJAR HACIA EL BORDE EXTERIOR (que es el "fondo" del sub-lienzo)
        # Al rotar 180, el final del lienzo back_img se convierte en el borde superior de la etiqueta física
        ex = req.extra or {}
        info_lines = [
            f"R:{ex.get('riego','—')}",
            f"L:{ex.get('luz','—')}",
            f"T:{ex.get('temp','—')}",
            f"pH:{ex.get('ph','—')} | NPK:{ex.get('npk','—')}"
        ]
        
        # Empezamos el dibujo desde "abajo" del sub-lienzo para que al rotar quede en el borde exterior
        # fold_y es 15mm (~120px). f_body es 15px. 4 lineas = ~60px.
        y_back = self.fold_y - 75 # Ajuste para que la ultima linea quede cerca del borde (0px tras rotar)
        for line_txt in info_lines:
            y_back = self.draw_text(back_draw, line_txt, f_body, x_base, y_back, max_chars=32, spacing=1)

        # ROTAR 180
        back_img = back_img.rotate(180)
        # Pegar debajo de la línea
        img.paste(back_img, (0, self.fold_y + line_h//2))

        output_path = "/tmp/etiqueta_final_v7.png"
        img.save(output_path)
        return output_path

engine = LabelEngine()

@app.post("/imprimir")
async def imprimir_api(req: LabelRequest):
    try:
        ruta_img = engine.create_label(req)
        try:
            uri_output = subprocess.check_output("lpinfo -v | grep -i 'usb://JADENS'", shell=True).decode()
            uri = uri_output.split()[1]
        except: raise Exception("Impresora no detectada")
        
        subprocess.run(["sudo", "lpadmin", "-p", "Jadens_API", "-E", "-v", uri, "-m", "Jadens/PD-A4(NEW).ppd", "-o", "PageSize=Custom.50x30mm"], check=True)
        subprocess.run(["sudo", "cancel", "-a", "Jadens_API"], stderr=subprocess.DEVNULL)
        subprocess.run(["lp", "-d", "Jadens_API", "-o", "position=center", "-o", "fit-to-page", ruta_img], check=True)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
