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
    <div className="space-y-6 p-6">
      <div className="mb-6 flex items-center text-sm text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span>System Settings</span>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="text-zinc-100">Academic Year</span>
      </div>

      <h1 className="text-2xl font-semibold text-zinc-950 mb-6">Academic Year</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-zinc-200 shadow-xs rounded-lg overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-lg font-medium text-zinc-950">Add Academic Year</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-950 mb-1">YEAR *</label>
              <input type="text" className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" placeholder="e.g., 2024-2025" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-950 mb-1">Year Title *</label>
              <input type="text" className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-950 mb-1">STARTING DATE *</label>
              <input type="date" className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-950 mb-1">ENDING DATE *</label>
              <input type="date" className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-950 mb-1">COPY WITH ACADEMIC YEAR</label>
              <select className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600">
                <option value="">Select Academic Year</option>
                <option value="2023-2024">2023-2024</option>
              </select>
            </div>
            <button className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-medium py-2 px-4 rounded transition-colors mt-2">
              SAVE
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-zinc-200 shadow-xs rounded-lg overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-lg font-medium text-zinc-950">Academic Year List</h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-9 pr-4 py-2 bg-white border border-zinc-200 shadow-xs rounded text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 w-full sm:w-64"
                />
              </div>
              <TableExportToolbar />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-950">
                <thead className="bg-zinc-50/50 text-zinc-900 font-bold">
                  <tr>
                    <th className="px-4 py-3 font-medium border-b border-zinc-200">Year</th>
                    <th className="px-4 py-3 font-medium border-b border-zinc-200">Title</th>
                    <th className="px-4 py-3 font-medium border-b border-zinc-200">Starting Date</th>
                    <th className="px-4 py-3 font-medium border-b border-zinc-200">Ending Date</th>
                    <th className="px-4 py-3 font-medium border-b border-zinc-200 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map(y => (
                    <tr key={y.id} className="border-b border-zinc-200 hover:bg-zinc-100 transition-colors">
                      <td className="px-4 py-3">{y.year}</td>
                      <td className="px-4 py-3">{y.title}</td>
                      <td className="px-4 py-3">{y.start}</td>
                      <td className="px-4 py-3">{y.end}</td>
                      <td className="px-4 py-3 text-right">
                        {y.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-600/10 text-zinc-600 border border-zinc-600/20">
                            Active
                          </span>
                        ) : (
                          <button className="text-xs font-medium px-3 py-1 border border-zinc-200 rounded hover:bg-zinc-100 text-zinc-950 transition-colors">
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