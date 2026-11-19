'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  RotateCcw,
  Search,
  Filter,
  Printer,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function FeeHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accountant/transactions?type=FEE&limit=300');
      if (res?.success && Array.isArray(res.data)) {
        setHistory(res.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to load fee payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(h => {
    const q = search.toLowerCase();
    const matchSearch =
      (h.name && h.name.toLowerCase().includes(q)) ||
      (h.reference && h.reference.toLowerCase().includes(q)) ||
      (h.description && h.description.toLowerCase().includes(q));
    const matchMethod = methodFilter === 'ALL' || (h.paymentMethod && h.paymentMethod.toLowerCase() === methodFilter.toLowerCase());
    return matchSearch && matchMethod;
  });

  const totalCollected = filteredHistory.reduce((acc, h) => acc + (Number(h.amount) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Fee Payment History & Ledger
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Complete transaction trail of every fee payment received into the institution accounts.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="h-10 px-4 rounded-xl font-bold border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Ledger
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
              Total Fee Inflow Recorded
            </p>
            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              Rs. {totalCollected.toLocaleString()}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{filteredHistory.length} verified transactions in history</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search history by student name, transaction ID, reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="ALL">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="Online Payment">Online / Card</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Reference / Receipt</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                      Loading history...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-zinc-400">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3.5 px-4 text-xs font-semibold text-zinc-500">
                        {new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {h.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {h.reference || 'REC-AUTO'}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        {h.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        Rs. {(Number(h.amount) || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {h.status}
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
