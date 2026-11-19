'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  TrendingDown,
  RefreshCw,
  Download,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function ExpenseReportsPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/accountant/reports?type=expenses&month=${month}`);
      if (res?.success) {
        setReportData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month]);

  const handlePrint = () => {
    window.print();
  };

  const totalExpense = reportData?.summary?.totalExpenses || 0;
  const expensesList = reportData?.expenses || [];
  const categoryBreakdown = reportData?.categoryBreakdown || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Institutional Expense Reports
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Category breakdown, monthly consumption metrics, and printable audit reports.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
          />
          <Button
            onClick={handlePrint}
            variant="outline"
            className="h-10 px-4 rounded-xl font-bold border-zinc-300 dark:border-zinc-700"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-rose-600 dark:text-rose-400 tracking-wider">
                Total Expenses for {month}
              </p>
              <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
                Rs. {totalExpense.toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{expensesList.length} vouchers recorded</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                Categories Utilized
              </p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                {categoryBreakdown.length}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Distinct expenditure channels</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                Top Spending Category
              </p>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-1 truncate">
                {categoryBreakdown.length > 0 ? categoryBreakdown[0].name : 'N/A'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Rs. {categoryBreakdown.length > 0 ? categoryBreakdown[0].value.toLocaleString() : '0'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Table */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <CardHeader className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <CardTitle className="text-base font-bold">Category-wise Expenditure Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500">
                <th className="py-3 px-4">Category Head</th>
                <th className="py-3 px-4 text-right">Amount (PKR)</th>
                <th className="py-3 px-4 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {categoryBreakdown.map((cat) => {
                const pct = totalExpense > 0 ? Math.round((cat.value / totalExpense) * 100) : 0;
                return (
                  <tr key={cat.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{cat.name}</td>
                    <td className="py-3 px-4 text-right font-black text-rose-600 dark:text-rose-400">
                      Rs. {cat.value.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-semibold text-zinc-500">
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
