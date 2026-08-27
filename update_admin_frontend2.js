const fs = require('fs');
const path = require('path');

const pages = [
  {
    file: 'setup/page.js',
    apiRoute: '/setup',
    stateVar: 'setups',
    setState: 'setSetups'
  },
  {
    file: 'id-card/page.js',
    apiRoute: '/id-card',
    stateVar: 'cards',
    setState: 'setCards'
  },
  {
    file: 'certificate/page.js',
    apiRoute: '/certificate',
    stateVar: 'cards',
    setState: 'setCards'
  }
];

const clientDir = 'c:/Users/QAMAR SHAH/Desktop/eskooly admin/client/app/dashboard/admin';

pages.forEach(page => {
  let content = fs.readFileSync(path.join(clientDir, page.file), 'utf8');

  if (!content.includes("import api from '@/services/api';")) {
    content = content.replace(
      "import { Label } from '@/components/ui/label';",
      "import { Label } from '@/components/ui/label';\nimport api from '@/services/api';\nimport { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';"
    );
  }
  
  if (!content.includes('Loader2')) {
      content = content.replace("Edit, Trash2", "Edit, Trash2, Loader2");
  }

  const stateStr = "const [" + page.stateVar + ", " + page.setState + "] = useState([]);";
  if (content.includes(stateStr) && !content.includes('fetchData')) {
    const replacement = stateStr + "\n" +
"  const [loading, setLoading] = useState(true);\n" +
"  const [submitting, setSubmitting] = useState(false);\n" +
"  const fetchData = async () => {\n" +
"    try {\n" +
"      setLoading(true);\n" +
"      const res = await api.get('" + page.apiRoute + "');\n" +
"      if (res.success) " + page.setState + "(res.data);\n" +
"    } catch (error) {\n" +
"      alert(error.message || 'Failed to fetch data');\n" +
"    } finally {\n" +
"      setLoading(false);\n" +
"    }\n" +
"  };\n" +
"  useEffect(() => { fetchData(); }, []);\n";

    const startIdx = content.indexOf(stateStr);
    const endIdx = content.indexOf('const [searchQuery', startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
      content = content.substring(0, startIdx) + replacement + "\n  " + content.substring(endIdx);
    }
  }

  const handleSaveStart = content.indexOf('const handleSave = ');
  const handleSaveEnd = content.indexOf('const handleEdit = ');
  if (handleSaveStart !== -1 && handleSaveEnd !== -1 && !content.includes('const payload = { ...formData };')) {
    const handleSaveCode = "const handleSave = async (e) => {\n" +
"    e.preventDefault();\n" +
"    try {\n" +
"      setSubmitting(true);\n" +
"      const payload = { ...formData };\n" +
"      if (editingId) {\n" +
"        await api.put('" + page.apiRoute + "/' + editingId, payload);\n" +
"      } else {\n" +
"        await api.post('" + page.apiRoute + "', payload);\n" +
"      }\n" +
"      setEditingId(null);\n" +
"      fetchData();\n" +
"      if(typeof setShowForm === 'function') setShowForm(false);\n" +
"      const resetForm = {};\n" +
"      Object.keys(formData).forEach(k => resetForm[k] = '');\n" +
"      setFormData(resetForm);\n" +
"      if (typeof setFileName === 'function') setFileName('');\n" +
"    } catch (error) {\n" +
"      alert(error.message || 'Failed to save');\n" +
"    } finally {\n" +
"      setSubmitting(false);\n" +
"    }\n" +
"  };\n\n  ";
    content = content.substring(0, handleSaveStart) + handleSaveCode + content.substring(handleSaveEnd);
  }
  
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    let l = line;
    if (l.includes('setEditingId(') && l.includes('.id)')) {
        l = l.replace(/\.id\)/g, '._id)');
    }
    if (l.includes('setEditingId(') && l.includes('.recordId)')) {
        l = l.replace(/\.recordId\)/g, '._id)');
    }
    if (l.includes('handleDelete(') && l.includes('.id)')) {
        l = l.replace(/\.id\)/g, '._id)');
    }
    if (l.includes('handleDelete(') && l.includes('.recordId)')) {
        l = l.replace(/\.recordId\)/g, '._id)');
    }
    if (l.includes('key={') && l.includes('.id}')) {
        l = l.replace(/\.id\}/g, '._id}');
    }
    if (l.includes('key={') && l.includes('.recordId}')) {
        l = l.replace(/\.recordId\}/g, '._id}');
    }
    return l;
  });
  content = newLines.join('\n');

  const delRegex = /const handleDelete = \(id\) => \{[\s\S]*?set[A-Z][a-zA-Z]+\(.*filter.*\);?\s*\}\s*\};?/m;
  const matchDel = content.match(delRegex);
  if (matchDel && !content.includes('await api.delete')) {
    const delCode = "const handleDelete = async (id) => {\n" +
"    if (confirm('Are you sure you want to delete this record?')) {\n" +
"      try {\n" +
"        await api.delete('" + page.apiRoute + "/' + id);\n" +
"        " + page.setState + "(" + page.stateVar + ".filter(item => item._id !== id));\n" +
"      } catch (error) {\n" +
"        alert(error.message || 'Failed to delete');\n" +
"      }\n" +
"    }\n" +
"  };";
    content = content.replace(delRegex, delCode);
  }

  // Export patch
  const exportStart = content.indexOf('const handleExport = ');
  const exportEnd = content.indexOf('const filtered = ');

  if (exportStart !== -1 && exportEnd !== -1 && !content.includes('const exportData = filtered.map')) {
    const newExport = "const handleExport = (type) => {\n" +
"    if (filtered.length === 0) {\n" +
"      alert('No data to export');\n" +
"      return;\n" +
"    }\n" +
"    \n" +
"    const exportData = filtered.map(item => {\n" +
"      const clean = { ...item };\n" +
"      delete clean._id;\n" +
"      delete clean.__v;\n" +
"      delete clean.createdAt;\n" +
"      delete clean.updatedAt;\n" +
"      return clean;\n" +
"    });\n" +
"\n" +
"    const headers = Object.keys(exportData[0] || {});\n" +
"    const filename = `export_${Date.now()}`;\n" +
"\n" +
"    if (type === 'Print') {\n" +
"      printData(exportData, headers, 'Export');\n" +
"    } else if (type === 'CSV') {\n" +
"      exportToCSV(exportData, filename);\n" +
"    } else if (type === 'Excel') {\n" +
"      exportToExcel(exportData, filename);\n" +
"    } else if (type === 'PDF') {\n" +
"      exportToPDF(exportData, headers, 'Export', filename);\n" +
"    } else {\n" +
"      alert(`${type} export started...`);\n" +
"    }\n" +
"  };\n\n  ";
    content = content.substring(0, exportStart) + newExport + content.substring(exportEnd);
  }

  fs.writeFileSync(path.join(clientDir, page.file), content);
});

console.log('Frontend patched correctly.');
