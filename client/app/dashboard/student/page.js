'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { 
  BookOpen, Award, Monitor, Users, BookMarked, ListTodo,
  CalendarCheck, DollarSign, Star, Clock, ChevronLeft,
  ChevronRight, Sun, MapPin, Cloud, CloudRain, CloudSnow,
  Wind, Droplets, Thermometer
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 17) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function getWeatherIcon(code) {
  if (code === 0) return <Sun className="w-8 h-8 text-amber-400" />;
  if (code <= 3) return <Cloud className="w-8 h-8 text-zinc-300" />;
  if (code <= 67) return <CloudRain className="w-8 h-8 text-blue-300" />;
  if (code <= 77) return <CloudSnow className="w-8 h-8 text-sky-200" />;
  return <Wind className="w-8 h-8 text-zinc-300" />;
}

function getWeatherDesc(code) {
  if (code === 0) return 'Clear Sky';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  return 'Thunderstorm';
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const studentName = user?.fullName || user?.name || user?.username || 'Student';
  const [admissionNo, setAdmissionNo] = useState(user?.admissionNo || 'Loading...');

  useEffect(() => {
    if (user?.referenceId) {
      // We know /api/student/:id works now!
      fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + '/api/student/' + user.referenceId, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setAdmissionNo(d.data.admissionNo || 'N/A');
          setStudentDetails(d.data);
        } else {
          setAdmissionNo('ADM-' + String(user._id).slice(-5).toUpperCase());
        }
      })
      .catch(() => setAdmissionNo('ADM-' + String(user._id).slice(-5).toUpperCase()));
    } else if (user?._id) {
       setAdmissionNo('ADM-' + String(user._id).slice(-5).toUpperCase());
    }
  }, [user]);

  // Weather state
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // Open-Meteo free API — no key needed — Lahore coords
    fetch('https://api.open-meteo.com/v1/forecast?latitude=31.5497&longitude=74.3436&current_weather=true&hourly=relativehumidity_2m&timezone=Asia%2FKarachi')
      .then(r => r.json())
      .then(d => {
        if (d?.current_weather) {
          setWeather({
            temp: Math.round(d.current_weather.temperature),
            code: d.current_weather.weathercode,
            wind: Math.round(d.current_weather.windspeed),
          });
        }
      })
      .catch(() => setWeather({ temp: 33, code: 0, wind: 12 }));
  }, []);

  // Calendar
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed
  const monthName = new Date(calYear, calMonth, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };
  const goToday = () => { setCalMonth(today.getMonth()); setCalYear(today.getFullYear()); };

  const [studentDetails, setStudentDetails] = useState(null);

  const statCards = [
    { label: 'TOTAL SUBJECT', value: studentDetails?.subjects?.length || user?.subjects?.length || '0', icon: BookOpen, href: '/dashboard/student/subjects' },
    { label: 'TOTAL EXAM', value: studentDetails?.exams?.length || '0', icon: Award, href: '/dashboard/student/examinations/schedule' },
    { label: 'TOTAL ONLINE EXAM', value: studentDetails?.onlineExams?.length || '0', icon: Monitor, href: '/dashboard/student/online-exam/active' },
    { label: 'TOTAL TEACHERS', value: studentDetails?.teachers?.length || '0', icon: Users, href: '/dashboard/student/teachers' },
    { label: 'TOTAL ISSUED BOOK', value: studentDetails?.issuedBooks?.length || '0', icon: BookMarked, href: '/dashboard/student/library/book-issue' },
    { label: 'PENDING HOMEWORK', value: studentDetails?.pendingHomeworks?.length || '0', icon: ListTodo, href: '/dashboard/student/homework' },
    { label: 'ATTENDANCE THIS MONTH', value: studentDetails?.attendanceCount || '0', icon: CalendarCheck, href: '/dashboard/student/attendance' },
    { label: 'TOTAL DUE FEES', value: '$' + (studentDetails?.dueFees || '0'), icon: DollarSign, href: '/dashboard/student/fees' },
    { label: 'BEHAVIOUR POINTS', value: studentDetails?.behaviourPoints || '0', icon: Star, href: '/dashboard/student' },
  ];

  const [events, setEvents] = useState([]);
  
  // LIVE LEAVE DATA
  const [leaveData, setLeaveData] = useState([]);

  useEffect(() => {
    // 1. Fetch live leave data from the backend
    const fetchLeaves = async () => {
      try {
        const [typesRes, leavesRes] = await Promise.all([
          api.get('/leave-type').catch(() => ({ data: [] })),
          api.get('/leave').catch(() => ({ data: [] }))
        ]);
        
        let types = typesRes.data?.data || typesRes.data || [];
        let leaves = leavesRes.data?.data || leavesRes.data || [];
        
        if (Array.isArray(types)) {
          const processed = types.map(t => {
            const maxDays = t.maxDays || 0;
            // Calculate taken days
            const myLeaves = Array.isArray(leaves) ? leaves.filter(l => l.leaveTypeId === t._id && l.status === 'Approved') : [];
            let taken = 0;
            myLeaves.forEach(l => {
               const start = new Date(l.fromDate);
               const end = new Date(l.toDate);
               const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
               taken += (diff > 0 ? diff : 0);
            });
            return {
              id: t._id,
              type: t.name,
              rem: Math.max(0, maxDays - taken),
              extra: Math.max(0, taken - maxDays),
              taken: taken,
              total: maxDays
            };
          });
          setLeaveData(processed);
        }
      } catch (err) {
        console.error("Failed to fetch live leave data", err);
      }
    };
    if (user) {
      fetchLeaves();
    }
  }, [events, user]);

  return (
    <div className="space-y-6 pb-12 relative">

      {/* ── TOP HEADER BANNER (zinc/white theme) ── */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-6 sm:p-8 text-white shadow-xl">
        {/* decorative blobs */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 h-48 w-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-white/15 border border-white/20">
                {getGreeting()}
              </span>
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-zinc-700 text-zinc-200 border border-zinc-600">
                STUDENT
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white capitalize">
              {studentName}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-zinc-300">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                <span>Admission No:</span>
                <span className="font-bold text-white">{admissionNo}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate()}</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-2 flex flex-wrap gap-2">
              {[
                { name: 'Class Routine', href: '/dashboard/student/class-routine' },
                { name: 'Homework', href: '/dashboard/student/homework' },
                { name: 'Attendance', href: '/dashboard/student/attendance' },
                { name: 'Exam Schedule', href: '/dashboard/student/examinations/schedule' },
              ].map((act, idx) => (
                <Link key={idx} href={act.href}>
                  <button className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all backdrop-blur-sm cursor-pointer">
                    {act.name}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Live Weather Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex items-center gap-5 text-white min-w-[240px]">
            <div className="flex-1">
              <div className="flex items-center gap-1 text-xs font-semibold opacity-75 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Lahore, Pakistan</span>
              </div>
              <div className="text-4xl font-black">
                {weather ? `${weather.temp}°C` : '33°C'}
              </div>
              <div className="text-[11px] opacity-70 mt-0.5">
                {weather ? getWeatherDesc(weather.code) : 'Clear Sky'}
              </div>
              {weather && (
                <div className="flex items-center gap-1 text-[10px] opacity-60 mt-1">
                  <Wind className="w-3 h-3" />
                  <span>{weather?.wind || 12} km/h</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-white/10 rounded-2xl">
              {weather ? getWeatherIcon(weather.code) : <Sun className="w-8 h-8 text-amber-400" />}
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <Link key={idx} href={card.href}>
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4 cursor-pointer group">
                <div className="p-3 rounded-2xl bg-zinc-100 group-hover:bg-zinc-900 transition-colors">
                  <IconComp className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-2xl font-black text-zinc-900">{card.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 leading-tight">{card.label}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── CLASS ROUTINE ── */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900">Class Routine</h2>
          <Link href="/dashboard/student/class-routine" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">View All →</Link>
        </div>
        <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
          <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-500">No Routine Schedule Available</p>
          <p className="text-xs text-zinc-400 mt-1">Your class routine will appear here once assigned by the administrator.</p>
        </div>
      </div>

      {/* ── MONTHLY ATTENDANCE ── */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <h2 className="text-base font-bold text-zinc-900">Monthly Attendance Report</h2>
          <div className="flex items-center gap-3 text-xs font-semibold text-zinc-600">
            <span>Present: <strong className="text-emerald-600">P (0)</strong></span>
            <span>Late: <strong className="text-amber-600">L (0)</strong></span>
            <span>Absent: <strong className="text-rose-600">A (0)</strong></span>
            <span>Half: <strong className="text-zinc-500">F (0)</strong></span>
            <span>Holiday: <strong className="text-blue-600">H (0)</strong></span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border border-zinc-200 rounded-xl overflow-hidden">
            <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
              <tr>
                {['P','L','A','F','H','%',...Array.from({length: daysInMonth},(_,i)=>i+1)].map((h,i) => (
                  <th key={i} className="py-2 px-1 border-r border-zinc-200 min-w-[28px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2.5 px-1 border-r font-bold text-emerald-600">0</td>
                <td className="py-2.5 px-1 border-r font-bold text-amber-600">0</td>
                <td className="py-2.5 px-1 border-r font-bold text-rose-600">0</td>
                <td className="py-2.5 px-1 border-r font-bold text-zinc-500">0</td>
                <td className="py-2.5 px-1 border-r font-bold text-blue-600">0</td>
                <td className="py-2.5 px-1 border-r font-bold text-zinc-900">100%</td>
                {Array.from({length: daysInMonth}).map((_,i) => (
                  <td key={i} className="py-2.5 px-1 border-r text-zinc-300 font-medium">-</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FEES & EXAM ROUTINE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900">Fees</h2>
            <Link href="/dashboard/student/fees" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900">View →</Link>
          </div>
          <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <p className="text-sm font-semibold text-zinc-500">No Due Fees Found</p>
            <p className="text-xs text-zinc-400 mt-1">All your fee dues are cleared.</p>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900">Exam Routine</h2>
            <Link href="/dashboard/student/examinations/schedule" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900">View →</Link>
          </div>
          <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <p className="text-sm font-semibold text-zinc-500">No Exam Routine Published</p>
            <p className="text-xs text-zinc-400 mt-1">Upcoming test schedules will appear here.</p>
          </div>
        </div>
      </div>

      {/* ── TEACHERS & LEAVE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-zinc-900">Teachers List</h2>
          <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <p className="text-sm font-semibold text-zinc-500">No Assigned Teachers Found</p>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-zinc-900">Leave Types</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                <tr>
                  {['TYPE','REMAINING','EXTRA','TAKEN','TOTAL'].map(h => (
                    <th key={h} className="py-2.5 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {leaveData.length > 0 ? leaveData.map((l, i) => (
                  <tr key={i} className="hover:bg-zinc-50">
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">{l.type}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold">{l.rem}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{l.extra}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{l.taken}</td>
                    <td className="py-2.5 px-3 text-zinc-900 font-bold">{l.total}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-400 font-medium">
                      No Leave Types configured by Admin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── FULL CALENDAR ── */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={goToday} className="px-3 py-1 rounded-lg bg-zinc-900 text-white font-bold text-xs">Today</button>
            <span className="text-lg font-black text-zinc-900 ml-2">{monthName}</span>
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            {['Month', 'Week', 'Day', 'List'].map((mode, i) => (
              <button key={i} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${i === 0 ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'}`}>
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-100">
          {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {/* Trailing days from previous month */}
          {Array.from({length: firstDay}, (_,i) => (
            <div key={`prev-${i}`} className="p-2 border border-zinc-100 rounded-xl bg-zinc-50/30 text-xs font-semibold text-zinc-300 min-h-[44px]">
              {prevMonthDays - firstDay + i + 1}
            </div>
          ))}
          {/* Current month days */}
          {Array.from({length: daysInMonth}, (_,i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
            const dayEvent = events.find(e => e.date === day);
            
            return (
              <div key={day} className={`p-2 border rounded-xl text-xs font-bold min-h-[60px] transition-all relative ${
                isToday
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                  : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}>
                <span>{day}</span>
                {isToday && <div className="mt-1 text-[9px] font-semibold opacity-75">Today</div>}
                
                {dayEvent && (
                  <div className={`mt-2 p-1 text-[9px] font-bold rounded text-white truncate ${dayEvent.color}`}>
                    {dayEvent.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
