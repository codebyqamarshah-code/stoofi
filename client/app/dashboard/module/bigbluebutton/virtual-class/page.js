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
  CheckCircle2
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function BBBVirtualClassPage() {
  const [records, setRecords] = useState([
    {
      id: 1,
      classVal: 'Class 10',
      section: 'A',
      teacher: 'Mudassir Bajwa',
      topic: 'Computer Science - Algorithms & Flowcharts',
      description: 'BigBlueButton interactive whiteboard demo with live pseudocode writing.',
      date: '2026-09-09',
      time: '10:00 AM',
      duration: '45',
      status: 'Scheduled',
      roomUrl: 'https://bbb.stoofi.com/b/mud-771-092'
    },
    {
      id: 2,
      classVal: 'Class 9',
      section: 'A',
      teacher: 'Fatima Zahra',
      topic: 'Chemistry - Chemical Kinetics & Rate of Reaction',
      description: 'Virtual lab simulations and shared presentation deck.',
      date: '2026-09-10',
      time: '12:00 PM',
      duration: '60',
      status: 'Scheduled',
      roomUrl: 'https://bbb.stoofi.com/b/fat-491-112'
    }
  ]);

  const [form, setForm] = useState({
    classVal: 'Class 10',
    section: 'A',
    teacher: 'Mudassir Bajwa',
    topic: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: '45',
    maxParticipants: '50',
    autoRecord: 'Yes',
    muteOnStart: 'Yes'
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');

  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'];
  const sections = ['A', 'B', 'C', 'D'];
  const teachers = ['Mudassir Bajwa', 'Fatima Zahra', 'Muhammad Ali', 'Ahmed Khan', 'Ayesha Noor', 'Dr. Bilal Siddiqui'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      alert('Please enter a Class Topic.');
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
        roomUrl: `https://bbb.stoofi.com/b/stoofi-${encodeURIComponent(form.classVal.toLowerCase().replace(/\s+/g, '-'))}-${Date.now().toString().slice(-4)}`
      };
      setRecords([newRec, ...records]);
    }

    setForm({
      classVal: 'Class 10',
      section: 'A',
      teacher: 'Mudassir Bajwa',
      topic: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: '45',
      maxParticipants: '50',
      autoRecord: 'Yes',
      muteOnStart: 'Yes'
    });
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      classVal: item.classVal,
      section: item.section,
      teacher: item.teacher,
      topic: item.topic,
      description: item.description || '',
      date: item.date,
      time: item.time,
      duration: item.duration,
      maxParticipants: item.maxParticipants || '50',
      autoRecord: item.autoRecord || 'Yes',
      muteOnStart: item.muteOnStart || 'Yes'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this BBB virtual class?')) {
      setRecords(records.filter(r => r.id !== id));
      if (editId === id) setEditId(null);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({
      classVal: 'Class 10',
      section: 'A',
      teacher: 'Mudassir Bajwa',
      topic: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: '45',
      maxParticipants: '50',
      autoRecord: 'Yes',
      muteOnStart: 'Yes'
    });
  };

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchesClass = filterClass === 'All' || rec.classVal === filterClass;
      const matchesSearch = !search || 
        rec.topic.toLowerCase().includes(search.toLowerCase()) ||
        rec.teacher.toLowerCase().includes(search.toLowerCase()) ||
        rec.classVal.toLowerCase().includes(search.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [records, filterClass, search]);

  const handleCopy = () => {
    const text = filteredRecords.map(r => `${r.classVal} (${r.section}) | ${r.topic} | ${r.teacher} | ${r.date} ${r.time} | ${r.duration} mins | ${r.status}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('BBB Virtual class records copied to clipboard!');
  };

  const handleExportCSV = () => {
    exportToCSV(filteredRecords, 'BBB_Virtual_Classes');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredRecords, 'BBB_Virtual_Classes');
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredRecords,
      ['classVal', 'section', 'topic', 'teacher', 'date', 'time', 'duration', 'status'],
      'BigBlueButton Virtual Classes',
      'BBB_Virtual_Classes'
    );
  };

  const handlePrint = () => {
    printData(
      filteredRecords,
      ['classVal', 'section', 'topic', 'teacher', 'date', 'time', 'duration', 'status'],
      'BigBlueButton Virtual Classes'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            BigBlueButton Virtual Class
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Host live interactive classroom sessions with whiteboard, breakout rooms, and session recording.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/bigbluebutton" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            BigBlueButton
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Virtual Class</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add / Edit Virtual Class */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                {editId ? 'Edit BBB Virtual Class' : 'Add BBB Virtual Class'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Class <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.classVal}
                    onChange={(e) => setForm({ ...form, classVal: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                  >
                    {classes.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                  >
                    {sections.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Teacher / Moderator <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.teacher}
                  onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                >
                  {teachers.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Class Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science - Algorithms & Flowcharts"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline syllabus topics or instructions..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Duration (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    required
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Auto-Record Session
                  </label>
                  <select
                    value={form.autoRecord}
                    onChange={(e) => setForm({ ...form, autoRecord: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                  >
                    <option value="Yes">Yes (Save to Recordings)</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#009966] hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {editId ? 'Update BBB Class' : 'Save BBB Virtual Class'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right List: Virtual Class List */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  BBB Virtual Class List
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {filteredRecords.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="SEARCH"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={handleCopy}
                    title="Copy Table"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleExportExcel}
                    title="Export Excel"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleExportCSV}
                    title="Export CSV"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleExportPDF}
                    title="Export PDF"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"
                  >
                    <Video className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handlePrint}
                    title="Print"
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase">
                <span>Filter Class:</span>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="All">All Classes</option>
                  {classes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-3.5 py-3">SL</th>
                    <th className="px-3.5 py-3">Class (Sec)</th>
                    <th className="px-3.5 py-3">Topic</th>
                    <th className="px-3.5 py-3">Moderator</th>
                    <th className="px-3.5 py-3">Date & Time</th>
                    <th className="px-3.5 py-3">Duration</th>
                    <th className="px-3.5 py-3">Status</th>
                    <th className="px-3.5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
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
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-200">
                          {index + 1}
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {item.classVal}
                          </span>
                          <span className="text-zinc-400 ml-1">({item.section})</span>
                        </td>
                        <td className="px-3.5 py-3">
                          <div className="font-semibold text-zinc-900 dark:text-white line-clamp-1">
                            {item.topic}
                          </div>
                          {item.description && (
                            <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="px-3.5 py-3 font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                          {item.teacher}
                        </td>
                        <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          <div>{item.date}</div>
                          <div className="text-[10px] text-zinc-400">{item.time}</div>
                        </td>
                        <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {item.duration} Mins
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={item.roomUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-[#009966] hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Video className="h-3 w-3" />
                              Join BBB
                            </a>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded transition-colors"
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
                  className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-50 cursor-not-allowed"
                >
                  &lt;
                </button>
                <button
                  className="px-2.5 py-1 rounded border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold"
                >
                  1
                </button>
                <button
                  disabled
                  className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-50 cursor-not-allowed"
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
