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
  BookOpen, 
  RefreshCw, 
  PlayCircle,
  ExternalLink,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { formatDateDMY } from '@/lib/utils';

export default function StudentVirtualClassPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewScope, setViewScope] = useState('my_class'); // 'my_class' or 'all_classes'

  // Determine student's assigned class & section
  const studentClass = user?.className || user?.referenceId?.className || 'FSC OTT';
  const studentSection = user?.section || user?.referenceId?.section || 'A';

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/virtual-class?type=class');
      if (res && res.success && Array.isArray(res.data)) {
        setClasses(res.data);
      } else {
        setClasses([]);
      }
    } catch (err) {
      console.error('Error fetching student virtual classes:', err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Class & Section Normalizer
  const normalize = (val) => (val || '').toString().toLowerCase().replace(/^class\s+/i, '').replace(/^section\s+/i, '').trim();

  // Match class to student
  const isMatchForStudent = (item) => {
    const cClass = normalize(item.classVal);
    const sClass = normalize(studentClass);

    // If item is school-wide
    const isAllClass = !cClass || cClass === 'all' || cClass === 'all classes';
    const classMatches = isAllClass || cClass === sClass;

    if (!classMatches) return false;

    // Check section
    if (studentSection) {
      const cSec = normalize(item.section);
      const sSec = normalize(studentSection);
      const isAllSec = !cSec || cSec === 'all' || cSec === 'all sections';
      return isAllSec || cSec === sSec;
    }

    return true;
  };

  // Filtered by scope, search, and status
  const displayedClasses = useMemo(() => {
    return classes.filter(c => {
      // Scope filter
      if (viewScope === 'my_class' && !isMatchForStudent(c)) {
        return false;
      }

      // Status filter
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;

      // Search filter
      const matchSearch =
        !search ||
        (c.topic && c.topic.toLowerCase().includes(search.toLowerCase())) ||
        (c.teacher && c.teacher.toLowerCase().includes(search.toLowerCase())) ||
        (c.subject && c.subject.toLowerCase().includes(search.toLowerCase())) ||
        (c.classVal && c.classVal.toLowerCase().includes(search.toLowerCase()));

      return matchStatus && matchSearch;
    });
  }, [classes, viewScope, statusFilter, search, studentClass, studentSection]);

  const liveClasses = displayedClasses.filter(c => c.status === 'Live');
  const myClassMatchesCount = classes.filter(isMatchForStudent).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">My Online Classes</h1>
            {liveClasses.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
                <Radio className="h-3 w-3 text-emerald-600" />
                {liveClasses.length} Live Now
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-600 font-medium mt-1">
            Join live interactive lectures and access scheduled curriculum virtual classes.
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard/student" className="hover:text-zinc-900 transition-colors">
            Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 text-zinc-400" />
          <span className="text-zinc-950 font-bold">Virtual Classes</span>
        </div>
      </div>

      {/* Student Badge Card */}
      <div className="bg-gradient-to-r from-blue-900 to-[#084A86] text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Enrolled in: {studentClass}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                Section {studentSection}
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Online classroom feed automatically filtered for your academic curriculum.
            </p>
          </div>
        </div>

        {/* View Scope Toggle */}
        <div className="inline-flex rounded-xl bg-black/20 p-1 border border-white/10 shrink-0">
          <button
            onClick={() => setViewScope('my_class')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewScope === 'my_class'
                ? 'bg-white text-[#084A86] shadow-xs'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            My Class ({myClassMatchesCount})
          </button>
          <button
            onClick={() => setViewScope('all_classes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewScope === 'all_classes'
                ? 'bg-white text-[#084A86] shadow-xs'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            All Classes ({classes.length})
          </button>
        </div>
      </div>

      {/* Live Now Banner Card if any class is active */}
      {liveClasses.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
              Active Live Classroom Session
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveClasses.map(lc => (
              <div 
                key={lc._id || lc.id} 
                className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {lc.subject || 'Lecture'}
                    </span>
                    <span className="text-xs font-bold text-zinc-600">
                      {lc.classVal} ({lc.section})
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-zinc-950 line-clamp-1">{lc.topic}</h3>
                  <div className="text-[11px] text-zinc-600 font-medium flex items-center gap-1.5">
                    <User className="h-3 w-3 text-zinc-500" />
                    <span className="font-bold text-zinc-800">{lc.teacher}</span>
                  </div>
                </div>
                <a
                  href={lc.roomUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ backgroundColor: '#009966' }}
                  className="px-4 py-2 hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-sm shrink-0"
                >
                  <Video className="h-3.5 w-3.5" /> Join Live
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-950 uppercase tracking-wider">
              {viewScope === 'my_class' ? `Scheduled Classes for ${studentClass}` : 'All Scheduled Classes'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#084A86] border border-blue-200">
              {displayedClasses.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search subject, teacher, topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-950 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-[#084A86] font-medium"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#084A86]"
            >
              <option value="All">All Statuses</option>
              <option value="Live">Live Only</option>
              <option value="Scheduled">Upcoming Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              onClick={fetchClasses}
              className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              title="Refresh classes"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="text-[11px] font-bold text-[#084A86] uppercase tracking-wider bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-3.5 py-3.5">SL</th>
                <th className="px-3.5 py-3.5">Lesson Topic & Subject</th>
                <th className="px-3.5 py-3.5">Teacher</th>
                <th className="px-3.5 py-3.5">Date & Time</th>
                <th className="px-3.5 py-3.5">Duration</th>
                <th className="px-3.5 py-3.5">Status</th>
                <th className="px-3.5 py-3.5 text-right">Join Meeting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-600 font-semibold">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                      <span>Loading your virtual classes...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedClasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-600 font-semibold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Video className="h-8 w-8 text-zinc-400 stroke-1" />
                      <span className="text-zinc-950 font-bold text-sm">No Online Classes Scheduled</span>
                      <span className="text-zinc-500 text-xs">
                        {viewScope === 'my_class'
                          ? `No virtual classes scheduled for ${studentClass} (${studentSection}) yet.`
                          : 'Your teachers have not scheduled any upcoming virtual classes yet.'}
                      </span>
                      {viewScope === 'my_class' && classes.length > 0 && (
                        <button
                          onClick={() => setViewScope('all_classes')}
                          className="mt-2 text-xs font-bold text-[#084A86] hover:underline cursor-pointer"
                        >
                          View all classes across other grades ({classes.length} total)
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayedClasses.map((item, index) => {
                  const isLive = item.status === 'Live';
                  const isCompleted = item.status === 'Completed';

                  return (
                    <tr key={item._id || item.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-3.5 py-3 font-bold text-zinc-950">{index + 1}</td>
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-zinc-950 line-clamp-1">{item.topic}</div>
                        <div className="text-[11px] text-zinc-600 font-semibold flex items-center gap-2 mt-0.5">
                          <span className="text-[#084A86] font-bold">{item.subject || 'General'}</span>
                          <span className="text-zinc-400">•</span>
                          <span>{item.classVal} ({item.section})</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 font-bold text-zinc-900 whitespace-nowrap">
                        {item.teacher}
                      </td>
                      <td className="px-3.5 py-3 text-zinc-700 whitespace-nowrap font-mono text-[11px]">
                        <div className="font-bold text-zinc-950 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-zinc-500" />
                          {formatDateDMY(item.date)}
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
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#084A86] border border-blue-200">
                            Scheduled
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        {isCompleted ? (
                          <span className="text-xs text-zinc-400 font-medium">Session Ended</span>
                        ) : (
                          <a
                            href={item.roomUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              backgroundColor: isLive ? '#009966' : '#084A86'
                            }}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white inline-flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-xs"
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
