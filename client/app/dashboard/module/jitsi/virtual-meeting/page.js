'use client';

import { Input } from '@/components/ui/input';
import React, { useState, useMemo, useEffect } from 'react';
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
  Clock,
  X
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import { formatDateDMY } from '@/lib/utils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';

export default function JitsiVirtualMeetingPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    topic: '',
    host: '',
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

  // Dynamic hosts
  const [hosts, setHosts] = useState([]);
  const [hostsLoading, setHostsLoading] = useState(true);
  const [showAddHost, setShowAddHost] = useState(false);
  const [newHostName, setNewHostName] = useState('');

  const audienceOptions = ['All Teachers', 'Staff Members', 'Parents', 'Admin & Management', 'General'];

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/virtual-class?type=meeting');
      if (res?.success && Array.isArray(res.data)) {
        const jitsiMeetings = res.data.filter(r => !r.provider || r.provider === 'jitsi');
        setRecords(jitsiMeetings.length > 0 ? jitsiMeetings : res.data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Failed to fetch jitsi meetings:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHosts = async () => {
    setHostsLoading(true);
    try {
      const [tRes, sRes] = await Promise.allSettled([
        api.get('/teacher?limit=100'),
        api.get('/staff?limit=100')
      ]);

      const gatheredNames = new Set();
      if (tRes.status === 'fulfilled' && tRes.value?.data && Array.isArray(tRes.value.data)) {
        tRes.value.data.forEach(t => {
          const name = `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name;
          if (name) gatheredNames.add(name);
        });
      }

      if (sRes.status === 'fulfilled' && sRes.value?.data && Array.isArray(sRes.value.data)) {
        sRes.value.data.forEach(s => {
          const name = s.fullName || s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim();
          if (name) gatheredNames.add(name);
        });
      }

      const uniqueHosts = Array.from(gatheredNames);
      setHosts(uniqueHosts);
      if (uniqueHosts.length > 0) {
        setForm(prev => prev.host ? prev : { ...prev, host: uniqueHosts[0] });
      }
    } catch (err) {
      console.error('Failed to fetch hosts:', err);
    } finally {
      setHostsLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
    fetchRecords();
  }, []);

  const handleAddNewHost = () => {
    const trimmed = newHostName.trim();
    if (!trimmed) return;
    if (!hosts.includes(trimmed)) {
      setHosts(prev => [...prev, trimmed]);
    }
    setForm(prev => ({ ...prev, host: trimmed }));
    setNewHostName('');
    setShowAddHost(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      alert('Please enter a Meeting Topic.');
      return;
    }
    if (!form.host.trim()) {
      alert('Please select or add a Host / Organizer.');
      return;
    }

    try {
      setSubmitting(true);
      const roomUrl = `https://meet.jit.si/stoofi-meeting-${encodeURIComponent(form.topic.toLowerCase().replace(/[^a-z0-9]/g, '-'))}-${Date.now().toString().slice(-4)}`;
      const payload = {
        topic: form.topic.trim(),
        type: 'meeting',
        provider: 'jitsi',
        teacher: form.host.trim(),
        host: form.host.trim(),
        audience: form.audience,
        description: form.description || '',
        date: form.date,
        time: form.time,
        duration: Number(form.duration) || 45,
        password: form.password || '',
        status: 'Scheduled',
        roomUrl: roomUrl,
        meetCode: roomUrl.split('/').pop()
      };

      if (editId) {
        await api.put(`/virtual-class/${editId}`, payload);
        setEditId(null);
      } else {
        await api.post('/virtual-class', payload);
      }

      setForm(prev => ({
        ...prev,
        topic: '',
        description: '',
        password: ''
      }));

      await fetchRecords();
    } catch (err) {
      console.error('Error saving meeting:', err);
      alert(err.message || 'Error saving meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id || item.id);
    setForm({
      topic: item.topic || '',
      host: item.host || item.teacher || '',
      audience: item.audience || 'All Teachers',
      description: item.description || '',
      date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
      time: item.time || '14:00',
      duration: item.duration || 45,
      joinBeforeHost: '10',
      password: item.password || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this virtual meeting?')) {
      try {
        await api.delete(`/virtual-class/${id}`);
        await fetchRecords();
        if (editId === id) setEditId(null);
      } catch (err) {
        console.error('Error deleting meeting:', err);
        alert('Failed to delete meeting');
      }
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(prev => ({
      ...prev,
      topic: '',
      description: '',
      password: ''
    }));
  };

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchesAudience = filterAudience === 'All' || rec.audience === filterAudience;
      const hostVal = rec.host || rec.teacher || '';
      const matchesSearch = !search || 
        (rec.topic || '').toLowerCase().includes(search.toLowerCase()) ||
        hostVal.toLowerCase().includes(search.toLowerCase()) ||
        (rec.audience || '').toLowerCase().includes(search.toLowerCase());
      return matchesAudience && matchesSearch;
    });
  }, [records, filterAudience, search]);

  const handleCopy = () => {
    const text = filteredRecords.map(r => `${r.topic} | ${r.host || r.teacher} | ${r.audience} | ${formatDateDMY(r.date)} ${r.time} | ${r.duration} mins | ${r.status}`).join('\n');
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
                  placeholder="Enter meeting topic..."
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>

              {/* Host / Organizer */}
              <div>
                <div className="flex items-center justify-between mb-1.5 h-6">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider">
                    Host / Organizer <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowAddHost(v => !v); setNewHostName(''); }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    title="Add new host"
                  >
                    <Plus className="h-3.5 w-3.5" /> {showAddHost ? 'Cancel' : 'Add Custom Host'}
                  </button>
                </div>
                {showAddHost ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Enter host / organizer name..."
                      value={newHostName}
                      onChange={(e) => setNewHostName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewHost(); } if (e.key === 'Escape') { setShowAddHost(false); setNewHostName(''); } }}
                      className="flex-1 px-3.5 py-2.5 rounded-lg border border-indigo-400 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewHost}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <select
                    value={form.host}
                    onChange={(e) => setForm({ ...form, host: e.target.value })}
                    disabled={hostsLoading}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors disabled:opacity-60"
                  >
                    {hostsLoading ? (
                      <option value="">Loading hosts...</option>
                    ) : hosts.length === 0 ? (
                      <option value="">No hosts available — click &quot;Add Custom Host&quot;</option>
                    ) : (
                      <>
                        <option value="">-- Select Host / Organizer --</option>
                        {hosts.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </>
                    )}
                  </select>
                )}
              </div>

              {/* Audience */}
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
                  <Input
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
                  placeholder="e.g. 123456"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editId ? 'Update Virtual Meeting' : 'Save Virtual Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-200">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">
                  Virtual Meeting List
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-300 dark:border-zinc-200">
                  {filteredRecords.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="SEARCH"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-900 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                </div>
                <TableExportToolbar />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-medium">Filter Audience:</span>
                <select
                  value={filterAudience}
                  onChange={(e) => setFilterAudience(e.target.value)}
                  className="px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 font-medium text-xs outline-none focus:ring-1 focus:ring-zinc-600"
                >
                  <option value="All">All Audiences</option>
                  {audienceOptions.map(aud => (
                    <option key={aud} value={aud}>{aud}</option>
                  ))}
                </select>
              </div>
            </div>

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
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-zinc-500 font-medium">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-zinc-800 border-t-transparent animate-spin" />
                          <span>Loading virtual meetings...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                        No Data Available In Table
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item, index) => (
                      <tr
                        key={item._id || item.id || index}
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
                        <td className="px-3.5 py-3 font-medium text-zinc-700 dark:text-zinc-700 whitespace-nowrap">
                          {item.host || item.teacher}
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                            {item.audience}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap">
                          <div>{formatDateDMY(item.date)}</div>
                          <div className="text-[10px] text-zinc-400">{item.time}</div>
                        </td>
                        <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap">
                          {item.duration} Mins
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 text-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
                            {item.status || 'Scheduled'}
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
                              onClick={() => handleDelete(item._id || item.id)}
                              className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors"
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

            <div className="flex items-center justify-between pt-2 text-xs text-zinc-500">
              <div>
                Showing {filteredRecords.length} of {records.length} entries
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled
                  className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed"
                >
                  &lt;
                </button>
                <button className="px-2.5 py-1 rounded border border-zinc-600 bg-zinc-100 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 font-semibold">
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
