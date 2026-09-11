'use client';

import Link from 'next/link';

import React from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const years = ['2024','2025','2026','2027'];

export default function PayrollBulkPrintPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Payroll Bulk Print</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Bulk Print</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Payroll Bulk Print</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">Select Criteria</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Role</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Role</option>
              <option value="Teacher">Teacher</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Month</Label>
            <select defaultValue="August" className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Year</Label>
            <select defaultValue="2026" className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
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
