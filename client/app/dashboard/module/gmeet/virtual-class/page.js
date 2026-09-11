'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Copy, FileSpreadsheet, FileText, Printer, Edit, Trash2, Video, CheckCircle2 } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function GMeetVirtualClassPage() {
  const [records, setRecords] = useState([
    {
      id: 1,
      topic: 'Mathematics - Trigonometry & Derivatives',
      classVal: 'Class 10',
      section: 'A',
      teacher: 'Muhammad Ali',
      date: '2026-09-08',
      time: '09:00 AM',
      duration: '45',
      status: 'Scheduled',
      roomUrl: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: 2,
      topic: 'English - Speech & Debate Workshop',
      classVal: 'Class 9',
      section: 'B',
      teacher: 'Ayesha Noor',
      date: '2026-09-08',
      time: '11:00 AM',
      duration: '40',
      status: 'Scheduled',
      roomUrl: 'https://meet.google.com/xyz-uvwx-rst'
    }
  ]);

  const [form, setForm] = useState({
    topic: '',
    classVal: 'Class 10',
    section: 'A',
    teacher: 'Muhammad Ali',
    date: '2026-09-08',
    time: '09:00',
    duration: '45',
    meetCode: ''
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');

  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  const sections = ['A', 'B', 'C', 'D'];
  const teachers = ['Mudassir Bajwa', 'Fatima Zahra', 'Muhammad Ali', 'Ahmed Khan', 'Ayesha Noor', 'Dr. Bilal Siddiqui'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic.trim()) { alert('Please enter a Topic.'); return; }
    const code = form.meetCode.trim() || `esk-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    const url = `https://meet.google.com/${code}`;

    if (editId) {
      setRecords(records.map(r => r.id === editId ? { ...r, ...form, roomUrl: url } : r));
      setEditId(null);
    } else {
      setRecords([{ id: Date.now(), ...form, roomUrl: url, status: 'Scheduled' }, ...records]);
    }
    setForm({ topic: '', classVal: 'Class 10', section: 'A', teacher: 'Muhammad Ali', date: '2026-09-08', time: '09:00', duration: '45', meetCode: '' });
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      topic: item.topic,
      classVal: item.classVal,
      section: item.section,
      teacher: item.teacher,
      date: item.date,
      time: item.time,
      duration: item.duration,
      meetCode: item.roomUrl ? item.roomUrl.replace('https://meet.google.com/', '') : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this virtual class?')) {
      setRecords(records.filter(r => r.id !== id));
      if (editId === id) setEditId(null);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ topic: '', classVal: 'Class 10', section: 'A', teacher: 'Muhammad Ali', date: '2026-09-08', time: '09:00', duration: '45', meetCode: '' });
  };

  const filteredRecords = useMemo(() => records.filter(rec => {
    const matchClass = filterClass === 'All' || rec.classVal === filterClass;
    const matchSearch = !search || rec.topic.toLowerCase().includes(search.toLowerCase()) || rec.teacher.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  }), [records, filterClass, search]);

  const handleCopy = () => {
    navigator.clipboard.writeText(filteredRecords.map(r => `${r.topic} | ${r.classVal}(${r.section}) | ${r.teacher} | ${r.date} ${r.time} | ${r.duration} mins`).join('\n'));
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Google Meet Virtual Class</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Schedule and launch interactive online Google Meet classes for students.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/gmeet" className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">Google Meet</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-emerald-400 font-medium">Virtual Class</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{editId ? 'Edit Google Meet Class' : 'Add Virtual Class'}</h2>
              {editId && <button onClick={cancelEdit} className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer">Cancel Edit</button>}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Class Topic <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. Mathematics - Chapter 4"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Class <span className="text-rose-500">*</span></label>
                  <select
                    value={form.classVal}
                    onChange={(e) => setForm({ ...form, classVal: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  >
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Section <span className="text-rose-500">*</span></label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  >
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Teacher / Host <span className="text-rose-500">*</span></label>
                <select
                  value={form.teacher}
                  onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                >
                  {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Time <span className="text-rose-500">*</span></label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Duration (Mins) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min="10"
                    max="240"
                    required
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Meet Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="abc-defg-hij"
                    value={form.meetCode}
                    onChange={(e) => setForm({ ...form, meetCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {editId ? 'Update Virtual Class' : 'Save Google Meet Class'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* List Card */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Virtual Class List</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-900 dark:bg-emerald-950/60 dark:text-emerald-400 border border-zinc-300 dark:border-emerald-800">{filteredRecords.length}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="SEARCH"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                </div>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <button onClick={handleCopy} title="Copy" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToExcel(filteredRecords, 'GMeet_Classes')} title="Excel" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><FileSpreadsheet className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToCSV(filteredRecords, 'GMeet_Classes')} title="CSV" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><FileText className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToPDF(filteredRecords, ['topic', 'classVal', 'section', 'teacher', 'date', 'time', 'duration', 'status'], 'Google Meet Classes', 'GMeet_Classes')} title="PDF" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><Video className="h-3.5 w-3.5" /></button>
                  <button onClick={() => printData(filteredRecords, ['topic', 'classVal', 'section', 'teacher', 'date', 'time', 'duration', 'status'], 'Google Meet Classes')} title="Print" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><Printer className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-zinc-500 uppercase">Class Filter:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-1 focus:ring-zinc-600"
              >
                <option value="All">All Classes</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-3.5 py-3">SL</th>
                    <th className="px-3.5 py-3">Topic</th>
                    <th className="px-3.5 py-3">Class (Sec)</th>
                    <th className="px-3.5 py-3">Teacher</th>
                    <th className="px-3.5 py-3">Date & Time</th>
                    <th className="px-3.5 py-3">Duration</th>
                    <th className="px-3.5 py-3">Status</th>
                    <th className="px-3.5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : filteredRecords.map((item, index) => (
                    <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-200">{index + 1}</td>
                      <td className="px-3.5 py-3 font-semibold text-zinc-900 dark:text-white line-clamp-1">{item.topic}</td>
                      <td className="px-3.5 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{item.classVal} ({item.section})</span></td>
                      <td className="px-3.5 py-3 font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{item.teacher}</td>
                      <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap"><div>{item.date}</div><div className="text-[10px] text-zinc-400">{item.time}</div></td>
                      <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.duration} Mins</td>
                      <td className="px-3.5 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 text-zinc-800 dark:bg-emerald-950/60 dark:text-emerald-400">{item.status}</span></td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a href={item.roomUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"><Video className="h-3 w-3" />Join</a>
                          <button onClick={() => handleEdit(item)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 rounded transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
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
                <button className="px-2.5 py-1 rounded border border-zinc-600 bg-zinc-100 dark:bg-emerald-950/40 text-zinc-800 dark:text-emerald-400 font-semibold">1</button>
                <button disabled className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-50 cursor-not-allowed">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
