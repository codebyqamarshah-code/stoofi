'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, FileText, 
  Banknote, RefreshCw, Filter, CheckCircle2, Clock, Eye, X, Building, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StaffPayrollReportPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [month, setMonth] = useState('2026-10');
  const [records, setRecords] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);

  const fetchStaffPayroll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter && roleFilter !== 'All') params.set('role', roleFilter);
      if (statusFilter && statusFilter !== 'All') params.set('status', statusFilter);
      if (month) params.set('month', month);

      const res = await fetch(`/api/report/staff/payroll?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data || []);
        setMetrics(json.metrics || null);
      }
    } catch (e) {
      console.error('Failed to load staff payroll report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffPayroll();
  }, [roleFilter, statusFilter, month]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Slip No', 'Staff ID', 'Staff Name', 'Role', 'Department', 'Designation', 'Month', 'Basic Pay (PKR)', 'House Rent (PKR)', 'Medical Allowance (PKR)', 'Gross Pay (PKR)', 'Tax (PKR)', 'EOBI (PKR)', 'Total Deductions (PKR)', 'Net Salary (PKR)', 'Status', 'Disbursed Date'];
    const rows = records.map(r => [
      r.slipNo,
      r.staffNo,
      `"${r.name}"`,
      r.role,
      `"${r.department}"`,
      `"${r.designation}"`,
      r.month,
      r.basicSalary,
      r.houseRent,
      r.medicalAllowance,
      r.grossSalary,
      r.incomeTax,
      r.eobi,
      r.deductions,
      r.netSalary,
      r.status,
      r.paymentDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_Payroll_Report_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/dashboard/report/staff" className="hover:text-zinc-600">Staff Report</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#084A86] font-bold">Payroll Report</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <Banknote className="h-6 w-6 text-[#084A86]" />
            Staff Compensation &amp; Salary Ledger
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Individual payslip registers, allowance breakdowns, and tax deduction statements • Pak Royal College Sharaqpur
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
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Monthly Ledger
          </Button>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6 text-center">
        <h2 className="text-xl font-black uppercase tracking-wider text-zinc-950">PAK ROYAL COLLEGE SHARAQPUR SHARIF</h2>
        <p className="text-xs text-zinc-600 font-medium">Affiliated with PBTE, Punjab University &amp; Pharmacy Council of Pakistan</p>
        <h3 className="text-sm font-bold text-zinc-900 mt-2 uppercase tracking-wide underline">
          Staff Compensation &amp; Salary Disbursement Register — Month: {month}
        </h3>
      </div>

      {/* Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Total Payroll Budget</span>
            <span className="text-2xl font-black text-zinc-950 mt-1 block">
              PKR {metrics.totalBudget.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              {metrics.paidCount} Staff Disbursed
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Average Monthly Salary</span>
            <span className="text-2xl font-black text-zinc-950 mt-1 block">
              PKR {metrics.avgSalary.toLocaleString()}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              Per faculty / staff member
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Paid Staff</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {metrics.paidCount} Members
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              Bank transfers completed
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Pending Disbursals</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {metrics.pendingCount} Pending
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              Processing in finance office
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs print:hidden space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-bold text-zinc-700">Salary Month</Label>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 text-xs h-9 bg-zinc-50 border-zinc-200"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Filter By Role</Label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3"
            >
              <option value="All">All Roles</option>
              <option value="Teacher">Faculty / Teachers</option>
              <option value="Admin">Administration</option>
              <option value="Accountant">Finance / Accounts</option>
              <option value="Staff">Support / Technical Staff</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Payment Status</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid Only</option>
              <option value="Pending">Pending Only</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Search Staff</Label>
            <div className="flex items-center gap-1.5 mt-1">
              <Input
                type="text"
                placeholder="Search by name, ID, slip..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStaffPayroll()}
                className="text-xs h-9 bg-zinc-50 border-zinc-200"
              />
              <Button
                size="sm"
                onClick={fetchStaffPayroll}
                className="h-9 px-3 bg-[#084A86] hover:bg-[#073d6e] text-white shrink-0 text-xs"
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-zinc-900">Staff Compensation Register</span>
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
                <th className="px-4 py-3.5">Slip No</th>
                <th className="px-4 py-3.5">Staff Details</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5 text-right">Basic Pay</th>
                <th className="px-4 py-3.5 text-right">Allowances</th>
                <th className="px-4 py-3.5 text-right">Gross Pay</th>
                <th className="px-4 py-3.5 text-right">Deductions</th>
                <th className="px-4 py-3.5 text-right">Net Salary</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-500 font-medium">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#084A86] mb-2" />
                    Loading staff compensation records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-500">
                    No staff payroll records matching selected criteria.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-700">{r.slipNo}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-zinc-950">{r.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{r.staffNo} • {r.designation}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-zinc-700">{r.department}</td>
                    <td className="px-4 py-3.5 text-right font-medium">PKR {r.basicSalary.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-emerald-700">+PKR {r.allowances.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-zinc-800">PKR {r.grossSalary.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-rose-600">-PKR {r.deductions.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-zinc-950 text-sm">
                      PKR {r.netSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center print:hidden">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSlip(r)}
                        className="text-xs h-7 px-2 border-zinc-200 hover:bg-zinc-100 flex items-center gap-1 mx-auto"
                      >
                        <Eye className="h-3 w-3 text-[#084A86]" /> Slip
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip View Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-zinc-200 pb-3 text-center">
              <h3 className="text-base font-black text-zinc-950 uppercase tracking-wide">PAK ROYAL COLLEGE</h3>
              <p className="text-xs text-zinc-500">Official Monthly Staff Salary Pay Slip</p>
              <span className="inline-block mt-2 font-mono text-xs font-bold bg-zinc-100 text-zinc-800 px-2.5 py-0.5 rounded">
                {selectedSlip.slipNo} — Month: {selectedSlip.month}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px]">Employee Name</span>
                <span className="font-bold text-zinc-900">{selectedSlip.name}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Staff Code / ID</span>
                <span className="font-bold text-zinc-900 font-mono">{selectedSlip.staffNo}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Department</span>
                <span className="font-medium text-zinc-800">{selectedSlip.department}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Designation</span>
                <span className="font-medium text-zinc-800">{selectedSlip.designation}</span>
              </div>
            </div>

            <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-zinc-50 p-2 font-bold text-zinc-700 uppercase text-[10px] border-b border-zinc-200">
                Earnings &amp; Deductions Breakdown
              </div>
              <div className="p-3 space-y-1.5">
                <div className="flex justify-between py-0.5">
                  <span className="text-zinc-600">Basic Pay</span>
                  <span className="font-bold">PKR {selectedSlip.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-zinc-600">House Rent Allowance</span>
                  <span className="font-medium text-emerald-700">+PKR {selectedSlip.houseRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-zinc-600">Medical Allowance</span>
                  <span className="font-medium text-emerald-700">+PKR {selectedSlip.medicalAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-0.5 border-t border-zinc-100 font-bold">
                  <span>Gross Salary</span>
                  <span>PKR {selectedSlip.grossSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-0.5 text-rose-600">
                  <span>Income Tax Withholding</span>
                  <span>-PKR {selectedSlip.incomeTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-0.5 text-rose-600">
                  <span>EOBI &amp; Fund</span>
                  <span>-PKR {selectedSlip.eobi.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-t-2 border-zinc-900 font-black text-sm text-zinc-950">
                  <span>Net Disbursed Salary</span>
                  <span>PKR {selectedSlip.netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-zinc-500">
                Payment: <strong className="text-zinc-800">{selectedSlip.paymentMethod}</strong> ({selectedSlip.bankName})
              </div>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-[#084A86] hover:bg-[#073d6e] text-white text-xs h-8 font-semibold"
              >
                <Printer className="h-3 w-3 mr-1" /> Print Slip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Official Signatures Section for Printing */}
      <div className="hidden print:grid grid-cols-3 gap-8 pt-16 mt-8 border-t border-zinc-300 text-xs text-center font-bold text-zinc-800">
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Payroll Accountant</div>
          <span className="text-[10px] text-zinc-500">Accounts &amp; Disbursements</span>
        </div>
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Bursar / Internal Audit</div>
          <span className="text-[10px] text-zinc-500">Audit &amp; Reconciliation</span>
        </div>
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Principal / Registrar</div>
          <span className="text-[10px] text-zinc-500">Pak Royal College Sharaqpur</span>
        </div>
      </div>
    </div>
  );
}
