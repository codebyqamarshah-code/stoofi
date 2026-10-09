'use client';

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

export default function FrontClassRoutinePage() {
  const [routines, setRoutines] = useState([]);
  const [title, setTitle] = useState('');
  const [publishDate, setPublishDate] = useState(today);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();

  const handleAdd = () => {
    if (!title) return alert('Please enter Title');
    const newRoutine = {
      id: Date.now(),
      sl: routines.length + 1,
      title,
      date: publishDate,
      fileName: file ? file.name : 'routine.pdf'
    };
    setRoutines(prev => [...prev, newRoutine]);
    setTitle('');
    setPublishDate(today);
    setFile(null);
  };

  const handleDelete = (id) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = routines.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">Front Class Routine</span>
      </div>

      <h1 className="text-xl font-bold text-zinc-950 mb-6">Front Class Routine</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Routine Form */}
        <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-950">Front Class Routine</h2>
          
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">TITLE *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">PUBLISH DATE *</label>
            <input
              type="date"
              value={publishDate}
              onChange={e => setPublishDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          {/* Result File Upload */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">RESULT FILE *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-700 border border-zinc-200 rounded px-3 py-2 bg-zinc-800 flex-1 truncate">
                {file ? file.name : 'Result File *'}
              </span>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-950 text-sm font-semibold px-4 py-2 rounded cursor-pointer"
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
            className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold text-sm py-2 rounded flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> ADD
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-950">Front Class Routine list</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-200 rounded px-2 py-1">
                <Search className="w-3 h-3 text-zinc-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH"
                  className="bg-transparent text-xs text-zinc-950 outline-none w-28"
                />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ SL</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Title</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Date</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500 text-sm">
                      No Data Available In Table
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id} className="border-b border-zinc-200/50 hover:bg-zinc-100">
                      <td className="py-3 px-3 text-zinc-600 font-medium">{idx + 1}</td>
                      <td className="py-3 px-3 text-zinc-200 font-medium">{item.title}</td>
                      <td className="py-3 px-3 text-zinc-700">{item.date}</td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                            className="border border-zinc-600 text-zinc-950 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-zinc-600 hover:text-zinc-500"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === item.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-white border border-zinc-200 shadow-xs rounded-lg shadow-xl z-20 py-1">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
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
            <span>Showing 0 to {filtered.length} of {filtered.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100">←</button>
              <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}