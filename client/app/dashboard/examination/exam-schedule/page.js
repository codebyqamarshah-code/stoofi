'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Plus, Trash2, Calendar, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

const DEFAULT_EXAMS = [
  { _id: '6acc7c308f748a57aad97f0d', name: 'First Term Examination 2026' },
  { _id: '6acc7c308f748a57aad97f0e', name: 'Mid Term Examination 2026' },
  { _id: '6acc7c308f748a57aad97f0f', name: 'Final Term Examination 2026' },
  { _id: '6acc7c308f748a57aad97f10', name: 'Monthly Class Assessment' },
];

const DEFAULT_CLASSES = [
  { _id: 'c-bs-psych', name: 'BS Psychology' },
  { _id: 'c-bs-rit', name: 'BS RIT' },
  { _id: 'c-dpt', name: 'DPT' },
  { _id: 'c-fsc-dental', name: 'FSC Dental' },
  { _id: 'c-fsc-nursing', name: 'FSC NURSING' },
  { _id: 'c-fsc-ott', name: 'FSC OTT' },
];

const DEFAULT_SECTIONS = [
  { _id: 'sec1', name: 'A' },
  { _id: 'sec2', name: 'B' },
  { _id: 'sec3', name: 'C' },
  { _id: 'sec4', name: 'D' },
];

const DEFAULT_SUBJECTS = [
  { _id: 'sub1', name: 'Mathematics' },
  { _id: 'sub2', name: 'English Language' },
  { _id: 'sub3', name: 'Urdu Literature' },
  { _id: 'sub4', name: 'General Science' },
  { _id: 'sub5', name: 'Physics' },
  { _id: 'sub6', name: 'Chemistry' },
  { _id: 'sub7', name: 'Biology' },
  { _id: 'sub8', name: 'Computer Science' },
  { _id: 'sub9', name: 'Islamiat' },
  { _id: 'sub10', name: 'Pakistan Studies' },
];

const emptyItem = () => ({ subjectId: '', subjectName: '', date: '', startTime: '', endTime: '', room: '' });

