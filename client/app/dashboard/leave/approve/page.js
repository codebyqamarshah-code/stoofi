'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Search, CheckCircle2, XCircle, Clock, CalendarDays, 
  User, Check, Filter, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

const DEMO_LEAVES = [
  { _id: 'l1', staffName: 'Ayesha Tariq', department: 'Academics', leaveType: 'Sick Leave', fromDate: '2026-10-18', toDate: '2026-10-20', days: 3, reason: 'High fever and doctor-advised rest', status: 'pending', appliedDate: '2026-10-16' },
  { _id: 'l2', staffName: 'Bilal Hassan', department: 'Administration', leaveType: 'Annual Leave', fromDate: '2026-10-22', toDate: '2026-10-27', days: 6, reason: 'Family wedding event in hometown', status: 'pending', appliedDate: '2026-10-15' },
  { _id: 'l3', staffName: 'Sara Ahmed', department: 'Science', leaveType: 'Casual Leave', fromDate: '2026-10-14', toDate: '2026-10-14', days: 1, reason: 'Bank work and personal errand', status: 'approved', appliedDate: '2026-10-12' },
  { _id: 'l4', staffName: 'Muhammad Usman', department: 'IT Department', leaveType: 'Casual Leave', fromDate: '2026-10-10', toDate: '2026-10-11', days: 2, reason: 'Urgent home maintenance', status: 'rejected', appliedDate: '2026-10-08' },
  { _id: 'l5', staffName: 'Fatima Malik', department: 'Languages', leaveType: 'Maternity Leave', fromDate: '2026-11-01', toDate: '2027-01-30', days: 90, reason: 'Doctor prescribed maternity leave', status: 'pending', appliedDate: '2026-10-14' },
];

export default function ApproveLeavePage() {
  const [records, setRecords] = useState(DEMO_LEAVES);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leave').catch(() => null);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setRecords(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/leave/${id}`, { status }).catch(() => null);
      setRecords(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      setActionMsg(`Leave request has been marked as ${status.toUpperCase()}!`);
      setTimeout(() => setActionMsg(''), 4000);
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = records.filter(r => {
    const name = r.staffName || (r.staffId?.firstName ? `${r.staffId.firstName} ${r.staffId.lastName || ''}` : '') || 'Staff';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      (r.leaveType || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.reason || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (r.status || 'pending').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: records.length,
    pending: records.filter(r => (r.status || 'pending').toLowerCase() === 'pending').length,
    approved: records.filter(r => (r.status || '').toLowerCase() === 'approved').length,
    rejected: records.filter(r => (r.status || '').toLowerCase() === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-[#084A86]" />
            Approve Leave Requests
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Review, authorize or reject employee leave applications</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/leave" className="hover:text-zinc-600 transition-colors">Leave</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Approve Leave</span>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* KPI filter chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { id: 'all', label: 'All Requests', count: counts.all, color: 'text-zinc-900', border: 'border-zinc-200' },
          { id: 'pending', label: 'Pending Action', count: counts.pending, color: 'text-amber-600', border: 'border-amber-200' },
          { id: 'approved', label: 'Approved', count: counts.approved, color: 'text-emerald-600', border: 'border-emerald-200' },
          { id: 'rejected', label: 'Rejected', count: counts.rejected, color: 'text-rose-600', border: 'border-rose-200' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setStatusFilter(item.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              statusFilter === item.id 
                ? 'bg-blue-50/70 border-[#084A86] ring-2 ring-[#084A86]/20 shadow-xs' 
                : 'bg-white hover:bg-zinc-50 ' + item.border
            }`}
          >
            <div className="text-xs font-bold text-zinc-500 uppercase">{item.label}</div>
            <div className={`text-2xl font-extrabold mt-1 ${item.color}`}>{item.count}</div>
          </button>
        ))}
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-950">Application Ledger</h2>
            <span className="text-xs bg-zinc-200/70 text-zinc-700 px-2.5 py-0.5 rounded-full font-bold">
              {filtered.length} entries
            </span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search staff, leave type, reason..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-[#084A86]" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-100/70 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Date Duration</th>
                <th className="px-4 py-3 text-center">Days</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Authorize Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-500">Loading leave requests...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-10 text-center text-zinc-500 font-medium">No leave applications match the selected status or search query.</td></tr>
              ) : (
                filtered.map((item, idx) => {
                  const staffName = item.staffName || (item.staffId?.firstName ? `${item.staffId.firstName} ${item.staffId.lastName || ''}` : '') || 'Staff';
                  const status = (item.status || 'pending').toLowerCase();
                  return (
                    <tr key={item._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3 text-zinc-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-zinc-950 text-sm">{staffName}</div>
                        <div className="text-xs text-zinc-500">{item.department || 'Staff Member'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-zinc-800 text-xs bg-zinc-100 px-2 py-1 rounded">
                          {item.leaveType || item.leaveTypeId?.name || 'General Leave'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-700 font-medium whitespace-nowrap">
                        {item.fromDate ? new Date(item.fromDate).toLocaleDateString() : '-'} to {item.toDate ? new Date(item.toDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-zinc-900 text-xs">
                        {item.days || 1}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 max-w-[200px] truncate" title={item.reason}>
                        {item.reason || 'No detailed reason provided'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {status === 'pending' ? (
                          <div className="flex justify-end gap-1.5">
                            <Button 
                              onClick={() => handleUpdateStatus(item._id, 'approved')} 
                              size="sm" 
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 shadow-xs"
                            >
                              Approve
                            </Button>
                            <Button 
                              onClick={() => handleUpdateStatus(item._id, 'rejected')} 
                              size="sm" 
                              className="h-8 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 shadow-xs"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Decision Recorded</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
