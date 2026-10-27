'use client';

import { formatDateDMY } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';

const today = new Date().toISOString().split('T')[0];

export default function HolidayPage() {
  const [title, setTitle] = useState('');
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setFetching(true);
      const res = await api.get('/holiday');
      if (res?.success && Array.isArray(res.data)) {
        setHolidays(res.data);
      }
    } catch (e) {
      console.error('Failed to load holidays:', e);
    } finally {
      setFetching(false);
    }
  };

  const calculateDays = (from, to) => {
    try {
      const f = new Date(from), t = new Date(to);
      const diff = Math.ceil((t - f) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch { return 1; }
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!title || !title.trim()) return alert('Please enter Holiday Title');
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        fromDate,
        toDate,
        description: description.trim()
      };
      const res = await api.post('/holiday', payload);
      if (res?.success && res.data) {
        setHolidays(prev => [res.data, ...prev]);
        setSuccessMsg('Holiday added successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const newHoliday = {
          id: Date.now().toString(),
          title: title.trim(),
          fromDate,
          toDate,
          days: calculateDays(fromDate, toDate),
          description: description.trim(),
        };
        setHolidays(prev => [newHoliday, ...prev]);
      }
      setTitle(''); 
      setFromDate(today); 
      setToDate(today);
      setDescription(''); 
      setFile(null);
    } catch (err) {
      console.error('Failed to save holiday:', err);
      alert('Error saving holiday');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await api.delete(`/holiday/${id}`);
      setHolidays(prev => prev.filter(h => h.id !== id && h._id !== id));
      setSuccessMsg('Holiday deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to delete holiday:', err);
      setHolidays(prev => prev.filter(h => h.id !== id && h._id !== id));
    }
  };

  const filtered = holidays.filter(h => h.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-4">
        <span>Dashboard</span><ChevronRight className="w-3.5 h-3.5" />
        <span>System Settings</span><ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Holiday List</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Holiday Management</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4 h-fit">
          <h2 className="text-sm font-bold text-zinc-950">Add New Holiday</h2>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 block mb-1.5">HOLIDAY TITLE *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Vacation" className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 block mb-1.5">FROM DATE</label>
            <Input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 block mb-1.5">TO DATE</label>
            <Input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 block mb-1.5">DESCRIPTION</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Add details about the holiday..."
              className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-700 border border-zinc-300 rounded-lg px-3 py-2 bg-zinc-50 flex-1 truncate">
                {file ? file.name : 'Attach Document'}
              </span>
              <button onClick={() => fileRef.current.click()} className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer">
                BROWSE
              </button>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" onChange={e => setFile(e.target.files[0])} />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">(PDF, DOC, DOCX, JPG, PNG allowed)</p>
          </div>
          <button onClick={handleSave} disabled={loading} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer">
            {loading ? 'Saving...' : '✓ SAVE HOLIDAY'}
          </button>
        </div>

        {/* Holiday List Table */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-zinc-950">Holiday List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-300 rounded-lg px-2.5 py-1 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH..." className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-28 placeholder-zinc-400" />
              </div>
              <TableExportToolbar />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">SL</th>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">Holiday Title</th>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">From Date</th>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">To Date</th>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">Days</th>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">Details</th>
                  <th className="text-right py-2.5 px-3 text-zinc-700 font-bold text-xs">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-900">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-zinc-500 text-xs font-medium">No Data Available In Table</td></tr>
                ) : filtered.map((h, idx) => (
                  <tr key={h.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-3 text-zinc-600 font-semibold">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-zinc-950">{h.title}</td>
                    <td className="py-3 px-3 text-zinc-700 font-medium">{formatDateDMY(h.fromDate)}</td>
                    <td className="py-3 px-3 text-zinc-700 font-medium">{formatDateDMY(h.toDate)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-700">{h.days}</td>
                    <td className="py-3 px-3 text-zinc-600 max-w-32 truncate">{h.description}</td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => handleDelete(h.id)} className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs font-semibold text-zinc-600">
            <span>Showing {filtered.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 border border-zinc-300 rounded-lg hover:bg-zinc-100 cursor-pointer">←</button>
              <button className="px-2.5 py-1 bg-white text-zinc-950 rounded-lg cursor-default">1</button>
              <button className="px-2.5 py-1 border border-zinc-300 rounded-lg hover:bg-zinc-100 cursor-pointer">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}