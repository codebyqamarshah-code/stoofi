'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import React from 'react';
import { Plus, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, ChevronRight } from 'lucide-react';

export default function ManageCurrency() {
  const currencies = [
    { id: 1, name: 'Dollars', code: 'USD', symbol: '$', type: 'fiat', position: 'Left', space: 'Yes', decimal: 2, active: true },
    { id: 2, name: 'Euro', code: 'EUR', symbol: '€', type: 'fiat', position: 'Right', space: 'No', decimal: 2, active: false },
    { id: 3, name: 'Pounds', code: 'GBP', symbol: '£', type: 'fiat', position: 'Left', space: 'Yes', decimal: 2, active: false },
  ];

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950">
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>General Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Manage Currency</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Manage Currency</h1>
      
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-zinc-950">Currency List</h2>
          <button className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            ADD CURRENCY
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
             <TableExportToolbar />
             <div>
                <input type="text" placeholder="Search..." className="bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 text-zinc-700 font-bold border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3">SL</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Currency Position</th>
                  <th className="px-4 py-3">Space</th>
                  <th className="px-4 py-3">Decimal Digit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-900">
                {currencies.map((currency, index) => (
                  <tr key={currency.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-zinc-700">{index + 1}</td>
                    <td className="px-4 py-3 text-zinc-950 font-bold flex items-center gap-2">
                      {currency.name}
                      {currency.active && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">ACTIVE</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-800 font-medium">{currency.code}</td>
                    <td className="px-4 py-3 text-zinc-800 font-bold">{currency.symbol}</td>
                    <td className="px-4 py-3 text-zinc-700 capitalize">{currency.type}</td>
                    <td className="px-4 py-3 text-zinc-700">{currency.position}</td>
                    <td className="px-4 py-3 text-zinc-700">{currency.space}</td>
                    <td className="px-4 py-3 text-zinc-700">{currency.decimal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}