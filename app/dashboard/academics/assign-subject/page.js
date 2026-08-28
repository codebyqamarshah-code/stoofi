'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function AssignSubjectPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Assign Subject</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/academics/class" className="hover:text-emerald-400 transition-colors">Academics</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Assign Subject</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Select Criteria</h2>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> ASSIGN SUBJECT
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-zinc-400 font-medium">
              <option value="">Select Class *</option>
              <option value="1">Class 1</option>
              <option value="2">Class 2</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-zinc-400 font-medium">
              <option value="">Select Section *</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>
    </div>
  );
}
