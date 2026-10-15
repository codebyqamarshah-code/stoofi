'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight, CalendarDays, CheckCircle2, Clock3, XCircle,
  FileText, TrendingUp, Users, ArrowRight
} from 'lucide-react';
import api from '@/services/api';

const DEMO_STATS = { total: 48, approved: 31, pending: 11, rejected: 6 };
const DEMO_BY_TYPE = [
  { name: 'Annual Leave', total: 18, approved: 14, pending: 3, rejected: 1 },
  { name: 'Sick Leave', total: 12, approved: 8, pending: 2, rejected: 2 },
  { name: 'Casual Leave', total: 10, approved: 6, pending: 3, rejected: 1 },
  { name: 'Maternity Leave', total: 5, approved: 2, pending: 2, rejected: 1 },
  { name: 'Emergency Leave', total: 3, approved: 1, pending: 1, rejected: 1 },
];
const DEMO_RECENT = [
  { id: 1, employee: 'Ayesha Tariq', type: 'Sick Leave', from: '2026-10-10', to: '2026-10-12', days: 3, status: 'approved' },
  { id: 2, employee: 'Bilal Hassan', type: 'Annual Leave', from: '2026-10-14', to: '2026-10-18', days: 5, status: 'pending' },
  { id: 3, employee: 'Sara Ahmed', type: 'Casual Leave', from: '2026-10-15', to: '2026-10-15', days: 1, status: 'approved' },
  { id: 4, employee: 'Umar Farooq', type: 'Emergency Leave', from: '2026-10-08', to: '2026-10-09', days: 2, status: 'rejected' },
  { id: 5, employee: 'Fatima Malik', type: 'Annual Leave', from: '2026-10-20', to: '2026-10-25', days: 6, status: 'pending' },
];

