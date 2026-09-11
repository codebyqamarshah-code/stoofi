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
        <h1 className="text-2xl font-bold text-white">Upload Content List</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Study Material</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Upload Content List</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Upload Content</h2>
            </div>
            
            <form className="p-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Content Title <span className="text-rose-500">*</span></Label>
                <Input placeholder="Content Title" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Content Type <span className="text-rose-500">*</span></Label>
                <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-white">
                  <option value="">Content Type *</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Other Download">Other Download</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Available For <span className="text-rose-500">*</span></Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-zinc-800 bg-zinc-950 text-zinc-800 focus:ring-zinc-800 focus:ring-offset-zinc-900 cursor-pointer h-4 w-4" />
                    <span className="text-sm text-zinc-300">All Admin</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-zinc-800 bg-zinc-950 text-zinc-800 focus:ring-zinc-800 focus:ring-offset-zinc-900 cursor-pointer h-4 w-4" />
                    <span className="text-sm text-zinc-300">Student</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer opacity-50">
                    <input type="checkbox" className="rounded border-zinc-800 bg-zinc-950 text-zinc-800 focus:ring-zinc-800 focus:ring-offset-zinc-900 cursor-pointer h-4 w-4" disabled />
                    <span className="text-sm text-zinc-300">Available for all classes</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Class</Label>
                <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium">
                  <option value="">Select Class</option>
                  {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
                <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium">
                  <option value="">Select Section</option>
                  {['A', 'B', 'C', 'D'].map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Date</Label>
                <Input type="date" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 [color-scheme:dark]" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Description</Label>
                <textarea 
                  placeholder="Description" 
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white resize-y" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Source URL</Label>
                <Input placeholder="Source URL" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input type="text" placeholder="File" readOnly className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                  <Button type="button" variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-white shrink-0">
                    <Upload className="h-4 w-4 mr-2" /> BROWSE
                  </Button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">(jpg, png, jpeg, pdf, doc, docx, mp4, mp3, txt are allowed for upload)</p>
              </div>

              <div className="pt-4">
                <Button className="w-full sm:w-auto px-6 bg-zinc-800 hover:bg-zinc-800 text-white font-semibold">
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel - Data List */}
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Upload Content List</h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="QUICK SEARCH" 
                    className="pl-9 w-full sm:w-[200px] bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-xs font-semibold uppercase"
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
                    <th className="px-4 py-3 font-semibold">SL</th>
                    <th className="px-4 py-3 font-semibold">Content Title</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Available For</th>
                    <th className="px-4 py-3 font-semibold">Class(Section)</th>
                  </tr>
                </thead>
                <tbody>
                  {contents.length > 0 ? (
                    contents.map((c, i) => (
                      <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-4 text-zinc-300">{i + 1}</td>
                        <td className="px-4 py-4 text-zinc-300">{c.title}</td>
                        <td className="px-4 py-4 text-zinc-300">{c.type}</td>
                        <td className="px-4 py-4 text-zinc-300">{c.date}</td>
                        <td className="px-4 py-4 text-zinc-300">{c.availableFor}</td>
                        <td className="px-4 py-4 text-zinc-300">{c.classSection}</td>
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
      </div>
    </div>
  );
}
