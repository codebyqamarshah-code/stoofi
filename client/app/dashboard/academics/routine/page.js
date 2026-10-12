'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  FlaskConical,
  BookOpen,
  User,
  Building,
  CheckCircle2,
  X,
  Printer,
  Download,
  Filter,
  Layers,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';
import api from '@/services/api';
import routineService from '@/services/routineService';
import labService from '@/services/labService';

export default function ClassRoutinePage() {
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [availableLabs, setAvailableLabs] = useState([]);

  // Search criteria
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Results & filters
  const [routines, setRoutines] = useState([]);
  const [selectedDay, setSelectedDay] = useState('All');
  const [routineSearch, setRoutineSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    className: '',
    sectionName: '',
    subject: '',
    teacher: '',
    day: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Room 101',
    isLab: false,
    labId: '',
    labName: '',
    batch: 'All Students',
    topic: '',
    status: 'Scheduled',
    notes: ''
  });

  const daysOfWeek = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load initial classes, sections and labs
  useEffect(() => {
    const loadCriteria = async () => {
      try {
        const [classRes, sectionRes, labsData] = await Promise.all([
          api.get('/class').catch(() => null),
          api.get('/section').catch(() => null),
          labService.getLabs().catch(() => [])
        ]);

        if (classRes && Array.isArray(classRes.data) && classRes.data.length > 0) {
          setClassesList(classRes.data.map(c => c.name));
        } else {
          setClassesList(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels', 'BS Computer Science', 'FSc Pre-Engineering', 'FSc Pre-Medical']);
        }

        if (sectionRes && Array.isArray(sectionRes.data) && sectionRes.data.length > 0) {
          setSectionsList(sectionRes.data.map(s => s.name));
        } else {
          setSectionsList(['Section A', 'Section B', 'Section C', 'Section D']);
        }

        if (Array.isArray(labsData)) {
          setAvailableLabs(labsData);
        }
      } catch (err) {
        console.error('Error loading criteria:', err);
      }
    };

    loadCriteria();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!selectedClass || !selectedSection) {
      alert('Please select both Class and Section');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await routineService.getRoutines({
        className: selectedClass,
        sectionName: selectedSection
      });
      if (Array.isArray(data)) {
        setRoutines(data);
      } else {
        setRoutines([]);
      }
    } catch (err) {
      console.error('Failed to load routine:', err);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const defaultLab = availableLabs.length > 0 ? availableLabs[0] : null;
    setFormData({
      className: selectedClass || classesList[0] || 'Class 10',
      sectionName: selectedSection || sectionsList[0] || 'Section A',
      subject: '',
      teacher: '',
      day: 'Monday',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      room: 'Room 101',
      isLab: false,
      labId: defaultLab ? (defaultLab._id || defaultLab.id) : '',
      labName: defaultLab ? defaultLab.name : '',
      batch: 'All Students',
      topic: '',
      status: 'Scheduled',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      className: item.className || selectedClass || 'Class 10',
      sectionName: item.sectionName || selectedSection || 'Section A',
      isLab: Boolean(item.isLab || item.labName),
      room: item.room || 'Room 101',
      batch: item.batch || 'All Students',
      status: item.status || 'Scheduled'
    });
    setIsModalOpen(true);
  };

  const handleSaveRoutine = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      alert('Subject name is required');
      return;
    }

    let labNameVal = '';
    let labIdVal = '';
    if (formData.isLab) {
      const matched = availableLabs.find(l => (l.name === formData.labName || (l._id || l.id) === formData.labId));
      labNameVal = formData.labName || (matched ? matched.name : 'Main Laboratory');
      labIdVal = formData.labId || (matched ? (matched._id || matched.id) : '');
    }

    const payload = {
      ...formData,
      className: formData.className || selectedClass,
      sectionName: formData.sectionName || selectedSection,
      classSemester: `${formData.className || selectedClass} - ${formData.sectionName || selectedSection}`,
      labName: labNameVal,
      labId: labIdVal,
      room: formData.isLab ? labNameVal : (formData.room || 'Classroom')
    };

    if (editingItem) {
      payload._id = editingItem._id;
      payload.id = editingItem.id;
    }

    try {
      const saved = await routineService.saveRoutine(payload);
      if (editingItem) {
        setRoutines(routines.map(r => (r.id === editingItem.id || r._id === editingItem._id) ? (saved || payload) : r));
      } else {
        if (saved) {
          if (!selectedClass || saved.className === selectedClass) {
            setRoutines(prev => [saved, ...prev.filter(r => r._id !== saved._id && r.id !== saved.id)]);
          }
        } else {
          await handleSearch();
        }
      }
    } catch (err) {
      console.error('Failed to save class routine:', err);
    }

    setIsModalOpen(false);
  };

  const handleDeleteRoutine = async (item) => {
    const id = typeof item === 'object' ? (item._id || item.id) : item;
    if (confirm(`Are you sure you want to delete this routine slot (${item.subject})?`)) {
      try {
        await routineService.deleteRoutine(id);
        setRoutines(routines.filter(r => r._id !== id && r.id !== id));
      } catch (err) {
        console.error('Failed to delete routine slot:', err);
      }
    }
  };

  const filteredRoutines = routines.filter(r => {
    const q = routineSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      (r.subject || '').toLowerCase().includes(q) ||
      (r.teacher || '').toLowerCase().includes(q) ||
      (r.room || '').toLowerCase().includes(q) ||
      (r.labName || '').toLowerCase().includes(q) ||
      (r.topic || '').toLowerCase().includes(q);

    const matchesDay = selectedDay === 'All' || r.day === selectedDay;
    return matchesSearch && matchesDay;
  });

  const exportHeaders = ['Class', 'Section', 'Day', 'Time Slot', 'Subject', 'Teacher', 'Room / Lab', 'Type', 'Batch', 'Topic'];
  const exportData = filteredRoutines.map(r => [
    r.className,
    r.sectionName,
    r.day,
    `${r.startTime} - ${r.endTime}`,
    r.subject,
    r.teacher,
    r.isLab ? `[LAB] ${r.labName || r.room}` : r.room,
    r.isLab ? 'Lab Practical' : 'Lecture',
    r.batch || 'All',
    r.topic || '-'
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Class Routine & Timetable</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage daily periods, lecture schedules and integrated laboratory practicals</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-900 transition-colors">Academics</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Class Routine</span>
        </div>
      </div>

      {/* Filter / Search Criteria Section */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="mb-5 pb-3 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            Select Criteria
          </h2>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Class <span className="text-rose-500">*</span>
              </Label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-medium"
                required
              >
                <option value="">Select Class *</option>
                {classesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Section <span className="text-rose-500">*</span>
              </Label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-medium"
                required
              >
                <option value="">Select Section *</option>
                {sectionsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end pt-3 border-t border-zinc-100">
            <Button
              type="submit"
              disabled={loading || !selectedClass || !selectedSection}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="h-4 w-4" />}
              SEARCH
            </Button>
          </div>
        </form>
      </div>

      {/* Routine Timetable View */}
      {hasSearched && (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  {selectedClass}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-bold">
                  {selectedSection}
                </span>
                <span className="text-xs text-zinc-500 font-medium">({routines.length} periods scheduled)</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-950 mt-1">Class Timetable & Routine Schedule</h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => exportToCSV(`Routine_${selectedClass}_${selectedSection}`, exportHeaders, exportData)}
                variant="outline"
                size="sm"
                className="text-xs border-zinc-200 text-zinc-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
              <Button
                onClick={() => printData(`Class Routine - ${selectedClass} (${selectedSection})`, exportHeaders, exportData)}
                variant="outline"
                size="sm"
                className="text-xs border-zinc-200 text-zinc-700 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </Button>
              <Button
                onClick={handleOpenAddModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-4 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Routine Slot
              </Button>
            </div>
          </div>

          {/* Day Pills & Quick Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedDay === day
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search subject, teacher, room..."
                value={routineSearch}
                onChange={(e) => setRoutineSearch(e.target.value)}
                className="pl-8 text-xs h-8 bg-zinc-50 border-zinc-200"
              />
            </div>
          </div>

          {/* Timetable Table */}
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="text-xs font-medium text-zinc-600">Loading timetable...</p>
            </div>
          ) : filteredRoutines.length === 0 ? (
            <div className="py-16 text-center bg-zinc-50/50 rounded-xl border border-zinc-100">
              <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
              <p className="font-semibold text-sm text-zinc-800">
                No routine periods found for {selectedClass} ({selectedSection})
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Click &quot;Add Routine Slot&quot; to assign periods or laboratory practicals for this class.
              </p>
              <Button
                onClick={handleOpenAddModal}
                size="sm"
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Routine Slot
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-zinc-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Teacher</th>
                    <th className="py-3 px-4">Room / Laboratory</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredRoutines.map((item) => (
                    <tr key={item.id || item._id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-zinc-900 whitespace-nowrap">
                        {item.day}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded text-[11px]">
                          {item.startTime} - {item.endTime}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-950">{item.subject}</div>
                        {item.topic && <div className="text-[11px] text-zinc-500">{item.topic}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-800">
                        {item.teacher || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.isLab || item.labName ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                            <FlaskConical className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{item.labName || item.room}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-zinc-700 font-medium">
                            <Building className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{item.room || 'Classroom'}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.isLab || item.labName ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Lab Session
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Lecture
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            onClick={() => handleOpenEditModal(item)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Edit Period"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteRoutine(item)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete Period"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Routine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {editingItem ? 'Edit Class Routine Slot' : 'Add Class Routine Slot'}
                  </h3>
                  <p className="text-xs text-zinc-500">Configure timetable slot and assign teacher or lab room</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Class <span className="text-rose-500">*</span></Label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium"
                    required
                  >
                    {classesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Section <span className="text-rose-500">*</span></Label>
                  <select
                    value={formData.sectionName}
                    onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium"
                    required
                  >
                    {sectionsList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Subject <span className="text-rose-500">*</span></Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Physics, Mathematics, Biology"
                    className="h-10 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Teacher / Faculty</Label>
                  <Input
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    placeholder="e.g. Dr. Farooq Khan"
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Day <span className="text-rose-500">*</span></Label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium"
                    required
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Start Time <span className="text-rose-500">*</span></Label>
                  <Input
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="h-10 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">End Time <span className="text-rose-500">*</span></Label>
                  <Input
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="10:00 AM"
                    className="h-10 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Is Lab Session Checkbox */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-900 text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isLab}
                    onChange={(e) => setFormData({ ...formData, isLab: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Is this an academic Laboratory Practical session?</span>
                </label>

                {formData.isLab ? (
                  <div className="pt-2 border-t border-zinc-200">
                    <Label className="text-[11px] font-bold text-zinc-800 uppercase">Select Target Laboratory</Label>
                    {availableLabs.length > 0 ? (
                      <select
                        value={formData.labName}
                        onChange={(e) => {
                          const matched = availableLabs.find(l => l.name === e.target.value);
                          setFormData({
                            ...formData,
                            labName: e.target.value,
                            labId: matched ? (matched._id || matched.id) : ''
                          });
                        }}
                        className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium mt-1"
                        required
                      >
                        <option value="">Select Laboratory</option>
                        {availableLabs.map(l => (
                          <option key={l._id || l.id} value={l.name}>{l.name} ({l.roomNumber || l.labCode || 'Lab'})</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        value={formData.labName}
                        onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                        placeholder="e.g. Advanced Physics Lab (A-204)"
                        className="h-10 text-xs mt-1"
                        required
                      />
                    )}
                    <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                      ✓ This session will automatically sync and appear under Labs → Lab Schedule!
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label className="text-[11px] font-bold text-zinc-800 uppercase">Classroom / Room Number</Label>
                    <Input
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="e.g. Room 101, Hall B"
                      className="h-10 text-xs mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Batch / Student Group</Label>
                  <Input
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="All Students or Batch A"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Topic / Syllabus Ref</Label>
                  <Input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Chapter 4 - Mechanics"
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold"
                >
                  {editingItem ? 'Update Routine' : 'Save Routine Slot'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
