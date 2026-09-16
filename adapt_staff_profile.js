const fs = require('fs');
let source = fs.readFileSync('client/app/dashboard/students/[id]/page.js', 'utf8');

let content = source.replace(/student/g, 'staff');
content = content.replace(/Student/g, 'Staff');
content = content.replace(/students/g, 'hr/staff-directory'); 
content = content.replace(/api\.get\(\`\/staff\/\${id}\`\)/g, "api.get(`/teacher/${id}`)"); 

fs.writeFileSync('client/app/dashboard/hr/staff-directory/[id]/page.js', content);
