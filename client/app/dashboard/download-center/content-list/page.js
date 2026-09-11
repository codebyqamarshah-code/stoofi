'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContentListPage() {
  const [contents, setContents] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Content</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Download Center</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Content</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-base font-semibold text-white mb-4">Search</h2>
        <div className="space-y-1.5 max-w-xl">
          <Label className="text-xs font-semibold text-zinc-400 uppercase">Name</Label>
          <Input placeholder="Name" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>

      {/* Add Content + Content List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Add Content</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Content Type <span className="text-rose-500">*</span></Label>
                <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
                  <option value="">Content Type *</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">YouTube Link</Label>
                <Input placeholder="YouTube Link" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-500 font-semibold">OR</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input type="text" placeholder="File" readOnly className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
                  <Button type="button" variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-white shrink-0">
                    <Upload className="h-4 w-4 mr-2" /> BROWSE
                  </Button>
                </div>
                <p className="text-[10px] text-zinc-500">(jpg, png, jpeg, pdf, doc, docx, txt, xlsx, rar, zip are allowed for upload)</p>
              </div>
              <div className="pt-2">
                <Button className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold">SAVE</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Content List Table */}
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button size="sm" className="h-9 bg-zinc-800 hover:bg-zinc-800 text-white font-semibold text-xs">SHARE</Button>
                <Button size="sm" variant="outline" className="h-9 text-zinc-600 border-zinc-600/50 hover:bg-zinc-600/10 font-semibold text-xs">GENERATE URL</Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input placeholder="SEARCH" className="pl-9 w-[180px] bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-xs font-semibold uppercase" />
                </div>
                <div className="flex items-center border border-zinc-800 rounded-md bg-zinc-900">
                  {[FileText, Download, FileText, Download, Printer, MoreVertical].map((Icon, i) => (
                    <button key={i} className={`p-2 hover:bg-zinc-800 text-zinc-400 transition-colors ${i < 5 ? 'border-r border-zinc-800' : ''}`}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">SL</th>
                    <th className="px-4 py-3 font-semibold">Document</th>
                    <th className="px-4 py-3 font-semibold">Content Type</th>
                    <th className="px-4 py-3 font-semibold">Size</th>
                    <th className="px-4 py-3 font-semibold">Uploaded By</th>
                    <th className="px-4 py-3 font-semibold">Created On</th>
                  </tr>
                </thead>
                <tbody>
                  {contents.length > 0 ? contents.map((c, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-4 text-zinc-300">{i + 1}</td>
                      <td className="px-4 py-4 text-zinc-300">{c.document}</td>
                      <td className="px-4 py-4 text-zinc-300">{c.contentType}</td>
                      <td className="px-4 py-4 text-zinc-300">{c.size}</td>
                      <td className="px-4 py-4 text-zinc-300">{c.uploadedBy}</td>
                      <td className="px-4 py-4 text-zinc-300">{c.createdOn}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing 0 to 0 of 0 entries</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
