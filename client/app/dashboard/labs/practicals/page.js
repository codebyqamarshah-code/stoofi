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
  FlaskConical,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  Layers,
  GraduationCap,
  Sparkles,
  Users,
  Award,
  ListChecks,
  Boxes,
  FileCheck,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';
import labService from '@/services/labService';

export default function PracticalsPage() {
  const [practicals, setPracticals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPracticals = async () => {
    setLoading(true);
    try {
      const data = await labService.getPracticals();
      if (Array.isArray(data)) setPracticals(data);
    } catch (err) {
      console.error('Failed to load practicals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPracticals();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [editingPractical, setEditingPractical] = useState(null);
  const [viewingPractical, setViewingPractical] = useState(null);

  const [formData, setFormData] = useState({
    number: 'Practical #01',
    title: '',
    subject: 'Physics (PHY-101)',
    classSemester: 'FSc Pre-Engineering 1st Year',
    labName: 'Advanced Physics Lab (A-204)',
    instructor: '',
    date: new Date().toISOString().split('T')[0],
    duration: '2 Hours',
    totalMarks: 20,
    status: 'Upcoming',
    attendanceCount: 'Pending',
    objectives: '',
    requiredEquipment: '',
    requiredMaterials: '',
    safetyInstructions: '',
    marksEntered: false
  });

  const subjectOptions = [
    'All',
    'Physics (PHY-101)',
    'Chemistry (CHEM-102)',
    'Data Structures & Algorithms (CS-201)',
    'Biology & Genetics (BIO-101)',
    'Microcontrollers & IoT (ME-402)'
  ];

  const filteredPracticals = practicals.filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.instructor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.classSemester || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.labName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingPractical(null);
    setFormData({
      number: `Practical #${practicals.length + 1}`,
      title: '',
      subject: 'Physics (PHY-101)',
      classSemester: 'FSc Pre-Engineering 1st Year',
      labName: 'Advanced Physics Lab (A-204)',
      instructor: '',
      date: new Date().toISOString().split('T')[0],
      duration: '2 Hours',
      totalMarks: 20,
      status: 'Upcoming',
      attendanceCount: 'Pending',
      objectives: '',
      requiredEquipment: '',
      requiredMaterials: '',
      safetyInstructions: '',
      marksEntered: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prac) => {
    setEditingPractical(prac);
    setFormData({ ...prac });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (editingPractical) {
      payload._id = editingPractical._id;
      payload.id = editingPractical.id;
    }
    try {
      const saved = await labService.savePractical(payload);
      if (editingPractical) {
        setPracticals(practicals.map(p => (p.id === editingPractical.id || p._id === editingPractical._id) ? (saved || payload) : p));
      } else {
        if (saved) {
          setPracticals(prev => [saved, ...prev.filter(p => p._id !== saved._id && p.id !== saved.id)]);
        } else {
          await loadPracticals();
        }
      }
    } catch (err) {
      console.error('Failed to save practical:', err);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (prac) => {
    const id = typeof prac === 'object' ? (prac._id || prac.id) : prac;
    if (confirm('Are you sure you want to delete this practical record?')) {
      try {
        await labService.deletePractical(id);
        setPracticals(practicals.filter(p => p.id !== id && p._id !== id));
      } catch (err) {
        console.error('Failed to delete practical:', err);
      }
    }
  };

  const exportHeaders = ['ID', 'Number', 'Practical Title', 'Subject', 'Class / Semester', 'Lab', 'Instructor', 'Date', 'Duration', 'Marks', 'Status', 'Attendance'];
  const exportData = filteredPracticals.map(p => [
    p.id || p._id,
    p.number,
    p.title,
    p.subject,
    p.classSemester,
    p.labName,
    p.instructor,
    p.date,
    p.duration,
    p.totalMarks,
    p.status,
    p.attendanceCount
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-zinc-600">
          <Link href="/dashboard" className="hover:text-emerald-700 font-medium">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <Link href="/dashboard/labs" className="hover:text-emerald-700 font-medium">Labs</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Practicals Management</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Curriculum & Experiment Logs</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Practicals & Lab Experiments</h1>
          <p className="text-emerald-200/90 text-sm mt-1">
            Track lab practical titles, required apparatus, reagents, procedures, attendance & marks evaluation
          </p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm flex items-center gap-2 font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Practical
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Total Practicals</div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">{practicals.length}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">All Disciplines</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <ListChecks className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Evaluated & Graded</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {practicals.filter(p => p.status === 'Evaluated').length}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">Marks published</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Conducted (Grading Pending)</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {practicals.filter(p => p.status === 'Conducted').length}
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">Awaiting viva marks</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Upcoming Scheduled</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {practicals.filter(p => p.status === 'Upcoming').length}
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">Apparatus prepared</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search practical title, subject, instructor or lab..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-700"
          >
            {subjectOptions.map((s, idx) => (
              <option key={idx} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-700"
          >
            <option value="All">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Conducted">Conducted</option>
            <option value="Evaluated">Evaluated</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => exportToCSV('Lab_Practicals', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button
            onClick={() => exportToExcel('Lab_Practicals', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <FileText className="w-3.5 h-3.5" /> Excel
          </Button>
          <Button
            onClick={() => printData('Lab Practicals & Experiments Registry', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* Practicals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="py-20 text-center col-span-full bg-white rounded-2xl border border-zinc-200">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
            <p className="text-sm font-semibold text-zinc-800">Loading Practicals...</p>
            <p className="text-xs text-zinc-500 mt-1">Fetching academic syllabus and lab practical records</p>
          </div>
        ) : filteredPracticals.length === 0 ? (
          <div className="py-20 text-center col-span-full bg-white rounded-2xl border border-zinc-200">
            <BookOpen className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-zinc-800">No lab practicals registered</p>
            <p className="text-xs text-zinc-500 mt-1">Click &quot;Add New Practical&quot; to define experiment syllabus, apparatus and instructions.</p>
          </div>
        ) : (
          filteredPracticals.map((prac) => (
            <div key={prac.id || prac._id} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                      {prac.number}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      {prac.date} • {prac.duration}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    prac.status === 'Evaluated' ? 'bg-emerald-100 text-emerald-800' :
                    prac.status === 'Conducted' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {prac.status}
                  </span>
                </div>

                <h3 className="font-bold text-zinc-900 text-sm md:text-base leading-snug">{prac.title}</h3>
                
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-zinc-600 mt-2">
                  <span className="font-semibold text-emerald-700">{prac.subject}</span>
                  <span>•</span>
                  <span className="text-zinc-700">{prac.classSemester}</span>
                  <span>•</span>
                  <span className="text-zinc-800 font-medium">Marks: {prac.totalMarks}</span>
                </div>

                <div className="mt-3.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs space-y-2 text-zinc-600">
                  <div className="flex items-start gap-2">
                    <FlaskConical className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-800">Lab: </strong>
                      <span>{prac.labName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-800">Faculty: </strong>
                      <span>{prac.instructor}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Boxes className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                    <div className="line-clamp-2">
                      <strong className="text-zinc-800">Apparatus: </strong>
                      <span>{prac.requiredEquipment}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 text-xs">
                <div className="flex items-center gap-1 text-zinc-600">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Attendance: <strong className="text-zinc-800">{prac.attendanceCount}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => { setViewingPractical(prac); setIsViewModalOpen(true); }}
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-zinc-200 text-zinc-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Manual & Rubric
                  </Button>
                  <Button
                    onClick={() => handleOpenEditModal(prac)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(prac)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Practical Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    {editingPractical ? 'Edit Practical Experiment' : 'Add New Lab Practical'}
                  </h2>
                  <p className="text-xs text-zinc-500">Record experiment objectives, equipment requirements and grading criteria</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Practical Number / Code</Label>
                  <Input
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="e.g. Practical #05"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Subject / Course</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Physics (PHY-101)"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Practical Experiment Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Determine resistance per cm using Ohm's Law"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Class / Degree / Semester</Label>
                  <Input
                    value={formData.classSemester}
                    onChange={(e) => setFormData({ ...formData, classSemester: e.target.value })}
                    placeholder="e.g. FSc Pre-Engineering 1st Year"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Laboratory</Label>
                  <Input
                    value={formData.labName}
                    onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                    placeholder="e.g. Advanced Physics Lab (A-204)"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Instructor / Teacher</Label>
                  <Input
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="e.g. Dr. Farooq Khan"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Scheduled Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Duration (Hours/Mins)</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 2 Hours"
                    className="text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Total Marks</Label>
                  <Input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 0 })}
                    className="text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Status</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Conducted">Conducted</option>
                    <option value="Evaluated">Evaluated</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Objectives & Learning Outcomes</Label>
                  <textarea
                    rows={2}
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    placeholder="Describe experimental goals and principles..."
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Required Equipment & Apparatus</Label>
                  <textarea
                    rows={2}
                    value={formData.requiredEquipment}
                    onChange={(e) => setFormData({ ...formData, requiredEquipment: e.target.value })}
                    placeholder="e.g. Voltmeter, Ammeter, Rheostat, Vernier Caliper..."
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Required Chemicals & Consumable Materials</Label>
                  <textarea
                    rows={2}
                    value={formData.requiredMaterials}
                    onChange={(e) => setFormData({ ...formData, requiredMaterials: e.target.value })}
                    placeholder="e.g. Connecting copper leads, distilled water, reagents..."
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Safety Precautions</Label>
                  <Input
                    value={formData.safetyInstructions}
                    onChange={(e) => setFormData({ ...formData, safetyInstructions: e.target.value })}
                    placeholder="e.g. Disconnect key before adjusting rheostat..."
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
                  {editingPractical ? 'Update Practical' : 'Save Practical'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Practical Manual / Details Modal */}
      {isViewModalOpen && viewingPractical && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-zinc-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {viewingPractical.number}
                </span>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">{viewingPractical.title}</h3>
                  <p className="text-xs text-emerald-700 font-medium">{viewingPractical.subject} • {viewingPractical.classSemester}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div>
                  <span className="text-zinc-500 block">Instructor:</span>
                  <span className="font-semibold text-zinc-900">{viewingPractical.instructor}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Lab Location:</span>
                  <span className="font-semibold text-zinc-900">{viewingPractical.labName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Total Marks:</span>
                  <span className="font-semibold text-zinc-900">{viewingPractical.totalMarks} Marks</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Status:</span>
                  <span className="font-semibold text-emerald-700">{viewingPractical.status}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-800 mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Objectives & Theory
                </h4>
                <p className="text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-100 leading-relaxed">
                  {viewingPractical.objectives}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-800 mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  Required Equipment & Apparatus
                </h4>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-zinc-800 leading-relaxed font-medium">
                  {viewingPractical.requiredEquipment}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-800 mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <FlaskConical className="w-4 h-4 text-amber-600" />
                  Chemicals & Consumables
                </h4>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-zinc-800 leading-relaxed">
                  {viewingPractical.requiredMaterials || 'None'}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-800 mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Safety Precautions
                </h4>
                <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-red-900 font-medium">
                  {viewingPractical.safetyInstructions}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-zinc-200">
              <span className="text-xs text-zinc-500">Attendance: <strong>{viewingPractical.attendanceCount}</strong></span>
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
