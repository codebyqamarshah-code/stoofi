'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Wallet, TrendingUp, TrendingDown, Users, Clock, 
  ArrowUpRight, ArrowDownRight, CreditCard, RefreshCw, Plus,
  CheckCircle2, AlertCircle, DollarSign, Eye, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const DEMO_STATS = { totalBalance: 1245890, activeWallets: 342, pendingDeposits: 18, todayTxns: 47 };

const DEMO_RECENT = [
  { _id: 't1', date: '2026-10-15', student: 'Muhammad Abdullah', admNo: 'PRC-081', type: 'Deposit', amount: 15000, balance: 45000, status: 'Completed' },
  { _id: 't2', date: '2026-10-15', student: 'Ayesha Fatima', admNo: 'PRC-082', type: 'Fee Payment', amount: -12000, balance: 18000, status: 'Completed' },
  { _id: 't3', date: '2026-10-15', student: 'Hamza Farooq', admNo: 'PRC-084', type: 'Deposit', amount: 20000, balance: 32000, status: 'Completed' },
  { _id: 't4', date: '2026-10-14', student: 'Zainab Bibi', admNo: 'PRC-083', type: 'Refund', amount: -5000, balance: 7500, status: 'Completed' },
  { _id: 't5', date: '2026-10-14', student: 'Bilal Hussain', admNo: 'PRC-086', type: 'Deposit', amount: 10000, balance: 22000, status: 'Pending' },
  { _id: 't6', date: '2026-10-14', student: 'Fatima Noor', admNo: 'PRC-085', type: 'Fee Payment', amount: -8500, balance: 11500, status: 'Completed' },
  { _id: 't7', date: '2026-10-13', student: 'Saad Ur Rehman', admNo: 'PRC-087', type: 'Deposit', amount: 25000, balance: 55000, status: 'Completed' },
  { _id: 't8', date: '2026-10-13', student: 'Mariam Zahra', admNo: 'PRC-088', type: 'Withdrawal', amount: -3000, balance: 9000, status: 'Completed' },
];

const fmt = (n) => 'PKR ' + Math.abs(n).toLocaleString('en-PK');

export default function WalletDashboardPage() {
  const [stats, setStats] = useState(DEMO_STATS);
  const [recent, setRecent] = useState(DEMO_RECENT);

  useEffect(() => {
    api.get('/wallet/summary').then(res => {
      if (res?.success && res.data) setStats(res.data);
    }).catch(() => {});
    api.get('/wallet/transaction?limit=8').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) setRecent(res.data);
    }).catch(() => {});
  }, []);

  const kpis = [
    { label: 'Total Wallet Balance', value: fmt(stats.totalBalance), icon: Wallet, color: 'text-[#084A86]', bg: 'bg-sky-50', trend: '+12.4% this month' },
    { label: 'Active Wallets', value: stats.activeWallets, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '342 students' },
    { label: 'Pending Deposits', value: stats.pendingDeposits, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Requires approval' },
    { label: "Today's Transactions", value: stats.todayTxns, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Credits + Debits' },
  ];

  const quickLinks = [
    { label: 'All Transactions', href: '/dashboard/accounts/wallet/transactions', icon: CreditCard },
    { label: 'Pending Deposits', href: '/dashboard/accounts/wallet/pending-deposit', icon: Clock },
    { label: 'Approved Deposits', href: '/dashboard/accounts/wallet/approve-deposit', icon: CheckCircle2 },
    { label: 'Rejected Deposits', href: '/dashboard/accounts/wallet/reject-deposit', icon: AlertCircle },
    { label: 'Refund Requests', href: '/dashboard/accounts/wallet/refund-request', icon: RefreshCw },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]"><Wallet className="h-6 w-6" /></span>
            Wallet Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Student wallet overview &amp; financial control panel • Pak Royal College Sharaqpur</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/accounts" className="hover:text-zinc-600">Accounts</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Wallet</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">{k.label}</span>
              <div className="text-xl font-black text-zinc-900 mt-0.5">{k.value}</div>
              <span className="text-[10px] text-zinc-500">{k.trend}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center`}>
              <k.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {quickLinks.map((ql, i) => (
          <Link key={i} href={ql.href} className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-xs hover:border-[#084A86]/30 hover:shadow-md transition-all group flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#084A86]/10 text-[#084A86] flex items-center justify-center group-hover:bg-[#084A86] group-hover:text-white transition-colors">
              <ql.icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-zinc-700 group-hover:text-[#084A86]">{ql.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex items-center justify-between">
          <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Recent Wallet Transactions</h2>
          <Link href="/dashboard/accounts/wallet/transactions" className="text-xs font-bold text-[#084A86] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Student</th>
                <th className="p-3">Adm No</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recent.map(t => (
                <tr key={t._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-zinc-500">{t.date}</td>
                  <td className="p-3 font-bold text-zinc-900">{t.student}</td>
                  <td className="p-3 font-mono text-zinc-600">{t.admNo}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.type === 'Deposit' ? 'bg-emerald-100 text-emerald-800' :
                      t.type === 'Fee Payment' ? 'bg-sky-100 text-[#084A86]' :
                      t.type === 'Refund' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>{t.type}</span>
                  </td>
                  <td className={`p-3 text-right font-bold font-mono ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.amount >= 0 ? '+' : ''}{fmt(t.amount)}
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-zinc-700">{fmt(t.balance)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>{t.status}</span>
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
