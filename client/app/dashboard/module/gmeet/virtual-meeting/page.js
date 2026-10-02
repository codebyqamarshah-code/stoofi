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
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  AlertCircle,
  PlayCircle,
  CheckCircle,
  Radio
} from 'lucide-react';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function GMeetVirtualMeetingPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [form, setForm] = useState({
    topic: '',
    teacher: 'Dr. Bilal Siddiqui',
    hostEmail: 'b.siddiqui@stoofi.edu.pk',
    audience: 'All Teachers',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '03:00 PM',
    duration: 45,
    meetCode: '',
    roomUrl: '',
    status: 'Scheduled',
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const hosts = ['Dr. Bilal Siddiqui', 'Mudassir Bajwa', 'Fatima Zahra', 'Muhammad Ali', 'Ahmed Khan', 'Ayesha Noor', 'Zubair Ahmed'];
  const audiences = ['All Audiences', 'All Teachers', 'Staff Members', 'Parents', 'Admin & Management', 'Academic Council', 'General'];

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get('/virtual-class?type=meeting');
      if (res && res.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
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

  const handleStartInstantMeeting = async () => {
    const p1 = Math.random().toString(36).substring(2, 5);
    const p2 = Math.random().toString(36).substring(2, 6);
    const p3 = Math.random().toString(36).substring(2, 5);
    const code = `${p1}-${p2}-${p3}`;
    const meetUrl = `https://meet.google.com/${code}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const instantPayload = {
      topic: `Instant Institutional Meeting (${now.toLocaleDateString()})`,
      type: 'meeting',
      teacher: form.teacher || 'Dr. Bilal Siddiqui',
      audience: form.audience === 'All Audiences' ? 'All Teachers' : form.audience,
      date: dateStr,
      time: timeStr,
      duration: 45,
      meetCode: code,
      roomUrl: meetUrl,
      status: 'Live',
      description: 'Instant Google Meet conference call.',
    };

    try {
      const res = await api.post('/virtual-class', instantPayload);
      if (res && res.success) {
        window.open(meetUrl, '_blank', 'noopener,noreferrer');
        fetchRecords();
        setFeedback({ type: 'success', text: `Instant Google Meet started: ${code}` });
      }
    } catch (err) {
      window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      alert('Please enter a Meeting Topic.');
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
      type: 'meeting',
      meetCode,
      roomUrl,
    };

    setSubmitting(true);
    try {
      if (editId) {
        const res = await api.put(`/virtual-class/${editId}`, payload);
        if (res && res.success) {
          setFeedback({ type: 'success', text: 'Virtual meeting updated successfully!' });
          setEditId(null);
        }
      } else {
        const res = await api.post('/virtual-class', payload);
        if (res && res.success) {
          setFeedback({ type: 'success', text: 'Virtual meeting scheduled successfully!' });
        }
      }

      setForm({
        topic: '',
        teacher: 'Dr. Bilal Siddiqui',
        hostEmail: 'b.siddiqui@stoofi.edu.pk',
        audience: 'All Teachers',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '03:00 PM',
        duration: 45,
        meetCode: '',
        roomUrl: '',
        status: 'Scheduled',
      });

      await fetchRecords();
    } catch (err) {
      console.error('Error saving meeting:', err);
      setFeedback({ type: 'error', text: err.message || 'Failed to save virtual meeting' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id || item.id);
    setForm({
      topic: item.topic || '',
      teacher: item.teacher || 'Dr. Bilal Siddiqui',
      hostEmail: item.hostEmail || '',
      audience: item.audience || 'All Teachers',
      description: item.description || '',
      date: item.date || new Date().toISOString().split('T')[0],
      time: item.time || '03:00 PM',
      duration: item.duration || 45,
      meetCode: item.meetCode || (item.roomUrl ? item.roomUrl.replace('https://meet.google.com/', '') : ''),
      roomUrl: item.roomUrl || '',
      status: item.status || 'Scheduled',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this virtual meeting?')) {
      try {
        const res = await api.delete(`/virtual-class/${id}`);
        if (res && res.success) {
          setFeedback({ type: 'success', text: 'Meeting deleted successfully.' });
          if (editId === id) cancelEdit();
          fetchRecords();
        }
      } catch (err) {
        console.error('Delete error:', err);
        setFeedback({ type: 'error', text: 'Failed to delete meeting' });
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
      console.error('Status update error:', err);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({
      topic: '',
      teacher: 'Dr. Bilal Siddiqui',
      hostEmail: 'b.siddiqui@stoofi.edu.pk',
      audience: 'All Teachers',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '03:00 PM',
      duration: 45,
      meetCode: '',
      roomUrl: '',
      status: 'Scheduled',
    });
  };

  const copyInvitation = (item) => {
    const inviteText = `🤝 *STOOFI VIRTUAL MEETING INVITATION*\n\n📌 *Topic:* ${item.topic}\n👥 *Target Audience:* ${item.audience}\n👨‍💼 *Host:* ${item.teacher}\n📅 *Date:* ${item.date}\n⏰ *Time:* ${item.time} (${item.duration} Mins)\n\n🔗 *Join Google Meet:* ${item.roomUrl}\n\n${item.description ? `📝 *Agenda:* ${item.description}\n\n` : ''}_Please join on time._`;
    navigator.clipboard.writeText(inviteText);
    setFeedback({ type: 'success', text: 'Meeting invitation copied to clipboard!' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchAud = filterAudience === 'All' || filterAudience === 'All Audiences' || rec.audience === filterAudience;
      const matchStatus = filterStatus === 'All' || rec.status === filterStatus;
      const matchSearch =
        !search ||
        (rec.topic && rec.topic.toLowerCase().includes(search.toLowerCase())) ||
        (rec.teacher && rec.teacher.toLowerCase().includes(search.toLowerCase())) ||
        (rec.audience && rec.audience.toLowerCase().includes(search.toLowerCase())) ||
        (rec.meetCode && rec.meetCode.toLowerCase().includes(search.toLowerCase()));
      return matchAud && matchStatus && matchSearch;
    });
  }, [records, filterAudience, filterStatus, search]);

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
        .map(r => `${r.topic} | Host: ${r.teacher} | ${r.audience} | ${r.date} ${r.time} | ${r.duration}m | ${r.status} | ${r.roomUrl}`)
        .join('\n')
    );
    setFeedback({ type: 'success', text: 'Meeting records copied!' });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Google Meet Virtual Meeting</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Radio className="h-3 w-3 animate-pulse text-blue-600" />
              Conference Hub
            </span>
          </div>
          <p className="text-sm text-zinc-600 font-medium mt-1">Organize and manage staff, teacher, and executive conferences via Google Meet.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartInstantMeeting}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            title="Start an immediate Google Meet meeting right now"
          >
            <PlayCircle className="h-4 w-4" />
            Instant Meeting
          </button>
          <div className="hidden md:flex items-center text-xs text-zinc-500 font-medium">
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Link href="/dashboard/module/gmeet" className="hover:text-zinc-900 transition-colors">Google Meet</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-bold">Virtual Meeting</span>
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
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Conferences</div>
          <div className="text-2xl font-black text-zinc-950 mt-1">{stats.total}</div>
          <div className="text-[11px] text-zinc-600 font-medium mt-1">Scheduled in system</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live Meetings</div>
          <div className="text-2xl font-black text-emerald-700 mt-1 flex items-center gap-2">
            {stats.live}
            {stats.live > 0 && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">● Active Google Meet rooms</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Scheduled Ahead</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{stats.scheduled}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">Upcoming sessions</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Concluded</div>
          <div className="text-2xl font-black text-zinc-900 mt-1">{stats.completed}</div>
          <div className="text-[11px] text-zinc-500 font-medium mt-1">Archived meetings</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 sticky top-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-zinc-900" />
                <h2 className="text-base font-bold text-zinc-950 uppercase tracking-wider">
                  {editId ? 'Edit Virtual Meeting' : 'Schedule Virtual Meeting'}
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
                  Meeting Topic / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. Faculty Monthly Curriculum Review"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium placeholder:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Meeting Host <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.teacher}
                    onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
                  >
                    {hosts.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Audience / Participants <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-sm focus:ring-2 focus:ring-zinc-400 outline-none transition-colors font-medium"
                  >
                    {audiences.filter(a => a !== 'All Audiences').map(a => <option key={a} value={a}>{a}</option>)}
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
                    placeholder="03:00 PM"
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
                    Google Meet Meeting Link
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
                  placeholder="e.g. gmt-sync-101 or paste custom meet URL"
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
                  Agenda & Minutes Summary
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Conference objectives, discussions, and topics to cover..."
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
                  {submitting ? 'Saving Meeting...' : editId ? 'Update Meeting' : 'Save & Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Meeting List */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
            {/* Header & Tools */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-zinc-950 uppercase tracking-wider">GMeet Meeting List</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-900 border border-zinc-200">
                  {filteredRecords.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by topic, host, audience..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-950 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
                  />
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-zinc-200">
                  <button onClick={handleCopyList} title="Copy Table Records" className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition-colors">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => exportToExcel(filteredRecords, 'GMeet_Meetings')} title="Export to Excel" className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition-colors">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => exportToCSV(filteredRecords, 'GMeet_Meetings')} title="Export to CSV" className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition-colors">
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => exportToPDF(filteredRecords, ['topic', 'teacher', 'audience', 'date', 'time', 'duration', 'status'], 'Google Meet Meetings', 'GMeet_Meetings')} title="Export PDF" className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition-colors">
                    <Video className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => printData(filteredRecords, ['topic', 'teacher', 'audience', 'date', 'time', 'duration', 'status'], 'Google Meet Meetings')} title="Print Table" className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition-colors">
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-800 uppercase">Audience:</span>
                <select
                  value={filterAudience}
                  onChange={(e) => setFilterAudience(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-950 text-xs outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
                >
                  {audiences.map(a => <option key={a} value={a}>{a}</option>)}
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
                title="Refresh meeting records"
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
                    <th className="px-3.5 py-3.5">Meeting Topic</th>
                    <th className="px-3.5 py-3.5">Host</th>
                    <th className="px-3.5 py-3.5">Audience</th>
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
                          <span>Loading Google Meet conferences...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-zinc-600 font-semibold">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="h-8 w-8 text-zinc-400 stroke-1" />
                          <span className="text-zinc-950 font-bold text-sm">No Virtual Meetings Found</span>
                          <span className="text-zinc-500 text-xs">Schedule a staff conference or start an instant meeting above.</span>
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
                            {item.description && (
                              <div className="text-[11px] text-zinc-600 line-clamp-1 font-medium mt-0.5">{item.description}</div>
                            )}
                          </td>
                          <td className="px-3.5 py-3 font-semibold text-zinc-900 whitespace-nowrap">
                            {item.teacher}
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                              {item.audience || 'All Teachers'}
                            </span>
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
                              {/* Direct GMeet Join Button */}
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
                                title="Edit Meeting Details"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(item._id || item.id)}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg border border-rose-200 transition-colors"
                                title="Delete Virtual Meeting"
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

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 mt-2 text-xs text-zinc-600 font-medium">
              <div>
                Showing {filteredRecords.length} of {records.length} total meetings
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
