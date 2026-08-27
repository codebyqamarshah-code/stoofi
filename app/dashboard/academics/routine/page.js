'use client';

import React, { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ClassRoutinePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Class Routine Create</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Academics</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Class Routine Create</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Select Criteria</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-zinc-400 font-medium">
              <option value="">Select Class *</option>
              <option value="1">Class 1</option>
              <option value="2">Class 2</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section <span className="text-rose-500">*</span></Label>
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