function StatusBadge({ status }) {
  const map = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || 'bg-zinc-100 text-zinc-600'}`}>
      {status}
    </span>
  );
}

function KpiCard({ label, value, icon: Icon, color, bg, link }) {
  return (
    <Link href={link || '#'} className={`${bg} rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-white/40`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium opacity-80 truncate">{label}</p>
        <p className="text-3xl font-extrabold mt-0.5">{value}</p>
      </div>
      <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

export default function LeaveDashboardPage() {
  const [stats, setStats] = useState(null);
  const [byType, setByType] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/leave');
        if (res.success && res.data?.length > 0) {
          const data = res.data;
          const total = data.length;
          const approved = data.filter(l => l.status === 'approved').length;
          const pending = data.filter(l => l.status === 'pending' || !l.status).length;
          const rejected = data.filter(l => l.status === 'rejected').length;
          setStats({ total, approved, pending, rejected });

          const typeMap = {};
          data.forEach(l => {
            const k = l.leaveTypeName || l.leaveTypeId || 'Unknown';
            if (!typeMap[k]) typeMap[k] = { name: k, total: 0, approved: 0, pending: 0, rejected: 0 };
            typeMap[k].total++;
            if (l.status === 'approved') typeMap[k].approved++;
            else if (l.status === 'rejected') typeMap[k].rejected++;
            else typeMap[k].pending++;
          });
          setByType(Object.values(typeMap));
          setRecent(data.slice(0, 5).map((l, i) => ({
            id: l._id || i,
            employee: l.employeeName || '-',
            type: l.leaveTypeName || '-',
            from: l.fromDate,
            to: l.toDate,
            days: l.days || 1,
            status: l.status || 'pending',
          })));
        } else {
          setStats(DEMO_STATS);
          setByType(DEMO_BY_TYPE);
          setRecent(DEMO_RECENT);
        }
      } catch {
        setStats(DEMO_STATS);
        setByType(DEMO_BY_TYPE);
        setRecent(DEMO_RECENT);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const s = stats || DEMO_STATS;
  const approvedPct = s.total > 0 ? Math.round((s.approved / s.total) * 100) : 0;
  const pendingPct = s.total > 0 ? Math.round((s.pending / s.total) * 100) : 0;
  const rejectedPct = s.total > 0 ? Math.round((s.rejected / s.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Leave Management</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Monitor and manage all leave requests across the institution</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-700 font-semibold">Leave Management</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Applied" value={s.total} icon={CalendarDays}
          color="text-[#084A86]" bg="bg-gradient-to-br from-blue-50 to-blue-100 text-[#084A86]"
          link="/dashboard/leave/apply" />
        <KpiCard label="Approved" value={s.approved} icon={CheckCircle2}
          color="text-emerald-700" bg="bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700"
          link="/dashboard/leave/approve" />
        <KpiCard label="Pending" value={s.pending} icon={Clock3}
          color="text-amber-700" bg="bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700"
          link="/dashboard/leave/pending" />
        <KpiCard label="Rejected" value={s.rejected} icon={XCircle}
          color="text-rose-700" bg="bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700"
          link="/dashboard/leave/approve" />
      </div>

      {/* Progress Summary */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#084A86]" /> Leave Status Overview
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-zinc-600 font-medium">Approved</span>
              <span className="font-bold text-emerald-700">{s.approved} ({approvedPct}%)</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-2.5">
              <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${approvedPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-zinc-600 font-medium">Pending</span>
              <span className="font-bold text-amber-600">{s.pending} ({pendingPct}%)</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-2.5">
              <div className="bg-amber-400 h-2.5 rounded-full transition-all" style={{ width: `${pendingPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-zinc-600 font-medium">Rejected</span>
              <span className="font-bold text-rose-600">{s.rejected} ({rejectedPct}%)</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-2.5">
              <div className="bg-rose-500 h-2.5 rounded-full transition-all" style={{ width: `${rejectedPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Summary by Leave Type */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#084A86]" /> Summary by Leave Type
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase font-bold border-b border-zinc-100">
              <tr>
                <th className="px-6 py-3 text-left">Leave Type</th>
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center">Approved</th>
                <th className="px-4 py-3 text-center">Pending</th>
                <th className="px-4 py-3 text-center">Rejected</th>
                <th className="px-6 py-3 text-left">Approval Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-400">Loading...</td></tr>
              ) : byType.map((t, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-zinc-800">{t.name}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-zinc-700">{t.total}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-emerald-700 font-semibold">{t.approved}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-amber-600 font-semibold">{t.pending}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-rose-600 font-semibold">{t.rejected}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-zinc-100 rounded-full h-2 min-w-[60px]">
                        <div className="bg-[#084A86] h-2 rounded-full" style={{ width: `${t.total > 0 ? Math.round((t.approved / t.total) * 100) : 0}%` }} />
                      </div>
                      <span className="text-xs font-bold text-zinc-600 w-8">
                        {t.total > 0 ? Math.round((t.approved / t.total) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#084A86]" /> Recent Leave Applications
          </h2>
          <Link href="/dashboard/leave/apply" className="text-xs text-[#084A86] hover:underline font-semibold">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase font-bold border-b border-zinc-100">
              <tr>
                <th className="px-6 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Leave Type</th>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">To</th>
                <th className="px-4 py-3 text-center">Days</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-400">Loading...</td></tr>
              ) : recent.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-zinc-800">{r.employee}</td>
                  <td className="px-4 py-3.5 text-zinc-600">{r.type}</td>
                  <td className="px-4 py-3.5 text-zinc-600">{r.from ? new Date(r.from).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3.5 text-zinc-600">{r.to ? new Date(r.to).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-zinc-700">{r.days}</td>
                  <td className="px-6 py-3.5"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Leave Types', href: '/dashboard/leave/type', icon: FileText },
          { label: 'Apply Leave', href: '/dashboard/leave/apply', icon: CalendarDays },
          { label: 'Approve', href: '/dashboard/leave/approve', icon: CheckCircle2 },
          { label: 'Pending', href: '/dashboard/leave/pending', icon: Clock3 },
          { label: 'Leave Policy', href: '/dashboard/leave/define', icon: TrendingUp },
          { label: 'All Staff', href: '/dashboard/staff', icon: Users },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}
            className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-[#084A86] hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#084A86]/10 flex items-center justify-center group-hover:bg-[#084A86] transition-colors">
              <Icon className="w-5 h-5 text-[#084A86] group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs font-semibold text-zinc-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
