'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, UserX, CheckCircle, AlertCircle, Layers, RefreshCw, X, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

export default function UnassignedStudentPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Single assign modal
  const [assignModal, setAssignModal] = useState(null); // student object or null
  const [assignClass, setAssignClass] = useState('');
  const [assignSection, setAssignSection] = useState('');
  const [availableSections, setAvailableSections] = useState([]);

  // Bulk assign modal
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkClass, setBulkClass] = useState('');
  const [bulkSection, setBulkSection] = useState('');
  const [bulkAvailableSections, setBulkAvailableSections] = useState([]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [stuRes, clsRes] = await Promise.all([
        api.get('/student', { params: { limit: 500 } }),
        api.get('/class'),
      ]);

      const allStudents = stuRes?.data || [];
      const allClasses = clsRes?.data || [];
      setClasses(allClasses);

      // Unassigned = students with className === '' or 'Unassigned' or no class in DB
      const classNames = allClasses.map(c => c.name.toLowerCase());
      const unassigned = allStudents.filter(s => {
        const cn = (s.className || '').trim().toLowerCase();
        return !cn || cn === 'unassigned' || cn === 'n/a' || !classNames.includes(cn);
      });

      setStudents(unassigned);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.firstName + ' ' + (s.lastName || '')).toLowerCase().includes(q) ||
      (s.admissionNo || '').toLowerCase().includes(q) ||
      (s.fatherName || '').toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map(s => s._id));
    }
  };

  // When class changes in single assign modal
  const handleAssignClassChange = (val) => {
    setAssignClass(val);
    const cls = classes.find(c => c.name === val);
    setAvailableSections(cls?.sections || []);
    setAssignSection('');
  };

  // When class changes in bulk modal
  const handleBulkClassChange = (val) => {
    setBulkClass(val);
    const cls = classes.find(c => c.name === val);
    setBulkAvailableSections(cls?.sections || []);
    setBulkSection('');
  };

  // Assign single student
  const handleSingleAssign = async () => {
    if (!assignClass || !assignSection) {
      showToast('Please select class and section', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await api.put(`/student/${assignModal._id}`, { className: assignClass, section: assignSection });
      showToast(`${assignModal.firstName} assigned to ${assignClass} - ${assignSection}`);
      setAssignModal(null);
      fetchData();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to assign student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk assign selected students
  const handleBulkAssign = async () => {
    if (!bulkClass || !bulkSection) {
      showToast('Please select class and section', 'error');
      return;
    }
    if (selected.length === 0) {
      showToast('No students selected', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await Promise.all(
        selected.map(id => api.put(`/student/${id}`, { className: bulkClass, section: bulkSection }))
      );
      showToast(`${selected.length} student(s) assigned to ${bulkClass} - ${bulkSection}`);
      setSelected([]);
      setBulkModal(false);
      fetchData();
    } catch (err) {
      showToast('Some assignments failed. Please retry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-semibold animate-in slide-in-from-top-2 duration-300 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {toast.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-rose-600" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-950">Unassigned Students</h1>
          <p className="text-sm text-zinc-500 mt-1">Students not assigned to any class or section</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-900 dark:text-zinc-950 font-semibold">Unassigned</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Unassigned</p>
              <p className="text-3xl font-black text-rose-600 mt-1">{students.length}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center">
              <UserX className="w-6 h-6 text-rose-500" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Selected</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">{selected.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Classes</p>
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-950 mt-1">{classes.length}</p>
            </div>
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <Layers className="w-6 h-6 text-zinc-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, admission no..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-950 border border-zinc-200 dark:border-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-100 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            {selected.length > 0 && (
              <Button onClick={() => { setBulkClass(''); setBulkSection(''); setBulkAvailableSections([]); setBulkModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 shadow-sm">
                Assign {selected.length} Selected
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-200">
                <th className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.length === filtered.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-zinc-300 accent-emerald-600 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 font-semibold">Student</th>
                <th className="px-4 py-3.5 font-semibold">Admission No.</th>
                <th className="px-4 py-3.5 font-semibold">Father Name</th>
                <th className="px-4 py-3.5 font-semibold">Current Class</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4"><div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" /></td>
                    <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700" /><div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" /></div></td>
                    <td className="px-4 py-4"><div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" /></td>
                    <td className="px-4 py-4"><div className="w-28 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" /></td>
                    <td className="px-4 py-4"><div className="w-20 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" /></td>
                    <td className="px-4 py-4"><div className="w-16 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full" /></td>
                    <td className="px-4 py-4"><div className="w-16 h-8 bg-zinc-200 dark:bg-zinc-700 rounded float-right" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                      </div>
                      <p className="text-base font-bold text-zinc-700 dark:text-zinc-950">All students are assigned!</p>
                      <p className="text-sm text-zinc-400">No unassigned students found{search ? ' matching your search' : ''}.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(student => (
                  <tr key={student._id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-50/80 transition-colors ${selected.includes(student._id) ? 'bg-emerald-50/50 dark:bg-emerald-500/5' : ''}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(student._id)}
                        onChange={() => toggleSelect(student._id)}
                        className="w-4 h-4 rounded border-zinc-300 accent-emerald-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-zinc-950 text-xs font-bold flex-shrink-0">
                          {(student.firstName?.[0] || 'S').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-950 text-sm">{student.firstName} {student.lastName || ''}</p>
                          <p className="text-xs text-zinc-400">{student.gender || 'N/A'} • {student.dob || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-zinc-700 dark:text-zinc-950">{student.admissionNo || '—'}</td>
                    <td className="px-4 py-4 text-sm text-zinc-600 dark:text-zinc-700">{student.fatherName || '—'}</td>
                    <td className="px-4 py-4 text-sm text-zinc-500 dark:text-zinc-500 italic">{student.className || '—'}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Unassigned
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => {
                          setAssignModal(student);
                          setAssignClass('');
                          setAssignSection('');
                          setAvailableSections([]);
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                      >
                        Assign Class
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-900/20 text-xs text-zinc-500">
            Showing {filtered.length} of {students.length} unassigned students
          </div>
        )}
      </div>

      {/* ── Single Assign Modal ── */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-zinc-950 text-sm font-bold">
                  {assignModal.firstName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-950 text-sm">{assignModal.firstName} {assignModal.lastName}</h3>
                  <p className="text-xs text-zinc-400">{assignModal.admissionNo}</p>
                </div>
              </div>
              <button onClick={() => setAssignModal(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-medium">
                ⚠️ Assign this student to a class and section
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Class <span className="text-rose-500">*</span></Label>
                <select
                  value={assignClass}
                  onChange={e => handleAssignClassChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">— Select Class —</option>
                  {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Section <span className="text-rose-500">*</span></Label>
                <select
                  value={assignSection}
                  onChange={e => setAssignSection(e.target.value)}
                  disabled={!assignClass || availableSections.length === 0}
                  className="w-full px-3 py-2.5 text-sm bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                >
                  <option value="">— Select Section —</option>
                  {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {assignClass && availableSections.length === 0 && (
                  <p className="text-xs text-amber-600">No sections configured for this class. Add sections in Academics → Class.</p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-zinc-100 dark:border-zinc-200 flex gap-3">
              <Button variant="outline" onClick={() => setAssignModal(null)} className="flex-1 border-zinc-200 dark:border-zinc-200 text-zinc-700 dark:text-zinc-950 font-bold">
                Cancel
              </Button>
              <Button onClick={handleSingleAssign} disabled={submitting || !assignClass || !assignSection} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">
                {submitting ? 'Assigning...' : 'Confirm Assign'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Assign Modal ── */}
      {bulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-200">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-950">Bulk Assign Students</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{selected.length} student(s) selected</p>
              </div>
              <button onClick={() => setBulkModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl text-xs text-blue-700 dark:text-blue-400 font-medium">
                All {selected.length} selected students will be assigned to the same class & section.
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Class <span className="text-rose-500">*</span></Label>
                <select
                  value={bulkClass}
                  onChange={e => handleBulkClassChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">— Select Class —</option>
                  {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Section <span className="text-rose-500">*</span></Label>
                <select
                  value={bulkSection}
                  onChange={e => setBulkSection(e.target.value)}
                  disabled={!bulkClass || bulkAvailableSections.length === 0}
                  className="w-full px-3 py-2.5 text-sm bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                >
                  <option value="">— Select Section —</option>
                  {bulkAvailableSections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-zinc-100 dark:border-zinc-200 flex gap-3">
              <Button variant="outline" onClick={() => setBulkModal(false)} className="flex-1 border-zinc-200 dark:border-zinc-200 text-zinc-700 dark:text-zinc-950 font-bold">
                Cancel
              </Button>
              <Button onClick={handleBulkAssign} disabled={submitting || !bulkClass || !bulkSection} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">
                {submitting ? 'Assigning...' : `Assign ${selected.length} Students`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
