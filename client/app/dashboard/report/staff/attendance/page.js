'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, FileText, 
  CalendarCheck, RefreshCw, Users, CheckCircle2, Clock, AlertCircle, Building, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StaffAttendanceReportPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [month, setMonth] = useState('2026-10');
  const [records, setRecords] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter && roleFilter !== 'All') params.set('role', roleFilter);
      if (month) params.set('month', month);

      const res = await fetch(`/api/report/staff/attendance?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data || []);
        setMetrics(json.metrics || null);
      }
    } catch (e) {
      console.error('Failed to load staff attendance report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [roleFilter, month]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Staff ID', 'Staff Name', 'Role', 'Department', 'Designation', 'Phone', 'Total Days', 'Present', 'Absent', 'Leave', 'Late', 'Percentage', 'Status'];
    const rows = records.map(r => [
      r.staffNo,
      `"${r.name}"`,
      r.role,
      `"${r.department}"`,
      `"${r.designation}"`,
      r.phone,
      r.totalDays,
      r.presentDays,
      r.absentDays,
      r.leaveDays,
      r.lateDays,
      `${r.percentage}%`,
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_Attendance_Report_${month}.csv`);
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
            <span className="text-[#084A86] font-bold">Attendance Report</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-[#084A86]" />
            Staff &amp; Faculty Monthly Attendance Report
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Punctuality metrics, working days summary, and department attendance averages • Pak Royal College Sharaqpur
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
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Monthly Register
          </Button>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6 text-center">
        <h2 className="text-xl font-black uppercase tracking-wider text-zinc-950">PAK ROYAL COLLEGE SHARAQPUR SHARIF</h2>
        <p className="text-xs text-zinc-600 font-medium">Affiliated with PBTE, Punjab University &amp; Pharmacy Council of Pakistan</p>
        <h3 className="text-sm font-bold text-zinc-900 mt-2 uppercase tracking-wide underline">
          Staff &amp; Faculty Monthly Attendance Audit Sheet — Month: {month}
        </h3>
      </div>

      {/* Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Overall College Attendance</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {metrics.overallPercentage}%
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              High punctuality benchmark
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Total Staff Members</span>
            <span className="text-2xl font-black text-zinc-950 mt-1 block">
              {metrics.totalStaff} Employed
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              Faculty &amp; administrative staff
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Present On Duty</span>
            <span className="text-2xl font-black text-zinc-950 mt-1 block">
              {metrics.presentToday} Present
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              Regular active duty
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Approved Leave</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {metrics.onLeaveToday} Staff
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              Casual &amp; medical leaves
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs print:hidden space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs font-bold text-zinc-700">Attendance Month</Label>
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
              <option value="Principal">Executive Leadership</option>
              <option value="Staff">Support &amp; Technical Staff</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Search Staff</Label>
            <div className="flex items-center gap-1.5 mt-1">
              <Input
                type="text"
                placeholder="Search by name, ID, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAttendance()}
                className="text-xs h-9 bg-zinc-50 border-zinc-200"
              />
              <Button
                size="sm"
                onClick={fetchAttendance}
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
            <span className="font-extrabold text-sm text-zinc-900">Monthly Attendance Summary List</span>
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
                <th className="px-4 py-3.5">Staff ID</th>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Department &amp; Designation</th>
                <th className="px-4 py-3.5 text-center">Working Days</th>
                <th className="px-4 py-3.5 text-center">Present</th>
                <th className="px-4 py-3.5 text-center">Absent</th>
                <th className="px-4 py-3.5 text-center">Leave</th>
                <th className="px-4 py-3.5 text-center">Late</th>
                <th className="px-4 py-3.5 text-right">Attendance %</th>
                <th className="px-4 py-3.5 text-center">Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-500 font-medium">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#084A86] mb-2" />
                    Loading staff attendance records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-500">
                    No staff attendance records matching selected criteria.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-700">{r.staffNo}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-zinc-950">{r.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{r.phone}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-zinc-800">{r.designation}</div>
                      <div className="text-[11px] text-zinc-500">{r.department}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-zinc-700">{r.totalDays}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-emerald-600">{r.presentDays}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-rose-600">{r.absentDays}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-amber-600">{r.leaveDays}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-zinc-500">{r.lateDays}</td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-zinc-950 text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <span>{r.percentage}%</span>
                        <div className="w-12 bg-zinc-200 rounded-full h-1.5 hidden sm:block">
                          <div 
                            className={`h-1.5 rounded-full ${
                              r.percentage >= 90 ? 'bg-emerald-600' : r.percentage >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${r.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Excellent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'Good'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.status}
                      </span>
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
          <div className="border-b border-zinc-400 pb-1 mb-1">Prepared By</div>
          <span className="text-[10px] text-zinc-500">Biometric &amp; Attendance Officer</span>
        </div>
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Verified By</div>
          <span className="text-[10px] text-zinc-500">Registrar &amp; HR Department</span>
        </div>
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Approved By</div>
          <span className="text-[10px] text-zinc-500">Principal, Pak Royal College</span>
        </div>
      </div>
    </div>
  );
}
