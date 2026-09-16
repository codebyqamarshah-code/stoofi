const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/hr/staff-directory/page.js', 'utf8');

// Replace link to add-staff with link to profile
content = content.replace(
  /\/dashboard\/hr\/add-staff\?id=\$\{item\._id\}/g,
  "/dashboard/hr/staff-directory/${item._id}"
);

fs.writeFileSync('client/app/dashboard/hr/staff-directory/page.js', content);
