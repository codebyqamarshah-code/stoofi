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
  Plus, 
  Edit, 
  Trash2, 
  Video, 
  ExternalLink,
  Users,
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function JitsiVirtualMeetingPage() {
  const [records, setRecords] = useState([]);

  const [form, setForm] = useState({
    topic: '',
    host: 'Mudassir Bajwa',
    audience: 'All Teachers',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: '45',
    joinBeforeHost: '10',
    password: ''
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');

  const hosts = ['Mudassir Bajwa', 'Fatima Zahra', 'Muhammad Ali', 'Ahmed Khan', 'Ayesha Noor', 'Dr. Bilal Siddiqui'];
  const audienceOptions = ['All Teachers', 'Staff Members', 'Parents', 'Admin & Management', 'General'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      alert('Please enter a Meeting Topic.');
      return;
    }

    if (editId) {
      setRecords(records.map(r => r.id === editId ? { ...r, ...form } : r));
      setEditId(null);
    } else {
      const newRec = {
        id: Date.now(),
        ...form,
        status: 'Scheduled',
        roomUrl: `https://meet.jit.si/stoofi-meeting-${encodeURIComponent(form.topic.toLowerCase().replace(/[^a-z0-9]/g, '-'))}-${Date.now().toString().slice(-4)}`
      };
      setRecords([newRec, ...records]);
    }

    setForm({
      topic: '',
      host: 'Mudassir Bajwa',
      audience: 'All Teachers',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: '45',
      joinBeforeHost: '10',
      password: ''
    });
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      topic: item.topic,
      host: item.host,
      audience: item.audience,
      description: item.description || '',
      date: item.date,
      time: item.time,
      duration: item.duration,
      joinBeforeHost: item.joinBeforeHost || '10',
      password: item.password || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this virtual meeting?')) {
      setRecords(records.filter(r => r.id !== id));
      if (editId === id) {
        setEditId(null);
      }
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({
      topic: '',
      host: 'Mudassir Bajwa',
      audience: 'All Teachers',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: '45',
      joinBeforeHost: '10',
      password: ''
    });
  };

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchesAudience = filterAudience === 'All' || rec.audience === filterAudience;
      const matchesSearch = !search || 
        rec.topic.toLowerCase().includes(search.toLowerCase()) ||
        rec.host.toLowerCase().includes(search.toLowerCase()) ||
        rec.audience.toLowerCase().includes(search.toLowerCase());
      return matchesAudience && matchesSearch;
    });
  }, [records, filterAudience, search]);

  const handleCopy = () => {
    const text = filteredRecords.map(r => `${r.topic} | ${r.host} | ${r.audience} | ${r.date} ${r.time} | ${r.duration} mins | ${r.status}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Meeting records copied to clipboard!');
  };

  const handleExportCSV = () => {
    exportToCSV(filteredRecords, 'Jitsi_Virtual_Meetings');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredRecords, 'Jitsi_Virtual_Meetings');
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredRecords,
      ['topic', 'host', 'audience', 'date', 'time', 'duration', 'status'],
      'Jitsi Virtual Meetings',
      'Jitsi_Virtual_Meetings'
    );
  };

  const handlePrint = () => {
    printData(
      filteredRecords,
      ['topic', 'host', 'audience', 'date', 'time', 'duration', 'status'],
      'Jitsi Virtual Meetings'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900">
            Jitsi Virtual Meeting
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">
            Schedule and manage staff, parent, and institutional online video conferences.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/jitsi" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">
            Jitsi
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-zinc-900 font-medium">Virtual Meeting</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add / Edit Meeting */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-200">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">
                {editId ? 'Edit Virtual Meeting' : 'Add Virtual Meeting'}
              </h2>
              {editId && (
                <button
                  onClick={cancelEdit}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                  Meeting Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Weekly Academic Review"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                    Host / Organizer <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.host}
                    onChange={(e) => setForm({ ...form, host: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  >
                    {hosts.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                    Audience <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  >
                    {audienceOptions.map(aud => (
                      <option key={aud} value={aud}>{aud}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Meeting agenda or briefing note..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                    Meeting Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                    Meeting Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                    Duration (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="360"
                    required
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                    Join Before Host
                  </label>
                  <select
                    value={form.joinBeforeHost}
                    onChange={(e) => setForm({ ...form, joinBeforeHost: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  >
                    <option value="0">Disabled</option>
                    <option value="5">5 Minutes</option>
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                  Room Password (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Set room password..."
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {editId ? 'Update Meeting' : 'Save Virtual Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right List: Virtual Meeting List */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6">
            {/* Header with Title and Search/Export Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-200">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">
                  Virtual Meeting List
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-300 dark:border-zinc-200">
                  {filteredRecords.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="SEARCH"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-900 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-200">
                  <button
                    onClick={handleCopy}
                    title="Copy Table"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleExportExcel}
                    title="Export Excel"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleExportCSV}
                    title="Export CSV"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleExportPDF}
                    title="Export PDF"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
                  >
                    <Video className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handlePrint}
                    title="Print"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase">
                <span>Filter Audience:</span>
                <select
                  value={filterAudience}
                  onChange={(e) => setFilterAudience(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-900 text-xs outline-none focus:ring-1 focus:ring-zinc-600"
                >
                  <option value="All">All Audiences</option>
                  {audienceOptions.map(aud => (
                    <option key={aud} value={aud}>{aud}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-200">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-zinc-900 font-bold dark:text-zinc-600 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-50/50 border-b border-zinc-200 dark:border-zinc-200">
                  <tr>
                    <th className="px-3.5 py-3">SL</th>
                    <th className="px-3.5 py-3">Meeting Topic</th>
                    <th className="px-3.5 py-3">Host</th>
                    <th className="px-3.5 py-3">Audience</th>
                    <th className="px-3.5 py-3">Date & Time</th>
                    <th className="px-3.5 py-3">Duration</th>
                    <th className="px-3.5 py-3">Status</th>
                    <th className="px-3.5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                        No Data Available In Table
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-100/40 transition-colors"
                      >
                        <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-800">
                          {index + 1}
                        </td>
                        <td className="px-3.5 py-3">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-900 line-clamp-1">
                            {item.topic}
                          </div>
                          {item.description && (
                            <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="px-3.5 py-3 font-medium text-zinc-700 dark:text-zinc-700">
                          {item.host}
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                            {item.audience}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap">
                          <div>{item.date}</div>
                          <div className="text-[10px] text-zinc-400">{item.time}</div>
                        </td>
                        <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap">
                          {item.duration} Mins
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 text-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={item.roomUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Video className="h-3 w-3" />
                              Join
                            </a>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-100 text-zinc-600 dark:text-zinc-600 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Table Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-2 text-xs text-zinc-500">
              <div>
                Showing {filteredRecords.length > 0 ? 1 : 0} to {filteredRecords.length} of {records.length} entries
              </div>
              <div className="flex items-center gap-1 self-end sm:self-auto">
                <button
                  disabled
                  className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed"
                >
                  &lt;
                </button>
                <button
                  className="px-2.5 py-1 rounded border border-zinc-600 bg-zinc-100 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 font-semibold"
                >
                  1
                </button>
                <button
                  disabled
                  className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
