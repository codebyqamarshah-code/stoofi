'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function ApplyLeavePage() {
  const [records, setRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  
  const [formData, setFormData] = useState({ staffId: '', leaveTypeId: '', fromDate: '', toDate: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      const [rRes, sRes, ltRes] = await Promise.all([
        api.get('/leave'), api.get('/staff'), api.get('/leave-type')
      ]);
      if (rRes.success) setRecords(rRes.data);
      if (sRes.success) setStaff(sRes.data);
      if (ltRes.success) setLeaveTypes(ltRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/leave', formData);
      if (res.success) { setFormData({ staffId: '', leaveTypeId: '', fromDate: '', toDate: '', reason: '' }); fetchAll(); }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { const res = await api.delete(`/leave/${id}`); if (res.success) fetchAll(); } catch (e) { alert(e.message); }
  };

  const getName = (arr, id, field = 'name') => arr.find(x => x._id === id)?.[field] || '-';
  const filtered = records.filter(r => getName(staff, r.staffId, 'firstName').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Apply Leave</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard/leave/apply" className="hover:text-emerald-400 transition-colors">Leave</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Apply Leave</span>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800"><h2 className="text-lg font-semibold text-white">Apply Leave</h2></div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Staff *</Label>
                <select value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})} className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
                  <option value="">Select Staff</option>
                  {staff.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Leave Type *</Label>
                <select value={formData.leaveTypeId} onChange={e => setFormData({...formData, leaveTypeId: e.target.value})} className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
                  <option value="">Select Type</option>
                  {leaveTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">From Date *</Label><Input type="date" value={formData.fromDate} onChange={e => setFormData({...formData, fromDate: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" required /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">To Date *</Label><Input type="date" value={formData.toDate} onChange={e => setFormData({...formData, toDate: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" required /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Reason</Label><textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" /></div>

              <Button disabled={submitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                {submitting ? 'APPLYING...' : 'APPLY LEAVE'}
              </Button>
            </form>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Leave List</h2>
              <div className="relative w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Leave Type</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  : filtered.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-3 text-emerald-500">+{idx+1}</td>
                      <td className="px-4 py-3 text-zinc-300">{getName(staff, item.staffId, 'firstName')}</td>
                      <td className="px-4 py-3 text-zinc-400">{getName(leaveTypes, item.leaveTypeId)}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {item.fromDate ? new Date(item.fromDate).toLocaleDateString() : '-'} to {item.toDate ? new Date(item.toDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : item.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {item.status || 'pending'}
                        </span>
                      </td>
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
