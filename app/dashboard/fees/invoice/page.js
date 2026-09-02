'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Plus } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FeesInvoicePage() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/fees-invoice');
      if (res.success) setRecords(res.data);
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Fees Invoice</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Fees</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Fees Invoice</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" /> ADD
          </Button>
          <div className="relative w-48 sm:w-64 flex items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input placeholder="QUICK SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-transparent border-0 border-b border-zinc-800 text-xs focus-visible:ring-0 rounded-none focus-visible:border-emerald-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">SL</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Waiver</th>
                <th className="px-4 py-3 font-semibold">Fine</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Balance</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {records.length === 0 ? (
                <tr><td colSpan="9" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              ) : (
                records.map((r, i) => (
                  <tr key={r._id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3 text-indigo-500 font-medium">+{i+1}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.student}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.amount}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.waiver}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.fine}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.paid}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.balance}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-[10px] font-semibold rounded ${r.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{r.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
