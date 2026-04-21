import re

base = r'C:\Users\Jeremy L\Desktop\no extension'
files = ['teabox.html', 'traderjoes.html', 'FIC.html', 'design-hub.html']

replacements = [
    # slide thumb resting shadow
    (r'box-shadow:\s*0 2px 8px rgba\(0,0,0,0\.06\)',
     'box-shadow: 0 2px 8px rgba(100,116,160,0.07)'),
    # slide thumb hover shadow
    (r'box-shadow:\s*0 6px 20px rgba\(0,0,0,0\.12\)',
     'box-shadow: 0 6px 20px rgba(100,116,160,0.13)'),
    # design-hub card hover shadow
    (r'box-shadow:\s*0 12px 32px rgba\(0,0,0,0\.09\)',
     'box-shadow: 0 12px 32px rgba(100,116,160,0.10)'),
]

for fname in files:
    path = base + '\\' + fname
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'Updated {fname}')
