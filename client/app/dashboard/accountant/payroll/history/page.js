'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  RotateCcw,
  Search,
  Filter,
  Printer,
  Calendar,
  CheckCircle,
  Banknote,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function SalaryHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payroll');
      if (res?.success && Array.isArray(res.data)) {
        setHistory(res.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = history.filter(h => {
    const q = search.toLowerCase();
    const name = (h.staffName || '').toLowerCase();
    const id = (h.staffId || '').toLowerCase();
    const month = (h.month || '').toLowerCase();
    return name.includes(q) || id.includes(q) || month.includes(q);
  });

  const totalDisbursed = filtered.reduce((sum, h) => sum + (Number(h.netSalary ?? h.amount) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Payroll Payment History
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Complete historical disbursement ledger of all staff and teacher salary settlements.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="h-10 px-4 rounded-xl font-bold border-zinc-300 dark:border-zinc-700"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print History
          </Button>
          <Button
            onClick={fetchHistory}
            variant="outline"
            className="h-10 w-10 p-0 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Card */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
              Total Salary Disbursed (All Time)
            </p>
            <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
              Rs. {totalDisbursed.toLocaleString()}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{filtered.length} verified salary transactions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
            <Banknote className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search history by staff name, ID, or month..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Salary Month</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Net Salary</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                      Loading history...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-zinc-400">
                      No payroll records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((h) => (
                    <tr key={h._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3.5 px-4 text-xs font-semibold text-zinc-500">
                        {h.paymentDate ? new Date(h.paymentDate).toLocaleDateString() : new Date(h.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{h.staffName}</div>
                        <div className="text-xs text-zinc-400 font-mono">ID: {h.staffId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        {h.role}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {h.month}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-600">
                        {h.paymentMethod || 'Bank Transfer'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        Rs. {(Number(h.netSalary ?? h.amount) || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {h.status || 'Paid'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
