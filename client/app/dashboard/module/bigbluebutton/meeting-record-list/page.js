'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Copy, FileSpreadsheet, FileText, Printer, Download, PlayCircle, Trash2 } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function BBBMeetingRecordListPage() {
  const [search, setSearch] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');

  const audiences = ['All','All Teachers','Staff Members','Parents','Admin & Management','General'];

  const [records, setRecords] = useState([]);

  const handleDelete = (id) => {
    if (confirm('Delete this meeting recording permanently?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const filtered = useMemo(() => records.filter(item => {
    const mAud = filterAudience === 'All' || item.audience === filterAudience;
    const mSearch = !search || item.topic.toLowerCase().includes(search.toLowerCase()) || item.host.toLowerCase().includes(search.toLowerCase());
    return mAud && mSearch;
  }), [records, filterAudience, search]);

  const handleCopy = () => { navigator.clipboard.writeText(filtered.map(r => `${r.topic} | ${r.host} | ${r.audience} | ${r.date} | ${r.duration} | ${r.fileSize} | ${r.status}`).join('\n')); alert('Copied!'); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900">BBB Meeting Recording List</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">Access and manage all recorded BBB virtual meeting sessions for playback or download.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/bigbluebutton" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">BigBlueButton</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-zinc-900 font-medium">Meeting Record List</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-200">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">Meeting Recording Library</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-300 dark:border-zinc-200">{filtered.length}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)} className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-900 text-xs outline-none focus:ring-1 focus:ring-zinc-600">
              {audiences.map(a => <option key={a} value={a}>{a === 'All' ? 'All Audiences' : a}</option>)}
            </select>
            <div className="relative min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input type="text" placeholder="SEARCH" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-900 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-600" />
            </div>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-200">
              <button onClick={handleCopy} title="Copy" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={() => exportToExcel(filtered, 'BBB_Meeting_Recordings')} title="Excel" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><FileSpreadsheet className="h-3.5 w-3.5" /></button>
              <button onClick={() => exportToCSV(filtered, 'BBB_Meeting_Recordings')} title="CSV" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><FileText className="h-3.5 w-3.5" /></button>
              <button onClick={() => exportToPDF(filtered, ['topic','host','audience','date','duration','fileSize','status'], 'BBB Meeting Recordings', 'BBB_Meeting_Recordings')} title="PDF" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Download className="h-3.5 w-3.5" /></button>
              <button onClick={() => printData(filtered, ['topic','host','audience','date','duration','fileSize','status'], 'BBB Meeting Recordings')} title="Print" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Printer className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-200">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-zinc-900 font-bold dark:text-zinc-600 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-50/50 border-b border-zinc-200 dark:border-zinc-200">
              <tr>
                <th className="px-3.5 py-3">SL</th><th className="px-3.5 py-3">Meeting Topic</th><th className="px-3.5 py-3">Host</th><th className="px-3.5 py-3">Audience</th><th className="px-3.5 py-3">Date</th><th className="px-3.5 py-3">Duration</th><th className="px-3.5 py-3">File Size</th><th className="px-3.5 py-3">Status</th><th className="px-3.5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              ) : filtered.map((item, index) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-100/40 transition-colors">
                  <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-800">{index + 1}</td>
                  <td className="px-3.5 py-3 font-semibold text-zinc-900 dark:text-zinc-900">{item.topic}</td>
                  <td className="px-3.5 py-3 font-medium text-zinc-700 dark:text-zinc-700">{item.host}</td>
                  <td className="px-3.5 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">{item.audience}</span></td>
                  <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600">{item.date}</td>
                  <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600">{item.duration}</td>
                  <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600">{item.fileSize}</td>
                  <td className="px-3.5 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.status === 'Available' ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-100 dark:text-zinc-900' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'}`}>{item.status}</span></td>
                  <td className="px-3.5 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'Available' && (
                        <a href={item.playbackUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"><PlayCircle className="h-3 w-3" />Play</a>
                      )}
                      <a href={item.playbackUrl} download className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-800 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"><Download className="h-3 w-3" />Download</a>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 rounded transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
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
