'use client';
import { useState, useRef } from 'react';
import { ChevronRight, Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Trash2, Calendar } from 'lucide-react';
import api from '@/services/api';

const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '/');

export default function HolidayPage() {
  const [title, setTitle] = useState('');
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const calculateDays = (from, to) => {
    try {
      const f = new Date(from), t = new Date(to);
      const diff = Math.ceil((t - f) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch { return 1; }
  };

  const handleSave = async () => {
    if (!title) return alert('Please enter Holiday Title');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('fromDate', fromDate);
      formData.append('toDate', toDate);
      formData.append('description', description);
      if (file) formData.append('file', file);
      await api.post('/holiday', formData);
    } catch {}
    const newHoliday = {
      id: Date.now(),
      title,
      fromDate,
      toDate,
      days: calculateDays(fromDate, toDate),
      description,
    };
    setHolidays(prev => [...prev, newHoliday]);
    setTitle(''); setFromDate(today); setToDate(today);
    setDescription(''); setFile(null);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/holiday/${id}`); } catch {}
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  const filtered = holidays.filter(h => h.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span><ChevronRight className="w-3 h-3" />
        <span>System Settings</span><ChevronRight className="w-3 h-3" />
        <span className="text-zinc-500">Holiday List</span>
      </div>
      <h1 className="text-xl font-bold text-white mb-6">Holiday List</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Add Holiday</h2>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">HOLIDAY TITLE *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">FROM DATE</label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">TO DATE</label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">DESCRIPTION *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 border border-zinc-700 rounded px-3 py-2 bg-zinc-800 flex-1 truncate">
                {file ? file.name : 'Attach File'}
              </span>
              <button onClick={() => fileRef.current.click()} className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold px-3 py-2 rounded">
                BROWSE
              </button>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" onChange={e => setFile(e.target.files[0])} />
            </div>
            <p className="text-xs text-zinc-500 mt-1">(PDF,DOC,DOCX,JPG,JPEG,PNG,TXT are allowed for upload)</p>
          </div>
          <button onClick={handleSave} disabled={loading} className="w-full bg-zinc-800 hover:bg-zinc-800 text-white font-semibold text-sm py-2 rounded">
            {loading ? 'Saving...' : '✓ SAVE'}
          </button>
        </div>

        {/* Holiday List Table */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Holiday List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-700 rounded px-2 py-1">
                <Search className="w-3 h-3 text-zinc-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH" className="bg-transparent text-xs text-zinc-300 outline-none w-28" />
              </div>
              <div className="flex gap-1">
                {[Copy, FileSpreadsheet, FileText, Printer, Download, Columns].map((Icon, i) => (
                  <button key={i} className="p-1 text-zinc-400 hover:text-zinc-500"><Icon className="w-4 h-4" /></button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ SL</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Holiday Title</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ From Date</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ To Date</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Days</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Details</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-zinc-500 text-sm">No Data Available In Table</td></tr>
                ) : filtered.map((h, idx) => (
                  <tr key={h.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-2 px-3 text-zinc-600 font-medium">{idx + 1}</td>
                    <td className="py-2 px-3 text-zinc-200">{h.title}</td>
                    <td className="py-2 px-3 text-zinc-300">{h.fromDate}</td>
                    <td className="py-2 px-3 text-zinc-300">{h.toDate}</td>
                    <td className="py-2 px-3 text-zinc-300">{h.days}</td>
                    <td className="py-2 px-3 text-zinc-400 max-w-32 truncate">{h.description}</td>
                    <td className="py-2 px-3">
                      <button onClick={() => handleDelete(h.id)} className="text-rose-500 hover:text-rose-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-zinc-400">
            <span>Showing 0 to 0 of {filtered.length} entries</span>
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
