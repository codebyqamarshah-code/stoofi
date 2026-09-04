'use client';

import Link from 'next/link';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AssignIncidentPage() {
  const [students] = useState([]);
  const [quickSearch, setQuickSearch] = useState('');
  const [filters, setFilters] = useState({ academicYear: '2026[Jan-Dec]', class: '', section: '', name: '', roll: '' });
  const [applied, setApplied] = useState(null);

  const handleSearch = () => setApplied({ ...filters });

  const filtered = useMemo(() => {
    if (!applied) return [];
    return students.filter(s => {
      if (quickSearch && !s.name.toLowerCase().includes(quickSearch.toLowerCase())) return false;
      if (applied.name && !s.name.toLowerCase().includes(applied.name.toLowerCase())) return false;
      if (applied.roll && s.admissionNo !== applied.roll) return false;
      if (applied.class && !s.class.toLowerCase().includes(applied.class.toLowerCase())) return false;
      return true;
    });
  }, [students, quickSearch, applied]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Assign Incident</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/behaviour/incidents" className="hover:text-emerald-400 transition-colors">Behaviour Records</Link><ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Assign Incident</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Academic Year <span className="text-rose-500">*</span></Label>
            <select value={filters.academicYear} onChange={e => setFilters({ ...filters, academicYear: e.target.value })}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="2025[Jan-Dec]">2025[Jan-Dec]</option>
              <option value="2026[Jan-Dec]">2026[Jan-Dec]</option>
              <option value="2027[Jan-Dec]">2027[Jan-Dec]</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class</Label>
            <select value={filters.class} onChange={e => setFilters({ ...filters, class: e.target.value })}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Class</option>
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
            <select value={filters.section} onChange={e => setFilters({ ...filters, section: e.target.value })}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Section</option>
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Search By Name</Label>
            <Input placeholder="Name" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Search By Roll</Label>
            <Input placeholder="Roll" value={filters.roll} onChange={e => setFilters({ ...filters, roll: e.target.value })}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
          </div>
          <div className="flex items-end justify-end">
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 w-full">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Assign Incident List</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input placeholder="QUICK SEARCH" value={quickSearch} onChange={e => setQuickSearch(e.target.value)}
                className="pl-9 w-[180px] bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs font-semibold uppercase" />
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
                <th className="px-4 py-3 font-semibold">Admission No.</th>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold">Class</th>
                <th className="px-4 py-3 font-semibold">Gender</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Total Points</th>
                <th className="px-4 py-3 font-semibold">Total Incidents</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(s => (
                <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3 text-zinc-300"><span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs">+{s.admissionNo}</span></td>
                  <td className="px-4 py-3 text-zinc-300 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.class}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.gender}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.phone || '-'}</td>
                  <td className="px-4 py-3 text-zinc-400">0</td>
                  <td className="px-4 py-3 text-zinc-400">0</td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">{applied || quickSearch ? 'No matching records found' : 'Use the criteria above to search for students'}</td></tr>
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
