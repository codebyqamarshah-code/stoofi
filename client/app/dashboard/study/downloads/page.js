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

export default function OtherDownloadsListPage() {
  const [downloads, setDownloads] = useState([]);
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Other Downloads List</h1>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span>Study Material</span>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Other Downloads List</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-zinc-950">Other Downloads List</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="QUICK SEARCH" 
                className="pl-9 w-full sm:w-[250px] bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 uppercase text-xs font-bold"
              />
            </div>
            
            <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-xs">
              <button className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors border-r border-zinc-200" title="Copy">
                <FileText className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors border-r border-zinc-200" title="Excel">
                <Download className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors border-r border-zinc-200" title="CSV">
                <FileText className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors border-r border-zinc-200" title="PDF">
                <Download className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors border-r border-zinc-200" title="Print">
                <Printer className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors" title="Columns">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3 font-bold">SL</th>
                <th className="px-4 py-3 font-bold">Content Title</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-4 py-3 font-bold">Available For</th>
                <th className="px-4 py-3 font-bold">Class (Section)</th>
                <th className="px-4 py-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {downloads.length > 0 ? (
                downloads.map((d, i) => (
                  <tr key={i} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                    <td className="px-4 py-3.5 text-zinc-700">{i + 1}</td>
                    <td className="px-4 py-3.5">{d.title}</td>
                    <td className="px-4 py-3.5 text-zinc-700">{d.type}</td>
                    <td className="px-4 py-3.5 text-zinc-700">{d.date}</td>
                    <td className="px-4 py-3.5 text-zinc-700">{d.availableFor}</td>
                    <td className="px-4 py-3.5 text-zinc-700">{d.classSection}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-zinc-800 border-zinc-300 bg-white hover:bg-zinc-100">
                        SELECT <ChevronRight className="h-3 w-3 ml-1 rotate-90" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-zinc-500 font-medium">
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
