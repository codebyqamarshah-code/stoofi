'use client';

import { formatDateDMY } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Building, 
  ArrowRightLeft, 
  FileText, 
  PieChart, 
  Plus, 
  CheckCircle2, 
  Wallet,
  ArrowRight,
  Landmark,
  CreditCard,
  Receipt,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const DEMO_ACCOUNTS_SUMMARY = {
  totalIncome: 3456000,
  totalExpense: 1234500,
  netProfit: 2221500,
  bankBalance: 4567890
};

const DEMO_RECENT = [
  { _id: 'tx-1', date: '2026-10-15', head: 'Tuition Fee Collection (Oct)', type: 'Income', method: 'Bank Transfer', amount: 350000, account: 'HBL Main Branch', ref: 'INC-202610-01' },
  { _id: 'tx-2', date: '2026-10-14', head: 'Faculty Salaries (Part-1)', type: 'Expense', method: 'Bank Transfer', amount: -650000, account: 'MCB Sharaqpur', ref: 'EXP-202610-01' },
  { _id: 'tx-3', date: '2026-10-14', head: 'Campus Electricity Bill (LESCO)', type: 'Expense', method: 'Online Banking', amount: -85400, account: 'HBL Main Branch', ref: 'EXP-202610-02' },
  { _id: 'tx-4', date: '2026-10-13', head: 'Registration & Prospectus Fees', type: 'Income', method: 'Cash', amount: 125000, account: 'Cash in Hand', ref: 'INC-202610-02' },
  { _id: 'tx-5', date: '2026-10-12', head: 'Chemistry & Biology Lab Supplies', type: 'Expense', method: 'Cheque', amount: -45000, account: 'Allied Bank', ref: 'EXP-202610-03' },
  { _id: 'tx-6', date: '2026-10-11', head: 'College Bus Diesel / Fuel', type: 'Expense', method: 'Cash', amount: -62000, account: 'Cash in Hand', ref: 'EXP-202610-04' },
];

const fmt = (n) => 'PKR ' + Math.abs(n).toLocaleString('en-PK');

export default function AccountsOverviewPage() {
  const [summary, setSummary] = useState(DEMO_ACCOUNTS_SUMMARY);
  const [recent, setRecent] = useState(DEMO_RECENT);

  useEffect(() => {
    // Attempt to load dynamic accounting summary
    api.get('/income').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const incTotal = res.data.reduce((s, r) => s + (Number(r.amount) || 0), 0);
        setSummary(prev => ({ ...prev, totalIncome: incTotal, netProfit: incTotal - prev.totalExpense }));
      }
    }).catch(() => {});
  }, []);

  const quickLinks = [
    { label: 'Chart of Accounts', href: '/dashboard/accounts/accounts/chart-of-account', icon: Scale, desc: 'Hierarchical ledger tree & codes' },
    { label: 'Bank Accounts', href: '/dashboard/accounts/accounts/bank-account', icon: Landmark, desc: 'Manage institutional bank accounts' },
    { label: 'Income Management', href: '/dashboard/accounts/accounts/income', icon: TrendingUp, desc: 'Record revenue, fees & donations' },
    { label: 'Expense Tracking', href: '/dashboard/accounts/accounts/expense', icon: TrendingDown, desc: 'Vouchers, utilities, vendor bills' },
    { label: 'Fund Transfer', href: '/dashboard/accounts/accounts/fund-transfer', icon: ArrowRightLeft, desc: 'Inter-account liquidity movement' },
    { label: 'Profit & Loss Statement', href: '/dashboard/accounts/accounts/profit-loss', icon: FileText, desc: 'Audit-ready annual P&L statement' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <DollarSign className="h-6 w-6" />
            </span>
            Accounts &amp; Financial Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            General ledger, cash flows, banking, and financial reporting • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Accounts</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Overview</span>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Total Income (YTD)</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{fmt(summary.totalIncome)}</div>
            <span className="text-[10px] text-zinc-500">+14.8% vs last academic year</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Total Expenses (YTD)</span>
            <div className="text-xl font-black text-rose-600 mt-0.5">{fmt(summary.totalExpense)}</div>
            <span className="text-[10px] text-zinc-500">Salaries, utilities, maintenance</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Net Surplus / Profit</span>
            <div className="text-xl font-black text-[#084A86] mt-0.5">{fmt(summary.netProfit)}</div>
            <span className="text-[10px] text-emerald-600 font-bold">Healthy 64.2% operating margin</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#084A86] flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Total Bank Liquidity</span>
            <div className="text-xl font-black text-purple-700 mt-0.5">{fmt(summary.bankBalance)}</div>
            <span className="text-[10px] text-zinc-500">Across 4 institutional accounts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div>
        <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider mb-3">Accounting Operations &amp; Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs hover:border-[#084A86]/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center group-hover:bg-[#084A86] group-hover:text-white transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#084A86] group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <h3 className="font-extrabold text-sm text-zinc-950 group-hover:text-[#084A86] transition-colors">{item.label}</h3>
                <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Ledger Transactions */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Recent General Ledger Postings</h2>
            <p className="text-[11px] text-zinc-500">Latest income and expense vouchers recorded across accounts</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/accounts/accounts/income">
              <Button size="sm" variant="outline" className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                + New Income
              </Button>
            </Link>
            <Link href="/dashboard/accounts/accounts/expense">
              <Button size="sm" variant="outline" className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50">
                + New Expense
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Voucher Ref</th>
                <th className="p-3">Posting Date</th>
                <th className="p-3">Account Head / Particulars</th>
                <th className="p-3">Type</th>
                <th className="p-3">Method</th>
                <th className="p-3">Bank / Account</th>
                <th className="p-3 text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recent.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-zinc-700">{tx.ref}</td>
                  <td className="p-3 text-zinc-500 font-medium">{formatDateDMY(tx.date)}</td>
                  <td className="p-3 font-extrabold text-zinc-950">{tx.head}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      tx.type === 'Income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-600 font-medium">{tx.method}</td>
                  <td className="p-3 font-bold text-zinc-800">{tx.account}</td>
                  <td className={`p-3 text-right font-mono font-black text-sm ${
                    tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {tx.amount >= 0 ? '+' : ''}{fmt(tx.amount)}
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
