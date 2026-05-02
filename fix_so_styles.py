import re

with open('frontend/src/pages/EspecieDetail.jsx', 'r') as f:
    c = f.read()

# Replace `so.overlay` and `so.sheet` and `so.title`
c = re.sub(r'style=\{so\.overlay\}', r'style={{position:"fixed",inset:0,background:"#0009",display:"flex",alignItems:"flex-end",zIndex:100}}', c)
c = re.sub(r'style=\{so\.sheet\}', r'style={{background:"var(--bio-surface)",borderRadius:"16px 16px 0 0",padding:"1.5rem",width:"100%",maxHeight:"88dvh",overflowY:"auto"}}', c)
c = re.sub(r'style=\{so\.title\}', r'style={{color:"var(--bio-primary)",margin:"0 0 1rem",fontSize:"1rem"}}', c)
c = re.sub(r'style=\{so\.form\}', r'style={{display:"flex",flexDirection:"column",gap:10}}', c)
c = re.sub(r'style=\{so\.actions\}', r'style={{display:"flex",gap:8,marginTop:4}}', c)

# Remove any remaining s.* which weren't caught
# Like <div style={s.page}> ... we already replaced this. Let's see if there are any s.something left.
c = re.sub(r'style=\{s\.[a-zA-Z0-9_]+\}', '', c)

with open('frontend/src/pages/EspecieDetail.jsx', 'w') as f:
    f.write(c)
