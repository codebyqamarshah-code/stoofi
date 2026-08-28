'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function TeacherWiseReportPage() {
  const [records, setRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [rRes, sRes] = await Promise.all([
        api.get('/teacher-evaluation'), api.get('/staff')
      ]);
      if (rRes.success) {
        setRecords(rRes.data);
      }
      if (sRes.success) setStaff(sRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSearch = () => {
    if (!teacherId) return setFiltered(records);
    setFiltered(records.filter(r => r.teacherId === teacherId));
  };

  const getName = (arr, id, field = 'name') => arr.find(x => x._id === id)?.[field] || '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Teacher Wise Report</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard/teacher-evaluation/approved-report" className="hover:text-emerald-400 transition-colors">Teacher Evaluation</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Teacher Wise Report</span>
        </div>
      </div>
      
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex gap-4 items-end">
        <div className="space-y-1.5 flex-1">
          <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Teacher</Label>
          <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Teachers</option>
            {staff.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
          </select>
        </div>
        <Button onClick={handleSearch} className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8"><Search className="h-4 w-4 mr-2" /> SEARCH</Button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Evaluation Report</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Teacher</th><th className="px-4 py-3">Criteria</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              : (filtered.length === 0 && records.length === 0) ? <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              : (filtered.length > 0 ? filtered : records).map((item, idx) => (
                <tr key={item._id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-emerald-500">+{idx+1}</td>
                  <td className="px-4 py-3 font-medium text-zinc-300">{getName(staff, item.teacherId, 'firstName')} {getName(staff, item.teacherId, 'lastName')}</td>
                  <td className="px-4 py-3 text-zinc-400">{item.criteria}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">{item.rating} / 5</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {item.status || 'pending'}
                    </span>
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