export default function ExamSchedulePage() {
  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [filter, setFilter] = useState({ examId: '', classId: '', sectionId: '' });
  const [formData, setFormData] = useState({
    examId: '', classId: '', sectionId: '',
    scheduleItems: [emptyItem()]
  });

  // Load dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [eRes, cRes, sRes, subRes] = await Promise.all([
          api.get('/exam-type').catch(() => null),
          api.get('/class').catch(() => null),
          api.get('/section').catch(() => null),
          api.get('/subject').catch(() => null),
        ]);
        if (eRes?.success && Array.isArray(eRes.data) && eRes.data.length > 0) setExams(eRes.data);
        if (cRes?.success && Array.isArray(cRes.data) && cRes.data.length > 0) setClasses(sortClassesAcademic(cRes.data));
        if (sRes?.success && Array.isArray(sRes.data) && sRes.data.length > 0) setSections(sRes.data);
        if (subRes?.success && Array.isArray(subRes.data) && subRes.data.length > 0) setSubjects(subRes.data);
      } catch (err) {
        console.error('Dropdown fetch error:', err);
      }
    };
    fetchDropdowns();
  }, []);

  const getName = (arr, id) => arr.find(x => x._id === id)?.name || id || '-';

  const handleSearch = async () => {
    if (!filter.examId) return alert('Please select at least an Exam.');
    try {
      setLoading(true);
      setSearched(true);
      setExpandedRow(null);
      const params = new URLSearchParams();
      params.append('examId', filter.examId);
      if (filter.classId) params.append('classId', filter.classId);
      if (filter.sectionId) params.append('sectionId', filter.sectionId);
      const res = await api.get(`/exam-schedule?${params.toString()}`);
      if (res.success) setSchedules(res.data || []);
    } catch (e) {
      console.error(e);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => setFormData(f => ({ ...f, scheduleItems: [...f.scheduleItems, emptyItem()] }));
  const removeItem = (i) => setFormData(f => ({ ...f, scheduleItems: f.scheduleItems.filter((_, idx) => idx !== i) }));
  const updateItem = (i, field, val) => setFormData(f => {
    const items = [...f.scheduleItems];
    items[i] = { ...items[i], [field]: val };
    return { ...f, scheduleItems: items };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.examId) return alert('Please select an Exam.');
    if (!formData.classId) return alert('Please select a Class.');
    const hasInvalidItem = formData.scheduleItems.some(it => !it.subjectId || !it.date);
    if (hasInvalidItem) return alert('Each schedule item must have a Subject and Date.');

    try {
      setSubmitting(true);
      // Enrich with names for display
      const enriched = {
        ...formData,
        examName: getName(exams, formData.examId),
        className: getName(classes, formData.classId),
        sectionName: getName(sections, formData.sectionId),
        scheduleItems: formData.scheduleItems.map(it => ({
          ...it,
          subjectName: getName(subjects, it.subjectId),
        })),
      };
      const res = await api.post('/exam-schedule', enriched);
      if (res.success) {
        setSuccessMsg('Schedule saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
        setShowForm(false);
        setFormData({ examId: '', classId: '', sectionId: '', scheduleItems: [emptyItem()] });
        if (searched) handleSearch();
      }
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to save schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await api.delete(`/exam-schedule/${id}`);
      setSchedules(s => s.filter(x => x._id !== id));
      if (expandedRow === id) setExpandedRow(null);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to delete.');
    }
  };

  const formatTime = (t) => {
    if (!t) return '-';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const formatDate = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Exam Schedule</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Examinations</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Exam Schedule</span>
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✓ {successMsg}
        </div>
      )}

      {/* Search Panel */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-950">Search Schedules</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-4 h-9 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />ADD EXAM SCHEDULE
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase">EXAM <span className="text-rose-500">*</span></label>
              <SearchableSelect
                value={filter.examId}
                onChange={(val) => setFilter({ ...filter, examId: val })}
                placeholder="Select Exam *"
                options={exams.map(e => ({ label: e.name, value: e._id }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase">CLASS</label>
              <SearchableSelect
                value={filter.classId}
                onChange={(val) => setFilter({ ...filter, classId: val })}
                placeholder="Select Class"
                options={classes.map(c => ({ label: c.name, value: c._id }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase">SECTION</label>
              <SearchableSelect
                value={filter.sectionId}
                onChange={(val) => setFilter({ ...filter, sectionId: val })}
                placeholder="Select Section"
                options={sections.map(s => ({ label: s.name, value: s._id }))}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold px-6 h-10 rounded-lg transition-colors"
            >
              <Search className="h-4 w-4" />SEARCH
            </button>
          </div>
        </div>
      </div>

      {/* Add Schedule Form */}
      {showForm && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-950">Add New Schedule</h2>
            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-700 text-sm transition-colors">✕ Close</button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Exam / Class / Section selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">EXAM <span className="text-rose-500">*</span></label>
                <SearchableSelect
                  value={formData.examId}
                  onChange={(val) => setFormData({ ...formData, examId: val })}
                  placeholder="Select Exam *"
                  options={exams.map(e => ({ label: e.name, value: e._id }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">CLASS <span className="text-rose-500">*</span></label>
                <SearchableSelect
                  value={formData.classId}
                  onChange={(val) => setFormData({ ...formData, classId: val })}
                  placeholder="Select Class *"
                  options={classes.map(c => ({ label: c.name, value: c._id }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">SECTION</label>
                <SearchableSelect
                  value={formData.sectionId}
                  onChange={(val) => setFormData({ ...formData, sectionId: val })}
                  placeholder="Select Section"
                  options={sections.map(s => ({ label: s.name, value: s._id }))}
                />
              </div>
            </div>

            {/* Schedule Items */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 bg-zinc-50 border-b border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-950">Schedule Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-3 h-8 rounded-md transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />Add Row
                </button>
              </div>
              <div className="p-4 space-y-3">
                {formData.scheduleItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end p-3 bg-zinc-50 rounded-lg">
                    <div className="col-span-2 md:col-span-2 space-y-1">
                      <label className="text-xs text-zinc-600 font-semibold uppercase">SUBJECT <span className="text-rose-500">*</span></label>
                      <select
                        value={item.subjectId}
                        onChange={e => updateItem(i, 'subjectId', e.target.value)}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-600 font-semibold uppercase">DATE <span className="text-rose-500">*</span></label>
                      <Input
                        type="date"
                        value={item.date}
                        onChange={e => updateItem(i, 'date', e.target.value)}
                        className="bg-white border-zinc-200 text-zinc-950 focus-visible:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-600 font-semibold uppercase">START TIME</label>
                      <Input
                        type="time"
                        value={item.startTime}
                        onChange={e => updateItem(i, 'startTime', e.target.value)}
                        className="bg-white border-zinc-200 text-zinc-950 focus-visible:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-600 font-semibold uppercase">END TIME</label>
                      <Input
                        type="time"
                        value={item.endTime}
                        onChange={e => updateItem(i, 'endTime', e.target.value)}
                        className="bg-white border-zinc-200 text-zinc-950 focus-visible:ring-indigo-500"
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs text-zinc-600 font-semibold uppercase">ROOM</label>
                        <Input
                          value={item.room}
                          onChange={e => updateItem(i, 'room', e.target.value)}
                          placeholder="Room No."
                          className="bg-white border-zinc-200 text-zinc-950 focus-visible:ring-indigo-500"
                        />
                      </div>
                      {formData.scheduleItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="h-9 w-9 flex items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 h-10 rounded-lg text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 h-10 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'SAVING...' : 'SAVE SCHEDULE'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results Table */}
      {searched && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-950">Schedule Results</h2>
            {!loading && (
              <span className="text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full font-medium">
                {schedules.length} record{schedules.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-600 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 w-10">#</th>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Subjects</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-zinc-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        Loading schedules...
                      </div>
                    </td>
                  </tr>
                ) : schedules.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <Calendar className="h-10 w-10 opacity-30" />
                        <p className="font-medium">No schedules found</p>
                        <p className="text-xs">Try a different exam or class selection.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  schedules.map((s, idx) => (
                    <React.Fragment key={s._id}>
                      <tr
                        className="hover:bg-zinc-50 cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}
                      >
                        <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 text-zinc-950 font-semibold">
                          {s.examName || getName(exams, s.examId)}
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {s.className || getName(classes, s.classId)}
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {s.sectionName || getName(sections, s.sectionId) || <span className="text-zinc-400 italic">All</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <BookOpen className="h-3 w-3" />
                            {s.scheduleItems?.length || 0} subject{(s.scheduleItems?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-md transition-colors"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                      {/* Expanded detail row */}
                      {expandedRow === s._id && s.scheduleItems?.length > 0 && (
                        <tr>
                          <td colSpan="6" className="bg-indigo-50/50 px-6 pb-4 pt-2">
                            <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Schedule Detail</p>
                            <div className="overflow-x-auto rounded-lg border border-indigo-100">
                              <table className="w-full text-xs text-left bg-white">
                                <thead className="bg-indigo-100 text-indigo-800 uppercase font-bold">
                                  <tr>
                                    <th className="px-3 py-2">#</th>
                                    <th className="px-3 py-2">Subject</th>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Start</th>
                                    <th className="px-3 py-2">End</th>
                                    <th className="px-3 py-2">Room</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                  {s.scheduleItems.map((item, ii) => (
                                    <tr key={ii} className="hover:bg-indigo-50/40">
                                      <td className="px-3 py-2 text-zinc-500">{ii + 1}</td>
                                      <td className="px-3 py-2 font-semibold text-zinc-800">
                                        {item.subjectName || getName(subjects, item.subjectId)}
                                      </td>
                                      <td className="px-3 py-2 text-zinc-700">{formatDate(item.date)}</td>
                                      <td className="px-3 py-2 text-zinc-700">
                                        <span className="inline-flex items-center gap-1">
                                          <Clock className="h-3 w-3 text-zinc-400" />{formatTime(item.startTime)}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-zinc-700">
                                        <span className="inline-flex items-center gap-1">
                                          <Clock className="h-3 w-3 text-zinc-400" />{formatTime(item.endTime)}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-zinc-700">{item.room || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
