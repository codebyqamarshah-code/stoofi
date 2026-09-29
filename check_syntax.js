const fs = require('fs');
const code = fs.readFileSync('client/app/dashboard/academics/class/page.js', 'utf8');
let openBraces = 0, openParens = 0, openBrackets = 0;
for (let i = 0; i < code.length; i++) {
  if (code[i] === '{') openBraces++;
  if (code[i] === '}') openBraces--;
  if (code[i] === '(') openParens++;
  if (code[i] === ')') openParens--;
  if (code[i] === '[') openBrackets++;
  if (code[i] === ']') openBrackets--;
}
console.log('Braces:', openBraces, 'Parens:', openParens, 'Brackets:', openBrackets);
