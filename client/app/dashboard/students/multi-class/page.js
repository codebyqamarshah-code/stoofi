'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Trash2, 
  Layers, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  X, 
  Edit, 
  Filter, 
  GraduationCap,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sortClassesAcademic, STANDARD_ACADEMIC_CLASSES } from '@/lib/academicUtils';
import api from '@/services/api';

const DEMO_MULTI_CLASS = [
  { _id: 'mc-1', studentName: 'Muhammad Abdullah', admissionNo: 'PRC-2026-081', primaryClass: 'Class 10', primarySection: 'A', secondaryClass: 'FSC Pre-Medical Evening', secondarySection: 'Eve-1', track: 'Evening Coaching & Test Session', session: '2026 [Jan-Dec]', status: 'Active' },
  { _id: 'mc-2', studentName: 'Ayesha Fatima', admissionNo: 'PRC-2026-082', primaryClass: 'Class 10', primarySection: 'A', secondaryClass: 'Computer Science Diploma', secondarySection: 'IT-A', track: 'Skill Certification', session: '2026 [Jan-Dec]', status: 'Active' },
  { _id: 'mc-3', studentName: 'Zainab Bibi', admissionNo: 'PRC-2026-083', primaryClass: 'Class 9', primarySection: 'B', secondaryClass: 'Quranic Arabic Studies', secondarySection: 'Q-1', track: 'Special Religious Track', session: '2026 [Jan-Dec]', status: 'Active' },
  { _id: 'mc-4', studentName: 'Hamza Farooq', admissionNo: 'PRC-2026-084', primaryClass: 'Class 10', primarySection: 'A', secondaryClass: 'O-Levels English & Math', secondarySection: 'OL-1', track: 'Cambridge Dual Prep', session: '2026 [Jan-Dec]', status: 'Active' },
  { _id: 'mc-5', studentName: 'Saad Ur Rehman', admissionNo: 'PRC-2026-087', primaryClass: 'Class 9', primarySection: 'A', secondaryClass: 'Pre-Engineering Advanced Physics', secondarySection: 'P-1', track: 'Advanced Foundation', session: '2026 [Jan-Dec]', status: 'Active' },
];

