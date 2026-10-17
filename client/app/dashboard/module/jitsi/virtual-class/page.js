'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  Radio,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { formatDateDMY } from '@/lib/utils';
import api from '@/services/api';

export default function JitsiVirtualClassPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    classVal: 'Class 10',
    section: 'A',
    subject: 'General',
    teacher: 'Muhammad Ali',
    topic: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    duration: 45,
    status: 'Scheduled'
  });

  const [editItem, setEditItem] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const classes = ['All Classes', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'];
  const sections = ['All Sections', 'A', 'B', 'C', 'D'];
  const teachers = ['Muhammad Ali', 'Fatima Zahra', 'Mudassir Bajwa', 'Ahmed Khan', 'Ayesha Noor', 'Dr. Bilal Siddiqui'];
  const subjects = ['General', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Computer Science'];

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/virtual-class?type=class');
      if (res?.success && Array.isArray(res.data)) {
        // Filter jitsi or all classes
        const jitsiRecords = res.data.filter(r => !r.provider || r.provider === 'jitsi');
        setRecords(jitsiRecords.length > 0 ? jitsiRecords : res.data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Error fetching jitsi classes:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const generateRoomUrl = (cls, topicStr) => {
    const cleanTopic = (topicStr || 'session').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
    const cleanClass = (cls || 'general').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const randomId = Math.random().toString(36).substring(2, 6);
    return `https://meet.jit.si/PakRoyalCollege-${cleanClass}-${cleanTopic}-${randomId}`;
  };

  const handleStartInstantClass = async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];
    const roomUrl = generateRoomUrl(form.classVal, 'Instant-Live');

    try {
      setSubmitting(true);
      const payload = {
        topic: `Live Class: ${form.classVal} (${form.subject})`,
        subject: form.subject,
        type: 'class',
        provider: 'jitsi',
        classVal: form.classVal,
        section: form.section,
        teacher: form.teacher,
        date: dateStr,
        time: timeStr,
        duration: 45,
        roomUrl: roomUrl,
        meetCode: roomUrl.split('/').pop(),
        status: 'Live',
        totalEnrolled: 30
      };

      const res = await api.post('/virtual-class', payload);
      if (res?.success) {
        setMessage({ type: 'success', text: 'Live Class Started! Opening Jitsi...' });
        setTimeout(() => setMessage(null), 3000);
        window.open(roomUrl, '_blank');
        fetchRecords();
      } else {
        alert(res?.message || 'Failed to start instant class');
      }
    } catch (err) {
      alert(err.message || 'Error starting live class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      alert('Please enter a Class Topic.');
      return;
    }

    try {
      setSubmitting(true);
      const roomUrl = generateRoomUrl(form.classVal, form.topic);
      const payload = {
        ...form,
        type: 'class',
        provider: 'jitsi',
        duration: Number(form.duration) || 45,
        roomUrl: roomUrl,
        meetCode: roomUrl.split('/').pop(),
        totalEnrolled: 30
      };

      const res = await api.post('/virtual-class', payload);
      if (res?.success) {
        setMessage({ type: 'success', text: 'Virtual class scheduled successfully!' });
        setTimeout(() => setMessage(null), 3000);
        setForm(prev => ({ ...prev, topic: '', description: '' }));
        fetchRecords();
      } else {
        alert(res?.message || 'Failed to schedule class');
      }
    } catch (err) {
      alert(err.message || 'Error saving virtual class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.patch(`/virtual-class/${id}/status`, { status: newStatus });
      if (res?.success) {
        fetchRecords();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this virtual class?')) {
      try {
        const res = await api.delete(`/virtual-class/${id}`);
        if (res?.success) {
          setMessage({ type: 'success', text: 'Class deleted successfully!' });
          setTimeout(() => setMessage(null), 3000);
          fetchRecords();
        } else {
          alert(res?.message || 'Failed to delete class');
        }
      } catch (err) {
        alert(err.message || 'Error deleting class');
      }
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = (r.topic + ' ' + r.teacher + ' ' + (r.classVal || '') + ' ' + (r.subject || '')).toLowerCase().includes(search.toLowerCase());
      const matchClass = filterClass === 'All' || r.classVal === filterClass;
      const matchStatus = filterStatus === 'All' || r.status === filterStatus;
      return matchSearch && matchClass && matchStatus;
    });
  }, [records, search, filterClass, filterStatus]);

  const liveClasses = records.filter(r => r.status === 'Live');

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0c3559]">Jitsi Virtual Class</h1>
            {liveClasses.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
                <Radio className="h-3 w-3 text-emerald-600" />
                {liveClasses.length} Live Now
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Schedule and launch interactive live classes powered by Jitsi Meet (100% Free & No Account Required).</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <span className="text-zinc-500">Module</span>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <span className="text-zinc-700 font-semibold">Jitsi</span>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Quick Launch Live Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-[#084A86] text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-blue-100 uppercase tracking-wider">
            <Radio className="h-3 w-3 text-emerald-400" /> Free Jitsi Meet Engine
          </span>
          <h2 className="text-lg font-bold">Start an Instant Live Class Room</h2>
          <p className="text-xs text-blue-100">Launch a live video room instantly for {form.classVal}. Students of this class will see it live in their portal.</p>
        </div>
        <Button
          onClick={handleStartInstantClass}
          disabled={submitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-5 rounded-xl shadow-md cursor-pointer flex items-center gap-2 shrink-0"
        >
          <PlayCircle className="h-4 w-4" />
          Start Instant Live Class
        </Button>
      </div>

      {/* Main Grid: Schedule Form (Left) & Classes List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Schedule Form */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-bold text-[#0c3559]">Schedule Jitsi Class</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">Class Topic *</Label>
                <Input 
                  value={form.topic}
                  onChange={e => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. Chapter 4: Quadratic Equations"
                  className="h-10 border-zinc-200 rounded-lg text-sm bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">Class</Label>
                  <select
                    value={form.classVal}
                    onChange={e => setForm({ ...form, classVal: e.target.value })}
                    className="w-full h-10 px-3 border border-zinc-200 rounded-lg text-xs bg-white font-medium"
                  >
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">Section</Label>
                  <select
                    value={form.section}
                    onChange={e => setForm({ ...form, section: e.target.value })}
                    className="w-full h-10 px-3 border border-zinc-200 rounded-lg text-xs bg-white font-medium"
                  >
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">Subject</Label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full h-10 px-3 border border-zinc-200 rounded-lg text-xs bg-white font-medium"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">Teacher</Label>
                  <select
                    value={form.teacher}
                    onChange={e => setForm({ ...form, teacher: e.target.value })}
                    className="w-full h-10 px-3 border border-zinc-200 rounded-lg text-xs bg-white font-medium"
                  >
                    {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">Date *</Label>
                  <Input 
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="h-10 border-zinc-200 rounded-lg text-xs bg-white font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">Time *</Label>
                  <Input 
                    type="time"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    className="h-10 border-zinc-200 rounded-lg text-xs bg-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">Duration (Minutes)</Label>
                <Input 
                  type="number"
                  min="15"
                  step="5"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  className="h-10 border-zinc-200 rounded-lg text-xs bg-white font-medium"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-lg uppercase tracking-wider text-xs cursor-pointer"
              >
                {submitting ? 'SAVING...' : 'SAVE JITSI CLASS'}
              </Button>
            </form>
          </div>
        </div>

        {/* Classes List */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#0c3559]">Virtual Class List</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Live database of all scheduled and active virtual lectures</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-40 sm:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="SEARCH" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8.5 h-8.5 text-xs bg-white border-zinc-200 rounded-lg uppercase tracking-wider text-zinc-700"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-[#0c3559] uppercase font-bold bg-[#f8fafc] border-b border-zinc-100">
                  <tr>
                    <th className="px-4 py-3 font-bold w-12">SL</th>
                    <th className="px-4 py-3 font-bold">TOPIC</th>
                    <th className="px-4 py-3 font-bold">CLASS</th>
                    <th className="px-4 py-3 font-bold">TEACHER</th>
                    <th className="px-4 py-3 font-bold">DATE & TIME</th>
                    <th className="px-4 py-3 font-bold">STATUS</th>
                    <th className="px-4 py-3 font-bold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-16 text-center text-zinc-400">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          <span>Loading classes...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-16 text-center text-sm font-medium text-zinc-400">
                        No Data Available In Table
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r._id || r.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3 text-zinc-600 font-semibold">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-[#0c3559]">
                          <div>{r.topic}</div>
                          {r.subject && <span className="text-[10px] text-zinc-400 font-normal">{r.subject}</span>}
                        </td>
                        <td className="px-4 py-3 text-zinc-700 font-medium">
                          {r.classVal} {r.section ? `(${r.section})` : ''}
                        </td>
                        <td className="px-4 py-3 text-zinc-800">{r.teacher}</td>
                        <td className="px-4 py-3 text-zinc-600 font-medium font-mono">
                          <div>{formatDateDMY(r.date)}</div>
                          <div className="text-[10px] text-zinc-400">{r.time} ({r.duration}m)</div>
                        </td>
                        <td className="px-4 py-3">
                          {r.status === 'Live' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                              ● Live Now
                            </span>
                          ) : r.status === 'Completed' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Scheduled
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={r.roomUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleUpdateStatus(r._id, 'Live')}
                              className="px-2.5 py-1 bg-[#084A86] hover:bg-[#063866] text-white rounded-md text-[11px] font-bold inline-flex items-center gap-1 transition shadow-2xs"
                            >
                              Join <ExternalLink className="h-3 w-3" />
                            </a>
                            <button
                              onClick={() => handleDelete(r._id)}
                              className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 rounded transition"
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
          </div>
        </div>
      </div>
    </div>
  );
}