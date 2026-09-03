'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

export default function BBBClassReportsPage() {
  const [classVal, setClassVal] = useState('Select Class *');
  const [section, setSection] = useState('Select Section');
  const [teacher, setTeacher] = useState('Select Teacher');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[#1f2937]">Class Reports</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">BigBlueButton</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">Class Reports</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#1f2937] mb-6">Virtual Class Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">CLASS <span className="text-red-500">*</span></label>
            <select value={classVal} onChange={e => setClassVal(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500">
              <option>Select Class *</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">SECTION</label>
            <select value={section} onChange={e => setSection(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500">
              <option>Select Section</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">TEACHER</label>
            <select value={teacher} onChange={e => setTeacher(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500">
              <option>Select Teacher</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">FROM DATE</label>
            <div className="relative">
              <input type="text" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">TO DATE</label>
            <div className="relative">
              <input type="text" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded flex items-center gap-2 transition-colors shadow-sm">
            <Search className="w-4 h-4" /> SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}