export default function MultiClassStudentPage() {
  const [enrolments, setEnrolments] = useState(DEMO_MULTI_CLASS);
  const [classesList, setClassesList] = useState(STANDARD_ACADEMIC_CLASSES);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  const [formData, setFormData] = useState({
    studentName: '',
    admissionNo: '',
    primaryClass: 'Class 10',
    primarySection: 'A',
    secondaryClass: 'FSC Pre-Medical Evening',
    secondarySection: 'A',
    track: 'Evening Coaching',
    session: '2026 [Jan-Dec]'
  });

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    api.get('/class').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setClassesList(sortClassesAcademic(res.data));
      }
    }).catch(() => {});
  }, []);

  const handleAddEnrolment = (e) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.secondaryClass.trim()) {
      showToast('⚠️ Student name and secondary class are required.');
      return;
    }

    const newRec = {
      _id: `mc-${Date.now()}`,
      studentName: formData.studentName,
      admissionNo: formData.admissionNo || `PRC-2026-${Math.floor(100 + Math.random() * 900)}`,
      primaryClass: formData.primaryClass,
      primarySection: formData.primarySection,
      secondaryClass: formData.secondaryClass,
      secondarySection: formData.secondarySection,
      track: formData.track,
      session: formData.session,
      status: 'Active'
    };

    setEnrolments([newRec, ...enrolments]);
    setIsModalOpen(false);
    setFormData({
      studentName: '',
      admissionNo: '',
      primaryClass: 'Class 10',
      primarySection: 'A',
      secondaryClass: 'FSC Pre-Medical Evening',
      secondarySection: 'A',
      track: 'Evening Coaching',
      session: '2026 [Jan-Dec]'
    });
    showToast(`✓ Dual-class enrollment created for ${newRec.studentName}!`);
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    setEnrolments(enrolments.filter(e => e._id !== deleteModal._id));
    setDeleteModal(null);
    showToast('✓ Multi-class enrolment removed.');
  };

  const filtered = useMemo(() => {
    return enrolments.filter(item => {
      const matchSearch = !search || 
        item.studentName.toLowerCase().includes(search.toLowerCase()) ||
        item.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
        item.secondaryClass.toLowerCase().includes(search.toLowerCase());
      const matchClass = !classFilter || item.primaryClass === classFilter;
      return matchSearch && matchClass;
    });
  }, [enrolments, search, classFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#084A86] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-sky-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-zinc-900">Remove Multi-Class Enrolment?</h3>
            <p className="text-sm text-zinc-600">
              Are you sure you want to remove secondary enrollment in <strong className="text-rose-700">{deleteModal.secondaryClass}</strong> for <strong>{deleteModal.studentName}</strong>?
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteModal(null)} className="text-xs">Cancel</Button>
              <Button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">Remove</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-zinc-950 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#084A86]" />
                Enroll Student in Secondary Class
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-950 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEnrolment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-700 uppercase">Student Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Muhammad Rayyan"
                    value={formData.studentName}
                    onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-700 uppercase">Admission No</Label>
                  <Input
                    placeholder="e.g. PRC-2026-095"
                    value={formData.admissionNo}
                    onChange={e => setFormData({ ...formData, admissionNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-700 uppercase">Primary Class *</Label>
                  <select
                    value={formData.primaryClass}
                    onChange={e => setFormData({ ...formData, primaryClass: e.target.value })}
                    className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium"
                  >
                    {classesList.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-700 uppercase">Primary Section</Label>
                  <select
                    value={formData.primarySection}
                    onChange={e => setFormData({ ...formData, primarySection: e.target.value })}
                    className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium"
                  >
                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-emerald-700 uppercase">Secondary Class / Program *</Label>
                  <Input
                    required
                    placeholder="e.g. FSC Pre-Medical Evening"
                    value={formData.secondaryClass}
                    onChange={e => setFormData({ ...formData, secondaryClass: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-emerald-700 uppercase">Secondary Section</Label>
                  <Input
                    placeholder="e.g. Eve-1"
                    value={formData.secondarySection}
                    onChange={e => setFormData({ ...formData, secondarySection: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-zinc-700 uppercase">Program Track / Reason</Label>
                <Input
                  placeholder="e.g. Evening Coaching, Skill Certification, Dual Diploma"
                  value={formData.track}
                  onChange={e => setFormData({ ...formData, track: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#084A86] hover:bg-[#063866] text-white">Save Enrolment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <Layers className="h-6 w-6" />
            </span>
            Multi Class Student Enrolment
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage students simultaneously enrolled in dual academic programs, evening coaching, or additional tracks
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-600">Student Info</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Multi Class Student</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Dual Enrolled Students</span>
            <div className="text-xl font-black text-zinc-900">{enrolments.length}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Active Programs</span>
            <div className="text-xl font-black text-emerald-600">5 Specialized Tracks</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Attendance Tracking</span>
            <div className="text-xl font-black text-amber-700">Synchronized</div>
          </div>
        </div>
      </div>

      {/* Table & Filter Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                placeholder="Search student or program..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 text-xs bg-white border-zinc-200 h-9"
              />
            </div>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 focus:outline-none"
            >
              <option value="">All Primary Classes</option>
              {classesList.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Multi-Class Student
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
              <tr>
                <th className="p-3 w-10">#</th>
                <th className="p-3">Candidate Info</th>
                <th className="p-3">Primary Class</th>
                <th className="p-3">Secondary Enrolled Class</th>
                <th className="p-3">Track / Purpose</th>
                <th className="p-3">Session</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length > 0 ? filtered.map((item, idx) => (
                <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-zinc-400 font-mono">{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-extrabold text-zinc-950">{item.studentName}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{item.admissionNo}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-zinc-800">{item.primaryClass}</span>
                    <span className="text-zinc-500 text-[10px] ml-1">({item.primarySection})</span>
                  </td>
                  <td className="p-3 font-bold text-emerald-700">
                    {item.secondaryClass}
                    <span className="text-zinc-500 text-[10px] ml-1">({item.secondarySection})</span>
                  </td>
                  <td className="p-3 text-zinc-600 font-medium">
                    {item.track}
                  </td>
                  <td className="p-3 text-zinc-500 font-mono">
                    {item.session}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setDeleteModal(item)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Remove secondary enrollment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-zinc-500">
                    <Layers className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                    <p className="font-bold">No multi-class records found</p>
                    <p className="text-xs mt-1">Use the button above to add a student to an additional class</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-zinc-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Showing {filtered.length} of {enrolments.length} dual enrollments</span>
          <span className="font-bold text-zinc-700">Pak Royal College Sharaqpur</span>
        </div>
      </div>
    </div>
  );
}
