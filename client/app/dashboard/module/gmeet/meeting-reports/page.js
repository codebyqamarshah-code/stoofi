'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Users, 
  Video 
} from 'lucide-react';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function GMeetMeetingReportsPage() {
  const [criteria, setCriteria] = useState({
    audience: 'All Audiences',
    fromDate: '',
    toDate: '',
  });
  const [activeFilter, setActiveFilter] = useState({ audience: 'All Audiences' });
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportsList, setReportsList] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    liveClasses: 0,
    completedClasses: 0,
    totalHours: '0.0',
    totalAttended: 0,
  });
  const [loading, setLoading] = useState(true);

  const audiences = ['All Audiences', 'All Teachers', 'Staff Members', 'Parents', 'Admin & Management', 'Academic Council', 'General'];

  const fetchReports = async () => {
    setLoading(true);
    try {
      let queryUrl = '/virtual-class/reports?type=meeting';
      if (criteria.fromDate && criteria.toDate) {
        queryUrl += `&fromDate=${criteria.fromDate}&toDate=${criteria.toDate}`;
      }

      const res = await api.get(queryUrl);
      if (res && res.success) {
        setReportsList(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching meeting reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveFilter({ audience: criteria.audience });
    fetchReports();
  };

  const filtered = useMemo(() => {
    return reportsList.filter(item => {
      const mAud = activeFilter.audience === 'All Audiences' || item.audience === activeFilter.audience;
      const mSearch =
        !search ||
        (item.topic && item.topic.toLowerCase().includes(search.toLowerCase())) ||
        (item.teacher && item.teacher.toLowerCase().includes(search.toLowerCase())) ||
        (item.audience && item.audience.toLowerCase().includes(search.toLowerCase()));
      return mAud && mSearch;
    });
  }, [reportsList, activeFilter, search]);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      filtered
        .map(r => `${r.topic} | Host: ${r.teacher} | Audience: ${r.audience} | ${r.date} ${r.time} | Duration: ${r.duration}m | Status: ${r.status}`)
        .join('\n')
    );
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Google Meet Meeting Reports</h1>
          <p className="text-sm text-zinc-600 font-medium mt-1">Review historical conference logs, host participation, and minutes for Google Meet conferences.</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/module/gmeet" className="hover:text-zinc-900 transition-colors">Google Meet</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Meeting Reports</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Meetings</div>
          <div className="text-2xl font-black text-zinc-950 mt-1">{stats.totalClasses}</div>
          <div className="text-[11px] text-zinc-600 font-medium mt-1">Conferences recorded</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live Active Now</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.liveClasses}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">● Ongoing sessions</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total Meeting Hours</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{stats.totalHours} hrs</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">Conference time logged</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Completed Sessions</div>
          <div className="text-2xl font-black text-zinc-900 mt-1">{stats.completedClasses}</div>
          <div className="text-[11px] text-zinc-500 font-medium mt-1">Archived conferences</div>
        </div>
      </div>

      {/* Filter Criteria Card */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-bold text-zinc-950 uppercase tracking-wider mb-5">Filter Criteria</h2>
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                Target Audience <span className="text-rose-500">*</span>
              </label>
              <select
                value={criteria.audience}
                onChange={(e) => setCriteria({ ...criteria, audience: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
              >
                {audiences.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">From Date</label>
              <input
                type="date"
                value={criteria.fromDate}
                onChange={(e) => setCriteria({ ...criteria, fromDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">To Date</label>
              <input
                type="date"
                value={criteria.toDate}
                onChange={(e) => setCriteria({ ...criteria, toDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
              />
            </div>
          </div>
          <div className="flex justify-end mt-5">
            <button
              type="submit"
              className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Search className="h-4 w-4" /> Filter Reports
            </button>
          </div>
        </form>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-950 uppercase tracking-wider">Meeting Reports Overview</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-900 border border-zinc-200">
              {filtered.length}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search topic, host..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-950 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
              />
            </div>
            <TableExportToolbar />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-3.5 py-3">SL</th>
                <th className="px-3.5 py-3">Meeting Topic</th>
                <th className="px-3.5 py-3">Host</th>
                <th className="px-3.5 py-3">Audience</th>
                <th className="px-3.5 py-3">Date & Time</th>
                <th className="px-3.5 py-3">Duration</th>
                <th className="px-3.5 py-3">Status</th>
                <th className="px-3.5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-600 font-semibold">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-zinc-900" />
                    Loading meeting reports...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-600 font-semibold">No Data Available In Table</td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item._id || item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-3.5 py-3 font-bold text-zinc-950">{index + 1}</td>
                    <td className="px-3.5 py-3">
                      <div className="font-bold text-zinc-950">{item.topic}</div>
                      {item.description && (
                        <div className="text-[11px] text-zinc-500 font-medium line-clamp-1 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td className="px-3.5 py-3 font-medium text-zinc-900">{item.teacher}</td>
                    <td className="px-3.5 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                        {item.audience || 'All Teachers'}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-zinc-700 whitespace-nowrap">
                      <div className="font-semibold text-zinc-950">{item.date}</div>
                      <div className="text-[10px] text-zinc-500 font-medium">{item.time}</div>
                    </td>
                    <td className="px-3.5 py-3 text-zinc-800 whitespace-nowrap font-medium">{item.duration} Mins</td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.status === 'Live' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        item.status === 'Completed' ? 'bg-zinc-100 text-zinc-800 border-zinc-200' :
                        'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-right">
                      <button
                        onClick={() => setSelectedReport(item)}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 rounded text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="h-3 w-3" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between pt-4 mt-2 text-xs text-zinc-500 font-medium">
          <div>Showing {filtered.length} of {reportsList.length} entries</div>
          <div className="flex items-center gap-1">
            <button disabled className="px-2.5 py-1 rounded border border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed font-bold">&lt;</button>
            <button className="px-2.5 py-1 rounded border border-zinc-300 bg-zinc-100 text-zinc-950 font-bold">1</button>
            <button disabled className="px-2.5 py-1 rounded border border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed font-bold">&gt;</button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                <Users className="h-4 w-4 text-zinc-900" />
                Meeting Details & Minutes
              </h3>
              <button onClick={() => setSelectedReport(null)} className="text-zinc-400 hover:text-zinc-950 font-bold text-sm">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="font-bold text-sm text-zinc-950">{selectedReport.topic}</div>
                <div className="text-zinc-600 font-semibold mt-1">Host: <span className="text-zinc-950 font-bold">{selectedReport.teacher}</span> | Audience: <span className="text-blue-700 font-bold">{selectedReport.audience}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-500 font-semibold block">Date & Time:</span>
                  <span className="font-bold text-zinc-950">{selectedReport.date} ({selectedReport.time})</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-500 font-semibold block">Duration:</span>
                  <span className="font-bold text-zinc-950">{selectedReport.duration} Minutes</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-500 font-semibold block">Meeting Code:</span>
                  <span className="font-mono font-bold text-zinc-950">{selectedReport.meetCode || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-500 font-semibold block">Conference Status:</span>
                  <span className="font-bold text-emerald-700">{selectedReport.status}</span>
                </div>
              </div>
              {selectedReport.roomUrl && (
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-500 font-semibold block">Google Meet URL:</span>
                  <a href={selectedReport.roomUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline font-mono font-bold break-all block mt-0.5">
                    {selectedReport.roomUrl}
                  </a>
                </div>
              )}
              {selectedReport.description && (
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-500 font-semibold block">Meeting Agenda & Minutes:</span>
                  <p className="text-zinc-800 font-medium mt-1">{selectedReport.description}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
              <a
                href={selectedReport.roomUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Video className="h-3.5 w-3.5" /> Join Conference Room
              </a>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-xs font-bold"
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