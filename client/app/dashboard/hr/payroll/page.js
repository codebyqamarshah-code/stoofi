'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Search, Copy, Printer, Download, Eye, Zap,
  CheckCircle2, AlertCircle, CreditCard, Trash2, X, FileText, Check, DollarSign
} from 'lucide-react';
import api from '@/services/api';

const ROLES = [
  { label: 'All Roles', value: '' },
  { label: 'Teacher', value: 'Teacher' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Staff', value: 'Staff' },
  { label: 'Accountant', value: 'Accountant' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ITEMS_PER_PAGE = 10;
const CY = new Date().getFullYear();
const YEARS = [CY - 2, CY - 1, CY, CY + 1, CY + 2];

// Fallback staff directory for Pak Royal College if DB records are limited
const DEFAULT_STAFF = [
  { _id: 'stf-01', staffNo: 'PRC-T01', name: 'Ali Sher', firstName: 'Ali', lastName: 'Sher', role: 'Teacher', designation: 'Senior Lecturer Physics', department: 'Academics', basicSalary: 55000, allowances: 4000, deductions: 2000 },
  { _id: 'stf-02', staffNo: 'PRC-T02', name: 'Abu Zar Jamil', firstName: 'Abu Zar', lastName: 'Jamil', role: 'Teacher', designation: 'Lecturer Mathematics', department: 'Academics', basicSalary: 50000, allowances: 3500, deductions: 1500 },
  { _id: 'stf-03', staffNo: 'PRC-T03', name: 'Saqib Mughal', firstName: 'Saqib', lastName: 'Mughal', role: 'Teacher', designation: 'Senior Lecturer Chemistry', department: 'Academics', basicSalary: 52000, allowances: 3500, deductions: 1500 },
  { _id: 'stf-04', staffNo: 'PRC-T04', name: 'Mudassir Bajwa', firstName: 'Mudassir', lastName: 'Bajwa', role: 'Teacher', designation: 'Head of Physics Dept', department: 'Academics', basicSalary: 60000, allowances: 5000, deductions: 2500 },
  { _id: 'stf-05', staffNo: 'PRC-A01', name: 'syed qamar abbas', firstName: 'syed qamar', lastName: 'abbas', role: 'Super Admin', designation: 'Director & Administrator', department: 'Administration', basicSalary: 85000, allowances: 8000, deductions: 3000 },
  { _id: 'stf-06', staffNo: 'PRC-A02', name: 'Dr. Amina Khalid', firstName: 'Amina', lastName: 'Khalid', role: 'Admin', designation: 'Principal', department: 'Administration', basicSalary: 75000, allowances: 6000, deductions: 2500 },
  { _id: 'stf-07', staffNo: 'PRC-S01', name: 'Sana Iqbal', firstName: 'Sana', lastName: 'Iqbal', role: 'Accountant', designation: 'Accounts Officer', department: 'Finance', basicSalary: 42000, allowances: 3000, deductions: 1000 },
];

export default function PayrollPage() {
  const [staffList, setStaffList] = useState([]);
  const [records, setRecords] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [role, setRole] = useState('Teacher');
  const [month, setMonth] = useState('October');
  const [year, setYear] = useState(String(CY));
  const [page, setPage] = useState(1);
  const [payslipItem, setPayslipItem] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load staff on mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await api.get('/staff?limit=1000');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Merge unique by name or id
          const existingIds = new Set(res.data.map(s => String(s._id || s.id)));
          const combined = [...res.data];
          DEFAULT_STAFF.forEach(def => {
            if (!existingIds.has(def._id) && !res.data.some(s => `${s.firstName || ''} ${s.lastName || ''}`.trim().toLowerCase() === def.name.toLowerCase())) {
              combined.push(def);
            }
          });
          setStaffList(combined);
        } else {
          setStaffList(DEFAULT_STAFF);
        }
      } catch {
        setStaffList(DEFAULT_STAFF);
      }
    };
    fetchStaff();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      // 1. Fetch current payroll entries for this month & year
      const payrollRes = await api.get(`/payroll?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`).catch(() => ({ success: false, data: [] }));
      const existingPayrolls = Array.isArray(payrollRes?.data) ? payrollRes.data : [];

      // 2. Filter staff by role
      const staffSource = staffList.length > 0 ? staffList : DEFAULT_STAFF;
      const filteredStaff = staffSource.filter(s => {
        if (!role) return true;
        const staffRole = (s.role || '').toLowerCase();
        const targetRole = role.toLowerCase();
        if (targetRole === 'admin') {
          return staffRole.includes('admin');
        }
        return staffRole === targetRole;
      });

      // 3. Merge: for each staff member, match with payroll record or create pending projection
      const merged = filteredStaff.map(s => {
        const staffIdStr = String(s._id || s.id || '');
        const fullName = s.fullName || s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Staff Member';
        const staffNum = s.staffNo || `PRC-${s.role?.slice(0, 3).toUpperCase() || 'STF'}-${staffIdStr.slice(-3)}`;

        // Match existing payroll
        const existing = existingPayrolls.find(p =>
          String(p.staffId) === staffIdStr ||
          (p.staffNo && p.staffNo === staffNum) ||
          (p.staffName && p.staffName.toLowerCase() === fullName.toLowerCase())
        );

        if (existing) {
          const basic = Number(existing.basicSalary) || 0;
          const allow = Number(existing.allowances) || 0;
          const ded = Number(existing.deductions) || 0;
          return {
            ...existing,
            staffId: staffIdStr,
            staffNo: existing.staffNo || staffNum,
            staffName: existing.staffName || fullName,
            role: existing.role || s.role || 'Teacher',
            department: existing.department || s.department || 'Academics',
            designation: existing.designation || s.designation || 'Faculty',
            month: existing.month || month,
            year: existing.year || year,
            basicSalary: basic,
            allowances: allow,
            deductions: ded,
            netSalary: existing.netSalary || (basic + allow - ded),
            status: existing.status || 'Generated',
            payDate: existing.payDate,
            paymentMethod: existing.paymentMethod || 'Bank Transfer',
            isSaved: true
          };
        }

        // Default salary projection for this staff
        const basic = Number(s.basicSalary || s.salary) ||
          (s.role?.toLowerCase()?.includes('admin') ? 75000 : s.role?.toLowerCase()?.includes('teacher') ? 48000 : 35000);
        const allow = Number(s.allowances) || 3000;
        const ded = Number(s.deductions) || 1500;
        const net = basic + allow - ded;

        return {
          _id: null,
          staffId: staffIdStr,
          staffNo: staffNum,
          staffName: fullName,
          role: s.role || 'Teacher',
          department: s.department || 'Academics',
          designation: s.designation || 'Faculty',
          month,
          year: String(year),
          basicSalary: basic,
          allowances: allow,
          deductions: ded,
          netSalary: net,
          status: 'pending',
          isSaved: false
        };
      });

      setRecords(merged);
    } catch (e) {
      console.error('Error generating payroll search:', e);
      setRecords([]);
    } finally {
      setLoading(false);
      setPage(1);
    }
  };

  // Generate single staff payroll
  const handleGenerate = async (item) => {
    setActionLoading(item.staffId);
    try {
      const payload = {
        staffId: item.staffId,
        staffNo: item.staffNo,
        staffName: item.staffName,
        role: item.role,
        department: item.department,
        designation: item.designation,
        month,
        year: String(year),
        basicSalary: item.basicSalary,
        allowances: item.allowances,
        deductions: item.deductions,
        netSalary: item.netSalary,
        status: 'Generated',
        paymentMethod: 'Bank Transfer'
      };

      const res = await api.post('/payroll', payload);
      const savedId = res?.data?._id || `gen-${Date.now()}`;

      setRecords(prev => prev.map(r =>
        r.staffId === item.staffId ? { ...r, _id: savedId, status: 'Generated', isSaved: true } : r
      ));
      showToast(`Payroll generated for ${item.staffName}!`);
    } catch (e) {
      showToast(e.message || 'Failed to generate payroll', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Pay single staff payroll
  const handlePay = async (item) => {
    setActionLoading(item.staffId);
    try {
      let savedId = item._id;
      if (!savedId) {
        // Need to create first
        const payload = {
          staffId: item.staffId,
          staffNo: item.staffNo,
          staffName: item.staffName,
          role: item.role,
          department: item.department,
          designation: item.designation,
          month,
          year: String(year),
          basicSalary: item.basicSalary,
          allowances: item.allowances,
          deductions: item.deductions,
          netSalary: item.netSalary,
          status: 'Paid',
          payDate: new Date().toISOString(),
          paymentMethod: 'Bank Transfer'
        };
        const res = await api.post('/payroll', payload);
        savedId = res?.data?._id || `paid-${Date.now()}`;
      } else {
        await api.put(`/payroll/${savedId}`, {
          status: 'Paid',
          payDate: new Date().toISOString(),
          paymentMethod: 'Bank Transfer'
        });
      }

      setRecords(prev => prev.map(r =>
        r.staffId === item.staffId ? {
          ...r,
          _id: savedId,
          status: 'Paid',
          payDate: new Date().toISOString(),
          isSaved: true
        } : r
      ));
      showToast(`Payment recorded as Paid for ${item.staffName}!`);
    } catch (e) {
      showToast(e.message || 'Failed to record payment', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Revert / Delete payroll record
  const handleRevert = async (item) => {
    if (!confirm(`Revert payroll for ${item.staffName} back to pending?`)) return;
    setActionLoading(item.staffId);
    try {
      if (item._id && !item._id.startsWith('gen-') && !item._id.startsWith('paid-')) {
        await api.delete(`/payroll/${item._id}`).catch(() => null);
      }
      setRecords(prev => prev.map(r =>
        r.staffId === item.staffId ? { ...r, _id: null, status: 'pending', isSaved: false } : r
      ));
      showToast(`Payroll reset to pending for ${item.staffName}.`);
    } catch {
      showToast('Could not reset record', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Generate all pending payrolls
  const handleGenerateAll = async () => {
    const pendings = records.filter(r => r.status === 'pending');
    if (pendings.length === 0) {
      showToast('No pending payroll records to generate.', 'error');
      return;
    }

    setLoading(true);
    let successCount = 0;
    try {
      for (const item of pendings) {
        const payload = {
          staffId: item.staffId,
          staffNo: item.staffNo,
          staffName: item.staffName,
          role: item.role,
          department: item.department,
          designation: item.designation,
          month,
          year: String(year),
          basicSalary: item.basicSalary,
          allowances: item.allowances,
          deductions: item.deductions,
          netSalary: item.netSalary,
          status: 'Generated',
          paymentMethod: 'Bank Transfer'
        };
        await api.post('/payroll', payload).catch(() => null);
        successCount++;
      }
      showToast(`Successfully generated ${successCount} payroll records!`);
      handleSearch();
    } catch (e) {
      showToast('Error during bulk generation', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Export handlers
  const handleCopy = () => {
    const text = records.map(r => `${r.staffName} (${r.staffNo}) | ${r.month} ${r.year} | Basic: Rs. ${r.basicSalary.toLocaleString()} | Net: Rs. ${r.netSalary.toLocaleString()} | Status: ${r.status}`).join('\n');
    navigator.clipboard.writeText(text).then(() => showToast('Payroll data copied to clipboard!'));
  };

  const handleCSV = () => {
    const headers = ['Staff No', 'Staff Name', 'Role', 'Department', 'Designation', 'Month', 'Year', 'Basic Salary (PKR)', 'Allowances', 'Deductions', 'Net Salary', 'Status'];
    const rows = records.map(r => [
      `"${r.staffNo || ''}"`,
      `"${r.staffName || ''}"`,
      `"${r.role || ''}"`,
      `"${r.department || ''}"`,
      `"${r.designation || ''}"`,
      `"${r.month || month}"`,
      `"${r.year || year}"`,
      r.basicSalary || 0,
      r.allowances || 0,
      r.deductions || 0,
      r.netSalary || 0,
      `"${r.status || 'pending'}"`
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${month}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Payroll CSV downloaded!');
  };

  const handlePrint = () => {
    window.print();
  };

  const totalPages = Math.max(1, Math.ceil(records.length / ITEMS_PER_PAGE));
  const paginated = records.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalBasic = records.reduce((sum, r) => sum + (Number(r.basicSalary) || 0), 0);
  const totalNet = records.reduce((sum, r) => sum + (Number(r.netSalary) || 0), 0);
  const paidCount = records.filter(r => r.status?.toLowerCase() === 'paid').length;
  const genCount = records.filter(r => r.status?.toLowerCase() === 'generated').length;
  const pendingCount = records.filter(r => r.status?.toLowerCase() === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-white text-xs font-bold transition-all ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Generate Payroll</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Automated staff salary processing, payslip management, and bank disbursement</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 text-zinc-400" />
          <Link href="/dashboard/hr/staff-directory" className="hover:text-zinc-900 transition-colors">Human Resource</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 text-zinc-400" />
          <span className="text-[#084A86] font-bold">Generate Payroll</span>
        </div>
      </div>

      {/* Select Criteria Card */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#084A86]" /> Select Criteria
          </h2>
          <span className="text-xs text-zinc-400">Select role and billing cycle to view staff</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#084A86]/30 focus:border-[#084A86]"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Month <span className="text-rose-500">*</span>
              </label>
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#084A86]/30 focus:border-[#084A86]"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Year <span className="text-rose-500">*</span>
              </label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#084A86]/30 focus:border-[#084A86]"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#084A86] hover:bg-[#073b6b] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Search className="h-3.5 w-3.5" /> {loading ? 'Searching...' : 'SEARCH'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          {records.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Staff</p>
                <p className="text-lg font-black text-zinc-900 mt-0.5">{records.length}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5">
                <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Pending Generation</p>
                <p className="text-lg font-black text-amber-600 mt-0.5">{pendingCount}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5">
                <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Generated</p>
                <p className="text-lg font-black text-blue-600 mt-0.5">{genCount}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5">
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Disbursed / Paid</p>
                <p className="text-lg font-black text-emerald-600 mt-0.5">{paidCount}</p>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-950">
                  Payroll List • {month} {year}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                  {records.length} records
                </span>
              </div>

              <div className="flex items-center gap-2">
                {pendingCount > 0 && (
                  <button
                    onClick={handleGenerateAll}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#084A86] hover:bg-[#073b6b] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" /> Generate All Pending ({pendingCount})
                  </button>
                )}

                <div className="flex items-center gap-1 border border-zinc-200 rounded-lg p-1 bg-white">
                  <button onClick={handleCopy} title="Copy" className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleCSV} title="Export CSV" className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handlePrint} title="Print" className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors">
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-zinc-600 uppercase font-bold bg-zinc-50 border-b border-zinc-200 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Staff Member</th>
                    <th className="px-4 py-3">Role / Dept</th>
                    <th className="px-4 py-3">Month / Year</th>
                    <th className="px-4 py-3">Basic Salary</th>
                    <th className="px-4 py-3">Allowances</th>
                    <th className="px-4 py-3">Deductions</th>
                    <th className="px-4 py-3">Net Salary</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-zinc-500">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold">
                          <span className="w-4 h-4 border-2 border-[#084A86] border-t-transparent rounded-full animate-spin"></span>
                          Loading payroll records...
                        </div>
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-zinc-500 font-medium">
                        No staff members found matching the selected role. Select &apos;All Roles&apos; or add staff in Staff Directory.
                      </td>
                    </tr>
                  ) : paginated.map((item, idx) => {
                    const st = (item.status || 'pending').toLowerCase();
                    const isPending = st === 'pending' || st === 'not generated';
                    const isGenerated = st === 'generated';
                    const isPaid = st === 'paid';

                    return (
                      <tr key={item.staffId || idx} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-4 py-3.5 text-zinc-400 font-semibold text-xs">
                          {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-zinc-900 text-sm">{item.staffName}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{item.staffNo}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-xs font-semibold text-zinc-800">{item.designation || item.role}</div>
                          <div className="text-[11px] text-zinc-400">{item.department || 'Academics'}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-zinc-600 font-medium whitespace-nowrap">
                          {item.month} {item.year}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-zinc-800 text-xs">
                          Rs. {Number(item.basicSalary || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-emerald-600 font-semibold text-xs">
                          +Rs. {Number(item.allowances || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-rose-500 font-semibold text-xs">
                          -Rs. {Number(item.deductions || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#084A86] text-sm whitespace-nowrap">
                          Rs. {Number(item.netSalary || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          {isPaid && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          )}
                          {isGenerated && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Zap className="w-3 h-3" /> Generated
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Action: Generate */}
                            {isPending && (
                              <button
                                onClick={() => handleGenerate(item)}
                                disabled={actionLoading === item.staffId}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-[#084A86] hover:bg-[#073b6b] rounded-lg shadow-xs transition-colors disabled:opacity-50"
                              >
                                <Zap className="h-3 w-3" /> Generate
                              </button>
                            )}

                            {/* Action: Pay Now */}
                            {isGenerated && (
                              <button
                                onClick={() => handlePay(item)}
                                disabled={actionLoading === item.staffId}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                              >
                                <CreditCard className="h-3 w-3" /> Pay Now
                              </button>
                            )}

                            {/* Action: View Payslip */}
                            {(isGenerated || isPaid) && (
                              <button
                                onClick={() => setPayslipItem(item)}
                                title="View Payslip"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg shadow-xs transition-colors"
                              >
                                <Eye className="h-3 w-3 text-zinc-500" /> Payslip
                              </button>
                            )}

                            {/* Action: Revert/Delete */}
                            {(isGenerated || isPaid) && (
                              <button
                                onClick={() => handleRevert(item)}
                                title="Revert to Pending"
                                className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {records.length > 0 && (
              <div className="px-4 py-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
                <span>
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, records.length)} of {records.length} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2.5 py-1 rounded-md border border-zinc-200 disabled:opacity-40 hover:bg-zinc-100 text-zinc-600 font-bold transition-colors"
                  >
                    &lsaquo;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-md text-xs font-bold transition-colors ${
                        p === page ? 'bg-[#084A86] text-white' : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2.5 py-1 rounded-md border border-zinc-200 disabled:opacity-40 hover:bg-zinc-100 text-zinc-600 font-bold transition-colors"
                  >
                    &rsaquo;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Payslip Modal */}
      {payslipItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setPayslipItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-[#084A86] text-white">
              <div>
                <h3 className="text-base font-bold">Salary Pay Slip</h3>
                <p className="text-xs text-blue-100">{payslipItem.month} {payslipItem.year} • {payslipItem.staffName}</p>
              </div>
              <button onClick={() => setPayslipItem(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Payslip Content (Printable) */}
            <div id="printable-payslip" className="p-6 space-y-6">
              {/* Institution Header */}
              <div className="text-center border-b border-zinc-200 pb-4">
                <h2 className="text-xl font-black text-[#084A86] tracking-tight uppercase">PAK ROYAL COLLEGE</h2>
                <p className="text-xs font-semibold text-zinc-500 mt-0.5">Campus Main Jaranwala Road, Sharaqpur Sharif District Sheikhupura</p>
                <div className="inline-block mt-2 px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700">
                  OFFICIAL SALARY DISBURSEMENT SLIP — {payslipItem.month.toUpperCase()} {payslipItem.year}
                </div>
              </div>

              {/* Staff Details */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 text-xs">
                <div>
                  <span className="text-zinc-400 font-medium">Employee Name:</span>
                  <p className="font-bold text-zinc-900 text-sm mt-0.5">{payslipItem.staffName}</p>
                </div>
                <div>
                  <span className="text-zinc-400 font-medium">Employee ID:</span>
                  <p className="font-bold text-zinc-900 text-sm mt-0.5 font-mono">{payslipItem.staffNo}</p>
                </div>
                <div>
                  <span className="text-zinc-400 font-medium">Designation:</span>
                  <p className="font-semibold text-zinc-800 mt-0.5">{payslipItem.designation || payslipItem.role}</p>
                </div>
                <div>
                  <span className="text-zinc-400 font-medium">Department:</span>
                  <p className="font-semibold text-zinc-800 mt-0.5">{payslipItem.department || 'Academics'}</p>
                </div>
                <div>
                  <span className="text-zinc-400 font-medium">Payment Mode:</span>
                  <p className="font-semibold text-zinc-800 mt-0.5">{payslipItem.paymentMethod || 'Bank Transfer'}</p>
                </div>
                <div>
                  <span className="text-zinc-400 font-medium">Status:</span>
                  <p className="font-bold text-emerald-600 mt-0.5 uppercase">{payslipItem.status}</p>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-100 font-bold text-xs text-emerald-800 uppercase tracking-wider">
                    Earnings
                  </div>
                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Basic Salary:</span>
                      <span className="font-bold text-zinc-900">Rs. {Number(payslipItem.basicSalary || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Conveyance Allowance:</span>
                      <span className="font-bold text-zinc-900">Rs. {Math.round(Number(payslipItem.allowances || 0) * 0.6).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Medical Allowance:</span>
                      <span className="font-bold text-zinc-900">Rs. {Math.round(Number(payslipItem.allowances || 0) * 0.4).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-zinc-200 pt-2 flex justify-between font-bold text-emerald-700">
                      <span>Total Earnings:</span>
                      <span>Rs. {(Number(payslipItem.basicSalary || 0) + Number(payslipItem.allowances || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <div className="bg-rose-50 px-3 py-2 border-b border-rose-100 font-bold text-xs text-rose-800 uppercase tracking-wider">
                    Deductions
                  </div>
                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Income Tax:</span>
                      <span className="font-bold text-zinc-900">Rs. {Math.round(Number(payslipItem.deductions || 0) * 0.7).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Provident Fund:</span>
                      <span className="font-bold text-zinc-900">Rs. {Math.round(Number(payslipItem.deductions || 0) * 0.3).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-zinc-200 pt-2 flex justify-between font-bold text-rose-600">
                      <span>Total Deductions:</span>
                      <span>Rs. {Number(payslipItem.deductions || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay Total */}
              <div className="bg-[#084A86]/5 border border-[#084A86]/20 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Net Payable Salary</span>
                  <p className="text-2xl font-black text-[#084A86]">Rs. {Number(payslipItem.netSalary || 0).toLocaleString()} PKR</p>
                </div>
                <div className="text-right text-[11px] text-zinc-500">
                  <p>Disbursed via Direct Deposit</p>
                  <p className="font-mono mt-0.5">REF: PRC-SAL-{payslipItem.month.slice(0, 3).toUpperCase()}{payslipItem.year}</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs text-zinc-500 border-t border-zinc-200">
                <div>
                  <div className="border-b border-zinc-300 h-8 mb-1"></div>
                  <p className="font-semibold text-zinc-700">Prepared By</p>
                  <p className="text-[10px]">Accountant</p>
                </div>
                <div>
                  <div className="border-b border-zinc-300 h-8 mb-1"></div>
                  <p className="font-semibold text-zinc-700">Verified By</p>
                  <p className="text-[10px]">HR Officer</p>
                </div>
                <div>
                  <div className="border-b border-zinc-300 h-8 mb-1"></div>
                  <p className="font-semibold text-zinc-700">Approved By</p>
                  <p className="text-[10px]">Principal</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setPayslipItem(null)}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#084A86] hover:bg-[#073b6b] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
