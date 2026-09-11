'use client';
import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';

export default function ClassReportsPage() {
  const [classVal, setClassVal] = useState('');
  const [section, setSection] = useState('');
  const [teacher, setTeacher] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleSearch = () => {
    alert('Searching reports...');
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Class Reports</h1>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-200">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Jitsi</span>
          <span className="mx-2">|</span>
          <span className="text-indigo-400 font-medium">Class Reports</span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-6">Virtual Class Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-indigo-900 dark:text-indigo-100 uppercase block mb-1">CLASS <span className="text-red-500">*</span></label>
            <select value={classVal} onChange={(e) => setClassVal(e.target.value)} className="w-full bg-transparent border border-zinc-200 dark:border-zinc-200 text-zinc-700 dark:text-zinc-700 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="">Select Class</option>
              <option value="1">Class 1</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-indigo-900 dark:text-indigo-100 uppercase block mb-1">SECTION</label>
            <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full bg-transparent border border-zinc-200 dark:border-zinc-200 text-zinc-700 dark:text-zinc-700 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="">Select Section</option>
              <option value="A">A</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-indigo-900 dark:text-indigo-100 uppercase block mb-1">TEACHERS</label>
            <select value={teacher} onChange={(e) => setTeacher(e.target.value)} className="w-full bg-transparent border border-zinc-200 dark:border-zinc-200 text-zinc-700 dark:text-zinc-700 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="">Select Teacher</option>
              <option value="1">Mudassir Bajwa</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-indigo-900 dark:text-indigo-100 uppercase block mb-1">FROM DATE</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-transparent border border-zinc-200 dark:border-zinc-200 text-zinc-700 dark:text-zinc-700 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:dark:invert" />
          </div>

          <div>
            <label className="text-xs font-bold text-indigo-900 dark:text-indigo-100 uppercase block mb-1">TO DATE</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-transparent border border-zinc-200 dark:border-zinc-200 text-zinc-700 dark:text-zinc-700 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:dark:invert" />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2.5 rounded-md flex items-center gap-2 transition-colors cursor-pointer shadow-sm">
            <Search className="w-4 h-4" /> SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}
