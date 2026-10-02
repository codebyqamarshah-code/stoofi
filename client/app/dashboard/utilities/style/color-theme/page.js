'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ColorThemePage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Color Theme</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Utilities</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Style</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-zinc-950 font-bold">Color Theme</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-950">Color Theme Overview</h2>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-white border-zinc-200 text-xs text-zinc-950" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-4 py-3 font-semibold">SL</th>
                <th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Details</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Action</th>
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
