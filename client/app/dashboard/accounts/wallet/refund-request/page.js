'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Building, 
  ArrowUpRight,
  ShieldCheck,
  Check,
  Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const DEMO_REFUNDS = [
  { _id: 'ref-1', date: '2026-10-14', student: 'Zainab Bibi', admNo: 'PRC-083', amount: 5000, reason: 'Duplicate Fee Deposit Adjustment', bankName: 'Meezan Bank Ltd', accountTitle: 'Abdul Rehman', accountNo: 'PK36MEZN00012345678901', status: 'Pending', requestedBy: 'Parent (Portal)' },
  { _id: 'ref-2', date: '2026-10-12', student: 'Rabia Naz', admNo: 'PRC-092', amount: 7500, reason: 'Hostel Security Deposit Clearance', bankName: 'Habib Bank Limited (HBL)', accountTitle: 'Muhammad Nazir', accountNo: 'PK12HABB00987654321098', status: 'Approved', requestedBy: 'Hostel Warden' },
  { _id: 'ref-3', date: '2026-10-10', student: 'Kamran Ahmed', admNo: 'PRC-095', amount: 12000, reason: 'Admission Cancellation (Within 7 Days)', bankName: 'Bank Alfalah', accountTitle: 'Ahmed Hassan', accountNo: 'PK54ALFH00112233445566', status: 'Completed', requestedBy: 'Admin Office' },
  { _id: 'ref-4', date: '2026-10-08', student: 'Hamza Farooq', admNo: 'PRC-084', amount: 3500, reason: 'Transport Caution Fee Refund', bankName: 'Allied Bank Ltd', accountTitle: 'Farooq Ahmed', accountNo: 'PK99ABPA00223344556677', status: 'Completed', requestedBy: 'Transport Manager' },
  { _id: 'ref-5', date: '2026-10-05', student: 'Saad Ur Rehman', admNo: 'PRC-087', amount: 15000, reason: 'Unclaimed Wallet Balance Withdrawal', bankName: 'JazzCash Account', accountTitle: 'Khalid Mehmood', accountNo: '03067890123', status: 'Rejected', requestedBy: 'Parent (Portal)' },
];

const fmt = (n) => 'PKR ' + n.toLocaleString('en-PK');

