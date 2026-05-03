from PIL import Image

# Wait! The "Sphagnum" label I printed earlier...
# DID it print correctly?
# I asked: "La impresora térmica GEZI de tu escritorio... Si necesitas imprimir un código diferente... puedes hacerlo"
# The user replied: "pero no tengo ninguna impresion real. puedes intentar imprimir de nuevo?"
# AND THEN I printed the test string and the Sphagnum label again.
# The user replied: "reimprime una etiqueta de Darlingtonia"
# THEY DID NOT CONFIRM THE SPHAGNUM LABEL CAME OUT WHITE WITH BLACK TEXT!
# They just saw an old test print or maybe it ALSO came out black and they thought it was a test!

# Wait! I found the bug!
# `img.point(lambda x: 0 if x > 128 else 1, mode='1')`
# This maps white (255) -> 0.
# So `raw_data` has 0 bits where it was white.
# In TSPL, BITMAP mode says "1 is black, 0 is white".
# So 0 is white. Which is correct!
# BUT WAIT. In PIL, mode '1' packs pixels from LEFT TO RIGHT.
# But what if PIL's `point` mapped 0->1 and 1->0, but TSPL `BITMAP` EXPECTS INVERTED BITS?
# Or maybe the command is `BITMAP X,Y,W,H,1,` instead of `0,`?
# TSPL manual: BITMAP X, Y, width, height, mode, bitmap_data
# mode:
# 0: OVERWRITE
# 1: OR
# 2: XOR
# bitmap_data: "1 is black, 0 is white."
