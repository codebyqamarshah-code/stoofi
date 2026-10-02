'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TopicOverviewPage() {
  const [results, setResults] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Topic Overview</h1>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Lesson</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Topic Overview</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium">
              <option value="">Select Class</option>
              <option value="1">Class 1</option>
              <option value="2">Class 2</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium">
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Subject</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium">
              <option value="">Select Subjects</option>
              <option value="english">English</option>
              <option value="math">Math</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input placeholder="SEARCH" className="pl-9 w-[200px] bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 text-xs font-semibold uppercase" />
          </div>
          <div className="flex items-center border border-zinc-200 rounded-md bg-white">
            {[FileText, Download, FileText, Download, Printer, MoreVertical].map((Icon, i) => (
              <button key={i} className={`p-2 hover:bg-zinc-100 text-zinc-600 transition-colors ${i < 5 ? 'border-r border-zinc-200' : ''}`}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3">Lesson</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Completed Date</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((r, i) => (
                  <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-4 text-zinc-950 font-medium">{r.lesson}</td>
                    <td className="px-4 py-4 text-zinc-950">{r.topic}</td>
                    <td className="px-4 py-4 text-zinc-800">{r.completedDate}</td>
                    <td className="px-4 py-4 text-zinc-800">{r.teacher}</td>
                    <td className="px-4 py-4 text-zinc-950">{r.status}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500 font-medium">No Data Available In Table</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing 0 to 0 of 0 entries</div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled>
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
