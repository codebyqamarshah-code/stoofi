'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer,
  Download,
  Calendar,
  Filter,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function AccountantReportTemplate({
  title,
  subtitle,
  reportType, // 'daily' | 'weekly' | 'monthly' | 'annual' | 'income' | 'expenses' | 'profit-loss' | 'outstanding' | 'student-payments' | 'salary'
  defaultPeriodType = 'month' // 'date' | 'month' | 'year' | 'range'
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [dateParam, setDateParam] = useState(new Date().toISOString().slice(0, 10));
  const [monthParam, setMonthParam] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [yearParam, setYearParam] = useState(String(new Date().getFullYear()));

  const fetchReport = async () => {
    try {
      setLoading(true);
      let query = `?type=${reportType}`;
      if (defaultPeriodType === 'date') query += `&startDate=${dateParam}`;
      if (defaultPeriodType === 'month') query += `&month=${monthParam}`;
      if (defaultPeriodType === 'year') query += `&year=${yearParam}`;

      const res = await api.get(`/accountant/reports${query}`);
      if (res?.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateParam, monthParam, yearParam]);

  const handlePrint = () => {
    window.print();
  };

  const summary = data?.summary || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/accountant/reports')}
            className="h-10 w-10 p-0 rounded-xl print:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-zinc-500">{subtitle}</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap print:hidden">
          {defaultPeriodType === 'date' && (
            <input
              type="date"
              value={dateParam}
              onChange={(e) => setDateParam(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
            />
          )}

          {defaultPeriodType === 'month' && (
            <input
              type="month"
              value={monthParam}
              onChange={(e) => setMonthParam(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
            />
          )}

          {defaultPeriodType === 'year' && (
            <select
              value={yearParam}
              onChange={(e) => setYearParam(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}

          <Button
            onClick={handlePrint}
            className="h-10 px-4 rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Printable Institutional Header */}
      <div className="hidden print:block border-b-2 border-zinc-900 pb-4 text-center mb-6">
        <h2 className="text-2xl font-black uppercase">Stoofi School & College Management ERP</h2>
        <p className="text-sm text-zinc-600 font-semibold">{title} • Official Accounts Statement</p>
        <p className="text-xs text-zinc-400 mt-1">Generated: {new Date().toLocaleString()} | Verified by Accounts Department</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs uppercase font-extrabold text-emerald-600 tracking-wider">Fee Collections</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              Rs. {(Number(summary.totalFeeCollection) || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs uppercase font-extrabold text-rose-600 tracking-wider">Total Expenses</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              Rs. {(Number(summary.totalExpenses) || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs uppercase font-extrabold text-blue-600 tracking-wider">Staff Salaries</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              Rs. {(Number(summary.totalSalaryPaid) || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">Net Position</span>
            <div className={`text-2xl font-black mt-1 ${
              (summary.netIncome || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              Rs. {(Number(summary.netIncome) || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      {/* 1. Collections Table */}
      {(reportType === 'daily' || reportType === 'weekly' || reportType === 'monthly' || reportType === 'annual' || reportType === 'income' || reportType === 'student-payments') && (
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
            <CardTitle className="text-base font-bold">Inflows & Collections ({data?.collections?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loading ? (
                    <tr><td colSpan="5" className="py-8 text-center text-zinc-400">Loading records...</td></tr>
                  ) : (data?.collections || []).length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-zinc-400">No collections for this period.</td></tr>
                  ) : (
                    data.collections.map((c, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="py-3 px-4 text-xs text-zinc-500">{new Date(c.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{c.name}</td>
                        <td className="py-3 px-4 font-mono text-xs text-zinc-500">{c.reference}</td>
                        <td className="py-3 px-4 text-xs font-semibold">{c.method}</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600">Rs. {c.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Expenses Table */}
      {(reportType === 'expenses' || reportType === 'profit-loss' || reportType === 'annual' || reportType === 'monthly') && (
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
            <CardTitle className="text-base font-bold">Operational Expenses ({data?.expenses?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loading ? (
                    <tr><td colSpan="5" className="py-8 text-center text-zinc-400">Loading records...</td></tr>
                  ) : (data?.expenses || []).length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-zinc-400">No expenses recorded for this period.</td></tr>
                  ) : (
                    data.expenses.map((e, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="py-3 px-4 text-xs text-zinc-500">{new Date(e.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{e.title}</td>
                        <td className="py-3 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">{e.category}</td>
                        <td className="py-3 px-4 text-xs text-zinc-500">{e.vendor}</td>
                        <td className="py-3 px-4 text-right font-black text-rose-600">Rs. {e.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Salary Table */}
      {(reportType === 'salary' || reportType === 'profit-loss' || reportType === 'monthly' || reportType === 'annual') && (
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
            <CardTitle className="text-base font-bold">Staff Salary Disbursements ({data?.salaries?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loading ? (
                    <tr><td colSpan="5" className="py-8 text-center text-zinc-400">Loading records...</td></tr>
                  ) : (data?.salaries || []).length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-zinc-400">No salary records for this period.</td></tr>
                  ) : (
                    data.salaries.map((s, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="py-3 px-4 text-xs text-zinc-500">{new Date(s.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{s.name}</td>
                        <td className="py-3 px-4 text-xs font-semibold">{s.month}</td>
                        <td className="py-3 px-4 text-xs text-zinc-500">{s.method}</td>
                        <td className="py-3 px-4 text-right font-black text-blue-600">Rs. {s.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Outstanding Fees Table */}
      {reportType === 'outstanding' && (
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
            <CardTitle className="text-base font-bold">Outstanding Student Balances ({data?.outstanding?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500">
                    <th className="py-3 px-4">Challan / Inv</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-right">Invoiced</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Remaining Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {(data?.outstanding || []).map((o, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3 px-4 font-mono text-xs">{o.invoiceNo}</td>
                      <td className="py-3 px-4 font-bold">{o.studentName}</td>
                      <td className="py-3 px-4 text-zinc-600">{o.className}</td>
                      <td className="py-3 px-4 text-right">Rs. {o.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-emerald-600">Rs. {o.paidAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-black text-rose-600">Rs. {o.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
