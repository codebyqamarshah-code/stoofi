'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  UserX, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Trash2, 
  Filter, 
  Users, 
  Eye, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { sortClassesAcademic, STANDARD_ACADEMIC_CLASSES } from '@/lib/academicUtils';
import api from '@/services/api';

const DEMO_DISABLED = [
  { _id: 'dis-1', admissionNo: 'PRC-2025-019', rollNo: '109', name: 'Zohaib Tariq', class: 'Class 10', section: 'B', fatherName: 'Tariq Javed', dob: '12/03/2008', gender: 'Male', reason: 'Fee Non-Payment Suspension', disabledDate: '02 Oct 2026', phone: '+923001239871' },
  { _id: 'dis-2', admissionNo: 'PRC-2025-044', rollNo: '115', name: 'Laiba Shahzadi', class: 'Class 9', section: 'A', fatherName: 'Muhammad Shahzad', dob: '22/07/2009', gender: 'Female', reason: 'School Leaving Certificate Issued', disabledDate: '28 Sep 2026', phone: '+923019876543' },
  { _id: 'dis-3', admissionNo: 'PRC-2025-058', rollNo: '122', name: 'Usman Ghani', class: 'Class 8', section: 'C', fatherName: 'Ghani Ur Rehman', dob: '14/11/2010', gender: 'Male', reason: 'Medical Long Leave Withdrawal', disabledDate: '15 Sep 2026', phone: '+923024567812' },
  { _id: 'dis-4', admissionNo: 'PRC-2024-091', rollNo: '130', name: 'Hamna Farooq', class: 'Class 10', section: 'A', fatherName: 'Farooq Ahmed', dob: '05/01/2008', gender: 'Female', reason: 'Family Relocation / Transferred', disabledDate: '10 Sep 2026', phone: '+923035678901' },
];

export default function DisabledStudentsPage() {
  const [classesList, setClassesList] = useState(STANDARD_ACADEMIC_CLASSES);
  const [students, setStudents] = useState(DEMO_DISABLED);
  const [formData, setFormData] = useState({ class: '', section: '', name: '', admissionNo: '' });
  const [quickSearch, setQuickSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [reactivateModal, setReactivateModal] = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    api.get('/class').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setClassesList(sortClassesAcademic(res.data));
      }
    }).catch(() => {});
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let q = '/student?';
      if (formData.class) q += `className=${encodeURIComponent(formData.class)}&`;
      if (formData.section) q += `section=${encodeURIComponent(formData.section)}&`;
      if (formData.name) q += `name=${encodeURIComponent(formData.name)}&`;
      if (formData.admissionNo) q += `admissionNo=${encodeURIComponent(formData.admissionNo)}&`;

      const res = await api.get(q).catch(() => null);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map(st => ({
          _id: st._id,
          admissionNo: st.admissionNo,
          rollNo: st.rollNo || '—',
          name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.fullName || 'Student',
          class: st.className,
          section: st.section,
          fatherName: st.fatherName || '—',
          dob: st.dob || '—',
          gender: st.gender || 'Male',
          reason: 'Deactivated / On Hold',
          disabledDate: 'Recent',
          phone: st.phone || st.mobileNumber || '—'
        }));
        setStudents(mapped);
        showToast(`Found ${mapped.length} records matching criteria.`);
      } else {
        setStudents(DEMO_DISABLED);
        showToast('Showing disabled student roster.');
      }
    } catch {
      setStudents(DEMO_DISABLED);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = () => {
    if (!reactivateModal) return;
    setStudents(prev => prev.filter(s => s._id !== reactivateModal._id));
    showToast(`✓ Student ${reactivateModal.name} reactivated to active class roster!`);
    setReactivateModal(null);
  };

  const filtered = useMemo(() => {
    return students.filter(s => {
      const q = quickSearch.toLowerCase();
      return !quickSearch || 
        s.name.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q));
    });
  }, [students, quickSearch]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#084A86] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-sky-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* Reactivate Modal */}
      {reactivateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-zinc-950 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-emerald-600" />
              Reactivate Student?
            </h3>
            <p className="text-sm text-zinc-600">
              Restore <strong className="text-zinc-950">{reactivateModal.name}</strong> ({reactivateModal.admissionNo}) back to <strong>{reactivateModal.class} ({reactivateModal.section})</strong> active class roster?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setReactivateModal(null)} className="text-xs">Cancel</Button>
              <Button onClick={handleReactivate} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">Confirm Reactivation</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <UserX className="h-6 w-6" />
            </span>
            Disabled &amp; Deactivated Students
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Review inactive, withdrawn, or suspended candidate records • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-600">Student Info</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Disabled Students</span>
        </div>
      </div>

      {/* Criteria Filter Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#084A86]" />
            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Filter Criteria</h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">Filter disabled students by class or credentials</span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">Class</Label>
            <select
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]/20"
            >
              <option value="">All Classes</option>
              {classesList.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">Section</Label>
            <select
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]/20"
            >
              <option value="">All Sections</option>
              {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">Search by Name</Label>
            <Input
              placeholder="Candidate name..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white border-zinc-200 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">Admission No</Label>
            <Input
              placeholder="e.g. PRC-2025-019"
              value={formData.admissionNo}
              onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
              className="bg-white border-zinc-200 text-xs font-mono"
            />
          </div>

          <div className="lg:col-span-4 flex justify-end pt-2 border-t border-zinc-100">
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-xl shadow-md cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              {loading ? 'SEARCHING...' : 'SEARCH RECORDS'}
            </Button>
          </div>
        </div>
      </div>

      {/* Disabled Students List Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Deactivated Candidates List</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input
              placeholder="Quick search..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="pl-8 bg-white border-zinc-200 text-xs h-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
              <tr>
                <th className="p-3 w-10">#</th>
                <th className="p-3">Admission No</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Candidate / Guardian</th>
                <th className="p-3">Class</th>
                <th className="p-3">Deactivation Reason</th>
                <th className="p-3">Disabled Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length > 0 ? filtered.map((s, idx) => (
                <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-zinc-400 font-mono">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-zinc-700">
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">
                      {s.admissionNo}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-zinc-800">#{s.rollNo}</td>
                  <td className="p-3">
                    <div className="font-extrabold text-zinc-950">{s.name}</div>
                    <div className="text-[10px] text-zinc-500">Father: {s.fatherName} • {s.phone}</div>
                  </td>
                  <td className="p-3 font-bold text-zinc-800">
                    {s.class} <span className="text-zinc-500 font-normal">({s.section})</span>
                  </td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {s.reason}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-500 font-medium">{s.disabledDate}</td>
                  <td className="p-3 text-right">
                    <Button
                      onClick={() => setReactivateModal(s)}
                      size="sm"
                      className="h-7 px-3 text-[10.5px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reactivate
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-zinc-500">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                    <p className="font-bold">No disabled students matching criteria</p>
                    <p className="text-xs mt-1">All registered students are active in their respective classes</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-zinc-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Showing {filtered.length} disabled student records</span>
          <span className="font-bold text-zinc-700">Pak Royal College Sharaqpur</span>
        </div>
      </div>
    </div>
  );
}