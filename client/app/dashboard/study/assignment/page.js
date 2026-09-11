'use client';

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
        <h1 className="text-2xl font-bold text-white">Assignment List</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Study Material</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Assignment List</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Assignment List</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="QUICK SEARCH" 
                className="pl-9 w-full sm:w-[250px] bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 uppercase text-xs font-semibold"
              />
            </div>
            
            <div className="flex items-center border border-zinc-800 rounded-md bg-zinc-900">
              <button className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Copy">
                <FileText className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Excel">
                <Download className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="CSV">
                <FileText className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="PDF">
                <Download className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Print">
                <Printer className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors" title="Columns">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Content Title</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Available For</th>
                <th className="px-4 py-3 font-semibold">Class (Section)</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? (
                assignments.map((a, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-4 text-zinc-300">{a.title}</td>
                    <td className="px-4 py-4 text-zinc-300">{a.type}</td>
                    <td className="px-4 py-4 text-zinc-300">{a.date}</td>
                    <td className="px-4 py-4 text-zinc-300">{a.availableFor}</td>
                    <td className="px-4 py-4 text-zinc-300">{a.classSection}</td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold text-zinc-600 border-zinc-600/50 hover:bg-zinc-600/10 hover:text-zinc-500">
                        SELECT <ChevronRight className="h-3 w-3 ml-1 rotate-90" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-zinc-500">
                    No Data Available In Table
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing 0 to 0 of 0 entries</div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled>
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
