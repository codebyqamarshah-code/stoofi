'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Copy, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Calendar, 
  Download,
  MapPin,
  CalendarDays
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function EventPage() {
  const [records, setRecords] = useState([
    {
      id: 1,
      title: 'Annual Science Fair & Robotics Exhibition',
      eventFor: 'All',
      startDate: '2026-09-22',
      endDate: '2026-09-24',
      location: 'School Main Auditorium',
      description: 'Students from Grade 6 to 10 will showcase science models, coding projects, and robotics builds.',
      status: 'Upcoming'
    },
    {
      id: 2,
      title: 'Milad-un-Nabi Spiritual Assembly',
      eventFor: 'All',
      startDate: '2026-09-28',
      endDate: '2026-09-28',
      location: 'Central Lawn',
      description: 'Annual Naat recitation and spiritual gathering for students and parents.',
      status: 'Upcoming'
    },
    {
      id: 3,
      title: 'Inter-School Cricket Championship - Qualifier Round',
      eventFor: 'Students',
      startDate: '2026-10-02',
      endDate: '2026-10-05',
      location: 'Sports Complex Cricket Ground',
      description: 'Under-16 regional school cricket tournament fixtures.',
      status: 'Upcoming'
    }
  ]);

  const [form, setForm] = useState({
    title: '',
    eventFor: 'All',
    startDate: '2026-09-20',
    endDate: '2026-09-21',
    location: '',
    description: '',
    status: 'Upcoming'
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const audiences = ['All', 'Students', 'Teachers', 'Parents', 'Staff'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter an Event Title.');
      return;
    }

    if (editId) {
      setRecords(records.map(r => r.id === editId ? { ...r, ...form } : r));
      setSuccessMsg('Event updated successfully!');
      setEditId(null);
    } else {
      setRecords([{ id: Date.now(), ...form }, ...records]);
      setSuccessMsg('New event scheduled successfully!');
    }

    setForm({
      title: '',
      eventFor: 'All',
      startDate: '2026-09-20',
      endDate: '2026-09-21',
      location: '',
      description: '',
      status: 'Upcoming'
    });

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      title: item.title,
      eventFor: item.eventFor,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location || '',
      description: item.description || '',
      status: item.status || 'Upcoming'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setRecords(records.filter(r => r.id !== id));
      if (editId === id) cancelEdit();
      setSuccessMsg('Event deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({
      title: '',
      eventFor: 'All',
      startDate: '2026-09-20',
      endDate: '2026-09-21',
      location: '',
      description: '',
      status: 'Upcoming'
    });
  };

  const filteredRecords = useMemo(() => records.filter(rec => {
    const matchAudience = filterAudience === 'All' || rec.eventFor === filterAudience || rec.eventFor === 'All';
    const matchSearch = !search || 
      rec.title.toLowerCase().includes(search.toLowerCase()) || 
      (rec.location && rec.location.toLowerCase().includes(search.toLowerCase())) ||
      (rec.description && rec.description.toLowerCase().includes(search.toLowerCase()));
    return matchAudience && matchSearch;
  }), [records, filterAudience, search]);

  const handleCopy = () => {
    navigator.clipboard.writeText(filteredRecords.map(r => `${r.title} | ${r.eventFor} | ${r.startDate} to ${r.endDate} | Venue: ${r.location}`).join('\n'));
    alert('Events copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Events & Celebrations</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Schedule and publish school events, academic exhibitions, ceremonies, and galas.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Communicate</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Event</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                {editId ? 'Edit Event' : 'Add Event'}
              </h2>
              {editId && (
                <button onClick={cancelEdit} className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer">
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Sports Gala 2026"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Event For <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.eventFor}
                  onChange={(e) => setForm({ ...form, eventFor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                >
                  {audiences.map(a => <option key={a} value={a}>{a === 'All' ? 'All (Students, Parents, Teachers)' : a}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Auditorium / Main Ground"
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Event Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Event details, schedule, or rules..."
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full px-6 py-2.5 bg-[#009966] hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {editId ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Event Schedule List</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {filteredRecords.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="SEARCH EVENTS"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <button onClick={handleCopy} title="Copy" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToExcel(filteredRecords, 'Events')} title="Excel" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><FileSpreadsheet className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToCSV(filteredRecords, 'Events')} title="CSV" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><FileText className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToPDF(filteredRecords, ['title', 'eventFor', 'startDate', 'endDate', 'location'], 'School Events', 'Events')} title="PDF" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><Download className="h-3.5 w-3.5" /></button>
                  <button onClick={() => printData(filteredRecords, ['title', 'eventFor', 'startDate', 'endDate', 'location'], 'School Events')} title="Print" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><Printer className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-zinc-500 uppercase">Filter Audience:</span>
              <select
                value={filterAudience}
                onChange={(e) => setFilterAudience(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Audiences</option>
                {audiences.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-3.5 py-3">SL</th>
                    <th className="px-3.5 py-3">Event Title</th>
                    <th className="px-3.5 py-3">Event For</th>
                    <th className="px-3.5 py-3">Start Date</th>
                    <th className="px-3.5 py-3">End Date</th>
                    <th className="px-3.5 py-3">Venue</th>
                    <th className="px-3.5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">No Events Scheduled</td></tr>
                  ) : filteredRecords.map((item, index) => (
                    <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-200">{index + 1}</td>
                      <td className="px-3.5 py-3">
                        <div className="font-semibold text-zinc-900 dark:text-white line-clamp-1">{item.title}</div>
                        {item.description && <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{item.description}</div>}
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {item.eventFor}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.startDate}</td>
                      <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.endDate}</td>
                      <td className="px-3.5 py-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{item.location || '-'}</td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedEvent(item)}
                            className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="h-3 w-3" /> View
                          </button>
                          <button onClick={() => handleEdit(item)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded transition-colors" title="Edit">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 rounded transition-colors" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between pt-4 mt-2 text-xs text-zinc-500">
              <div>Showing {filteredRecords.length} of {records.length} entries</div>
              <div className="flex items-center gap-1">
                <button disabled className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-50 cursor-not-allowed">&lt;</button>
                <button className="px-2.5 py-1 rounded border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold">1</button>
                <button disabled className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-50 cursor-not-allowed">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-600" /> Event Details
              </h3>
              <button onClick={() => setSelectedEvent(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white font-bold text-sm">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                <div className="font-bold text-sm text-zinc-900 dark:text-white">{selectedEvent.title}</div>
                <div className="text-zinc-500 mt-1">Target Audience: <strong>{selectedEvent.eventFor}</strong></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 block">Dates:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedEvent.startDate} to {selectedEvent.endDate}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 block">Venue / Location:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedEvent.location || 'Campus Premises'}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 block font-semibold mb-1">Description:</span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{selectedEvent.description || 'No additional description.'}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
