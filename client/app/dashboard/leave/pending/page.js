'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Clock, Check, X, User, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

const DEMO_PENDING = [
  { _id: 'p1', staffName: 'Ayesha Tariq', department: 'Academics', role: 'Teacher', leaveType: 'Sick Leave', fromDate: '2026-10-18', toDate: '2026-10-20', days: 3, reason: 'High fever and doctor-advised rest', appliedDate: '2026-10-16' },
  { _id: 'p2', staffName: 'Bilal Hassan', department: 'Administration', role: 'Admin Officer', leaveType: 'Annual Leave', fromDate: '2026-10-22', toDate: '2026-10-27', days: 6, reason: 'Family wedding event in hometown', appliedDate: '2026-10-15' },
  { _id: 'p3', staffName: 'Fatima Malik', department: 'Languages', role: 'Teacher', leaveType: 'Maternity Leave', fromDate: '2026-11-01', toDate: '2027-01-30', days: 90, reason: 'Doctor prescribed maternity leave', appliedDate: '2026-10-14' },
  { _id: 'p4', staffName: 'Hamza Rashid', department: 'Finance', role: 'Accountant', leaveType: 'Casual Leave', fromDate: '2026-10-25', toDate: '2026-10-26', days: 2, reason: 'Urgent domestic property documentation', appliedDate: '2026-10-15' },
];

export default function PendingLeavePage() {
  const [records, setRecords] = useState(DEMO_PENDING);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leave').catch(() => null);
      if (res?.success && Array.isArray(res.data)) {
        const pending = res.data.filter(r => (r.status || 'pending').toLowerCase() === 'pending');
        if (pending.length > 0) setRecords(pending);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, newStatus) => {
    try {
      await api.put(`/leave/${id}`, { status: newStatus }).catch(() => null);
      setRecords(prev => prev.filter(r => r._id !== id));
      setFeedbackMsg(`Application #${id.slice(-4)} has been ${newStatus.toUpperCase()}!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = records.filter(r => {
    const name = r.staffName || (r.staffId?.firstName ? `${r.staffId.firstName} ${r.staffId.lastName || ''}` : '') || 'Staff';
    return name.toLowerCase().includes(search.toLowerCase()) ||
      (r.leaveType || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.department || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.reason || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Clock className="h-6 w-6 text-amber-500" />
            Pending Leave Requests
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Applications awaiting administrative approval or action</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/leave" className="hover:text-zinc-600 transition-colors">Leave</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Pending Requests</span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-950">Awaiting Decision</h2>
            <span className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
              {filtered.length} Pending
            </span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search applicant or department..." 
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
                <th className="px-4 py-3">Applicant Name</th>
                <th className="px-4 py-3">Department & Role</th>
                <th className="px-4 py-3">Leave Category</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3 text-center">Days</th>
                <th className="px-4 py-3">Stated Reason</th>
                <th className="px-4 py-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-500">Checking pending requests...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                      <Check className="h-8 w-8 text-emerald-500" />
                      <span className="text-sm font-semibold text-zinc-700">All caught up!</span>
                      <span className="text-xs text-zinc-500">There are no pending leave requests awaiting approval at this moment.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const staffName = item.staffName || (item.staffId?.firstName ? `${item.staffId.firstName} ${item.staffId.lastName || ''}` : '') || 'Staff';
                  return (
                    <tr key={item._id || idx} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-4 py-3.5 text-zinc-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-zinc-950">{staffName}</td>
                      <td className="px-4 py-3.5 text-xs text-zinc-600">
                        <div>{item.department || 'Academics'}</div>
                        <div className="text-zinc-400 font-mono text-[11px]">{item.role || 'Staff'}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-xs text-[#084A86] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                          {item.leaveType || item.leaveTypeId?.name || 'General Leave'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-zinc-700 font-medium whitespace-nowrap">
                        {item.fromDate ? new Date(item.fromDate).toLocaleDateString() : '-'} to {item.toDate ? new Date(item.toDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center font-extrabold text-zinc-900 text-xs">
                        {item.days || 1}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-zinc-600 max-w-[200px] truncate" title={item.reason}>
                        {item.reason}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            onClick={() => handleAction(item._id, 'approved')}
                            size="sm"
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 shadow-xs"
                          >
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleAction(item._id, 'rejected')}
                            size="sm"
                            className="h-8 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 shadow-xs"
                          >
                            Reject
                          </Button>
                        </div>
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
