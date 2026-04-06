import os
path = r'C:\Users\SHUBHAM\Desktop\inFraVex'
with open(os.path.join(path, 'index.html'), 'r', encoding='utf-8') as f:
    html = f.read()
start = html.find('<style>')
end = html.find('</style>')
if start == -1 or end == -1:
    print('No <style> tag found')
    exit()
css = html[start+7:end].strip()
with open(os.path.join(path, 'main.css'), 'w', encoding='utf-8') as f:
    f.write(css)
new_html = html[:start] + '<link rel="stylesheet" href="main.css" />' + html[end+8:]
with open(os.path.join(path, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(new_html)
print(f'Done. CSS: {len(css)} chars. HTML: {len(new_html)} chars')
