'use client';
import { useState } from 'react';
import { Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns } from 'lucide-react';
import Link from 'next/link';

export default function RegistrationStudentListPage() {
  const [academicYear, setAcademicYear] = useState('Select Academic Year');
  const [classVal, setClassVal] = useState('Select Class');
  const [section, setSection] = useState('Select Section');
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[#1f2937]">Manage Student</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">New Registration</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">Student List</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1f2937] mb-6">Select Criteria</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full bg-white border border-gray-300 text-zinc-900 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-emerald-500">
            <option value="">Select Academic Year</option>
            <option value="2026-2027">2026-2027</option>
            <option value="2025-2026">2025-2026</option>
          </select>
          <select value={classVal} onChange={e => setClassVal(e.target.value)} className="w-full bg-white border border-gray-300 text-zinc-900 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-emerald-500">
            <option value="">Select Class</option>
            {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={section} onChange={e => setSection(e.target.value)} className="w-full bg-white border border-gray-300 text-zinc-900 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-emerald-500">
            <option value="">Select Section</option>
            {['A', 'B', 'C', 'D'].map(s => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end mt-6">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded flex items-center gap-2 transition-colors shadow-sm">
            <Search className="w-4 h-4" /> SEARCH
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1f2937]">Student List (0)</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-b border-gray-300 px-2 py-1">
              <Search className="w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH" className="bg-transparent text-sm text-gray-700 outline-none w-32 placeholder:text-gray-400" />
            </div>
            <div className="flex gap-1">
              {[Copy, FileSpreadsheet, FileText, Printer, Download, Columns].map((Icon, i) => (
                <button key={i} className="p-1.5 text-gray-400 hover:text-indigo-600 border border-gray-200 rounded transition-colors bg-white">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-t border-gray-200">
            <thead>
              <tr className="border-b border-gray-200 text-indigo-600">
                <th className="py-3 px-3 font-medium text-xs">↓ Name</th>
                <th className="py-3 px-3 font-medium text-xs">↓ Class (Section)</th>
                <th className="py-3 px-3 font-medium text-xs">↓ Academic Year</th>
                <th className="py-3 px-3 font-medium text-xs">↓ Date Of Birth</th>
                <th className="py-3 px-3 font-medium text-xs">↓ Guardians Name</th>
                <th className="py-3 px-3 font-medium text-xs">↓ Student Mobile</th>
                <th className="py-3 px-3 font-medium text-xs">↓ Guardian Mobile</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">No Data Available In Table</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>Showing 0 to 0 of 0 entries</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 text-gray-500 hover:text-gray-700">←</button>
            <button className="px-2 py-1 text-gray-500 hover:text-gray-700">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
