'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import {
  ChevronRight, ChevronDown, Search, Check, Copy,
  FileSpreadsheet, FileText, Printer, Download, Columns, Pencil, Trash2
} from 'lucide-react';
import api from '@/services/api';

const ITEMS_PER_PAGE = 10;

export default function DesignationPage() {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);

  const fetchAll = async () => {
    try {
      const res = await api.get('/designation');
      if (res.success) setRecords(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const handler = () => setOpenDropdown(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    try {
      setSubmitting(true);
      if (editId) {
        const res = await api.put(`/designation/${editId}`, formData);
        if (res.success) { setFormData({ name: '' }); setEditId(null); fetchAll(); }
      } else {
        const res = await api.post('/designation', formData);
        if (res.success) { setFormData({ name: '' }); fetchAll(); }
      }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name });
    setEditId(item._id);
    setOpenDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setFormData({ name: '' }); setEditId(null); };

  const handleDelete = async (id) => {
    setOpenDropdown(null);
    if (!confirm('Are you sure you want to delete this designation?')) return;
    try { await api.delete(`/designation/${id}`); fetchAll(); } catch (e) { alert(e.message); }
  };

  const handleCopy = () => {
    const text = filtered.map(r => r.name).join('\n');
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  };

  const handleCSV = () => {
    const csv = 'Designation\n' + filtered.map(r => `"${r.name}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'designations.csv'; a.click();
  };

  const handlePDF = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Designations</title><style>body{font-family:sans-serif}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px}th{background:#f0f0f0}</style></head><body><h2>Designation List</h2><table><tr><th>#</th><th>Designation</th></tr>${filtered.map((r, i) => `<tr><td>${i + 1}</td><td>${r.name}</td></tr>`).join('')}</table></body></html>`);
    win.document.close(); win.print();
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><body><h2>Designation List</h2><ul>${filtered.map(r => `<li>${r.name}</li>`).join('')}</ul></body></html>`);
    win.document.close(); win.print();
  };

  const filtered = records.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-white dark:text-white">Designation</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
          <Link href="/dashboard/hr/staff-directory" className="hover:text-emerald-400 transition-colors">Human Resource</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
          <span className="text-emerald-400 font-medium">Designation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-md">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-base font-bold text-white">{editId ? 'Edit Designation' : 'Add Designation'}</h2>
            </div>
            <form className="p-5 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  DESIGNATION TITLE <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 rounded-md border border-zinc-700 bg-transparent px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter designation title"
                  required
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition-colors disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {submitting ? 'SAVING...' : editId ? 'UPDATE DESIGNATION' : 'SAVE DESIGNATION'}
                </button>
                {editId && (
                  <button type="button" onClick={cancelEdit} className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm rounded-md transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-md">
            <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-white">Designation List</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="SEARCH"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-700 bg-transparent text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleCopy} title="Copy" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
                  <button onClick={handleCSV} title="Excel" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><FileSpreadsheet className="h-3.5 w-3.5" /></button>
                  <button onClick={handlePDF} title="PDF" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><FileText className="h-3.5 w-3.5" /></button>
                  <button onClick={handleCSV} title="Download" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><Download className="h-3.5 w-3.5" /></button>
                  <button onClick={handlePrint} title="Print" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><Printer className="h-3.5 w-3.5" /></button>
                  <button title="Columns" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><Columns className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/60 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">
                      <span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">Designation <ChevronDown className="h-3 w-3" /></span>
                    </th>
                    <th className="px-4 py-3">
                      <span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">Action <ChevronDown className="h-3 w-3" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {loading ? (
                    <tr><td colSpan={2} className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={2} className="px-4 py-10 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : paginated.map((item) => (
                    <tr key={item._id} className={`hover:bg-zinc-900/50 transition-colors ${editId === item._id ? 'bg-emerald-950/20 border-l-2 border-l-emerald-500' : ''}`}>
                      <td className="px-4 py-3 text-zinc-300 font-medium">{item.name}</td>
                      <td className="px-4 py-3">
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === item._id ? null : item._id); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          >
                            SELECT <ChevronDown className="h-3 w-3" />
                          </button>
                          {openDropdown === item._id && (
                            <div className="absolute left-0 top-full mt-1 z-50 bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl min-w-[130px]" onClick={e => e.stopPropagation()}>
                              <button onClick={() => handleEdit(item)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                                <Pencil className="h-3.5 w-3.5 text-emerald-400" /> Edit
                              </button>
                              <button onClick={() => handleDelete(item._id)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-300 hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
                                <Trash2 className="h-3.5 w-3.5 text-rose-400" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
              <span>Showing {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 rounded border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-400 transition-colors">←</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs font-bold transition-colors ${p === page ? 'bg-emerald-600 text-white' : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 rounded border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-400 transition-colors">→</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

