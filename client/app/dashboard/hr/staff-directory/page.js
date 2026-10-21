'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight, Search, LayoutGrid, List, Download,
  Phone, Mail, Users, Filter, X, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { formatDateDMY } from '@/lib/utils';

const DEMO_STAFF = [
  {
    id: 1, name: 'Dr. Amina Khalid', designation: 'Principal', department: 'Administration',
    role: 'Admin', phone: '+92-300-1234567', email: 'amina.khalid@stoofi.edu',
    status: 'Active', joinDate: '2021-03-15', gender: 'Female', avatar: null,
  },
  {
    id: 2, name: 'Mr. Tariq Mahmood', designation: 'Teacher', department: 'Science',
    role: 'Teacher', phone: '+92-321-9876543', email: 'tariq.mahmood@stoofi.edu',
    status: 'Active', joinDate: '2022-06-01', gender: 'Male', avatar: null,
  },
  {
    id: 3, name: 'Ms. Sana Iqbal', designation: 'Accountant', department: 'Finance',
    role: 'Staff', phone: '+92-333-4567890', email: 'sana.iqbal@stoofi.edu',
    status: 'Active', joinDate: '2023-01-10', gender: 'Female', avatar: null,
  },
  {
    id: 4, name: 'Mr. Ali Hassan', designation: 'Admin Officer', department: 'Administration',
    role: 'Staff', phone: '+92-345-6543210', email: 'ali.hassan@stoofi.edu',
    status: 'Active', joinDate: '2023-07-20', gender: 'Male', avatar: null,
  },
  {
    id: 5, name: 'Ms. Rabia Noor', designation: 'IT Coordinator', department: 'IT',
    role: 'Staff', phone: '+92-311-7890123', email: 'rabia.noor@stoofi.edu',
    status: 'Inactive', joinDate: '2024-02-14', gender: 'Female', avatar: null,
  },
];

const AVATAR_COLORS = [
  'bg-[#084A86]', 'bg-violet-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-rose-600', 'bg-cyan-600',
];

function AvatarCircle({ name, index, size = 'md' }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('') || '??';
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm';
  return (
    <div className={`${color} ${sizeClass} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function StaffDirectoryContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || '';
  const [staff, setStaff] = useState(DEMO_STAFF);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [filters, setFilters] = useState({ department: '', designation: '', role: initialRole, search: '' });

  useEffect(() => {
    if (initialRole) {
      setFilters(f => ({ ...f, role: initialRole }));
    }
  }, [initialRole]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [staffRes, deptRes, desigRes] = await Promise.allSettled([
        api.get('/staff'),
        api.get('/Department'),
        api.get('/designation'),
      ]);
      if (staffRes.status === 'fulfilled' && staffRes.value?.data?.length > 0) {
        setStaff(staffRes.value.data);
      }
      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.length > 0) {
        setDepartments(deptRes.value.data);
      }
      if (desigRes.status === 'fulfilled' && desigRes.value?.data?.length > 0) {
        setDesignations(desigRes.value.data);
      }
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleFilterChange = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const clearFilters = () => setFilters({ department: '', designation: '', role: '', search: '' });

  const filtered = useMemo(() => staff.filter(s => {
    const q = filters.search.toLowerCase();
    return (
      (!filters.department || s.department === filters.department) &&
      (!filters.designation || s.designation === filters.designation) &&
      (!filters.role || s.role === filters.role) &&
      (!q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.phone?.includes(q))
    );
  }), [staff, filters]);

  const deptOptions = departments.length > 0
    ? departments.map(d => d.name)
    : [...new Set(staff.map(s => s.department))];

  const desigOptions = designations.length > 0
    ? designations.map(d => d.name)
    : [...new Set(staff.map(s => s.designation))];

  const roleOptions = [...new Set(staff.map(s => s.role).filter(Boolean))];

  const handleExportCSV = () => {
    const headers = ['Name', 'Designation', 'Department', 'Role', 'Phone', 'Email', 'Status', 'Join Date'];
    const rows = filtered.map(s => [s.name, s.designation, s.department, s.role, s.phone, s.email, s.status, formatDateDMY(s.dateOfJoining || s.joinDate)]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff-directory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Staff Directory</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Browse and search all school staff members</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/dashboard/hr" className="hover:text-zinc-600 transition-colors">HR</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-zinc-950 font-semibold">Staff Directory</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              placeholder="Search by name, email or phone..."
              className="pl-9 border-zinc-300 focus-visible:ring-[#084A86]"
            />
          </div>

          {/* Department */}
          <select
            value={filters.department}
            onChange={e => handleFilterChange('department', e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] min-w-[160px]"
          >
            <option value="">All Departments</option>
            {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Designation */}
          <select
            value={filters.designation}
            onChange={e => handleFilterChange('designation', e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] min-w-[160px]"
          >
            <option value="">All Designations</option>
            {desigOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Role */}
          <select
            value={filters.role}
            onChange={e => handleFilterChange('role', e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] min-w-[120px]"
          >
            <option value="">All Roles</option>
            {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 px-2 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear ({activeFiltersCount})
              </button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 border-zinc-300 text-zinc-600 hover:border-[#084A86] hover:text-[#084A86] text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            {/* View Toggle */}
            <div className="flex items-center bg-zinc-100 rounded-lg p-0.5">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-[#084A86]' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-[#084A86]' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          <Filter className="h-3.5 w-3.5" />
          Showing <strong className="text-zinc-900">{filtered.length}</strong> of <strong className="text-zinc-900">{staff.length}</strong> staff members
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-14 w-14 rounded-full bg-zinc-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 rounded w-3/4" />
                  <div className="h-3 bg-zinc-100 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-zinc-100 rounded" />
                <div className="h-3 bg-zinc-100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
          <Users className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-600 font-medium">No staff found</p>
          <p className="text-zinc-400 text-sm mt-1">Try adjusting your search or filters</p>
          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 border-zinc-300 text-zinc-600">
            Clear Filters
          </Button>
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((member, idx) => (
            <div
              key={member.id}
              className="bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              {/* Status stripe */}
              <div className={`h-1 w-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <AvatarCircle name={member.name} index={idx} size="lg" />
                  <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    member.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                  }`}>
                    {member.status}
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-900 text-sm leading-tight">{member.name}</h3>
                <p className="text-xs text-[#084A86] font-medium mt-0.5">{member.designation}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{member.department}</p>

                <div className="mt-4 space-y-1.5 border-t border-zinc-100 pt-3">
                  {member.phone && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Phone className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                      <span className="truncate">{member.phone}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Mail className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-100">
                  <Link href={`/dashboard/hr/staff-directory/${member.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-8 text-xs border-zinc-200 text-zinc-600 hover:border-[#084A86] hover:text-[#084A86] hover:bg-blue-50 gap-1.5 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {!loading && view === 'list' && filtered.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Designation</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Phone</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-zinc-400 text-xs">{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <AvatarCircle name={member.name} index={idx} size="sm" />
                        <div>
                          <p className="font-medium text-zinc-900">{member.name}</p>
                          <p className="text-xs text-zinc-400">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 text-sm">{member.designation}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-[#084A86] font-medium">
                        {member.department}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs">{member.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs truncate max-w-[180px]">{member.email || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        member.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Link href={`/dashboard/hr/staff-directory/${member.id}`}>
                        <button className="p-1.5 rounded-md text-zinc-400 hover:text-[#084A86] hover:bg-blue-50 transition-colors" title="View Profile">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading staff directory...</div>}>
      <StaffDirectoryContent />
    </Suspense>
  );
}
