const fs = require('fs');
const path = require('path');
const basePath = 'c:/Users/QAMAR SHAH/Desktop/eskooly admin/client/app/dashboard/admin';
const pages = [
  'visitor-book/page.js',
  'phone-call-log/page.js',
  'postal-dispatch/page.js',
  'postal-receive/page.js',
  'complaint/page.js',
  'setup/page.js',
  'id-card/page.js',
  'certificate/page.js'
];

const newBtns = `<button onClick={() => handleExport('Copy')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Copy"><FileText className="h-4 w-4" /></button>
              <button onClick={() => handleExport('Excel')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Excel"><Download className="h-4 w-4" /></button>
              <button onClick={() => handleExport('CSV')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="CSV"><FileText className="h-4 w-4" /></button>
              <button onClick={() => handleExport('PDF')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="PDF"><Download className="h-4 w-4" /></button>
              <button onClick={() => handleExport('Print')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Print"><Printer className="h-4 w-4" /></button>
              <button className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors" title="Columns"><MoreVertical className="h-4 w-4" /></button>`;

pages.forEach(page => {
  const filePath = path.join(basePath, page);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the buttons
    content = content.replace(/\{\[FileText,\s*Download,\s*FileText,\s*Download,\s*Printer,\s*MoreVertical\]\.map\(\(Icon,\s*i\)\s*=>\s*\([\s\S]*?\}\)\}\}/g, newBtns);
    
    // Fix the syntax error in handleSave
    content = content.replace('    }\n    setFileName(\'\');\n    } else {', '    } else {');
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
