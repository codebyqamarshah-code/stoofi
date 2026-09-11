'use client';

import Link from 'next/link';

import React from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BulkPrintIdCardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Generate id Card</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Bulk Print</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Generate id Card</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">Select Criteria</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Role <span className="text-rose-500">*</span></Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Role *</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Select ID Card <span className="text-rose-500">*</span></Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Id Card *</option>
              <option value="1">Student Smart Card 2026</option>
              <option value="2">Teacher / Faculty ID Card</option>
              <option value="3">Staff Identification Card</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Grid Gap (PX) <span className="text-rose-500">*</span></Label>
            <Input type="number" placeholder="Grid Gap (px)" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>
    </div>
  );
}
