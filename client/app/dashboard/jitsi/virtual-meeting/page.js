'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { useState, useRef } from 'react';
import { Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns } from 'lucide-react';
import Link from 'next/link';

export default function JitsiVirtualMeetingPage() {
  const [memberType, setMemberType] = useState('Member Type *');
  const [member, setMember] = useState('Select');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('09/01/2026');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [startBefore, setStartBefore] = useState('10');
  const fileRef = useRef(null);
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[#1f2937]">Virtual Meeting</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">Jitsi</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">Virtual Meeting</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-[#1f2937] mb-4">Add Meeting</h2>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">MEMBER TYPE <span className="text-red-500">*</span></label>
            <select value={memberType} onChange={e => setMemberType(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="">Member Type *</option>
              <option value="Teacher">Teacher</option>
              <option value="Staff">Staff</option>
              <option value="Student">Student</option>
              <option value="Parent">Parent</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">MEMBER <span className="text-red-500">*</span></label>
            <select value={member} onChange={e => setMember(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="">Select Member</option>
              <option value="Mudassir Bajwa (Teacher)">Mudassir Bajwa (Teacher)</option>
              <option value="Fatima Zahra (Teacher)">Fatima Zahra (Teacher)</option>
              <option value="Muhammad Ali (Teacher)">Muhammad Ali (Teacher)</option>
              <option value="Usman Tariq (Staff)">Usman Tariq (Staff)</option>
              <option value="Muhammad Rayyan (Student)">Muhammad Rayyan (Student)</option>
              <option value="Zoya Fatima (Student)">Zoya Fatima (Student)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">TOPIC <span className="text-red-500">*</span></label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">DESCRIPTION</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">DATE OF MEETING <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">MEETING TIME <span className="text-red-500">*</span></label>
            <input type="text" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">MEETING DURATION <span className="text-red-500">*</span></label>
            <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">MEETING START BEFORE</label>
            <input type="number" value={startBefore} onChange={e => setStartBefore(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 flex-1 truncate bg-white border border-gray-300 px-3 py-2.5 rounded">Attach File</span>
              <button type="button" onClick={() => fileRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded cursor-pointer transition-colors shadow-sm uppercase">BROWSE</button>
              <input ref={fileRef} type="file" className="hidden" />
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">? SAVE</button>
          </div>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1f2937]">Meeting list</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border-b border-gray-300 px-2 py-1">
                <Search className="w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH" className="bg-transparent text-sm text-gray-700 outline-none w-32 placeholder:text-gray-400" />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-t border-gray-200">
              <thead>
                <tr className="border-b border-gray-200 text-indigo-600">
                  <th className="py-3 px-3 font-medium text-xs">? #</th>
                  <th className="py-3 px-3 font-medium text-xs">? Meeting Id</th>
                  <th className="py-3 px-3 font-medium text-xs">? Topic</th>
                  <th className="py-3 px-3 font-medium text-xs">? Date | Time</th>
                  <th className="py-3 px-3 font-medium text-xs">? Duration</th>
                  <th className="py-3 px-3 font-medium text-xs">? Start Join Before</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">No Data Available In Table</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span>Showing 0 to 0 of 0 entries</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 text-gray-500 hover:text-gray-700">?</button>
              <button className="px-2 py-1 text-gray-500 hover:text-gray-700">?</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}