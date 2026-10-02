'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { 
  ChevronRight, 
  Search,
  Download,
  Printer,
  FileText,
  MoreVertical,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UploadContentPage() {
  const [contents, setContents] = useState([]);
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Upload Content List</h1>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span>Study Material</span>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Upload Content List</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-base font-bold text-zinc-950">Upload Content</h2>
            </div>
            
            <form className="p-5 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Content Title <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  placeholder="Content Title" 
                  className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Content Type <span className="text-rose-500">*</span>
                </Label>
                <select className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium">
                  <option value="">Content Type *</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Other Download">Other Download</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Available For <span className="text-rose-500">*</span>
                </Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800 cursor-pointer h-4 w-4" />
                    <span className="text-sm text-zinc-800 font-medium">All Admin</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800 cursor-pointer h-4 w-4" />
                    <span className="text-sm text-zinc-800 font-medium">Student</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer opacity-50">
                    <input type="checkbox" className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800 cursor-pointer h-4 w-4" disabled />
                    <span className="text-sm text-zinc-600 font-medium">Available for all classes</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class</Label>
                <select className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium">
                  <option value="">Select Class</option>
                  {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section</Label>
                <select className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium">
                  <option value="">Select Section</option>
                  {['A', 'B', 'C', 'D'].map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Date</Label>
                <Input type="date" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Description</Label>
                <textarea 
                  placeholder="Description" 
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 ring-offset-background placeholder:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 resize-y font-medium" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Source URL</Label>
                <Input 
                  placeholder="Source URL" 
                  className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input type="text" placeholder="File" readOnly className="bg-zinc-50 border-zinc-300 text-zinc-950 font-medium" />
                  <Button type="button" variant="secondary" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 font-bold shrink-0">
                    <Upload className="h-4 w-4 mr-2" /> BROWSE
                  </Button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-medium">(jpg, png, jpeg, pdf, doc, docx, mp4, mp3, txt are allowed for upload)</p>
              </div>

              <div className="pt-3">
                <Button className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg transition-all shadow-xs">
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel - Data List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-zinc-950">Upload Content List</h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    placeholder="QUICK SEARCH" 
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
                    <th className="px-4 py-3 font-bold">SL</th>
                    <th className="px-4 py-3 font-bold">Content Title</th>
                    <th className="px-4 py-3 font-bold">Type</th>
                    <th className="px-4 py-3 font-bold">Date</th>
                    <th className="px-4 py-3 font-bold">Available For</th>
                    <th className="px-4 py-3 font-bold">Class(Section)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {contents.length > 0 ? (
                    contents.map((c, i) => (
                      <tr key={i} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                        <td className="px-4 py-3.5 text-zinc-700">{i + 1}</td>
                        <td className="px-4 py-3.5">{c.title}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{c.type}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{c.date}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{c.availableFor}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{c.classSection}</td>
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
      </div>
    </div>
  );
}
