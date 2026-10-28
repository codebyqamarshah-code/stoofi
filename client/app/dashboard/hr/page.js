'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, UserCheck, UserX, Building2, ChevronRight,
  TrendingUp, ArrowUpRight, Clock, Plus, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const DEMO_STATS = { totalStaff: 48, presentToday: 41, onLeave: 4, totalDepartments: 6 };

const DEMO_STAFF = [
  { id: 1, name: 'Dr. Amina Khalid', designation: 'Principal', department: 'Administration', joinDate: '2021-03-15', status: 'Active' },
  { id: 2, name: 'Mr. Tariq Mahmood', designation: 'Teacher', department: 'Science', joinDate: '2022-06-01', status: 'Active' },
  { id: 3, name: 'Ms. Sana Iqbal', designation: 'Accountant', department: 'Finance', joinDate: '2023-01-10', status: 'Active' },
  { id: 4, name: 'Mr. Ali Hassan', designation: 'Admin Officer', department: 'Administration', joinDate: '2023-07-20', status: 'Active' },
  { id: 5, name: 'Ms. Rabia Noor', designation: 'Teacher', department: 'IT', joinDate: '2024-02-14', status: 'Inactive' },
];

export default function HRDashboardPage() {
  const [stats, setStats] = useState({ totalStaff: 0, presentToday: 0, onLeave: 0, totalDepartments: 0 });
  const [recentStaff, setRecentStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, staffRes] = await Promise.allSettled([
          api.get('/hr/stats'),
          api.get('/staff?limit=5&sort=newest'),
        ]);
        if (statsRes.status === 'fulfilled') {
          const sData = statsRes.value?.data?.data || statsRes.value?.data;
          if (sData && typeof sData === 'object') {
            setStats({
              totalStaff: sData.totalStaff ?? sData.total ?? 0,
              presentToday: sData.presentToday ?? 0,
              onLeave: sData.onLeave ?? 0,
              totalDepartments: sData.totalDepartments ?? 0
            });
          }
        }
        if (staffRes.status === 'fulfilled') {
          const list = staffRes.value?.data?.data || (Array.isArray(staffRes.value?.data) ? staffRes.value.data : []);
          if (Array.isArray(list)) {
            setRecentStaff(list);
            setStats(prev => ({
              ...prev,
              totalStaff: prev.totalStaff || list.length
            }));
          }
        }
      } catch (_) {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const kpis = [
    {
      label: 'Total Staff',
      value: stats.totalStaff,
      icon: Users,
      color: 'bg-[#084A86]',
      light: 'bg-blue-50',
      text: 'text-[#084A86]',
      change: '+3 this month',
      href: '/dashboard/hr/staff-directory',
    },
    {
      label: 'Present Today',
      value: stats.presentToday,
      icon: UserCheck,
      color: 'bg-emerald-600',
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      change: `${Math.round((stats.presentToday / stats.totalStaff) * 100)}% attendance rate`,
      href: '/dashboard/hr/staff-attendance',
    },
    {
      label: 'On Leave',
      value: stats.onLeave,
      icon: UserX,
      color: 'bg-amber-500',
      light: 'bg-amber-50',
      text: 'text-amber-600',
      change: 'Approved leaves',
      href: '/dashboard/hr/staff-attendance',
    },
    {
      label: 'Departments',
      value: stats.totalDepartments,
      icon: Building2,
      color: 'bg-violet-600',
      light: 'bg-violet-50',
      text: 'text-violet-600',
      change: 'Active departments',
      href: '/dashboard/hr/department',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">HR Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Human Resources management overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-zinc-950 font-semibold">HR</span>
          </div>
          <Link href="/dashboard/hr/add-staff">
            <Button className="bg-[#084A86] hover:bg-[#073b6b] text-white text-sm gap-2">
              <Plus className="h-4 w-4" /> Add Staff
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} href={kpi.href}>
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg ${kpi.light}`}>
                    <Icon className={`h-5 w-5 ${kpi.text}`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-zinc-500">{kpi.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${kpi.text}`}>
                    {loading ? <span className="animate-pulse bg-zinc-200 rounded w-12 h-8 inline-block" /> : kpi.value}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {kpi.change}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Department', href: '/dashboard/hr/department', icon: Building2 },
          { label: 'Designation', href: '/dashboard/hr/designation', icon: UserCheck },
          { label: 'Attendance', href: '/dashboard/hr/staff-attendance', icon: Clock },
          { label: 'Staff Directory', href: '/dashboard/hr/staff-directory', icon: Users },
        ].map(link => {
          const Icon = link.icon;
          return (
            <Link key={link.label} href={link.href}>
              <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-center gap-3 hover:border-[#084A86] hover:bg-blue-50 transition-all group">
                <Icon className="h-5 w-5 text-zinc-400 group-hover:text-[#084A86]" />
                <span className="text-sm font-medium text-zinc-700 group-hover:text-[#084A86]">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Staff Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950">Recent Staff Members</h2>
          <Link href="/dashboard/hr/staff-directory">
            <Button variant="outline" size="sm" className="text-xs gap-1 border-zinc-300 text-zinc-600 hover:border-[#084A86] hover:text-[#084A86]">
              <Eye className="h-3.5 w-3.5" /> View All
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                {['#', 'Name', 'Designation', 'Department', 'Join Date', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {recentStaff.map((s, idx) => (
                <tr key={s.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-5 py-3.5 text-zinc-400 text-xs">{idx + 1}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#084A86] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-zinc-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">{s.designation}</td>
                  <td className="px-5 py-3.5 text-zinc-600">{s.department}</td>
                  <td className="px-5 py-3.5 text-zinc-500 text-xs">{s.joinDate}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {s.status}
                    </span>
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
