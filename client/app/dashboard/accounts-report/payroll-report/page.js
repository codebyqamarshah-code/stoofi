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
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payroll Report</h1>
        <p className="text-sm text-zinc-400">Dashboard &gt; Accounts &gt; Reports &gt; Payroll Report</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-zinc-100">Select Criteria</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm text-zinc-400 mb-1">Date Range *</label>
            <input 
              type="text" 
              placeholder="e.g. 01/01/2026 - 01/31/2026"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
          </div>
          <button 
            onClick={handleSearch}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded transition-colors text-sm font-medium h-[38px]"
          >
            <Search className="w-4 h-4" />
            SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}
