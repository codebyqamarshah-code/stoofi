'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight, Search, LayoutGrid, List, Download,
  Phone, Mail, Users, Filter, X, Eye, Plus, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { formatDateDMY } from '@/lib/utils';
import StaffAvatar from '@/components/staff/StaffAvatar';

const DEMO_STAFF = [
  {
    id: 'demo-1', _id: 'demo-1', staffNo: 'PRCS0001', name: 'Dr. Amina Khalid', firstName: 'Amina', lastName: 'Khalid',
    designation: 'Principal', department: 'Administration', role: 'Admin',
    phone: '+92-300-1234567', mobile: '+92-300-1234567', email: 'amina.khalid@stoofi.edu',
    status: 'Active', joinDate: '2021-03-15', gender: 'Female', photo: null, staffPhoto: null
  },
  {
    id: 'demo-2', _id: 'demo-2', staffNo: 'PRCS0002', name: 'Mr. Tariq Mahmood', firstName: 'Tariq', lastName: 'Mahmood',
    designation: 'Teacher', department: 'Science', role: 'Teacher',
    phone: '+92-321-9876543', mobile: '+92-321-9876543', email: 'tariq.mahmood@stoofi.edu',
    status: 'Active', joinDate: '2022-06-01', gender: 'Male', photo: null, staffPhoto: null
  },
  {
    id: 'demo-3', _id: 'demo-3', staffNo: 'PRCS0003', name: 'Ms. Sana Iqbal', firstName: 'Sana', lastName: 'Iqbal',
    designation: 'Accountant', department: 'Finance', role: 'Staff',
    phone: '+92-333-4567890', mobile: '+92-333-4567890', email: 'sana.iqbal@stoofi.edu',
    status: 'Active', joinDate: '2023-01-10', gender: 'Female', photo: null, staffPhoto: null
  },
  {
    id: 'demo-4', _id: 'demo-4', staffNo: 'PRCS0004', name: 'Mr. Ali Hassan', firstName: 'Ali', lastName: 'Hassan',
    designation: 'Admin Officer', department: 'Administration', role: 'Staff',
    phone: '+92-345-6543210', mobile: '+92-345-6543210', email: 'ali.hassan@stoofi.edu',
    status: 'Active', joinDate: '2023-07-20', gender: 'Male', photo: null, staffPhoto: null
  },
  {
    id: 'demo-5', _id: 'demo-5', staffNo: 'PRCS0005', name: 'Ms. Rabia Noor', firstName: 'Rabia', lastName: 'Noor',
    designation: 'IT Coordinator', department: 'IT', role: 'Staff',
    phone: '+92-311-7890123', mobile: '+92-311-7890123', email: 'rabia.noor@stoofi.edu',
    status: 'Inactive', joinDate: '2024-02-14', gender: 'Female', photo: null, staffPhoto: null
  },
];

function StaffDirectoryContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || '';
  const [staff, setStaff] = useState([]);
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
        api.get('/staff?limit=1000'),
        api.get('/department'),
        api.get('/designation'),
      ]);

      let fetchedStaff = [];
      if (staffRes.status === 'fulfilled') {
        const raw = staffRes.value?.data || (Array.isArray(staffRes.value) ? staffRes.value : null);
        if (Array.isArray(raw) && raw.length > 0) {
          fetchedStaff = raw.map((s, idx) => {
            const id = (s._id || s.id || `staff-${idx}`).toString();
            const firstName = s.firstName || '';
            const lastName = s.lastName || '';
            const fullName = s.name || `${firstName} ${lastName}`.trim() || 'Staff Member';
            const phone = s.mobile || s.phone || s.emergencyMobile || '';
            const photo = s.staffPhoto || s.photo || s.avatar || null;
            return {
              ...s,
              id,
              _id: id,
              name: fullName,
              firstName: firstName || fullName.split(' ')[0] || '',
              lastName: lastName || fullName.split(' ').slice(1).join(' ') || '',
              phone,
              mobile: phone,
              photo,
              staffPhoto: photo,
              status: s.status || 'Active',
            };
          });
        }
      }

      setStaff(fetchedStaff);

      if (deptRes.status === 'fulfilled') {
        const d = deptRes.value?.data || (Array.isArray(deptRes.value) ? deptRes.value : []);
        if (Array.isArray(d)) setDepartments(d);
      }
      if (desigRes.status === 'fulfilled') {
        const dg = desigRes.value?.data || (Array.isArray(desigRes.value) ? desigRes.value : []);
        if (Array.isArray(dg)) setDesignations(dg);
      }
    } catch (_) {
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const clearFilters = () => setFilters({ department: '', designation: '', role: '', search: '' });

  const filtered = useMemo(() => staff.filter(s => {
    const q = (filters.search || '').toLowerCase().trim();
    const deptMatch = !filters.department || s.department === filters.department;
    const desigMatch = !filters.designation || s.designation === filters.designation;
    const roleMatch = !filters.role || s.role === filters.role;

    if (!q) return deptMatch && desigMatch && roleMatch;

    const nameStr = (s.name || `${s.firstName || ''} ${s.lastName || ''}`).toLowerCase();
    const emailStr = (s.email || '').toLowerCase();
    const phoneStr = (s.phone || s.mobile || '').toLowerCase();
    const staffNoStr = (s.staffNo || '').toLowerCase();
    const qMatch = nameStr.includes(q) || emailStr.includes(q) || phoneStr.includes(q) || staffNoStr.includes(q);

    return deptMatch && desigMatch && roleMatch && qMatch;
  }), [staff, filters]);

  const deptOptions = departments.length > 0
    ? departments.map(d => d.name)
    : [...new Set(staff.map(s => s.department).filter(Boolean))];

  const desigOptions = designations.length > 0
    ? designations.map(d => d.name)
    : [...new Set(staff.map(s => s.designation).filter(Boolean))];

  const roleOptions = [...new Set(staff.map(s => s.role).filter(Boolean))];

  const handleExportCSV = () => {
    const headers = ['Staff ID', 'Name', 'Designation', 'Department', 'Role', 'Phone', 'Email', 'Status', 'Join Date'];
    const rows = filtered.map(s => [
      s.staffNo || '—',
      s.name,
      s.designation || '—',
      s.department || '—',
      s.role || '—',
      s.phone || s.mobile || '—',
      s.email || '—',
      s.status || 'Active',
      formatDateDMY(s.dateOfJoining || s.joinDate)
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-directory-${new Date().toISOString().split('T')[0]}.csv`;
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
          <p className="text-sm text-zinc-500 mt-0.5">Browse and manage all school staff members</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/hr/add-staff">
            <Button className="bg-[#009966] hover:bg-[#008055] text-white font-semibold text-xs h-9 px-4 flex items-center gap-2 shadow-sm">
              <Plus className="h-4 w-4 stroke-[2.5]" /> Add Staff Member
            </Button>
          </Link>
          <div className="hidden md:flex items-center text-sm text-zinc-400">
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
              placeholder="Search by name, ID, email or phone..."
              className="pl-9 border-zinc-300 focus-visible:ring-[#009966]"
            />
          </div>

          {/* Department */}
          <select
            value={filters.department}
            onChange={e => handleFilterChange('department', e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#009966] min-w-[160px]"
          >
            <option value="">All Departments</option>
            {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Designation */}
          <select
            value={filters.designation}
            onChange={e => handleFilterChange('designation', e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#009966] min-w-[160px]"
          >
            <option value="">All Designations</option>
            {desigOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Role */}
          <select
            value={filters.role}
            onChange={e => handleFilterChange('role', e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#009966] min-w-[120px]"
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
              className="gap-1.5 border-zinc-300 text-zinc-600 hover:border-[#009966] hover:text-[#009966] text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            {/* View Toggle */}
            <div className="flex items-center bg-zinc-100 rounded-lg p-0.5">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-[#009966]' : 'text-zinc-500 hover:text-zinc-700'}`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-[#009966]' : 'text-zinc-500 hover:text-zinc-700'}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" />
            Showing <strong className="text-zinc-900">{filtered.length}</strong> of <strong className="text-zinc-900">{staff.length}</strong> staff members
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Active: {staff.filter(s => s.status === 'Active').length}</span>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-16 w-16 rounded-full bg-zinc-200" />
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
          <p className="text-zinc-700 font-bold text-base">No staff members found</p>
          <p className="text-zinc-400 text-sm mt-1">Try adjusting your search query or clear your filters</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={clearFilters} className="border-zinc-300 text-zinc-700">
              Clear Filters
            </Button>
            <Link href="/dashboard/hr/add-staff">
              <Button size="sm" className="bg-[#009966] hover:bg-[#008055] text-white">
                <Plus className="h-4 w-4 mr-1.5" /> Add New Staff
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((member) => {
            const memberId = member.id || member._id;
            return (
              <div
                key={memberId}
                className="bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col justify-between"
              >
                {/* Status stripe */}
                <div className={`h-1.5 w-full ${member.status === 'Active' ? 'bg-[#009966]' : 'bg-zinc-300'}`} />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <StaffAvatar
                      photo={member.photo || member.staffPhoto}
                      name={member.name}
                      firstName={member.firstName}
                      lastName={member.lastName}
                      size="lg"
                    />
                    <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      member.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                    }`}>
                      {member.status || 'Active'}
                    </span>
                  </div>

                  <h3 className="font-bold text-zinc-900 text-base leading-snug group-hover:text-[#009966] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs text-[#009966] font-semibold mt-1">
                    {member.designation || 'Staff Member'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {member.department || 'Academics'}
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-zinc-100 pt-3 flex-1">
                    {member.staffNo && (
                      <div className="text-[11px] font-mono font-bold text-zinc-500">
                        Staff ID: <span className="text-zinc-700">{member.staffNo}</span>
                      </div>
                    )}
                    {(member.phone || member.mobile) && (
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <Phone className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                        <span className="truncate">{member.phone || member.mobile}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <Mail className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100">
                    <Link href={`/dashboard/hr/staff-directory/${memberId}`} className="block w-full">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-xs font-semibold border-zinc-200 text-zinc-700 hover:border-[#009966] hover:text-[#009966] hover:bg-emerald-50 gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
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
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Staff Member</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Designation</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Phone</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map((member, idx) => {
                  const memberId = member.id || member._id;
                  return (
                    <tr key={memberId} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="px-5 py-3.5 text-zinc-400 text-xs font-mono">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <StaffAvatar
                            photo={member.photo || member.staffPhoto}
                            name={member.name}
                            firstName={member.firstName}
                            lastName={member.lastName}
                            size="sm"
                          />
                          <div>
                            <p className="font-bold text-zinc-900">{member.name}</p>
                            <p className="text-xs text-zinc-500 font-mono">
                              {member.staffNo ? `ID: ${member.staffNo}` : (member.role || 'Teacher')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-700 text-sm font-medium">{member.designation || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-[#009966] font-semibold border border-emerald-100">
                          {member.department || 'Academics'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600 text-xs font-mono">{member.phone || member.mobile || '—'}</td>
                      <td className="px-5 py-3.5 text-zinc-600 text-xs truncate max-w-[180px]">{member.email || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          member.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                        }`}>
                          {member.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Link href={`/dashboard/hr/staff-directory/${memberId}`}>
                          <button
                            className="p-1.5 rounded-md text-zinc-400 hover:text-[#009966] hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
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
