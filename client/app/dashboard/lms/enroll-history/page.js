'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EnrollHistoryPage() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { fetchRecords(); }, []);
  const fetchRecords = async () => { try { const res = await api.get('/lms-enroll-history'); if(res.success) setLogs(res.data); } catch(e){} };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Course Enroll Logs</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Course Enroll Logs</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Select Criteria</h2>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> NEW ENROLL
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Class</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
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
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Section</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Section</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Course</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Course</option>
              <option value="c1">Full Stack Web Development</option>
              <option value="c2">Python for Data Analysis</option>
              <option value="c3">Cambridge O-Level Physics</option>
              <option value="c4">Mathematics Olympiad Prep</option>
              <option value="c5">English Creative Writing</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Teacher</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Teacher</option>
              <option value="1">John Doe (Senior Mathematics)</option>
              <option value="2">Sarah Connor (Physics HOD)</option>
              <option value="3">Michael Scott (Management Studies)</option>
              <option value="4">Jessica Pearson (Computer Science)</option>
              <option value="5">Alex Morgan (English Literature)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>

      {/* Enroll Logs Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Enroll Logs</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input placeholder="SEARCH" className="pl-9 w-[180px] bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs font-semibold uppercase" />
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
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Paid Amount</th>
                <th className="px-4 py-3 font-semibold">Instructor</th>
                <th className="px-4 py-3 font-semibold">Details</th>
                <th className="px-4 py-3 font-semibold">Payment Method</th>
                <th className="px-4 py-3 font-semibold">Purchase Date</th>
                <th className="px-4 py-3 font-semibold">Free Course</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((l, i) => (
                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                  <td className="px-4 py-4 text-zinc-300">{l.course}</td>
                  <td className="px-4 py-4 text-zinc-300">{l.student}</td>
                  <td className="px-4 py-4 text-zinc-300">{l.paidAmount}</td>
                  <td className="px-4 py-4 text-zinc-300">{l.instructor}</td>
                  <td className="px-4 py-4 text-zinc-300">{l.details}</td>
                  <td className="px-4 py-4 text-zinc-300">{l.paymentMethod}</td>
                  <td className="px-4 py-4 text-zinc-300">{l.purchaseDate}</td>
                  <td className="px-4 py-4 text-zinc-300">{l.freeCourse}</td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
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
  );
}
