'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function DueFeesPermissionPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      const res = await api.get('/role');
      if (res.success) setRecords(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleToggle = async (id, currentVal) => {
    try {
      const role = records.find(r => r._id === id);
      let perms = role.permissions || [];
      if (perms.includes('DUE_FEES_LOGIN')) perms = perms.filter(p => p !== 'DUE_FEES_LOGIN');
      else perms.push('DUE_FEES_LOGIN');
      
      const res = await api.put(`/role/${id}`, { permissions: perms });
      if (res.success) fetchAll();
    } catch (e) { alert(e.message); }
  };

  const filtered = records.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Due Fees Login Permission</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard/roles/role" className="hover:text-emerald-400 transition-colors">Role & Permission</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Due Fees Login Permission</span>
        </div>
      </div>
      
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Roles List</h2>
          <div className="relative w-64"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="Search Role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Role Name</th><th className="px-4 py-3">Due Fees Login Allowed</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? <tr><td colSpan="3" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan="3" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              : filtered.map((item, idx) => {
                const hasPerm = item.permissions?.includes('DUE_FEES_LOGIN');
                return (
                <tr key={item._id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-emerald-500">+{idx+1}</td>
                  <td className="px-4 py-3 font-medium text-zinc-300">{item.name}</td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={hasPerm} onChange={() => handleToggle(item._id, hasPerm)} />
                      <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
