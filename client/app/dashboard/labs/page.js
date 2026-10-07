'use client';

import Link from 'next/link';
import React, { useState } from 'react';
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
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LabsDashboardPage() {
  const [activeTab, setActiveTab] = useState('today');

  const stats = [
    { title: "Total Labs", value: "8", sub: "Across 2 Campuses", icon: FlaskConical, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    { title: "Active Labs", value: "7", sub: "1 In Maintenance", icon: Activity, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    { title: "Total Equipment", value: "485", sub: "97% Operational", icon: Cpu, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    { title: "Under Maintenance", value: "14", sub: "3 Critical Priority", icon: Wrench, color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
    { title: "Today's Sessions", value: "12", sub: "4 Completed • 2 Live", icon: CalendarDays, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    { title: "Low Stock Items", value: "6", sub: "Reagents & Cables", icon: Beaker, color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  ];

  const todaySessions = [
    { id: 1, time: "09:00 AM - 11:00 AM", lab: "Computer Lab 1 (Block B)", program: "BSCS - Sem 1", subject: "Programming Fundamentals", teacher: "Mr. Ali Raza", status: "Completed", students: 34 },
    { id: 2, time: "10:30 AM - 12:30 PM", lab: "Physics Lab (Main Campus)", program: "Class 10 - Sec A", subject: "Physics Practical #05 (Ohm's Law)", teacher: "Dr. Farooq Khan", status: "In Progress", students: 28 },
    { id: 3, time: "01:00 PM - 03:00 PM", lab: "Chemistry Lab (Ground Floor)", program: "Class 9 - Sec B", subject: "Titration & Solution Prep", teacher: "Mrs. Sadia Tariq", status: "Scheduled", students: 30 },
    { id: 4, time: "02:00 PM - 04:00 PM", lab: "Robotics & AI Lab", program: "O-Levels Science", subject: "Microcontroller Interfacing", teacher: "Engr. Bilal Ahmed", status: "Scheduled", students: 22 },
  ];

  const lowStockItems = [
    { name: "Hydrochloric Acid (HCl 1M)", lab: "Chemistry Lab", remaining: "1.2 L", min: "5.0 L", alert: "Critical" },
    { name: "Nitrile Gloves (Box of 100)", lab: "Biology Lab", remaining: "2 Boxes", min: "10 Boxes", alert: "Low" },
    { name: "CAT6 RJ45 Patch Cables (2m)", lab: "Computer Lab 2", remaining: "4 Pcs", min: "25 Pcs", alert: "Low" },
    { name: "Test Tubes (15x150mm)", lab: "Chemistry Lab", remaining: "12 Pcs", min: "50 Pcs", alert: "Critical" },
  ];

  const recentMaintenance = [
    { id: "MNT-8821", equipment: "Vernier Caliper #04", lab: "Physics Lab", issue: "Zero error loose screw", priority: "Medium", status: "In Progress", tech: "Kashif (Tech)" },
    { id: "MNT-8822", equipment: "Dell PC Workstation #14", lab: "Computer Lab 1", issue: "SMPS Power Supply Failure", priority: "High", status: "Reported", tech: "IT Support Team" },
    { id: "MNT-8820", equipment: "Optical Microscope #02", lab: "Biology Lab", issue: "Objective lens blur & focus alignment", priority: "Urgent", status: "Repaired", tech: "Vendor Service" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Laboratories ERP Command Center</h1>
              <p className="text-xs text-zinc-500">Real-time status of school & university labs, equipment assets, practicals, and inventory</p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
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
          <Link href="/dashboard/labs/schedule">
            <Button className="h-9 px-4 text-xs bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl shadow-xs">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" /> Lab Timetable
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
                <h2 className="text-base font-bold text-zinc-950">Today&apos;s Scheduled Lab Sessions</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">Live</span>
              </div>
              <Link href="/dashboard/labs/schedule" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View Full Timetable <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-600 uppercase font-bold border-b border-zinc-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Time & Lab</th>
                    <th className="px-3.5 py-2.5">Subject & Practical</th>
                    <th className="px-3.5 py-2.5">Class / Batch</th>
                    <th className="px-3.5 py-2.5">Instructor</th>
                    <th className="px-3.5 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {todaySessions.map((session) => (
                    <tr key={session.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-zinc-950">{session.time}</div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Building className="h-3 w-3 text-zinc-400" /> {session.lab}
                        </div>
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-zinc-900">{session.subject}</div>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold border border-zinc-200">
                          {session.program}
                        </span>
                        <div className="text-[10px] text-zinc-500 mt-1">{session.students} Enrolled</div>
                      </td>
                      <td className="px-3.5 py-3 text-zinc-700 font-medium">
                        {session.teacher}
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          session.status === 'In Progress' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                            : session.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

            <div className="space-y-3">
              {recentMaintenance.map((m) => (
                <div key={m.id} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-900">{m.id}</span>
                      <span className="font-bold text-zinc-950 text-sm">{m.equipment}</span>
                      <span className="text-xs text-zinc-500">({m.lab})</span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">{m.issue}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      m.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {m.priority}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white border border-zinc-300 text-zinc-800 shadow-xs">
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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

            <div className="space-y-3">
              {lowStockItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-orange-200/80 bg-orange-50/40 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-zinc-950 text-xs">{item.name}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{item.lab}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-rose-600">{item.remaining}</div>
                    <div className="text-[10px] text-zinc-400">Min: {item.min}</div>
                  </div>
                </div>
              ))}
            </div>

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
