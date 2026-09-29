const fs = require('fs');
const code = fs.readFileSync('client/app/dashboard/academics/class/page.js', 'utf8');
const backticks = (code.match(//g) || []).length;
console.log('Backticks count:', backticks);
