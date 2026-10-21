'use client';

import { Input } from '@/components/ui/input';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Search, Download, Eye, RefreshCw, Filter, X, CheckCircle2
} from 'lucide-react';
import api from '@/services/api';

const DEMO_DATA = [
  {
    _id: 'ap1', teacherName: 'Mudassir Bajwa', subject: 'Physics', classSection: 'FSC OTT-A',
    evaluatedBy: 'Academic Coordinator', score: 88, date: '2026-09-28', approvedOn: '2026-10-01',
    criteria: [
      { name: 'Communication Skills', score: 9, max: 10 },
      { name: 'Subject Knowledge', score: 9, max: 10 },
      { name: 'Classroom Management', score: 8, max: 10 },
      { name: 'Punctuality & Attendance', score: 9, max: 10 },
      { name: 'Student Engagement', score: 8, max: 10 },
    ]
  },
  {
    _id: 'ap2', teacherName: 'Fatima Zahra', subject: 'Mathematics', classSection: 'Class 9-B',
    evaluatedBy: 'Principal Office', score: 72, date: '2026-09-25', approvedOn: '2026-09-30',
    criteria: [
      { name: 'Communication Skills', score: 7, max: 10 },
      { name: 'Subject Knowledge', score: 8, max: 10 },
      { name: 'Classroom Management', score: 7, max: 10 },
      { name: 'Punctuality & Attendance', score: 7, max: 10 },
      { name: 'Student Engagement', score: 7, max: 10 },
    ]
  },
  {
    _id: 'ap3', teacherName: 'Dr. Bilal Siddiqui', subject: 'Chemistry', classSection: 'Class 11-A',
    evaluatedBy: 'HOD Science', score: 95, date: '2026-09-20', approvedOn: '2026-09-22',
    criteria: [
      { name: 'Communication Skills', score: 10, max: 10 },
      { name: 'Subject Knowledge', score: 10, max: 10 },
      { name: 'Classroom Management', score: 9, max: 10 },
      { name: 'Punctuality & Attendance', score: 9, max: 10 },
      { name: 'Student Engagement', score: 10, max: 10 },
    ]
  },
  {
    _id: 'ap4', teacherName: 'Ahmed Khan', subject: 'English Language', classSection: 'Class 8-C',
    evaluatedBy: 'Vice Principal', score: 55, date: '2026-09-15', approvedOn: '2026-09-18',
    criteria: [
      { name: 'Communication Skills', score: 5, max: 10 },
      { name: 'Subject Knowledge', score: 6, max: 10 },
      { name: 'Classroom Management', score: 5, max: 10 },
      { name: 'Punctuality & Attendance', score: 6, max: 10 },
      { name: 'Student Engagement', score: 5, max: 10 },
    ]
  },
];

function ScoreBadge({ score }) {
  if (score >= 80) return <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">{score}% Excellent</span>;
  if (score >= 60) return <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-amber-100 text-amber-700 border border-amber-200">{score}% Good</span>;
  return <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-rose-100 text-rose-700 border border-rose-200">{score}% Needs Work</span>;
}

