'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  XCircle, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Wallet,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

const DEMO_REJECTED = [
  { _id: 'rd-1', date: '2026-10-14', student: 'Khurram Shehzad', admNo: 'PRC-2025-099', amount: 15000, method: 'Bank Transfer', receipt: 'REC-202610-099', rejectedBy: 'Accounts Officer (M. Bilal)', reason: 'Bank deposit slip image illegible & unverified', rejectionDate: '14 Oct 2026, 03:15 PM', status: 'Rejected' },
  { _id: 'rd-2', date: '2026-10-13', student: 'Daniyal Ahmed', admNo: 'PRC-2025-067', amount: 25000, method: 'JazzCash Wallet', receipt: 'REC-202610-058', rejectedBy: 'Admin (M. Imran)', reason: 'Duplicate transaction ID entered', rejectionDate: '13 Oct 2026, 05:20 PM', status: 'Rejected' },
  { _id: 'rd-3', date: '2026-10-11', student: 'Rameen Fatima', admNo: 'PRC-2024-112', amount: 8000, method: 'Cheque', receipt: 'REC-202610-032', rejectedBy: 'Chief Cashier', reason: 'Post-dated cheque signature mismatch', rejectionDate: '11 Oct 2026, 12:40 PM', status: 'Rejected' },
  { _id: 'rd-4', date: '2026-10-09', student: 'Faizan Ali', admNo: 'PRC-2025-081', amount: 12000, method: 'EasyPaisa', receipt: 'REC-202610-014', rejectedBy: 'Accounts Officer (M. Bilal)', reason: 'Payment reversed by sender bank', rejectionDate: '09 Oct 2026, 04:00 PM', status: 'Rejected' },
];

const fmt = (n) => 'PKR ' + n.toLocaleString('en-PK');

export default function RejectDepositPage() {
  const [records, setRecords] = useState(DEMO_REJECTED);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [reopenModal, setReopenModal] = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    api.get('/wallet/deposit?status=rejected').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setRecords(res.data);
      }
    }).catch(() => {});
  }, []);

  const handleReopen = () => {
    if (!reopenModal) return;
    setRecords(records.filter(r => r._id !== reopenModal._id));
    showToast(`✓ Deposit request for ${reopenModal.student} returned to Pending queue for review.`);
    setReopenModal(null);
  };

  const filtered = useMemo(() => {
    return records.filter(r => {
      return !search || 
        r.student.toLowerCase().includes(search.toLowerCase()) ||
        r.admNo.toLowerCase().includes(search.toLowerCase()) ||
        r.receipt.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase());
    });
  }, [records, search]);

  const totalRejectedAmount = filtered.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#084A86] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-sky-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* Reopen Modal */}
      {reopenModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-zinc-950 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#084A86]" />
              Return to Pending Queue?
            </h3>
            <p className="text-sm text-zinc-600">
              Move deposit request of <strong className="text-zinc-950">{fmt(reopenModal.amount)}</strong> for <strong>{reopenModal.student}</strong> back to the <strong>Pending Deposits</strong> queue for re-verification?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setReopenModal(null)} className="text-xs">Cancel</Button>
              <Button onClick={handleReopen} className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold">Re-Open Request</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <XCircle className="h-6 w-6" />
            </span>
            Rejected Student Deposits Log
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Audit history of disallowed or fraudulent deposit attempts • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/accounts/wallet" className="hover:text-zinc-600">Wallet</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Rejected Deposits</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Rejected Slips</span>
            <div className="text-xl font-black text-rose-600">{filtered.length} Requests</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Disallowed Total</span>
            <div className="text-xl font-black text-zinc-900 font-mono">{fmt(totalRejectedAmount)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Appeals / Re-Reviews</span>
            <div className="text-xl font-black text-amber-700">Supported</div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input 
              placeholder="Search by student, receipt, or reason..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-8 bg-white border-zinc-200 text-xs h-9" 
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
            <Printer className="w-3.5 h-3.5 mr-1" /> Print Report
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
              <tr>
                <th className="p-3 w-10">#</th>
                <th className="p-3">Candidate / Guardian</th>
                <th className="p-3">Receipt Ref</th>
                <th className="p-3">Method</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Rejection Reason</th>
                <th className="p-3">Rejected By</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length > 0 ? filtered.map((r, i) => (
                <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-zinc-400 font-mono">{i + 1}</td>
                  <td className="p-3">
                    <div className="font-extrabold text-zinc-950">{r.student}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{r.admNo}</div>
                  </td>
                  <td className="p-3 font-mono font-bold text-zinc-700">{r.receipt}</td>
                  <td className="p-3 text-zinc-600 font-medium">{r.method}</td>
                  <td className="p-3 text-right font-mono font-black text-rose-600 text-sm">{fmt(r.amount)}</td>
                  <td className="p-3">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[10.5px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 max-w-xs leading-tight">
                      {r.reason}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-zinc-800">{r.rejectedBy}</td>
                  <td className="p-3 text-zinc-500 font-mono text-[10.5px]">{r.rejectionDate}</td>
                  <td className="p-3 text-right">
                    <Button
                      onClick={() => setReopenModal(r)}
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-[10.5px] font-bold text-[#084A86] border-sky-300 hover:bg-sky-50 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Re-Review
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-zinc-500">
                    No rejected deposit records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-zinc-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Showing {filtered.length} rejected slips</span>
          <span className="font-bold text-zinc-700">Pak Royal College Sharaqpur</span>
        </div>
      </div>
    </div>
  );
}
