'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Trash2, Upload, X, Check } from 'lucide-react';
import api from '@/services/api';

const ROLES = ['admin', 'teacher', 'staff', 'accountant'];
const ITEMS_PER_PAGE = 10;
const TODAY = new Date().toISOString().split('T')[0];

const STATUS_COLORS = {
  present: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  absent: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  late: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  'half-day': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
};

export default function StaffAttendancePage() {
  const [staff, setStaff] = useState([]);
  const [records, setRecords] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(TODAY);
  const [page, setPage] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    api.get('/staff').then(r => { if (r.success) setStaff(r.data); }).catch(() => {});
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/staff-attendance');
      if (res.success) {
        let data = res.data;
        if (attendanceDate) data = data.filter(r => r.date && r.date.startsWith(attendanceDate));
        setRecords(data);
      }
    } catch (e) { console.error(e); setRecords([]); } finally { setLoading(false); setPage(1); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { await api.delete(`/staff-attendance/${id}`); setRecords(r => r.filter(x => x._id !== id)); } catch (e) { alert(e.message); }
  };

  const getStaff = (id) => staff.find(s => s._id === id);

  const handleCopy = () => navigator.clipboard.writeText(records.map(r => { const s = getStaff(r.staffId); return `${s?.firstName || ''} ${s?.lastName || ''} | ${r.date} | ${r.status}`; }).join('\n')).then(() => alert('Copied!'));

  const handleCSV = () => {
    const csv = 'Name,Date,Status,Remarks\n' + records.map(r => { const s = getStaff(r.staffId); return `"${s?.firstName || ''} ${s?.lastName || ''}","${r.date}","${r.status}","${r.remarks || ''}"`; }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'staff-attendance.csv'; a.click();
  };

  const handlePDF = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Staff Attendance</title><style>body{font-family:sans-serif}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px}th{background:#f0f0f0}</style></head><body><h2>Staff Attendance - ${attendanceDate}</h2><table><tr><th>#</th><th>Name</th><th>Date</th><th>Status</th></tr>${records.map((r, i) => { const s = getStaff(r.staffId); return `<tr><td>${i+1}</td><td>${s?.firstName || ''} ${s?.lastName || ''}</td><td>${r.date || ''}</td><td>${r.status}</td></tr>`; }).join('')}</table></body></html>`);
    win.document.close(); win.print();
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><body><h2>Staff Attendance</h2><ul>${records.map(r => { const s = getStaff(r.staffId); return `<li>${s?.firstName || ''} - ${r.status}</li>`; }).join('')}</ul></body></html>`);
    win.document.close(); win.print();
  };

  const totalPages = Math.max(1, Math.ceil(records.length / ITEMS_PER_PAGE));
  const paginated = records.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Attendance</h1>
          <div className="flex items-center text-sm text-zinc-400 mt-1">
            <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
            <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
            <Link href="/dashboard/hr/staff-directory" className="hover:text-emerald-400 transition-colors">Human Resource</Link>
            <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
            <span className="text-emerald-400 font-medium">Staff Attendance</span>
          </div>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition-colors self-start"
        >
          <Upload className="h-4 w-4" /> + IMPORT ATTENDANCE
        </button>
      </div>

      {/* Criteria Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-md">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-base font-bold text-white">Select Criteria</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">ROLE <span className="text-rose-500">*</span></label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Select Role *</option>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Attendance Date <span className="text-rose-500">*</span></label>
              <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSearch} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-md transition-colors">
              <Search className="h-4 w-4" /> SEARCH
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-md">
          <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white">Attendance List</h2>
            <div className="flex items-center gap-1">
              <button onClick={handleCopy} title="Copy" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={handleCSV} title="Excel" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><FileSpreadsheet className="h-3.5 w-3.5" /></button>
              <button onClick={handlePDF} title="PDF" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><FileText className="h-3.5 w-3.5" /></button>
              <button onClick={handleCSV} title="Download" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><Download className="h-3.5 w-3.5" /></button>
              <button onClick={handlePrint} title="Print" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><Printer className="h-3.5 w-3.5" /></button>
              <button title="Columns" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><Columns className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/60 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">SL</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-500">Searching...</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-500">No Data Available In Table</td></tr>
                ) : paginated.map((item, idx) => {
                  const s = getStaff(item.staffId);
                  return (
                    <tr key={item._id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-3 text-emerald-500 font-medium">{(page - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                      <td className="px-4 py-3 text-zinc-300 font-medium">{s ? `${s.firstName || ''} ${s.lastName || ''}` : '-'}</td>
                      <td className="px-4 py-3 text-zinc-400">{item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${STATUS_COLORS[item.status] || 'text-zinc-400'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{item.remarks || '-'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(item._id)} className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-colors border border-rose-500/30">
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
            <span>Showing {records.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, records.length)} of {records.length} entries</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 rounded border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-400 transition-colors">←</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs font-bold transition-colors ${p === page ? 'bg-emerald-600 text-white' : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 rounded border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-400 transition-colors">→</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowImportModal(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Import Attendance</h3>
              <button onClick={() => setShowImportModal(false)} className="text-zinc-400 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">Upload CSV File</label>
                <input type="file" accept=".csv" className="mt-2 w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700" />
              </div>
              <p className="text-xs text-zinc-500">CSV format: Name, Date (YYYY-MM-DD), Status (present/absent/late/half-day), Remarks</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 rounded-md transition-colors">Cancel</button>
                <button className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md flex items-center gap-2 transition-colors">
                  <Check className="h-4 w-4" /> Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

