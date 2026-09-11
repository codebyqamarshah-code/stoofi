'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Video, Users, FileText, Settings } from 'lucide-react';

export default function GMeetHubPage() {
  const cards = [
    {
      title: 'Virtual Class',
      desc: 'Schedule and launch Google Meet online classroom sessions with auto-generated links.',
      href: '/dashboard/module/gmeet/virtual-class',
      icon: Video,
      color: 'bg-zinc-600 text-white'
    },
    {
      title: 'Virtual Meeting',
      desc: 'Create and organize administrative, staff, and parent conferences via Google Meet.',
      href: '/dashboard/module/gmeet/virtual-meeting',
      icon: Users,
      color: 'bg-blue-500 text-white'
    },
    {
      title: 'Class Reports',
      desc: 'Analyze Google Meet classroom session attendance, participant lists, and timelines.',
      href: '/dashboard/module/gmeet/class-reports',
      icon: FileText,
      color: 'bg-violet-500 text-white'
    },
    {
      title: 'Meeting Reports',
      desc: 'Review historical Google Meet call summaries, attendee counts, and meeting minutes.',
      href: '/dashboard/module/gmeet/meeting-reports',
      icon: FileText,
      color: 'bg-amber-500 text-white'
    },
    {
      title: 'GMeet Settings',
      desc: 'Configure Google Workspace domain integration, OAuth credentials, and room security.',
      href: '/dashboard/module/gmeet/settings',
      icon: Settings,
      color: 'bg-teal-500 text-white'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900">Google Meet Module</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">Host seamless virtual classes and institutional meetings with Google Meet integration.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-zinc-900 font-medium">Google Meet</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Meet Classes</div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-900 mt-1">2</div>
          <div className="text-[11px] text-zinc-800 font-medium mt-1">● Ready for launch</div>
        </div>
        <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scheduled Meetings</div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-900 mt-1">2</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">● Upcoming sessions</div>
        </div>
        <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Attended (MTD)</div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-900 mt-1">95</div>
          <div className="text-[11px] text-zinc-800 font-medium mt-1">95.2% Avg Attendance</div>
        </div>
        <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Workspace Sync</div>
          <div className="text-2xl font-black text-zinc-800 mt-1">Active</div>
          <div className="text-[11px] text-zinc-800 font-medium mt-1">Domain Verified</div>
        </div>
      </div>

      {/* Grid of Sub-modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              href={c.href}
              className="group bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 hover:border-zinc-600/50 dark:hover:border-zinc-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.color} shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-900 group-hover:text-zinc-800 dark:group-hover:text-zinc-950 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-2 leading-relaxed">
                  {c.desc}
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-zinc-800 dark:text-zinc-900 uppercase tracking-wider mt-5">
                Open Module <ChevronRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
