'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Trash2,
  Users
} from 'lucide-react';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState('September 2026');
  const [events, setEvents] = useState([
    { id: 1, title: 'Term 1 Midterm Examinations', date: '2026-09-08', type: 'Exam', color: 'bg-rose-500', time: '08:30 AM' },
    { id: 2, title: 'Annual Science Fair & Exhibition', date: '2026-09-15', type: 'Event', color: 'bg-zinc-600', time: '10:00 AM' },
    { id: 3, title: 'Parent-Teacher Meeting (PTM)', date: '2026-09-18', type: 'Meeting', color: 'bg-blue-500', time: '09:00 AM' },
    { id: 4, title: 'Teacher Training Workshop', date: '2026-09-22', type: 'Workshop', color: 'bg-violet-500', time: '02:00 PM' },
    { id: 5, title: 'Milad-un-Nabi Holiday', date: '2026-09-28', type: 'Holiday', color: 'bg-amber-500', time: 'All Day' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '2026-09-10',
    type: 'Event',
    time: '10:00 AM'
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    const colors = {
      Exam: 'bg-rose-500',
      Event: 'bg-zinc-600',
      Meeting: 'bg-blue-500',
      Workshop: 'bg-violet-500',
      Holiday: 'bg-amber-500'
    };
    setEvents([...events, { id: Date.now(), ...newEvent, color: colors[newEvent.type] || 'bg-zinc-600' }]);
    setShowModal(false);
    setNewEvent({ title: '', date: '2026-09-10', type: 'Event', time: '10:00 AM' });
  };

  const handleDelete = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  // 30 days grid for Sept 2026 (starts on Tuesday)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Academic Calendar</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Interactive institutional calendar with exams, meetings, holidays, and event schedules.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">Communicate</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-emerald-400 font-medium">Calendar</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <button className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{currentMonth}</h2>
                <button className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Event
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-zinc-400 uppercase py-2">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {/* Offset for Tuesday start in Sept 2026 */}
              <div className="h-20 rounded-xl bg-zinc-50/40 dark:bg-zinc-800/20 border border-transparent"></div>
              <div className="h-20 rounded-xl bg-zinc-50/40 dark:bg-zinc-800/20 border border-transparent"></div>

              {daysInMonth.map(day => {
                const dateStr = `2026-09-${day.toString().padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dateStr);
                const isToday = day === 4;

                return (
                  <div
                    key={day}
                    onClick={() => {
                      setNewEvent({ ...newEvent, date: dateStr });
                      setShowModal(true);
                    }}
                    className={`h-20 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isToday
                        ? 'border-zinc-600 bg-zinc-100/50 dark:bg-emerald-950/30'
                        : 'border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-600/50 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isToday ? 'text-zinc-800 font-black' : 'text-zinc-700 dark:text-zinc-300'}`}>{day}</span>
                      {dayEvents.length > 0 && (
                        <span className="h-2 w-2 rounded-full bg-zinc-600"></span>
                      )}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayEvents.slice(0, 1).map(ev => (
                        <div key={ev.id} className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded truncate bg-zinc-800">
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 1 && (
                        <div className="text-[9px] text-zinc-400 font-bold">+{dayEvents.length - 1} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-zinc-800" /> Scheduled Items ({events.length})
            </h2>

            <div className="space-y-3">
              {events.map(ev => (
                <div key={ev.id} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-wider block">{ev.type}</span>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white mt-0.5">{ev.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1">
                      <span>{ev.date}</span>
                      <span>•</span>
                      <span>{ev.time}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(ev.id)} className="text-zinc-400 hover:text-rose-500 p-1" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">Add Calendar Event</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event title..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-zinc-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-zinc-600"
                  >
                    <option value="Event">Event</option>
                    <option value="Exam">Exam</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Time</label>
                <input
                  type="text"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-zinc-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
