import usb.core
import usb.util

VENDOR_ID = 0x0483
PRODUCT_ID = 0x5720

dev = usb.core.find(idVendor=VENDOR_ID, idProduct=PRODUCT_ID)
if dev is None:
    print("Impresora GEZI no encontrada en USB")
    exit(1)

if dev.is_kernel_driver_active(0):
    dev.detach_kernel_driver(0)

dev.set_configuration()

cfg = dev.get_active_configuration()
intf = cfg[(0,0)]
ep = usb.util.find_descriptor(
    intf,
    custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT
)

print("Enviando comando de calibración...")
ep.write(b"SIZE 50 mm, 30 mm\r\nGAP 2 mm, 0\r\nCLS\r\nTEXT 10,10,\"3\",0,1,1,\"KRONOS TEST\"\r\nPRINT 1\r\n")
print("Hecho.")
usb.util.dispose_resources(dev)
