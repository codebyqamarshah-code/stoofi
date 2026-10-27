'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Award, Shield, FileSpreadsheet, Trophy, 
  PenLine, CreditCard, LayoutDashboard, ArrowRight, CheckCircle2 
} from 'lucide-react';

export default function ExamSettingsHubPage() {
  const sections = [
    {
      title: 'Setup Exam Rules',
      description: 'Configure passing criteria, grading policies, merit list calculation by roll or marks, and profile photo inclusion on report cards.',
      href: '/dashboard/settings/exam/setup-exam-rule',
      icon: Shield,
      badge: 'Core Rules',
    },
    {
      title: 'Format Settings',
      description: 'Design progress report card typography, border styles, signature blocks, remarks templates, and watermark settings.',
      href: '/dashboard/settings/exam/format-settings',
      icon: FileSpreadsheet,
      badge: 'Report Card',
    },
    {
      title: 'Position & Merit System',
      description: 'Automate class rank calculation, section toppers, GPA calculation algorithms, and tied-score tiebreaking rules.',
      href: '/dashboard/settings/exam/position',
      icon: Trophy,
      badge: 'Merit Ranks',
    },
    {
      title: 'All Exam Combined Position',
      description: 'Generate multi-term cumulative rankings across First Term, Mid-Term, and Final Annual Examination cycles.',
      href: '/dashboard/settings/exam/all-exam-position',
      icon: Award,
      badge: 'Cumulative',
    },
    {
      title: 'Exam Signatures & Seal',
      description: 'Upload digital signatures for Principal, Controller of Examinations, and Class Incharge for verified transcript generation.',
      href: '/dashboard/settings/exam/exam-signature-settings',
      icon: PenLine,
      badge: 'Digital Seal',
    },
    {
      title: 'Admit Card (Roll No Slip) Settings',
      description: 'Customize roll number slip templates, student photo display, exam venue instructions, and QR code verification links.',
      href: '/dashboard/settings/exam/admit-card-setting',
      icon: CreditCard,
      badge: 'Roll No Slips',
    },
    {
      title: 'Seat Plan Configuration',
      description: 'Configure hall allocation algorithms, roll spacing, column/row student density, and invigilator duty assignments.',
      href: '/dashboard/settings/exam/seat-plan-setting',
      icon: LayoutDashboard,
      badge: 'Hall Seating',
    }
  ];

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950 space-y-6">
      <div className="flex items-center text-xs text-zinc-500 mb-2">
        <Link href="/dashboard" className="hover:text-zinc-800 transition-colors">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5 mx-1" />
        <Link href="/dashboard/settings" className="hover:text-zinc-800 transition-colors">Settings</Link>
        <ChevronRight className="h-3.5 w-3.5 mx-1" />
        <span className="text-zinc-950 font-bold">Exam Settings</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Award className="h-6 w-6 text-zinc-800" />
            <span>Examination & Assessment Settings</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configure examination rules, grading criteria, report card designs, admit card templates, and examination hall seating layouts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group block p-6 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-900 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white flex items-center justify-center text-zinc-800 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-950 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                  <span>{s.title}</span>
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed mt-2">
                  {s.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-900 group-hover:text-emerald-600">
                <span>Configure Rule</span>
                <span className="text-zinc-400 group-hover:text-emerald-600">&rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
