'use client';
import { useState } from 'react';
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
  X
} from 'lucide-react';

const INITIAL_PAGES = [];

export default function FrontendPagesListPage() {
  const [pages, setPages] = useState(INITIAL_PAGES);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');

  const handleAdd = () => {
    if (!title) return alert('Please enter Page Title');
    const newPage = {
      id: Date.now(),
      title,
      subTitle: subTitle || 'Page description'
    };
    setPages(prev => [...prev, newPage]);
    setTitle('');
    setSubTitle('');
    setIsAddModalOpen(false);
  };

  const handleDelete = (id) => {
    setPages(prev => prev.filter(p => p.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = pages.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.subTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-emerald-400">Pages</span>
      </div>

      <h1 className="text-xl font-bold text-white">Pages</h1>

      {/* Main Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-zinc-300">Page List</h2>
          
          <div className="flex items-center gap-3">
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
                <button key={i} className="p-1 text-zinc-400 hover:text-emerald-400">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> ADD
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Title</th>
                <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Sub Title</th>
                <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-zinc-500 text-sm">
                    No Data Available In Table
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-3 px-3 text-zinc-200 font-medium">{item.title}</td>
                    <td className="py-3 px-3 text-zinc-400">{item.subTitle}</td>
                    <td className="py-3 px-3 relative">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                          className="border border-zinc-600 text-zinc-300 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-emerald-500 hover:text-emerald-400 cursor-pointer"
                        >
                          SELECT <ChevronDown className="w-3 h-3" />
                        </button>
                        {openDropdownId === item.id && (
                          <div className="absolute right-0 mt-1 w-28 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
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
            <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">←</button>
            <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">→</button>
          </div>
        </div>
      </div>

      {/* Add Page Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Page</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">TITLE *</label>
                <input
                  type="text"
                  placeholder="Page Title *"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">SUB TITLE</label>
                <input
                  type="text"
                  placeholder="Sub Title"
                  value={subTitle}
                  onChange={e => setSubTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-lg cursor-pointer"
              >
                ✓ SAVE PAGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
