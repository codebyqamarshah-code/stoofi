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
  RotateCcw,
  Trash2
} from 'lucide-react';

const INITIAL_COMMENTS = [];

export default function NewsCommentsPage() {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [search, setSearch] = useState('');

  const handleReset = () => {
    setComments([]);
    setSearch('');
  };

  const handleDelete = (id) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const filtered = comments.filter(c => 
    c.author?.toLowerCase().includes(search.toLowerCase()) || 
    c.comment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-500">News Comment List</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">News Comment List</h1>
        <button
          onClick={handleReset}
          className="bg-zinc-800 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> RESET DATATABLE DATA
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-300">News Comment List</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-zinc-700 rounded px-2 py-1">
              <Search className="w-3 h-3 text-zinc-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="QUICK SEARCH"
                className="bg-transparent text-xs text-zinc-300 outline-none w-32"
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
                <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Author</th>
                <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Comment</th>
                <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ In Response To</th>
                <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Submitted On</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                    No Data Available In Table
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-3 px-3 text-zinc-600 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 text-zinc-200 font-medium">{item.author}</td>
                    <td className="py-3 px-3 text-zinc-400">{item.comment}</td>
                    <td className="py-3 px-3 text-zinc-300">{item.inResponseTo}</td>
                    <td className="py-3 px-3 text-zinc-400">{item.submittedOn}</td>
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
    </div>
  );
}
