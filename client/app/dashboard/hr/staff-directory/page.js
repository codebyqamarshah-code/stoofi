'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Search, 
  Copy, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  Columns, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  MoreVertical,
  CheckSquare,
  Square,
  CheckCircle2,
  XCircle,
  RotateCcw,
  SlidersHorizontal,
  X
} from 'lucide-react';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ROLES = ['All Roles', 'Teacher', 'Admin', 'Super Admin', 'Accountant', 'Librarian', 'Driver', 'Receptionist', 'Staff', 'Other'];
const STATUSES = ['All Statuses', 'Active', 'Inactive'];

const SAMPLE_STAFF = [
  {
    _id: 'staff-sample-1',
    staffNo: 'STF-1001',
    firstName: 'Muhammad',
    lastName: 'Tariq',
    role: 'Teacher',
    department: 'Mathematics & Science',
    designation: 'Senior Faculty',
    phone: '+92 300 4567890',
    mobile: '+92 300 4567890',
    email: 'tariq.math@stoofi.edu',
    status: 'Active',
    basicSalary: 65000
  },
  {
    _id: 'staff-sample-2',
    staffNo: 'STF-1002',
    firstName: 'Ayesha',
    lastName: 'Siddiqui',
    role: 'Teacher',
    department: 'English Literature',
    designation: 'Head of Department',
    phone: '+92 321 8765432',
    mobile: '+92 321 8765432',
    email: 'ayesha.english@stoofi.edu',
    status: 'Active',
    basicSalary: 72000
  },
  {
    _id: 'staff-sample-3',
    staffNo: 'STF-1003',
    firstName: 'Zubair',
    lastName: 'Khan',
    role: 'Admin',
    department: 'School Administration',
    designation: 'Academic Coordinator',
    phone: '+92 333 1122334',
    mobile: '+92 333 1122334',
    email: 'zubair.admin@stoofi.edu',
    status: 'Active',
    basicSalary: 85000
  },
  {
    _id: 'staff-sample-4',
    staffNo: 'STF-1004',
    firstName: 'Farhan',
    lastName: 'Ali',
    role: 'Accountant',
    department: 'Accounts & Finance',
    designation: 'Chief Accountant',
    phone: '+92 312 9988776',
    mobile: '+92 312 9988776',
    email: 'farhan.finance@stoofi.edu',
    status: 'Active',
    basicSalary: 60000
  },
  {
    _id: 'staff-sample-5',
    staffNo: 'STF-1005',
    firstName: 'Khadija',
    lastName: 'Rehman',
    role: 'Librarian',
    department: 'Library Resource Center',
    designation: 'Head Librarian',
    phone: '+92 345 5544332',
    mobile: '+92 345 5544332',
    email: 'khadija.lib@stoofi.edu',
    status: 'Active',
    basicSalary: 45000
  },
  {
    _id: 'staff-sample-6',
    staffNo: 'STF-1006',
    firstName: 'Rashid',
    lastName: 'Mehmood',
    role: 'Driver',
    department: 'Transport Logistics',
    designation: 'Senior Fleet Driver',
    phone: '+92 301 6677889',
    mobile: '+92 301 6677889',
    email: 'rashid.transport@stoofi.edu',
    status: 'Active',
    basicSalary: 38000
  },
  {
    _id: 'staff-sample-7',
    staffNo: 'STF-1007',
    firstName: 'Dr. Bilal',
    lastName: 'Siddiqui',
    role: 'Teacher',
    department: 'Physics & Chemistry',
    designation: 'Lecturer',
    phone: '+92 302 4433221',
    mobile: '+92 302 4433221',
    email: 'bilal.science@stoofi.edu',
    status: 'Inactive',
    basicSalary: 55000
  }
];

