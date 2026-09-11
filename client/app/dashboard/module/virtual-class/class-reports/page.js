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
  Video, 
  Eye, 
  CheckCircle2, 
  Users, 
  Calendar 
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function VirtualClassReportsPage() {
  const [criteria, setCriteria] = useState({
    classVal: 'All Classes',
    section: 'All Sections',
    fromDate: '2026-09-01',
    toDate: '2026-09-30'
  });

  const [activeFilter, setActiveFilter] = useState({
    classVal: 'All Classes',
    section: 'All Sections'
  });

  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const classes = ['All Classes', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  const sections = ['All Sections', 'A', 'B', 'C', 'D'];

  const initialReports = [
    {
      id: 1,
      topic: 'Advanced Calculus & Analytical Geometry',
      classVal: 'Class 10',
      section: 'A',
      teacher: 'Mudassir Bajwa',
      date: '2026-09-02',
      time: '09:00 AM',
      duration: '45 mins',
      totalEnrolled: 36,
      attended: 34,
      percentage: '94.4%'
    },
    {
      id: 2,
      topic: 'Biology - Cellular Respiration & ATP Cycle',
      classVal: 'Class 9',
      section: 'B',
      teacher: 'Fatima Zahra',
      date: '2026-09-03',
      time: '11:00 AM',
      duration: '60 mins',
      totalEnrolled: 30,
      attended: 27,
      percentage: '90.0%'
    },
    {
      id: 3,
      topic: 'English Literature - Poetry Analysis & Figures of Speech',
      classVal: 'Class 10',
      section: 'B',
      teacher: 'Ayesha Noor',
      date: '2026-09-04',
      time: '10:15 AM',
      duration: '45 mins',
      totalEnrolled: 32,
      attended: 31,
      percentage: '96.8%'
    }
  ];

  const [reportsList, setReportsList] = useState(initialReports);

  const handleSearchCriteria = (e) => {
    e.preventDefault();
    setActiveFilter({
      classVal: criteria.classVal,
      section: criteria.section
    });
  };

  const filteredReports = useMemo(() => {
    return reportsList.filter(item => {
      const matchClass = activeFilter.classVal === 'All Classes' || item.classVal === activeFilter.classVal;
      const matchSection = activeFilter.section === 'All Sections' || item.section === activeFilter.section;
      const matchSearch = !search ||
        item.topic.toLowerCase().includes(search.toLowerCase()) ||
        item.teacher.toLowerCase().includes(search.toLowerCase()) ||
        item.classVal.toLowerCase().includes(search.toLowerCase());
      return matchClass && matchSection && matchSearch;
    });
  }, [reportsList, activeFilter, search]);

  const handleCopy = () => {
    const text = filteredReports.map(r => `${r.topic} | ${r.classVal} (${r.section}) | ${r.teacher} | ${r.date} | ${r.duration} | ${r.attended}/${r.totalEnrolled} (${r.percentage})`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Class reports copied to clipboard!');
  };

  const handleExportCSV = () => {
    exportToCSV(filteredReports, 'Virtual_Class_Reports');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredReports, 'Virtual_Class_Reports');
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredReports,
      ['topic', 'classVal', 'section', 'teacher', 'date', 'duration', 'attended', 'percentage'],
      'Virtual Class Reports Overview',
      'Virtual_Class_Reports'
    );
  };

  const handlePrint = () => {
    printData(
      filteredReports,
      ['topic', 'classVal', 'section', 'teacher', 'date', 'duration', 'attended', 'percentage'],
      'Virtual Class Reports Overview'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900">
            Virtual Class Reports
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">
            Analyze online class attendance, student participation, and duration metrics.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/virtual-class" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">
            Virtual Class
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-zinc-900 font-medium">Class Reports</span>
        </div>
      </div>

      {/* Select Criteria Card */}
      <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider mb-5">
          Select Criteria
        </h2>
        <form onSubmit={handleSearchCriteria}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={criteria.classVal}
                onChange={(e) => setCriteria({ ...criteria, classVal: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={criteria.section}
                onChange={(e) => setCriteria({ ...criteria, section: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
              >
                {sections.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                From Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={criteria.fromDate}
                onChange={(e) => setCriteria({ ...criteria, fromDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                To Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={criteria.toDate}
                onChange={(e) => setCriteria({ ...criteria, toDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Reports Overview Table Card */}
      <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-200">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">
              Virtual Class Reports Overview
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-300 dark:border-zinc-200">
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
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-900 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-200">
              <button
                onClick={handleCopy}
                title="Copy Table"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleExportExcel}
                title="Export Excel"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleExportCSV}
                title="Export CSV"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleExportPDF}
                title="Export PDF"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handlePrint}
                title="Print"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-200">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-200">
              <tr>
                <th className="px-3.5 py-3">SL</th>
                <th className="px-3.5 py-3">Topic</th>
                <th className="px-3.5 py-3">Class (Sec)</th>
                <th className="px-3.5 py-3">Teacher</th>
                <th className="px-3.5 py-3">Date & Time</th>
                <th className="px-3.5 py-3">Duration</th>
                <th className="px-3.5 py-3">Attendance</th>
                <th className="px-3.5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                    No Data Available In Table
                  </td>
                </tr>
              ) : (
                filteredReports.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-100/40 transition-colors"
                  >
                    <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-800">
                      {index + 1}
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-zinc-900 dark:text-zinc-900">
                      {item.topic}
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-700">
                        {item.classVal} ({item.section})
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-medium text-zinc-700 dark:text-zinc-700">
                      {item.teacher}
                    </td>
                    <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap">
                      <div>{item.date}</div>
                      <div className="text-[10px] text-zinc-400">{item.time}</div>
                    </td>
                    <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap">
                      {item.duration}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-900">{item.attended}/{item.totalEnrolled}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-200 text-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
                          {item.percentage}
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedReport(item)}
                        className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-800 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
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
              className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed"
            >
              &lt;
            </button>
            <button
              className="px-2.5 py-1 rounded border border-zinc-600 bg-zinc-100 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 font-semibold"
            >
              1
            </button>
            <button
              disabled
              className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-200 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-900">Class Report Details</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-950 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-200">
                <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-900">{selectedReport.topic}</div>
                <div className="text-zinc-500 mt-1">{selectedReport.classVal} - Section {selectedReport.section} | Instructor: {selectedReport.teacher}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Session Date:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-800">{selectedReport.date} ({selectedReport.time})</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Duration:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-800">{selectedReport.duration}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Attended / Total:</span>
                  <span className="font-semibold text-zinc-800">{selectedReport.attended} / {selectedReport.totalEnrolled} Students</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Attendance Rate:</span>
                  <span className="font-semibold text-zinc-800">{selectedReport.percentage}</span>
                </div>
              </div>
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
