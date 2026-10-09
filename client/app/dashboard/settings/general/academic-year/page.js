'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import React, { useState } from 'react';
import { 
  ChevronRight, Search, Copy, FileSpreadsheet, 
  FileText, Printer, Download, Columns
} from 'lucide-react';

export default function AcademicYearPage() {
  const [years, setYears] = useState([
    { id: 1, year: '2024-2025', title: 'Session 2024-25', start: '2024-04-01', end: '2025-03-31', active: true },
    { id: 2, year: '2023-2024', title: 'Session 2023-24', start: '2023-04-01', end: '2024-03-31', active: false },
  ]);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-6 flex items-center text-xs font-semibold text-zinc-600">
        <span>Dashboard</span>
        <ChevronRight className="mx-2 h-3.5 w-3.5" />
        <span>System Settings</span>
        <ChevronRight className="mx-2 h-3.5 w-3.5" />
        <span className="text-zinc-950 font-bold">Academic Year</span>
      </div>

      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Academic Year</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-bold text-zinc-950">Add Academic Year</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">YEAR *</label>
              <input type="text" className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" placeholder="e.g., 2024-2025" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">Year Title *</label>
              <input type="text" className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">STARTING DATE *</label>
              <input type="date" className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">ENDING DATE *</label>
              <input type="date" className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">COPY WITH ACADEMIC YEAR</label>
              <select className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600">
                <option value="">Select Academic Year</option>
                <option value="2023-2024">2023-2024</option>
              </select>
            </div>
            <button className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-sm transition-colors mt-2 cursor-pointer">
              SAVE
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-bold text-zinc-950">Academic Year List</h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-9 pr-4 py-2 bg-white border border-zinc-300 rounded-lg text-sm font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 w-full sm:w-64"
                />
              </div>
              <TableExportToolbar />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-900">
                <thead className="bg-zinc-50 text-zinc-700 font-bold border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 border-b border-zinc-200">Year</th>
                    <th className="px-4 py-3 border-b border-zinc-200">Title</th>
                    <th className="px-4 py-3 border-b border-zinc-200">Starting Date</th>
                    <th className="px-4 py-3 border-b border-zinc-200">Ending Date</th>
                    <th className="px-4 py-3 border-b border-zinc-200 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {years.map(y => (
                    <tr key={y.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-zinc-950">{y.year}</td>
                      <td className="px-4 py-3 font-medium text-zinc-800">{y.title}</td>
                      <td className="px-4 py-3 text-zinc-700">{y.start}</td>
                      <td className="px-4 py-3 text-zinc-700">{y.end}</td>
                      <td className="px-4 py-3 text-right">
                        {y.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Active
                          </span>
                        ) : (
                          <button className="text-xs font-bold px-3 py-1 border border-zinc-300 rounded-lg hover:bg-zinc-100 text-zinc-800 transition-colors cursor-pointer">
                            SELECT
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}