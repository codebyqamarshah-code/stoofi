'use client';

import Link from 'next/link';
import React from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LessonPlanPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Lesson Plan Create</h1>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Lesson Plan</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Lesson Plan Create</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-zinc-950">Select Criteria</h2>
        </div>
        <div className="space-y-1.5 max-w-md">
          <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Teacher <span className="text-rose-500">*</span></Label>
          <select className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium">
            <option value="">Select Teacher *</option>
            <option value="1">Mudassir Bajwa</option>
          </select>
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>
    </div>
  );
}
