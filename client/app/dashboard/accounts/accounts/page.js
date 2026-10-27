'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  FileText, 
  Plus, 
  ArrowRight,
  Landmark,
  CreditCard,
  Scale,
  Building2,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import api from '@/services/api';
import AccountsNav from '@/components/accounts/AccountsNav';
import { formatCurrency } from '@/lib/exportAccounts';

export default function AccountsOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    bankBalance: 0,
    isProfit: true,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [plRes, bankRes, incRes, expRes] = await Promise.all([
        api.get('/profit-loss?filter=this-year'),
        api.get('/bank-account'),
        api.get('/income?limit=5'),
        api.get('/expense?limit=5'),
      ]);

      const incomeRecognized = plRes?.stats?.totalIncome || 0;
      const expenseRecognized = plRes?.stats?.totalExpense || 0;
      const net = plRes?.stats?.netProfitLoss || (incomeRecognized - expenseRecognized);
      const combinedBank = bankRes?.stats?.combinedBalance || 0;

      setStats({
        totalIncome: incomeRecognized,
        totalExpense: expenseRecognized,
        netProfit: net,
        bankBalance: combinedBank,
        isProfit: plRes?.stats?.isProfit ?? (net >= 0),
      });

      // Merge recent incomes and expenses
      const incomes = (incRes?.data || []).map((i) => ({
        _id: i._id,
        date: i.date,
        head: i.title,
        type: 'Income',
        method: i.paymentMethod || 'Cash',
        amount: i.amount,
        account: i.bankAccountName || 'Cash / Bank',
        ref: i.receiptNo || 'INC',
      }));

      const expenses = (expRes?.data || []).map((e) => ({
        _id: e._id,
        date: e.date,
        head: e.title,
        type: 'Expense',
        method: e.paymentMethod || 'Cash',
        amount: -e.amount,
        account: e.bankAccountName || 'Cash / Bank',
        ref: e.voucherNo || 'EXP',
      }));

      const combined = [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
      setRecentTransactions(combined);
    } catch (err) {
      console.error('Failed to load accounts overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const quickLinks = [
    { label: 'Chart of Accounts', href: '/dashboard/accounts/accounts/chart-of-account', icon: BookOpen, desc: 'Ledger hierarchy, classifications & codes' },
    { label: 'Bank Accounts', href: '/dashboard/accounts/accounts/bank-account', icon: Landmark, desc: 'Manage banks, petty cash & live balances' },
    { label: 'Income Management', href: '/dashboard/accounts/accounts/income', icon: TrendingUp, desc: 'Record revenue, fees & generate receipts' },
    { label: 'Expense Tracking', href: '/dashboard/accounts/accounts/expense', icon: TrendingDown, desc: 'Payment vouchers, utilities, payroll' },
    { label: 'Fund Transfer', href: '/dashboard/accounts/accounts/fund-transfer', icon: ArrowRightLeft, desc: 'Inter-account liquidity & balancing' },
    { label: 'Profit & Loss Statement', href: '/dashboard/accounts/accounts/profit-loss', icon: FileText, desc: 'Audit-ready annual & monthly P&L statement' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#009966]">
              <DollarSign className="h-6 w-6" />
            </span>
            Accounts & Financial Management
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            General ledger, cash flows, banking, and financial reporting • Pak Royal College
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#009966] font-semibold">Accounts Overview</span>
        </div>
      </div>

      {/* Sub-module Navigation */}
      <AccountsNav />

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center justify-between hover:border-[#009966]/40 transition">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Total Recognized Income</span>
            <div className="text-xl font-black text-[#009966] mt-0.5">
              {loading ? (
                <div className="h-6 w-24 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats.totalIncome)
              )}
            </div>
            <span className="text-[10px] text-zinc-500">Student fees & other revenues</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009966] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center justify-between hover:border-rose-300 transition">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Total Recognized Expenses</span>
            <div className="text-xl font-black text-rose-600 mt-0.5">
              {loading ? (
                <div className="h-6 w-24 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats.totalExpense)
              )}
            </div>
            <span className="text-[10px] text-zinc-500">Salaries, utilities, maintenance</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center justify-between hover:border-zinc-300 transition">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Net Surplus / (Deficit)</span>
            <div className={`text-xl font-black mt-0.5 ${stats.isProfit ? 'text-[#009966]' : 'text-rose-600'}`}>
              {loading ? (
                <div className="h-6 w-24 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats.netProfit)
              )}
            </div>
            <span className="text-[10px] text-zinc-500">Operating result for current period</span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            stats.isProfit ? 'bg-emerald-50 text-[#009966]' : 'bg-rose-50 text-rose-600'
          }`}>
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center justify-between hover:border-zinc-300 transition">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Total Treasury Liquidity</span>
            <div className="text-xl font-black text-zinc-950 mt-0.5">
              {loading ? (
                <div className="h-6 w-24 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats.bankBalance)
              )}
            </div>
            <span className="text-[10px] text-zinc-500">Combined bank & cash registers</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div>
        <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3">Accounting Operations & Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs hover:border-[#009966]/50 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center group-hover:bg-[#009966] group-hover:text-white transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#009966] group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-sm text-zinc-950 group-hover:text-[#009966] transition-colors">{item.label}</h3>
                <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Ledger Transactions */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Recent General Ledger Postings</h2>
            <p className="text-[11px] text-zinc-500">Latest income and expense vouchers recorded across accounts</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/accounts/accounts/income"
              className="px-3 py-1.5 text-xs font-semibold text-[#009966] bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
            >
              + Record Income
            </Link>
            <Link
              href="/dashboard/accounts/accounts/expense"
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
            >
              + Record Expense
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 font-bold uppercase text-zinc-600 tracking-wider text-[10px]">
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
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-3"><div className="h-4 w-20 bg-zinc-200 rounded"></div></td>
                    <td className="p-3"><div className="h-4 w-16 bg-zinc-200 rounded"></div></td>
                    <td className="p-3"><div className="h-4 w-36 bg-zinc-200 rounded"></div></td>
                    <td className="p-3"><div className="h-4 w-14 bg-zinc-200 rounded"></div></td>
                    <td className="p-3"><div className="h-4 w-16 bg-zinc-200 rounded"></div></td>
                    <td className="p-3"><div className="h-4 w-24 bg-zinc-200 rounded"></div></td>
                    <td className="p-3"><div className="h-4 w-20 bg-zinc-200 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-zinc-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-zinc-700">{tx.ref}</td>
                    <td className="p-3 text-zinc-500 font-medium">
                      {tx.date ? new Date(tx.date).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="p-3 font-semibold text-zinc-950">{tx.head}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.type === 'Income' ? 'bg-emerald-50 text-[#009966]' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-600 font-medium">{tx.method}</td>
                    <td className="p-3 font-medium text-zinc-800">{tx.account}</td>
                    <td className={`p-3 text-right font-black ${
                      tx.amount >= 0 ? 'text-[#009966]' : 'text-rose-600'
                    }`}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
