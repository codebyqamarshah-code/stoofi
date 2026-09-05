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
  CheckCircle2, 
  Users, 
  Calendar, 
  Filter 
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function JitsiMeetingReportsPage() {
  const [criteria, setCriteria] = useState({
    host: 'All Hosts',
    audience: 'All Audiences',
    fromDate: '2026-09-01',
    toDate: '2026-09-30'
  });

  const [activeFilter, setActiveFilter] = useState({
    host: 'All Hosts',
    audience: 'All Audiences'
  });

  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const hosts = ['All Hosts', 'Mudassir Bajwa', 'Fatima Zahra', 'Muhammad Ali', 'Ahmed Khan', 'Ayesha Noor', 'Dr. Bilal Siddiqui'];
  const audiences = ['All Audiences', 'All Teachers', 'Staff Members', 'Parents', 'Admin & Management', 'General'];

  const initialReports = [
    {
      id: 1,
      topic: 'Staff Weekly Academic Review',
      host: 'Mudassir Bajwa',
      audience: 'All Teachers',
      date: '2026-09-02',
      time: '02:00 PM',
      duration: '45 mins',
      attendeesCount: 24,
      status: 'Completed',
      notes: 'Reviewed term progress and syllabus pacing. All faculty present.'
    },
    {
      id: 2,
      topic: 'Parents & Teachers Association Meeting',
      host: 'Fatima Zahra',
      audience: 'Parents',
      date: '2026-09-03',
      time: '04:30 PM',
      duration: '60 mins',
      attendeesCount: 48,
      status: 'Completed',
      notes: 'Parent queries addressed regarding annual sports week.'
    },
    {
      id: 3,
      topic: 'Administrative Board Strategy Session',
      host: 'Dr. Bilal Siddiqui',
      audience: 'Admin & Management',
      date: '2026-09-04',
      time: '11:00 AM',
      duration: '75 mins',
      attendeesCount: 8,
      status: 'Completed',
      notes: 'Budget allocations confirmed for Q4 campus infrastructure.'
    }
  ];

  const [reportsList, setReportsList] = useState(initialReports);

  const handleSearchCriteria = (e) => {
    e.preventDefault();
    setActiveFilter({
      host: criteria.host,
      audience: criteria.audience
    });
  };

  const filteredReports = useMemo(() => {
    return reportsList.filter(item => {
      const matchHost = activeFilter.host === 'All Hosts' || item.host === activeFilter.host;
      const matchAudience = activeFilter.audience === 'All Audiences' || item.audience === activeFilter.audience;
      const matchSearch = !search ||
        item.topic.toLowerCase().includes(search.toLowerCase()) ||
        item.host.toLowerCase().includes(search.toLowerCase()) ||
        item.audience.toLowerCase().includes(search.toLowerCase());
      return matchHost && matchAudience && matchSearch;
    });
  }, [reportsList, activeFilter, search]);

  const handleCopy = () => {
    const text = filteredReports.map(r => `${r.topic} | ${r.host} | ${r.audience} | ${r.date} ${r.time} | ${r.duration} | ${r.attendeesCount} attendees | ${r.status}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Meeting reports copied to clipboard!');
  };

  const handleExportCSV = () => {
    exportToCSV(filteredReports, 'Jitsi_Meeting_Reports');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredReports, 'Jitsi_Meeting_Reports');
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredReports,
      ['topic', 'host', 'audience', 'date', 'time', 'duration', 'attendeesCount', 'status'],
      'Jitsi Virtual Meeting Reports',
      'Jitsi_Meeting_Reports'
    );
  };

  const handlePrint = () => {
    printData(
      filteredReports,
      ['topic', 'host', 'audience', 'date', 'time', 'duration', 'attendeesCount', 'status'],
      'Jitsi Virtual Meeting Reports'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Jitsi Meeting Reports
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review past video conference logs, attendee counts, and meeting summaries.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/jitsi" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Jitsi
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Meeting Reports</span>
        </div>
      </div>

      {/* Select Criteria Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-5">
          Select Criteria
        </h2>
        <form onSubmit={handleSearchCriteria}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Host / Organizer <span className="text-rose-500">*</span>
              </label>
              <select
                value={criteria.host}
                onChange={(e) => setCriteria({ ...criteria, host: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
              >
                {hosts.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Audience <span className="text-rose-500">*</span>
              </label>
              <select
                value={criteria.audience}
                onChange={(e) => setCriteria({ ...criteria, audience: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
              >
                {audiences.map(aud => (
                  <option key={aud} value={aud}>{aud}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                From Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={criteria.fromDate}
                onChange={(e) => setCriteria({ ...criteria, fromDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                To Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={criteria.toDate}
                onChange={(e) => setCriteria({ ...criteria, toDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#009966] hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Reports Overview Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Jitsi Meeting Reports Overview
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {filteredReports.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="SEARCH"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={handleCopy}
                title="Copy Table"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleExportExcel}
                title="Export Excel"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleExportCSV}
                title="Export CSV"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleExportPDF}
                title="Export PDF"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handlePrint}
                title="Print"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-3.5 py-3">SL</th>
                <th className="px-3.5 py-3">Meeting Topic</th>
                <th className="px-3.5 py-3">Host</th>
                <th className="px-3.5 py-3">Audience</th>
                <th className="px-3.5 py-3">Date & Time</th>
                <th className="px-3.5 py-3">Duration</th>
                <th className="px-3.5 py-3">Attendees</th>
                <th className="px-3.5 py-3">Status</th>
                <th className="px-3.5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">
                    No Data Available In Table
                  </td>
                </tr>
              ) : (
                filteredReports.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-200">
                      {index + 1}
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-zinc-900 dark:text-white">
                      {item.topic}
                    </td>
                    <td className="px-3.5 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                      {item.host}
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                        {item.audience}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      <div>{item.date}</div>
                      <div className="text-[10px] text-zinc-400">{item.time}</div>
                    </td>
                    <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {item.duration}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {item.attendeesCount} Joined
                      </span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedReport(item)}
                        className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-2 text-xs text-zinc-500">
          <div>
            Showing {filteredReports.length > 0 ? 1 : 0} to {filteredReports.length} of {reportsList.length} entries
          </div>
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              disabled
              className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-50 cursor-not-allowed"
            >
              &lt;
            </button>
            <button
              className="px-2.5 py-1 rounded border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold"
            >
              1
            </button>
            <button
              disabled
              className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-50 cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Meeting Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">Virtual Meeting Summary</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                <div className="font-semibold text-sm text-zinc-900 dark:text-white">{selectedReport.topic}</div>
                <div className="text-zinc-500 mt-1">Host: {selectedReport.host} | Target: {selectedReport.audience}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 block">Date & Time:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedReport.date} ({selectedReport.time})</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 block">Duration:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedReport.duration}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 block">Attendees:</span>
                  <span className="font-semibold text-emerald-600">{selectedReport.attendeesCount} Members Joined</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 block">Status:</span>
                  <span className="font-semibold text-emerald-600">{selectedReport.status}</span>
                </div>
              </div>
              {selectedReport.notes && (
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 block font-semibold mb-1">Session Minutes / Notes:</span>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{selectedReport.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
