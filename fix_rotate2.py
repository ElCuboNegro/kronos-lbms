with open("printer_service/main.py", "r") as f:
    lines = f.readlines()

with open("printer_service/main.py", "w") as f:
    for line in lines:
        if line.startswith("else:"):
            f.write("        else:\n")
        else:
            f.write(line)
