'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">News Comment List</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-950">News Comment List</h1>
        <button
          onClick={handleReset}
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold shadow-xs text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> RESET DATATABLE DATA
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-950">News Comment List</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-zinc-200 rounded px-2 py-1">
              <Search className="w-3 h-3 text-zinc-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="QUICK SEARCH"
                className="bg-transparent text-xs text-zinc-950 outline-none w-32"
              />
            </div>
            <TableExportToolbar />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ SL</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Author</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Comment</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ In Response To</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Submitted On</th>
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
                  <tr key={item.id} className="border-b border-zinc-100/50 hover:bg-zinc-50/80">
                    <td className="py-3 px-3 text-zinc-600 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 text-zinc-200 font-medium">{item.author}</td>
                    <td className="py-3 px-3 text-zinc-700">{item.comment}</td>
                    <td className="py-3 px-3 text-zinc-950">{item.inResponseTo}</td>
                    <td className="py-3 px-3 text-zinc-700">{item.submittedOn}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-zinc-400">
          <span>Showing 0 to {filtered.length} of {filtered.length} entries</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 font-bold">←</button>
            <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-700 font-bold">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}