export default function ApprovedReportPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/teacher-evaluation?status=Approved').catch(() => null);
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setData(res.data);
        } else {
          setData(DEMO_DATA);
        }
      } catch {
        setData(DEMO_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || d.teacherName?.toLowerCase().includes(q) || d.subject?.toLowerCase().includes(q);
      const matchTeacher = !teacherFilter || d.teacherName === teacherFilter;
      const matchFrom = !dateFrom || d.date >= dateFrom;
      const matchTo = !dateTo || d.date <= dateTo;
      return matchSearch && matchTeacher && matchFrom && matchTo;
    });
  }, [data, searchQuery, teacherFilter, dateFrom, dateTo]);

  const handleExportCSV = () => {
    const headers = ['Teacher Name', 'Subject', 'Class', 'Evaluated By', 'Score', 'Date', 'Approved On'];
    const rows = filteredData.map(d => [d.teacherName, d.subject, d.classSection, d.evaluatedBy, `${d.score}%`, d.date, d.approvedOn]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'approved_evaluations.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueTeachers = [...new Set(data.map(d => d.teacherName))];

  return (
    <div className="space-y-6">
      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50">
              <div>
                <h3 className="text-base font-bold text-zinc-950">Evaluation Detail</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{viewItem.teacherName} — {viewItem.subject}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-1.5 hover:bg-zinc-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['Teacher', viewItem.teacherName], ['Subject', viewItem.subject], ['Class', viewItem.classSection],
                  ['Evaluated By', viewItem.evaluatedBy], ['Date', viewItem.date], ['Approved On', viewItem.approvedOn]].map(([l, v]) => (
                  <div key={l} className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-100">
                    <p className="text-xs text-zinc-400 font-medium">{l}</p>
                    <p className="font-bold text-zinc-900 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-3">Criteria Breakdown</p>
                <div className="space-y-2">
                  {(viewItem.criteria || []).map(c => (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="text-xs text-zinc-600 w-40 shrink-0">{c.name}</span>
                      <div className="flex-1 bg-zinc-200 rounded-full h-2">
                        <div className="bg-[#084A86] h-2 rounded-full" style={{ width: `${(c.score / c.max) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-zinc-700 w-12 text-right">{c.score}/{c.max}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <span className="text-sm font-bold text-zinc-700">Overall Score</span>
                <ScoreBadge score={viewItem.score} />
              </div>
            </div>
            <div className="p-4 border-t border-zinc-100 bg-zinc-50">
              <button onClick={() => setViewItem(null)} className="w-full py-2 bg-[#084A86] hover:bg-[#073b6b] text-white font-bold rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-950">Approved Evaluation Reports</h1>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-black rounded-full border border-emerald-200">
            <CheckCircle2 className="inline w-3.5 h-3.5 mr-1" />{data.filter(d => d.score >= 80).length} High Performers
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <div className="flex items-center text-sm text-zinc-500 font-medium">
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
            <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
            <span>Teacher Evaluation</span>
            <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
            <span className="text-zinc-900 font-semibold">Approved Report</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[#084A86]" />
          <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Filter Records</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input type="text" placeholder="Search teacher / subject..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86]/40" />
          </div>
          <select value={teacherFilter} onChange={e => setTeacherFilter(e.target.value)}
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86]/40">
            <option value="">All Teachers</option>
            {uniqueTeachers.map(t => <option key={t}>{t}</option>)}
          </select>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From Date"
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86]/40" />
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To Date"
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86]/40" />
        </div>
        {(searchQuery || teacherFilter || dateFrom || dateTo) && (
          <div className="mt-3 flex">
            <button onClick={() => { setSearchQuery(''); setTeacherFilter(''); setDateFrom(''); setDateTo(''); }}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 font-semibold">
              <RefreshCw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
          <span className="text-sm font-bold text-zinc-700 uppercase tracking-wide">Approved Evaluations</span>
          <span className="text-xs text-zinc-500">{filteredData.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-950">
            <thead className="text-xs text-zinc-600 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Evaluated By</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Approved On</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-10 text-center text-zinc-500 font-medium">No approved evaluations found</td></tr>
              ) : filteredData.map((item, idx) => (
                <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-4 py-3.5 text-zinc-500 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3.5 font-bold text-zinc-950">{item.teacherName}</td>
                  <td className="px-4 py-3.5 text-zinc-700">{item.subject}</td>
                  <td className="px-4 py-3.5"><ScoreBadge score={item.score} /></td>
                  <td className="px-4 py-3.5 text-zinc-700">{item.evaluatedBy}</td>
                  <td className="px-4 py-3.5 text-zinc-600 text-xs">{formatDateDMY(item.date)}</td>
                  <td className="px-4 py-3.5 text-zinc-600 text-xs">{item.approvedOn}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button onClick={() => setViewItem(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#084A86] hover:bg-[#073b6b] text-white text-xs font-bold rounded-lg transition-colors ml-auto">
                      <Eye className="w-3.5 h-3.5" /> View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}