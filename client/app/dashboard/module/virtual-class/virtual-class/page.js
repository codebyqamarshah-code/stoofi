'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Radio,
  PlayCircle,
  Clock,
  Calendar,
  Users,
  ChevronLeft
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import { formatDateDMY } from '@/lib/utils';
import api from '@/services/api';

export default function VirtualClassModulePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Dynamic teachers and classes
  const [classes, setClasses] = useState([
    'All Classes', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'
  ]);
  const [sections, setSections] = useState(['A', 'B', 'C', 'D']);
  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState({
    classVal: 'Class 10',
    section: 'A',
    teacher: '',
    customTeacher: '',
    topic: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    duration: '45',
    password: '',
    provider: 'gmeet',
    status: 'Scheduled'
  });

  const [isCustomTeacher, setIsCustomTeacher] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All Classes');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch real records from backend
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/virtual-class?type=class');
      if (res?.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Error fetching virtual classes:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dynamic classes, sections, and teachers
  useEffect(() => {
    fetchRecords();

    // Fetch classes
    api.get('/class').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const clsNames = res.data.map(c => c.name || c.className).filter(Boolean);
        if (clsNames.length > 0) {
          setClasses(['All Classes', ...Array.from(new Set(clsNames))]);
        }
      }
    }).catch(() => {});

    // Fetch sections
    api.get('/section').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const secNames = res.data.map(s => s.name || s.sectionName).filter(Boolean);
        if (secNames.length > 0) {
          setSections(Array.from(new Set(secNames)));
        }
      }
    }).catch(() => {});

    // Fetch teachers from backend
    const fetchTeachersList = async () => {
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

        const uniqueTeachers = Array.from(gatheredNames);
        setTeachers(uniqueTeachers);

        // Ensure form.teacher has a valid default from real data
        setForm(prev => {
          if (!prev.teacher && uniqueTeachers.length > 0) {
            return { ...prev, teacher: uniqueTeachers[0] };
          }
          return prev;
        });
      } catch (e) {
        console.error('Error fetching teachers:', e);
      }
    };

    fetchTeachersList();
  }, []);

  // Generate Meet link
  const generateRoomUrl = (provider, cls, topicStr) => {
    const p1 = Math.random().toString(36).substring(2, 5);
    const p2 = Math.random().toString(36).substring(2, 6);
    const p3 = Math.random().toString(36).substring(2, 5);
    return `https://meet.google.com/${p1}-${p2}-${p3}`;
  };

  const effectiveTeacher = isCustomTeacher ? (form.customTeacher.trim() || 'Teacher') : form.teacher;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      alert('Please enter a Class Topic.');
      return;
    }

    const teacherName = effectiveTeacher;
    if (!teacherName) {
      alert('Please select or specify a Teacher / Host.');
      return;
    }

    try {
      setSubmitting(true);
      const roomUrl = generateRoomUrl(form.provider, form.classVal, form.topic);
      const meetCode = roomUrl.split('/').pop();

      const payload = {
        topic: form.topic.trim(),
        subject: form.topic.includes(':') ? form.topic.split(':')[0].trim() : 'General',
        classVal: form.classVal,
        section: form.section,
        teacher: teacherName,
        date: form.date,
        time: form.time,
        duration: Number(form.duration) || 45,
        type: 'class',
        provider: form.provider || 'gmeet',
        roomUrl: roomUrl,
        meetCode: meetCode,
        description: form.description || '',
        password: form.password || '',
        status: form.status || 'Scheduled'
      };

      if (editId) {
        const res = await api.put(`/virtual-class/${editId}`, payload);
        if (res?.success) {
          setFeedback({ type: 'success', text: 'Virtual class updated successfully!' });
          setEditId(null);
        } else {
          throw new Error(res?.message || 'Failed to update virtual class');
        }
      } else {
        const res = await api.post('/virtual-class', payload);
        if (res?.success) {
          setFeedback({ type: 'success', text: 'Virtual class scheduled successfully!' });
        } else {
          throw new Error(res?.message || 'Failed to save virtual class');
        }
      }

      // If user typed a custom teacher, add to teachers list for future reuse
      if (isCustomTeacher && form.customTeacher.trim()) {
        const customName = form.customTeacher.trim();
        if (!teachers.includes(customName)) {
          setTeachers(prev => [customName, ...prev]);
        }
        setIsCustomTeacher(false);
      }

      // Reset form but PRESERVE selected teacher, class, and section
      setForm(prev => ({
        ...prev,
        teacher: teacherName,
        customTeacher: '',
        topic: '',
        description: '',
        password: '',
        status: 'Scheduled'
      }));

      await fetchRecords();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error saving virtual class' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id || item.id);
    const teacherName = item.teacher || 'farhan abbas';
    
    // If teacher is not in list, add it
    if (!teachers.includes(teacherName)) {
      setTeachers(prev => [teacherName, ...prev]);
    }

    setForm({
      classVal: item.classVal || 'Class 10',
      section: item.section || 'A',
      teacher: teacherName,
      customTeacher: '',
      topic: item.topic || '',
      description: item.description || '',
      date: item.date || new Date().toISOString().split('T')[0],
      time: item.time || '09:00 AM',
      duration: String(item.duration || 45),
      password: item.password || '',
      provider: item.provider || 'gmeet',
      status: item.status || 'Scheduled'
    });
    setIsCustomTeacher(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(prev => ({
      ...prev,
      topic: '',
      description: '',
      password: '',
      customTeacher: ''
    }));
    setIsCustomTeacher(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this virtual class?')) {
      try {
        const res = await api.delete(`/virtual-class/${id}`);
        if (res?.success) {
          setFeedback({ type: 'success', text: 'Virtual class deleted.' });
          if (editId === id) cancelEdit();
          fetchRecords();
        } else {
          alert(res?.message || 'Failed to delete');
        }
      } catch (err) {
        alert(err.message || 'Error deleting virtual class');
      }
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Instant Live Class
  const handleStartInstant = async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];
    const roomUrl = generateRoomUrl('gmeet', form.classVal, 'Instant');
    const teacherName = effectiveTeacher || 'Teacher';

    try {
      setSubmitting(true);
      const payload = {
        topic: `Live Class: ${form.classVal} (${form.section})`,
        subject: 'Live Session',
        type: 'class',
        provider: 'gmeet',
        classVal: form.classVal,
        section: form.section,
        teacher: teacherName,
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
        setFeedback({ type: 'success', text: 'Live class session initiated!' });
        window.open(roomUrl, '_blank');
        fetchRecords();
      }
    } catch (err) {
      alert(err.message || 'Error starting instant class');
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Filtered & Search Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = (
        (r.topic || '') + ' ' + 
        (r.teacher || '') + ' ' + 
        (r.classVal || '') + ' ' + 
        (r.section || '')
      ).toLowerCase().includes(search.toLowerCase());

      const matchClass = 
        filterClass === 'All Classes' || 
        filterClass === 'All' || 
        r.classVal === filterClass;

      return matchSearch && matchClass;
    });
  }, [records, search, filterClass]);

  // Export handlers
  const handleCopy = () => {
    const text = filteredRecords.map(r => 
      `${r.classVal || ''} (${r.section || ''}) | ${r.topic || ''} | ${r.teacher || ''} | ${formatDateDMY(r.date)} ${r.time} | ${r.duration} Mins | ${r.status}`
    ).join('\n');
    navigator.clipboard.writeText(text);
    setFeedback({ type: 'success', text: 'Virtual class records copied to clipboard!' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExportCSV = () => {
    const exportData = filteredRecords.map((r, i) => ({
      SL: i + 1,
      Topic: r.topic,
      Class: `${r.classVal} (${r.section})`,
      Teacher: r.teacher,
      Date: formatDateDMY(r.date),
      Time: r.time,
      Duration: `${r.duration} Mins`,
      Status: r.status,
      MeetingUrl: r.roomUrl
    }));
    exportToCSV(exportData, 'Virtual_Classes_List');
  };

  const handleExportExcel = () => {
    const exportData = filteredRecords.map((r, i) => ({
      SL: i + 1,
      Topic: r.topic,
      Class: `${r.classVal} (${r.section})`,
      Teacher: r.teacher,
      Date: formatDateDMY(r.date),
      Time: r.time,
      Duration: `${r.duration} Mins`,
      Status: r.status,
      MeetingUrl: r.roomUrl
    }));
    exportToExcel(exportData, 'Virtual_Classes_List');
  };

  const handleExportPDF = () => {
    const exportData = filteredRecords.map((r, i) => ({
      SL: i + 1,
      Topic: r.topic,
      Class: `${r.classVal} (${r.section})`,
      Teacher: r.teacher,
      Date: formatDateDMY(r.date),
      Time: r.time,
      Duration: `${r.duration} Mins`,
      Status: r.status
    }));
    exportToPDF(
      exportData,
      ['SL', 'Topic', 'Class', 'Teacher', 'Date', 'Time', 'Duration', 'Status'],
      'Virtual Classes List',
      'Virtual_Classes_List'
    );
  };

  const handlePrint = () => {
    const exportData = filteredRecords.map((r, i) => ({
      SL: i + 1,
      Topic: r.topic,
      Class: `${r.classVal} (${r.section})`,
      Teacher: r.teacher,
      Date: formatDateDMY(r.date),
      Time: r.time,
      Duration: `${r.duration} Mins`,
      Status: r.status
    }));
    printData(
      exportData,
      ['SL', 'Topic', 'Class', 'Teacher', 'Date', 'Time', 'Duration', 'Status'],
      'Virtual Classes List'
    );
  };

  // Pagination slice
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Virtual Class List</h1>
          <p className="text-xs text-zinc-500 mt-1">Schedule and manage online video lectures with live student portal synchronization.</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-800 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <Link href="/dashboard/module/virtual-class" className="hover:text-zinc-800 transition-colors">
            Virtual Class
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-bold">Virtual Class</span>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Grid: Form Left, List Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Form: Add / Edit Virtual Class */}
        <div className="xl:col-span-4">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100">
              <h2 className="text-base font-bold text-[#084A86] uppercase tracking-wider">
                {editId ? 'EDIT VIRTUAL CLASS' : 'ADD VIRTUAL CLASS'}
              </h2>
              {editId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Class & Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Class <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.classVal}
                    onChange={(e) => setForm({ ...form, classVal: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86] outline-none font-medium transition-colors"
                  >
                    {classes.filter(c => c !== 'All Classes').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86] outline-none font-medium transition-colors"
                  >
                    {sections.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Teacher / Host */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Teacher / Host <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomTeacher(!isCustomTeacher)}
                    className="text-[11px] font-semibold text-[#084A86] hover:underline cursor-pointer"
                  >
                    {isCustomTeacher ? 'Choose from list' : '+ Type custom name'}
                  </button>
                </div>

                {isCustomTeacher ? (
                  <input
                    type="text"
                    required
                    placeholder="Enter teacher name"
                    value={form.customTeacher}
                    onChange={(e) => setForm({ ...form, customTeacher: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86] outline-none font-medium transition-colors"
                  />
                ) : (
                  <select
                    value={form.teacher}
                    onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86] outline-none font-medium transition-colors"
                  >
                    {teachers.length === 0 ? (
                      <option value="">No teachers found — type custom name</option>
                    ) : (
                      <>
                        <option value="">-- Select Teacher --</option>
                        {teachers.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </>
                    )}
                  </select>
                )}
              </div>

              {/* Class Topic */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Class Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter class topic"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86] outline-none font-medium transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline syllabus topics or instructions..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86] outline-none font-medium transition-colors resize-none"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86] outline-none font-medium transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 AM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86] outline-none font-medium transition-colors"
                  />
                </div>
              </div>

              {/* Duration & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Duration (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    required
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86] outline-none font-medium transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Meeting Password
                  </label>
                  <input
                    type="text"
                    placeholder="Auto or custom pass..."
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86] outline-none font-medium transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#084A86' }}
                  className="flex-1 px-6 py-2.5 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? 'SAVING...' : (editId ? 'UPDATE VIRTUAL CLASS' : 'SAVE VIRTUAL CLASS')}
                </button>

                <button
                  type="button"
                  onClick={handleStartInstant}
                  disabled={submitting}
                  style={{ backgroundColor: '#009966' }}
                  className="px-4 py-2.5 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  title="Launch an instant live lecture right now"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Start Live</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right List: Virtual Class List */}
        <div className="xl:col-span-8">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-4">
            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-[#084A86] uppercase tracking-wider">
                  VIRTUAL CLASS LIST
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#084A86] border border-blue-200">
                  {filteredRecords.length}
                </span>
              </div>

              {/* Filter, Search & Export Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Class */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">FILTER CLASS:</span>
                  <select
                    value={filterClass}
                    onChange={(e) => {
                      setFilterClass(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-8.5 px-2.5 text-xs font-semibold rounded-lg border border-zinc-300 bg-white text-zinc-900 outline-none focus:ring-1 focus:ring-[#084A86]"
                  >
                    {classes.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="relative min-w-[160px] sm:min-w-[180px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="SEARCH"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-[#084A86] font-medium"
                  />
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-1 border-l border-zinc-200 pl-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-zinc-600 hover:text-[#084A86] hover:bg-zinc-100 rounded-md transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="p-1.5 text-zinc-600 hover:text-[#009966] hover:bg-zinc-100 rounded-md transition-colors"
                    title="Export Excel"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="p-1.5 text-zinc-600 hover:text-rose-600 hover:bg-zinc-100 rounded-md transition-colors"
                    title="Export PDF"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                    title="Print"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-[#084A86] uppercase bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-3.5 py-3">TOPIC</th>
                    <th className="px-3.5 py-3">TEACHER</th>
                    <th className="px-3.5 py-3">DATE & TIME</th>
                    <th className="px-3.5 py-3">DURATION</th>
                    <th className="px-3.5 py-3">STATUS</th>
                    <th className="px-3.5 py-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-zinc-500 font-semibold">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          <span>Loading virtual classes...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-zinc-400 font-medium">
                        No Data Available In Table
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((item) => (
                      <tr key={item._id || item.id} className="hover:bg-zinc-50/80 transition-colors">
                        {/* Topic */}
                        <td className="px-3.5 py-3 font-semibold text-zinc-900">
                          <div className="line-clamp-1 text-xs font-bold text-[#084A86]">
                            {item.topic}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-medium mt-0.5 flex items-center gap-1.5">
                            <span className="font-semibold text-zinc-700">{item.classVal}</span>
                            <span>({item.section})</span>
                            {item.description && (
                              <>
                                <span>•</span>
                                <span className="line-clamp-1 italic">{item.description}</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Teacher */}
                        <td className="px-3.5 py-3 font-bold text-zinc-800 whitespace-nowrap">
                          {item.teacher}
                        </td>

                        {/* Date & Time */}
                        <td className="px-3.5 py-3 text-zinc-700 whitespace-nowrap font-medium font-mono text-[11px]">
                          <div>{formatDateDMY(item.date)}</div>
                          <div className="text-[10px] text-zinc-500">{item.time}</div>
                        </td>

                        {/* Duration */}
                        <td className="px-3.5 py-3 text-zinc-700 whitespace-nowrap font-semibold">
                          {item.duration} Mins
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          {item.status === 'Live' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 animate-pulse">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Live Now
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#084A86] border border-blue-200">
                              {item.status || 'Scheduled'}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={item.roomUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ backgroundColor: '#084A86' }}
                              className="px-2.5 py-1 text-white hover:opacity-90 rounded-md text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <Video className="h-3 w-3" />
                              <span>Start</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="p-1 text-zinc-400 hover:text-[#084A86] hover:bg-zinc-100 rounded transition cursor-pointer"
                              title="Edit class"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item._id || item.id)}
                              className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 rounded transition cursor-pointer"
                              title="Delete class"
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

            {/* Footer Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-zinc-500">
              <div>
                Showing {filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} entries
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`h-7 w-7 rounded text-xs font-bold transition ${
                        currentPage === idx + 1
                          ? 'bg-[#084A86] text-white'
                          : 'border border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
