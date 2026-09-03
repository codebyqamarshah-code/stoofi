'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function StudentPromotePage() {
  const [formData, setFormData] = useState({
    academicYear: '2026[Jan-Dec]',
    promoteSession: '',
    currentClass: '',
    section: ''
  });

  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = () => {
    if (formData.academicYear && formData.promoteSession && formData.currentClass && formData.section) {
      setIsSearched(true);
    } else {
      alert('Please select all criteria fields to search.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Student Promote</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/students" className="hover:text-emerald-400 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Student Promote</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Academic Year <span className="text-rose-500">*</span></Label>
            <select 
              value={formData.academicYear}
              onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="2026[Jan-Dec]">Select Academic Year *</option>
              <option value="2026[Jan-Dec]">2026[Jan-Dec]</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Promote Session <span className="text-rose-500">*</span></Label>
            <select 
              value={formData.promoteSession}
              onChange={(e) => setFormData({...formData, promoteSession: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="">Promote Academic Year *</option>
              <option value="2027[Jan-Dec]">2027[Jan-Dec]</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Current Class <span className="text-rose-500">*</span></Label>
            <select 
              value={formData.currentClass}
              onChange={(e) => setFormData({...formData, currentClass: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="">Select Current Class *</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section <span className="text-rose-500">*</span></Label>
            <select 
              value={formData.section}
              onChange={(e) => setFormData({...formData, section: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="">Select Section *</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          
          <div className="lg:col-span-4 flex items-end justify-end pt-2">
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>

      {isSearched && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mt-6 p-12 flex flex-col items-center justify-center text-zinc-500">
           <h3 className="text-lg font-bold text-white mb-2">Ready for Promotion</h3>
           <p className="text-sm">Students matching this criteria will appear here for batch promotion.</p>
           <p className="text-xs mt-2 text-zinc-600">(Add actual students in the Student List first)</p>
        </div>
      )}
    </div>
  );
}
