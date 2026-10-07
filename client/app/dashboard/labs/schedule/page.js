'use client';

import Link from 'next/link';
import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function LabSchedulePage() {
  const [sessions, setSessions] = useState([
    {
      id: 'SCH-101',
      program: 'BS Computer Science',
      classSemester: 'Semester 1 - Section A',
      subject: 'Programming Fundamentals (CS-101)',
      teacher: 'Mr. Ali Raza (Lecturer)',
      labId: 'LAB-002',
      labName: 'Software Engineering & AI Lab 1 (IT-302)',
      day: 'Monday',
      date: '2026-10-12',
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      batch: 'Batch A (Roll 01-25)',
      capacityAllocated: 25,
      topic: 'Pointers & Dynamic Memory Allocation in C++',
      status: 'Scheduled',
      recurrence: 'Weekly'
    },
    {
      id: 'SCH-102',
      program: 'FSc Pre-Engineering',
      classSemester: '1st Year - Section Green',
      subject: 'Physics Practical (PHY-101)',
      teacher: 'Dr. Farooq Khan',
      labId: 'LAB-001',
      labName: 'Advanced Physics Lab (A-204)',
      day: 'Monday',
      date: '2026-10-12',
      startTime: '01:30 PM',
      endTime: '03:30 PM',
      batch: 'All Students',
      capacityAllocated: 30,
      topic: 'Measurement with Vernier Caliper & Micrometer Screw Gauge',
      status: 'In Progress',
      recurrence: 'Weekly'
    },
    {
      id: 'SCH-103',
      program: 'FSc Pre-Medical',
      classSemester: '2nd Year - Section Blue',
      subject: 'Organic Chemistry (CHEM-201)',
      teacher: 'Prof. Saima Tariq',
      labId: 'LAB-003',
      labName: 'Organic & Inorganic Chemistry Lab (C-101)',
      day: 'Tuesday',
      date: '2026-10-13',
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      batch: 'Group 1',
      capacityAllocated: 28,
      topic: 'Acid-Base Titration & pH Verification',
      status: 'Scheduled',
      recurrence: 'Weekly'
    },
    {
      id: 'SCH-104',
      program: 'BS Robotics & Mechatronics',
      classSemester: 'Semester 4',
      subject: 'Microcontrollers & IoT (ME-402)',
      teacher: 'Engr. Haris Mehmood',
      labId: 'LAB-005',
      labName: 'Robotics, IoT & Embedded Systems Lab (R-105)',
      day: 'Wednesday',
      date: '2026-10-14',
      startTime: '11:30 AM',
      endTime: '01:30 PM',
      batch: 'Batch Alpha',
      capacityAllocated: 20,
      topic: 'Interfacing Ultrasonic Sensors with ESP32 & Arduino',
      status: 'Scheduled',
      recurrence: 'Weekly'
    },
    {
      id: 'SCH-105',
      program: 'BS Artificial Intelligence',
      classSemester: 'Semester 6',
      subject: 'Deep Learning & Neural Networks (AI-601)',
      teacher: 'Dr. Zeeshan Abbas',
      labId: 'LAB-002',
      labName: 'Software Engineering & AI Lab 1 (IT-302)',
      day: 'Thursday',
      date: '2026-10-15',
      startTime: '02:00 PM',
      endTime: '04:00 PM',
      batch: 'All Students',
      capacityAllocated: 35,
      topic: 'Training Vision Transformers with PyTorch on CUDA Workstations',
      status: 'Scheduled',
      recurrence: 'Weekly'
    },
    {
      id: 'SCH-106',
      program: 'BS Computer Science',
      classSemester: 'Semester 2 - Section B',
      subject: 'Object Oriented Programming (CS-102)',
      teacher: 'Ms. Hira Naeem',
      labId: 'LAB-002',
      labName: 'Software Engineering & AI Lab 1 (IT-302)',
      day: 'Friday',
      date: '2026-10-16',
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      batch: 'Batch B (Roll 26-50)',
      capacityAllocated: 25,
      topic: 'Polymorphism & Abstract Base Classes in Java',
      status: 'Completed',
      recurrence: 'Weekly'
    }
  ]);

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
    program: 'BS Computer Science',
    classSemester: 'Semester 1 - Section A',
    subject: '',
    teacher: '',
    labId: 'LAB-001',
    labName: 'Advanced Physics Lab (A-204)',
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

  const daysOfWeek = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const labOptions = [
    { id: 'LAB-001', name: 'Advanced Physics Lab (A-204)' },
    { id: 'LAB-002', name: 'Software Engineering & AI Lab 1 (IT-302)' },
    { id: 'LAB-003', name: 'Organic & Inorganic Chemistry Lab (C-101)' },
    { id: 'LAB-004', name: 'Molecular Biology & Genetics Lab (B-102)' },
    { id: 'LAB-005', name: 'Robotics, IoT & Embedded Systems Lab (R-105)' },
    { id: 'LAB-006', name: 'Digital Language & Phonetics Lab (L-201)' }
  ];

  const filteredSessions = sessions.filter(item => {
    const matchesSearch = 
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.classSemester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDay = selectedDay === 'All' || item.day === selectedDay;
    const matchesLab = selectedLab === 'All' || item.labName.includes(selectedLab);
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesDay && matchesLab && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingSession(null);
    setFormData({
      program: 'BS Computer Science',
      classSemester: 'Semester 1 - Section A',
      subject: '',
      teacher: '',
      labId: 'LAB-001',
      labName: 'Advanced Physics Lab (A-204)',
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
    setFormData({ ...session });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingSession) {
      setSessions(sessions.map(s => s.id === editingSession.id ? { ...formData, id: editingSession.id } : s));
    } else {
      const newId = `SCH-${100 + sessions.length + 1}`;
      setSessions([...sessions, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this lab session from schedule?')) {
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  const exportHeaders = ['ID', 'Program', 'Class / Semester', 'Subject', 'Teacher', 'Lab', 'Day', 'Time Slot', 'Batch', 'Topic', 'Status'];
  const exportData = filteredSessions.map(s => [
    s.id,
    s.program,
    s.classSemester,
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
            Program → Class/Semester → Subject → Teacher → Lab allocation with conflict-free scheduling
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
            <div className="text-[11px] text-emerald-700 font-medium mt-1">Across 6 Labs</div>
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
            <div className="text-[11px] text-blue-600 font-medium mt-1">Scheduled for this week</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Completed This Week</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">{completedCount}</div>
            <div className="text-[11px] text-emerald-800 font-medium mt-1">100% Attendance logged</div>
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
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
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
              {labOptions.map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
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
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-semibold">
                    <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{session.day} • {session.startTime} - {session.endTime}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    session.status === 'In Progress' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    session.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {session.status}
                  </span>
                </div>

                <h3 className="font-bold text-zinc-900 text-base leading-snug">{session.subject}</h3>
                <div className="text-xs font-medium text-emerald-800 mt-0.5 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {session.program} ({session.classSemester})
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 text-xs space-y-1.5 text-zinc-600">
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="font-medium text-zinc-800">{session.labName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>Instructor: <strong className="text-zinc-800">{session.teacher}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>Topic: <em className="text-zinc-700">{session.topic}</em></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 text-xs">
                <span className="text-zinc-600 font-medium">{session.batch}</span>
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
                    onClick={() => handleDelete(session.id)}
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
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Day & Time</th>
                  <th className="py-3 px-4">Subject & Program</th>
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
                    <td colSpan="8" className="py-8 text-center text-zinc-500 text-xs">
                      No lab sessions found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-zinc-900">{session.day}</div>
                        <div className="text-[11px] text-zinc-500">{session.startTime} - {session.endTime}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900">{session.subject}</div>
                        <div className="text-[11px] text-emerald-700 font-medium">{session.program}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-zinc-700">
                        {session.classSemester}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-800">{session.labName}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-800">
                        {session.teacher}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-600">
                        {session.batch} ({session.capacityAllocated} Seats)
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          session.status === 'In Progress' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          session.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
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
                            onClick={() => handleDelete(session.id)}
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
                  <p className="text-xs text-zinc-500">Assign laboratory timetable slot and link with academic curriculum</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Program / Degree</Label>
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                    required
                  >
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
                    <option value="BS Software Engineering">BS Software Engineering</option>
                    <option value="BS Robotics & Mechatronics">BS Robotics & Mechatronics</option>
                    <option value="FSc Pre-Engineering">FSc Pre-Engineering</option>
                    <option value="FSc Pre-Medical">FSc Pre-Medical</option>
                    <option value="Matric Science">Matric Science</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Class / Semester / Section</Label>
                  <Input
                    value={formData.classSemester}
                    onChange={(e) => setFormData({ ...formData, classSemester: e.target.value })}
                    placeholder="e.g. Semester 1 - Section A"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Subject / Course Code</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Programming Fundamentals (CS-101)"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Teacher / Instructor</Label>
                  <Input
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    placeholder="e.g. Mr. Ali Raza (Lecturer)"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Allocated Laboratory</Label>
                  <select
                    value={formData.labName}
                    onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-medium"
                    required
                  >
                    {labOptions.map(l => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Day of the Week</Label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                    required
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Batch / Student Group</Label>
                  <Input
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="e.g. Batch A (Roll 01-25) or All Students"
                    className="text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Start Time</Label>
                  <Input
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">End Time</Label>
                  <Input
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="e.g. 12:00 PM"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Capacity Allocated (Students)</Label>
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
                  <Label className="text-xs font-semibold text-zinc-700">Practical / Experiment Topic</Label>
                  <Input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Pointers & Dynamic Memory Allocation in C++"
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
                  {editingSession ? 'Update Session' : 'Save & Allocate Slot'}
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
                  {viewingSession.id}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">{viewingSession.subject}</h3>
                  <p className="text-xs text-emerald-700 font-medium">{viewingSession.program}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div>
                  <span className="text-zinc-500 block">Class / Semester:</span>
                  <span className="font-semibold text-zinc-900">{viewingSession.classSemester}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Batch / Group:</span>
                  <span className="font-semibold text-zinc-900">{viewingSession.batch}</span>
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
                <span className="font-bold text-zinc-900">{viewingSession.labName}</span>
              </div>

              <div>
                <span className="text-zinc-500 block">Faculty Instructor:</span>
                <span className="font-medium text-zinc-900">{viewingSession.teacher}</span>
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
