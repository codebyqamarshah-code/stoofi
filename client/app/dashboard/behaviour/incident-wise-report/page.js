'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function IncidentWiseReportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [reports] = useState([]);

  const filtered = reports.filter(r =>
    r.incident.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Incident Wise Report</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/behaviour/incidents" className="hover:text-zinc-500 transition-colors">Behaviour Records</Link><ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Incident Wise Report</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Incident Wise Report</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input placeholder="SEARCH" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 w-[180px] bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-xs font-semibold uppercase" />
            </div>
            <div className="flex items-center border border-zinc-800 rounded-md bg-zinc-900">
              {[FileText, Download, FileText, Download, Printer, MoreVertical].map((Icon, i) => (
                <button key={i} className={`p-2 hover:bg-zinc-800 text-zinc-400 transition-colors ${i < 5 ? 'border-r border-zinc-800' : ''}`}><Icon className="h-4 w-4" /></button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Incidents</th>
                <th className="px-4 py-3 font-semibold">Students</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3 text-zinc-300 font-medium">{r.incident}</td>
                  <td className="px-4 py-3 text-zinc-400">{r.students}</td>
                </tr>
              )) : (
                <tr><td colSpan="2" className="px-4 py-8 text-center text-zinc-500">{searchQuery ? 'No matching records found' : 'No Data Available In Table'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
            <Button variant="outline" size="sm" className="h-7 px-2 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
