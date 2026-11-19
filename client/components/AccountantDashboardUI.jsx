'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  Clock,
  Wallet,
  Users,
  Printer,
  ChevronRight,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  FileText,
  ShieldCheck,
  Search,
  Download,
  CheckCircle2,
  PieChart as PieIcon,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import api from '@/services/api';

export default function AccountantDashboardUI({ user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [range, setRange] = useState('month'); // 'today' | 'week' | 'month' | 'year' | 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('Rs. ');

  const fetchStats = async () => {
    try {
      setLoading(true);
      let query = `?range=${range}`;
      if (range === 'custom' && customStart && customEnd) {
        query += `&startDate=${customStart}&endDate=${customEnd}`;
      }
      const res = await api.get(`/accountant/stats${query}`);
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load accountant stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [range]);

  const summary = data?.summary || {
    totalFeeCollection: 0,
    todayCollection: 0,
    monthlyCollection: 0,
    pendingFees: 0,
    overdueFees: 0,
    totalExpenses: 0,
    staffSalaryPaid: 0,
    netIncome: 0,
    studentsCount: 0,
    staffCount: 0
  };

  const chartData = data?.charts?.monthly || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={16} /> Finance & Accounts Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-1">
            Accountant Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Welcome back, <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user?.fullName || 'Accounts Officer'}</span>. Here is your institutional financial summary.
          </p>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'year', label: 'This Year' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  range === r.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchStats}
            disabled={loading}
            className="h-9 gap-1.5 border-zinc-200 dark:border-zinc-800 text-xs font-bold"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 8 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Fee Collection */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Fee Collection</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-zinc-950 dark:text-white">
                {currencySymbol}{summary.totalFeeCollection.toLocaleString()}
              </div>
              <p className="text-[11px] font-medium text-zinc-500 mt-1">Cumulative student collections</p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Today's Collection */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Today&apos;s Collection</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Calendar size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {currencySymbol}{summary.todayCollection.toLocaleString()}
              </div>
              <p className="text-[11px] font-medium text-zinc-500 mt-1">Received today across all channels</p>
            </div>
          </CardContent>
        </Card>

        {/* 3. Monthly Collection */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Monthly Collection</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-zinc-950 dark:text-white">
                {currencySymbol}{summary.monthlyCollection.toLocaleString()}
              </div>
              <p className="text-[11px] font-medium text-zinc-500 mt-1">Current calendar month cycle</p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Pending Fees */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pending Fees</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {currencySymbol}{summary.pendingFees.toLocaleString()}
              </div>
              <p className="text-[11px] font-medium text-zinc-500 mt-1">Outstanding student balance</p>
            </div>
          </CardContent>
        </Card>

        {/* 5. Overdue Fees */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Overdue Fees</span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {currencySymbol}{summary.overdueFees.toLocaleString()}
              </div>
              <p className="text-[11px] font-medium text-zinc-500 mt-1">Passed invoice due date</p>
            </div>
          </CardContent>
        </Card>

        {/* 6. Total Expenses */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Expenses</span>
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <TrendingDown size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-zinc-950 dark:text-white">
                {currencySymbol}{summary.totalExpenses.toLocaleString()}
              </div>
              <p className="text-[11px] font-medium text-zinc-500 mt-1">Operating costs in selected range</p>
            </div>
          </CardContent>
        </Card>

        {/* 7. Staff Salary Paid */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Staff Salary Paid</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Wallet size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-zinc-950 dark:text-white">
                {currencySymbol}{summary.staffSalaryPaid.toLocaleString()}
              </div>
              <p className="text-[11px] font-medium text-zinc-500 mt-1">Disbursed payroll amount</p>
            </div>
          </CardContent>
        </Card>

        {/* 8. Net Income */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Net Profit / Balance</span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-2xl font-black ${summary.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {currencySymbol}{summary.netIncome.toLocaleString()}
              </div>
              <p className="text-[11px] font-medium text-zinc-500 mt-1">Collections minus expenses & payroll</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5 Real Working Quick Action Shortcuts */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Finance Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => router.push('/dashboard/accountant/fees/collect')}
            className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2"
          >
            <Plus size={16} /> Collect Student Fee
          </Button>

          <Button
            onClick={() => router.push('/dashboard/accountant/expenses/add')}
            variant="outline"
            className="h-10 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-zinc-50"
          >
            <Plus size={16} /> Add Institutional Expense
          </Button>

          <Button
            onClick={() => router.push('/dashboard/accountant/payroll/process')}
            variant="outline"
            className="h-10 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-zinc-50"
          >
            <Wallet size={16} /> Process Staff Salary
          </Button>

          <Button
            onClick={() => router.push('/dashboard/accountant/fees/vouchers')}
            variant="outline"
            className="h-10 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-zinc-50"
          >
            <Printer size={16} /> Generate Fee Vouchers
          </Button>

          <Button
            onClick={() => router.push('/dashboard/accountant/reports/daily')}
            variant="outline"
            className="h-10 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-zinc-50"
          >
            <FileText size={16} /> View Financial Reports
          </Button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection Chart */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-zinc-950 dark:text-white flex items-center justify-between">
              <span>Annual Collection Overview</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Year {new Date().getFullYear()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
                  <Tooltip
                    formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, 'Collection']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontWeight: 600 }}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Fee Collection" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Income vs Expenses Chart */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-zinc-950 dark:text-white flex items-center justify-between">
              <span>Income vs Expenses Trajectory</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">
                Net Trajectory
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="accIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="accExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
                  <Tooltip
                    formatter={(value, name) => [`${currencySymbol}${value.toLocaleString()}`, name === 'income' ? 'Income' : 'Expense']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#accIncome)" strokeWidth={2} name="income" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#accExpense)" strokeWidth={2} name="expense" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fee Payments */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs overflow-hidden">
          <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Recent Fee Collections
            </CardTitle>
            <Link href="/dashboard/accountant/fees/history" className="text-xs font-bold text-emerald-600 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(!data?.recentPayments || data.recentPayments.length === 0) ? (
                <div className="p-8 text-center text-xs text-zinc-500 font-medium">No fee payments recorded yet.</div>
              ) : (
                data.recentPayments.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <div>
                      <div className="font-bold text-sm text-zinc-900 dark:text-white">{item.studentName}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span>{item.className}</span>
                        <span>•</span>
                        <span>{item.invoiceNo}</span>
                        <span>•</span>
                        <span className="capitalize">{item.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        +{currencySymbol}{item.amount.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {new Date(item.date).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Institutional Expenses */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs overflow-hidden">
          <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <TrendingDown size={16} className="text-orange-500" /> Recent Expenses
            </CardTitle>
            <Link href="/dashboard/accountant/expenses" className="text-xs font-bold text-emerald-600 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(!data?.recentExpenses || data.recentExpenses.length === 0) ? (
                <div className="p-8 text-center text-xs text-zinc-500 font-medium">No expenses logged yet.</div>
              ) : (
                data.recentExpenses.map((exp) => (
                  <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <div>
                      <div className="font-bold text-sm text-zinc-900 dark:text-white">{exp.title}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span>{exp.category}</span>
                        <span>•</span>
                        <span>{exp.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-rose-600 dark:text-rose-400">
                        -{currencySymbol}{Number(exp.amount).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {new Date(exp.date).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
