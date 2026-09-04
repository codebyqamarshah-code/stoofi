'use client';

import Link from 'next/link';

import React from 'react';
import { ChevronRight, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VideoListPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Video</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Download Center</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Video</span>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <h2 className="text-base font-semibold text-white">Search</h2>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 text-xs self-start sm:self-auto">
            <Plus className="h-3.5 w-3.5 mr-1" /> ADD
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Class</option>
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Section</option>
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Title</Label>
            <Input placeholder="Title" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
          </div>
        </div>
        <div className="flex mt-6">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>

      {/* Video List */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-base font-semibold text-white mb-4">Video List</h2>
        <div className="text-center text-zinc-500 py-10 text-sm">
          No Data Available In Table
        </div>
      </div>
    </div>
  );
}
