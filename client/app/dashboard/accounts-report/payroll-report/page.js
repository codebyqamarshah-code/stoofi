'use client';
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import api from '@/services/api';

export default function PayrollReport() {
  const [dateRange, setDateRange] = useState('');

  const handleSearch = () => {
    console.log('Search', { dateRange });
  };

  return (
    <div className="space-y-6 text-zinc-950 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payroll Report</h1>
        <p className="text-sm text-zinc-400">Dashboard &gt; Accounts &gt; Reports &gt; Payroll Report</p>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-zinc-950">Select Criteria</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm text-zinc-900 font-semibold mb-1">Date Range *</label>
            <input 
              type="text" 
              placeholder="e.g. 01/01/2026 - 01/31/2026"
              className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
          </div>
          <button 
            onClick={handleSearch}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-100 text-zinc-950 px-6 py-2 rounded transition-colors text-sm font-medium h-[38px]"
          >
            <Search className="w-4 h-4" />
            SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}
