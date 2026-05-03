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

class SpecimenPrintRequest(BaseModel):
    nombre_cientifico: str
    uid: str
    fecha: str
    requerimientos: Dict[str, str]

class ReagentPrintRequest(BaseModel):
    nombre: str
    uid: str
    marca: str
    formula: str
    pureza: str
    vencimiento: str
    peligros: list

class SubstratePrintRequest(BaseModel):
    nombre: str
    uid: str
    tipo: str
    ph_teorico: str
    ec_teorica: str
    notas: str

class BatchPrintRequest(BaseModel):
    nombre: str
    uid: str
    vencimiento: str
    preparador: str
    volumen: str
    concentracion: str
    componentes: str
    peligros: list

class ContainerPrintRequest(BaseModel):
    uid: str
    especie: str
    cantidad: str
    fecha_ingreso: str
    componentes: str

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

    def create_label_image(self, req: Any) -> Image:
        img = Image.new('L', (self.width, self.height), color=255)
        draw = ImageDraw.Draw(img)

        # ── CAPA DE NORMALIZACIÓN DE DATOS ──
        # Esta lógica permite que el servicio acepte cualquier formato (Viejo o Nuevo)
        def get_val(obj, keys, default='—'):
            for k in keys:
                if hasattr(obj, k) and getattr(obj, k): return str(getattr(obj, k))
                if isinstance(obj, dict) and obj.get(k): return str(obj.get(k))
            return default

        # Título: nombre_cientifico (Nuevo) -> nombre (Nuevo) -> arg1 (Viejo)
        title = get_val(req, ['nombre_cientifico', 'nombre', 'arg1'], 'SIN NOMBRE')

        # ID/UID: uid (Nuevo) -> arg2 (Viejo)
        uid = get_val(req, ['uid', 'arg2'], 'N/A')

        # Línea de info (Fecha/Vencimiento): fecha -> vencimiento -> arg3
        info = get_val(req, ['fecha', 'vencimiento', 'arg3'], date.today().isoformat())

        # Metadatos extra (Requerimientos/Stock)
        extra = {}
        if hasattr(req, 'requerimientos') and req.requerimientos: extra = req.requerimientos
        elif hasattr(req, 'extra') and req.extra: extra = req.extra
        elif isinstance(req, dict): extra = req.get('requerimientos') or req.get('extra') or {}

        # Determinar MODO para el layout
        modo = getattr(req, 'modo', 'planta')
        if hasattr(req, 'nombre') and not hasattr(req, 'nombre_cientifico'): modo = 'reactivo'
        if hasattr(req, 'especie') and hasattr(req, 'cantidad'): modo = 'contenedor'

        try:
            f_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
            f_italic = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf", 20)
            f_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
            f_micro = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 13)
            f_nano = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 10)
        except:
            f_title = f_italic = f_body = f_micro = f_nano = ImageFont.load_default()

        y_cursor = SAFE_Y_START + 4
        x_base = OFFSET_X_PX + 4

        if modo in ['reactivo', 'contenedor', 'lote']:
            # ETIQUETA GRANDE (Toda la cara visible)
            draw.text((x_base, y_cursor), "KRONOS BIOLABS", font=f_body, fill=0)
            header_txt = modo.upper()
            draw.text((self.width - 150, y_cursor), header_txt, font=f_body, fill=0)

            y = y_cursor + 24
            y = self.draw_text(draw, title, f_title, x_base, y, max_chars=22)

            # QR Grande
            qr = qrcode.QRCode(box_size=4, border=0)
            qr.add_data(uid)
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
            qr_px = int(22 * MM_TO_PX)
            qr_res = qr_img.resize((qr_px, qr_px))
            img.paste(qr_res, (self.width - qr_px - OFFSET_X_PX - 10, y))

            # Bloque Técnico
            y += 10
            if modo in ['reactivo', 'lote']:
                vol = get_val(extra, ['volumen', 'vol'], '—')
                conc = get_val(extra, ['concentracion', 'conc. (%)', 'pureza'], '—')
                draw.text((x_base, y), f"VOL: {vol} | CONC: {conc}", font=f_body, fill=0)
                y += 20
                draw.text((x_base, y), f"VENCIMIENTO: {info}", font=f_title, fill=0)
                y += 26
                comps = get_val(extra, ['componentes', 'formula'], '—')
                y = self.draw_text(draw, f"COMP: {comps}", f_micro, x_base, y, max_chars=40)
            else:
                # Contenedor
                cant = get_val(req, ['cantidad'], '—')
                draw.text((x_base, y), f"CANTIDAD: {cant}", font=f_body, fill=0)
                y += 20
                draw.text((x_base, y), f"F. INGRESO: {info}", font=f_body, fill=0)
                y += 30
                comps = get_val(extra, ['componentes', 'especie'], '—')
                y = self.draw_text(draw, f"CONTENIDO: {comps}", f_micro, x_base, y, max_chars=40)

            return img.transpose(Image.ROTATE_180)

        else:
            # ETIQUETA DOBLABLE (Especímenes)
            qr = qrcode.QRCode(box_size=5, border=0)
            qr.add_data(f"UID:{uid}")
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white").convert('L')
            qr_px = self.fold_y - 24
            qr_res = qr_img.resize((qr_px, qr_px))
            img.paste(qr_res, (16, 12))

            x_text = qr_px + 24
            y = 12
            draw.text((x_text, y), "KRONOS BIOLABS SAS", font=f_nano, fill=0)
            y += 16

            # Especie (Wrap si es muy larga)
            especie_lines = textwrap.wrap(title, width=20)
            for line in especie_lines:
                draw.text((x_text, y), line, font=f_italic, fill=0)
                y += 22

            y += 4
            draw.text((x_text, y), f"ID: {uid}", font=f_micro, fill=0)
            y += 18
            draw.text((x_text, y), f"F: {info}", font=f_micro, fill=0)

            # ── LÍNEA DE DOBLADO ──
            draw.rectangle([0, self.fold_y - 2, self.width, self.fold_y + 2], fill=0)

            # ── MITAD INFERIOR (REVERSO) ──
            back_img = Image.new('L', (self.width, self.fold_y), color=255)
            back_draw = ImageDraw.Draw(back_img)

            # Requerimientos unificados
            # Buscamos tanto nombres cortos (riego) como largos (temperatura_c)
            l1 = f"R:{get_val(extra, ['riego','humedad_sustrato_pct'])} | H:{get_val(extra, ['humedad','humedad_relativa_pct'])}"
            l2 = f"T:{get_val(extra, ['temp','temperatura_c'])} | pH:{get_val(extra, ['ph','ph_sustrato'])}"
            l3 = f"L:{get_val(extra, ['luz','luz_lux'])} | NPK:{get_val(extra, ['npk'])}"

            back_draw.text((x_base, 8), l1, font=f_body, fill=0)
            back_draw.text((x_base, 32), l2, font=f_body, fill=0)
            back_draw.text((x_base, 56), l3, font=f_body, fill=0)

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
    # Cada byte = 8 píxeles. En esta GEZI, 1 es BLANCO y 0 es NEGRO.
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
    """Acceso genérico legado (mantener compatibilidad)."""
    try:
        img = engine.create_label_image(req)
        send_to_printer(img)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/imprimir/especimen")
