'use client';
import { useState, useRef } from 'react';
import { ChevronRight, Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function ExamSignatureSettingsPage() {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const fileRef = useRef(null);
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold text-zinc-950">Exam Signature Settings</h1>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-200">Dashboard</Link><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Exam</span><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Settings</span><span className="mx-2">|</span>
          <span className="text-indigo-400 font-medium">Exam Signature Settings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-zinc-950 mb-4">Add Signature</h2>
          
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">NAME *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs text-zinc-950 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">DESIGNATION *</label>
            <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs text-zinc-950 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">SIGNATURE IMAGE *</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-zinc-200 shadow-xs text-zinc-500 text-sm rounded-lg px-3 py-2.5 flex items-center">Browse Image</div>
              <button onClick={() => fileRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 rounded-lg cursor-pointer transition-colors">BROWSE</button>
              <input ref={fileRef} type="file" className="hidden" />
            </div>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors mt-4">? SAVE</button>
        </div>

        <div className="xl:col-span-2 bg-white border border-zinc-200 shadow-xs rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-zinc-950">Signature List</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-zinc-200 rounded-md px-2 py-1.5 bg-zinc-950">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH" className="bg-transparent text-xs text-zinc-950 outline-none w-32" />
              </div>
              <div className="flex gap-1">
                {[Copy, FileSpreadsheet, FileText, Printer, Download, Columns].map((Icon, i) => (
                  <button key={i} className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-100 rounded transition-colors"><Icon className="w-3.5 h-3.5" /></button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400">
                  <th className="py-3 px-3 font-medium text-xs">? SL</th>
                  <th className="py-3 px-3 font-medium text-xs">? Name</th>
                  <th className="py-3 px-3 font-medium text-xs">? Designation</th>
                  <th className="py-3 px-3 font-medium text-xs">? Signature</th>
                  <th className="py-3 px-3 font-medium text-xs text-center">? Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">No Data Available In Table</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
