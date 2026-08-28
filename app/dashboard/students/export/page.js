'use client';

import Link from 'next/link';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentExportPage() {
  const handleExport = (type) => {
    alert(`Exporting all students to ${type} format. Please wait...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Student Export</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/students" className="hover:text-emerald-400 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Student Export</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center space-y-8">
          <h2 className="text-xl font-bold text-white">All Student Export</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button 
              onClick={() => handleExport('CSV')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold uppercase px-8"
            >
              EXPORT TO CSV
            </Button>
            <Button 
              onClick={() => handleExport('PDF')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold uppercase px-8"
            >
              EXPORT TO PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
