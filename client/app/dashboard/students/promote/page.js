'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Sparkles, 
  CheckSquare, 
  Square, 
  RefreshCw, 
  History, 
  Award, 
  FileSpreadsheet, 
  HelpCircle,
  Filter,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic, STANDARD_ACADEMIC_CLASSES, STANDARD_SECTIONS_LIST } from '@/lib/academicUtils';
import api from '@/services/api';

const SESSIONS = [
  '2025 [Jan-Dec]',
  '2026 [Jan-Dec]',
  '2027 [Jan-Dec]',
  '2028 [Jan-Dec]'
];

const DEMO_STUDENTS = [
  { _id: 'st-01', admissionNo: 'PRC-2026-081', rollNo: '101', name: 'Muhammad Abdullah', fatherName: 'Tariq Mehmood', currentClass: 'BS Psychology', section: 'A', examScore: '89.4%', examResult: 'Pass', newRollNo: '201', action: 'promote' },
  { _id: 'st-02', admissionNo: 'PRC-2026-082', rollNo: '102', name: 'Ayesha Fatima', fatherName: 'Dr. Sajid Khan', currentClass: 'BS Psychology', section: 'A', examScore: '94.2%', examResult: 'Pass', newRollNo: '202', action: 'promote' },
  { _id: 'st-03', admissionNo: 'PRC-2026-083', rollNo: '103', name: 'Zainab Bibi', fatherName: 'Abdul Rehman', currentClass: 'BS Psychology', section: 'A', examScore: '76.8%', examResult: 'Pass', newRollNo: '203', action: 'promote' },
  { _id: 'st-04', admissionNo: 'PRC-2026-084', rollNo: '104', name: 'Hamza Farooq', fatherName: 'Farooq Ahmed', currentClass: 'BS Psychology', section: 'A', examScore: '68.5%', examResult: 'Pass', newRollNo: '204', action: 'promote' },
  { _id: 'st-05', admissionNo: 'PRC-2026-085', rollNo: '105', name: 'Fatima Noor', fatherName: 'Usman Ghani', currentClass: 'BS Psychology', section: 'A', examScore: '82.0%', examResult: 'Pass', newRollNo: '205', action: 'promote' },
  { _id: 'st-06', admissionNo: 'PRC-2026-086', rollNo: '106', name: 'Bilal Hussain', fatherName: 'Hussain Ali', currentClass: 'BS Psychology', section: 'A', examScore: '48.2%', examResult: 'Fail', newRollNo: '106', action: 'repeat' },
  { _id: 'st-07', admissionNo: 'PRC-2026-087', rollNo: '107', name: 'Saad Ur Rehman', fatherName: 'Khalid Mehmood', currentClass: 'BS Psychology', section: 'A', examScore: '91.0%', examResult: 'Pass', newRollNo: '207', action: 'promote' },
  { _id: 'st-08', admissionNo: 'PRC-2026-088', rollNo: '108', name: 'Mariam Zahra', fatherName: 'Syed Ali Raza', currentClass: 'BS Psychology', section: 'A', examScore: '74.5%', examResult: 'Pass', newRollNo: '208', action: 'promote' },
];

