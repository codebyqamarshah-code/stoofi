'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Video, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  ExternalLink, 
  Plus, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export default function JitsiHubPage() {
  const cards = [
    {
      title: 'Virtual Class',
      desc: 'Schedule and host interactive online classroom lectures with students.',
      href: '/dashboard/module/jitsi/virtual-class',
      icon: Video,
      actionText: 'Manage Virtual Classes',
      count: '2 Active'
    },
    {
      title: 'Virtual Meeting',
      desc: 'Organize institutional conferences with teachers, parents, and administrative staff.',
      href: '/dashboard/module/jitsi/virtual-meeting',
      icon: Users,
      actionText: 'Manage Meetings',
      count: '3 Scheduled'
    },
    {
      title: 'Class Reports',
      desc: 'Analyze lecture attendance logs, participant timestamps, and engagement rates.',
      href: '/dashboard/module/jitsi/class-reports',
      icon: BarChart3,
      actionText: 'View Class Reports',
      count: '4 Reports'
    },
    {
      title: 'Meeting Reports',
      desc: 'Examine minutes, attendee counts, and historical logs of all administrative meetings.',
      href: '/dashboard/module/jitsi/meeting-reports',
      icon: FileText,
      actionText: 'View Meeting Reports',
      count: '3 Reports'
    },
    {
      title: 'Jitsi Settings',
      desc: 'Configure Jitsi Meet server URL, room security, audio/video presets, and credentials.',
      href: '/dashboard/module/jitsi/settings',
      icon: Settings,
      actionText: 'Configure Settings',
      count: 'Configured'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900">
            Jitsi Live Learning & Conferencing
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">
            Integrated high-definition open-source video conferencing module for Stoofi ERP.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">Module</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-zinc-900 font-medium">Jitsi</span>
        </div>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scheduled Classes</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-100 text-zinc-800">
              <Video className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-900 mt-3">2</div>
          <div className="text-xs text-zinc-400 mt-1">Upcoming live sessions this week</div>
        </div>

        <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scheduled Meetings</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-900 mt-3">3</div>
          <div className="text-xs text-zinc-400 mt-1">Institutional & staff meetings</div>
        </div>

        <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Server Status</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-100 text-zinc-800">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-800 mt-3">Online</div>
          <div className="text-xs text-zinc-400 mt-1">Connected to https://meet.jit.si</div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 hover:border-zinc-600/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-900 group-hover:bg-zinc-600 group-hover:text-zinc-950 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-700">
                    {card.count}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-900 group-hover:text-zinc-800 dark:group-hover:text-zinc-950 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-2 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-200/80 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-900">
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
