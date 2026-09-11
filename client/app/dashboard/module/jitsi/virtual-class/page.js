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
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Video, 
  ExternalLink 
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function JitsiVirtualClassPage() {
  const [records, setRecords] = useState([
    {
      id: 1,
      classVal: 'Class 10',
      section: 'A',
      teacher: 'Mudassir Bajwa',
      topic: 'Mathematics - Quadratic Equations Live Session',
      description: 'Review of chapter 2 quadratic formulas and exercises.',
      date: '2026-09-10',
      time: '10:00 AM',
      duration: '45',
      status: 'Scheduled',
      roomUrl: 'https://meet.jit.si/stoofi-math-10a'
    },
    {
      id: 2,
      classVal: 'Class 9',
      section: 'B',
      teacher: 'Fatima Zahra',
      topic: 'Physics - Newton Laws and Practical Demonstration',
      description: 'Detailed discussion on 1st and 2nd law of motion.',
      date: '2026-09-11',
      time: '11:30 AM',
      duration: '60',
      status: 'Scheduled',
      roomUrl: 'https://meet.jit.si/stoofi-phy-9b'
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
    startBefore: '10',
    password: '',
    recurring: 'No'
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
        roomUrl: `https://meet.jit.si/stoofi-${encodeURIComponent(form.classVal.toLowerCase().replace(/\s+/g, '-'))}-${Date.now().toString().slice(-4)}`
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
      startBefore: '10',
      password: '',
      recurring: 'No'
    });
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this virtual class?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = (r.topic + ' ' + r.teacher + ' ' + r.classVal).toLowerCase().includes(search.toLowerCase());
      const matchClass = filterClass === 'All' || r.classVal === filterClass;
      return matchSearch && matchClass;
    });
  }, [records, search, filterClass]);

  const handleCopy = () => {
    const text = filteredRecords.map(r => `${r.classVal} - ${r.section} | ${r.topic} | ${r.teacher} | ${r.date} ${r.time}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleExportCSV = () => exportToCSV(filteredRecords, 'jitsi_virtual_classes');
  const handleExportExcel = () => exportToExcel(filteredRecords, 'jitsi_virtual_classes');
  const handleExportPDF = () => {
    exportToPDF(
      filteredRecords,
      ['classVal', 'section', 'topic', 'teacher', 'date', 'time', 'duration', 'status'],
      'Jitsi Virtual Classes',
      'jitsi_virtual_classes'
    );
  };
  const handlePrint = () => {
    printData(
      filteredRecords,
      ['classVal', 'section', 'topic', 'teacher', 'date', 'time', 'duration', 'status'],
      'Jitsi Virtual Classes'
    );
  };

  const inputClass = "w-full bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 text-zinc-900 dark:text-zinc-900 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors";
  const labelClass = "text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-700 mb-1.5 block";

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-900">Jitsi Virtual Class</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-0.5">Schedule and manage live interactive video classes via Jitsi Meet</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Module</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Jitsi</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-semibold">Virtual Class</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Virtual Class */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-200 flex items-center justify-between">
              <span>{editId ? 'Edit Virtual Class' : 'Add Virtual Class'}</span>
              {editId && (
                <button 
                  type="button" 
                  onClick={() => setEditId(null)} 
                  className="text-xs text-zinc-400 hover:text-rose-500"
                >
                  Cancel
                </button>
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>CLASS <span className="text-rose-500">*</span></label>
                <select 
                  value={form.classVal} 
                  onChange={e => setForm({ ...form, classVal: e.target.value })}
                  className={inputClass}
                >
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>SECTION <span className="text-rose-500">*</span></label>
                <select 
                  value={form.section} 
                  onChange={e => setForm({ ...form, section: e.target.value })}
                  className={inputClass}
                >
                  {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>TEACHER <span className="text-rose-500">*</span></label>
                <select 
                  value={form.teacher} 
                  onChange={e => setForm({ ...form, teacher: e.target.value })}
                  className={inputClass}
                >
                  {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>TOPIC <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Mathematics Live Lecture" 
                  value={form.topic} 
                  onChange={e => setForm({ ...form, topic: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>DATE <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>TIME <span className="text-rose-500">*</span></label>
                  <input 
                    type="time" 
                    value={form.time} 
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>DURATION (MIN)</label>
                  <input 
                    type="number" 
                    value={form.duration} 
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                    className={inputClass}
                    placeholder="45"
                  />
                </div>
                <div>
                  <label className={labelClass}>ROOM PASSWORD</label>
                  <input 
                    type="text" 
                    value={form.password} 
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className={inputClass}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>DESCRIPTION</label>
                <textarea 
                  rows={2} 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                  placeholder="Class objectives or instructions..."
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-xs mt-2 flex items-center justify-center gap-2"
              >
                <Video className="h-4 w-4" />
                {editId ? 'UPDATE CLASS' : 'SAVE CLASS'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Table: Virtual Class List */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            {/* Table Action Bar */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900">Virtual Class List</h2>
                <span className="text-xs bg-zinc-100 dark:bg-zinc-100 text-zinc-950 font-bold px-2 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-200">
                  {filteredRecords.length} Classes
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Class Filter */}
                <select 
                  value={filterClass} 
                  onChange={e => setFilterClass(e.target.value)}
                  className="bg-zinc-50 dark:bg-white border border-zinc-200 dark:border-zinc-200 text-zinc-800 dark:text-zinc-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="All">All Classes</option>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Search */}
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search classes..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-white border border-zinc-200 dark:border-zinc-200 text-zinc-900 dark:text-zinc-900 rounded-lg focus:outline-none w-36 sm:w-48"
                  />
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-200 pl-2">
                  <button onClick={handleCopy} title="Copy" className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-100 rounded transition-colors"><Copy size={14} /></button>
                  <button onClick={handleExportExcel} title="Excel" className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-100 rounded transition-colors"><FileSpreadsheet size={14} /></button>
                  <button onClick={handleExportCSV} title="CSV" className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-100 rounded transition-colors"><FileText size={14} /></button>
                  <button onClick={handleExportPDF} title="PDF" className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-100 rounded transition-colors"><Download size={14} /></button>
                  <button onClick={handlePrint} title="Print" className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-100 rounded transition-colors"><Printer size={14} /></button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-white/60 text-[11px] font-bold uppercase text-zinc-500 dark:text-zinc-600 tracking-wider border-b border-zinc-200 dark:border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">SL</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4">Teacher</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs text-zinc-800 dark:text-zinc-800">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-zinc-400 dark:text-zinc-9000">
                        No Virtual Classes Found
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, i) => (
                      <tr key={r.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-100/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-zinc-950">#{i + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-900">{r.classVal}</span>
                          <span className="text-[10px] text-zinc-400 block">Sec {r.section}</span>
                        </td>
                        <td className="py-3 px-4 font-medium max-w-[200px] truncate" title={r.topic}>
                          {r.topic}
                        </td>
                        <td className="py-3 px-4">{r.teacher}</td>
                        <td className="py-3 px-4">
                          <span className="block font-medium">{r.date}</span>
                          <span className="text-[10px] text-zinc-400">{r.time}</span>
                        </td>
                        <td className="py-3 px-4 font-medium">{r.duration} Min</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-100 text-zinc-950 border border-zinc-300 dark:border-zinc-200">
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a 
                              href={r.roomUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                            >
                              Join <ExternalLink size={10} />
                            </a>
                            <button 
                              onClick={() => handleEdit(r)}
                              className="p-1 text-zinc-400 hover:text-zinc-950 rounded hover:bg-zinc-100 dark:hover:bg-zinc-100"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(r.id)}
                              className="p-1 text-zinc-400 hover:text-rose-500 rounded hover:bg-zinc-100 dark:hover:bg-zinc-100"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
