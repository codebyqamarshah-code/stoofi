'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Archive, 
  Users, 
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEMO_TRASH = [
  { id: 'del-1', admissionNo: 'PRC-2024-003', rollNo: '112', name: 'Zohaib Tariq', class: 'FSC OTT', section: 'A', fatherName: 'Tariq Javed', deletedAt: '14 Oct 2026, 04:20 PM', deletedBy: 'Admin (M. Imran)', reason: 'Duplicate Entry Error' },
  { id: 'del-2', admissionNo: 'PRC-2024-019', rollNo: '118', name: 'Shahmeer Khan', class: 'BS Psychology', section: 'B', fatherName: 'Nasir Khan', deletedAt: '12 Oct 2026, 11:15 AM', deletedBy: 'Admin (M. Imran)', reason: 'Admission Cancelled by Parent' },
  { id: 'del-3', admissionNo: 'PRC-2023-088', rollNo: '125', name: 'Alina Noor', class: 'DPT', section: 'A', fatherName: 'Noor Muhammad', deletedAt: '08 Oct 2026, 02:40 PM', deletedBy: 'Principal Office', reason: 'Student Migrated to Overseas' },
];

export default function DeleteStudentRecordPage() {
  const [students, setStudents] = useState(DEMO_TRASH);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const [restoreModal, setRestoreModal] = useState(null);
  const [purgeModal, setPurgeModal] = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const handleRestore = () => {
    if (!restoreModal) return;
    setStudents(students.filter(s => s.id !== restoreModal.id));
    showToast(`✓ Student record ${restoreModal.name} restored to active students!`);
    setRestoreModal(null);
  };

  const handlePurge = () => {
    if (!purgeModal) return;
    setStudents(students.filter(s => s.id !== purgeModal.id));
    showToast(`Permanently deleted ${purgeModal.name} from database.`);
    setPurgeModal(null);
  };

  const handlePurgeAll = () => {
    setStudents([]);
    showToast('Trash bin emptied successfully.');
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.includes(searchQuery)
    );
  }, [students, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#084A86] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-sky-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* Restore Modal */}
      {restoreModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-zinc-950 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-emerald-600" />
              Restore Student Record?
            </h3>
            <p className="text-sm text-zinc-600">
              Restore <strong className="text-zinc-950">{restoreModal.name}</strong> ({restoreModal.admissionNo}) back to <strong>{restoreModal.class}</strong> active roster?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setRestoreModal(null)} className="text-xs">Cancel</Button>
              <Button onClick={handleRestore} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">Confirm Restore</Button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Modal */}
      {purgeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Permanently Purge Record?
            </h3>
            <p className="text-sm text-zinc-600">
              Are you sure you want to permanently delete <strong className="text-rose-700">{purgeModal.name}</strong> ({purgeModal.admissionNo})? This action cannot be undone and will erase all academic and fee histories.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setPurgeModal(null)} className="text-xs">Cancel</Button>
              <Button onClick={handlePurge} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">Purge Permanently</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Trash2 className="h-6 w-6" />
            </span>
            Deleted Student Records (Archive &amp; Trash Bin)
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Safely recover accidentally deleted candidates or audit removed records • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-600">Student Info</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Deleted Records</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Archived in Bin</span>
            <div className="text-xl font-black text-rose-600">{students.length} Records</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">1-Click Restoration</span>
            <div className="text-xl font-black text-emerald-600">Enabled</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#084A86] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Retention Period</span>
            <div className="text-xl font-black text-[#084A86]">90 Days Archive</div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input 
              placeholder="Search deleted records..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-white border-zinc-200 text-xs h-9"
            />
          </div>

          {students.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePurgeAll}
              className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Empty Trash Bin ({students.length})
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
              <tr>
                <th className="p-3 w-10">#</th>
                <th className="p-3">Admission No</th>
                <th className="p-3">Candidate / Guardian</th>
                <th className="p-3">Class</th>
                <th className="p-3">Deleted Reason</th>
                <th className="p-3">Deleted Timestamp</th>
                <th className="p-3">Authorized By</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredStudents.length > 0 ? filteredStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-zinc-400 font-mono">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-zinc-700">
                    <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                      {s.admissionNo}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-extrabold text-zinc-950">{s.name}</div>
                    <div className="text-[10px] text-zinc-500">Father: {s.fatherName} • Roll #{s.rollNo}</div>
                  </td>
                  <td className="p-3 font-bold text-zinc-800">
                    {s.class} <span className="text-zinc-500 font-normal">({s.section})</span>
                  </td>
                  <td className="p-3 text-rose-700 font-semibold text-[11px]">
                    {s.reason}
                  </td>
                  <td className="p-3 text-zinc-500 font-mono text-[10.5px]">
                    {s.deletedAt}
                  </td>
                  <td className="p-3 text-zinc-600 font-medium">
                    {s.deletedBy}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        onClick={() => setRestoreModal(s)}
                        size="sm"
                        className="h-7 px-2.5 text-[10.5px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </Button>
                      <Button
                        onClick={() => setPurgeModal(s)}
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-[10.5px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-zinc-500">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                    <p className="font-bold">Trash bin is clean</p>
                    <p className="text-xs mt-1">No deleted student records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-zinc-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Showing {filteredStudents.length} of {students.length} deleted records</span>
          <span className="font-bold text-zinc-700">Pak Royal College Sharaqpur</span>
        </div>
      </div>
    </div>
  );
}