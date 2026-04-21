import os

base = r'C:\Users\Jeremy L\Desktop\no extension'

page_contexts = {
    'index.html': 'Portfolio Home',
    'contact.html': 'Contact',
    'portfolio.html': 'Portfolio',
    'design-hub.html': 'Design Hub',
    'teabox.html': 'Packaging Series of Three',
    'traderjoes.html': "Trader Joe's Mobile App",
    'FIC.html': 'Foundation for Intentional Community',
    'Customersegmentation.html': 'Customer Segmentation',
    'predictingpotentialcustomers.html': 'Predicting Potential Customers',
    'healthcare_case_study.html': 'Healthcare Case Study',
    'SFAIF_case_study_full.html': 'SFAIF Case Study',
}

widget = '''  <link rel="stylesheet" href="widget.css">
  <script src="widget.js" data-worker-url="https://portfolio-chat-worker.jeremylangdon.workers.dev" data-page-context="{context}"></script>
'''

for fname, context in page_contexts.items():
    path = os.path.join(base, fname)
    if not os.path.exists(path):
        print(f'Skipped (not found): {fname}')
        continue
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    if 'widget.js' in text:
        print(f'Already has widget: {fname}')
        continue
    snippet = widget.format(context=context)
    text = text.replace('</body>', snippet + '</body>')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'Added widget: {fname}')
