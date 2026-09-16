const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/student/page.js', 'utf8');

content = content.replace(
  "setAdmissionNo(d.data.admissionNo || 'N/A');",
  "setAdmissionNo(d.data.admissionNo || 'N/A');\n          setStudentDetails(d.data);"
);

fs.writeFileSync('client/app/dashboard/student/page.js', content);
