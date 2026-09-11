'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight, Search, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function MultiClassStudentPage() {
  const [formData, setFormData] = useState({
    academicYear: '2026[Jan-Dec]',
    class: '',
    section: '',
    student: ''
  });

  const handleSearch = () => {
    // Mock search action
    console.log('Searching for:', formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Multi Class Student</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-500 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Multi Class Student</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
          <Button className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" /> DELETE STUDENT RECORD
          </Button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Academic Year</Label>
            <select 
              value={formData.academicYear}
              onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
            >
              <option value="2026[Jan-Dec]">2026[Jan-Dec]</option>
              <option value="2025[Jan-Dec]">2025[Jan-Dec]</option>
              <option value="2027[Jan-Dec]">2027[Jan-Dec]</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class</Label>
            <select 
              value={formData.class}
              onChange={(e) => setFormData({...formData, class: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
            >
              <option value="">Select Class</option>
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
            <select 
              value={formData.section}
              onChange={(e) => setFormData({...formData, section: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
            >
              <option value="">Select Section</option>
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Student</Label>
            <select 
              value={formData.student}
              onChange={(e) => setFormData({...formData, student: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
            >
              <option value="">Select Student</option>
              <option value="Muhammad Rayyan">Muhammad Rayyan (Roll 101)</option>
              <option value="Zoya Fatima">Zoya Fatima (Roll 102)</option>
              <option value="Bilal Hassan">Bilal Hassan (Roll 103)</option>
              <option value="Sara Khan">Sara Khan (Roll 104)</option>
              <option value="Hamza Ali">Hamza Ali (Roll 105)</option>
              <option value="Ayan Qureshi">Ayan Qureshi (Roll 106)</option>
            </select>
          </div>
          
          <div className="xl:col-span-4 flex items-end justify-end pt-2">
            <Button onClick={handleSearch} className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
