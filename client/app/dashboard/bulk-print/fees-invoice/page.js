'use client';

import Link from 'next/link';

import React from 'react';
import { ChevronRight, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function FeesInvoiceBulkPrintPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Fees Invoice Bulk Print</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Bulk Print</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Fees Invoice Bulk Print</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">Select Criteria</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Class</option>
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Section</option>
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Student</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Student</option>
              <option value="stu1">Muhammad Rayyan (Roll 101)</option>
              <option value="stu2">Zoya Fatima (Roll 102)</option>
              <option value="stu3">Bilal Hassan (Roll 103)</option>
              <option value="stu4">Sara Khan (Roll 104)</option>
              <option value="stu5">Hamza Ali (Roll 105)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold">
            <Printer className="h-4 w-4 mr-2" /> PRINT
          </Button>
        </div>
      </div>
    </div>
  );
}
