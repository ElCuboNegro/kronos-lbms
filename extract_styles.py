import re
with open('frontend/src/pages/EspecieDetail.jsx', 'r') as f:
    content = f.read()

styles = re.findall(r'style=\{\{(.*?)\}\}', content)
from collections import Counter
for s, count in Counter(styles).most_common():
    print(f"{count}: {s}")
