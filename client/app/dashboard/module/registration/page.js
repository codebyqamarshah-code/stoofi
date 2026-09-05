'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  UserPlus, 
  Users, 
  Settings, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  DollarSign 
} from 'lucide-react';

export default function RegistrationHubPage() {
  const cards = [
    {
      title: 'Student List',
      desc: 'Browse, verify, approve, or reject incoming online student admission applications.',
      href: '/dashboard/module/registration/student-list',
      icon: Users,
      actionText: 'Review Applications',
      count: '4 Applications'
    },
    {
      title: 'Registration Settings',
      desc: 'Configure admission dates, required certificates, processing fee, and policies.',
      href: '/dashboard/module/registration/settings',
      icon: Settings,
      actionText: 'Configure Portal',
      count: 'Active Session'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Online Registration Portal
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage public student admission requests, document verification, and enrolment workflow.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Module</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Registration</span>
        </div>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Submissions</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <UserPlus className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-3">4</div>
          <div className="text-xs text-zinc-400 mt-1">Total registered applicants</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pending Review</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 mt-3">2</div>
          <div className="text-xs text-zinc-400 mt-1">Awaiting admin decision</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Approved</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mt-3">1</div>
          <div className="text-xs text-zinc-400 mt-1">Enrolled into academic stream</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Portal Status</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-600 mt-3">Open</div>
          <div className="text-xs text-zinc-400 mt-1">Session 2026-2027 Active</div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {card.count}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>{card.actionText}</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
