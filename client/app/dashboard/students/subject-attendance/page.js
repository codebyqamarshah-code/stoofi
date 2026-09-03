'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight, Search, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function SubjectWiseAttendancePage() {
  const [formData, setFormData] = useState({
    class: '',
    section: '',
    subject: '',
    attendanceDate: '08/27/2026'
  });

  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = () => {
    if (formData.class && formData.section && formData.subject && formData.attendanceDate) {
      setIsSearched(true);
    } else {
      alert('Please select all criteria fields to search.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Subject Wise Attendance</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/students" className="hover:text-emerald-400 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Subject Wise Attendance</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
            <select 
              value={formData.class}
              onChange={(e) => setFormData({...formData, class: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="">Select Class *</option>
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
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Subject <span className="text-rose-500">*</span></Label>
            <select 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="">Select Subject *</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Attendance Date <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <Input 
                value={formData.attendanceDate} 
                onChange={(e) => setFormData({...formData, attendanceDate: e.target.value})}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 pr-10" 
              />
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            </div>
          </div>
          
          <div className="lg:col-span-4 flex items-end justify-end pt-2">
            <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>

      {isSearched && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mt-6 p-12 flex flex-col items-center justify-center text-zinc-500">
           <h3 className="text-lg font-bold text-white mb-2">Subject Attendance Register</h3>
           <p className="text-sm">Students matching this class, section, and subject will appear here for attendance marking.</p>
           <p className="text-xs mt-2 text-zinc-600">(Mark Present, Absent, Late, or Half-Day)</p>
        </div>
      )}
    </div>
  );
}
