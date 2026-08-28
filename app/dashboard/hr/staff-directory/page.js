'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function StaffDirectoryPage() {
  const [records, setRecords] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const getName = (arr, id) => arr.find(x => x._id === id)?.name || '-';
  const filtered = records.filter(r => (r.firstName + ' ' + r.lastName).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Staff Directory</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard/hr/staff-directory" className="hover:text-emerald-400 transition-colors">Human Resource</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Staff Directory</span>
        </div>
      </div>
      
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Staff Directory List</h2>
          <div className="relative w-64"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">SL</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Join Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              : filtered.map((item, idx) => (
                <tr key={item._id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-emerald-500">+{idx+1}</td>
                  <td className="px-4 py-3 font-medium text-zinc-300">{item.firstName} {item.lastName}</td>
                  <td className="px-4 py-3 text-zinc-400">{item.email || '-'}</td>
                  <td className="px-4 py-3 text-zinc-400">{item.phone || '-'}</td>
                  <td className="px-4 py-3 text-zinc-400">{getName(designations, item.designationId)}</td>
                  <td className="px-4 py-3 text-zinc-400">{getName(departments, item.departmentId)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {item.status || 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{item.joinDate ? new Date(item.joinDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
