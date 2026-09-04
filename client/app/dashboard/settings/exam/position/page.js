'use client';
import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';

export default function PositionPage() {
  const [exam, setExam] = useState('');
  const [classVal, setClassVal] = useState('');
  const [section, setSection] = useState('');

  return (
    <div className="min-h-screen bg-zinc-950 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Position Setup</h1>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-200">Dashboard</Link><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Exam</span><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Settings</span><span className="mx-2">|</span>
          <span className="text-indigo-400 font-medium">Position Setup</span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-6">Select Criteria</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <select value={exam} onChange={(e) => setExam(e.target.value)} className="w-full bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-md px-3 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="">Select Exam *</option>
            <option value="1">First Term Examination</option>
            <option value="2">Mid Term Examination</option>
            <option value="3">Final Examination</option>
            <option value="4">Class Test 1</option>
            <option value="5">Monthly Assessment</option>
            <option value="6">Annual Board Examination</option>
          </select>
          <select value={classVal} onChange={(e) => setClassVal(e.target.value)} className="w-full bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-md px-3 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="">Select Class *</option>
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
          <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-md px-3 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="">Select Section *</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
          </select>
        </div>

        <div className="flex justify-end mt-6">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2.5 rounded-md flex items-center gap-2 transition-colors cursor-pointer shadow-sm">
            <Search className="w-4 h-4" /> SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}
