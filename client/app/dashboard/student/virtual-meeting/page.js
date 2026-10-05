'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Video, 
  Radio, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  RefreshCw, 
  PlayCircle
} from 'lucide-react';
import api from '@/services/api';

export default function StudentVirtualMeetingPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/virtual-class?type=meeting');
      if (res && res.success && Array.isArray(res.data)) {
        setMeetings(res.data);
      } else {
        setMeetings([]);
      }
    } catch (err) {
      console.error('Error fetching student virtual meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const matchSearch =
        !search ||
        (m.topic && m.topic.toLowerCase().includes(search.toLowerCase())) ||
        (m.teacher && m.teacher.toLowerCase().includes(search.toLowerCase())) ||
        (m.audience && m.audience.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    });
  }, [meetings, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Virtual Meetings & Assemblies</h1>
          <p className="text-sm text-zinc-600 font-medium mt-1">Join institutional assemblies, orientation sessions, and parent-student conferences via Google Meet.</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard/student" className="hover:text-zinc-900 transition-colors">Portal</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Virtual Meetings</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-950 uppercase tracking-wider">Scheduled Meetings</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-900 border border-zinc-200">
              {filteredMeetings.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search meeting topic, host..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-950 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
              />
            </div>
            <button
              onClick={fetchMeetings}
              className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors"
              title="Refresh meetings"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-3.5 py-3.5">SL</th>
                <th className="px-3.5 py-3.5">Meeting Topic</th>
                <th className="px-3.5 py-3.5">Host</th>
                <th className="px-3.5 py-3.5">Audience</th>
                <th className="px-3.5 py-3.5">Date & Time</th>
                <th className="px-3.5 py-3.5">Duration</th>
                <th className="px-3.5 py-3.5">Status</th>
                <th className="px-3.5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-600 font-semibold">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-zinc-900" />
                    Loading meetings...
                  </td>
                </tr>
              ) : filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-600 font-semibold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-zinc-400 stroke-1" />
                      <span className="text-zinc-950 font-bold text-sm">No Meetings Scheduled</span>
                      <span className="text-zinc-500 text-xs">There are currently no active meetings or assemblies scheduled for you.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((item, index) => {
                  const isLive = item.status === 'Live';
                  const isCompleted = item.status === 'Completed';

                  return (
                    <tr key={item._id || item.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-3.5 py-3 font-bold text-zinc-950">{index + 1}</td>
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-zinc-950 line-clamp-1">{item.topic}</div>
                        {item.description && (
                          <div className="text-[11px] text-zinc-500 line-clamp-1 font-medium mt-0.5">{item.description}</div>
                        )}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-zinc-900 whitespace-nowrap">
                        {item.teacher}
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                          {item.audience || 'All Students'}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-zinc-700 whitespace-nowrap">
                        <div className="font-bold text-zinc-950 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-zinc-500" />
                          {item.date}
                        </div>
                        <div className="text-[10px] text-zinc-600 font-semibold flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-zinc-400" />
                          {item.time}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-zinc-800 whitespace-nowrap font-bold">
                        {item.duration} Mins
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            LIVE NOW
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Scheduled
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        {isCompleted ? (
                          <span className="text-xs text-zinc-400 font-medium">Concluded</span>
                        ) : (
                          <a
                            href={item.roomUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs ${
                              isLive
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                                : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                            }`}
                          >
                            <Video className="h-3.5 w-3.5" />
                            {isLive ? 'Join Live Now' : 'Join Meeting'}
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
