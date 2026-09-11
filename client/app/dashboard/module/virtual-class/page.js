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
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export default function VirtualClassHubPage() {
  const cards = [
    {
      title: 'Virtual Class',
      desc: 'Create, schedule, and launch live interactive video classes with students.',
      href: '/dashboard/module/virtual-class/virtual-class',
      icon: Video,
      actionText: 'Manage Classes',
      count: '2 Active'
    },
    {
      title: 'Virtual Meeting',
      desc: 'Set up administrative staff, parent-teacher conferences, and board meetings.',
      href: '/dashboard/module/virtual-class/virtual-meeting',
      icon: Users,
      actionText: 'Manage Meetings',
      count: '2 Scheduled'
    },
    {
      title: 'Class Reports',
      desc: 'Inspect detailed attendance rates, participation duration, and session histories.',
      href: '/dashboard/module/virtual-class/class-reports',
      icon: BarChart3,
      actionText: 'View Class Reports',
      count: '3 Reports'
    },
    {
      title: 'Meeting Reports',
      desc: 'Review conference minutes, attendee verification logs, and session records.',
      href: '/dashboard/module/virtual-class/meeting-reports',
      icon: FileText,
      actionText: 'View Meeting Reports',
      count: '2 Reports'
    },
    {
      title: 'Virtual Class Settings',
      desc: 'Configure Zoom Server-to-Server OAuth, meeting policies, and recording preferences.',
      href: '/dashboard/module/virtual-class/settings',
      icon: Settings,
      actionText: 'Configure Settings',
      count: 'Connected'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Virtual Class Overview
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Enterprise video classroom and conferencing management powered by Zoom.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">Module</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-emerald-400 font-medium">Virtual Class</span>
        </div>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scheduled Classes</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-emerald-950/60 text-zinc-800">
              <Video className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-3">2</div>
          <div className="text-xs text-zinc-400 mt-1">Live classes ready for today</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scheduled Meetings</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-3">2</div>
          <div className="text-xs text-zinc-400 mt-1">Staff and institutional conferences</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">API Integration</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-emerald-950/60 text-zinc-800">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-800 mt-3">Ready</div>
          <div className="text-xs text-zinc-400 mt-1">Zoom Server-to-Server OAuth active</div>
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
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-600/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white group-hover:bg-zinc-600 group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {card.count}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-emerald-400">
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
