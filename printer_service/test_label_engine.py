import pytest
from PIL import Image
from main import LabelEngine, LabelRequest

def test_label_engine_especimen_dimensions_and_colors():
    engine = LabelEngine()
    req = LabelRequest(
        modo="especimen",
        arg1="Darlingtonia",
        arg2="DARL-001",
        arg3="2026-05-03",
        extra={"temp": "15C-25C", "humedad": "80%"}
    )
    img = engine.create_label_image(req)

    # 203 DPI = 8 px/mm. 50mm x 30mm -> 399 x 239 px (int(50 * 203 / 25.4))
    assert img.width == 399
    assert img.height == 239

    # Esquinas deben ser blancas (255) para probar que no hay recuadros negros residuales
    # generados por un rotate() mal hecho con expand=False.
    assert img.getpixel((0, 0)) == 255
    assert img.getpixel((img.width - 1, 0)) == 255
    assert img.getpixel((0, img.height - 1)) == 255
    assert img.getpixel((img.width - 1, img.height - 1)) == 255

def test_gezi_bitmap_conversion_logic():
    # La impresora GEZI clónica tiene el mapa de bits invertido en TSPL
    # Blanco = 1, Negro = 0
    img = Image.new('L', (8, 1), color=255) # 8 pixeles blancos
    img.putpixel((0, 0), 0) # 1 pixel negro al inicio

    # Lógica hardcodeada en el send_to_printer
    bw_img = img.point(lambda x: 1 if x > 128 else 0, mode='1')
    raw_data = bw_img.tobytes()

    # El primer pixel (MSB) es negro (0), los otros 7 son blancos (1) -> 01111111 en binario -> 127
    assert len(raw_data) == 1
    assert raw_data[0] == 127