async def imprimir_especimen(req: SpecimenPrintRequest):
    """Acceso normalizado para especímenes biológicos."""
    legacy_req = LabelRequest(
        modo="planta",
        arg1=req.nombre_cientifico,
        arg2=req.uid,
        arg3=req.fecha,
        extra=req.requerimientos
    )
    return await imprimir_api(legacy_req)

@app.post("/imprimir/reactivo")
async def imprimir_reactivo(req: ReagentPrintRequest):
    """Acceso normalizado para reactivos químicos."""
    legacy_req = LabelRequest(
        modo="reactivo",
        arg1=req.nombre,
        arg2=req.uid,
        arg3=req.vencimiento,
        extra={
            "preparador": "Stock Puro",
            "marca": req.marca,
            "componentes": req.formula,
            "conc. (%)": req.pureza,
            "peligros": req.peligros
        }
    )
    return await imprimir_api(legacy_req)

@app.post("/imprimir/sustrato")
async def imprimir_sustrato(req: SubstratePrintRequest):
    """Acceso normalizado para sustratos."""
    legacy_req = LabelRequest(
        modo="reactivo",
        arg1=req.nombre,
        arg2=req.uid,
        arg3=req.tipo,
        extra={
            "pH Teórico": req.ph_teorico,
            "EC Teórica": req.ec_teorica,
            "notas": req.notas
        }
    )
    return await imprimir_api(legacy_req)

@app.post("/imprimir/lote")
async def imprimir_lote(req: BatchPrintRequest):
    """Acceso normalizado para lotes preparados."""
    legacy_req = LabelRequest(
        modo="reactivo",
        arg1=req.nombre,
        arg2=req.uid,
        arg3=req.vencimiento,
        extra={
            "preparador": req.preparador,
            "volumen": req.volumen,
            "concentracion": req.concentracion,
            "componentes": req.componentes,
            "peligros": req.peligros
        }
    )
    return await imprimir_api(legacy_req)

@app.post("/imprimir/contenedor")
async def imprimir_contenedor(req: ContainerPrintRequest):
    """Acceso normalizado para contenedores."""
    legacy_req = LabelRequest(
        modo="contenedor",
        arg1="Contenedor Múltiple",
        arg2=req.uid,
        arg3=req.cantidad,
        extra={
            "especie": req.especie,
            "componentes": req.componentes,
            "fecha_ingreso": req.fecha_ingreso
        }
    )
    return await imprimir_api(legacy_req)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "printer", "timestamp": datetime.now().isoformat()}

@app.get("/info")
async def info():
    return {
        "name": "Seymour OS Printer Service",
        "version": "1.0.0",
        "supported_modes": ["especimen", "reactivo", "sustrato", "lote", "contenedor", "libre"],
        "hardware": "Jadens GEZI (USB)"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
