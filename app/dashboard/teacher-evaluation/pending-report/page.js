'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function PendingReportPage() {
  const [records, setRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      const [rRes, sRes] = await Promise.all([
        api.get('/teacher-evaluation'), api.get('/staff')
      ]);
      if (rRes.success) setRecords(rRes.data.filter(r => r.status === 'pending' || !r.status));
      if (sRes.success) setStaff(sRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/teacher-evaluation/${id}`, { status });
      if (res.success) fetchAll();
    } catch (e) { alert(e.message); }
  };

  const getName = (arr, id, field = 'name') => arr.find(x => x._id === id)?.[field] || '-';
  const filtered = records.filter(r => getName(staff, r.teacherId, 'firstName').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Pending Report</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard/teacher-evaluation/approved-report" className="hover:text-emerald-400 transition-colors">Teacher Evaluation</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Pending Report</span>
        </div>
      </div>
      
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Pending Evaluations List</h2>
          <div className="relative w-64"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="Search Teacher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Teacher</th><th className="px-4 py-3">Criteria</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500">No Pending Reports</td></tr>
              : filtered.map((item, idx) => (
                <tr key={item._id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-emerald-500">+{idx+1}</td>
                  <td className="px-4 py-3 font-medium text-zinc-300">{getName(staff, item.teacherId, 'firstName')} {getName(staff, item.teacherId, 'lastName')}</td>
                  <td className="px-4 py-3 text-zinc-400">{item.criteria}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">{item.rating} / 5</td>
                  <td className="px-4 py-3 text-right">
                    <Button onClick={() => handleUpdateStatus(item._id, 'approved')} variant="outline" size="sm" className="h-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">APPROVE</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
