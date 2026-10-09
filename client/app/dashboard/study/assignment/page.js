'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import Link from 'next/link';
import React, { useState } from 'react';
import { 
  ChevronRight, 
  Search,
  Download,
  Printer,
  FileText,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AssignmentListPage() {
  const [assignments, setAssignments] = useState([]);
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Assignment List</h1>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span>Study Material</span>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Assignment List</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-zinc-950">Assignment List</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="QUICK SEARCH" 
                className="pl-9 w-full sm:w-[250px] bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 uppercase text-xs font-bold"
              />
            </div>
            
            <TableExportToolbar />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3 font-bold">Content Title</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-4 py-3 font-bold">Available For</th>
                <th className="px-4 py-3 font-bold">Class (Section)</th>
                <th className="px-4 py-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {assignments.length > 0 ? (
                assignments.map((a, i) => (
                  <tr key={i} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                    <td className="px-4 py-3.5">{a.title}</td>
                    <td className="px-4 py-3.5 text-zinc-700">{a.type}</td>
                    <td className="px-4 py-3.5 text-zinc-700">{a.date}</td>
                    <td className="px-4 py-3.5 text-zinc-700">{a.availableFor}</td>
                    <td className="px-4 py-3.5 text-zinc-700">{a.classSection}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-zinc-800 border-zinc-300 bg-white hover:bg-zinc-100">
                        SELECT <ChevronRight className="h-3 w-3 ml-1 rotate-90" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-zinc-500 font-medium">
                    No Data Available In Table
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium">
          <div>Showing 0 to 0 of 0 entries</div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-700 border-zinc-300 bg-white hover:bg-zinc-100" disabled>
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-700 border-zinc-300 bg-white hover:bg-zinc-100" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}