'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { useState } from 'react';
import { ChevronRight, Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function FormatSettingsPage() {
  const [type, setType] = useState('Term Exam');
  const [exam, setExam] = useState('');
  const [title, setTitle] = useState('');
  const [pubDate, setPubDate] = useState('09/01/2026');
  const [startDate, setStartDate] = useState('09/01/2026');
  const [endDate, setEndDate] = useState('09/01/2026');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold text-zinc-950">Format Settings</h1>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-200">Dashboard</Link><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Examination</span><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Settings</span><span className="mx-2">|</span>
          <span className="text-indigo-400 font-medium">Format Settings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-zinc-950 mb-4">Add Exam Format</h2>
          <div className="bg-yellow-900/20 border border-yellow-700/50 text-yellow-500/80 text-[11px] p-3 rounded leading-relaxed">
            For term exam type, Controller title and signature will shows on mark sheet report and merit list report. And Result publication date shows on mark sheet report and merit list report and tabulation sheet report. For progress card type publication date shows on progress card, 100 percent progress card report.
          </div>
          
          <div>
            <label className="text-xs font-semibold text-red-500 uppercase block mb-1">TYPE *</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs text-zinc-950 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option>Term Exam</option>
              <option>CBT</option>
              <option>Progress Card</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-red-500 uppercase block mb-1">EXAM *</label>
            <select value={exam} onChange={e => setExam(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs text-zinc-950 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="">Select Exam *</option>
              <option value="1">First Term Examination</option>
              <option value="2">Mid Term Examination</option>
              <option value="3">Final Examination</option>
              <option value="4">Class Test 1</option>
              <option value="5">Monthly Assessment</option>
              <option value="6">Annual Board Examination</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-red-500 uppercase block mb-1">CONTROLLER TITLE *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs text-zinc-950 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">SIGNATURE</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-zinc-200 shadow-xs text-zinc-500 text-sm rounded-lg px-3 py-2.5 flex items-center">Signature</div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 rounded-lg">BROWSE</button>
            </div>
            <p className="text-[10px] text-indigo-400 mt-1">(Allow file jpg, png, jpeg, svg)</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-red-500 uppercase block mb-1">RESULT PUBLICATION DATE *</label>
            <input type="date" value={pubDate} onChange={e => setPubDate(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs text-zinc-950 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:invert" />
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-indigo-400 mb-4">Attendance</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-red-500 uppercase block mb-1">START DATE *</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs text-zinc-950 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:invert" />
              </div>
              <div>
                <label className="text-xs font-semibold text-red-500 uppercase block mb-1">END DATE *</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs text-zinc-950 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:invert" />
              </div>
            </div>
          </div>

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-4">✓ SAVE CONTENT</button>
        </div>

        <div className="xl:col-span-2 bg-white border border-zinc-200 shadow-xs rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-zinc-950">Exam Format List</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-zinc-200 rounded-md px-2 py-1.5 bg-zinc-950">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH" className="bg-transparent text-xs text-zinc-950 outline-none w-32" />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400">
                  <th className="py-3 px-3 font-medium text-xs">↓ Exam</th>
                  <th className="py-3 px-3 font-medium text-xs">↓ Title</th>
                  <th className="py-3 px-3 font-medium text-xs">↓ Signature</th>
                  <th className="py-3 px-3 font-medium text-xs">↓ Publish Date</th>
                  <th className="py-3 px-3 font-medium text-xs">↓ Start Date</th>
                  <th className="py-3 px-3 font-medium text-xs">↓ End Date</th>
                  <th className="py-3 px-3 font-medium text-xs text-center">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-200/50 hover:bg-zinc-100">
                  <td className="py-4 px-3 text-zinc-950">CBT</td>
                  <td className="py-4 px-3 text-zinc-950">Exam Controller</td>
                  <td className="py-4 px-3 text-zinc-700 italic font-serif">Signature</td>
                  <td className="py-4 px-3 text-zinc-700 text-xs">15th Aug, 2026</td>
                  <td className="py-4 px-3 text-zinc-700 text-xs">15th Aug, 2026</td>
                  <td className="py-4 px-3 text-zinc-700 text-xs">15th Aug, 2026</td>
                  <td className="py-4 px-3 text-center">
                    <button className="border border-indigo-500/30 text-indigo-400 hover:bg-indigo-900/30 text-[11px] font-medium px-3 py-1 rounded-full flex items-center justify-center gap-1 mx-auto transition-colors">
                      SELECT <ChevronDown className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-6 text-xs text-zinc-500">
            <span>Showing 1 to 1 of 1 entries</span>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-950">‹</button>
              <button className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded">1</button>
              <button className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-950">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}