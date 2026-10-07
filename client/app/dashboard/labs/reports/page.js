'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  ChevronRight,
  Download,
  Printer,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  FlaskConical,
  Boxes,
  Wrench,
  BookOpen,
  Calendar,
  Building,
  CheckCircle2,
  DollarSign,
  Users,
  ShieldAlert,
  Percent,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function LabReportsPage() {
  const [selectedReport, setSelectedReport] = useState('inventory'); // 'inventory', 'utilization', 'consumables', 'maintenance', 'academic'
  const [timeRange, setTimeRange] = useState('Fall 2026');

  // Report 1: Equipment & Valuation Data
  const inventoryReport = [
    { lab: 'Software Engineering & AI Lab 1', category: 'Computer Science & IT', totalAssets: 35, working: 33, underRepair: 2, totalValue: 4800000, utilization: '88%' },
    { lab: 'Advanced Physics & Mechanics Lab', category: 'Physics & Mechanics', totalAssets: 68, working: 65, underRepair: 3, totalValue: 1850000, utilization: '75%' },
    { lab: 'Organic & Inorganic Chemistry Lab', category: 'Chemistry & Materials', totalAssets: 94, working: 92, underRepair: 2, totalValue: 1420000, utilization: '70%' },
    { lab: 'Molecular Biology & Genetics Lab', category: 'Biology & Life Sciences', totalAssets: 42, working: 40, underRepair: 2, totalValue: 2100000, utilization: '65%' },
    { lab: 'Robotics, IoT & Embedded Systems Lab', category: 'Robotics & Automation', totalAssets: 110, working: 104, underRepair: 6, totalValue: 3200000, utilization: '82%' },
    { lab: 'Digital Language & Phonetics Lab', category: 'Language & Multimedia', totalAssets: 32, working: 32, underRepair: 0, totalValue: 1250000, utilization: '60%' }
  ];

  // Report 2: Maintenance & Expenditure Data
  const maintenanceReport = [
    { lab: 'Software Engineering & AI Lab 1', tickets: 5, resolved: 4, open: 1, costIncurred: 48500, topIssue: 'GPU Thermals & PSU replacement' },
    { lab: 'Advanced Physics & Mechanics Lab', tickets: 4, resolved: 3, open: 1, costIncurred: 18000, topIssue: 'Oscilloscope calibration' },
    { lab: 'Organic & Inorganic Chemistry Lab', tickets: 3, resolved: 3, open: 0, costIncurred: 12500, topIssue: 'Fume hood exhaust motor belt' },
    { lab: 'Molecular Biology & Genetics Lab', tickets: 2, resolved: 2, open: 0, costIncurred: 8500, topIssue: 'Microscope stage alignment' },
    { lab: 'Robotics, IoT & Embedded Systems Lab', tickets: 7, resolved: 6, open: 1, costIncurred: 24000, topIssue: 'Soldering station heating elements' },
    { lab: 'Digital Language & Phonetics Lab', tickets: 1, resolved: 1, open: 0, costIncurred: 3500, topIssue: 'Headset jack replacements' }
  ];

  // Report 3: Academic Practicals Coverage Data
  const academicReport = [
    { course: 'Programming Fundamentals (CS-101)', program: 'BS Computer Science', planned: 14, conducted: 8, completionRate: '57%', avgAttendance: '94%', passRate: '96%' },
    { course: 'Physics Practical (PHY-101)', program: 'FSc Pre-Engineering', planned: 12, conducted: 6, completionRate: '50%', avgAttendance: '91%', passRate: '92%' },
    { course: 'Organic Chemistry (CHEM-201)', program: 'FSc Pre-Medical', planned: 12, conducted: 7, completionRate: '58%', avgAttendance: '89%', passRate: '90%' },
    { course: 'Microcontrollers & IoT (ME-402)', program: 'BS Robotics', planned: 14, conducted: 8, completionRate: '57%', avgAttendance: '97%', passRate: '98%' },
    { course: 'Data Structures & Algorithms (CS-201)', program: 'BS Computer Science', planned: 14, conducted: 9, completionRate: '64%', avgAttendance: '95%', passRate: '95%' }
  ];

  // Report 4: Consumables & Chemical Usage Data
  const consumablesReport = [
    { item: 'Hydrochloric Acid 37% AR Grade', category: 'Acids & Bases', unit: 'Liters', openedQty: 10, consumedQty: 6.5, stockRemaining: 3.5, reorderAlert: 'Normal' },
    { item: 'Sodium Hydroxide Pellets 99%', category: 'Reagents & Salts', unit: 'Kg', openedQty: 8, consumedQty: 5.2, stockRemaining: 2.8, reorderAlert: 'Normal' },
    { item: 'Acetocarmine Cytology Stain 2%', category: 'Biological Stains', unit: 'Bottles (100ml)', openedQty: 6, consumedQty: 4.8, stockRemaining: 1.2, reorderAlert: 'Reorder Now' },
    { item: 'Jumper Wires Assorted M-to-M / M-to-F', category: 'Electronic Components', unit: 'Packs (120 pcs)', openedQty: 25, consumedQty: 19, stockRemaining: 6, reorderAlert: 'Reorder Now' },
    { item: 'Nitrile Safety Gloves (Box of 100)', category: 'Safety & PPE', unit: 'Boxes', openedQty: 20, consumedQty: 14, stockRemaining: 6, reorderAlert: 'Normal' }
  ];

  const handleExport = (type) => {
    let headers = [];
    let data = [];
    let title = '';

    if (selectedReport === 'inventory') {
      title = 'Lab_Equipment_Valuation_Report';
      headers = ['Laboratory', 'Category', 'Total Assets', 'Working', 'Under Repair', 'Total Valuation (PKR)', 'Utilization Rate'];
      data = inventoryReport.map(r => [r.lab, r.category, r.totalAssets, r.working, r.underRepair, `PKR ${r.totalValue.toLocaleString()}`, r.utilization]);
    } else if (selectedReport === 'maintenance') {
      title = 'Lab_Maintenance_Expense_Report';
      headers = ['Laboratory', 'Total Tickets', 'Resolved', 'Open', 'Cost Incurred (PKR)', 'Top Failure Issue'];
      data = maintenanceReport.map(r => [r.lab, r.tickets, r.resolved, r.open, `PKR ${r.costIncurred.toLocaleString()}`, r.topIssue]);
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

  const totalAssetValuation = inventoryReport.reduce((acc, curr) => acc + curr.totalValue, 0);
  const totalLabMaintenance = maintenanceReport.reduce((acc, curr) => acc + curr.costIncurred, 0);
  const totalAssetsCount = inventoryReport.reduce((acc, curr) => acc + curr.totalAssets, 0);

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
            Asset valuations, lab utilization rates, maintenance spending, and practicals syllabus compliance
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

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Total Lab Asset Valuation</div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">PKR {(totalAssetValuation / 1000000).toFixed(2)}M</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">{totalAssetsCount} Physical Assets</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Average Lab Utilization</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">73.3%</div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">Peak during 10 AM - 2 PM</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Maintenance Expenditure</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">PKR {totalLabMaintenance.toLocaleString()}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">22 Tickets serviced</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Syllabus Practical Progress</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">56.8%</div>
            <div className="text-[11px] text-emerald-800 font-medium mt-1">On schedule (Mid-term)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Report Selector Pills & Export Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedReport('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedReport === 'inventory'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" /> Asset Valuation
          </button>
          <button
            onClick={() => setSelectedReport('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedReport === 'maintenance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Maintenance & Repair Costs
          </button>
          <button
            onClick={() => setSelectedReport('academic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedReport === 'academic'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Practicals & Syllabus
          </button>
          <button
            onClick={() => setSelectedReport('consumables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedReport === 'consumables'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" /> Consumables & Reagents
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button
            onClick={() => handleExport('excel')}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <FileText className="w-3.5 h-3.5" /> Excel
          </Button>
          <Button
            onClick={() => handleExport('print')}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <Printer className="w-3.5 h-3.5" /> Print Report
          </Button>
        </div>
      </div>

      {/* Report 1 Table: Equipment Inventory & Valuation */}
      {selectedReport === 'inventory' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Laboratory Asset Valuation & Operational Status</h3>
              <p className="text-xs text-zinc-500">Summary of capital equipment investments and working health</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700">Valuation: PKR {(totalAssetValuation).toLocaleString()}</span>
          </div>

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
                    <td className="py-3 px-4 text-right font-bold text-zinc-900">PKR {row.totalValue.toLocaleString()}</td>
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
        </div>
      )}

      {/* Report 2 Table: Maintenance & Repairs */}
      {selectedReport === 'maintenance' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Laboratory Maintenance Expenses & Fault Summary</h3>
              <p className="text-xs text-zinc-500">Breakdown of repair bills, open tickets and recurring equipment issues</p>
            </div>
            <span className="text-xs font-semibold text-amber-600">Total Spend: PKR {totalLabMaintenance.toLocaleString()}</span>
          </div>

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
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">PKR {row.costIncurred.toLocaleString()}</td>
                    <td className="py-3 px-4 text-zinc-700 italic">{row.topIssue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3 Table: Academic Syllabus & Practicals */}
      {selectedReport === 'academic' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Curriculum Practicals Completion & Student Attendance</h3>
              <p className="text-xs text-zinc-500">Tracking laboratory experiment progress per course and student performance</p>
            </div>
          </div>

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
        </div>
      )}

      {/* Report 4 Table: Consumables & Chemical Usage */}
      {selectedReport === 'consumables' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Consumables Stock & Chemical Burn Rate</h3>
              <p className="text-xs text-zinc-500">Material consumption tracking and replenishment forecast</p>
            </div>
          </div>

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
        </div>
      )}
    </div>
  );
}
