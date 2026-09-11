'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Copy, FileSpreadsheet, FileText, Printer, Edit, Trash2, Video, CheckCircle2, Users } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function BBBVirtualMeetingPage() {
  const [records, setRecords] = useState([
    {
      id: 1,
      topic: 'Staff Academic Progress Review',
      host: 'Mudassir Bajwa',
      audience: 'All Teachers',
      description: 'Weekly curriculum progress discussion with department heads.',
      date: '2026-09-09',
      time: '02:00 PM',
      duration: '45',
      status: 'Scheduled',
      roomUrl: 'https://bbb.stoofi.com/b/mud-staff-0901'
    },
    {
      id: 2,
      topic: 'Parent-Teacher Annual Interaction',
      host: 'Dr. Bilal Siddiqui',
      audience: 'Parents',
      description: 'Annual parents meeting to discuss student academic health.',
      date: '2026-09-12',
      time: '04:00 PM',
      duration: '60',
      status: 'Scheduled',
      roomUrl: 'https://bbb.stoofi.com/b/bil-pta-0912'
    }
  ]);

  const [form, setForm] = useState({
    topic: '',
    host: 'Mudassir Bajwa',
    audience: 'All Teachers',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: '45',
    autoRecord: 'Yes',
    password: ''
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');

  const hosts = ['Mudassir Bajwa', 'Fatima Zahra', 'Muhammad Ali', 'Ahmed Khan', 'Ayesha Noor', 'Dr. Bilal Siddiqui'];
  const audiences = ['All Teachers', 'Staff Members', 'Parents', 'Admin & Management', 'General'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic.trim()) { alert('Please enter a Meeting Topic.'); return; }
    if (editId) {
      setRecords(records.map(r => r.id === editId ? { ...r, ...form } : r));
      setEditId(null);
    } else {
      setRecords([{ id: Date.now(), ...form, status: 'Scheduled', roomUrl: `https://bbb.stoofi.com/b/bbb-meeting-${Date.now().toString().slice(-5)}` }, ...records]);
    }
    setForm({ topic: '', host: 'Mudassir Bajwa', audience: 'All Teachers', description: '', date: new Date().toISOString().split('T')[0], time: '14:00', duration: '45', autoRecord: 'Yes', password: '' });
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ topic: item.topic, host: item.host, audience: item.audience, description: item.description || '', date: item.date, time: item.time, duration: item.duration, autoRecord: item.autoRecord || 'Yes', password: item.password || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this virtual meeting?')) {
      setRecords(records.filter(r => r.id !== id));
      if (editId === id) { setEditId(null); }
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ topic: '', host: 'Mudassir Bajwa', audience: 'All Teachers', description: '', date: new Date().toISOString().split('T')[0], time: '14:00', duration: '45', autoRecord: 'Yes', password: '' });
  };

  const filteredRecords = useMemo(() => records.filter(rec => {
    const matchAud = filterAudience === 'All' || rec.audience === filterAudience;
    const matchSearch = !search || rec.topic.toLowerCase().includes(search.toLowerCase()) || rec.host.toLowerCase().includes(search.toLowerCase());
    return matchAud && matchSearch;
  }), [records, filterAudience, search]);

  const handleCopy = () => { navigator.clipboard.writeText(filteredRecords.map(r => `${r.topic} | ${r.host} | ${r.audience} | ${r.date} | ${r.duration} mins`).join('\n')); alert('Copied!'); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900">BigBlueButton Virtual Meeting</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">Schedule and manage institutional video conferences with recording support.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/bigbluebutton" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">BigBlueButton</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-zinc-900 font-medium">Virtual Meeting</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-200">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">{editId ? 'Edit Meeting' : 'Add Meeting'}</h2>
              {editId && <button onClick={cancelEdit} className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer">Cancel Edit</button>}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">Meeting Topic <span className="text-rose-500">*</span></label>
                <input type="text" required value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Enter meeting topic..." className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">Host <span className="text-rose-500">*</span></label>
                  <select value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors">
                    {hosts.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">Audience <span className="text-rose-500">*</span></label>
                  <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors">
                    {audiences.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Meeting agenda..." className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">Date <span className="text-rose-500">*</span></label>
                  <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">Time <span className="text-rose-500">*</span></label>
                  <input type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">Duration (Mins) <span className="text-rose-500">*</span></label>
                  <input type="number" min="5" max="360" required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">Auto-Record</label>
                  <select value={form.autoRecord} onChange={(e) => setForm({ ...form, autoRecord: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {editId ? 'Update Meeting' : 'Save Virtual Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-200">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">BBB Meeting List</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-300 dark:border-zinc-200">{filteredRecords.length}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input type="text" placeholder="SEARCH" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-900 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-600" />
                </div>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-200">
                  <button onClick={handleCopy} title="Copy" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToExcel(filteredRecords, 'BBB_Meetings')} title="Excel" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><FileSpreadsheet className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToCSV(filteredRecords, 'BBB_Meetings')} title="CSV" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><FileText className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToPDF(filteredRecords, ['topic','host','audience','date','time','duration','status'], 'BBB Meetings', 'BBB_Meetings')} title="PDF" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Video className="h-3.5 w-3.5" /></button>
                  <button onClick={() => printData(filteredRecords, ['topic','host','audience','date','time','duration','status'], 'BBB Meetings')} title="Print" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"><Printer className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase">
                <span>Audience:</span>
                <select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)} className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-900 text-xs outline-none focus:ring-1 focus:ring-zinc-600">
                  <option value="All">All</option>
                  {audiences.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-200">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-200">
                  <tr>
                    <th className="px-3.5 py-3">SL</th>
                    <th className="px-3.5 py-3">Topic</th>
                    <th className="px-3.5 py-3">Host</th>
                    <th className="px-3.5 py-3">Audience</th>
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
                    <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-100/40 transition-colors">
                      <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-800">{index + 1}</td>
                      <td className="px-3.5 py-3">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-900 line-clamp-1">{item.topic}</div>
                        {item.description && <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{item.description}</div>}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-zinc-700 dark:text-zinc-700 whitespace-nowrap">{item.host}</td>
                      <td className="px-3.5 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">{item.audience}</span></td>
                      <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap"><div>{item.date}</div><div className="text-[10px] text-zinc-400">{item.time}</div></td>
                      <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap">{item.duration} Mins</td>
                      <td className="px-3.5 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 text-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">{item.status}</span></td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a href={item.roomUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"><Video className="h-3 w-3" />Join</a>
                          <button onClick={() => handleEdit(item)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-100 text-zinc-600 dark:text-zinc-600 rounded transition-colors"><Edit className="h-3.5 w-3.5" /></button>
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
                <button disabled className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed">&lt;</button>
                <button className="px-2.5 py-1 rounded border border-zinc-600 bg-zinc-100 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 font-semibold">1</button>
                <button disabled className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
