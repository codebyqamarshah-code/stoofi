'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, Users, 
  Briefcase, School, Phone, Mail, RefreshCw, CheckCircle2, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEPARTMENTS = ['All', 'Operation Theater (OTT)', 'Radiology & Imaging', 'Clinical Psychology', 'Nursing Sciences', 'Administration & Management', 'Accounts & Finance', 'Library & Research'];
const ROLES = ['All', 'Faculty / Teacher', 'Administrative', 'Head of Department', 'Principal / Management'];

export default function StaffDirectoryReportPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [records, setRecords] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (deptFilter !== 'All') params.set('department', deptFilter);
      if (roleFilter !== 'All') params.set('role', roleFilter);

      const res = await fetch(`/api/report/staff/directory?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data || []);
        setMetrics(json.metrics || null);
      }
    } catch (e) {
      console.error('Failed to load staff directory report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [deptFilter, roleFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Staff ID', 'Full Name', 'Father Name', 'Role', 'Designation', 'Department', 'Qualification', 'Joining Date', 'Experience (Yrs)', 'Contract Type', 'Basic Salary (PKR)', 'Phone', 'Email', 'Emergency Contact', 'Status'];
    const rows = records.map(r => [
      r.staffId,
      `"${r.name}"`,
      `"${r.fatherName}"`,
      r.role,
      `"${r.designation}"`,
      `"${r.department}"`,
      `"${r.qualification}"`,
      r.joiningDate,
      r.experienceYears,
      r.contractType,
      r.basicSalary,
      r.phone,
      r.email,
      r.emergencyContact,
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StaffDirectory_PRC_${new Date().toISOString().split('T')[0]}.csv`);
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
            <span className="text-[#084A86] font-bold">Staff Directory &amp; Roster</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#084A86]" />
            Faculty &amp; Staff Institutional Directory Register
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Complete employee profiles, academic qualifications, departmental deployment, and emergency contacts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-xs font-semibold h-9 border-zinc-200 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-[#084A86]" /> Export Roster CSV
          </Button>
          <Button
            onClick={handlePrint}
            size="sm"
            className="text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Staff Directory
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-600 uppercase">Department</Label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-600 uppercase">Role / Cadre</Label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-600 uppercase">Search Employee</Label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search name, staff ID, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStaff()}
                className="pl-8 text-xs bg-zinc-50 border-zinc-200 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={fetchStaff}
              className="w-full text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white flex items-center justify-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" /> Filter Staff
            </Button>
            <Button
              onClick={() => { setSearch(''); setDeptFilter('All'); setRoleFilter('All'); }}
              variant="outline"
              size="icon"
              className="h-9 w-9 border-zinc-200"
              title="Reset Filters"
            >
              <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Headcount</span>
            <p className="text-xl font-black text-zinc-950 mt-1">{metrics.totalStaff} Employees</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Active verified personnel</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-[#084A86] uppercase">Teaching &amp; Faculty</span>
            <p className="text-xl font-black text-[#084A86] mt-1">{metrics.teachingStaff} Faculty</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Professors, lecturers, instructors</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 uppercase">Administrative Cadre</span>
            <p className="text-xl font-black text-amber-700 mt-1">{metrics.adminStaff} Officers</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Accounts, library, operations</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">Total Salary Budget</span>
            <p className="text-xl font-black text-emerald-700 mt-1">
              PKR {metrics.totalPayrollBudget.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Monthly basic payroll obligation</p>
          </div>
        </div>
      )}

      {/* Main Staff Roster Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden print:border-none print:shadow-none">
        {/* Printable Official College Header */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 print:bg-white text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <School className="h-6 w-6 text-[#084A86]" />
            <h2 className="text-xl font-black text-zinc-950 uppercase tracking-wide">
              Pak Royal College Sharaqpur Sharif
            </h2>
          </div>
          <p className="text-xs font-bold text-[#084A86] uppercase tracking-wider">
            Registrar &amp; HR Directorate • Official Staff &amp; Faculty Roster
          </p>
          <div className="inline-flex items-center gap-3 text-[11px] text-zinc-600 pt-1 font-medium">
            <span><strong>Department:</strong> {deptFilter}</span>
            <span>•</span>
            <span><strong>Cadre:</strong> {roleFilter}</span>
            <span>•</span>
            <span><strong>Total Staff:</strong> {records.length} Members</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase font-black text-zinc-600 bg-zinc-100/80 border-b border-zinc-200">
              <tr>
                <th className="px-3.5 py-3">Staff ID</th>
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-3.5 py-3">Qualification</th>
                <th className="px-3 py-3">Joining</th>
                <th className="px-3.5 py-3 text-right">Basic (PKR)</th>
                <th className="px-4 py-3">Mobile Contact</th>
                <th className="px-3 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#084A86]" />
                    Compiling employee roster records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-400">
                    No staff records found for selected criteria.
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-3.5 py-3 font-mono font-bold text-[#084A86]">{r.staffId}</td>
                    <td className="px-4 py-3 font-extrabold text-zinc-950">
                      <div>{r.name}</div>
                      <div className="text-[10px] text-zinc-400 font-normal">S/O {r.fatherName}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-800">{r.designation}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700">
                        {r.department}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-zinc-600 text-[11px]">{r.qualification}</td>
                    <td className="px-3 py-3 font-mono text-zinc-500 text-[11px]">{r.joiningDate}</td>
                    <td className="px-3.5 py-3 text-right font-black text-zinc-900">
                      PKR {r.basicSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-600 text-[11px]">{r.phone}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" /> {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signatures */}
        <div className="grid grid-cols-3 gap-6 p-8 border-t border-zinc-200 text-center text-xs">
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Assistant Registrar (HR)
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Director Human Resources
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Principal / Head of Institution
          </div>
        </div>
      </div>
    </div>
  );
}
