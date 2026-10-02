'use client';
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import api from '@/services/api';

export default function TransactionReport() {
  const [formData, setFormData] = useState({ dateRange: '', type: '', paymentMethod: '' });

  const handleSearch = () => {
    console.log('Search', formData);
  };

  return (
    <div className="space-y-6 text-zinc-950 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transaction</h1>
        <p className="text-sm text-zinc-400">Dashboard &gt; Accounts &gt; Reports &gt; Transaction</p>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-zinc-950">Select Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm text-zinc-900 font-semibold mb-1">DATE RANGE *</label>
            <input 
              type="text" 
              placeholder="Select Date Range"
              className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              value={formData.dateRange}
              onChange={(e) => setFormData({...formData, dateRange: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-900 font-semibold mb-1">TYPE *</label>
            <select 
              className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="">Search Type</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-900 font-semibold mb-1">PAYMENT METHOD *</label>
            <select 
              className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            >
              <option value="">All</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={handleSearch}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-100 text-zinc-950 px-6 py-2 rounded transition-colors text-sm font-medium"
          >
            <Search className="w-4 h-4" />
            SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}
