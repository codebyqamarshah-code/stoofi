'use client';
import { useState, useRef } from 'react';
import { Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns } from 'lucide-react';
import Link from 'next/link';

export default function GmeetVirtualMeetingPage() {
  const fileRef = useRef(null);

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[#1f2937]">Virtual Meeting</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">Gmeet</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">Virtual Meeting</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-[#1f2937] mb-4">Add Meeting</h2>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Member Type <span className="text-red-500">*</span></label>
            <select className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500">
              <option value="">Member Type *</option>
              {['Teacher', 'Staff', 'Student', 'Parent'].map(mt => (
                <option key={mt} value={mt}>{mt}</option>
              ))}
</select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Member <span className="text-red-500">*</span></label>
            <select className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500">
              <option value="">Select Member</option>
              {['Mudassir Bajwa (Teacher)', 'Fatima Zahra (Teacher)', 'Muhammad Ali (Teacher)', 'Usman Tariq (Staff)', 'Muhammad Rayyan (Student)', 'Zoya Fatima (Student)'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
</select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">TOPIC <span className="text-red-500">*</span></label>
            <input type="text" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">GMEET URL <span className="text-red-500">*</span></label>
            <textarea rows={3} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 resize-none"></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">DESCRIPTION</label>
            <textarea rows={3} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 resize-none"></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">DATE OF MEETING <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type="text" defaultValue="09/01/2026" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">TIME OF MEETING <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type="text" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">MEETING DURATION <span className="text-red-500">*</span></label>
            <input type="text" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">MEETING START BEFORE</label>
            <input type="number" defaultValue="10" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 flex-1 truncate bg-white border border-gray-300 px-3 py-2.5 rounded">Attach File</span>
              <button type="button" onClick={() => fileRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded cursor-pointer transition-colors shadow-sm uppercase">BROWSE</button>
              <input ref={fileRef} type="file" className="hidden" />
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-8 py-2.5 rounded flex items-center justify-center gap-2 shadow-sm">? SAVE MEETING</button>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1f2937]">Meeting List</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border-b border-gray-300 px-2 py-1">
                <Search className="w-4 h-4 text-gray-400" />
                <input placeholder="SEARCH" className="bg-transparent text-sm text-gray-700 outline-none w-32 placeholder:text-gray-400" />
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
                  <th className="py-3 px-3 font-medium text-xs">? #</th>
                  <th className="py-3 px-3 font-medium text-xs">? Topic</th>
                  <th className="py-3 px-3 font-medium text-xs">? Date</th>
                  <th className="py-3 px-3 font-medium text-xs">? Time</th>
                  <th className="py-3 px-3 font-medium text-xs">? Duration</th>
                  <th className="py-3 px-3 font-medium text-xs">? Start/Join Before</th>
                  <th className="py-3 px-3 font-medium text-xs">? Start/Join</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">No Data Available In Table</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
