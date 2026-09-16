const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/hr/staff-directory/[id]/page.js', 'utf8');

// Remove the import of mockStaffs
content = content.replace(
  "import { mockStaffs } from '@/services/mockData';",
  ""
);

// Remove the fallback to mockStaffs
content = content.replace(
  "// 2. Try localStorage\n      const stored = localStorage.getItem('stoofi_staffs');\n      if (stored) {\n        const parsed = JSON.parse(stored);\n        const s = parsed.find(x => x._id === id);\n        if (s) { setStaff(s); return; }\n      }\n\n      // 3. Try mock\n      const m = mockStaffs.find(x => String(x.id) === String(id) || String(x._id) === String(id));\n      if (m) setStaff(m);",
  "// No mock fallback needed"
);

fs.writeFileSync('client/app/dashboard/hr/staff-directory/[id]/page.js', content);
