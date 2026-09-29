const fs = require('fs');
const code = fs.readFileSync('client/app/dashboard/academics/class/page.js', 'utf8');
const tags = [];
const tagRegex = /<\/?([a-zA-Z0-9]+)[^>]*?(\/?)>/g;
let match;
while ((match = tagRegex.exec(code)) !== null) {
  const isClosing = match[0].startsWith('</');
  const isSelfClosing = match[2] === '/';
  const tagName = match[1];
  
  // Skip inputs that might not have self-closing slash but are void elements in HTML
  if (['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tagName.toLowerCase())) {
    continue; // Treat as self-closing
  }
  
  if (isSelfClosing) continue;
  
  if (!isClosing) {
    tags.push({name: tagName, line: code.substring(0, match.index).split('\\n').length});
  } else {
    const last = tags.pop();
    if (!last || last.name !== tagName) {
      console.log('Mismatch! Found </' + tagName + '> but expected </' + (last ? last.name : 'NONE') + '> around line ' + code.substring(0, match.index).split('\\n').length);
      break;
    }
  }
}
if (tags.length > 0) {
  console.log('Unclosed tags:', tags);
} else {
  console.log('All tags balanced!');
}
