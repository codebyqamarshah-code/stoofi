'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Users, User, ArrowRight, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

export default function CustomFieldHubPage() {
  const modules = [
    {
      title: 'Student Registration Fields',
      description: 'Configure dynamic inputs, custom dropdowns, previous board roll numbers, and hostel/medical requirements for student profiles.',
      href: '/dashboard/settings/custom-field/student-registration',
      icon: Users,
      badge: 'Active Module',
      color: 'emerald'
    },
    {
      title: 'Staff Registration Fields',
      description: 'Define custom faculty credentials, biometric user IDs, salary payment details, and departmental specifications for staff records.',
      href: '/dashboard/settings/custom-field/staff-registration',
      icon: User,
      badge: 'Active Module',
      color: 'blue'
    }
  ];

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950 space-y-6">
      <div className="flex items-center text-xs text-zinc-500 mb-2">
        <Link href="/dashboard" className="hover:text-zinc-800 transition-colors">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5 mx-1" />
        <Link href="/dashboard/settings" className="hover:text-zinc-800 transition-colors">Settings</Link>
        <ChevronRight className="h-3.5 w-3.5 mx-1" />
        <span className="text-zinc-950 font-bold">Custom Fields</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Sliders className="h-6 w-6 text-zinc-800" />
            <span>Custom Fields Management</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Extend admission forms and personnel registries with institution-specific data fields, validation rules, and visibility switches.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className="group block p-6 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-900 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white flex items-center justify-center text-zinc-800 transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {m.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-950 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                <span>{m.title}</span>
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed mt-2">
                {m.description}
              </p>
              <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-900 group-hover:text-emerald-600">
                <span>Configure Fields & Rules</span>
                <span className="text-zinc-400 group-hover:text-emerald-600">&rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-950">Dynamic Validation Engine Active</h4>
            <p className="text-xs text-zinc-500">All custom fields defined here automatically integrate into the student admission wizard and staff onboarding flow.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
