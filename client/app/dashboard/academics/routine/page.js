'use client';

import Link from 'next/link';
import React from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ClassRoutinePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Class Routine Create</h1>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-900 transition-colors">Academics</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Class Routine Create</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
        <div className="mb-5 pb-3 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-950">Select Criteria</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Class <span className="text-rose-500">*</span>
            </Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium">
              <option value="">Select Class *</option>
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Section <span className="text-rose-500">*</span>
            </Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium">
              <option value="">Select Section *</option>
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 pt-4 border-t border-zinc-100">
          <Button className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-xs">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>
    </div>
  );
}
