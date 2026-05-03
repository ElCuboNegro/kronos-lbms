with open("printer_service/main.py", "r") as f:
    c = f.read()

c = c.replace("y_back = 12            for line_txt in info_lines:", "y_back = 12\n            for line_txt in info_lines:")

with open("printer_service/main.py", "w") as f:
    f.write(c)
