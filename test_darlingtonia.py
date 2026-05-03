import textwrap

ex = {
    "ph": "4.5 - 5.5",
    "luz": "50,000 - 80,000 lux. Sol directo",
    "riego": "Agua destilada",
    "temp": "15C - 25C",
    "npk": ""
}
info_lines = [f"R:{ex.get('riego','—')}", f"L:{ex.get('luz','—')}", f"T:{ex.get('temp','—')}", f"pH:{ex.get('ph','—')} | NPK:{ex.get('npk','—')}"]

max_chars = 32
for line in info_lines:
    lines = textwrap.wrap(line, width=max_chars)
    for l in lines:
        print(l)
