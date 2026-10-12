'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Download,
  Printer,
  FileText,
  BarChart3,
  TrendingUp,
  FlaskConical,
  Boxes,
  Wrench,
  BookOpen,
  CheckCircle2,
  DollarSign,
  Plus,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';
import labService from '@/services/labService';

export default function LabReportsPage() {
  const [selectedReport, setSelectedReport] = useState('inventory'); // 'inventory', 'maintenance', 'academic', 'consumables'
  const [timeRange, setTimeRange] = useState('Fall 2026');
  const [loading, setLoading] = useState(true);

  // Live Reports State (Initialized empty - NO FAKE / DUMMY DATA)
  const [reportData, setReportData] = useState({
    summary: {
      totalAssetValuation: 0,
      totalAssetsCount: 0,
      totalLabMaintenance: 0,
      averageUtilization: '0%',
      practicalProgress: '0%',
      totalLabs: 0,
      activeLabs: 0,
      underMaintenanceCount: 0
    },
    inventoryReport: [],
    maintenanceReport: [],
    academicReport: [],
    consumablesReport: []
  });

  const loadLiveReports = async () => {
    setLoading(true);
    try {
      const data = await labService.getReports();
      if (data) {
        setReportData(data);
      }
    } catch (err) {
      console.error('Failed to load live reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveReports();
  }, []);

  const {
    summary = {},
    inventoryReport = [],
    maintenanceReport = [],
    academicReport = [],
    consumablesReport = []
  } = reportData;

  const totalAssetValuation = summary.totalAssetValuation || 0;
  const totalAssetsCount = summary.totalAssetsCount || 0;
  const totalLabMaintenance = summary.totalLabMaintenance || 0;
  const averageUtilization = summary.averageUtilization || '0%';
  const practicalProgress = summary.practicalProgress || '0%';

  const handleExport = (type) => {
    let headers = [];
    let data = [];
    let title = '';

    if (selectedReport === 'inventory') {
      title = 'Lab_Equipment_Valuation_Report';
      headers = ['Laboratory', 'Category', 'Total Assets', 'Working', 'Under Repair', 'Total Valuation (PKR)', 'Utilization Rate'];
      data = inventoryReport.map(r => [r.lab, r.category, r.totalAssets, r.working, r.underRepair, `PKR ${Number(r.totalValue || 0).toLocaleString()}`, r.utilization]);
    } else if (selectedReport === 'maintenance') {
      title = 'Lab_Maintenance_Expense_Report';
      headers = ['Laboratory', 'Total Tickets', 'Resolved', 'Open', 'Cost Incurred (PKR)', 'Top Failure Issue'];
      data = maintenanceReport.map(r => [r.lab, r.tickets, r.resolved, r.open, `PKR ${Number(r.costIncurred || 0).toLocaleString()}`, r.topIssue]);
    } else if (selectedReport === 'academic') {
      title = 'Lab_Academic_Practicals_Report';
      headers = ['Course', 'Program', 'Planned Practicals', 'Conducted', 'Completion Rate', 'Avg Attendance', 'Pass Rate'];
      data = academicReport.map(r => [r.course, r.program, r.planned, r.conducted, r.completionRate, r.avgAttendance, r.passRate]);
    } else {
      title = 'Lab_Consumables_Usage_Report';
      headers = ['Material / Reagent', 'Category', 'Unit', 'Stocked Qty', 'Consumed Qty', 'Stock Remaining', 'Alert'];
      data = consumablesReport.map(r => [r.item, r.category, r.unit, r.openedQty, r.consumedQty, r.stockRemaining, r.reorderAlert]);
    }

    if (type === 'csv') exportToCSV(title, headers, data);
    else if (type === 'excel') exportToExcel(title, headers, data);
    else printData(title.replace(/_/g, ' '), headers, data);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-zinc-600">
          <Link href="/dashboard" className="hover:text-emerald-700 font-medium">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <Link href="/dashboard/labs" className="hover:text-emerald-700 font-medium">Labs</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Reports & Analytics</span>
        </div>

        <button
          onClick={loadLiveReports}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-all disabled:opacity-50"
          title="Refresh Live Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Institutional Executive Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Laboratory Reports & Analytics</h1>
          <p className="text-emerald-200/90 text-sm mt-1">
            Real-time live valuations, lab utilization rates, maintenance spending, and practicals syllabus compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20 rounded-lg px-3 py-2"
          >
            <option value="Fall 2026" className="text-zinc-900">Fall 2026 Semester</option>
            <option value="Spring 2026" className="text-zinc-900">Spring 2026 Semester</option>
            <option value="Annual 2026" className="text-zinc-900">Annual 2026</option>
          </select>
        </div>
      </div>

      {/* Top Level Summary Cards (Live Data Only) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Asset Valuation */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Total Lab Asset Valuation</div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">
              PKR {totalAssetValuation >= 1000000 
                ? `${(totalAssetValuation / 1000000).toFixed(2)}M` 
                : totalAssetValuation.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {totalAssetsCount} Physical {totalAssetsCount === 1 ? 'Asset' : 'Assets'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Average Utilization */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Average Lab Utilization</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{averageUtilization}</div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">
              {inventoryReport.length > 0 ? `${inventoryReport.length} Labs active` : 'No active labs'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Maintenance Expenditure */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Maintenance Expenditure</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">PKR {totalLabMaintenance.toLocaleString()}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">
              {maintenanceReport.reduce((acc, m) => acc + (m.tickets || 0), 0)} Tickets logged
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Practical Progress */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Syllabus Practical Progress</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">{practicalProgress}</div>
            <div className="text-[11px] text-emerald-800 font-medium mt-1">
              {academicReport.length > 0 ? `${academicReport.length} Practicals mapped` : '0 Practicals'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Report Selector Tabs & Export Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0 flex-nowrap">
          {/* TAB 1: Asset Valuation (Cleanly styled, fully visible label) */}
          <button
            type="button"
            onClick={() => setSelectedReport('inventory')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedReport === 'inventory'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950'
            }`}
            title="Asset Valuation Report"
          >
            <Boxes className="w-4 h-4 shrink-0" />
            <span className="font-bold">Asset Valuation</span>
          </button>

          {/* TAB 2: Maintenance & Repair Costs */}
          <button
            type="button"
            onClick={() => setSelectedReport('maintenance')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedReport === 'maintenance'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950'
            }`}
            title="Maintenance & Repair Costs"
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="font-bold">Maintenance & Repair Costs</span>
          </button>

          {/* TAB 3: Practicals & Syllabus */}
          <button
            type="button"
            onClick={() => setSelectedReport('academic')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedReport === 'academic'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950'
            }`}
            title="Practicals & Syllabus"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="font-bold">Practicals & Syllabus</span>
          </button>

          {/* TAB 4: Consumables & Reagents */}
          <button
            type="button"
            onClick={() => setSelectedReport('consumables')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedReport === 'consumables'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950'
            }`}
            title="Consumables & Reagents"
          >
            <FlaskConical className="w-4 h-4 shrink-0" />
            <span className="font-bold">Consumables & Reagents</span>
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700 font-semibold"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button
            onClick={() => handleExport('excel')}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700 font-semibold"
          >
            <FileText className="w-3.5 h-3.5" /> Excel
          </Button>
          <Button
            onClick={() => handleExport('print')}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700 font-semibold"
          >
            <Printer className="w-3.5 h-3.5" /> Print Report
          </Button>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-zinc-700">Loading live laboratory analytics...</p>
        </div>
      )}

      {/* Report 1 Table: Equipment Inventory & Valuation */}
      {!loading && selectedReport === 'inventory' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Laboratory Asset Valuation & Operational Status</h3>
              <p className="text-xs text-zinc-500">Summary of real capital equipment investments and working health</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-700">
                Total Valuation: PKR {totalAssetValuation.toLocaleString()}
              </span>
              <Link href="/dashboard/labs/equipment">
                <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Equipment
                </Button>
              </Link>
            </div>
          </div>

          {inventoryReport.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Boxes className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900">No Laboratory Equipment Registered Yet</h4>
              <p className="text-xs text-zinc-500 max-w-md mt-1 mb-4">
                No equipment or assets have been added yet. Add equipment in the Equipment & Assets module to generate live valuation reports.
              </p>
              <Link href="/dashboard/labs/equipment">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-4 rounded-xl shadow-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Register First Equipment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Laboratory</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Total Assets</th>
                    <th className="py-3 px-4 text-center">Working</th>
                    <th className="py-3 px-4 text-center">Under Repair</th>
                    <th className="py-3 px-4 text-right">Total Valuation (PKR)</th>
                    <th className="py-3 px-4 text-right">Weekly Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {inventoryReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-zinc-900">{row.lab}</td>
                      <td className="py-3 px-4 text-zinc-600">{row.category}</td>
                      <td className="py-3 px-4 text-center font-bold text-zinc-900">{row.totalAssets}</td>
                      <td className="py-3 px-4 text-center font-semibold text-emerald-700">{row.working}</td>
                      <td className="py-3 px-4 text-center font-semibold text-red-600">{row.underRepair}</td>
                      <td className="py-3 px-4 text-right font-bold text-zinc-900">PKR {Number(row.totalValue || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                          {row.utilization}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Report 2 Table: Maintenance & Repairs */}
      {!loading && selectedReport === 'maintenance' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Laboratory Maintenance Expenses & Fault Summary</h3>
              <p className="text-xs text-zinc-500">Breakdown of repair bills, open tickets and recurring equipment issues</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-amber-600">
                Total Spend: PKR {totalLabMaintenance.toLocaleString()}
              </span>
              <Link href="/dashboard/labs/maintenance">
                <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Log Maintenance Ticket
                </Button>
              </Link>
            </div>
          </div>

          {maintenanceReport.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Wrench className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900">No Maintenance Records Found</h4>
              <p className="text-xs text-zinc-500 max-w-md mt-1 mb-4">
                No maintenance tickets or repair expenses have been logged yet. All equipment is currently operational.
              </p>
              <Link href="/dashboard/labs/maintenance">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 px-4 rounded-xl shadow-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Log Maintenance Ticket
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Laboratory</th>
                    <th className="py-3 px-4 text-center">Total Faults</th>
                    <th className="py-3 px-4 text-center">Resolved</th>
                    <th className="py-3 px-4 text-center">Open Tickets</th>
                    <th className="py-3 px-4 text-right">Cost Incurred</th>
                    <th className="py-3 px-4">Top Failure Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {maintenanceReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-zinc-900">{row.lab}</td>
                      <td className="py-3 px-4 text-center font-bold text-zinc-900">{row.tickets}</td>
                      <td className="py-3 px-4 text-center font-semibold text-emerald-700">{row.resolved}</td>
                      <td className="py-3 px-4 text-center font-semibold text-red-600">{row.open}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">PKR {Number(row.costIncurred || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-zinc-700 italic">{row.topIssue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Report 3 Table: Academic Syllabus & Practicals */}
      {!loading && selectedReport === 'academic' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Curriculum Practicals Completion & Student Attendance</h3>
              <p className="text-xs text-zinc-500">Tracking laboratory experiment progress per course and student performance</p>
            </div>
            <Link href="/dashboard/labs/practicals">
              <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Schedule Practical
              </Button>
            </Link>
          </div>

          {academicReport.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900">No Practical Experiments Scheduled</h4>
              <p className="text-xs text-zinc-500 max-w-md mt-1 mb-4">
                No practical sessions or curriculum experiments have been recorded yet. Add practical experiments to track syllabus coverage.
              </p>
              <Link href="/dashboard/labs/practicals">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-4 rounded-xl shadow-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Schedule First Practical
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Subject & Course</th>
                    <th className="py-3 px-4">Academic Program</th>
                    <th className="py-3 px-4 text-center">Planned</th>
                    <th className="py-3 px-4 text-center">Conducted</th>
                    <th className="py-3 px-4 text-center">Completion Rate</th>
                    <th className="py-3 px-4 text-center">Avg Attendance</th>
                    <th className="py-3 px-4 text-right">Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {academicReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-zinc-900">{row.course}</td>
                      <td className="py-3 px-4 text-emerald-700 font-medium">{row.program}</td>
                      <td className="py-3 px-4 text-center font-medium text-zinc-700">{row.planned}</td>
                      <td className="py-3 px-4 text-center font-bold text-zinc-900">{row.conducted}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[11px]">
                          {row.completionRate}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-emerald-700">{row.avgAttendance}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-800">{row.passRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Report 4 Table: Consumables & Chemical Usage */}
      {!loading && selectedReport === 'consumables' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Consumables Stock & Chemical Burn Rate</h3>
              <p className="text-xs text-zinc-500">Material consumption tracking and replenishment forecast</p>
            </div>
            <Link href="/dashboard/labs/consumables">
              <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Consumable
              </Button>
            </Link>
          </div>

          {consumablesReport.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900">No Consumables or Chemical Items Tracked</h4>
              <p className="text-xs text-zinc-500 max-w-md mt-1 mb-4">
                No consumable reagents or supplies have been added yet. Add items in Consumables & Reagents to monitor chemical burn rates.
              </p>
              <Link href="/dashboard/labs/consumables">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-4 rounded-xl shadow-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add First Consumable
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Chemical / Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4 text-center">Initial Stock</th>
                    <th className="py-3 px-4 text-center">Consumed</th>
                    <th className="py-3 px-4 text-center">Remaining</th>
                    <th className="py-3 px-4 text-right">Procurement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {consumablesReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-zinc-900">{row.item}</td>
                      <td className="py-3 px-4 text-zinc-600">{row.category}</td>
                      <td className="py-3 px-4 text-zinc-600 font-mono">{row.unit}</td>
                      <td className="py-3 px-4 text-center font-medium text-zinc-700">{row.openedQty}</td>
                      <td className="py-3 px-4 text-center font-semibold text-amber-600">{row.consumedQty}</td>
                      <td className="py-3 px-4 text-center font-bold text-zinc-900">{row.stockRemaining}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.reorderAlert === 'Reorder Now' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {row.reorderAlert}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
