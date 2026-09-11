'use client';

import React from 'react';
import { Plus, Copy, FileSpreadsheet, FileText, Printer, Download, Columns } from 'lucide-react';

export default function ManageCurrency() {
  const currencies = [
    { id: 1, name: 'Dollars', code: 'USD', symbol: '$', type: 'fiat', position: 'Left', space: 'Yes', decimal: 2, active: true },
    { id: 2, name: 'Euro', code: 'EUR', symbol: '€', type: 'fiat', position: 'Right', space: 'No', decimal: 2, active: false },
    { id: 3, name: 'Pounds', code: 'GBP', symbol: '£', type: 'fiat', position: 'Left', space: 'Yes', decimal: 2, active: false },
  ];

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <h1 className="text-2xl font-semibold mb-6">Currency</h1>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-medium">Currency List</h2>
          <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-800 text-white px-4 py-2 rounded text-sm transition-colors">
            <Plus className="w-4 h-4" />
            ADD
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
             <div className="flex gap-2">
                <button className="p-2 border border-zinc-800 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors" title="Copy"><Copy className="w-4 h-4" /></button>
                <button className="p-2 border border-zinc-800 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors" title="Excel"><FileSpreadsheet className="w-4 h-4" /></button>
                <button className="p-2 border border-zinc-800 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors" title="CSV"><FileText className="w-4 h-4" /></button>
                <button className="p-2 border border-zinc-800 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors" title="PDF"><Download className="w-4 h-4" /></button>
                <button className="p-2 border border-zinc-800 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors" title="Print"><Printer className="w-4 h-4" /></button>
                <button className="p-2 border border-zinc-800 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors" title="Columns"><Columns className="w-4 h-4" /></button>
             </div>
             <div>
                <input type="text" placeholder="Search..." className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" />
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-800/50 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800">SL</th>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800">Name</th>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800">Code</th>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800">Symbol</th>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800">Type</th>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800">Currency Position</th>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800">Space</th>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800">Decimal Digit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {currencies.map((currency, index) => (
                  <tr key={currency.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 text-zinc-300">{index + 1}</td>
                    <td className="px-4 py-3 text-zinc-100 flex items-center gap-2">
                      {currency.name}
                      {currency.active && <span className="bg-zinc-600/10 text-zinc-600 text-[10px] px-2 py-0.5 rounded border border-zinc-600/20">ACTIVE</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{currency.code}</td>
                    <td className="px-4 py-3 text-zinc-300">{currency.symbol}</td>
                    <td className="px-4 py-3 text-zinc-300">{currency.type}</td>
                    <td className="px-4 py-3 text-zinc-300">{currency.position}</td>
                    <td className="px-4 py-3 text-zinc-300">{currency.space}</td>
                    <td className="px-4 py-3 text-zinc-300">{currency.decimal}</td>
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
