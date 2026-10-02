'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Copy, FileSpreadsheet, FileText, Printer, Download, PlayCircle, Trash2, Eye } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function BBBClassRecordListPage() {
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const classes = ['All', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'];

  const [records, setRecords] = useState([]);

  const handleDelete = (id) => {
    if (confirm('Delete this class recording permanently?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const filtered = useMemo(() => records.filter(item => {
    const mClass = filterClass === 'All' || item.classVal === filterClass;
    const mSearch = !search || item.topic.toLowerCase().includes(search.toLowerCase()) || item.teacher.toLowerCase().includes(search.toLowerCase());
    return mClass && mSearch;
  }), [records, filterClass, search]);

  const handleCopy = () => { navigator.clipboard.writeText(filtered.map(r => `${r.topic} | ${r.classVal}(${r.section}) | ${r.teacher} | ${r.date} | ${r.duration} | ${r.fileSize} | ${r.status}`).join('\n')); alert('Copied!'); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900">BBB Class Recording List</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">Access and manage all recorded BigBlueButton classroom sessions for playback.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/bigbluebutton" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">BigBlueButton</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-zinc-900 font-medium">Class Record List</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-200">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">Class Recording Library</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-300 dark:border-zinc-200">{filtered.length}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-900 text-xs outline-none focus:ring-1 focus:ring-zinc-600">
              {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>)}
            </select>
            <div className="relative min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input type="text" placeholder="SEARCH" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-900 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-600" />
            </div>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-200">
              <button onClick={handleCopy} title="Copy" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={() => exportToExcel(filtered, 'BBB_Class_Recordings')} title="Excel" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><FileSpreadsheet className="h-3.5 w-3.5" /></button>
              <button onClick={() => exportToCSV(filtered, 'BBB_Class_Recordings')} title="CSV" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><FileText className="h-3.5 w-3.5" /></button>
              <button onClick={() => exportToPDF(filtered, ['topic','classVal','section','teacher','date','duration','fileSize','status'], 'BBB Class Recordings', 'BBB_Class_Recordings')} title="PDF" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Download className="h-3.5 w-3.5" /></button>
              <button onClick={() => printData(filtered, ['topic','classVal','section','teacher','date','duration','fileSize','status'], 'BBB Class Recordings')} title="Print" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Printer className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-200">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-zinc-900 font-bold dark:text-zinc-600 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-50/50 border-b border-zinc-200 dark:border-zinc-200">
              <tr>
                <th className="px-3.5 py-3">SL</th><th className="px-3.5 py-3">Session Topic</th><th className="px-3.5 py-3">Class (Sec)</th><th className="px-3.5 py-3">Teacher</th><th className="px-3.5 py-3">Recorded Date</th><th className="px-3.5 py-3">Duration</th><th className="px-3.5 py-3">File Size</th><th className="px-3.5 py-3">Status</th><th className="px-3.5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              ) : filtered.map((item, index) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-100/40 transition-colors">
                  <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-800">{index + 1}</td>
                  <td className="px-3.5 py-3 font-semibold text-zinc-900 dark:text-zinc-900">{item.topic}</td>
                  <td className="px-3.5 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-700">{item.classVal} ({item.section})</span></td>
                  <td className="px-3.5 py-3 font-medium text-zinc-700 dark:text-zinc-700">{item.teacher}</td>
                  <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600">{item.date}</td>
                  <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap">{item.duration}</td>
                  <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap">{item.fileSize}</td>
                  <td className="px-3.5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.status === 'Available' ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-100 dark:text-zinc-900' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'}`}>{item.status}</span>
                  </td>
                  <td className="px-3.5 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'Available' && (
                        <a href={item.playbackUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors">
                          <PlayCircle className="h-3 w-3" />Play
                        </a>
                      )}
                      <a href={item.playbackUrl} download className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-800 rounded text-[11px] font-medium flex items-center gap-1 transition-colors">
                        <Download className="h-3 w-3" />Download
                      </a>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 rounded transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between pt-4 mt-2 text-xs text-zinc-500">
          <div>Showing {filtered.length} of {records.length} entries</div>
          <div className="flex items-center gap-1">
            <button disabled className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed">&lt;</button>
            <button className="px-2.5 py-1 rounded border border-zinc-600 bg-zinc-100 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 font-semibold">1</button>
            <button disabled className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
