'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Eye, Zap } from 'lucide-react';
import api from '@/services/api';

const ROLES = ['admin', 'teacher', 'staff', 'accountant'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const ITEMS_PER_PAGE = 10;
const CY = new Date().getFullYear();
const YEARS = [CY - 2, CY - 1, CY, CY + 1, CY + 2];

const STATUS_COLORS = {
  paid: 'bg-zinc-600/15 text-zinc-500 border border-zinc-600/30',
  generated: 'bg-zinc-600/15 text-zinc-500 border border-zinc-600/30',
  pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
};

export default function PayrollPage() {
  const [staff, setStaff] = useState([]);
  const [records, setRecords] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(String(CY));
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/staff').then(r => { if (r.success) setStaff(r.data); }).catch(() => {});
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/payroll');
      if (res.success) {
        let data = res.data;
        if (month) data = data.filter(r => r.month === month);
        if (year) data = data.filter(r => String(r.year) === String(year));
        setRecords(data);
      } else {
        setRecords([]);
      }
    } catch (e) { console.error(e); setRecords([]); } finally { setLoading(false); setPage(1); }
  };

  const handleGenerate = async (item) => {
    try {
      await api.put(`/payroll/${item._id}`, { status: 'generated' });
      handleSearch();
    } catch (e) { alert(e.message); }
  };

  const getStaff = (id) => staff.find(s => s._id === id);

  const handleCopy = () => navigator.clipboard.writeText(records.map(r => { const s = getStaff(r.staffId); return `${s?.firstName || ''} | ${r.month} ${r.year} | Net: ${r.netSalary}`; }).join('\n')).then(() => alert('Copied!'));

  const handleCSV = () => {
    const csv = 'Name,Month,Year,Basic Salary,Allowances,Deductions,Net Salary,Status\n' + records.map(r => {
      const s = getStaff(r.staffId);
      return `"${s?.firstName || ''} ${s?.lastName || ''}","${r.month}","${r.year}","${r.basicSalary || 0}","${r.allowances || 0}","${r.deductions || 0}","${r.netSalary || 0}","${r.status || 'pending'}"`;
    }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'payroll.csv'; a.click();
  };

  const handlePDF = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Payroll</title><style>body{font-family:sans-serif}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px}th{background:#f0f0f0}</style></head><body><h2>Payroll - ${month} ${year}</h2><table><tr><th>#</th><th>Name</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net</th><th>Status</th></tr>${records.map((r, i) => { const s = getStaff(r.staffId); return `<tr><td>${i+1}</td><td>${s?.firstName || ''} ${s?.lastName || ''}</td><td>${r.basicSalary || 0}</td><td>${r.allowances || 0}</td><td>${r.deductions || 0}</td><td>${r.netSalary || 0}</td><td>${r.status || 'pending'}</td></tr>`; }).join('')}</table></body></html>`);
    win.document.close(); win.print();
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><body><h2>Payroll ${month} ${year}</h2><ul>${records.map(r => { const s = getStaff(r.staffId); return `<li>${s?.firstName || ''} - Net: ${r.netSalary || 0}</li>`; }).join('')}</ul></body></html>`);
    win.document.close(); win.print();
  };

  const totalPages = Math.max(1, Math.ceil(records.length / ITEMS_PER_PAGE));
  const paginated = records.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Generate Payroll</h1>
          <div className="flex items-center text-sm text-zinc-400 mt-1">
            <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
            <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
            <Link href="/dashboard/hr/staff-directory" className="hover:text-zinc-500 transition-colors">Human Resource</Link>
            <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
            <span className="text-zinc-500 font-medium">Generate Payroll</span>
          </div>
        </div>
      </div>

      {/* Criteria Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-md">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-base font-bold text-white">Select Criteria</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Role <span className="text-rose-500">*</span></label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600">
                <option value="">Role *</option>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Month</label>
              <select value={month} onChange={e => setMonth(e.target.value)} className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Year</label>
              <select value={year} onChange={e => setYear(e.target.value)} className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSearch} className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-800 text-white text-sm font-bold rounded-md transition-colors">
              <Search className="h-4 w-4" /> SEARCH
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-md">
          <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white">Payroll List ? {month} {year}</h2>
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
                  <th className="px-4 py-3">Staff Name</th>
                  <th className="px-4 py-3">Month/Year</th>
                  <th className="px-4 py-3">Basic Salary</th>
                  <th className="px-4 py-3">Allowances</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Net Salary</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-zinc-500">Searching...</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-zinc-500">No Data Available In Table</td></tr>
                ) : paginated.map((item, idx) => {
                  const s = getStaff(item.staffId);
                  const net = (Number(item.basicSalary) || 0) + (Number(item.allowances) || 0) - (Number(item.deductions) || 0);
                  return (
                    <tr key={item._id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-3 text-zinc-600 font-medium">{(page - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                      <td className="px-4 py-3 text-zinc-300 font-medium">{s ? `${s.firstName || ''} ${s.lastName || ''}` : '-'}</td>
                      <td className="px-4 py-3 text-zinc-400">{item.month} {item.year}</td>
                      <td className="px-4 py-3 text-zinc-300">{Number(item.basicSalary || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-zinc-500">{Number(item.allowances || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-rose-400">{Number(item.deductions || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-white font-bold">{net.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${STATUS_COLORS[item.status] || STATUS_COLORS.pending}`}>
                          {item.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {(!item.status || item.status === 'pending') && (
                            <button onClick={() => handleGenerate(item)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-zinc-500 hover:text-zinc-400 hover:bg-zinc-600/10 rounded-md border border-zinc-600/30 transition-colors">
                              <Zap className="h-3 w-3" /> Generate
                            </button>
                          )}
                          <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-zinc-500 hover:text-zinc-400 hover:bg-zinc-600/10 rounded-md border border-zinc-600/30 transition-colors">
                            <Eye className="h-3 w-3" /> View
                          </button>
                        </div>
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 rounded border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-400 transition-colors">?</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs font-bold transition-colors ${p === page ? 'bg-zinc-800 text-white' : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 rounded border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-400 transition-colors">?</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

