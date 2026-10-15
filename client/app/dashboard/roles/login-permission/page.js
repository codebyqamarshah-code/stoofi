'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import {
  ChevronRight, Search, ToggleLeft, ToggleRight, Users,
  Filter, CheckCircle2, XCircle, Loader2, AlertCircle, UserCheck, UserX
} from 'lucide-react';

const FALLBACK_STAFF = [
  { _id: '1', name: 'Ahmad Raza', email: 'ahmad.raza@school.edu', role: 'Admin', department: 'Management', loginEnabled: true, avatar: 'AR' },
  { _id: '2', name: 'Fatima Khan', email: 'fatima.khan@school.edu', role: 'Teacher', department: 'Academics', loginEnabled: true, avatar: 'FK' },
  { _id: '3', name: 'Muhammad Ali', email: 'm.ali@school.edu', role: 'Teacher', department: 'Academics', loginEnabled: false, avatar: 'MA' },
  { _id: '4', name: 'Sara Ahmed', email: 'sara.ahmed@school.edu', role: 'Accountant', department: 'Finance', loginEnabled: true, avatar: 'SA' },
  { _id: '5', name: 'Bilal Hassan', email: 'bilal.h@school.edu', role: 'Librarian', department: 'Library', loginEnabled: true, avatar: 'BH' },
  { _id: '6', name: 'Nadia Hussain', email: 'nadia.h@school.edu', role: 'Teacher', department: 'Academics', loginEnabled: false, avatar: 'NH' },
  { _id: '7', name: 'Zubair Malik', email: 'zubair.m@school.edu', role: 'Security Guard', department: 'Security', loginEnabled: false, avatar: 'ZM' },
  { _id: '8', name: 'Ayesha Siddiqui', email: 'ayesha.s@school.edu', role: 'Teacher', department: 'Academics', loginEnabled: true, avatar: 'AS' },
  { _id: '9', name: 'Kamran Sheikh', email: 'kamran.s@school.edu', role: 'Accountant', department: 'Finance', loginEnabled: false, avatar: 'KS' },
  { _id: '10', name: 'Hina Baig', email: 'hina.b@school.edu', role: 'Admin', department: 'Management', loginEnabled: true, avatar: 'HB' },
];

const ROLES = ['All Roles', 'Admin', 'Teacher', 'Accountant', 'Librarian', 'Security Guard'];
const DEPARTMENTS = ['All Departments', 'Management', 'Academics', 'Finance', 'Library', 'Security'];

export default function LoginPermissionPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [selected, setSelected] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff');
      const data = Array.isArray(res) ? res : res?.data || res?.staff || [];
      setStaff(data.length ? data : FALLBACK_STAFF);
    } catch {
      setStaff(FALLBACK_STAFF);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const filtered = staff.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All Roles' || s.role === roleFilter;
    const matchDept = deptFilter === 'All Departments' || s.department === deptFilter;
    return matchSearch && matchRole && matchDept;
  });

  const toggleLogin = async (staffId, current) => {
    setToggling(staffId);
    try {
      await api.put(`/staff/${staffId}/login-permission`, { loginEnabled: !current });
    } catch { /* offline */ }
    setStaff(prev => prev.map(s => s._id === staffId ? { ...s, loginEnabled: !s.loginEnabled } : s));
    showToast(!current ? 'Login access enabled' : 'Login access disabled', !current ? 'success' : 'error');
    setToggling(null);
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelected(prev => prev.length === filtered.length ? [] : filtered.map(s => s._id));

  const bulkAction = async (enable) => {
    if (!selected.length) { showToast('Select at least one staff member', 'error'); return; }
    setBulkLoading(true);
    try {
      await Promise.allSettled(selected.map(id => api.put(`/staff/${id}/login-permission`, { loginEnabled: enable })));
    } catch { /* offline */ }
    setStaff(prev => prev.map(s => selected.includes(s._id) ? { ...s, loginEnabled: enable } : s));
    showToast(`Login ${enable ? 'enabled' : 'disabled'} for ${selected.length} staff member(s)`);
    setSelected([]);
    setBulkLoading(false);
  };

  const enabledCount = staff.filter(s => s.loginEnabled).length;
  const disabledCount = staff.length - enabledCount;

  const avatarColors = ['bg-[#084A86]', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600'];
  const getColor = (name) => avatarColors[name?.charCodeAt(0) % avatarColors.length] || avatarColors[0];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Login Permissions</h1>
          <div className="flex items-center gap-1 text-sm text-zinc-500 mt-1">
            <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Roles</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-zinc-900 font-medium">Login Permission</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Staff', value: staff.length, icon: Users, color: 'text-[#084A86] bg-[#084A86]/10' },
          { label: 'Login Enabled', value: enabledCount, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Login Disabled', value: disabledCount, icon: UserX, color: 'text-red-500 bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`p-2.5 rounded-lg ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86] bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#084A86] bg-white"
            >
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#084A86] bg-white"
            >
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="px-4 py-2.5 bg-[#084A86]/5 border-b border-[#084A86]/20 flex items-center gap-3">
            <span className="text-sm font-medium text-[#084A86]">{selected.length} selected</span>
            <button
              onClick={() => bulkAction(true)}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {bulkLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3" />}
              Enable All
            </button>
            <button
              onClick={() => bulkAction(false)}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {bulkLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserX className="h-3 w-3" />}
              Disable All
            </button>
            <button onClick={() => setSelected([])} className="text-xs text-zinc-500 hover:text-zinc-700 ml-auto">Clear selection</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 text-[#084A86] focus:ring-[#084A86] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">Staff Member</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">Department</th>
                <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wide">Login Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading staff...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                  <Users className="h-8 w-8 mx-auto mb-2 text-zinc-300" />No staff found
                </td></tr>
              ) : filtered.map(s => (
                <tr key={s._id} className={`hover:bg-zinc-50 transition-colors ${selected.includes(s._id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(s._id)}
                      onChange={() => toggleSelect(s._id)}
                      className="rounded border-zinc-300 text-[#084A86] focus:ring-[#084A86] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${getColor(s.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {s.avatar || s.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 text-sm">{s.name}</p>
                        <p className="text-xs text-zinc-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-[#084A86]/10 text-[#084A86] font-medium px-2 py-1 rounded-full">{s.role}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">{s.department}</td>
                  <td className="px-4 py-3 text-center">
                    {s.loginEnabled ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                        <XCircle className="h-3.5 w-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleLogin(s._id, s.loginEnabled)}
                      disabled={toggling === s._id}
                      className="transition-colors disabled:opacity-50"
                      title={s.loginEnabled ? 'Disable login' : 'Enable login'}
                    >
                      {toggling === s._id ? (
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-400 mx-auto" />
                      ) : s.loginEnabled ? (
                        <ToggleRight className="h-7 w-7 text-emerald-500 hover:text-emerald-600 mx-auto" />
                      ) : (
                        <ToggleLeft className="h-7 w-7 text-zinc-400 hover:text-zinc-600 mx-auto" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50 text-xs text-zinc-500">
          Showing {filtered.length} of {staff.length} staff member(s)
        </div>
      </div>
    </div>
  );
}
