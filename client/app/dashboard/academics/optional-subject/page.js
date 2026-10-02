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
import { Label } from '@/components/ui/label';

export default function OptionalSubjectPage() {
  const [subjects, setSubjects] = useState([]);
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Optional Subject</h1>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-900 transition-colors">Academics</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Optional Subject</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-base font-bold text-zinc-950">Add Optional Subject</h2>
            </div>
            
            <form className="p-5 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Subject Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  placeholder="Subject Name" 
                  className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Subject Code
                </Label>
                <Input 
                  placeholder="Subject Code" 
                  className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>

              <div className="pt-2">
                <Button className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg transition-all shadow-xs">
                  SAVE SUBJECT
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel - Data List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-zinc-950">Optional Subject List</h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    placeholder="SEARCH" 
                    className="pl-9 w-full sm:w-[200px] bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 text-xs font-bold uppercase"
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
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                  <tr>
                    <th className="px-4 py-3 font-bold">Subject Name</th>
                    <th className="px-4 py-3 font-bold">Subject Code</th>
                    <th className="px-4 py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {subjects.length > 0 ? (
                    subjects.map((s, i) => (
                      <tr key={i} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                        <td className="px-4 py-3.5">{s.name}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{s.code}</td>
                        <td className="px-4 py-3.5 text-right">
                          <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-zinc-800 border-zinc-300 bg-white hover:bg-zinc-100">
                            SELECT <ChevronRight className="h-3 w-3 ml-1 rotate-90" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-zinc-500 font-medium">
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
      </div>
    </div>
  );
}
