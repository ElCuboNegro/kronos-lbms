import numpy as np

# In `test_new_layout.png`, the mean is 0.123.
# Since it's mode '1', True (1) is visually WHITE (or in numpy it maps to 255 if converted to L, but as bool it is True).
# False (0) is visually BLACK.
# Mean = 0.123 means 12.3% of the pixels are True.
# 87.7% of the pixels are False.
# If False is Black, that means 87.7% of the image is BLACK!
print("Ah! The image saved by test_new_layout.py was mostly BLACK!")
