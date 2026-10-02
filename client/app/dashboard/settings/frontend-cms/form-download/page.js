'use client';
import { useState, useRef } from 'react';
import { 
  ChevronRight, 
  Search, 
  Copy, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  Columns, 
  ChevronDown,
  Trash2,
  Plus,
  FileDown,
  GripVertical
} from 'lucide-react';

const INITIAL_FORMS = [
  { id: 1, title: 'Student Admission Application Form 2026', description: 'Official enrollment application form for all grades', fileName: 'admission_form_2026.pdf', size: '1.4 MB' },
  { id: 2, title: 'Scholarship & Financial Aid Request Form', description: 'Need-based and merit scholarship application document', fileName: 'scholarship_request.pdf', size: '850 KB' },
  { id: 3, title: 'School Leaving / Migration Certificate Request', description: 'Transfer certificate and clearance form for outgoing students', fileName: 'migration_clearance.pdf', size: '620 KB' },
];

export default function FormDownloadPage() {
  const [forms, setForms] = useState(INITIAL_FORMS);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();

  const handleAdd = () => {
    if (!title) return alert('Please enter Form Title');
    const newForm = {
      id: Date.now(),
      title,
      description: description || 'Official institution document',
      fileName: file ? file.name : 'document.pdf',
      size: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB'
    };
    setForms(prev => [...prev, newForm]);
    setTitle('');
    setDescription('');
    setFile(null);
  };

  const handleDelete = (id) => {
    setForms(prev => prev.filter(f => f.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = forms.filter(f => 
    f.title.toLowerCase().includes(search.toLowerCase()) || 
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-500">Form Download</span>
      </div>

      <h1 className="text-xl font-bold text-white">Form Download</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Add Downloadable Form</h2>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">TITLE *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">DESCRIPTION</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
            />
          </div>

          {/* Document File Upload */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">DOCUMENT FILE *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 border border-zinc-700 rounded px-3 py-2 bg-zinc-800 flex-1 truncate">
                {file ? file.name : 'Choose file (PDF/DOC)'}
              </span>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold px-4 py-2 rounded cursor-pointer"
              >
                BROWSE
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={e => setFile(e.target.files[0])}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full bg-zinc-800 hover:bg-zinc-800 text-white font-semibold text-sm py-2 rounded flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> ADD FORM
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Downloadable Forms List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-700 rounded px-2 py-1">
                <Search className="w-3 h-3 text-zinc-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH"
                  className="bg-transparent text-xs text-zinc-300 outline-none w-28"
                />
              </div>
              <div className="flex gap-1">
                {[Copy, FileSpreadsheet, FileText, Printer, Download, Columns].map((Icon, i) => (
                  <button key={i} className="p-1 text-zinc-400 hover:text-zinc-500">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ SL</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Title</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ File / Size</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Download</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 text-sm">
                      No Data Available In Table
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-3 text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab" />
                          <span className="text-zinc-600 font-medium">{idx + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-zinc-200 font-medium block">{item.title}</span>
                        <span className="text-zinc-500 text-xs">{item.description}</span>
                      </td>
                      <td className="py-3 px-3 text-zinc-300">
                        <span className="text-xs text-zinc-400 font-mono">{item.fileName}</span>
                        <span className="text-[10px] text-zinc-500 block">({item.size})</span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => alert(`Downloading: ${item.fileName}`)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-100 hover:text-zinc-500 text-zinc-300 text-xs font-semibold rounded-md border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5 text-zinc-500" /> Download
                        </button>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                            className="border border-zinc-600 text-zinc-300 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-zinc-600 hover:text-zinc-500 cursor-pointer"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === item.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-zinc-400">
            <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">←</button>
              <button className="px-2 py-1 bg-zinc-800 text-white rounded">1</button>
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

