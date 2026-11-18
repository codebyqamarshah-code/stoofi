'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import {
  ChevronRight, Search, ToggleLeft, ToggleRight, Users,
  Filter, CheckCircle2, XCircle, Loader2, AlertCircle, UserCheck, UserX,
  GraduationCap, Briefcase, ShieldAlert
} from 'lucide-react';

const ROLES = ['All Roles', 'Super Admin', 'Admin', 'Teacher', 'Student', 'Accountant', 'Librarian', 'Security Guard'];

export default function LoginPermissionPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'staff' | 'student'
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [selected, setSelected] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, studentRes] = await Promise.all([
        api.get('/staff?limit=500').catch(() => null),
        api.get('/student?limit=500').catch(() => null)
      ]);

      const staffList = (Array.isArray(staffRes) ? staffRes : staffRes?.data || staffRes?.staff || []).map(s => {
        const id = (s._id || s.id || '').toString();
        const role = s.role || 'Staff';
        return {
          _id: id,
          id,
          memberType: 'staff',
          name: s.fullName || s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Staff Member',
          email: s.email || '',
          secondaryId: s.staffNo || s.email || '',
          role,
          department: s.department || (role.includes('Admin') ? 'Administration' : 'Academics'),
          photo: s.avatar || s.staffPhoto || s.photo || null,
          loginEnabled: s.loginEnabled !== false && s.status !== 'Inactive',
          status: s.status || (s.loginEnabled === false ? 'Inactive' : 'Active')
        };
      });

      const studentData = Array.isArray(studentRes) ? studentRes : studentRes?.data || studentRes?.students || [];
      const studentList = studentData.map(st => {
        const id = (st._id || st.id || '').toString();
        const name = st.fullName || st.studentName || st.name || `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student';
        const admissionNo = st.admissionNo || st.rollNo || '';
        const rawPhoto = st.studentPhoto || st.photo || st.avatar || null;
        const photo = rawPhoto ? (rawPhoto.startsWith('data:') ? rawPhoto : `/api/student/${id}/photo`) : null;
        const className = st.className || st.class || 'Student';
        const section = st.section ? ` - Sec ${st.section}` : '';
        const deptOrClass = `${className}${section}`.trim();
        const isEnabled = st.loginEnabled !== false && st.status !== 'Inactive';

        return {
          _id: id,
          id,
          memberType: 'student',
          name,
          email: st.email || (admissionNo ? `${admissionNo.toLowerCase()}@pakroyalcollege.edu.pk` : ''),
          secondaryId: admissionNo || st.rollNo || '',
          role: 'Student',
          department: deptOrClass,
          photo,
          loginEnabled: isEnabled,
          status: st.status || (isEnabled ? 'Active' : 'Inactive')
        };
      });

      setMembers([...staffList, ...studentList]);
    } catch (err) {
      console.error('Failed to load login permissions data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Dynamic Departments & Classes list
  const departmentsList = useMemo(() => {
    const set = new Set();
    members.forEach(m => {
      if (m.department && m.department.trim()) set.add(m.department.trim());
    });
    return ['All Departments', ...Array.from(set).sort()];
  }, [members]);

  // Tab counts
  const staffCount = useMemo(() => members.filter(m => m.memberType === 'staff').length, [members]);
  const studentCount = useMemo(() => members.filter(m => m.memberType === 'student').length, [members]);

  const filtered = useMemo(() => {
    return members.filter(m => {
      // Tab filter
      if (activeTab === 'staff' && m.memberType !== 'staff') return false;
      if (activeTab === 'student' && m.memberType !== 'student') return false;

      // Search filter
      const searchLower = search.toLowerCase().trim();
      if (searchLower) {
        const matchName = m.name?.toLowerCase().includes(searchLower);
        const matchEmail = m.email?.toLowerCase().includes(searchLower);
        const matchSec = m.secondaryId?.toLowerCase().includes(searchLower);
        const matchDept = m.department?.toLowerCase().includes(searchLower);
        if (!matchName && !matchEmail && !matchSec && !matchDept) return false;
      }

      // Role filter
      if (roleFilter !== 'All Roles' && m.role !== roleFilter) return false;

      // Department/Class filter
      if (deptFilter !== 'All Departments' && m.department !== deptFilter) return false;

      return true;
    });
  }, [members, activeTab, search, roleFilter, deptFilter]);

  const toggleLogin = async (member) => {
    const id = member._id;
    const current = !!member.loginEnabled;
    const nextVal = !current;
    setToggling(id);

    try {
      if (member.memberType === 'student') {
        await api.put(`/student/${id}/login-permission`, { loginEnabled: nextVal });
      } else {
        await api.put(`/staff/${id}/login-permission`, { loginEnabled: nextVal });
      }
      setMembers(prev => prev.map(m => m._id === id ? {
        ...m,
        loginEnabled: nextVal,
        status: nextVal ? 'Active' : 'Inactive'
      } : m));
      showToast(nextVal ? `Login access granted for ${member.name}` : `Login access revoked for ${member.name}`, nextVal ? 'success' : 'error');
    } catch (err) {
      console.error('Failed to toggle permission:', err);
      showToast('Failed to update login permission', 'error');
    } finally {
      setToggling(null);
    }
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelected(prev => prev.length === filtered.length ? [] : filtered.map(m => m._id));

  const bulkAction = async (enable) => {
    if (!selected.length) { showToast('Select at least one member', 'error'); return; }
    setBulkLoading(true);
    try {
      const selectedMembers = members.filter(m => selected.includes(m._id));
      await Promise.allSettled(selectedMembers.map(m => {
        if (m.memberType === 'student') {
          return api.put(`/student/${m._id}/login-permission`, { loginEnabled: enable });
        }
        return api.put(`/staff/${m._id}/login-permission`, { loginEnabled: enable });
      }));

      setMembers(prev => prev.map(m => selected.includes(m._id) ? {
        ...m,
        loginEnabled: enable,
        status: enable ? 'Active' : 'Inactive'
      } : m));

      showToast(`Login ${enable ? 'enabled' : 'disabled'} for ${selected.length} user(s)`);
      setSelected([]);
    } catch {
      showToast('Bulk update encountered an error', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  const enabledCount = useMemo(() => members.filter(m => m.loginEnabled).length, [members]);
  const disabledCount = useMemo(() => members.length - enabledCount, [members, enabledCount]);

  const avatarColors = ['bg-[#084A86]', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600'];
  const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length] || avatarColors[0];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Login Permissions</h1>
          <div className="flex items-center gap-1 text-sm text-zinc-500 mt-1">
            <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Roles</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-zinc-900 dark:text-zinc-200 font-medium">Login Permission</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Members (Staff & Students)', value: members.length, icon: Users, color: 'text-[#084A86] bg-[#084A86]/10' },
          { label: 'Login Enabled', value: enabledCount, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Login Disabled', value: disabledCount, icon: UserX, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`p-2.5 rounded-lg ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Member Category Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'all'
              ? 'border-[#084A86] text-[#084A86]'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="h-4 w-4" />
          All Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'staff'
              ? 'border-[#084A86] text-[#084A86]'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Staff & Faculty ({staffCount})
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'student'
              ? 'border-[#084A86] text-[#084A86]'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Students ({studentCount})
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, roll no, or admission no..."
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#084A86] bg-white dark:bg-zinc-950"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#084A86] bg-white dark:bg-zinc-950 max-w-[220px]"
            >
              {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {bulkLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserX className="h-3 w-3" />}
              Disable All
            </button>
            <button onClick={() => setSelected([])} className="text-xs text-zinc-500 hover:text-zinc-700 ml-auto">Clear selection</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 text-[#084A86] focus:ring-[#084A86] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">Member</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">Department / Class</th>
                <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wide">Login Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#084A86]" />
                    Loading members & permissions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                    No members match the selected criteria
                  </td>
                </tr>
              ) : filtered.map(m => (
                <tr key={m._id} className={`hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors ${selected.includes(m._id) ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(m._id)}
                      onChange={() => toggleSelect(m._id)}
                      className="rounded border-zinc-300 text-[#084A86] focus:ring-[#084A86] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 relative">
                        {m.photo ? (
                          <img
                            src={m.photo}
                            alt={m.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={`avatar-fallback ${m.photo ? 'hidden' : 'flex'} w-full h-full ${getColor(m.name)} items-center justify-center text-white text-xs font-bold`}
                        >
                          {m.name?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">{m.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{m.email || m.secondaryId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      m.role === 'Super Admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                        : m.role === 'Admin'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : m.role === 'Teacher'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : m.role === 'Student'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-sm">{m.department || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {m.loginEnabled ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                        <XCircle className="h-3.5 w-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleLogin(m)}
                      disabled={toggling === m._id}
                      className="transition-transform active:scale-90 disabled:opacity-50"
                      title={m.loginEnabled ? 'Revoke Login Access' : 'Grant Login Access'}
                    >
                      {toggling === m._id ? (
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-400 mx-auto" />
                      ) : m.loginEnabled ? (
                        <ToggleRight className="h-8 w-8 text-emerald-600 hover:text-emerald-700 mx-auto" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-zinc-400 hover:text-zinc-500 mx-auto" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900 text-xs text-zinc-500 flex items-center justify-between">
          <span>Showing {filtered.length} of {members.length} total members</span>
          <span>Filtered: {activeTab.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
