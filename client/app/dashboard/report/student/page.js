'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Users, 
  FileText, 
  CalendarCheck, 
  BookOpen, 
  UserCheck, 
  History, 
  GraduationCap, 
  LogIn, 
  ClipboardCheck, 
  Truck, 
  Clock, 
  BedDouble, 
  Activity,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

const STUDENT_REPORTS = [
  { title: 'Student General Report', href: '/dashboard/report/student/general', icon: Users, desc: 'Complete student demographic directory, gender, class, and status breakdown' },
  { title: 'Class & Section Summary', href: '/dashboard/report/student/class', icon: GraduationCap, desc: 'Class-wise student strength, gender ratios, and class teacher allocations' },
  { title: 'Monthly Attendance Report', href: '/dashboard/report/student/attendance', icon: CalendarCheck, desc: 'Class attendance percentages, days present, absent, late, and percentage bars' },
  { title: 'Subject Attendance Report', href: '/dashboard/report/student/subject-attendance', icon: BookOpen, desc: 'Attendance breakdown by individual subject and lecture slots' },
  { title: 'Guardian & Parent Report', href: '/dashboard/report/student/guardian', icon: UserCheck, desc: 'Guardian contact directory, emergency numbers, profession, and home addresses' },
  { title: 'Academic History & Promotion', href: '/dashboard/report/student/history', icon: History, desc: 'Track historical progression, past classes, promotion status, and academic years' },
  { title: 'Previous School Records', href: '/dashboard/report/student/previous-record', icon: FileText, desc: 'Previous school board details, marks obtained, and transfer certificates' },
  { title: 'Student Portal Login Logs', href: '/dashboard/report/student/login', icon: LogIn, desc: 'Monitor student mobile and web portal logins, IP addresses, and active sessions' },
  { title: 'Homework Evaluation Report', href: '/dashboard/report/student/homework-evaluation', icon: ClipboardCheck, desc: 'Homework submission rates, evaluation ratings, and teacher remarks' },
  { title: 'Transport Allocation Report', href: '/dashboard/report/student/transport', icon: Truck, desc: 'Bus route assignment, stops, vehicle numbers, and driver contact logs' },
  { title: 'Class Routine / Timetable', href: '/dashboard/report/student/routine', icon: Clock, desc: 'Official weekly academic schedule, period timings, and classroom allocations' },
  { title: 'Hostel & Dormitory Report', href: '/dashboard/report/student/dormitory', icon: BedDouble, desc: 'Hostel room occupancy, bed numbers, floor plans, and residential status' },
  { title: 'Student Activity & Audit Log', href: '/dashboard/report/student/user-log', icon: Activity, desc: 'System security audit trail of student actions and profile changes' },
];

export default function StudentReportHubPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <Users className="h-6 w-6" />
            </span>
            Student Reports Center
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Access 13 comprehensive student analytical reports and data exports • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Reports</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Student Reports</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#084A86] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Available Reports</span>
            <div className="text-xl font-black text-zinc-900">{STUDENT_REPORTS.length} Reports</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Export Formats</span>
            <div className="text-xl font-black text-emerald-600">Excel, CSV, PDF &amp; Print</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Data Synchronization</span>
            <div className="text-xl font-black text-purple-700">Real-Time MongoDB</div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STUDENT_REPORTS.map((rep, idx) => (
          <Link
            key={idx}
            href={rep.href}
            className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs hover:border-[#084A86]/40 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center group-hover:bg-[#084A86] group-hover:text-white transition-colors">
                  <rep.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#084A86] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-extrabold text-sm text-zinc-950 mt-4 group-hover:text-[#084A86] transition-colors">{rep.title}</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{rep.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">Export Ready</span>
              <span className="font-bold text-[#084A86] group-hover:underline">Open Report →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
