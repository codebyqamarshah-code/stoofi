'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import api from '@/services/api';

const ROLES = ['admin', 'teacher', 'staff', 'accountant', 'super admin', 'driver'];
const ITEMS_PER_PAGE = 10;

export default function StaffDirectoryPage() {
  const [records, setRecords] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [filterRole, setFilterRole] = useState('');
  const [filterStaffId, setFilterStaffId] = useState('');
  const [filterName, setFilterName] = useState('');
  const [quickSearch, setQuickSearch] = useState('');
  const [page, setPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);

  const fetchAll = async () => {
    try {
      const [stRes, desRes, depRes] = await Promise.all([
        api.get('/staff'), api.get('/designation'), api.get('/department')
      ]);
      if (stRes.success) setRecords(stRes.data);
      if (desRes.success) setDesignations(desRes.data);
      if (depRes.success) setDepartments(depRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    const h = () => setOpenDropdown(null);
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const handleSearch = () => { setSearched(true); setPage(1); };

  const handleDelete = async (id) => {
    setOpenDropdown(null);
    if (!confirm('Delete this staff member?')) return;
    try { await api.delete(`/staff/${id}`); fetchAll(); } catch (e) { alert(e.message); }
  };

  const handleToggleStatus = async (id, current) => {
    try {
      await api.put(`/staff/${id}`, { status: current === 'Active' ? 'Inactive' : 'Active' });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const getName = (arr, id) => arr.find(x => x._id === id)?.name || '-';

  const filtered = records.filter(r => {
    const nameMatch = !filterName || `${r.firstName} ${r.lastName}`.toLowerCase().includes(filterName.toLowerCase());
    const roleMatch = !filterRole || r.role === filterRole;
    const idMatch = !filterStaffId || String(r.staffNo || r._id).includes(filterStaffId);
    const qMatch = !quickSearch || `${r.firstName} ${r.lastName} ${r.email} ${r.role}`.toLowerCase().includes(quickSearch.toLowerCase());
    return nameMatch && roleMatch && idMatch && qMatch;
  });

  const displayRecords = searched ? filtered : records.filter(r => !quickSearch || `${r.firstName} ${r.lastName} ${r.email}`.toLowerCase().includes(quickSearch.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(displayRecords.length / ITEMS_PER_PAGE));
  const paginated = displayRecords.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCopy = () => navigator.clipboard.writeText(displayRecords.map(r => `${r.firstName} ${r.lastName} | ${r.role} | ${r.email}`).join('\n')).then(() => alert('Copied!'));
  const handleCSV = () => {
    const csv = 'Staff No,Name,Role,Department,Designation,Mobile,Email,Status\n' + displayRecords.map((r, i) => `"${i+1}","${r.firstName||''} ${r.lastName||''}","${r.role||''}","${getName(departments,r.departmentId)}","${getName(designations,r.designationId)}","${r.phone||r.mobile||''}","${r.email||''}","${r.status||'Active'}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'staff-list.csv'; a.click();
  };
  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Staff List</title><style>body{font-family:sans-serif;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px}th{background:#f0f0f0}</style></head><body><h2>Staff List</h2><table><tr><th>#</th><th>Name</th><th>Role</th><th>Department</th><th>Designation</th><th>Email</th><th>Status</th></tr>${displayRecords.map((r,i)=>`<tr><td>${i+1}</td><td>${r.firstName||''} ${r.lastName||''}</td><td>${r.role||''}</td><td>${getName(departments,r.departmentId)}</td><td>${getName(designations,r.designationId)}</td><td>${r.email||''}</td><td>${r.status||'Active'}</td></tr>`).join('')}</table></body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-white">Staff List</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
          <Link href="/dashboard/hr/add-staff" className="hover:text-zinc-500 transition-colors">Human Resource</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
          <span className="text-zinc-500 font-medium">Staff List</span>
        </div>
      </div>

      {/* Criteria Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-md">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Select Criteria</h2>
          <Link href="/dashboard/hr/add-staff" className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-800 text-white text-sm font-bold rounded-md transition-colors">
            <Plus className="h-4 w-4" /> ADD STAFF
          </Link>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">ROLE</label>
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600">
                <option value="">Role</option>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">SEARCH BY STAFF ID</label>
              <input type="text" value={filterStaffId} onChange={e => setFilterStaffId(e.target.value)} placeholder="Search By Staff Id" className="w-full h-10 rounded-md border border-zinc-700 bg-transparent px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">SEARCH BY NAME</label>
              <input type="text" value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="Search by Name" className="w-full h-10 rounded-md border border-zinc-700 bg-transparent px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600" />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSearch} className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-800 text-white text-sm font-bold rounded-md transition-colors">
              <Search className="h-4 w-4" /> SEARCH
            </button>
          </div>
        </div>
      </div>

      {/* Staff List Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-md">
        <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">Staff List</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input type="text" placeholder="QUICK SEARCH" value={quickSearch} onChange={e => { setQuickSearch(e.target.value); setPage(1); }} className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-700 bg-transparent text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 w-40" />
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleCopy} title="Copy" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={handleCSV} title="Excel" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><FileSpreadsheet className="h-3.5 w-3.5" /></button>
              <button title="PDF" className="p-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><FileText className="h-3.5 w-3.5" /></button>
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
                <th className="px-4 py-3"><span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">Staff No <ChevronDown className="h-3 w-3" /></span></th>
                <th className="px-4 py-3"><span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">Name <ChevronDown className="h-3 w-3" /></span></th>
                <th className="px-4 py-3"><span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">Role <ChevronDown className="h-3 w-3" /></span></th>
                <th className="px-4 py-3"><span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">Department <ChevronDown className="h-3 w-3" /></span></th>
                <th className="px-4 py-3"><span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">Designation <ChevronDown className="h-3 w-3" /></span></th>
                <th className="px-4 py-3"><span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">Mobile <ChevronDown className="h-3 w-3" /></span></th>
                <th className="px-4 py-3"><span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">Email <ChevronDown className="h-3 w-3" /></span></th>
                <th className="px-4 py-3"><span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">Status <ChevronDown className="h-3 w-3" /></span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-500">No Data Available In Table</td></tr>
              ) : paginated.map((item, idx) => (
                <tr key={item._id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === item._id ? null : item._id); }}
                        className="flex items-center gap-1 text-zinc-500 hover:text-zinc-400 font-bold"
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-zinc-600 text-xs">
                          <Plus className="h-3 w-3" />
                        </span>
                        <span className="ml-1 text-zinc-400 text-xs">{(page-1)*ITEMS_PER_PAGE + idx + 1}</span>
                      </button>
                      {openDropdown === item._id && (
                        <div className="absolute left-0 top-full mt-1 z-50 bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl min-w-[140px]" onClick={e => e.stopPropagation()}>
                          <Link href={`/dashboard/hr/add-staff?id=${item._id}`} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                            <Eye className="h-3.5 w-3.5 text-zinc-500" /> View / Edit
                          </Link>
                          <button onClick={() => handleDelete(item._id)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-300 hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5 text-rose-400" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 font-semibold cursor-pointer hover:text-zinc-400">
                    <Link href={`/dashboard/hr/add-staff?id=${item._id}`}>{item.firstName} {item.lastName}</Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 capitalize">{item.role || '-'}</td>
                  <td className="px-4 py-3 text-zinc-500">{getName(departments, item.departmentId)}</td>
                  <td className="px-4 py-3 text-zinc-500">{getName(designations, item.designationId)}</td>
                  <td className="px-4 py-3 text-zinc-400">{item.phone || item.mobile || '-'}</td>
                  <td className="px-4 py-3 text-zinc-400">{item.email || '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(item._id, item.status)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${item.status === 'Inactive' ? 'bg-zinc-600' : 'bg-zinc-800'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${item.status === 'Inactive' ? 'translate-x-1' : 'translate-x-4'}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
          <span>Showing {displayRecords.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, displayRecords.length)} of {displayRecords.length} entries</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 rounded border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-400 transition-colors">←</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs font-bold transition-colors ${p === page ? 'bg-zinc-800 text-white' : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 rounded border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-400 transition-colors">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

