'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Video, Users, FileText, Settings, PlayCircle, ShieldCheck } from 'lucide-react';

export default function BBBHubPage() {
  const cards = [
    {
      title: 'Virtual Class',
      desc: 'Schedule and host interactive live online lectures with whiteboard and breakout rooms.',
      href: '/dashboard/module/bigbluebutton/virtual-class',
      icon: Video,
      color: 'bg-zinc-600 text-white'
    },
    {
      title: 'Virtual Meeting',
      desc: 'Create and organize administrative, staff, and parent-teacher virtual conferences.',
      href: '/dashboard/module/bigbluebutton/virtual-meeting',
      icon: Users,
      color: 'bg-blue-500 text-white'
    },
    {
      title: 'Class Reports',
      desc: 'Detailed class-wise BBB attendance logs, duration statistics, and student participation rates.',
      href: '/dashboard/module/bigbluebutton/class-reports',
      icon: FileText,
      color: 'bg-violet-500 text-white'
    },
    {
      title: 'Meeting Reports',
      desc: 'Historical meeting session logs, participant counts, minutes, and host attendance.',
      href: '/dashboard/module/bigbluebutton/meeting-reports',
      icon: FileText,
      color: 'bg-amber-500 text-white'
    },
    {
      title: 'Class Record List',
      desc: 'Library of all recorded virtual classroom sessions with playback and cloud download links.',
      href: '/dashboard/module/bigbluebutton/class-record-list',
      icon: PlayCircle,
      color: 'bg-indigo-500 text-white'
    },
    {
      title: 'Meeting Record List',
      desc: 'Browse and replay recorded institutional virtual meetings and webinars.',
      href: '/dashboard/module/bigbluebutton/meeting-record-list',
      icon: PlayCircle,
      color: 'bg-rose-500 text-white'
    },
    {
      title: 'BBB Settings',
      desc: 'Configure BBB API server endpoint URL, secret salt, auto-recording, and security defaults.',
      href: '/dashboard/module/bigbluebutton/settings',
      icon: Settings,
      color: 'bg-teal-500 text-white'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900">BigBlueButton Module</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">Manage virtual classrooms, meetings, recordings, and reports powered by BigBlueButton.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-zinc-900 font-medium">BigBlueButton</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active BBB Classes</div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-900 mt-1">2</div>
          <div className="text-[11px] text-zinc-800 font-medium mt-1">● Ready for launch</div>
        </div>
        <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scheduled Meetings</div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-900 mt-1">2</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">● Upcoming sessions</div>
        </div>
        <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cloud Recordings</div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-900 mt-1">7</div>
          <div className="text-[11px] text-zinc-400 font-medium mt-1">Available for playback</div>
        </div>
        <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Server Status</div>
          <div className="text-2xl font-black text-zinc-800 mt-1">Online</div>
          <div className="text-[11px] text-zinc-800 font-medium mt-1">API Connected</div>
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
