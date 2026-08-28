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
        <h1 className="text-2xl font-bold text-white">Optional Subject</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/academics/class" className="hover:text-emerald-400 transition-colors">Academics</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Optional Subject</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Add Optional Subject</h2>
            </div>
            
            <form className="p-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Subject Name <span className="text-rose-500">*</span></Label>
                <Input placeholder="Subject Name" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Subject Code</Label>
                <Input placeholder="Subject Code" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
              </div>

              <div className="pt-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  SAVE SUBJECT
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel - Data List */}
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Optional Subject List</h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="SEARCH" 
                    className="pl-9 w-full sm:w-[200px] bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs font-semibold uppercase"
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
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Subject Name</th>
                    <th className="px-4 py-3 font-semibold">Subject Code</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.length > 0 ? (
                    subjects.map((s, i) => (
                      <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-4 text-zinc-300">{s.name}</td>
                        <td className="px-4 py-4 text-zinc-300">{s.code}</td>
                        <td className="px-4 py-4 text-right">
                          <Button variant="outline" size="sm" className="h-8 text-xs font-semibold text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400">
                            SELECT <ChevronRight className="h-3 w-3 ml-1 rotate-90" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-zinc-500">
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
      </div>
    </div>
  );
}
