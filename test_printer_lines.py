import textwrap

ex = {
    "riego": "Agua destilada (60% - 80%)",
    "luz": "50,000 - 80,000 lux. Sol directo o semisombra muy brillante.",
    "temp": "15C - 25C",
    "ph": "4.5 - 5.5",
    "npk": "N/A",
    "humedad": "60% - 80%"
}

info_lines = [
    f"R:{ex.get('riego','—')} | H:{ex.get('humedad','—')}",
    f"L:{ex.get('luz','—')}",
    f"T:{ex.get('temp','—')}",
    f"pH:{ex.get('ph','—')} | NPK:{ex.get('npk','—')}"
]

print("Total space Y:", 240 // 2) # 120 pixels

y_back = 10
for line_txt in info_lines:
    lines = textwrap.wrap(line_txt, width=32)
    for line in lines:
        print(f"[{y_back}] {line}")
        y_back += 15 + 1