export default function RefundRequestPage() {
  const [records, setRecords] = useState(DEMO_REFUNDS);
  const [formData, setFormData] = useState({
    student: '',
    admNo: '',
    amount: '',
    reason: '',
    bankName: 'Meezan Bank Ltd',
    accountTitle: '',
    accountNo: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [actionModal, setActionModal] = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    api.get('/wallet/refund').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setRecords(res.data);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.student.trim() || !formData.amount) {
      showToast('⚠️ Student name and refund amount are required.');
      return;
    }

    if (editingId) {
      setRecords(records.map(r => r._id === editingId ? { ...r, ...formData, amount: Number(formData.amount) } : r));
      showToast('✓ Refund request updated successfully!');
      setEditingId(null);
    } else {
      const newRec = {
        _id: `ref-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        student: formData.student,
        admNo: formData.admNo || `PRC-2026-${Math.floor(100 + Math.random() * 900)}`,
        amount: Number(formData.amount),
        reason: formData.reason || 'General Wallet Balance Refund',
        bankName: formData.bankName,
        accountTitle: formData.accountTitle || formData.student,
        accountNo: formData.accountNo || 'PK00BANK00000000000000',
        status: 'Pending',
        requestedBy: 'Accounts Counter'
      };
      setRecords([newRec, ...records]);
      showToast('✓ New refund request initiated!');
    }
    setFormData({
      student: '',
      admNo: '',
      amount: '',
      reason: '',
      bankName: 'Meezan Bank Ltd',
      accountTitle: '',
      accountNo: ''
    });
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      student: item.student,
      admNo: item.admNo,
      amount: String(item.amount),
      reason: item.reason,
      bankName: item.bankName,
      accountTitle: item.accountTitle,
      accountNo: item.accountNo
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = (id, newStatus) => {
    setRecords(records.map(r => r._id === id ? { ...r, status: newStatus } : r));
    showToast(`Refund request updated to ${newStatus}.`);
    setActionModal(null);
  };

  const cancelEdit = () => {
    setFormData({
      student: '',
      admNo: '',
      amount: '',
      reason: '',
      bankName: 'Meezan Bank Ltd',
      accountTitle: '',
      accountNo: ''
    });
    setEditingId(null);
  };

  const filtered = useMemo(() => {
    return records.filter(r => {
      const q = search.toLowerCase();
      return !search || 
        r.student.toLowerCase().includes(q) ||
        r.admNo.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.bankName.toLowerCase().includes(q);
    });
  }, [records, search]);

  const pendingCount = records.filter(r => r.status === 'Pending').length;
  const completedTotal = records.filter(r => r.status === 'Completed').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#084A86] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-sky-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-zinc-950">Manage Refund Request</h3>
            <p className="text-sm text-zinc-600">
              Candidate: <strong>{actionModal.student}</strong> ({actionModal.admNo})<br />
              Amount: <strong className="text-[#084A86]">{fmt(actionModal.amount)}</strong><br />
              Bank: <strong>{actionModal.bankName}</strong> ({actionModal.accountNo})
            </p>
            <div className="space-y-2 pt-2">
              <Button onClick={() => handleStatusChange(actionModal._id, 'Approved')} className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold">
                <Check className="w-4 h-4 mr-1.5" /> Approve for Payment
              </Button>
              <Button onClick={() => handleStatusChange(actionModal._id, 'Completed')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark as Transferred / Disbursed
              </Button>
              <Button onClick={() => handleStatusChange(actionModal._id, 'Rejected')} variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-bold">
                <Ban className="w-4 h-4 mr-1.5" /> Reject Request
              </Button>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <Button variant="ghost" onClick={() => setActionModal(null)} className="text-xs">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <RotateCcw className="h-6 w-6" />
            </span>
            Wallet Refund Requests &amp; Payouts
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Authorize student wallet withdrawals, caution fee returns, and bank transfers • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/accounts/wallet" className="hover:text-zinc-600">Wallet</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Refund Requests</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Pending Review</span>
            <div className="text-xl font-black text-amber-700">{pendingCount} Requests</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Disbursed</span>
            <div className="text-xl font-black text-emerald-600 font-mono">{fmt(completedTotal)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#084A86] flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Beneficiary Payouts</span>
            <div className="text-xl font-black text-[#084A86]">Direct IBAN Transfer</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden sticky top-4">
            <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex items-center justify-between">
              <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                {editingId ? <><Edit className="w-4 h-4 text-[#084A86]" /> Edit Refund Request</> : <><Plus className="w-4 h-4 text-[#084A86]" /> Initiate Refund Request</>}
              </h2>
              {editingId && (
                <button onClick={cancelEdit} className="text-zinc-400 hover:text-zinc-950 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">Candidate Name *</Label>
                <Input
                  required
                  placeholder="e.g. Muhammad Abdullah"
                  value={formData.student}
                  onChange={e => setFormData({ ...formData, student: e.target.value })}
                  className="bg-white border-zinc-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">Admission No</Label>
                  <Input
                    placeholder="e.g. PRC-081"
                    value={formData.admNo}
                    onChange={e => setFormData({ ...formData, admNo: e.target.value })}
                    className="bg-white border-zinc-200 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">Amount (PKR) *</Label>
                  <Input
                    required
                    type="number"
                    placeholder="e.g. 5000"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="bg-white border-zinc-200 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">Reason for Refund</Label>
                <Input
                  placeholder="e.g. Caution fee return, duplicate payment"
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="bg-white border-zinc-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">Bank Name</Label>
                <Input
                  placeholder="e.g. Meezan Bank, HBL, Allied Bank"
                  value={formData.bankName}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  className="bg-white border-zinc-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">Account Title &amp; IBAN</Label>
                <Input
                  placeholder="Account Title"
                  value={formData.accountTitle}
                  onChange={e => setFormData({ ...formData, accountTitle: e.target.value })}
                  className="bg-white border-zinc-200 text-xs mb-1.5"
                />
                <Input
                  placeholder="IBAN / Account Number"
                  value={formData.accountNo}
                  onChange={e => setFormData({ ...formData, accountNo: e.target.value })}
                  className="bg-white border-zinc-200 text-xs font-mono"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full bg-[#084A86] hover:bg-[#063866] text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95">
                  {editingId ? 'UPDATE REQUEST' : 'SUBMIT REFUND CLAIM'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Refund Claims Ledger</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input 
                  placeholder="Search claims..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  className="pl-8 bg-white border-zinc-200 text-xs h-9" 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 w-10">#</th>
                    <th className="p-3">Candidate Info</th>
                    <th className="p-3 text-right">Refund Amount</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Bank Details</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.length > 0 ? filtered.map((r, i) => (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-zinc-400 font-mono">{i + 1}</td>
                      <td className="p-3">
                        <div className="font-extrabold text-zinc-950">{r.student}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{r.admNo} • {r.date}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-black text-[#084A86] text-sm">{fmt(r.amount)}</td>
                      <td className="p-3 text-zinc-600 max-w-xs truncate text-[11px]">{r.reason}</td>
                      <td className="p-3">
                        <div className="font-semibold text-zinc-800">{r.bankName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{r.accountNo}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          r.status === 'Approved' ? 'bg-sky-100 text-[#084A86]' :
                          r.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setActionModal(r)}
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#084A86] transition-colors cursor-pointer"
                            title="Manage Status"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-zinc-500">
                        No refund requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-zinc-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Showing {filtered.length} refund requests</span>
              <span className="font-bold text-zinc-700">Pak Royal College Sharaqpur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
