'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
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
        <h1 className="text-2xl font-bold text-zinc-950">Assign Incident</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/behaviour/incidents" className="hover:text-zinc-500 transition-colors">Behaviour Records</Link><ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Assign Incident</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-950">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Academic Year <span className="text-rose-500">*</span></Label>
            <select value={filters.academicYear} onChange={e => setFilters({ ...filters, academicYear: e.target.value })}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="2025[Jan-Dec]">2025[Jan-Dec]</option>
              <option value="2026[Jan-Dec]">2026[Jan-Dec]</option>
              <option value="2027[Jan-Dec]">2027[Jan-Dec]</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Class</Label>
            <select value={filters.class} onChange={e => setFilters({ ...filters, class: e.target.value })}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-900 dark:text-zinc-900 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Class</option>
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Section</Label>
            <select value={filters.section} onChange={e => setFilters({ ...filters, section: e.target.value })}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-900 dark:text-zinc-900 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Section</option>
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Search By Name</Label>
            <Input placeholder="Name" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })}
              className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Search By Roll</Label>
            <Input placeholder="Roll" value={filters.roll} onChange={e => setFilters({ ...filters, roll: e.target.value })}
              className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" />
          </div>
          <div className="flex items-end justify-end">
            <Button onClick={handleSearch} className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold flex items-center gap-2 w-full">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-950">Assign Incident List</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input placeholder="QUICK SEARCH" value={quickSearch} onChange={e => setQuickSearch(e.target.value)}
                className="pl-9 w-[180px] bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600 text-xs font-semibold uppercase" />
            </div>
            <TableExportToolbar />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
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
                <tr key={s.id} className="border-b border-zinc-200/50 hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-zinc-950"><span className="bg-zinc-600/10 text-zinc-500 border border-zinc-600/20 px-2 py-0.5 rounded text-xs">+{s.admissionNo}</span></td>
                  <td className="px-4 py-3 text-zinc-950 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-zinc-700">{s.class}</td>
                  <td className="px-4 py-3 text-zinc-700">{s.gender}</td>
                  <td className="px-4 py-3 text-zinc-700">{s.phone || '-'}</td>
                  <td className="px-4 py-3 text-zinc-700">0</td>
                  <td className="px-4 py-3 text-zinc-700">0</td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">{applied || quickSearch ? 'No matching records found' : 'Use the criteria above to search for students'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
            <Button variant="outline" size="sm" className="h-7 px-2 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}