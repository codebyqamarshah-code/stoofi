'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfitLossPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Profit & Loss</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Accounts</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Accounts</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-zinc-950 font-bold">Profit & Loss</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-950">Profit & Loss Overview</h2>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs text-zinc-950" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">SL</th>
                <th className="px-4 py-3 font-semibold">Month</th><th className="px-4 py-3 font-semibold">Income</th><th className="px-4 py-3 font-semibold">Expense</th><th className="px-4 py-3 font-semibold">Net Profit/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
