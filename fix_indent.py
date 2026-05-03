with open("printer_service/main.py", "r") as f:
    lines = f.readlines()

with open("printer_service/main.py", "w") as f:
    for line in lines:
        if line.startswith("            engine = LabelEngine()"):
            f.write("engine = LabelEngine()\n")
        elif line.startswith("            def send_to_printer(img: Image):"):
            f.write("def send_to_printer(img: Image):\n")
        elif line.startswith("            VENDOR_ID = 0x0483"):
            f.write("    VENDOR_ID = 0x0483\n")
        elif line.startswith("            PRODUCT_ID = 0x5720"):
            f.write("    PRODUCT_ID = 0x5720\n")
        elif line.startswith("            dev = usb.core.find(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)"):
            f.write("    dev = usb.core.find(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)\n")
        elif line.startswith("            if dev is None:"):
            f.write("    if dev is None:\n")
        elif line.startswith("            raise Exception(\"Impresora GEZI no encontrada en USB\")"):
            f.write("        raise Exception(\"Impresora GEZI no encontrada en USB\")\n")
        elif line.startswith("            if dev.is_kernel_driver_active(0):"):
            f.write("    if dev.is_kernel_driver_active(0):\n")
        elif line.startswith("            dev.detach_kernel_driver(0)"):
            f.write("        dev.detach_kernel_driver(0)\n")
        elif line.startswith("            dev.set_configuration()"):
            f.write("    dev.set_configuration()\n")
        elif line.startswith("            cfg = dev.get_active_configuration()"):
            f.write("    cfg = dev.get_active_configuration()\n")
        elif line.startswith("            intf = cfg[(0,0)]"):
            f.write("    intf = cfg[(0,0)]\n")
        elif line.startswith("            ep = usb.util.find_descriptor("):
            f.write("    ep = usb.util.find_descriptor(\n")
        elif line.startswith("            intf,"):
            f.write("        intf,\n")
        elif line.startswith("            custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT"):
            f.write("        custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT\n")
        elif line.startswith("            )"):
            f.write("    )\n")
        elif line.startswith("            if ep is None:"):
            f.write("    if ep is None:\n")
        elif line.startswith("            raise Exception(\"No se encontró el endpoint de salida USB\")"):
            f.write("        raise Exception(\"No se encontró el endpoint de salida USB\")\n")
        elif line.startswith("            # Preparar comandos TSPL"):
            f.write("    # Preparar comandos TSPL\n")
        elif line.startswith("            # El comando BITMAP requiere los datos en formato bit-stream"):
            f.write("    # El comando BITMAP requiere los datos en formato bit-stream\n")
        elif line.startswith("            # Cada byte = 8 píxeles. En esta GEZI, 1 es BLANCO y 0 es NEGRO."):
            f.write("    # Cada byte = 8 píxeles. En esta GEZI, 1 es BLANCO y 0 es NEGRO.\n")
        elif line.startswith("            # Nuestra imagen original es 255 (blanco), 0 (negro)."):
            f.write("    # Nuestra imagen original es 255 (blanco), 0 (negro).\n")
        elif line.startswith("            bw_img = img.point(lambda x: 1 if x > 128 else 0, mode='1')"):
            f.write("    bw_img = img.point(lambda x: 1 if x > 128 else 0, mode='1')\n")
        elif line.startswith("            raw_data = bw_img.tobytes()"):
            f.write("    raw_data = bw_img.tobytes()\n")
        else:
            f.write(line)
