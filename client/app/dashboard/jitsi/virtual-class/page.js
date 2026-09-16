'use client';
import { useState, useRef } from 'react';
import { Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Plus } from 'lucide-react';
import Link from 'next/link';

export default function JitsiVirtualClassPage() {
  const [classVal, setClassVal] = useState('Class*');
  const [section, setSection] = useState('Select Section');
  const [teacher, setTeacher] = useState('');
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
        <h1 className="text-[22px] font-bold text-[#1f2937]">Virtual Class</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">Jitsi</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">Virtual Class</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-[#1f2937] mb-4">Add Virtual Class</h2>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">CLASS <span className="text-red-500">*</span></label>
            <select value={classVal} onChange={e => setClassVal(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="">Select Class *</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
              <option value="Class 4">Class 4</option>
              <option value="Class 5">Class 5</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="O-Levels">O-Levels</option>
              <option value="A-Levels">A-Levels</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">SECTION</label>
            <select value={section} onChange={e => setSection(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="">Select Section</option>
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
              <option value="Section C">Section C</option>
              <option value="Section D">Section D</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Teacher <span className="text-red-500">*</span></label>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="teacher" value="Mudassir Bajwa" checked={teacher === 'Mudassir Bajwa'} onChange={(e) => setTeacher(e.target.value)} className="w-3.5 h-3.5 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                <span className="text-sm text-gray-600">Mudassir Bajwa</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="teacher" value="Iveen Chowdhury" checked={teacher === 'Iveen Chowdhury'} onChange={(e) => setTeacher(e.target.value)} className="w-3.5 h-3.5 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                <span className="text-sm text-gray-600">Iveen Chowdhury</span>
              </label>
            </div>
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

        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1f2937]">Virtual Class List</h2>
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
                  <th className="py-3 px-3 font-medium text-xs">? #</th>
                  <th className="py-3 px-3 font-medium text-xs">? Class</th>
                  <th className="py-3 px-3 font-medium text-xs">? Class (Section)</th>
                  <th className="py-3 px-3 font-medium text-xs">? Meeting Id</th>
                  <th className="py-3 px-3 font-medium text-xs">? Topic</th>
                  <th className="py-3 px-3 font-medium text-xs">? Date | Time</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold cursor-pointer hover:bg-indigo-700"><Plus className="w-3 h-3" /></div>
                      <span className="text-gray-700">1</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-700">LEN-101 2:00-3:40PM</td>
                  <td className="py-3 px-3 text-gray-700">English</td>
                  <td className="py-3 px-3 text-gray-700">26082814</td>
                  <td className="py-3 px-3 text-gray-700">Englis</td>
                  <td className="py-3 px-3 text-gray-700 text-xs">08/28/2026 | 9:08<br/>AM</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span>Showing 1 to 1 of 1 entries</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 text-gray-500 hover:text-gray-700">?</button>
              <button className="px-2 py-1 bg-indigo-600 text-white rounded">1</button>
              <button className="px-2 py-1 text-gray-500 hover:text-gray-700">?</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