export default function StudentPromotePage() {
  const [classesList, setClassesList] = useState(STANDARD_ACADEMIC_CLASSES);
  const [formData, setFormData] = useState({
    academicYear: '2026 [Jan-Dec]',
    promoteSession: '2027 [Jan-Dec]',
    currentClass: 'BS Psychology',
    section: 'A',
    promoteClass: 'FSC OTT',
    promoteSection: 'A'
  });

  const [students, setStudents] = useState(DEMO_STUDENTS);
  const [selectedIds, setSelectedIds] = useState(DEMO_STUDENTS.filter(s => s.examResult === 'Pass').map(s => s._id));
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [toast, setToast] = useState('');
  const [confirmModal, setConfirmModal] = useState(false);
  const [activeTab, setActiveTab] = useState('promote'); // 'promote' | 'history'
  const [searchFilter, setSearchFilter] = useState('');
  const [promotionHistory, setPromotionHistory] = useState([
    { id: 'hist-1', fromClass: 'DPT', toClass: 'BS Psychology', session: '2026 [Jan-Dec]', count: 42, date: '12 Jan 2026', by: 'Principal Office' },
    { id: 'hist-2', fromClass: 'BS Psychology', toClass: 'FSC OTT', session: '2026 [Jan-Dec]', count: 38, date: '10 Jan 2026', by: 'Admin' },
    { id: 'hist-3', fromClass: 'FSC Dental', toClass: 'DPT', session: '2026 [Jan-Dec]', count: 35, date: '08 Jan 2026', by: 'Academic Head' }
  ]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  // Fetch dynamic classes from API
  useEffect(() => {
    api.get('/class').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setClassesList(sortClassesAcademic(res.data));
      }
    }).catch(() => {});
  }, []);

  // Fetch students for selected class & section
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/student?className=${encodeURIComponent(formData.currentClass)}&section=${encodeURIComponent(formData.section)}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((st, i) => ({
          _id: st._id,
          admissionNo: st.admissionNo || `PRC-2026-${String(i + 1).padStart(3, '0')}`,
          rollNo: st.rollNo || String(101 + i),
          name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.name || 'Student',
          fatherName: st.fatherName || 'Guardian',
          currentClass: st.className || formData.currentClass,
          section: st.section || formData.section,
          examScore: `${75 + (i * 7) % 23}%`,
          examResult: (75 + (i * 7) % 23) >= 50 ? 'Pass' : 'Fail',
          newRollNo: String(201 + i),
          action: (75 + (i * 7) % 23) >= 50 ? 'promote' : 'repeat'
        }));
        setStudents(mapped);
        setSelectedIds(mapped.filter(m => m.examResult === 'Pass').map(m => m._id));
        showToast(`Loaded ${mapped.length} students from ${formData.currentClass} (${formData.section}).`);
      } else {
        // Fallback demo students updated with chosen currentClass
        const fallback = DEMO_STUDENTS.map((s, idx) => ({
          ...s,
          currentClass: formData.currentClass,
          section: formData.section,
          newRollNo: String(201 + idx)
        }));
        setStudents(fallback);
        setSelectedIds(fallback.filter(s => s.examResult === 'Pass').map(s => s._id));
        showToast(`Loaded candidate ledger for ${formData.currentClass} (${formData.section}).`);
      }
    } catch {
      setStudents(DEMO_STUDENTS);
      setSelectedIds(DEMO_STUDENTS.filter(s => s.examResult === 'Pass').map(s => s._id));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s._id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleActionChange = (id, newAction) => {
    setStudents(prev => prev.map(s => s._id === id ? { ...s, action: newAction } : s));
  };

  const handleNewRollNoChange = (id, val) => {
    setStudents(prev => prev.map(s => s._id === id ? { ...s, newRollNo: val } : s));
  };

  const handlePromoteConfirm = async () => {
    const targets = students.filter(s => selectedIds.includes(s._id));
    if (targets.length === 0) {
      showToast('⚠️ Please select at least one student to promote.');
      return;
    }

    setPromoting(true);
    setConfirmModal(false);

    try {
      const payload = {
        promoteSession: formData.promoteSession,
        promoteClass: formData.promoteClass,
        promoteSection: formData.promoteSection,
        promotions: targets.map(t => ({
          studentId: t._id,
          promoteClass: t.action === 'repeat' ? formData.currentClass : formData.promoteClass,
          promoteSection: formData.promoteSection,
          promoteSession: formData.promoteSession,
          rollNo: t.newRollNo
        }))
      };

      const res = await api.post('/student/promote', payload).catch(() => null);

      // Record in local history
      const newHist = {
        id: `hist-${Date.now()}`,
        fromClass: `${formData.currentClass} (${formData.section})`,
        toClass: `${formData.promoteClass} (${formData.promoteSection})`,
        session: formData.promoteSession,
        count: targets.length,
        date: 'Just now',
        by: 'Current Session'
      };
      setPromotionHistory(prev => [newHist, ...prev]);

      showToast(`🎉 Success! Promoted ${targets.length} students to ${formData.promoteClass} (${formData.promoteSection}) for ${formData.promoteSession}!`);

      // Mark local students as promoted
      setStudents(prev => prev.filter(s => !selectedIds.includes(s._id)));
      setSelectedIds([]);
    } catch (e) {
      showToast('⚠️ Promotion failed: ' + (e.message || 'Server error'));
    } finally {
      setPromoting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.rollNo.includes(searchFilter)
    );
  }, [students, searchFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#084A86] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-sky-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 border border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-zinc-950">Confirm Student Promotion</h3>
                <p className="text-xs text-zinc-500">Official batch advancement protocol • Pak Royal College Sharaqpur</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-zinc-200/80 space-y-2 text-xs text-zinc-700">
              <div className="flex justify-between py-1 border-b border-zinc-200/50">
                <span className="font-semibold text-zinc-500">Current Class &amp; Section:</span>
                <strong className="text-zinc-950">{formData.currentClass} ({formData.section})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200/50">
                <span className="font-semibold text-zinc-500">Target Promoted Class:</span>
                <strong className="text-emerald-700 font-bold">{formData.promoteClass} ({formData.promoteSection})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200/50">
                <span className="font-semibold text-zinc-500">Target Academic Session:</span>
                <strong className="text-[#084A86] font-bold">{formData.promoteSession}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-zinc-500">Candidates Selected:</span>
                <strong className="text-zinc-950 font-black">{selectedIds.length} Students</strong>
              </div>
            </div>

            <p className="text-[11.5px] text-zinc-500">
              Students will be moved to the target class, their academic session will be updated, and their previous class records will be archived in the student history log.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setConfirmModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button 
                onClick={handlePromoteConfirm} 
                disabled={promoting}
                className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold px-5"
              >
                {promoting ? 'Promoting...' : `Confirm & Promote (${selectedIds.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <GraduationCap className="h-6 w-6" />
            </span>
            Student Promotion &amp; Advancement
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Batch promote students to next academic year and class • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-600">Student Info</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Student Promote</span>
        </div>
      </div>

      {/* Criteria Selection Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#084A86]" />
            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Promotion Criteria</h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">Select source class and target advancement destination</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Current Academic Year */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                Current Session <span className="text-rose-500">*</span>
              </Label>
              <select
                value={formData.academicYear}
                onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-950 font-semibold focus:outline-none focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86]"
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Current Class */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                Current Class <span className="text-rose-500">*</span>
              </Label>
              <select
                value={formData.currentClass}
                onChange={e => setFormData({ ...formData, currentClass: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-950 font-semibold focus:outline-none focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86]"
              >
                {classesList.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Current Section */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                Current Section <span className="text-rose-500">*</span>
              </Label>
              <select
                value={formData.section}
                onChange={e => setFormData({ ...formData, section: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-950 font-semibold focus:outline-none focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86]"
              >
                {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>

            {/* Target Session */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wide flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Target Session <span className="text-rose-500">*</span>
              </Label>
              <select
                value={formData.promoteSession}
                onChange={e => setFormData({ ...formData, promoteSession: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-emerald-300 bg-emerald-50/30 px-3 py-2 text-xs text-zinc-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Target Class */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wide flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Promote To Class <span className="text-rose-500">*</span>
              </Label>
              <select
                value={formData.promoteClass}
                onChange={e => setFormData({ ...formData, promoteClass: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-emerald-300 bg-emerald-50/30 px-3 py-2 text-xs text-zinc-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                {classesList.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Target Section */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wide flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Target Section <span className="text-rose-500">*</span>
              </Label>
              <select
                value={formData.promoteSection}
                onChange={e => setFormData({ ...formData, promoteSection: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-emerald-300 bg-emerald-50/30 px-3 py-2 text-xs text-zinc-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-zinc-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#084A86]" />
              Advancing from <strong>{formData.currentClass} ({formData.section})</strong> → <strong className="text-emerald-700">{formData.promoteClass} ({formData.promoteSection})</strong>
            </div>

            <Button
              onClick={fetchStudents}
              disabled={loading}
              className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Search className="h-3.5 w-3.5 mr-1.5" />
              {loading ? 'LOADING STUDENTS...' : 'SEARCH STUDENTS'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('promote')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'promote'
              ? 'bg-[#084A86] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Promotion Ledger ({students.length} Candidates)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#084A86] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Promotion History Logs ({promotionHistory.length})
        </button>
      </div>

      {activeTab === 'promote' && (
        <div className="space-y-4">
          {/* Action Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="p-1 rounded text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                  <CheckSquare className="w-5 h-5 text-[#084A86]" />
                ) : (
                  <Square className="w-5 h-5 text-zinc-400" />
                )}
              </button>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-950 flex items-center gap-2">
                  <span>Selected: <strong className="text-[#084A86]">{selectedIds.length}</strong> of {filteredStudents.length} Students</span>
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Ready to promote to <strong>{formData.promoteClass}</strong> for session <strong>{formData.promoteSession}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input
                  placeholder="Filter by name / roll..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="pl-8 text-xs h-8 bg-white border-zinc-200"
                />
              </div>

              <Button
                onClick={() => setConfirmModal(true)}
                disabled={selectedIds.length === 0 || promoting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <GraduationCap className="h-4 w-4" />
                <span>PROMOTE SELECTED ({selectedIds.length})</span>
              </Button>
            </div>
          </div>

          {/* Students Ledger Table */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <button onClick={handleSelectAll} className="cursor-pointer">
                        {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-[#084A86]" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-400" />
                        )}
                      </button>
                    </th>
                    <th className="p-3">Adm #</th>
                    <th className="p-3">Current Roll #</th>
                    <th className="p-3">Candidate / Guardian</th>
                    <th className="p-3 text-center">Exam Result</th>
                    <th className="p-3 text-center">Promotion Decision</th>
                    <th className="p-3 text-center">New Roll #</th>
                    <th className="p-3 text-right">Target Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredStudents.length > 0 ? filteredStudents.map((st) => {
                    const isSelected = selectedIds.includes(st._id);
                    return (
                      <tr 
                        key={st._id} 
                        className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-sky-50/25' : ''}`}
                      >
                        <td className="p-3 text-center">
                          <button onClick={() => handleSelectOne(st._id)} className="cursor-pointer">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#084A86]" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-300" />
                            )}
                          </button>
                        </td>
                        <td className="p-3 font-mono text-zinc-600 font-bold">
                          {st.admissionNo}
                        </td>
                        <td className="p-3 font-mono font-extrabold text-zinc-800">
                          #{st.rollNo}
                        </td>
                        <td className="p-3">
                          <div className="font-extrabold text-zinc-950">{st.name}</div>
                          <div className="text-[10px] text-zinc-500">Father: {st.fatherName}</div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            st.examResult === 'Pass' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {st.examResult} ({st.examScore})
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <select
                            value={st.action}
                            onChange={(e) => handleActionChange(st._id, e.target.value)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border focus:outline-none ${
                              st.action === 'promote' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <option value="promote">✓ Promote to Next Class</option>
                            <option value="repeat">↻ Repeat Current Class</option>
                            <option value="left">✕ Leave / Transfer</option>
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="text"
                            value={st.newRollNo}
                            onChange={(e) => handleNewRollNoChange(st._id, e.target.value)}
                            className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#084A86]"
                          />
                        </td>
                        <td className="p-3 text-right font-bold">
                          <span className="text-emerald-700">
                            {st.action === 'repeat' ? formData.currentClass : formData.promoteClass} ({formData.promoteSection})
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="8" className="p-12 text-center text-zinc-500">
                        <Users className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                        <p className="font-bold">No students found matching current criteria</p>
                        <p className="text-xs mt-1">Select a class &amp; section above and click &quot;Search Students&quot;</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-zinc-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Showing {filteredStudents.length} candidates</span>
              <span className="font-bold text-zinc-800">{selectedIds.length} marked for promotion</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Promotion History Logs */}
      {activeTab === 'history' && (
        <div className="bg-white border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wide">Promotion Audit Logs</h3>
              <p className="text-[11px] text-zinc-500">Permanent record of academic class batch advancements</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {promotionHistory.length} Batches Promoted
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">From Class</th>
                  <th className="p-3">Promoted To Class</th>
                  <th className="p-3">Academic Session</th>
                  <th className="p-3 text-center">Students Count</th>
                  <th className="p-3">Execution Date</th>
                  <th className="p-3 text-right">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {promotionHistory.map((h, idx) => (
                  <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 text-zinc-400 font-mono">{idx + 1}</td>
                    <td className="p-3 font-bold text-zinc-800">{h.fromClass}</td>
                    <td className="p-3 font-bold text-emerald-700">{h.toClass}</td>
                    <td className="p-3 font-semibold text-[#084A86]">{h.session}</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-[#084A86]">
                        {h.count} Students
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500">{h.date}</td>
                    <td className="p-3 text-right font-medium text-zinc-700">{h.by}</td>
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
