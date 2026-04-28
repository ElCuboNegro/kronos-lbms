import os
import subprocess
import textwrap
from datetime import date, datetime
from pathlib import Path
from typing import Optional, Dict, Any, Literal

import uvicorn
import qrcode
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont

app = FastAPI(title="Kronos BioLabs - Precision Fold System (Reagents Ready)")

# ── CONFIGURACIÓN DE HARDWARE ────────────────────────────────────────────────
DPI = 203
MM_TO_PX = DPI / 25.4

PAPER_W_MM = 50  # Largo (X)
PAPER_H_MM = 30  # Ancho total (Y)

OFFSET_X_MM = 10 # Margen izquierdo 1cm
FOLD_Y_MM = 15   # Línea de doblez

class LabelRequest(BaseModel):
    modo: str # planta, especimen, reactivo
    arg1: str # Nombre
    arg2: str # UID
    arg3: Optional[str] = None # Fecha
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
        x_base = self.offset_x + 4
        draw.text((x_base, 6), "KRONOS BIOTECH SAS", font=f_nano, fill=0)
        
        if req.modo == 'reactivo':
            # Frente Reactivo
            draw.text((self.width - 150, 6), f"P:{req.extra.get('preparador','—')[:10]}", font=f_nano, fill=0)
            y = 22
            y = self.draw_text(draw, req.arg1, f_title, x_base, y, max_chars=18)
            draw.text((x_base, self.fold_y - 42), f"VOL:{req.extra.get('volumen','—')} C:{req.extra.get('concentracion','—')}", font=f_micro, fill=0)
            draw.text((x_base, self.fold_y - 24), f"EXP: {req.arg3}", font=f_micro, fill=0)
        else:
            # Frente Planta
            y = 24
            y = self.draw_text(draw, req.arg1, f_italic, x_base, y, max_chars=18)
            draw.text((x_base, self.fold_y - 42), f"ID: {req.arg2}", font=f_micro, fill=0)
            draw.text((x_base, self.fold_y - 24), f"F: {req.arg3 or date.today().isoformat()}", font=f_micro, fill=0)

        # ── LÍNEA DE DOBLADO ──
        line_h = self.mm_to_px(1)
        draw.rectangle([0, self.fold_y - line_h//2, self.width, self.fold_y + line_h//2], fill=0)

        # ── MITAD INFERIOR (REVERSO: 15-30mm) ──
        back_img = Image.new('L', (self.width, self.fold_y), color=255)
        back_draw = ImageDraw.Draw(back_img)

        # QR 
        qr = qrcode.QRCode(box_size=3, border=0)
        qr_data = req.arg2 if req.modo == 'reactivo' else f"UID:{req.arg2}"
        qr.add_data(qr_data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
        qr_px = self.mm_to_px(10)
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
        
        y_back = self.fold_y - 75
        for line_txt in info_lines:
            y_back = self.draw_text(back_draw, line_txt, f_body, x_base, y_back, max_chars=32, spacing=1)

        back_img = back_img.rotate(180)
        img.paste(back_img, (0, self.fold_y + line_h//2))

        output_path = "/tmp/etiqueta_final.png"
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
