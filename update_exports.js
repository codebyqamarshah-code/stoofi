const fs = require('fs');
const path = require('path');

const pages = [
  'complaint/page.js',
  'postal-receive/page.js',
  'postal-dispatch/page.js',
  'phone-call-log/page.js'
];
const clientDir = 'c:/Users/QAMAR SHAH/Desktop/eskooly admin/client/app/dashboard/admin';

pages.forEach(file => {
  let content = fs.readFileSync(path.join(clientDir, file), 'utf8');

  const exportStart = content.indexOf('const handleExport = ');
  const exportEnd = content.indexOf('const filtered = ');

  if (exportStart !== -1 && exportEnd !== -1) {
    const newExport = `const handleExport = (type) => {
    if (filtered.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Create clean data without _id or v
    const exportData = filtered.map(item => {
      const clean = { ...item };
      delete clean._id;
      delete clean.__v;
      delete clean.createdAt;
      delete clean.updatedAt;
      return clean;
    });

    const headers = Object.keys(exportData[0] || {});
    const filename = \`export_\${Date.now()}\`;

    if (type === 'Print') {
      printData(exportData, headers, 'Export');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename);
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Export', filename);
    } else {
      alert(\`\${type} export started...\`);
    }
  };

  `;
    content = content.substring(0, exportStart) + newExport + content.substring(exportEnd);
    fs.writeFileSync(path.join(clientDir, file), content);
  }
});
console.log('Exports patched.');
