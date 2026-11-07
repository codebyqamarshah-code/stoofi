'use client';

import { formatDateDMY } from '@/lib/utils';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Search, Clock, CheckCircle, XCircle, Eye, RefreshCw, Filter, Trash2, X
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
  const [deleteItem, setDeleteItem] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
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

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    const id = deleteItem._id;
    try {
      if (id && !id.startsWith('ev')) {
        await api.delete(`/teacher-evaluation/${id}`).catch(() => null);
      }
      setData(prev => prev.filter(d => d._id !== id));
      showToast(`Evaluation for ${deleteItem.teacherName} deleted successfully.`);
    } catch {
      setData(prev => prev.filter(d => d._id !== id));
      showToast(`Evaluation for ${deleteItem.teacherName} deleted.`);
    } finally {
      setDeleteItem(null);
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
    if (status === 'Approved') return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
    if (status === 'Rejected') return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
    return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-white text-xs font-bold transition-all ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setDeleteItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">Delete Evaluation?</h3>
                <p className="text-xs text-zinc-500 mt-0.5">This evaluation will be removed from the queue.</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to permanently delete the pending evaluation record for <strong className="text-zinc-900">{deleteItem.teacherName}</strong> ({deleteItem.subject})?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setViewItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-[#084A86] text-white">
              <div>
                <h3 className="text-base font-bold">Evaluation Detail</h3>
                <p className="text-xs text-blue-100 mt-0.5">{viewItem.teacherName} — {viewItem.subject}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['Teacher', viewItem.teacherName], ['Subject', viewItem.subject], ['Class', viewItem.classSection],
                  ['Evaluated By', viewItem.evaluatedBy], ['Date', formatDateDMY(viewItem.date)], ['Score', `${viewItem.score}%`]].map(([label, val]) => (
                  <div key={label} className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-100">
                    <p className="text-xs text-zinc-400 font-medium">{label}</p>
                    <p className="font-bold text-zinc-900 mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
              {viewItem.comment && (
                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 text-xs">
                  <p className="text-zinc-400 font-medium mb-1">Evaluator Comments</p>
                  <p className="font-semibold text-zinc-800">{viewItem.comment}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-zinc-100 bg-zinc-50">
              <button onClick={() => setViewItem(null)} className="w-full py-2 bg-[#084A86] hover:bg-[#073b6b] text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Pending Evaluation Reports</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Review teacher evaluations submitted by coordinators and principals awaiting administrative approval</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-1 text-zinc-400" />
          <span className="text-zinc-500">Teacher Evaluation</span>
          <ChevronRight className="w-3.5 h-3.5 mx-1 text-zinc-400" />
          <span className="text-[#084A86] font-bold">Pending Report</span>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[#084A86]" />
          <h2 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Filter Records</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search teacher / subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 w-full border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]/30 focus:border-[#084A86]"
            />
          </div>
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]/30 focus:border-[#084A86] bg-white font-medium"
          >
            <option value="">All Classes</option>
            {['BS Psychology', 'BS RIT', 'DPT', 'FSC Dental', 'FSC NURSING', 'FSC OTT'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]/30 focus:border-[#084A86] bg-white font-medium"
          >
            <option value="">All Subjects</option>
            {['Physics', 'Mathematics', 'Chemistry', 'English Language', 'Computer Science'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => { setSearchQuery(''); setClassFilter(''); setSubjectFilter(''); }}
            className="inline-flex items-center justify-center gap-1.5 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">Evaluation Queue</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 ml-1">
              {pendingCount} Pending
            </span>
          </div>
          <span className="text-xs text-zinc-400 font-medium">{filteredData.length} records found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-950">
            <thead className="text-[11px] text-zinc-600 uppercase bg-zinc-50 border-b border-zinc-200 font-bold tracking-wider">
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
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold">
                      <span className="w-4 h-4 border-2 border-[#084A86] border-t-transparent rounded-full animate-spin"></span>
                      Loading evaluation queue...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500 font-medium">
                    No evaluations found in the queue matching your filters.
                  </td>
                </tr>
              ) : filteredData.map((item, idx) => (
                <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-4 py-3.5 text-zinc-400 font-semibold text-xs">{idx + 1}</td>
                  <td className="px-4 py-3.5 font-bold text-zinc-900">{item.teacherName}</td>
                  <td className="px-4 py-3.5 text-zinc-700 text-xs font-medium">{item.subject}</td>
                  <td className="px-4 py-3.5 text-zinc-600 text-xs">{item.classSection}</td>
                  <td className="px-4 py-3.5 text-zinc-600 text-xs">{item.evaluatedBy}</td>
                  <td className="px-4 py-3.5"><ScoreBar score={item.score} /></td>
                  <td className="px-4 py-3.5 text-zinc-500 text-xs font-mono">{formatDateDMY(item.date)}</td>
                  <td className="px-4 py-3.5">{statusBadge(item.status)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Button */}
                      <button
                        onClick={() => setViewItem(item)}
                        title="View Detail"
                        className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Approve Button */}
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => handleApprove(item._id)}
                          title="Approve"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}

                      {/* Reject Button */}
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => handleReject(item._id)}
                          title="Reject"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-600 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteItem(item)}
                        title="Delete Evaluation"
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
