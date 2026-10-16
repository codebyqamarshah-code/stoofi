'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Award, 
  FileSpreadsheet, 
  Trophy, 
  GraduationCap, 
  Calendar, 
  Clock, 
  History, 
  Monitor, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const EXAM_REPORTS = [
  { title: 'Examination Mark Sheet', href: '/dashboard/report/exam/mark-sheet', icon: FileSpreadsheet, desc: 'Subject-wise examination mark ledger with theory and practical scores, totals, and grades' },
  { title: 'Class Merit & Position List', href: '/dashboard/report/exam/merit-list', icon: Trophy, desc: 'Top 3 rank holders, position holders, GPA leaders, and highest scoring students' },
  { title: 'Official Tabulation Sheet', href: '/dashboard/report/exam/tabulation-sheet', icon: Award, desc: 'Master cross-tabulation broadsheet of all exam candidate scores across all curriculum subjects' },
  { title: 'Student Progress Report Card', href: '/dashboard/report/exam/progress-card', icon: GraduationCap, desc: 'Comprehensive individual student term progress card with principal seal and teacher remarks' },
  { title: 'Progress Card (100% Scale)', href: '/dashboard/report/exam/progress-card-100', icon: Award, desc: 'Percentage standardized report card format for external board and university submissions' },
  { title: 'Exam Date Sheet / Routine', href: '/dashboard/report/exam/routine', icon: Calendar, desc: 'Official examination dates, hall assignments, invigilator schedules, and time table' },
  { title: 'Historical Results Comparison', href: '/dashboard/report/exam/previous-result', icon: History, desc: 'Multi-year student and class comparative academic performance and trend analysis' },
  { title: 'Online CBT Examination Logs', href: '/dashboard/report/exam/online-exam', icon: Monitor, desc: 'Computer-based online quiz and exam attempt scores, timing, and pass percentages' },
];

export default function ExamReportHubPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <Award className="h-6 w-6" />
            </span>
            Examination &amp; Assessment Reports Center
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Official term results, broadsheets, merit positions, and progress cards • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Reports</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Exam Reports</span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {EXAM_REPORTS.map((rep, idx) => (
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
              <span className="text-zinc-400 font-medium">Print &amp; PDF</span>
              <span className="font-bold text-[#084A86] group-hover:underline">Open Report →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