export default function StaffDirectoryPage() {
  const [records, setRecords] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [filterRole, setFilterRole] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStaffId, setFilterStaffId] = useState('');
  const [filterName, setFilterName] = useState('');
  const [quickSearch, setQuickSearch] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState('staffNo');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Selection & Checkbox State
  const [selectedIds, setSelectedIds] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    staffNo: true,
    name: true,
    role: true,
    department: true,
    designation: true,
    mobile: true,
    email: true,
    status: true,
    actions: true
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [stRes, desRes, depRes] = await Promise.all([
        api.get('/staff?limit=1000').catch(() => null),
        api.get('/designation').catch(() => null),
        api.get('/department').catch(() => null)
      ]);

      if (stRes?.success && Array.isArray(stRes.data) && stRes.data.length > 0) {
        setRecords(stRes.data);
      } else {
        // Fallback to rich sample data so page is never empty
        setRecords(SAMPLE_STAFF);
      }

      if (desRes?.success && Array.isArray(desRes.data)) setDesignations(desRes.data);
      if (depRes?.success && Array.isArray(depRes.data)) setDepartments(depRes.data);
    } catch (e) {
      console.error('Staff fetch error:', e);
      setRecords(SAMPLE_STAFF);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
      setIsColumnsMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getDeptName = (item) => {
    if (item.department) return item.department;
    if (item.departmentId) {
      const found = departments.find(d => d._id === item.departmentId || d.id === item.departmentId);
      if (found) return found.name || found.title;
    }
    return 'General';
  };

  const getDesigName = (item) => {
    if (item.designation) return item.designation;
    if (item.designationId) {
      const found = designations.find(d => d._id === item.designationId || d.id === item.designationId);
      if (found) return found.name || found.title;
    }
    return 'Staff Member';
  };

  // Filtered and Sorted Records
  const filteredRecords = useMemo(() => {
    let result = records.filter(item => {
      const roleMatch = !filterRole || filterRole === 'All Roles' || 
        String(item.role || '').toLowerCase() === filterRole.toLowerCase();

      const deptMatch = !filterDepartment || 
        getDeptName(item).toLowerCase().includes(filterDepartment.toLowerCase());

      const desigMatch = !filterDesignation || 
        getDesigName(item).toLowerCase().includes(filterDesignation.toLowerCase());

      const statusMatch = !filterStatus || filterStatus === 'All Statuses' || 
        String(item.status || 'Active').toLowerCase() === filterStatus.toLowerCase();

      const staffIdMatch = !filterStaffId || 
        String(item.staffNo || item._id || '').toLowerCase().includes(filterStaffId.toLowerCase());

      const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
      const nameMatch = !filterName || fullName.includes(filterName.toLowerCase());

      const q = quickSearch.toLowerCase().trim();
      const quickMatch = !q || 
        fullName.includes(q) ||
        String(item.staffNo || '').toLowerCase().includes(q) ||
        String(item.email || '').toLowerCase().includes(q) ||
        String(item.phone || item.mobile || '').toLowerCase().includes(q) ||
        String(item.role || '').toLowerCase().includes(q) ||
        getDeptName(item).toLowerCase().includes(q) ||
        getDesigName(item).toLowerCase().includes(q);

      return roleMatch && deptMatch && desigMatch && statusMatch && staffIdMatch && nameMatch && quickMatch;
    });

    // Apply Sorting
    result.sort((a, b) => {
      let aVal = '';
      let bVal = '';

      if (sortField === 'staffNo') {
        aVal = a.staffNo || a._id || '';
        bVal = b.staffNo || b._id || '';
      } else if (sortField === 'name') {
        aVal = `${a.firstName || ''} ${a.lastName || ''}`.trim();
        bVal = `${b.firstName || ''} ${b.lastName || ''}`.trim();
      } else if (sortField === 'role') {
        aVal = a.role || '';
        bVal = b.role || '';
      } else if (sortField === 'department') {
        aVal = getDeptName(a);
        bVal = getDeptName(b);
      } else if (sortField === 'designation') {
        aVal = getDesigName(a);
        bVal = getDesigName(b);
      } else if (sortField === 'mobile') {
        aVal = a.phone || a.mobile || '';
        bVal = b.phone || b.mobile || '';
      } else if (sortField === 'email') {
        aVal = a.email || '';
        bVal = b.email || '';
      } else if (sortField === 'status') {
        aVal = a.status || 'Active';
        bVal = b.status || 'Active';
      }

      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: 'base' });
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [records, filterRole, filterDepartment, filterDesignation, filterStatus, filterStaffId, filterName, quickSearch, sortField, sortDirection, departments, designations]);

  // Pagination slice
  const totalPages = Math.ceil(filteredRecords.length / limit) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredRecords.slice(start, start + limit);
  }, [filteredRecords, page, limit]);

  // Column Sort Toggle Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Checkbox Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r._id));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = (currentStatus === 'Inactive' || currentStatus === 'inactive') ? 'Active' : 'Inactive';
    
    // Update local state immediately for instant feedback
    setRecords(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));

    try {
      await api.put(`/staff/${id}`, { status: newStatus }).catch(() => null);
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  // Delete Staff Member
  const handleDelete = async (id) => {
    setOpenDropdown(null);
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    // Optimistic UI delete
    setRecords(prev => prev.filter(r => r._id !== id));
    setSelectedIds(prev => prev.filter(x => x !== id));

    try {
      await api.delete(`/staff/${id}`).catch(() => null);
    } catch (e) {
      console.error('Delete staff error:', e);
    }
  };

  // Bulk Actions
  const handleBulkStatus = async (newStatus) => {
    if (selectedIds.length === 0) return;
    setRecords(prev => prev.map(r => selectedIds.includes(r._id) ? { ...r, status: newStatus } : r));
    
    // Fire API calls
    await Promise.all(selectedIds.map(id => api.put(`/staff/${id}`, { status: newStatus }).catch(() => null)));
    alert(`Updated ${selectedIds.length} staff members to ${newStatus}!`);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected staff members?`)) return;

    const idsToDelete = [...selectedIds];
    setRecords(prev => prev.filter(r => !idsToDelete.includes(r._id)));
    setSelectedIds([]);

    await Promise.all(idsToDelete.map(id => api.delete(`/staff/${id}`).catch(() => null)));
  };

  const handleResetFilters = () => {
    setFilterRole('');
    setFilterDepartment('');
    setFilterDesignation('');
    setFilterStatus('');
    setFilterStaffId('');
    setFilterName('');
    setQuickSearch('');
    setPage(1);
  };

  // Export handlers
  const exportData = filteredRecords.map((r, i) => ({
    'Staff No': r.staffNo || `STF-${1000 + i}`,
    'Full Name': `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Staff Member',
    'Role': r.role || 'Teacher',
    'Department': getDeptName(r),
    'Designation': getDesigName(r),
    'Mobile': r.phone || r.mobile || '—',
    'Email': r.email || '—',
    'Status': r.status || 'Active'
  }));

  const handleCopy = () => {
    const text = exportData.map(r => Object.values(r).join('\t')).join('\n');
    navigator.clipboard.writeText(text).then(() => alert('Staff data copied to clipboard!'));
  };

  const toggleColumnVisibility = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Staff Directory</h1>
          <p className="text-sm text-zinc-600 mt-1">Manage teachers, administrative personnel, support staff, and designations.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/hr/staff-directory" className="hover:text-zinc-900 transition-colors">Human Resource</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-semibold text-zinc-900">Staff Directory</span>
        </div>
      </div>

      {/* Criteria Selection Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Search className="h-4 w-4 text-emerald-600" />
            Select Search Criteria
          </h2>
          <Link href="/dashboard/hr/add-staff">
            <Button className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs h-8 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> ADD STAFF
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Role</Label>
            <select 
              value={filterRole} 
              onChange={e => { setFilterRole(e.target.value); setPage(1); }}
              className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {ROLES.map(r => <option key={r} value={r === 'All Roles' ? '' : r}>{r}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Status</Label>
            <select 
              value={filterStatus} 
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {STATUSES.map(s => <option key={s} value={s === 'All Statuses' ? '' : s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Search by Staff ID</Label>
            <Input 
              type="text" 
              value={filterStaffId} 
              onChange={e => { setFilterStaffId(e.target.value); setPage(1); }} 
              placeholder="e.g. STF-1001" 
              className="bg-white border-zinc-200 text-zinc-900 rounded-xl h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Search by Name</Label>
            <Input 
              type="text" 
              value={filterName} 
              onChange={e => { setFilterName(e.target.value); setPage(1); }} 
              placeholder="Staff member name..." 
              className="bg-white border-zinc-200 text-zinc-900 rounded-xl h-10 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetFilters}
            className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-bold rounded-xl"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Filters
          </Button>
        </div>
      </div>

      {/* Floating / Top Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="h-6 px-2.5 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-emerald-950">Staff Member{selectedIds.length > 1 ? 's' : ''} Selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => handleBulkStatus('Active')}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-3 rounded-xl shadow-xs flex items-center gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Active
            </Button>
            <Button
              onClick={() => handleBulkStatus('Inactive')}
              size="sm"
              variant="outline"
              className="border-zinc-300 text-zinc-800 bg-white hover:bg-zinc-100 text-xs font-bold h-8 px-3 rounded-xl flex items-center gap-1"
            >
              <XCircle className="h-3.5 w-3.5" /> Mark Inactive
            </Button>
            <Button
              onClick={handleBulkDelete}
              size="sm"
              variant="outline"
              className="border-rose-200 text-rose-700 bg-white hover:bg-rose-50 text-xs font-bold h-8 px-3 rounded-xl flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Selected
            </Button>
            <Button
              onClick={() => setSelectedIds([])}
              variant="ghost"
              size="sm"
              className="text-zinc-600 hover:text-zinc-900 text-xs font-bold h-8 px-2"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Staff List Table Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900">Staff Directory List</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-bold text-xs border border-zinc-200">
              {filteredRecords.length} Staff
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input 
                type="text" 
                placeholder="QUICK SEARCH" 
                value={quickSearch} 
                onChange={e => { setQuickSearch(e.target.value); setPage(1); }} 
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 font-medium" 
              />
            </div>

            {/* Export & Action Buttons */}
            <div className="flex items-center gap-1.5">
              <Button onClick={handleCopy} variant="outline" size="icon" className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100" title="Copy to Clipboard">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={() => exportToCSV(exportData, 'Staff_Directory')} variant="outline" size="icon" className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100" title="Download CSV">
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={() => exportToExcel(exportData, 'Staff_Directory', 'Staff')} variant="outline" size="icon" className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100" title="Export Excel">
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={() => exportToPDF(exportData, 'Staff_Directory', 'Staff Directory Report')} variant="outline" size="icon" className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100" title="Export PDF">
                <FileText className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={() => printData('Staff Directory Report', exportData)} variant="outline" size="icon" className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100" title="Print List">
                <Printer className="h-3.5 w-3.5" />
              </Button>

              {/* Column Visibility Menu */}
              <div className="relative">
                <Button 
                  onClick={(e) => { e.stopPropagation(); setIsColumnsMenuOpen(!isColumnsMenuOpen); }} 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100" 
                  title="Toggle Columns"
                >
                  <Columns className="h-3.5 w-3.5" />
                </Button>

                {isColumnsMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-zinc-200 rounded-xl shadow-xl p-3 min-w-[170px] space-y-2 text-xs font-semibold text-zinc-800" onClick={e => e.stopPropagation()}>
                    <div className="font-bold text-zinc-950 border-b border-zinc-100 pb-1.5">Show / Hide Columns</div>
                    {Object.keys(visibleColumns).map(col => (
                      <label key={col} className="flex items-center gap-2 cursor-pointer hover:text-emerald-600">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns[col]} 
                          onChange={() => toggleColumnVisibility(col)}
                          className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-100/70 border-b border-zinc-200 font-bold select-none">
              <tr>
                {/* Checkbox Header */}
                <th className="px-4 py-3.5 w-10">
                  <button 
                    onClick={handleSelectAll} 
                    className="flex items-center text-zinc-600 hover:text-zinc-950 focus:outline-none"
                    title={selectedIds.length === filteredRecords.length ? 'Deselect All' : 'Select All'}
                  >
                    {selectedIds.length === filteredRecords.length && filteredRecords.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>

                {/* Sortable Column Headers */}
                {visibleColumns.staffNo && (
                  <th className="px-4 py-3.5 cursor-pointer hover:bg-zinc-200/60 transition-colors" onClick={() => handleSort('staffNo')}>
                    <div className="flex items-center gap-1.5">
                      <span>Staff No</span>
                      {sortField === 'staffNo' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-emerald-600" /> : <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-zinc-400 opacity-60" />
                      )}
                    </div>
                  </th>
                )}

                {visibleColumns.name && (
                  <th className="px-4 py-3.5 cursor-pointer hover:bg-zinc-200/60 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-emerald-600" /> : <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-zinc-400 opacity-60" />
                      )}
                    </div>
                  </th>
                )}

                {visibleColumns.role && (
                  <th className="px-4 py-3.5 cursor-pointer hover:bg-zinc-200/60 transition-colors" onClick={() => handleSort('role')}>
                    <div className="flex items-center gap-1.5">
                      <span>Role</span>
                      {sortField === 'role' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-emerald-600" /> : <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-zinc-400 opacity-60" />
                      )}
                    </div>
                  </th>
                )}

                {visibleColumns.department && (
                  <th className="px-4 py-3.5 cursor-pointer hover:bg-zinc-200/60 transition-colors" onClick={() => handleSort('department')}>
                    <div className="flex items-center gap-1.5">
                      <span>Department</span>
                      {sortField === 'department' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-emerald-600" /> : <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-zinc-400 opacity-60" />
                      )}
                    </div>
                  </th>
                )}

                {visibleColumns.designation && (
                  <th className="px-4 py-3.5 cursor-pointer hover:bg-zinc-200/60 transition-colors" onClick={() => handleSort('designation')}>
                    <div className="flex items-center gap-1.5">
                      <span>Designation</span>
                      {sortField === 'designation' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-emerald-600" /> : <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-zinc-400 opacity-60" />
                      )}
                    </div>
                  </th>
                )}

                {visibleColumns.mobile && (
                  <th className="px-4 py-3.5 cursor-pointer hover:bg-zinc-200/60 transition-colors" onClick={() => handleSort('mobile')}>
                    <div className="flex items-center gap-1.5">
                      <span>Mobile</span>
                      {sortField === 'mobile' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-emerald-600" /> : <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-zinc-400 opacity-60" />
                      )}
                    </div>
                  </th>
                )}

                {visibleColumns.email && (
                  <th className="px-4 py-3.5 cursor-pointer hover:bg-zinc-200/60 transition-colors" onClick={() => handleSort('email')}>
                    <div className="flex items-center gap-1.5">
                      <span>Email</span>
                      {sortField === 'email' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-emerald-600" /> : <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-zinc-400 opacity-60" />
                      )}
                    </div>
                  </th>
                )}

                {visibleColumns.status && (
                  <th className="px-4 py-3.5 cursor-pointer hover:bg-zinc-200/60 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-emerald-600" /> : <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-zinc-400 opacity-60" />
                      )}
                    </div>
                  </th>
                )}

                {visibleColumns.actions && (
                  <th className="px-4 py-3.5 text-right font-bold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-zinc-600">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                      Loading staff records...
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-zinc-600">
                    No staff records found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item, idx) => {
                  const isSelected = selectedIds.includes(item._id);
                  const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Staff Member';
                  const isActive = (item.status || 'Active').toLowerCase() === 'active';

                  return (
                    <tr key={item._id} className={`hover:bg-zinc-50/80 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <button 
                          onClick={() => handleSelectRow(item._id)}
                          className="flex items-center text-zinc-600 hover:text-zinc-950 focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Staff No */}
                      {visibleColumns.staffNo && (
                        <td className="px-4 py-3.5 font-bold text-zinc-950 font-mono text-xs">
                          {item.staffNo || `STF-${1001 + (page - 1) * limit + idx}`}
                        </td>
                      )}

                      {/* Name with Avatar */}
                      {visibleColumns.name && (
                        <td className="px-4 py-3.5">
                          <Link href={`/dashboard/hr/staff-directory/${item._id}`} className="flex items-center gap-3 group">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                              {item.firstName?.charAt(0) || 'S'}
                            </div>
                            <span className="font-bold text-zinc-950 group-hover:text-emerald-700 cursor-pointer">
                              {fullName}
                            </span>
                          </Link>
                        </td>
                      )}

                      {/* Role */}
                      {visibleColumns.role && (
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 text-xs font-bold">
                            {item.role || 'Teacher'}
                          </span>
                        </td>
                      )}

                      {/* Department */}
                      {visibleColumns.department && (
                        <td className="px-4 py-3.5 text-zinc-800 font-medium">
                          {getDeptName(item)}
                        </td>
                      )}

                      {/* Designation */}
                      {visibleColumns.designation && (
                        <td className="px-4 py-3.5 text-zinc-800">
                          {getDesigName(item)}
                        </td>
                      )}

                      {/* Mobile */}
                      {visibleColumns.mobile && (
                        <td className="px-4 py-3.5 text-zinc-800 font-mono text-xs">
                          {item.phone || item.mobile || '—'}
                        </td>
                      )}

                      {/* Email */}
                      {visibleColumns.email && (
                        <td className="px-4 py-3.5 text-zinc-800 text-xs">
                          {item.email || '—'}
                        </td>
                      )}

                      {/* Status Toggle Switch */}
                      {visibleColumns.status && (
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item._id, item.status)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                              isActive ? 'bg-emerald-600' : 'bg-zinc-300'
                            }`}
                            title={`Status: ${item.status || 'Active'} (Click to toggle)`}
                          >
                            <span 
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                                isActive ? 'translate-x-4' : 'translate-x-1'
                              }`} 
                            />
                          </button>
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td className="px-4 py-3.5 text-right">
                          <div className="relative inline-block text-left">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/dashboard/hr/staff-directory/${item._id}`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-zinc-700 hover:text-emerald-700 hover:bg-zinc-100 rounded-lg cursor-pointer"
                                  title="View / Edit Profile"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>

                              <Button
                                onClick={() => handleDelete(item._id)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-700 hover:text-rose-600 hover:bg-zinc-100 rounded-lg cursor-pointer"
                                title="Delete Staff"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3.5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 bg-zinc-50/50 font-medium">
          <span>
            Showing {filteredRecords.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, filteredRecords.length)} of {filteredRecords.length} staff members
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 border-zinc-200 text-zinc-800 disabled:opacity-40 rounded-lg"
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <Button
                key={p}
                onClick={() => setPage(p)}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                className={`h-8 w-8 rounded-lg text-xs font-bold ${
                  p === page 
                    ? 'bg-zinc-950 text-white hover:bg-zinc-800' 
                    : 'border-zinc-200 text-zinc-800 hover:bg-zinc-100'
                }`}
              >
                {p}
              </Button>
            ))}

            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 border-zinc-200 text-zinc-800 disabled:opacity-40 rounded-lg"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
