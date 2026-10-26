'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Download, Printer, Building, 
  Users, Banknote, RefreshCw, School, CheckCircle2, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StaffDepartmentReportPage() {
  const [departments, setDepartments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDepartmentData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/report/staff/department');
      const json = await res.json();
      if (json.success) {
        setDepartments(json.data || []);
        setMetrics(json.metrics || null);
      }
    } catch (e) {
      console.error('Failed to load department report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (departments.length === 0) return;
    const headers = ['Department Name', 'Head of Department (HOD)', 'Faculty & Staff Count', 'Average Basic Salary (PKR)', 'Total Monthly Payroll (PKR)'];
    const rows = departments.map(d => [
      `"${d.name}"`,
      `"${d.hod}"`,
      d.totalStaff,
      d.avgSalary,
      d.totalSalary
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Department_Distribution_PRC_${new Date().toISOString().split('T')[0]}.csv`);
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
            <span className="text-[#084A86] font-bold">Department Strength</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <Building className="h-6 w-6 text-[#084A86]" />
            Department-Wise Faculty &amp; Staff Distribution Report
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Departmental headcount, leadership, faculty deployment ratios, and monthly compensation allocations
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
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Department Matrix
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Departments</span>
            <p className="text-xl font-black text-zinc-950 mt-1">{metrics.totalDepartments} Divisions</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Clinical, academic &amp; admin</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-[#084A86] uppercase">Institutional Headcount</span>
            <p className="text-xl font-black text-[#084A86] mt-1">{metrics.totalStaff} Members</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Faculty and support officers</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">Avg Department Size</span>
            <p className="text-xl font-black text-emerald-700 mt-1">{metrics.avgDepartmentStrength}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Members per department</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 uppercase">Monthly Payroll Allocation</span>
            <p className="text-xl font-black text-amber-700 mt-1">
              PKR {metrics.totalPayroll.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Disbursed monthly basic</p>
          </div>
        </div>
      )}

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        {departments.map((dept, idx) => (
          <div key={idx} className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#084A86] bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Academic / Clinical Division
                </span>
                <h3 className="font-black text-base text-zinc-950 mt-1">{dept.name}</h3>
                <p className="text-xs text-zinc-500 font-medium">Head of Department: <strong>{dept.hod}</strong></p>
              </div>
              <span className="text-xl font-black text-zinc-900 bg-zinc-100 px-3 py-1 rounded-xl">
                {dept.totalStaff} <span className="text-xs font-normal text-zinc-500">Staff</span>
              </span>
            </div>

            <div className="bg-zinc-50 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Average Salary</span>
                <p className="font-extrabold text-zinc-900 mt-0.5">PKR {dept.avgSalary.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Total Dept Payroll</span>
                <p className="font-extrabold text-[#084A86] mt-0.5">PKR {dept.totalSalary.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Deployed Faculty &amp; Staff:</span>
              <div className="flex flex-wrap gap-1.5">
                {dept.staffMembers.map((m, mIdx) => (
                  <span key={mIdx} className="text-[11px] bg-zinc-100 text-zinc-800 px-2.5 py-0.5 rounded-md font-semibold">
                    {m.name} ({m.designation})
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Department Broadsheet Table */}
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
            Office of the Registrar • Departmental Staff Strength &amp; Allocation Broadsheet
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase font-black text-zinc-600 bg-zinc-100/80 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-5 py-3">Department Name</th>
                <th className="px-5 py-3">Head of Department / Lead</th>
                <th className="px-4 py-3 text-center">Headcount</th>
                <th className="px-4 py-3 text-right">Avg Basic (PKR)</th>
                <th className="px-4 py-3 text-right">Monthly Budget (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-zinc-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#084A86]" />
                    Compiling departmental matrices...
                  </td>
                </tr>
              ) : (
                departments.map((d, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-zinc-500">0{idx + 1}</td>
                    <td className="px-5 py-3 font-extrabold text-zinc-950">{d.name}</td>
                    <td className="px-5 py-3 font-semibold text-zinc-800">{d.hod}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#084A86]">{d.totalStaff}</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-700">
                      PKR {d.avgSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-zinc-900">
                      PKR {d.totalSalary.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {departments.length > 0 && (
              <tfoot className="bg-zinc-100/90 font-black text-zinc-950 border-t-2 border-zinc-300">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right uppercase text-xs">Total Institutional Deployment:</td>
                  <td className="px-4 py-3 text-center text-sm text-[#084A86]">
                    {departments.reduce((acc, d) => acc + d.totalStaff, 0)} Members
                  </td>
                  <td></td>
                  <td className="px-4 py-3 text-right text-sm text-emerald-800 font-black">
                    PKR {departments.reduce((acc, d) => acc + d.totalSalary, 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Official Signatures */}
        <div className="grid grid-cols-3 gap-6 p-8 border-t border-zinc-200 text-center text-xs">
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Assistant Registrar (Planning)
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Head of Academic Council
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Principal / Board of Governors
          </div>
        </div>
      </div>
    </div>
  );
}
