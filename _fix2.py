import re

base = r'C:\Users\Jeremy L\Desktop\no extension'
files = ['teabox.html', 'traderjoes.html', 'FIC.html', 'design-hub.html']

for fname in files:
    path = base + '\\' + fname
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    # Change nav background from rgba to solid white
    text = re.sub(
        r'background:\s*rgba\(255,\s*255,\s*255,\s*0\.92\)',
        'background: #ffffff',
        text
    )
    # Remove backdrop-filter from nav (not needed with solid bg)
    text = re.sub(r'\s*backdrop-filter:\s*blur\(12px\);', '', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'Updated {fname}')

# Fix FIC.html content-over-nav issue: ensure slide grid has z-index below nav
fic_path = base + '\\FIC.html'
with open(fic_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add position:relative and z-index:1 to .slide-grid so it stays below nav (z-index:100)
text = re.sub(
    r'(\.slide-grid\s*\{[^}]*?)(\})',
    lambda m: m.group(1) + ' position: relative; z-index: 1;' + m.group(2) if 'z-index' not in m.group(1) else m.group(0),
    text
)

with open(fic_path, 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed FIC.html z-index')
