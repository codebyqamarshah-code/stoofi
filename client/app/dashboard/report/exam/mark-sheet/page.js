'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MarkSheetReportPage() {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Mark Sheet Report</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Report</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Exam Report</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Mark Sheet Report</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
        <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Search Keywords</Label>
            <Input 
              placeholder="Search..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class / Group</Label>
            <select 
              value={classFilter} 
              onChange={(e) => setClassFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Classes</option>
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-end">
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH REPORT
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Mark Sheet Report List</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"><Download className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 text-emerald-500 hover:text-white"><FileText className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 text-rose-500 hover:text-white"><Printer className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">SL</th>
                <th className="px-4 py-3 font-semibold">Student Name</th><th className="px-4 py-3 font-semibold">Roll No</th><th className="px-4 py-3 font-semibold">Class</th><th className="px-4 py-3 font-semibold">Exam</th><th className="px-4 py-3 font-semibold">Total Score</th><th className="px-4 py-3 font-semibold">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
