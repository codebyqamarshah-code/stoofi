'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { useState } from 'react';
import { Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns } from 'lucide-react';
import Link from 'next/link';

export default function BBBClassRecordListPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[#1f2937]">virtual Class Record List</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">BigBlueButton</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">virtual Class Record List</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2 border-b border-gray-300 px-2 py-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH" className="bg-transparent text-sm text-gray-700 outline-none w-48 placeholder:text-gray-400 text-center" />
          </div>
        </div>
        
        <div className="flex justify-end mb-4">
          <TableExportToolbar />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-t border-gray-200">
            <thead>
              <tr className="border-b border-gray-200 text-indigo-600">
                <th className="py-3 px-3 font-medium text-xs">? #</th>
                <th className="py-3 px-3 font-medium text-xs">? Meeting Id</th>
                <th className="py-3 px-3 font-medium text-xs">? Class (Section)</th>
                <th className="py-3 px-3 font-medium text-xs">? Topic</th>
                <th className="py-3 px-3 font-medium text-xs">? Date | Time</th>
                <th className="py-3 px-3 font-medium text-xs">? Total Participants</th>
                <th className="py-3 px-3 font-medium text-xs">? URL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">No Data Available In Table</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>Showing 0 to 0 of 0 entries</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 text-gray-500 hover:text-gray-700">?</button>
            <button className="px-2 py-1 text-gray-500 hover:text-gray-700">?</button>
          </div>
        </div>
      </div>
    </div>
  );
}