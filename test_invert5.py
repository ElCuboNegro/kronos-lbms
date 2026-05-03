from PIL import Image, ImageDraw

width = 399
height = 239

img = Image.new('L', (width, height), color=255)
# Make a black block
draw = ImageDraw.Draw(img)
draw.rectangle([0,0,10,10], fill=0)

# Convert to 1 bit
bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')

raw = bw_img.tobytes()

# The user says: "imprimiste en negro con letras y QR blanco, como si hubieras invertido colores."
# But wait! I printed earlier: "Orden enviada a impresora térmica LOCALMENTE. Status: 200"
# And before I sent the new layout, I said: "Acabo de enviar ambos comandos nuevamente a través del USB: Una prueba de texto ("HOLA MUNDO GEZI"). La etiqueta gráfica del cultivo de Sphagnum que diseñamos."
# AND THEN the user replied: "reimprime una etiqueta de Darlingtonia".
# Which means the Sphagnum label CAME OUT PERFECTLY! (White background, black text).
# So the logic of `bw_img = img.point(lambda x: 0 if x > 128 else 1, mode='1')` WAS CORRECT.
# The ONLY THING THAT CHANGED between the working Sphagnum label and this broken one is THE NEW LAYOUT CODE!
