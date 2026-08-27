'use client';

import React, { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function StudentIncidentReportPage() {
  const [filters, setFilters] = useState({ academicYear: '2026[Jan-Dec]', class: '', section: '' });
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = () => {
    if (!filters.class || !filters.section) {
      alert('Please select Class and Section to continue.');
      return;
    }
    setIsSearched(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Student Incident Report</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span><ChevronRight className="h-4 w-4 mx-1" />
          <span>Behaviour Records</span><ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Student Incident Report</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Academic Year <span className="text-rose-500">*</span></Label>
            <select value={filters.academicYear} onChange={e => setFilters({ ...filters, academicYear: e.target.value })}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="2026[Jan-Dec]">2026[Jan-Dec]</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
            <select value={filters.class} onChange={e => setFilters({ ...filters, class: e.target.value })}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Class *</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section <span className="text-rose-500">*</span></Label>
            <select value={filters.section} onChange={e => setFilters({ ...filters, section: e.target.value })}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Section *</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <div className="md:col-span-3 flex items-end justify-end">
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>

      {isSearched && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden p-12 flex flex-col items-center justify-center text-zinc-500">
          <h3 className="text-lg font-bold text-white mb-2">Student Incident Report</h3>
          <p className="text-sm">No incidents found for <span className="text-emerald-400">{filters.class} - Section {filters.section}</span> in {filters.academicYear}.</p>
        </div>
      )}
    </div>
  );
}
