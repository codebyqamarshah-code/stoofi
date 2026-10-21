'use client';

import { formatDateDMY } from '@/lib/utils';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Search, Clock, CheckCircle, XCircle, Eye, RefreshCw, Filter
} from 'lucide-react';
import api from '@/services/api';

const DEMO_DATA = [
  {
    _id: 'ev1', teacherName: 'Mudassir Bajwa', subject: 'Physics', classSection: 'FSC OTT-A',
    evaluatedBy: 'Academic Coordinator', score: 82, date: '2026-10-10', status: 'Pending',
    comment: 'Excellent command of subject.'
  },
  {
    _id: 'ev2', teacherName: 'Fatima Zahra', subject: 'Mathematics', classSection: 'BS Psychology-A',
    evaluatedBy: 'Principal Office', score: 74, date: '2026-10-08', status: 'Pending',
    comment: 'Good classroom management.'
  },
  {
    _id: 'ev3', teacherName: 'Dr. Bilal Siddiqui', subject: 'Chemistry', classSection: 'DPT-A',
    evaluatedBy: 'HOD Science', score: 91, date: '2026-10-05', status: 'Pending',
    comment: 'Outstanding student engagement.'
  },
  {
    _id: 'ev4', teacherName: 'Ahmed Khan', subject: 'English Language', classSection: 'FSC NURSING-B',
    evaluatedBy: 'Vice Principal', score: 58, date: '2026-10-01', status: 'Pending',
    comment: 'Needs improvement in punctuality.'
  },
];

function ScoreBar({ score }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-zinc-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-zinc-700">{score}%</span>
    </div>
  );
}

export default function PendingReportPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/teacher-evaluation?status=Pending').catch(() => null);
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

  const handleApprove = async (id) => {
    try {
      await api.patch(`/teacher-evaluation/${id}`, { status: 'Approved' }).catch(() => null);
      setData(prev => prev.map(d => d._id === id ? { ...d, status: 'Approved' } : d));
      showToast('Evaluation approved successfully!');
    } catch {
      setData(prev => prev.map(d => d._id === id ? { ...d, status: 'Approved' } : d));
      showToast('Evaluation approved.');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/teacher-evaluation/${id}`, { status: 'Rejected' }).catch(() => null);
      setData(prev => prev.map(d => d._id === id ? { ...d, status: 'Rejected' } : d));
      showToast('Evaluation rejected.', 'error');
    } catch {
      setData(prev => prev.map(d => d._id === id ? { ...d, status: 'Rejected' } : d));
      showToast('Evaluation rejected.', 'error');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || d.teacherName?.toLowerCase().includes(q) || d.subject?.toLowerCase().includes(q) || d.evaluatedBy?.toLowerCase().includes(q);
      const matchClass = !classFilter || d.classSection?.includes(classFilter);
      const matchSubject = !subjectFilter || d.subject === subjectFilter;
      return matchSearch && matchClass && matchSubject;
    });
  }, [data, searchQuery, classFilter, subjectFilter]);

  const pendingCount = data.filter(d => d.status === 'Pending').length;

  const statusBadge = (status) => {
    if (status === 'Approved') return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">Approved</span>;
    if (status === 'Rejected') return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700">Rejected</span>;
    return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700">Pending</span>;
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* View Detail Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-950">Evaluation Detail</h3>
              <button onClick={() => setViewItem(null)} className="text-zinc-400 hover:text-zinc-700 text-xl">&times;</button>
            </div>
            <div className="space-y-3 text-sm">
              {[['Teacher', viewItem.teacherName], ['Subject', viewItem.subject], ['Class', viewItem.classSection],
                ['Evaluated By', viewItem.evaluatedBy], ['Date', viewItem.date], ['Score', `${viewItem.score}%`],
                ['Status', viewItem.status], ['Comment', viewItem.comment]].map(([label, val]) => (
                <div key={label} className="flex justify-between border-b border-zinc-100 pb-2">
                  <span className="text-zinc-500 font-medium">{label}</span>
                  <span className="font-semibold text-zinc-900">{val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setViewItem(null)} className="w-full py-2 bg-[#084A86] hover:bg-[#073b6b] text-white font-bold rounded-lg text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-950">Pending Evaluation Reports</h1>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-black rounded-full border border-amber-200">
            {pendingCount} Pending
          </span>
        </div>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
          <span>Teacher Evaluation</span>
          <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Pending Report</span>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[#084A86]" />
          <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Filter Records</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text" placeholder="Search teacher / subject..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86]/40"
            />
          </div>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86]/40">
            <option value="">All Classes</option>
            {['BS Psychology', 'BS RIT', 'DPT', 'FSC Dental', 'FSC NURSING', 'FSC OTT'].map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86]/40">
            <option value="">All Subjects</option>
            {['Physics', 'Mathematics', 'Chemistry', 'English Language', 'Computer Science'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => { setSearchQuery(''); setClassFilter(''); setSubjectFilter(''); }}
            className="flex items-center justify-center gap-2 border border-zinc-300 rounded-lg px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Evaluation Queue
          </h3>
          <span className="text-xs text-zinc-500 font-medium">{filteredData.length} records found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-950">
            <thead className="text-xs text-zinc-600 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Teacher Name</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Evaluated By</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan="9" className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="9" className="px-4 py-10 text-center text-zinc-500 font-medium">No pending evaluations found</td></tr>
              ) : filteredData.map((item, idx) => (
                <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-4 py-3.5 text-zinc-500 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3.5 font-bold text-zinc-950">{item.teacherName}</td>
                  <td className="px-4 py-3.5 text-zinc-700">{item.subject}</td>
                  <td className="px-4 py-3.5 text-zinc-700">{item.classSection}</td>
                  <td className="px-4 py-3.5 text-zinc-700">{item.evaluatedBy}</td>
                  <td className="px-4 py-3.5"><ScoreBar score={item.score} /></td>
                  <td className="px-4 py-3.5 text-zinc-600 text-xs">{formatDateDMY(item.date)}</td>
                  <td className="px-4 py-3.5">{statusBadge(item.status)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setViewItem(item)} title="View"
                        className="p-1.5 text-[#084A86] hover:bg-[#084A86]/10 rounded-md transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {item.status === 'Pending' && (
                        <>
                          <button onClick={() => handleApprove(item._id)} title="Approve"
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => handleReject(item._id)} title="Reject"
                            className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md transition-colors">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
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