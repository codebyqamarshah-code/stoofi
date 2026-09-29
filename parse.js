const fs = require('fs');
const babel = require('@babel/parser');
const code = fs.readFileSync('client/app/dashboard/academics/class/page.js', 'utf8');

try {
  babel.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('Babel parsing successful');
} catch (e) {
  console.log('Babel Error:', e.message);
}
