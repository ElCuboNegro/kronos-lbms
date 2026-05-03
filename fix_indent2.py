import re
with open("printer_service/main.py", "r") as f:
    content = f.read()
content = content.replace("else:\n            # ETIQUETA DOBLABLE", "        else:\n            # ETIQUETA DOBLABLE")
with open("printer_service/main.py", "w") as f:
    f.write(content)
