'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function PayrollPage() {
  const [records, setRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({ staffId: '', month: '', year: '', basicSalary: '', allowances: '', deductions: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      const [rRes, sRes] = await Promise.all([api.get('/payroll'), api.get('/staff')]);
      if (rRes.success) setRecords(rRes.data);
      if (sRes.success) setStaff(sRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const b = Number(formData.basicSalary) || 0;
      const a = Number(formData.allowances) || 0;
      const d = Number(formData.deductions) || 0;
      const netSalary = b + a - d;
      
      const res = await api.post('/payroll', { ...formData, netSalary });
      if (res.success) { setFormData({ staffId: '', month: '', year: '', basicSalary: '', allowances: '', deductions: '' }); fetchAll(); }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { const res = await api.delete(`/payroll/${id}`); if (res.success) fetchAll(); } catch (e) { alert(e.message); }
  };

  const getName = (arr, id, field = 'name') => arr.find(x => x._id === id)?.[field] || '-';
  const filtered = records.filter(r => getName(staff, r.staffId, 'firstName').toLowerCase().includes(search.toLowerCase()));

  const b = Number(formData.basicSalary) || 0;
  const a = Number(formData.allowances) || 0;
  const d = Number(formData.deductions) || 0;
  const currNet = b + a - d;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Payroll</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard/hr/staff-directory" className="hover:text-emerald-400 transition-colors">Human Resource</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Payroll</span>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800"><h2 className="text-lg font-semibold text-white">Generate Payroll</h2></div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Staff *</Label>
                <select value={formData.staffId} onChange={e => {
                  const s = staff.find(x => x._id === e.target.value);
                  setFormData({...formData, staffId: e.target.value, basicSalary: s?.salary || ''});
                }} className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
                  <option value="">Select Staff</option>
                  {staff.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Month</Label><select value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"><option value="">Month</option>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Year</Label><Input value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" placeholder="YYYY" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Basic Salary</Label><Input type="number" value={formData.basicSalary} onChange={e => setFormData({...formData, basicSalary: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" required /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Allowances</Label><Input type="number" value={formData.allowances} onChange={e => setFormData({...formData, allowances: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Deductions</Label><Input type="number" value={formData.deductions} onChange={e => setFormData({...formData, deductions: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Net Salary (Auto)</Label><Input type="number" value={currNet} readOnly className="bg-zinc-900 border-zinc-800 text-zinc-500 bg-opacity-50" /></div>
              <Button disabled={submitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                {submitting ? 'GENERATING...' : 'GENERATE PAYROLL'}
              </Button>
            </form>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Payroll List</h2>
              <div className="relative w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Month/Year</th><th className="px-4 py-3">Basic</th><th className="px-4 py-3">Net Salary</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  : filtered.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-3 text-emerald-500">+{idx+1}</td>
                      <td className="px-4 py-3 font-medium text-zinc-300">{getName(staff, item.staffId, 'firstName')} {getName(staff, item.staffId, 'lastName')}</td>
                      <td className="px-4 py-3 text-zinc-400">{item.month} {item.year}</td>
                      <td className="px-4 py-3 text-zinc-400">${item.basicSalary}</td>
                      <td className="px-4 py-3 font-bold text-emerald-500">${item.netSalary}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${item.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{item.status || 'pending'}</span></td>
                      <td className="px-4 py-3"><Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10">DELETE</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
