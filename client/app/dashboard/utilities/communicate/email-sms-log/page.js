'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Copy, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  Eye, 
  Trash2, 
  Mail, 
  MessageSquare,
  Send
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function EmailSmsLogPage() {
  const [logs, setLogs] = useState([
    {
      id: 1,
      title: 'Monthly Fee Due Reminder - September 2026',
      channel: 'SMS',
      receiverGroup: 'Parents',
      totalCount: 420,
      deliveredCount: 416,
      sentDate: '2026-09-02 10:15 AM',
      sender: 'Finance Dept',
      status: 'Delivered',
      message: 'Dear Parent, fee for September 2026 is due. Please clear outstanding dues by 10th Sep to avoid late surcharge.'
    },
    {
      id: 2,
      title: 'Annual Sports Gala Participation Circular',
      channel: 'EMAIL',
      receiverGroup: 'All Students & Parents',
      totalCount: 850,
      deliveredCount: 842,
      sentDate: '2026-09-03 04:30 PM',
      sender: 'Super Admin',
      status: 'Delivered',
      message: 'Annual sports festival registrations are open! Find the schedule, consent form, and house categories attached.'
    },
    {
      id: 3,
      title: 'Faculty Emergency Meeting Notice',
      channel: 'SMS',
      receiverGroup: 'Teachers',
      totalCount: 48,
      deliveredCount: 48,
      sentDate: '2026-09-04 08:30 AM',
      sender: 'Principal',
      status: 'Delivered',
      message: 'Brief staff meeting today at 01:45 PM in the main conference hall regarding Q3 curriculum review.'
    }
  ]);

  const [search, setSearch] = useState('');
  const [filterChannel, setFilterChannel] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  const handleDelete = (id) => {
    if (confirm('Delete this dispatch log record?')) {
      setLogs(logs.filter(l => l.id !== id));
    }
  };

  const filteredLogs = useMemo(() => logs.filter(item => {
    const matchChannel = filterChannel === 'All' || item.channel === filterChannel;
    const matchSearch = !search || 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.receiverGroup.toLowerCase().includes(search.toLowerCase()) ||
      item.sender.toLowerCase().includes(search.toLowerCase());
    return matchChannel && matchSearch;
  }), [logs, filterChannel, search]);

  const handleCopy = () => {
    navigator.clipboard.writeText(filteredLogs.map(l => `${l.title} | ${l.channel} | ${l.receiverGroup} | Delivered: ${l.deliveredCount}/${l.totalCount} | Date: ${l.sentDate}`).join('\n'));
    alert('Logs copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900">Email / SMS Log</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">Audit trail of all broadcast emails, SMS messages, and delivery receipts.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">Communicate</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-zinc-900 font-medium">Email / SMS Log</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-200">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">Communication Logs</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-300 dark:border-zinc-200">
              {filteredLogs.length}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-900 text-xs outline-none focus:ring-1 focus:ring-zinc-600"
            >
              <option value="All">All Channels</option>
              <option value="SMS">SMS</option>
              <option value="EMAIL">Email</option>
            </select>
            <div className="relative min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="SEARCH LOGS"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-900 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-600"
              >
              </input>
            </div>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-200">
              <button onClick={handleCopy} title="Copy" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={() => exportToExcel(filteredLogs, 'Communication_Logs')} title="Excel" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><FileSpreadsheet className="h-3.5 w-3.5" /></button>
              <button onClick={() => exportToCSV(filteredLogs, 'Communication_Logs')} title="CSV" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><FileText className="h-3.5 w-3.5" /></button>
              <button onClick={() => exportToPDF(filteredLogs, ['title', 'channel', 'receiverGroup', 'deliveredCount', 'sentDate', 'status'], 'Communication Logs', 'Communication_Logs')} title="PDF" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Download className="h-3.5 w-3.5" /></button>
              <button onClick={() => printData(filteredLogs, ['title', 'channel', 'receiverGroup', 'deliveredCount', 'sentDate', 'status'], 'Communication Logs')} title="Print" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Printer className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-200">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-200">
              <tr>
                <th className="px-3.5 py-3">SL</th>
                <th className="px-3.5 py-3">Subject / Title</th>
                <th className="px-3.5 py-3">Channel</th>
                <th className="px-3.5 py-3">Audience</th>
                <th className="px-3.5 py-3">Sent Count</th>
                <th className="px-3.5 py-3">Sent Time</th>
                <th className="px-3.5 py-3">Status</th>
                <th className="px-3.5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-500">No Communication Logs Found</td></tr>
              ) : filteredLogs.map((item, index) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-100/40 transition-colors">
                  <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-800">{index + 1}</td>
                  <td className="px-3.5 py-3">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-900 line-clamp-1">{item.title}</div>
                    <div className="text-[10px] text-zinc-400">By: {item.sender}</div>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.channel === 'SMS' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'}`}>
                      {item.channel}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-zinc-700 dark:text-zinc-700 font-medium">{item.receiverGroup}</td>
                  <td className="px-3.5 py-3">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-900">{item.deliveredCount}</span>
                    <span className="text-zinc-400 text-[10px]"> / {item.totalCount}</span>
                  </td>
                  <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap">{item.sentDate}</td>
                  <td className="px-3.5 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 text-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedLog(item)}
                        className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-800 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="h-3 w-3" /> View
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 rounded transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-200 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-900">Broadcast Message Details</h3>
              <button onClick={() => setSelectedLog(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-950 font-bold text-sm">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-200">
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-900">{selectedLog.title}</div>
                <div className="text-zinc-500 mt-1">Channel: <strong>{selectedLog.channel}</strong> | Sent to: <strong>{selectedLog.receiverGroup}</strong></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Sent Date:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-800">{selectedLog.sentDate}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Delivered Rate:</span>
                  <span className="font-semibold text-zinc-800">{selectedLog.deliveredCount} of {selectedLog.totalCount} ({((selectedLog.deliveredCount/selectedLog.totalCount)*100).toFixed(1)}%)</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-200">
                <span className="text-zinc-500 block font-semibold mb-1">Message Body:</span>
                <p className="text-zinc-700 dark:text-zinc-700 leading-relaxed whitespace-pre-wrap">{selectedLog.message}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
