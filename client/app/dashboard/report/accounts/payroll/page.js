'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, FileText, 
  Banknote, RefreshCw, Filter, CheckCircle2, Clock, AlertCircle, Building, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AccountsPayrollReportPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [month, setMonth] = useState('2026-10');
  const [records, setRecords] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter && roleFilter !== 'All') params.set('role', roleFilter);
      if (departmentFilter && departmentFilter !== 'All') params.set('department', departmentFilter);
      if (month) params.set('month', month);

      const res = await fetch(`/api/report/accounts/payroll?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data || []);
        setMetrics(json.metrics || null);
      }
    } catch (e) {
      console.error('Failed to fetch accounts payroll:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [roleFilter, departmentFilter, month]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Voucher No', 'Staff ID', 'Staff Name', 'Role', 'Department', 'Month', 'Basic Salary (PKR)', 'Allowances (PKR)', 'Gross (PKR)', 'Deductions (PKR)', 'Net Salary (PKR)', 'Status', 'Payment Method', 'Payment Date'];
    const rows = records.map(r => [
      r.voucherNo,
      r.staffNo,
      `"${r.name}"`,
      r.role,
      `"${r.department}"`,
      r.month,
      r.basicSalary,
      r.allowances,
      r.grossSalary,
      r.deductions,
      r.netSalary,
      r.status,
      r.paymentMethod,
      r.payDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Accounts_Payroll_Report_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/dashboard/report/accounts" className="hover:text-zinc-600">Accounts Report</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#084A86] font-bold">Payroll Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <Banknote className="h-6 w-6 text-[#084A86]" />
            Faculty &amp; Staff Monthly Payroll Register
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Verified salary disbursements, tax deductions, and net compensation records • Pak Royal College Sharaqpur
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-xs font-semibold h-9 border-zinc-200 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-[#084A86]" /> Export CSV
          </Button>
          <Button
            onClick={handlePrint}
            size="sm"
            className="text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Official Register
          </Button>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6 text-center">
        <h2 className="text-xl font-black uppercase tracking-wider text-zinc-950">PAK ROYAL COLLEGE SHARAQPUR SHARIF</h2>
        <p className="text-xs text-zinc-600 font-medium">Affiliated with PBTE, Punjab University &amp; Pharmacy Council of Pakistan</p>
        <h3 className="text-sm font-bold text-zinc-900 mt-2 uppercase tracking-wide underline">
          Faculty &amp; Staff Monthly Payroll Disbursement Ledger — Month: {month}
        </h3>
      </div>

      {/* Financial Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Total Net Disbursed</span>
            <span className="text-2xl font-black text-zinc-950 mt-1 block">
              PKR {metrics.totalDisbursedNet.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              {metrics.paidCount} staff paid successfully
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Gross Salary Obligation</span>
            <span className="text-2xl font-black text-zinc-950 mt-1 block">
              PKR {metrics.totalGross.toLocaleString()}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              Allowances: PKR {metrics.totalAllowances.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Tax &amp; EOBI Deductions</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              PKR {metrics.totalDeductions.toLocaleString()}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              Withholding tax &amp; provident fund
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Total Staff on Payroll</span>
            <span className="text-2xl font-black text-zinc-950 mt-1 block">
              {metrics.totalStaff} Members
            </span>
            <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
              {metrics.processingCount > 0 ? `${metrics.processingCount} Processing` : 'All Disbursed'}
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs print:hidden space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-bold text-zinc-700">Billing Month</Label>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 text-xs h-9 bg-zinc-50 border-zinc-200"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Role Filter</Label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3"
            >
              <option value="All">All Roles</option>
              <option value="Teacher">Faculty / Teacher</option>
              <option value="Admin">Administration</option>
              <option value="Accountant">Finance / Accountant</option>
              <option value="Principal">Principal / Executive</option>
              <option value="Staff">Support / Technical Staff</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Department</Label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3"
            >
              <option value="All">All Departments</option>
              <option value="Allied Health Sciences">Allied Health Sciences (OTT)</option>
              <option value="Behavioral Sciences & Psychology">Psychology Department</option>
              <option value="Radiology & Imaging">Radiology (BS RIT)</option>
              <option value="Nursing & Patient Care">Nursing Department</option>
              <option value="Finance & Accounts">Finance &amp; Accounts</option>
              <option value="Academic Operations">Academic Operations</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Keyword Search</Label>
            <div className="flex items-center gap-1.5 mt-1">
              <Input
                type="text"
                placeholder="Search staff, ID, voucher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPayroll()}
                className="text-xs h-9 bg-zinc-50 border-zinc-200"
              />
              <Button
                size="sm"
                onClick={fetchPayroll}
                className="h-9 px-3 bg-[#084A86] hover:bg-[#073d6e] text-white shrink-0 text-xs"
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Payroll Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-zinc-900">Monthly Payroll Disbursement Records</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
              {records.length} Staff
            </span>
          </div>
          {loading && <RefreshCw className="h-4 w-4 animate-spin text-[#084A86]" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-600 font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Voucher</th>
                <th className="px-4 py-3.5">Staff Details</th>
                <th className="px-4 py-3.5">Department &amp; Designation</th>
                <th className="px-4 py-3.5 text-right">Basic Pay</th>
                <th className="px-4 py-3.5 text-right">Allowances</th>
                <th className="px-4 py-3.5 text-right">Deductions</th>
                <th className="px-4 py-3.5 text-right">Net Payable</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right print:hidden">Disbursed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500 font-medium">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#084A86] mb-2" />
                    Loading official payroll records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    No payroll records matching selected criteria.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-700">{r.voucherNo}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-zinc-950">{r.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{r.staffNo} • {r.role}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-zinc-800">{r.designation}</div>
                      <div className="text-[11px] text-zinc-500">{r.department}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium">PKR {r.basicSalary.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-emerald-700">+PKR {r.allowances.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-rose-600">-PKR {r.deductions.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-zinc-950 text-sm">
                      PKR {r.netSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-zinc-500 print:hidden font-mono text-[11px]">
                      {r.payDate}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures Section for Printing */}
      <div className="hidden print:grid grid-cols-3 gap-8 pt-16 mt-8 border-t border-zinc-300 text-xs text-center font-bold text-zinc-800">
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Prepared By (Accountant)</div>
          <span className="text-[10px] text-zinc-500">Finance &amp; Accounts Office</span>
        </div>
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Audited By (Bursar)</div>
          <span className="text-[10px] text-zinc-500">Internal Audit &amp; Compliance</span>
        </div>
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Approved By (Principal)</div>
          <span className="text-[10px] text-zinc-500">Pak Royal College Sharaqpur</span>
        </div>
      </div>
    </div>
  );
}
