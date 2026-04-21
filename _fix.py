import os, re

base = r'C:\Users\Jeremy L\Desktop\no extension'
files = ['teabox.html', 'traderjoes.html', 'FIC.html', 'design-hub.html']

for fname in files:
    path = os.path.join(base, fname)
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(r'--bg:\s*#f8f6f2', '--bg: #ffffff', text)
    text = re.sub(r'background:\s*rgba\(248,246,242,[^)]+\)', 'background: rgba(255,255,255,0.92)', text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'Updated {fname}')
