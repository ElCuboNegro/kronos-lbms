from PIL import Image

# If back_img = back_img.rotate(180) makes the background black?
# No, we tested it.
# BUT WAIT. Does PIL `rotate` default to `fillcolor=0` (black) for SOME versions?
# Let's check PIL version.
import PIL
print(PIL.__version__)
