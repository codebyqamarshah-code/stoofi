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

pages.forEach(page => {
  const filePath = path.join(basePath, page);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add useRef
    if (!content.includes('useRef')) {
      content = content.replace('useState, useMemo } from', 'useState, useMemo, useRef } from');
      content = content.replace('useState } from', 'useState, useRef } from');
    }
    
    const arrName = content.includes('const filtered = useMemo') ? 'filtered' : 'filteredLogs';
    
    // Add handleExport if not exists
    if (!content.includes('const handleExport')) {
      const exportFunc = `  const handleExport = (type) => {
    if (type === 'Print') {
      window.print();
      return;
    }
    if (${arrName}.length === 0) {
      alert('No data to export');
      return;
    }
    if (type === 'CSV' || type === 'Excel') {
      const headers = Object.keys(${arrName}[0] || {}).filter(k => k !== 'id' && k !== 'recordId');
      const csvData = ${arrName}.map(item => headers.map(h => item[h]).join(','));
      const blob = new Blob([[headers.join(','), '\\n', ...csvData].join('\\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`export_\${Date.now()}.csv\`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert(type + ' export started...');
    }
  };\n`;
      
      content = content.replace(`const ${arrName} = useMemo`, exportFunc + `\n  const ${arrName} = useMemo`);
    }
    
    // Update the UI buttons to have onClick
    const oldBtnsRegex = /\{\[FileText,\s*Download,\s*FileText,\s*Download,\s*Printer,\s*MoreVertical\]\.map\(\(Icon,\s*i\)\s*=>\s*\([\s\S]*?\}\)\}\}/g;
    
    const newBtns = `<button onClick={() => handleExport('Copy')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Copy"><FileText className="h-4 w-4" /></button>
              <button onClick={() => handleExport('Excel')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Excel"><Download className="h-4 w-4" /></button>
              <button onClick={() => handleExport('CSV')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="CSV"><FileText className="h-4 w-4" /></button>
              <button onClick={() => handleExport('PDF')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="PDF"><Download className="h-4 w-4" /></button>
              <button onClick={() => handleExport('Print')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Print"><Printer className="h-4 w-4" /></button>
              <button className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors" title="Columns"><MoreVertical className="h-4 w-4" /></button>`;
              
    content = content.replace(oldBtnsRegex, newBtns);
    
    // File upload logic for pages with BROWSE
    if (content.includes('BROWSE')) {
      if (!content.includes('fileInputRef')) {
        content = content.replace('const [editingId', 'const fileInputRef = useRef(null);\n  const [fileName, setFileName] = useState(\'\');\n  const [editingId');
        
        content = content.replace(
          /<Input type="text" placeholder="File" readOnly className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" \/>\s*<Button type="button" variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-white shrink-0"><Upload className="h-4 w-4 mr-2" \/> BROWSE<\/Button>/g,
          `<input type="file" ref={fileInputRef} className="hidden" onChange={e => setFileName(e.target.files[0]?.name || '')} />
                  <Input type="text" value={fileName} placeholder="File" readOnly className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
                  <Button type="button" onClick={() => fileInputRef.current?.click()} variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-white shrink-0"><Upload className="h-4 w-4 mr-2" /> BROWSE</Button>`
        );
        
        // Clear fileName on save
        content = content.replace(/setFormData\(\{/g, (match, offset, str) => {
          // only replace the one inside handleSave which is usually followed by some specific fields or inside a function block.
          // Better: replace inside handleSave
          return match;
        });
        
        content = content.replace('setEditingId(null);\n    } else', 'setEditingId(null);\n    }\n    setFileName(\'\');\n    else'.replace('    else', '    } else'));
        // actually easier to just clear it where we do setFormData
        content = content.replace('setFormData({ purpose', 'setFileName(\'\');\n    setFormData({ purpose');
        content = content.replace('setFormData({ toTitle', 'setFileName(\'\');\n    setFormData({ toTitle');
        content = content.replace('setFormData({ fromTitle', 'setFileName(\'\');\n    setFormData({ fromTitle');
        content = content.replace('setFormData({ complaintBy', 'setFileName(\'\');\n    setFormData({ complaintBy');
      }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + page);
  }
});
