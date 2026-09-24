'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

export default function ExamSchedulePage() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searched, setSearched] = useState(false);

  const [filter, setFilter] = useState({ examId: '', classId: '', sectionId: '' });
  const [formData, setFormData] = useState({
    examId: '', classId: '', sectionId: '',
    scheduleItems: [{ subjectId: '', date: '', startTime: '', endTime: '', room: '' }]
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [eRes, cRes, sRes, subRes] = await Promise.all([
          api.get('/exam-type'),
          api.get('/class'),
          api.get('/section'),
          api.get('/subject')
        ]);
        if (eRes.success) setExams(eRes.data);
        if (cRes.success) setClasses(cRes.data);
        if (sRes.success) setSections(sRes.data);
        if (subRes.success) setSubjects(subRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDropdowns();
  }, []);

  const handleSearch = async () => {
    if (!filter.examId) return alert('Please select at least an Exam.');
    try {
      setLoading(true);
      setSearched(true);
      const params = new URLSearchParams();
      if (filter.examId) params.append('examId', filter.examId);
      if (filter.classId) params.append('classId', filter.classId);
      if (filter.sectionId) params.append('sectionId', filter.sectionId);
      const res = await api.get(`/exam-schedule?${params.toString()}`);
      if (res.success) setSchedules(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const addItem = () => setFormData(f => ({ ...f, scheduleItems: [...f.scheduleItems, { subjectId: '', date: '', startTime: '', endTime: '', room: '' }] }));
  const removeItem = (i) => setFormData(f => ({ ...f, scheduleItems: f.scheduleItems.filter((_, idx) => idx !== i) }));
  const updateItem = (i, field, val) => setFormData(f => {
    const items = [...f.scheduleItems];
    items[i] = { ...items[i], [field]: val };
    return { ...f, scheduleItems: items };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.examId || !formData.classId) return alert('Exam and Class are required.');
    try {
      setSubmitting(true);
      const res = await api.post('/exam-schedule', formData);
      if (res.success) {
        setShowForm(false);
        setFormData({ examId: '', classId: '', sectionId: '', scheduleItems: [{ subjectId: '', date: '', startTime: '', endTime: '', room: '' }] });
        if (searched) handleSearch();
      }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/exam-schedule/${id}`);
      setSchedules(s => s.filter(x => x._id !== id));
    } catch (e) { alert(e.message); }
  };

  const getName = (arr, id) => arr.find(x => x._id === id)?.name || id || '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Exam Schedule</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Examinations</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Exam Schedule</span>
        </div>
      </div>

      {/* Search Panel */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Search Schedules</h2>
          <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 h-9">
            <Plus className="h-4 w-4 mr-2" />ADD EXAM SCHEDULE
          </Button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">EXAM <span className="text-rose-500">*</span></label>
              <SearchableSelect value={filter.examId} onChange={(val) => setFilter({ ...filter, examId: val })}
                placeholder="Select Exam *" options={exams.map(e => ({ label: e.name, value: e._id }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">CLASS</label>
              <SearchableSelect value={filter.classId} onChange={(val) => setFilter({ ...filter, classId: val })}
                placeholder="Select Class" options={classes.map(c => ({ label: c.name, value: c._id }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">SECTION</label>
              <SearchableSelect value={filter.sectionId} onChange={(val) => setFilter({ ...filter, sectionId: val })}
                placeholder="Select Section" options={sections.map(s => ({ label: s.name, value: s._id }))} />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-6">
              <Search className="h-4 w-4 mr-2" />SEARCH
            </Button>
          </div>
        </div>
      </div>

      {/* Add Schedule Form */}
      {showForm && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">Add New Schedule</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase">EXAM *</label>
                <SearchableSelect value={formData.examId} onChange={(val) => setFormData({ ...formData, examId: val })}
                  placeholder="Select Exam *" options={exams.map(e => ({ label: e.name, value: e._id }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase">CLASS *</label>
                <SearchableSelect value={formData.classId} onChange={(val) => setFormData({ ...formData, classId: val })}
                  placeholder="Select Class *" options={classes.map(c => ({ label: c.name, value: c._id }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase">SECTION</label>
                <SearchableSelect value={formData.sectionId} onChange={(val) => setFormData({ ...formData, sectionId: val })}
                  placeholder="Select Section" options={sections.map(s => ({ label: s.name, value: s._id }))} />
              </div>
            </div>

            <div className="border border-zinc-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-zinc-300">Schedule Items</h3>
                <Button type="button" onClick={addItem} className="h-8 text-xs bg-zinc-800 hover:bg-zinc-700 text-white">+ Add Row</Button>
              </div>
              {formData.scheduleItems.map((item, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">SUBJECT</label>
                    <select value={item.subjectId} onChange={e => updateItem(i, 'subjectId', e.target.value)}
                      className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-600">
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">DATE</label>
                    <Input type="date" value={item.date} onChange={e => updateItem(i, 'date', e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">START TIME</label>
                    <Input type="time" value={item.startTime} onChange={e => updateItem(i, 'startTime', e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">END TIME</label>
                    <Input type="time" value={item.endTime} onChange={e => updateItem(i, 'endTime', e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-zinc-500">ROOM</label>
                      <Input value={item.room} onChange={e => updateItem(i, 'room', e.target.value)} placeholder="Room No."
                        className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600" />
                    </div>
                    {formData.scheduleItems.length > 1 && (
                      <Button type="button" onClick={() => removeItem(i)} variant="ghost" size="sm"
                        className="h-9 mt-5 text-rose-500 hover:bg-rose-500/10 px-2"><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" onClick={() => setShowForm(false)} variant="ghost" className="text-zinc-400 hover:text-white">Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                {submitting ? 'SAVING...' : 'SAVE SCHEDULE'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Results Table */}
      {searched && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">Schedule Results</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">SL</th>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                ) : schedules.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">No schedules found for selected criteria.</td></tr>
                ) : schedules.map((s, idx) => (
                  <tr key={s._id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3 text-zinc-600">#{idx + 1}</td>
                    <td className="px-4 py-3 text-zinc-300 font-medium">{getName(exams, s.examId)}</td>
                    <td className="px-4 py-3 text-zinc-400">{getName(classes, s.classId)}</td>
                    <td className="px-4 py-3 text-zinc-400">{getName(sections, s.sectionId)}</td>
                    <td className="px-4 py-3 text-zinc-400">{s.scheduleItems?.length || 0} subjects</td>
                    <td className="px-4 py-3 text-right">
                      <Button onClick={() => handleDelete(s._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10">DELETE</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
