'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  FileSpreadsheet, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  X
} from 'lucide-react';
import api from '@/services/api';
import AccountsNav from '@/components/accounts/AccountsNav';
import { exportToExcel, exportToCSV, formatCurrency } from '@/lib/exportAccounts';

const DATE_PRESETS = [
  { label: 'This Month', value: 'this-month' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this-week' },
  { label: 'Previous Month', value: 'previous-month' },
  { label: 'This Quarter', value: 'this-quarter' },
  { label: 'This Year', value: 'this-year' },
  { label: 'Custom Range', value: 'custom' },
];

export default function ProfitLossPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [dateFilter, setDateFilter] = useState('this-month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  
  // Drilldown modal state
  const [drilldownPeriod, setDrilldownPeriod] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/profit-loss?filter=${dateFilter}`;
      if (dateFilter === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      if (res && res.success) {
        setData(res);
      } else {
        setError(res?.message || 'Failed to calculate Profit & Loss report');
      }
    } catch (err) {
      setError(err?.message || 'Unable to connect to financial server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateFilter]);

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      fetchReport();
    }
  };

  const handleExportExcel = () => {
    if (!data?.monthlyBreakdown) return;
    const rows = data.monthlyBreakdown.map((m, idx) => ({
      SL: idx + 1,
      Period: m.monthName,
      'Total Recognized Income (PKR)': m.income,
      'Total Recognized Expense (PKR)': m.expense,
      'Net Profit / Loss (PKR)': m.net,
      'Status': m.isProfit ? 'PROFIT' : 'LOSS',
      'Transaction Count': m.count,
    }));
    exportToExcel(rows, `Profit_Loss_Report_${dateFilter}`, 'Profit & Loss');
  };

  const handleExportCSV = () => {
    if (!data?.monthlyBreakdown) return;
    const rows = data.monthlyBreakdown.map((m, idx) => ({
      SL: idx + 1,
      Period: m.monthName,
      'Income (PKR)': m.income,
      'Expense (PKR)': m.expense,
      'Net Profit Loss (PKR)': m.net,
      'Status': m.isProfit ? 'PROFIT' : 'LOSS',
      'Count': m.count,
    }));
    exportToCSV(rows, `Profit_Loss_Report_${dateFilter}`);
  };

  const filteredMonths = (data?.monthlyBreakdown || []).filter((m) => {
    if (!search) return true;
    return m.monthName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          nav, header, aside, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .printable-report {
            display: block !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Profit & Loss Statement</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Accrual and recognized cash flow financial reporting for Pak Royal College
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Accounts</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/accounts/accounts/income" className="hover:text-zinc-600 transition-colors">Accounts</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#009966] font-semibold">Profit & Loss</span>
        </div>
      </div>

      {/* Sub-module Navigation */}
      <AccountsNav />

      {/* Filter and Date Controls */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-3 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-500 mr-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Period:
            </span>
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setDateFilter(preset.value)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  dateFilter === preset.value
                    ? 'bg-[#009966] text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#009966] hover:bg-[#008055] rounded-lg transition shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Excel</span>
            </button>
            <button
              onClick={fetchReport}
              disabled={loading}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#009966]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Custom date range selector if chosen */}
        {dateFilter === 'custom' && (
          <form onSubmit={handleCustomDateSubmit} className="pt-3 border-t border-zinc-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-zinc-600">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs border border-zinc-300 rounded-lg px-2.5 py-1.5 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#009966]"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-zinc-600">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs border border-zinc-300 rounded-lg px-2.5 py-1.5 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#009966]"
                required
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#009966] hover:bg-[#008055] rounded-lg transition cursor-pointer"
            >
              Apply Custom Range
            </button>
          </form>
        )}
      </div>

      {/* KPI Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-[#009966]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Recognized Income</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#009966]">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-zinc-950">
              {loading ? (
                <div className="h-7 w-28 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(data?.stats?.totalIncome || 0)
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-700">Fees + Other Income</span>
              <span>recognized in period</span>
            </p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-rose-400/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Recognized Expense</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-zinc-950">
              {loading ? (
                <div className="h-7 w-28 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(data?.stats?.totalExpense || 0)
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Paid operational & administrative costs
            </p>
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div className={`border rounded-xl p-4 shadow-xs transition ${
          data?.stats?.isProfit 
            ? 'bg-emerald-50/40 border-emerald-200' 
            : 'bg-rose-50/40 border-rose-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Net Profit / (Loss)</span>
            <div className={`p-2 rounded-lg ${
              data?.stats?.isProfit ? 'bg-emerald-100 text-[#009966]' : 'bg-rose-100 text-rose-600'
            }`}>
              {data?.stats?.isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black ${
              data?.stats?.isProfit ? 'text-[#009966]' : 'text-rose-600'
            }`}>
              {loading ? (
                <div className="h-7 w-28 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(data?.stats?.netProfitLoss || 0)
              )}
            </div>
            <p className="text-[11px] font-semibold mt-1">
              {data?.stats?.isProfit ? (
                <span className="text-emerald-700">Surplus ({data?.stats?.marginPercent}% margin)</span>
              ) : (
                <span className="text-rose-700">Deficit position</span>
              )}
            </p>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-zinc-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Activity Volume</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-zinc-950">
              {loading ? (
                <div className="h-7 w-16 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                data?.stats?.totalTransactions || 0
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Verified financial transactions
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown Sections (Income & Expense distributions) */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
          {/* Income Breakdown */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#009966]"></span>
                Income Sources Breakdown
              </h3>
              <span className="text-xs font-bold text-[#009966]">
                {formatCurrency(data.stats.totalIncome)}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {Object.keys(data.incomeByCategory || {}).length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">No income records in selected period</p>
              ) : (
                Object.entries(data.incomeByCategory).map(([cat, amt]) => {
                  const pct = data.stats.totalIncome > 0 ? Math.round((amt / data.stats.totalIncome) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-700">{cat}</span>
                        <span className="font-bold text-zinc-900">{formatCurrency(amt)} <span className="text-zinc-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#009966] h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                Expense Categories Breakdown
              </h3>
              <span className="text-xs font-bold text-rose-600">
                {formatCurrency(data.stats.totalExpense)}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {Object.keys(data.expenseByCategory || {}).length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">No expense records in selected period</p>
              ) : (
                Object.entries(data.expenseByCategory).map(([cat, amt]) => {
                  const pct = data.stats.totalExpense > 0 ? Math.round((amt / data.stats.totalExpense) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-700">{cat}</span>
                        <span className="font-bold text-zinc-900">{formatCurrency(amt)} <span className="text-zinc-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Profit & Loss Statement Table */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden printable-report">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Monthly Profit & Loss Trajectory</h2>
            <p className="text-xs text-zinc-500">Breakdown of revenues, direct expenses, and surplus / deficit by accounting period</p>
          </div>
          <div className="relative w-full sm:w-64 no-print">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input 
              placeholder="Search period or month..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-950 focus:outline-none focus:ring-1 focus:ring-[#009966]" 
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchReport} className="underline font-bold hover:text-rose-900 cursor-pointer">Retry</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-700 uppercase font-bold border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">SL</th>
                <th className="px-4 py-3">Reporting Period</th>
                <th className="px-4 py-3 text-right">Recognized Income</th>
                <th className="px-4 py-3 text-right">Recognized Expense</th>
                <th className="px-4 py-3 text-right">Net Profit / (Loss)</th>
                <th className="px-4 py-3 text-center">Transactions</th>
                <th className="px-4 py-3 text-center no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-4 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-zinc-200 rounded ml-auto"></div></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-zinc-200 rounded ml-auto"></div></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-zinc-200 rounded ml-auto"></div></td>
                    <td className="px-4 py-4"><div className="h-4 w-12 bg-zinc-200 rounded mx-auto"></div></td>
                    <td className="px-4 py-4 no-print"><div className="h-6 w-16 bg-zinc-200 rounded mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredMonths.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <TrendingUp className="h-8 w-8 text-zinc-300" />
                      <p className="font-semibold text-zinc-700">No Accounting Records Found</p>
                      <p className="text-zinc-400 max-w-sm text-[11px]">
                        There are no recognized income or expense transactions in this date range. Try selecting "This Year" or adding new transactions.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMonths.map((row, idx) => (
                  <tr key={row.period || idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-zinc-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-zinc-900">{row.monthName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#009966]">
                      {formatCurrency(row.income)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-rose-600">
                      {formatCurrency(row.expense)}
                    </td>
                    <td className="px-4 py-3 text-right font-black">
                      <span className={`inline-block px-2 py-0.5 rounded ${
                        row.isProfit 
                          ? 'bg-emerald-50 text-[#009966]' 
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        {formatCurrency(row.net)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-600 font-medium">
                      {row.count} entries
                    </td>
                    <td className="px-4 py-3 text-center no-print">
                      <button
                        onClick={() => setDrilldownPeriod(row)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
                        title="Inspect breakdown"
                      >
                        <Eye className="h-3 w-3 text-zinc-500" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Summary Footer */}
            {data?.stats && (
              <tfoot className="bg-zinc-50 font-bold border-t-2 border-zinc-200">
                <tr>
                  <td colSpan="2" className="px-4 py-3 text-zinc-900 uppercase">Grand Totals</td>
                  <td className="px-4 py-3 text-right text-[#009966] font-black text-sm">
                    {formatCurrency(data.stats.totalIncome)}
                  </td>
                  <td className="px-4 py-3 text-right text-rose-600 font-black text-sm">
                    {formatCurrency(data.stats.totalExpense)}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-sm">
                    <span className={data.stats.isProfit ? 'text-[#009966]' : 'text-rose-600'}>
                      {formatCurrency(data.stats.netProfitLoss)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-700">
                    {data.stats.totalTransactions}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Drilldown Modal: Inspect specific month transactions */}
      {drilldownPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  {drilldownPeriod.monthName} — Financial Breakdown
                </h3>
                <p className="text-xs text-zinc-500">Summary of revenue and expenses for this period</p>
              </div>
              <button 
                onClick={() => setDrilldownPeriod(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Recognized Income</span>
                <p className="text-lg font-black text-[#009966]">{formatCurrency(drilldownPeriod.income)}</p>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Recognized Expense</span>
                <p className="text-lg font-black text-rose-600">{formatCurrency(drilldownPeriod.expense)}</p>
              </div>
              <div className={`p-3 rounded-xl border ${drilldownPeriod.isProfit ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <span className="text-[10px] font-bold text-zinc-700 uppercase">Net Result</span>
                <p className={`text-lg font-black ${drilldownPeriod.isProfit ? 'text-[#009966]' : 'text-rose-600'}`}>
                  {formatCurrency(drilldownPeriod.net)}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Link
                href="/dashboard/accounts/accounts/income"
                className="px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg"
              >
                Go to Incomes
              </Link>
              <Link
                href="/dashboard/accounts/accounts/expense"
                className="px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg"
              >
                Go to Expenses
              </Link>
              <button
                onClick={() => setDrilldownPeriod(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#009966] hover:bg-[#008055] rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
