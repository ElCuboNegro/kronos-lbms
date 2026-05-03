import os
import textwrap
import usb.core
import usb.util
import time
from datetime import date, datetime
from typing import Optional, Dict, Any
import uvicorn
import qrcode
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- CONFIGURACIÓN CALIBRADA (JADENS GEZI) ---
WIDTH_PX = 400
HEIGHT_PX = 240
FOLD_Y = 120

class LabelRequest(BaseModel):
    modo: str = "planta"
    arg1: str = ""
    arg2: str = ""
    arg3: Optional[str] = ""
    extra: Optional[Dict[str, Any]] = None

class LabelEngine:
    def draw_text(self, draw, text, font, x, y, max_chars=20):
        if not text: return y
        lines = textwrap.wrap(str(text), width=max_chars)
        for line in lines:
            draw.text((x, y), line, font=font, fill=0)
            y += 20
        return y

    def create_image(self, req: LabelRequest) -> Image:
        # Lienzo Grayscale (255 = Blanco)
        img = Image.new('L', (WIDTH_PX, HEIGHT_PX), color=255)
        draw = ImageDraw.Draw(img)

        try:
            f_italic = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf", 18)
            f_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
            f_nano = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 10)
        except:
            f_italic = f_body = f_nano = ImageFont.load_default()

        # --- FRONTAL ---
        qr = qrcode.QRCode(box_size=4, border=1)
        qr.add_data(f"UID:{req.arg2}")
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
        img.paste(qr_img.resize((100, 100)), (10, 10))

        x_txt = 125
        draw.text((x_txt, 10), "KRONOS BIOLABS SAS", font=f_nano, fill=0)
        y = 28
        y = self.draw_text(draw, req.arg1, f_italic, x_txt, y, max_chars=18)
        draw.text((x_txt, y), f"ID: {req.arg2}", font=f_body, fill=0)
        draw.text((x_txt, y + 18), f"F: {req.arg3}", font=f_nano, fill=0)

        draw.line([(0, FOLD_Y), (WIDTH_PX, FOLD_Y)], fill=0, width=1)

        # --- TRASERA ---
        back_img = Image.new('L', (WIDTH_PX, FOLD_Y), color=255)
        back_draw = ImageDraw.Draw(back_img)
        ex = req.extra or {}
        trat = ex.get('Tratamiento') or ex.get('preparador') or ex.get('componentes')

        back_draw.text((15, 10), "INFO / TRATAMIENTO:", font=f_nano, fill=0)
        self.draw_text(back_draw, trat, f_body, 15, 25, max_chars=35)

        vol = ex.get('volumen', '—')
        back_draw.text((15, 90), f"VOL: {vol}", font=f_body, fill=0)

        img.paste(back_img.rotate(180), (0, FOLD_Y + 1))

        # --- CONVERSIÓN ---
        img = img.rotate(180)
        # POLARIDAD: 1=Blanco, 0=Negro
        return img.point(lambda x: 1 if x > 128 else 0, mode='1')

def send_to_usb(img: Image):
    dev = usb.core.find(idVendor=0x0483, idProduct=0x5720)
    if dev is None: raise Exception("Impresora no encontrada")

    try:
        if dev.is_kernel_driver_active(0): dev.detach_kernel_driver(0)
        dev.set_configuration()
    except: pass

    endpoint = dev.get_active_configuration()[(0,0)][0]

    # Wakeup & Clear
    endpoint.write(b'\x10\xff\xfe\x01')
    time.sleep(0.1)

    raw_bits = img.tobytes()
    w_bytes = (WIDTH_PX + 7) // 8
    header = f"SIZE 50 mm, 30 mm\r\nGAP 2 mm, 0\r\nDIRECTION 1\r\nCLS\r\nBITMAP 0,0,{w_bytes},{HEIGHT_PX},0,".encode()
    footer = b"\r\nPRINT 1\r\n"

    endpoint.write(header + raw_bits + footer)
    time.sleep(1)

@app.post("/imprimir")
async def imprimir(req: LabelRequest):
    try:
        engine = LabelEngine()
        img_bits = engine.create_image(req)
        send_to_usb(img_bits)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
