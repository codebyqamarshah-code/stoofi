'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Cpu, 
  Beaker, 
  CalendarDays, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Plus, 
  ArrowUpRight, 
  Layers, 
  ShieldAlert, 
  BarChart2, 
  Users, 
  Building,
  Activity,
  FileCheck,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import labService from '@/services/labService';

export default function LabsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {
      totalLabs: 0,
      activeLabs: 0,
      totalAssetsCount: 0,
      underMaintenanceCount: 0
    },
    inventoryReport: [],
    maintenanceReport: [],
    academicReport: [],
    consumablesReport: [],
    rawMaintenance: []
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await labService.getReports();
      if (res) setData(res);
    } catch (err) {
      console.error('Failed to load lab dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const {
    summary = {},
    academicReport = [],
    consumablesReport = [],
    rawMaintenance = []
  } = data;

  const lowStockItems = consumablesReport.filter(c => c.reorderAlert === 'Reorder Now' || c.reorderAlert === 'Low Stock');

  const stats = [
    { 
      title: "Total Labs", 
      value: summary.totalLabs || 0, 
      sub: summary.totalLabs > 0 ? `${summary.activeLabs || 0} Operational` : "No labs created", 
      icon: FlaskConical, 
      color: "text-emerald-700", 
      bg: "bg-emerald-50 border-emerald-200" 
    },
    { 
      title: "Active Labs", 
      value: summary.activeLabs || 0, 
      sub: summary.totalLabs > 0 ? "Ready for sessions" : "0 active", 
      icon: Activity, 
      color: "text-blue-700", 
      bg: "bg-blue-50 border-blue-200" 
    },
    { 
      title: "Total Equipment", 
      value: summary.totalAssetsCount || 0, 
      sub: summary.totalAssetsCount > 0 ? "Registered physical units" : "No equipment added", 
      icon: Cpu, 
      color: "text-purple-700", 
      bg: "bg-purple-50 border-purple-200" 
    },
    { 
      title: "Under Maintenance", 
      value: summary.underMaintenanceCount || 0, 
      sub: summary.underMaintenanceCount > 0 ? "Requires attention" : "All equipment OK", 
      icon: Wrench, 
      color: "text-rose-700", 
      bg: "bg-rose-50 border-rose-200" 
    },
    { 
      title: "Practicals / Sessions", 
      value: academicReport.length || 0, 
      sub: academicReport.length > 0 ? `${academicReport.filter(p => p.conducted > 0).length} Conducted` : "0 scheduled", 
      icon: CalendarDays, 
      color: "text-amber-700", 
      bg: "bg-amber-50 border-amber-200" 
    },
    { 
      title: "Low Stock Items", 
      value: lowStockItems.length, 
      sub: lowStockItems.length > 0 ? "Reagents & Supplies" : "All supplies healthy", 
      icon: Beaker, 
      color: "text-orange-700", 
      bg: "bg-orange-50 border-orange-200" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center p-1.5 shadow-xs shrink-0">
              <img src="/Lab-general-icon.png" alt="Labs" className="h-full w-full object-contain" onError={(e) => { e.target.src = ''; }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Laboratories ERP Command Center</h1>
              <p className="text-xs text-zinc-500">Real-time status of school & university labs, equipment assets, practicals, and inventory</p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="h-9 px-3 text-xs bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link href="/dashboard/labs/assets">
            <Button variant="outline" className="h-9 px-3 text-xs bg-white hover:bg-zinc-50 border-zinc-300 text-zinc-800 font-bold rounded-xl shadow-xs">
              <Plus className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Lab Assets &amp; Expiry
            </Button>
          </Link>
          <Link href="/dashboard/labs/manage">
            <Button variant="outline" className="h-9 px-3 text-xs bg-white hover:bg-zinc-50 border-zinc-300 text-zinc-800 font-bold rounded-xl shadow-xs">
              <Plus className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Add Lab
            </Button>
          </Link>
          <Link href="/dashboard/labs/equipment">
            <Button variant="outline" className="h-9 px-3 text-xs bg-white hover:bg-zinc-50 border-zinc-300 text-zinc-800 font-bold rounded-xl shadow-xs">
              <Plus className="h-3.5 w-3.5 mr-1 text-purple-600" /> Add Equipment
            </Button>
          </Link>
          <Link href="/dashboard/labs/reports">
            <Button className="h-9 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs">
              <BarChart2 className="h-3.5 w-3.5 mr-1.5" /> Reports & Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <div key={i} className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">{stat.title}</span>
                <div className={`p-2 rounded-xl ${stat.bg} border`}>
                  <IconComp className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-zinc-950">{stat.value}</div>
                <div className="text-[11px] text-zinc-500 font-medium mt-0.5">{stat.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Today's Sessions & Quick Links */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Lab Sessions */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-zinc-950">Scheduled Practicals & Sessions</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">Live</span>
              </div>
              <Link href="/dashboard/labs/practicals" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View All Practicals <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {academicReport.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mb-2">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-zinc-600">No practical experiments scheduled yet</p>
                <Link href="/dashboard/labs/practicals" className="mt-2 text-xs font-bold text-emerald-600 hover:underline">
                  + Add Practical Experiment
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-600 uppercase font-bold border-b border-zinc-200">
                    <tr>
                      <th className="px-3.5 py-2.5">Course & Practical</th>
                      <th className="px-3.5 py-2.5">Class / Batch</th>
                      <th className="px-3.5 py-2.5 text-center">Completion</th>
                      <th className="px-3.5 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {academicReport.map((session, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-3.5 py-3">
                          <div className="font-bold text-zinc-950">{session.course}</div>
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold border border-zinc-200">
                            {session.program}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <span className="font-bold text-zinc-800">{session.completionRate}</span>
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            session.conducted > 0 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}>
                            {session.conducted > 0 ? 'Conducted' : 'Scheduled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Maintenance Requests Live Monitor */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-rose-600" />
                <h2 className="text-base font-bold text-zinc-950">Active Equipment Maintenance Tickets</h2>
              </div>
              <Link href="/dashboard/labs/maintenance" className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                Manage Tickets <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {rawMaintenance.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-zinc-600">All laboratory equipment is operational. No open tickets.</p>
                <Link href="/dashboard/labs/maintenance" className="mt-2 text-xs font-bold text-rose-600 hover:underline">
                  + Log a Maintenance Issue
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {rawMaintenance.map((m, idx) => (
                  <div key={m._id || m.id || idx} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-900">{m.ticketNumber || m.id}</span>
                        <span className="font-bold text-zinc-950 text-sm">{m.equipmentName || m.equipment}</span>
                        {m.labName && <span className="text-xs text-zinc-500">({m.labName})</span>}
                      </div>
                      <p className="text-xs text-zinc-600 mt-1">{m.description || m.issueDescription}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        m.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.priority || 'Medium'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white border border-zinc-300 text-zinc-800 shadow-xs">
                        {m.status || 'Reported'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Low Stock Alerts & Quick Navigation */}
        <div className="space-y-6">
          {/* Low Stock Consumables Widget */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h2 className="text-base font-bold text-zinc-950">Consumables Stock Alerts</h2>
              </div>
              <Link href="/dashboard/labs/consumables" className="text-xs font-bold text-orange-600 hover:text-orange-700">
                View All
              </Link>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-zinc-600">All supplies and chemicals are in healthy stock.</p>
                <Link href="/dashboard/labs/consumables" className="mt-2 text-xs font-bold text-orange-600 hover:underline">
                  + Add Consumable Item
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-orange-200/80 bg-orange-50/40 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-zinc-950 text-xs">{item.item}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-rose-600">{item.stockRemaining} {item.unit}</div>
                      <div className="text-[10px] text-zinc-400 font-semibold">{item.reorderAlert}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link href="/dashboard/labs/consumables">
              <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 rounded-xl shadow-xs">
                Restock Consumables <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Quick Module Directory */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <h2 className="text-base font-bold text-zinc-950 mb-3">Labs Management Modules</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Assets & Expiry', href: '/dashboard/labs/assets', icon: FlaskConical },
                { name: 'Lab Categories', href: '/dashboard/labs/categories', icon: Layers },
                { name: 'Manage Labs', href: '/dashboard/labs/manage', icon: FlaskConical },
                { name: 'Equipment & Assets', href: '/dashboard/labs/equipment', icon: Cpu },
                { name: 'Consumables', href: '/dashboard/labs/consumables', icon: Beaker },
                { name: 'Practicals', href: '/dashboard/labs/practicals', icon: FileCheck },
                { name: 'Issue & Return', href: '/dashboard/labs/issue-return', icon: Users },
                { name: 'Safety & Audit', href: '/dashboard/labs/safety', icon: ShieldAlert },
                { name: 'Lab Reports', href: '/dashboard/labs/reports', icon: BarChart2 },
              ].map((mod, i) => {
                const ModIcon = mod.icon;
                return (
                  <Link key={i} href={mod.href}>
                    <div className="p-3 rounded-xl border border-zinc-200 hover:border-zinc-950/60 hover:bg-zinc-50 transition-all flex items-center gap-2.5 cursor-pointer">
                      <ModIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-zinc-900 leading-tight">{mod.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
