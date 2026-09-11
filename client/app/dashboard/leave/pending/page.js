'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function PendingLeavePage() {
  const [records, setRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      const [rRes, sRes, ltRes] = await Promise.all([
        api.get('/leave'), api.get('/staff'), api.get('/leave-type')
      ]);
      if (rRes.success) setRecords(rRes.data.filter(r => r.status === 'pending' || !r.status));
      if (sRes.success) setStaff(sRes.data);
      if (ltRes.success) setLeaveTypes(ltRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/leave/${id}`, { status });
      if (res.success) fetchAll();
    } catch (e) { alert(e.message); }
  };

  const getName = (arr, id, field = 'name') => arr.find(x => x._id === id)?.[field] || '-';
  const filtered = records.filter(r => getName(staff, r.staffId, 'firstName').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Pending Leave Request</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard/leave/apply" className="hover:text-zinc-500 transition-colors">Leave</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-zinc-600">Pending Leave Request</span>
        </div>
      </div>
      
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Pending Request List</h2>
          <div className="relative w-64"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="Search Staff..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-zinc-600" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Leave Type</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500">No Pending Requests</td></tr>
              : filtered.map((item, idx) => (
                <tr key={item._id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-zinc-600">+{idx+1}</td>
                  <td className="px-4 py-3 font-medium text-zinc-300">{getName(staff, item.staffId, 'firstName')} {getName(staff, item.staffId, 'lastName')}</td>
                  <td className="px-4 py-3 text-zinc-400">{getName(leaveTypes, item.leaveTypeId)}</td>
                  <td className="px-4 py-3 text-zinc-400">{item.fromDate ? new Date(item.fromDate).toLocaleDateString() : '-'} - {item.toDate ? new Date(item.toDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => handleUpdateStatus(item._id, 'approved')} variant="outline" size="sm" className="h-8 border-zinc-600/30 text-zinc-600 hover:bg-zinc-600/10">APPROVE</Button>
                      <Button onClick={() => handleUpdateStatus(item._id, 'rejected')} variant="outline" size="sm" className="h-8 border-rose-500/30 text-rose-500 hover:bg-rose-500/10">REJECT</Button>
                    </div>
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
