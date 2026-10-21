'use client';

import { Input } from '@/components/ui/input';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
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
  Plus
} from 'lucide-react';

const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

export default function FrontResultPage() {
  const [results, setResults] = useState([]);
  const [title, setTitle] = useState('');
  const [publishDate, setPublishDate] = useState(today);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();

  const handleAdd = () => {
    if (!title) return alert('Please enter Title');
    const newResult = {
      id: Date.now(),
      sl: results.length + 1,
      title,
      date: publishDate,
      fileName: file ? file.name : 'result.pdf'
    };
    setResults(prev => [...prev, newResult]);
    setTitle('');
    setPublishDate(today);
    setFile(null);
  };

  const handleDelete = (id) => {
    setResults(prev => prev.filter(r => r.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = results.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">Front Result</span>
      </div>

      <h1 className="text-xl font-bold text-zinc-950 mb-6">Front Result</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Result Form */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Front Result</h2>
          
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">TITLE *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter result title..."
              className="w-full bg-white border border-zinc-300 text-zinc-900 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">PUBLISH DATE *</label>
            <Input
              type="date"
              value={publishDate}
              onChange={e => setPublishDate(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-900 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all shadow-xs"
            />
          </div>

          {/* Result File Upload */}
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">RESULT FILE *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-600 border border-zinc-300 rounded-xl px-3.5 py-2.5 bg-zinc-50 flex-1 truncate shadow-xs">
                {file ? file.name : 'Result File *'}
              </span>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] cursor-pointer shrink-0"
              >
                BROWSE
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={e => setFile(e.target.files[0])}
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
              (jpg,png,jpeg,pdf are allowed for upload)
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full bg-[#009966] hover:bg-[#008055] text-white font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> ADD
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Front Result List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH"
                  className="bg-transparent text-xs text-zinc-900 outline-none w-28"
                />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase tracking-wider">↓ SL</th>
                  <th className="text-left py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase tracking-wider">↓ Title</th>
                  <th className="text-left py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase tracking-wider">↓ Date</th>
                  <th className="text-left py-2.5 px-3.5 text-zinc-800 font-bold text-xs uppercase tracking-wider">↓ Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500 text-sm">
                      No Data Available In Table
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 text-zinc-900 font-semibold">{r.sl || i + 1}</td>
                      <td className="py-2.5 px-3.5 text-zinc-900 font-medium">{r.title}</td>
                      <td className="py-2.5 px-3.5 text-zinc-600">{formatDateDMY(r.date)}</td>
                      <td className="py-2.5 px-3.5 relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === r.id ? null : r.id)}
                          className="flex items-center gap-1 border border-zinc-300 hover:border-[#009966] text-xs font-semibold px-2.5 py-1 rounded-lg bg-white text-zinc-700 hover:text-[#009966] transition-all cursor-pointer"
                        >
                          Select <ChevronDown className="w-3 h-3" />
                        </button>
                        {openDropdownId === r.id && (
                          <div className="absolute right-0 top-8 z-10 bg-white border border-zinc-200 rounded-xl shadow-lg p-1 min-w-[100px]">
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}