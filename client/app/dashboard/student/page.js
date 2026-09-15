'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  Award, 
  Monitor, 
  Users, 
  BookMarked, 
  ListTodo, 
  CalendarCheck, 
  DollarSign, 
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sun,
  MapPin,
  CloudSun
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const studentName = user?.fullName || user?.name || user?.username || 'Emily Johnson';
  const admissionNo = user?.admissionNo || 'ADM-2026-001';
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState('September 2026');

  // Days in September 2026 (1 to 30)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. TOP HEADER BANNER (Purple Gradient Theme) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 -mb-16 h-48 w-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                GOOD EVENING
              </span>
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-purple-500/40 text-purple-100 border border-purple-400/30">
                STUDENT
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {studentName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-purple-100/90">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                <span>Admission No:</span>
                <span className="font-bold text-white">{admissionNo}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                <Clock className="w-3.5 h-3.5" />
                <span>Monday, 14 September 2026</span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="pt-2 flex flex-wrap gap-2">
              {[
                { name: 'Class Routine', href: '/dashboard/student/class-routine' },
                { name: 'Homework', href: '/dashboard/student/homework' },
                { name: 'Attendance', href: '/dashboard/student/attendance' },
                { name: 'Exam Schedule', href: '/dashboard/student/examinations/schedule' }
              ].map((act, idx) => (
                <Link key={idx} href={act.href}>
                  <button 
                    className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold transition-all backdrop-blur-sm cursor-pointer"
                  >
                    {act.name}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Weather Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4 text-white min-w-[260px] self-stretch xl:self-auto justify-between">
            <div>
              <div className="flex items-center gap-1 text-xs font-semibold opacity-80">
                <MapPin className="w-3.5 h-3.5" />
                <span>Lahore, Pakistan</span>
              </div>
              <div className="text-3xl font-black mt-1">33°C</div>
              <div className="text-[11px] opacity-75 mt-0.5">Clear Sky</div>
            </div>
            <div className="p-3 bg-white/15 rounded-2xl">
              <Sun className="w-8 h-8 text-amber-300 animate-spin-slow" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. STAT CARDS GRID (9 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL SUBJECT', value: '0', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
          { label: 'TOTAL EXAM', value: '0', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
          { label: 'TOTAL ONLINE EXAM', value: '0', icon: Monitor, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/40' },
          { label: 'TOTAL TEACHERS', value: '0', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
          { label: 'TOTAL ISSUED BOOK', value: '0', icon: BookMarked, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'TOTAL PENDING HOMEWORK', value: '0', icon: ListTodo, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40' },
          { label: 'TOTAL ATTENDANCE IN CURRENT MONTH', value: '0', icon: CalendarCheck, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
          { label: 'TOTAL DUE FEES', value: '$0', icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/40' },
          { label: 'TOTAL BEHAVIOUR POINT', value: '0', icon: Star, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40' },
        ].map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                <IconComp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-900">{card.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. CLASS ROUTINE SECTION */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900">Class Routine</h2>
        <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
          <Clock className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-zinc-600">No Routine Schedule Available</p>
          <p className="text-xs text-zinc-400 mt-1">Your class routine will appear here once assigned by the administrator.</p>
        </div>
      </div>

      {/* 4. MONTHLY ATTENDANCE REPORT (SEPTEMBER) */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900">Monthly Attendance Report (September)</h2>
          <div className="flex items-center gap-3 text-xs font-semibold text-zinc-600">
            <span>Present: <strong className="text-emerald-600">P (0)</strong></span>
            <span>Late: <strong className="text-amber-600">L (0)</strong></span>
            <span>Absent: <strong className="text-rose-600">A (0)</strong></span>
            <span>Half Days: <strong className="text-purple-600">F (0)</strong></span>
            <span>Holiday: <strong className="text-blue-600">H (0)</strong></span>
          </div>
        </div>

        {/* Days Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border border-zinc-200">
            <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
              <tr>
                <th className="py-2 px-1 border-r">P</th>
                <th className="py-2 px-1 border-r">L</th>
                <th className="py-2 px-1 border-r">A</th>
                <th className="py-2 px-1 border-r">F</th>
                <th className="py-2 px-1 border-r">H</th>
                <th className="py-2 px-1 border-r">%</th>
                {daysInMonth.map(d => (
                  <th key={d} className="py-2 px-1 border-r min-w-[28px]">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2.5 px-1 border-r font-bold text-emerald-600">0</td>
                <td className="py-2.5 px-1 border-r font-bold text-amber-600">0</td>
                <td className="py-2.5 px-1 border-r font-bold text-rose-600">0</td>
                <td className="py-2.5 px-1 border-r font-bold text-purple-600">0</td>
                <td className="py-2.5 px-1 border-r font-bold text-blue-600">0</td>
                <td className="py-2.5 px-1 border-r font-bold text-zinc-900">100%</td>
                {daysInMonth.map(d => (
                  <td key={d} className="py-2.5 px-1 border-r text-zinc-400 font-medium">-</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MONTHLY SUBJECT ATTENDANCE REPORT (SEPTEMBER) */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900">Monthly Subject Attendance Report (September)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border border-zinc-200">
            <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
              <tr>
                <th className="py-2 px-2 border-r text-left">Subject Name</th>
                <th className="py-2 px-2 border-r">Admission No</th>
                <th className="py-2 px-1 border-r">P</th>
                <th className="py-2 px-1 border-r">L</th>
                <th className="py-2 px-1 border-r">A</th>
                <th className="py-2 px-1 border-r">F</th>
                <th className="py-2 px-1 border-r">H</th>
                <th className="py-2 px-1 border-r">%</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="py-6 text-center text-zinc-400 font-medium">
                  No Subject Attendance Data Recorded
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. FEES & EXAM ROUTINE (TWO COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fees */}
        <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900">Fees</h2>
          <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <p className="text-sm font-semibold text-zinc-600">No Due Fees Found</p>
            <p className="text-xs text-zinc-400 mt-1">All your tuition and fee dues are cleared.</p>
          </div>
        </div>

        {/* Exam Routine */}
        <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900">Exam Routine</h2>
          <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <p className="text-sm font-semibold text-zinc-600">No Exam Routine Published</p>
            <p className="text-xs text-zinc-400 mt-1">Upcoming test schedules will appear here.</p>
          </div>
        </div>
      </div>

      {/* 7. TEACHERS LIST & LEAVE TYPES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teachers List */}
        <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900">Teachers List</h2>
          <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <p className="text-sm font-semibold text-zinc-600">No Assigned Teachers Found</p>
          </div>
        </div>

        {/* Leave Types */}
        <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900">Leave Types</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">TYPE</th>
                  <th className="py-2.5 px-3">REMAINING DAYS</th>
                  <th className="py-2.5 px-3">EXTRA TAKEN</th>
                  <th className="py-2.5 px-3">LEAVE TAKEN</th>
                  <th className="py-2.5 px-3">LEAVE DAYS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {[
                  { type: 'Casual Leave', rem: 12, extra: 0, taken: 0, total: 12 },
                  { type: 'Sick Leave', rem: 10, extra: 0, taken: 0, total: 10 }
                ].map((l, i) => (
                  <tr key={i} className="hover:bg-zinc-50">
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">{l.type}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold">{l.rem}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{l.extra}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{l.taken}</td>
                    <td className="py-2.5 px-3 text-zinc-700 font-bold">{l.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 8. COMPLAINT LIST */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900">Complaint List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-3">SL</th>
                <th className="py-2.5 px-3">COMPLAINT BY</th>
                <th className="py-2.5 px-3">COMPLAINT TYPE</th>
                <th className="py-2.5 px-3">SOURCE</th>
                <th className="py-2.5 px-3">PHONE</th>
                <th className="py-2.5 px-3">DATE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="py-6 text-center text-zinc-400 font-medium">
                  No Complaints Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. FULL CALENDAR WIDGET */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs">
              Today
            </button>
            <span className="text-lg font-black text-zinc-900 ml-2">{currentCalendarMonth}</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            {['Month', 'Week', 'Day', 'List'].map((mode, i) => (
              <button 
                key={i} 
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${i === 0 ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-100">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-2 min-h-[360px]">
          {/* Previous month trailing days */}
          <div className="p-2 border border-zinc-100 rounded-xl bg-zinc-50/40 text-xs font-semibold text-zinc-300">30</div>
          <div className="p-2 border border-zinc-100 rounded-xl bg-zinc-50/40 text-xs font-semibold text-zinc-300">31</div>
          
          {/* Active days */}
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">1</div>
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">
            <span>2</span>
            <div className="mt-2 p-1 text-[10px] font-bold rounded bg-rose-700 text-white truncate">Event-assad</div>
          </div>
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">3</div>
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">
            <span>4</span>
            <div className="mt-2 p-1 text-[10px] font-bold rounded bg-cyan-500 text-white truncate">Notice Board-Test</div>
          </div>
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">5</div>
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">6</div>
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">7</div>
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">
            <span>8</span>
            <div className="mt-2 p-1 text-[10px] font-bold rounded bg-cyan-400 text-white truncate">Notice Board-T-+-Notice</div>
          </div>
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">9</div>
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">10</div>
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">11</div>
          <div className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">12</div>
          <div className="p-2 border border-purple-500 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md">
            <span>14</span>
            <div className="mt-1 text-[10px] font-semibold opacity-90">Today</div>
          </div>
          {Array.from({ length: 16 }, (_, i) => 15 + i).map(day => (
            <div key={day} className="p-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700">
              {day}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
