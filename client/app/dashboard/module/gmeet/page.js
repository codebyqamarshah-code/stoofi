'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Video, 
  Users, 
  FileText, 
  Settings, 
  PlayCircle, 
  CheckCircle2, 
  Radio, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import api from '@/services/api';

export default function GMeetHubPage() {
  const [stats, setStats] = useState({
    activeClasses: 1,
    scheduledMeetings: 2,
    totalSessions: 5,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/virtual-class');
        if (res && res.success && Array.isArray(res.data)) {
          const live = res.data.filter(r => r.status === 'Live').length;
          const meetings = res.data.filter(r => r.type === 'meeting').length;
          setStats({
            activeClasses: live,
            scheduledMeetings: meetings,
            totalSessions: res.data.length,
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  const cards = [
    {
      title: 'Virtual Class',
      desc: 'Schedule and launch Google Meet online classroom sessions with auto-generated links and live attendance.',
      href: '/dashboard/module/gmeet/virtual-class',
      icon: Video,
      badge: 'Interactive Classes',
      color: 'bg-zinc-950 text-white'
    },
    {
      title: 'Virtual Meeting',
      desc: 'Create and organize administrative, staff, and parent conferences via Google Meet with agendas and minutes.',
      href: '/dashboard/module/gmeet/virtual-meeting',
      icon: Users,
      badge: 'Staff Conferences',
      color: 'bg-zinc-900 text-white'
    },
    {
      title: 'Class Reports',
      desc: 'Analyze Google Meet classroom session attendance, student participation rates, and timelines.',
      href: '/dashboard/module/gmeet/class-reports',
      icon: FileText,
      badge: 'Attendance Analytics',
      color: 'bg-zinc-950 text-white'
    },
    {
      title: 'Meeting Reports',
      desc: 'Review historical Google Meet call summaries, attendee counts, and meeting minutes.',
      href: '/dashboard/module/gmeet/meeting-reports',
      icon: FileText,
      badge: 'Minutes & Logs',
      color: 'bg-zinc-900 text-white'
    },
    {
      title: 'GMeet Settings',
      desc: 'Configure Google Workspace domain integration, OAuth credentials, and room security defaults.',
      href: '/dashboard/module/gmeet/settings',
      icon: Settings,
      badge: 'Configuration',
      color: 'bg-zinc-950 text-white'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Google Meet Module</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="h-3 w-3 animate-pulse text-emerald-600" />
              Connected & Ready
            </span>
          </div>
          <p className="text-sm text-zinc-600 font-medium mt-1">Host seamless virtual classes and institutional meetings with Google Meet integration.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/module/gmeet/virtual-class"
            className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <PlayCircle className="h-4 w-4" /> Start Virtual Class
          </Link>
          <div className="hidden md:flex items-center text-xs text-zinc-500 font-medium">
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-bold">Google Meet</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Live Rooms</div>
          <div className="text-2xl font-black text-emerald-700 mt-1 flex items-center gap-2">
            {stats.activeClasses}
            {stats.activeClasses > 0 && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">● Ready for launch</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scheduled Meetings</div>
          <div className="text-2xl font-black text-zinc-950 mt-1">{stats.scheduledMeetings}</div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">● Upcoming sessions</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Recorded Sessions</div>
          <div className="text-2xl font-black text-zinc-950 mt-1">{stats.totalSessions}</div>
          <div className="text-[11px] text-zinc-600 font-medium mt-1">Total curriculum calls</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Workspace Sync</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">Active</div>
          <div className="text-[11px] text-zinc-600 font-medium mt-1">Domain Verified (Google Meet)</div>
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
              className="group bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color} shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                    {c.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-950 group-hover:text-zinc-900 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed font-medium">
                  {c.desc}
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-zinc-950 uppercase tracking-wider mt-5">
                Open Module <ChevronRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
