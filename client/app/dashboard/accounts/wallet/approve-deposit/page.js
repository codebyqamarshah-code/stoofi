'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Download, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

const DEMO_APPROVED = [
  { _id: 'ad-1', date: '2026-10-15', student: 'Muhammad Abdullah', admNo: 'PRC-081', amount: 15000, method: 'Bank Transfer (HBL)', receipt: 'REC-202610-001', approvedBy: 'Accounts Officer (M. Bilal)', approvalDate: '15 Oct 2026, 11:30 AM', status: 'Approved' },
  { _id: 'ad-2', date: '2026-10-15', student: 'Ayesha Fatima', admNo: 'PRC-082', amount: 20000, method: 'Cash Counter', receipt: 'REC-202610-002', approvedBy: 'Chief Cashier', approvalDate: '15 Oct 2026, 10:15 AM', status: 'Approved' },
  { _id: 'ad-3', date: '2026-10-14', student: 'Hamza Farooq', admNo: 'PRC-084', amount: 10000, method: 'Online Banking (MCB)', receipt: 'REC-202610-003', approvedBy: 'Accounts Officer (M. Bilal)', approvalDate: '14 Oct 2026, 04:45 PM', status: 'Approved' },
  { _id: 'ad-4', date: '2026-10-14', student: 'Zainab Bibi', admNo: 'PRC-083', amount: 8500, method: 'JazzCash Wallet', receipt: 'REC-202610-004', approvedBy: 'Admin (M. Imran)', approvalDate: '14 Oct 2026, 02:20 PM', status: 'Approved' },
  { _id: 'ad-5', date: '2026-10-13', student: 'Bilal Hussain', admNo: 'PRC-086', amount: 25000, method: 'Bank Transfer (Allied)', receipt: 'REC-202610-005', approvedBy: 'Chief Cashier', approvalDate: '13 Oct 2026, 01:10 PM', status: 'Approved' },
  { _id: 'ad-6', date: '2026-10-13', student: 'Fatima Noor', admNo: 'PRC-085', amount: 12000, method: 'Cash Counter', receipt: 'REC-202610-006', approvedBy: 'Accounts Officer (M. Bilal)', approvalDate: '13 Oct 2026, 11:00 AM', status: 'Approved' },
  { _id: 'ad-7', date: '2026-10-12', student: 'Saad Ur Rehman', admNo: 'PRC-087', amount: 18000, method: 'EasyPaisa Merchant', receipt: 'REC-202610-007', approvedBy: 'Admin (M. Imran)', approvalDate: '12 Oct 2026, 03:30 PM', status: 'Approved' },
  { _id: 'ad-8', date: '2026-10-12', student: 'Mariam Zahra', admNo: 'PRC-088', amount: 9000, method: 'Cash Counter', receipt: 'REC-202610-008', approvedBy: 'Chief Cashier', approvalDate: '12 Oct 2026, 09:40 AM', status: 'Approved' },
];

const fmt = (n) => 'PKR ' + n.toLocaleString('en-PK');

export default function ApproveDepositPage() {
  const [records, setRecords] = useState(DEMO_APPROVED);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    api.get('/wallet/deposit?status=approved').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setRecords(res.data);
      }
    }).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return records.filter(r => {
      const matchSearch = !search || 
        r.student.toLowerCase().includes(search.toLowerCase()) ||
        r.admNo.toLowerCase().includes(search.toLowerCase()) ||
        r.receipt.toLowerCase().includes(search.toLowerCase());
      const matchDate = !dateFilter || r.date === dateFilter;
      return matchSearch && matchDate;
    });
  }, [records, search, dateFilter]);

  const totalApprovedAmount = filtered.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            Approved Student Deposits Ledger
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Permanent audit record of verified wallet credit top-ups • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/accounts/wallet" className="hover:text-zinc-600">Wallet</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Approved Deposits</span>
        </div>
      </div>

      {/* KPI Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Verified Deposits</span>
            <div className="text-xl font-black text-zinc-900">{filtered.length} Approved</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Credited Value</span>
            <div className="text-xl font-black text-emerald-600 font-mono">{fmt(totalApprovedAmount)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Average Top-Up</span>
            <div className="text-xl font-black text-purple-700 font-mono">
              {filtered.length > 0 ? fmt(Math.round(totalApprovedAmount / filtered.length)) : 'PKR 0'}
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                placeholder="Search student or receipt..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="pl-8 bg-white border-zinc-200 text-xs h-9" 
              />
            </div>
            <Input 
              type="date" 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)} 
              className="w-40 bg-white border-zinc-200 text-xs h-9" 
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
              <Printer className="w-3.5 h-3.5 mr-1" /> Print Ledger
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
              <tr>
                <th className="p-3 w-10">#</th>
                <th className="p-3">Deposit Date</th>
                <th className="p-3">Candidate / Guardian</th>
                <th className="p-3">Receipt No</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3 text-right">Amount Credited</th>
                <th className="p-3">Approved By</th>
                <th className="p-3">Approval Timestamp</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length > 0 ? filtered.map((r, i) => (
                <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-zinc-400 font-mono">{i + 1}</td>
                  <td className="p-3 text-zinc-500 font-medium">{r.date}</td>
                  <td className="p-3">
                    <div className="font-extrabold text-zinc-950">{r.student}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{r.admNo}</div>
                  </td>
                  <td className="p-3 font-mono font-bold text-zinc-700">{r.receipt}</td>
                  <td className="p-3 font-medium text-zinc-700">{r.method}</td>
                  <td className="p-3 text-right font-mono font-black text-emerald-600 text-sm">{fmt(r.amount)}</td>
                  <td className="p-3 font-semibold text-zinc-800">{r.approvedBy}</td>
                  <td className="p-3 text-zinc-500 font-mono text-[10.5px]">{r.approvalDate}</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                      {r.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-zinc-500">
                    No approved deposits match your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-zinc-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Showing {filtered.length} verified deposits</span>
          <span className="font-bold text-zinc-700">Pak Royal College Sharaqpur</span>
        </div>
      </div>
    </div>
  );
}
