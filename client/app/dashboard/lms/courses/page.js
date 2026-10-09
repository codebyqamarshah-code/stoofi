'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AllCoursesPage() {
  const [courses, setCourses] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-950">Course List</h1>
        <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Course</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-950">Select Criteria</h2>
          <Button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-semibold h-9 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> ADD
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Category</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Category</option>
              <option value="cs">Computer Science & IT</option>
              <option value="math">Mathematics & Logic</option>
              <option value="science">Natural Sciences</option>
              <option value="business">Business & Management</option>
              <option value="languages">Languages & Communication</option>
              <option value="arts">Arts & Humanities</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select SubCategory</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select SubCategory</option>
              <option value="web">Web Development & Design</option>
              <option value="python">Python Programming</option>
              <option value="algebra">Higher Algebra</option>
              <option value="physics">Applied Physics</option>
              <option value="accounting">Financial Accounting</option>
              <option value="english">IELTS & Academic English</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Class</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Class</option>
              <option value="1">Class 1</option>
              <option value="2">Class 2</option>
              <option value="3">Class 3</option>
              <option value="4">Class 4</option>
              <option value="5">Class 5</option>
              <option value="6">Class 6</option>
              <option value="7">Class 7</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
              <option value="11">O-Levels</option>
              <option value="12">A-Levels</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Section</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Section</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Status</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-900 dark:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-semibold">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>

      {/* Course List Table */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-950">Course List</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input placeholder="SEARCH" className="pl-9 w-[180px] bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 focus-visible:ring-zinc-600 text-xs font-semibold uppercase" />
            </div>
            <TableExportToolbar />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-600 dark:text-zinc-700 uppercase font-bold bg-white dark:bg-zinc-50 border-b border-zinc-200 dark:border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">SL</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Chapters/Chapters</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Class</th>
                <th className="px-4 py-3 font-semibold">Section</th>
                <th className="px-4 py-3 font-semibold">Published Status</th>
                <th className="px-4 py-3 font-semibold">Created By</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? courses.map((c, i) => (
                <tr key={i} className="border-b border-zinc-200 dark:border-zinc-200/50 hover:bg-zinc-50 dark:hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-4 text-zinc-950">{i + 1}</td>
                  <td className="px-4 py-4 text-zinc-950">{c.title}</td>
                  <td className="px-4 py-4 text-zinc-950">{c.category}</td>
                  <td className="px-4 py-4 text-zinc-950">{c.chapters}</td>
                  <td className="px-4 py-4 text-zinc-950">{c.price}</td>
                  <td className="px-4 py-4 text-zinc-950">{c.class}</td>
                  <td className="px-4 py-4 text-zinc-950">{c.section}</td>
                  <td className="px-4 py-4 text-zinc-950">{c.status}</td>
                  <td className="px-4 py-4 text-zinc-950">{c.createdBy}</td>
                </tr>
              )) : (
                <tr><td colSpan="9" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing 0 to 0 of 0 entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-200 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-200 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}