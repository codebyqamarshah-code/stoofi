'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Search,
  Download,
  Printer,
  FileText,
  Trash2,
  Edit,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  FlaskConical,
  Users,
  Building,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  Layers,
  GraduationCap,
  Sparkles,
  BookOpen,
  Filter,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';
import api from '@/services/api';
import labService from '@/services/labService';

export default function LabSchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableLabs, setAvailableLabs] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scheduleData, labsData, classRes, sectionRes] = await Promise.all([
        labService.getSchedules(),
        labService.getLabs(),
        api.get('/class').catch(() => null),
        api.get('/section').catch(() => null)
      ]);

      if (Array.isArray(scheduleData)) {
        setSessions(scheduleData);
      }
      if (Array.isArray(labsData)) {
        setAvailableLabs(labsData);
      }
      if (classRes && Array.isArray(classRes.data)) {
        setClassesList(classRes.data.map(c => c.name));
      } else {
        setClassesList(['BS Psychology', 'BS RIT', 'DPT', 'FSC Dental', 'FSC NURSING', 'FSC OTT']);
      }
      if (sectionRes && Array.isArray(sectionRes.data)) {
        setSectionsList(sectionRes.data.map(s => s.name));
      } else {
        setSectionsList(['Section A', 'Section B', 'Section C', 'Section D']);
      }
    } catch (err) {
      console.error('Error loading lab schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedLab, setSelectedLab] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [viewingSession, setViewingSession] = useState(null);

  const [formData, setFormData] = useState({
    className: 'FSC OTT',
    sectionName: 'Section A',
    program: 'General Sciences',
    subject: '',
    teacher: '',
    labId: '',
    labName: '',
    day: 'Monday',
    date: '',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    batch: 'All Students',
    capacityAllocated: 30,
    topic: '',
    status: 'Scheduled',
    recurrence: 'Weekly'
  });

  const daysOfWeek = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredSessions = sessions.filter(item => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q ||
      (item.subject || '').toLowerCase().includes(q) ||
      (item.teacher || '').toLowerCase().includes(q) ||
      (item.program || '').toLowerCase().includes(q) ||
      (item.className || '').toLowerCase().includes(q) ||
      (item.sectionName || '').toLowerCase().includes(q) ||
      (item.classSemester || '').toLowerCase().includes(q) ||
      (item.labName || '').toLowerCase().includes(q) ||
      (item.topic || '').toLowerCase().includes(q) ||
      (item.batch || '').toLowerCase().includes(q);

    const matchesDay = selectedDay === 'All' || item.day === selectedDay;
    const matchesLab = selectedLab === 'All' || item.labName === selectedLab || item.labId === selectedLab;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesDay && matchesLab && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingSession(null);
    const defaultLab = availableLabs.length > 0 ? availableLabs[0] : null;
    setFormData({
      className: classesList[0] || 'Class 10',
      sectionName: sectionsList[0] || 'Section A',
      program: 'General Sciences',
      subject: '',
      teacher: '',
      labId: defaultLab ? (defaultLab._id || defaultLab.id) : '',
      labName: defaultLab ? defaultLab.name : '',
      day: 'Monday',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      batch: 'All Students',
      capacityAllocated: 30,
      topic: '',
      status: 'Scheduled',
      recurrence: 'Weekly'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (session) => {
    setEditingSession(session);
    setFormData({
      ...session,
      className: session.className || (session.classSemester ? session.classSemester.split('-')[0].trim() : 'Class 10'),
      sectionName: session.sectionName || (session.classSemester && session.classSemester.includes('-') ? session.classSemester.split('-')[1].trim() : 'Section A'),
      program: session.program || 'General Sciences',
      capacityAllocated: session.capacityAllocated || 30,
      topic: session.topic || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      alert('Subject is required');
      return;
    }

    const matchedLab = availableLabs.find(l => (l.name === formData.labName || (l._id || l.id) === formData.labId));
    const labNameVal = formData.labName || (matchedLab ? matchedLab.name : 'Main Laboratory');
    const labIdVal = formData.labId || (matchedLab ? (matchedLab._id || matchedLab.id) : '');

    const payload = {
      ...formData,
      className: formData.className || 'Class 10',
      sectionName: formData.sectionName || 'Section A',
      classSemester: `${formData.className || 'Class 10'} - ${formData.sectionName || 'Section A'}`,
      labName: labNameVal,
      labId: labIdVal,
      room: labNameVal,
      isLab: true
    };

    if (editingSession) {
      payload._id = editingSession._id;
      payload.id = editingSession.id;
    }

    try {
      const saved = await labService.saveSchedule(payload);
      if (editingSession) {
        setSessions(sessions.map(s => (s.id === editingSession.id || s._id === editingSession._id) ? (saved || payload) : s));
      } else {
        if (saved) {
          setSessions(prev => [saved, ...prev.filter(s => s._id !== saved._id && s.id !== saved.id)]);
        } else {
          await loadData();
        }
      }
    } catch (err) {
      console.error('Failed to save lab schedule:', err);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (session) => {
    const id = typeof session === 'object' ? (session._id || session.id) : session;
    if (confirm('Are you sure you want to delete this lab session from schedule?')) {
      try {
        await labService.deleteSchedule(id);
        setSessions(sessions.filter(s => s.id !== id && s._id !== id));
      } catch (err) {
        console.error('Failed to delete lab schedule:', err);
      }
    }
  };

  const exportHeaders = ['ID', 'Class', 'Section', 'Subject', 'Teacher', 'Lab', 'Day', 'Time Slot', 'Batch', 'Topic', 'Status'];
  const exportData = filteredSessions.map(s => [
    s.id || s._id,
    s.className || s.classSemester || '-',
    s.sectionName || '-',
    s.subject,
    s.teacher,
    s.labName,
    s.day,
    `${s.startTime} - ${s.endTime}`,
    s.batch,
    s.topic,
    s.status
  ]);

  const totalWeeklySessions = sessions.length;
  const activeToday = sessions.filter(s => s.status === 'In Progress').length;
  const scheduledCount = sessions.filter(s => s.status === 'Scheduled').length;
  const completedCount = sessions.filter(s => s.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-zinc-600">
          <Link href="/dashboard" className="hover:text-emerald-700 font-medium">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <Link href="/dashboard/labs" className="hover:text-emerald-700 font-medium">Labs</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Lab Schedule & Timetable</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Academic Lab Timetable</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Lab Schedule & Time Slots</h1>
          <p className="text-emerald-200/90 text-sm mt-1">
            Allocate laboratory periods, link with Class Routines, and track live session status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
          >
            {viewMode === 'list' ? '📅 Timetable Grid View' : '📋 List View'}
          </Button>
          <Button
            onClick={handleOpenAddModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Schedule Lab Session
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Weekly Sessions</div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">{totalWeeklySessions}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {availableLabs.length > 0 ? `Across ${availableLabs.length} Labs` : 'All Labs'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Active Right Now</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{activeToday}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">Live in session</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Upcoming Slots</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{scheduledCount}</div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">Scheduled periods</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Completed</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">{completedCount}</div>
            <div className="text-[11px] text-emerald-800 font-medium mt-1">Conducted slots</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Export Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
        {/* Day Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-zinc-600 uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Day:
          </span>
          {daysOfWeek.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-zinc-100">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search subject, teacher, class, lab or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="text-xs border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-700"
            >
              <option value="All">All Laboratories</option>
              {availableLabs.map(l => (
                <option key={l._id || l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-700"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => exportToCSV('Lab_Schedule', exportHeaders, exportData)}
              variant="outline"
              size="sm"
              className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </Button>
            <Button
              onClick={() => exportToExcel('Lab_Schedule', exportHeaders, exportData)}
              variant="outline"
              size="sm"
              className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
            >
              <FileText className="w-3.5 h-3.5" /> Excel
            </Button>
            <Button
              onClick={() => printData('Lab Timetable & Schedule', exportHeaders, exportData)}
              variant="outline"
              size="sm"
              className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </Button>
          </div>
        </div>
      </div>

      {/* Grid or List View */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-zinc-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
          <p className="text-sm font-semibold text-zinc-800">Loading Lab Schedule...</p>
          <p className="text-xs text-zinc-500 mt-1">Retrieving scheduled laboratory periods</p>
        </div>
      ) : viewMode === 'grid' ? (
        filteredSessions.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200">
            <CalendarIcon className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="font-semibold text-sm text-zinc-800">No lab sessions found</p>
            <p className="text-xs text-zinc-500 mt-1">Click &quot;Schedule Lab Session&quot; to assign a period to a laboratory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => (
              <div key={session.id || session._id} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-semibold">
                      <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{session.day} • {session.startTime} - {session.endTime}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      session.status === 'In Progress' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                      session.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      session.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-zinc-900 text-base leading-snug">{session.subject}</h3>
                  <div className="text-xs font-medium text-emerald-800 mt-0.5 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{session.className || session.classSemester}</span>
                    {session.sectionName && <span>({session.sectionName})</span>}
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 text-xs space-y-1.5 text-zinc-600">
                    <div className="flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="font-medium text-zinc-800">{session.labName || session.room}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Instructor: <strong className="text-zinc-800">{session.teacher || 'Unassigned'}</strong></span>
                    </div>
                    {session.topic && (
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>Topic: <em className="text-zinc-700">{session.topic}</em></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 text-xs">
                  <span className="text-zinc-600 font-medium">{session.batch || 'All Students'}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => { setViewingSession(session); setIsViewModalOpen(true); }}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleOpenEditModal(session)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(session)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Day & Time</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Class / Section</th>
                  <th className="py-3 px-4">Laboratory</th>
                  <th className="py-3 px-4">Teacher</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-zinc-500">
                      <CalendarIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="font-semibold text-xs text-zinc-700">No lab sessions scheduled</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Click &quot;Schedule Lab Session&quot; to assign timetable slots for your classes.</p>
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id || session._id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-zinc-900">{session.day}</div>
                        <div className="text-[11px] text-zinc-500">{session.startTime} - {session.endTime}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900">{session.subject}</div>
                        {session.topic && <div className="text-[11px] text-zinc-500 line-clamp-1">{session.topic}</div>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-zinc-700">
                        {session.className || session.classSemester}
                        {session.sectionName ? ` (${session.sectionName})` : ''}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-800 flex items-center gap-1.5">
                          <FlaskConical className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{session.labName || session.room}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-800">
                        {session.teacher || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-600">
                        {session.batch || 'All Students'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          session.status === 'In Progress' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          session.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          session.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            onClick={() => { setViewingSession(session); setIsViewModalOpen(true); }}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleOpenEditModal(session)}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(session)}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    {editingSession ? 'Edit Scheduled Lab Session' : 'Schedule New Lab Session'}
                  </h2>
                  <p className="text-xs text-zinc-500">Assign laboratory timetable slot and link with Class Routine</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Class <span className="text-rose-500">*</span></Label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-medium"
                    required
                  >
                    {classesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Section <span className="text-rose-500">*</span></Label>
                  <select
                    value={formData.sectionName}
                    onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-medium"
                    required
                  >
                    {sectionsList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Subject / Course Name <span className="text-rose-500">*</span></Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Physics Practical (PHY-101)"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Teacher / Lab Instructor</Label>
                  <Input
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    placeholder="e.g. Dr. Farooq Khan"
                    className="text-xs mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Allocated Laboratory <span className="text-rose-500">*</span></Label>
                  {availableLabs.length > 0 ? (
                    <select
                      value={formData.labName}
                      onChange={(e) => {
                        const selected = availableLabs.find(l => l.name === e.target.value);
                        setFormData({
                          ...formData,
                          labName: e.target.value,
                          labId: selected ? (selected._id || selected.id) : ''
                        });
                      }}
                      className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-medium"
                      required
                    >
                      <option value="">Select a Laboratory</option>
                      {availableLabs.map(l => (
                        <option key={l._id || l.id} value={l.name}>{l.name} ({l.roomNumber || l.labCode || 'Lab'})</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={formData.labName}
                      onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                      placeholder="e.g. Advanced Physics Lab (A-204)"
                      className="text-xs mt-1"
                      required
                    />
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Day of the Week <span className="text-rose-500">*</span></Label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-medium"
                    required
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Batch / Student Group</Label>
                  <Input
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="e.g. Batch A or All Students"
                    className="text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Start Time <span className="text-rose-500">*</span></Label>
                  <Input
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">End Time <span className="text-rose-500">*</span></Label>
                  <Input
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="e.g. 12:00 PM"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Allocated Seats / Capacity</Label>
                  <Input
                    type="number"
                    value={formData.capacityAllocated}
                    onChange={(e) => setFormData({ ...formData, capacityAllocated: parseInt(e.target.value) || 0 })}
                    className="text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Session Status</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-semibold"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Experiment / Practical Topic</Label>
                  <Input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Acid-Base Titration & pH Verification"
                    className="text-xs mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                >
                  {editingSession ? 'Update Session' : 'Save & Link to Routine'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Session Details Modal */}
      {isViewModalOpen && viewingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">{viewingSession.subject}</h3>
                  <p className="text-xs text-emerald-700 font-medium">
                    {viewingSession.className || viewingSession.classSemester}
                    {viewingSession.sectionName ? ` • ${viewingSession.sectionName}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div>
                  <span className="text-zinc-500 block">Class & Section:</span>
                  <span className="font-semibold text-zinc-900">
                    {viewingSession.className || viewingSession.classSemester} {viewingSession.sectionName || ''}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Batch / Group:</span>
                  <span className="font-semibold text-zinc-900">{viewingSession.batch || 'All Students'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Day & Time:</span>
                  <span className="font-semibold text-zinc-900">{viewingSession.day} ({viewingSession.startTime} - {viewingSession.endTime})</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Status:</span>
                  <span className="font-semibold text-emerald-700">{viewingSession.status}</span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block">Assigned Laboratory:</span>
                <span className="font-bold text-zinc-900">{viewingSession.labName || viewingSession.room}</span>
              </div>

              <div>
                <span className="text-zinc-500 block">Faculty Instructor:</span>
                <span className="font-medium text-zinc-900">{viewingSession.teacher || 'Unassigned'}</span>
              </div>

              <div>
                <span className="text-zinc-500 block">Experiment / Practical Topic:</span>
                <p className="font-medium text-zinc-800 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 mt-1">
                  {viewingSession.topic || 'General Laboratory Practicals'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-200">
              <Button onClick={() => setIsViewModalOpen(false)} size="sm" className="bg-zinc-900 text-white text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
