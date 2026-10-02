'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Video, 
  CheckCircle2, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Users, 
  Sparkles, 
  AlertCircle,
  PlayCircle,
  CheckCircle,
  XCircle,
  Radio
} from 'lucide-react';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function GMeetVirtualClassPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form state
  const [form, setForm] = useState({
    topic: '',
    subject: 'Mathematics',
    classVal: 'Class 10',
    section: 'A',
    teacher: 'Muhammad Ali',
    hostEmail: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    duration: 45,
    meetCode: '',
    roomUrl: '',
    description: '',
    status: 'Scheduled',
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [previewModalItem, setPreviewModalItem] = useState(null);

  const classes = ['All Classes', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'];
  const sections = ['A', 'B', 'C', 'D'];
  const teachers = ['Mudassir Bajwa', 'Fatima Zahra', 'Muhammad Ali', 'Ahmed Khan', 'Ayesha Noor', 'Dr. Bilal Siddiqui', 'Zubair Ahmed'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Computer Science', 'Islamiat', 'Pakistan Studies'];

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get('/virtual-class?type=class');
      if (res && res.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Error fetching virtual classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const generateNewMeetCode = () => {
    const p1 = Math.random().toString(36).substring(2, 5);
    const p2 = Math.random().toString(36).substring(2, 6);
    const p3 = Math.random().toString(36).substring(2, 5);
    const code = `${p1}-${p2}-${p3}`;
    setForm(prev => ({
      ...prev,
      meetCode: code,
      roomUrl: `https://meet.google.com/${code}`,
    }));
  };

  const handleStartInstantClass = async () => {
    const p1 = Math.random().toString(36).substring(2, 5);
    const p2 = Math.random().toString(36).substring(2, 6);
    const p3 = Math.random().toString(36).substring(2, 5);
    const code = `${p1}-${p2}-${p3}`;
    const meetUrl = `https://meet.google.com/${code}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const instantPayload = {
      topic: `Instant Live Class (${now.toLocaleDateString()})`,
      subject: 'Live Session',
      type: 'class',
      classVal: 'Class 10',
      section: 'A',
      teacher: form.teacher || 'Muhammad Ali',
      date: dateStr,
      time: timeStr,
      duration: 45,
      meetCode: code,
      roomUrl: meetUrl,
      status: 'Live',
      description: 'Instant Google Meet virtual class session.',
    };

    try {
      const res = await api.post('/virtual-class', instantPayload);
      if (res && res.success) {
        window.open(meetUrl, '_blank', 'noopener,noreferrer');
        fetchRecords();
        setFeedback({ type: 'success', text: `Instant Google Meet launched: ${code}` });
      }
    } catch (err) {
      window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      alert('Please enter a Class Topic.');
      return;
    }

    let roomUrl = form.roomUrl;
    let meetCode = form.meetCode;

    if (!roomUrl && !meetCode) {
      const p1 = Math.random().toString(36).substring(2, 5);
      const p2 = Math.random().toString(36).substring(2, 6);
      const p3 = Math.random().toString(36).substring(2, 5);
      meetCode = `${p1}-${p2}-${p3}`;
      roomUrl = `https://meet.google.com/${meetCode}`;
    } else if (meetCode && !roomUrl) {
      roomUrl = `https://meet.google.com/${meetCode}`;
    }

    const payload = {
      ...form,
      type: 'class',
      meetCode,
      roomUrl,
    };

    setSubmitting(true);
    try {
      if (editId) {
        const res = await api.put(`/virtual-class/${editId}`, payload);
        if (res && res.success) {
          setFeedback({ type: 'success', text: 'Virtual class updated successfully!' });
          setEditId(null);
        }
      } else {
        const res = await api.post('/virtual-class', payload);
        if (res && res.success) {
          setFeedback({ type: 'success', text: 'Virtual class scheduled successfully!' });
        }
      }

      setForm({
        topic: '',
        subject: 'Mathematics',
        classVal: 'Class 10',
        section: 'A',
        teacher: 'Muhammad Ali',
        hostEmail: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        duration: 45,
        meetCode: '',
        roomUrl: '',
        description: '',
        status: 'Scheduled',
      });

      await fetchRecords();
    } catch (err) {
      console.error('Error saving virtual class:', err);
      setFeedback({ type: 'error', text: err.message || 'Failed to save virtual class' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id || item.id);
    setForm({
      topic: item.topic || '',
      subject: item.subject || 'Mathematics',
      classVal: item.classVal || 'Class 10',
      section: item.section || 'A',
      teacher: item.teacher || 'Muhammad Ali',
      hostEmail: item.hostEmail || '',
      date: item.date || new Date().toISOString().split('T')[0],
      time: item.time || '10:00 AM',
      duration: item.duration || 45,
      meetCode: item.meetCode || (item.roomUrl ? item.roomUrl.replace('https://meet.google.com/', '') : ''),
      roomUrl: item.roomUrl || '',
      description: item.description || '',
      status: item.status || 'Scheduled',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this Google Meet virtual class?')) {
      try {
        const res = await api.delete(`/virtual-class/${id}`);
        if (res && res.success) {
          setFeedback({ type: 'success', text: 'Virtual class removed successfully.' });
          if (editId === id) cancelEdit();
          fetchRecords();
        }
      } catch (err) {
        console.error('Delete error:', err);
        setFeedback({ type: 'error', text: 'Failed to delete class' });
      }
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      const res = await api.patch(`/virtual-class/${item._id || item.id}/status`, { status: newStatus });
      if (res && res.success) {
        fetchRecords();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({
      topic: '',
      subject: 'Mathematics',
      classVal: 'Class 10',
      section: 'A',
      teacher: 'Muhammad Ali',
      hostEmail: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      duration: 45,
      meetCode: '',
      roomUrl: '',
      description: '',
      status: 'Scheduled',
    });
  };

  const copyInvitation = (item) => {
    const inviteText = `🎓 *STOOFI VIRTUAL CLASS INVITATION*\n\n📌 *Topic:* ${item.topic}\n📚 *Subject:* ${item.subject || 'General'}\n🏫 *Class:* ${item.classVal} (Section ${item.section})\n👨‍🏫 *Teacher / Host:* ${item.teacher}\n📅 *Date:* ${item.date}\n⏰ *Time:* ${item.time} (${item.duration} Mins)\n\n🔗 *Join Google Meet:* ${item.roomUrl}\n\n_Please join 5 minutes before scheduled start time with your microphone muted._`;
    navigator.clipboard.writeText(inviteText);
    setFeedback({ type: 'success', text: 'Class invitation copied to clipboard!' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchClass = filterClass === 'All' || filterClass === 'All Classes' || rec.classVal === filterClass;
      const matchStatus = filterStatus === 'All' || rec.status === filterStatus;
      const matchSearch =
        !search ||
        (rec.topic && rec.topic.toLowerCase().includes(search.toLowerCase())) ||
        (rec.teacher && rec.teacher.toLowerCase().includes(search.toLowerCase())) ||
        (rec.subject && rec.subject.toLowerCase().includes(search.toLowerCase())) ||
        (rec.meetCode && rec.meetCode.toLowerCase().includes(search.toLowerCase()));
      return matchClass && matchStatus && matchSearch;
    });
  }, [records, filterClass, filterStatus, search]);

  const stats = useMemo(() => {
    const total = records.length;
    const live = records.filter(r => r.status === 'Live').length;
    const scheduled = records.filter(r => r.status === 'Scheduled').length;
    const completed = records.filter(r => r.status === 'Completed').length;
    return { total, live, scheduled, completed };
  }, [records]);

  const handleCopyList = () => {
    navigator.clipboard.writeText(
      filteredRecords
        .map(r => `${r.topic} | ${r.subject || 'General'} | ${r.classVal}(${r.section}) | ${r.teacher} | ${r.date} ${r.time} | ${r.duration}m | ${r.status} | ${r.roomUrl}`)
        .join('\n')
    );
    setFeedback({ type: 'success', text: 'Table records copied to clipboard!' });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Google Meet Virtual Class</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="h-3 w-3 animate-pulse text-emerald-600" />
              Live Workspace Active
            </span>
          </div>
          <p className="text-sm text-zinc-600 font-medium mt-1">Schedule, launch, and manage real-time Google Meet classroom sessions for students and teachers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartInstantClass}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            title="Start an immediate Google Meet class right now"
          >
            <PlayCircle className="h-4 w-4" />
            Instant Google Meet
          </button>
          <div className="hidden md:flex items-center text-xs text-zinc-500 font-medium">
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Link href="/dashboard/module/gmeet" className="hover:text-zinc-900 transition-colors">Google Meet</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-bold">Virtual Class</span>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 border shadow-sm transition-all ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Virtual Classes</div>
          <div className="text-2xl font-black text-zinc-950 mt-1">{stats.total}</div>
          <div className="text-[11px] text-zinc-600 font-medium mt-1">Scheduled in curriculum</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live / In Progress</div>
          <div className="text-2xl font-black text-emerald-700 mt-1 flex items-center gap-2">
            {stats.live}
            {stats.live > 0 && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">● Active Google Meet rooms</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Upcoming Scheduled</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{stats.scheduled}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">Ready for start time</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Completed Sessions</div>
          <div className="text-2xl font-black text-zinc-900 mt-1">{stats.completed}</div>
          <div className="text-[11px] text-zinc-500 font-medium mt-1">Concluded successfully</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form Card (Schedule / Edit) */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 sticky top-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-zinc-900" />
                <h2 className="text-base font-bold text-zinc-950 uppercase tracking-wider">
                  {editId ? 'Edit Virtual Class' : 'Schedule Virtual Class'}
                </h2>
              </div>
              {editId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Class Topic / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. Mathematics - Chapter 4 (Calculus)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium placeholder:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Class <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.classVal}
                    onChange={(e) => setForm({ ...form, classVal: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
                  >
                    {classes.filter(c => c !== 'All Classes').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
                  >
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Teacher / Host <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.teacher}
                    onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
                  >
                    {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Duration (Mins) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes (1 Hour)</option>
                    <option value={90}>90 Minutes</option>
                    <option value={120}>120 Minutes (2 Hours)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Live">Live / Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Meet Code Generator */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-zinc-900" />
                    Google Meet Room Link
                  </label>
                  <button
                    type="button"
                    onClick={generateNewMeetCode}
                    className="text-[11px] font-bold text-zinc-950 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Generate Code
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. abc-defg-hij or paste custom meet URL"
                  value={form.meetCode || form.roomUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({
                      ...form,
                      meetCode: val.includes('/') ? val.split('/').pop() : val,
                      roomUrl: val.startsWith('http') ? val : `https://meet.google.com/${val}`,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-xs font-mono focus:ring-2 focus:ring-zinc-400 outline-none transition-colors"
                />
                <div className="text-[11px] text-zinc-500 font-medium">
                  Direct Link: <span className="text-zinc-900 font-mono font-bold">{form.roomUrl || (form.meetCode ? `https://meet.google.com/${form.meetCode}` : 'Auto-generated upon save')}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Class Description / Agenda
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Notes, required textbook pages, or homework discussion points..."
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-xs focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium resize-none placeholder:text-zinc-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? 'Saving Class...' : editId ? 'Update Virtual Class' : 'Save & Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Virtual Class List */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
            {/* Header & Tools */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-zinc-950 uppercase tracking-wider">Scheduled Virtual Classes</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-900 border border-zinc-200">
                  {filteredRecords.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by topic, teacher, subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-950 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
                  />
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-zinc-200">
                  <button onClick={handleCopyList} title="Copy Table Records" className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition-colors">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => exportToExcel(filteredRecords, 'GMeet_Classes')} title="Export to Excel" className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition-colors">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => exportToCSV(filteredRecords, 'GMeet_Classes')} title="Export to CSV" className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition-colors">
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => exportToPDF(filteredRecords, ['topic', 'subject', 'classVal', 'section', 'teacher', 'date', 'time', 'duration', 'status'], 'Google Meet Classes', 'GMeet_Classes')} title="Export PDF" className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition-colors">
                    <Video className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => printData(filteredRecords, ['topic', 'subject', 'classVal', 'section', 'teacher', 'date', 'time', 'duration', 'status'], 'Google Meet Classes')} title="Print Table" className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition-colors">
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-800 uppercase">Class:</span>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-xs outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
                >
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-800 uppercase">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-xs outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="Live">Live / In Progress</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={fetchRecords}
                className="ml-auto px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Refresh class records"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-3.5 py-3.5">SL</th>
                    <th className="px-3.5 py-3.5">Topic & Subject</th>
                    <th className="px-3.5 py-3.5">Class / Sec</th>
                    <th className="px-3.5 py-3.5">Teacher / Host</th>
                    <th className="px-3.5 py-3.5">Date & Time</th>
                    <th className="px-3.5 py-3.5">Duration</th>
                    <th className="px-3.5 py-3.5">Status</th>
                    <th className="px-3.5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-zinc-600 font-semibold">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin text-zinc-900" />
                          <span>Loading Google Meet classes...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-zinc-600 font-semibold">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Video className="h-8 w-8 text-zinc-400 stroke-1" />
                          <span className="text-zinc-950 font-bold text-sm">No Virtual Classes Found</span>
                          <span className="text-zinc-500 text-xs">Create a new Google Meet virtual class using the schedule form.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item, index) => {
                      const isLive = item.status === 'Live';
                      const isCompleted = item.status === 'Completed';
                      const isCancelled = item.status === 'Cancelled';

                      return (
                        <tr key={item._id || item.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="px-3.5 py-3 font-bold text-zinc-950">{index + 1}</td>
                          <td className="px-3.5 py-3">
                            <div className="font-bold text-zinc-950 line-clamp-1">{item.topic}</div>
                            <div className="text-[11px] text-zinc-600 font-semibold flex items-center gap-2 mt-0.5">
                              <span className="text-blue-700 font-bold">{item.subject || 'General'}</span>
                              {item.meetCode && <span className="font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">{item.meetCode}</span>}
                            </div>
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-950 border border-zinc-200">
                              {item.classVal} ({item.section})
                            </span>
                          </td>
                          <td className="px-3.5 py-3 font-semibold text-zinc-900 whitespace-nowrap">
                            {item.teacher}
                          </td>
                          <td className="px-3.5 py-3 text-zinc-700 whitespace-nowrap">
                            <div className="font-bold text-zinc-950 flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-zinc-500" />
                              {item.date}
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
                            ) : isCancelled ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                Cancelled
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                Scheduled
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Direct Google Meet Join / Start Button */}
                              <a
                                href={item.roomUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => {
                                  if (item.status === 'Scheduled') {
                                    handleStatusChange(item, 'Live');
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                                  isLive 
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse' 
                                    : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                                }`}
                                title="Open Google Meet Session"
                              >
                                <Video className="h-3.5 w-3.5" />
                                {isLive ? 'Join Live' : 'Start Meet'}
                              </a>

                              {/* Copy Invite Link */}
                              <button
                                onClick={() => copyInvitation(item)}
                                className="p-1.5 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 rounded-lg border border-zinc-200 transition-colors"
                                title="Copy invitation text"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>

                              {/* Status Quick Toggle */}
                              {!isCompleted && !isCancelled && (
                                <button
                                  onClick={() => handleStatusChange(item, isLive ? 'Completed' : 'Live')}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    isLive
                                      ? 'hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                                      : 'hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}
                                  title={isLive ? 'Mark as Completed' : 'Mark as Live'}
                                >
                                  {isLive ? <CheckCircle className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
                                </button>
                              )}

                              {/* Edit */}
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 rounded-lg border border-zinc-200 transition-colors"
                                title="Edit Class Details"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(item._id || item.id)}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg border border-rose-200 transition-colors"
                                title="Delete Virtual Class"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between pt-4 mt-2 text-xs text-zinc-600 font-medium">
              <div>
                Showing {filteredRecords.length} of {records.length} total virtual classes
              </div>
              <div className="flex items-center gap-1">
                <button disabled className="px-2.5 py-1 rounded border border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed font-bold">&lt;</button>
                <button className="px-2.5 py-1 rounded border border-zinc-300 bg-zinc-100 text-zinc-950 font-bold">1</button>
                <button disabled className="px-2.5 py-1 rounded border border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed font-bold">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
