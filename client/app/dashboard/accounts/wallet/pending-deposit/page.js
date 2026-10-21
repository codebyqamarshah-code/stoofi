'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Clock, CheckCircle2, XCircle, Search, CheckSquare, Square, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

const DEMO = [
  { _id: 'pd1', date: '2026-10-15', student: 'Muhammad Abdullah', admNo: 'PRC-081', amount: 15000, method: 'Bank Transfer', receipt: 'REC-001', submittedBy: 'Admin', notes: '' },
  { _id: 'pd2', date: '2026-10-15', student: 'Ayesha Fatima', admNo: 'PRC-082', amount: 20000, method: 'Cash', receipt: 'REC-002', submittedBy: 'Cashier', notes: '' },
  { _id: 'pd3', date: '2026-10-14', student: 'Hamza Farooq', admNo: 'PRC-084', amount: 10000, method: 'Online', receipt: 'REC-003', submittedBy: 'Parent Portal', notes: '' },
  { _id: 'pd4', date: '2026-10-14', student: 'Zainab Bibi', admNo: 'PRC-083', amount: 8500, method: 'JazzCash', receipt: 'REC-004', submittedBy: 'Parent Portal', notes: '' },
  { _id: 'pd5', date: '2026-10-13', student: 'Bilal Hussain', admNo: 'PRC-086', amount: 25000, method: 'Bank Transfer', receipt: 'REC-005', submittedBy: 'Admin', notes: '' },
  { _id: 'pd6', date: '2026-10-13', student: 'Fatima Noor', admNo: 'PRC-085', amount: 12000, method: 'Cash', receipt: 'REC-006', submittedBy: 'Cashier', notes: '' },
  { _id: 'pd7', date: '2026-10-12', student: 'Saad Ur Rehman', admNo: 'PRC-087', amount: 18000, method: 'EasyPaisa', receipt: 'REC-007', submittedBy: 'Parent Portal', notes: '' },
  { _id: 'pd8', date: '2026-10-12', student: 'Mariam Zahra', admNo: 'PRC-088', amount: 9000, method: 'Cash', receipt: 'REC-008', submittedBy: 'Cashier', notes: '' },
];

const fmt = (n) => 'PKR ' + n.toLocaleString('en-PK');

export default function PendingDepositPage() {
  const [records, setRecords] = useState(DEMO);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [approveNote, setApproveNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/wallet/deposit?status=pending').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) setRecords(res.data);
    }).catch(() => {});
  }, []);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const handleApprove = (id) => {
    api.put(`/wallet/deposit/${id}/approve`, { notes: approveNote }).catch(() => {});
    setRecords(prev => prev.filter(r => r._id !== id));
    setApproveModal(null); setApproveNote('');
    showToast('Deposit approved successfully!');
  };

  const handleReject = (id) => {
    api.put(`/wallet/deposit/${id}/reject`, { reason: rejectReason }).catch(() => {});
    setRecords(prev => prev.filter(r => r._id !== id));
    setRejectModal(null); setRejectReason('');
    showToast('Deposit rejected.');
  };

  const handleBulkApprove = () => {
    selectedIds.forEach(id => {
      api.put(`/wallet/deposit/${id}/approve`).catch(() => {});
    });
    setRecords(prev => prev.filter(r => !selectedIds.includes(r._id)));
    setSelectedIds([]);
    showToast(`${selectedIds.length} deposits approved!`);
  };

  const filtered = records.filter(r => !search || r.student.toLowerCase().includes(search.toLowerCase()) || r.admNo.toLowerCase().includes(search.toLowerCase()));
  const totalPending = filtered.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {toast && <div className="fixed top-5 right-5 z-50 bg-[#084A86] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-400" />{toast}</div>}

      {approveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-zinc-900">Confirm Approval</h3>
            <p className="text-sm text-zinc-600">Approve deposit of <strong className="text-emerald-700">{fmt(approveModal.amount)}</strong> for <strong>{approveModal.student}</strong>?</p>
            <textarea value={approveNote} onChange={e => setApproveNote(e.target.value)} placeholder="Add notes (optional)..." rows={2} className="w-full p-2 rounded-lg border border-zinc-200 text-xs" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setApproveModal(null)} className="text-xs">Cancel</Button>
              <Button onClick={() => handleApprove(approveModal._id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">Approve</Button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-zinc-900">Reject Deposit</h3>
            <p className="text-sm text-zinc-600">Reject deposit of <strong className="text-rose-700">{fmt(rejectModal.amount)}</strong> for <strong>{rejectModal.student}</strong>?</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection *" rows={2} className="w-full p-2 rounded-lg border border-zinc-200 text-xs" required />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectModal(null)} className="text-xs">Cancel</Button>
              <Button onClick={() => handleReject(rejectModal._id)} className="bg-rose-600 hover:bg-rose-700 text-white text-xs">Reject</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700"><Clock className="h-6 w-6" /></span>
            Pending Deposits
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Review and approve student wallet deposit requests</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link><ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/accounts/wallet" className="hover:text-zinc-600">Wallet</Link><ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Pending Deposits</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
          <div><span className="text-xs font-bold text-zinc-600">{filtered.length} Pending Deposits</span><div className="text-lg font-black text-amber-700">{fmt(totalPending)}</div></div>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && <Button onClick={handleBulkApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Approve Selected ({selectedIds.length})</Button>}
        </div>
      </div>

      <div className="bg-white border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden">
        <div className="p-3 border-b border-zinc-100 flex items-center justify-between">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" /><Input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 text-xs bg-white border-zinc-200" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
              <tr>
                <th className="p-3 w-10"><button onClick={() => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(r=>r._id))} className="cursor-pointer">{selectedIds.length === filtered.length ? <CheckSquare className="w-4 h-4 text-[#084A86]" /> : <Square className="w-4 h-4 text-zinc-400" />}</button></th>
                <th className="p-3">Date</th><th className="p-3">Student</th><th className="p-3">Adm #</th><th className="p-3 text-right">Amount</th><th className="p-3">Method</th><th className="p-3">Receipt</th><th className="p-3">Submitted By</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(r => (
                <tr key={r._id} className="hover:bg-slate-50/70">
                  <td className="p-3"><button onClick={() => setSelectedIds(prev => prev.includes(r._id) ? prev.filter(x=>x!==r._id) : [...prev, r._id])} className="cursor-pointer">{selectedIds.includes(r._id) ? <CheckSquare className="w-4 h-4 text-[#084A86]" /> : <Square className="w-4 h-4 text-zinc-300" />}</button></td>
                  <td className="p-3 text-zinc-500">{formatDateDMY(r.date)}</td>
                  <td className="p-3 font-bold text-zinc-900">{r.student}</td>
                  <td className="p-3 font-mono text-zinc-600">{r.admNo}</td>
                  <td className="p-3 text-right font-bold text-emerald-600 font-mono">{fmt(r.amount)}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700">{r.method}</span></td>
                  <td className="p-3 font-mono text-zinc-500">{r.receipt}</td>
                  <td className="p-3 text-zinc-600">{r.submittedBy}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button onClick={() => setApproveModal(r)} size="sm" className="h-7 px-2.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Approve</Button>
                      <Button onClick={() => setRejectModal(r)} size="sm" variant="outline" className="h-7 px-2.5 text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-lg">Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
