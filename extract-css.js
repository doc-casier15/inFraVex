const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>');
if (styleStart === -1 || styleEnd === -1) {
  console.log('No <style> tag found - may already be extracted');
  process.exit(0);
}
const css = html.substring(styleStart + 7, styleEnd).trim();
fs.writeFileSync('main.css', css, 'utf8');
const newHtml = html.substring(0, styleStart) + '<link rel="stylesheet" href="main.css" />' + html.substring(styleEnd + 8);
fs.writeFileSync('index.html', newHtml, 'utf8');
console.log('Done. CSS:', css.length, 'chars extracted. HTML:', newHtml.length, 'chars remaining.');
