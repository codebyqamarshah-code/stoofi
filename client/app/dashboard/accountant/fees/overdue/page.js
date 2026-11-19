'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Search,
  Filter,
  DollarSign,
  Printer,
  Calendar,
  Clock,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function OverdueFeesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fees-invoice?limit=300');
      if (res?.success && Array.isArray(res.data)) {
        const now = new Date();
        const overdueList = res.data.filter(inv => {
          const status = (inv.status || '').toUpperCase();
          const bal = Number(inv.balance) || 0;
          if (status === 'PAID' || bal <= 0) return false;
          if (!inv.dueDate) return true; // If unpaid and no due date, treat as pending/overdue
          return new Date(inv.dueDate) < now;
        });
        setInvoices(overdueList);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error('Failed to load overdue fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const totalOverdue = invoices.reduce((acc, inv) => acc + (Number(inv.balance) || Number(inv.amount) || 0), 0);

  const filteredInvoices = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch =
      (inv.student && inv.student.toLowerCase().includes(q)) ||
      (inv.admissionNo && inv.admissionNo.toLowerCase().includes(q)) ||
      (inv.rollNo && inv.rollNo.toLowerCase().includes(q));
    const matchClass = selectedClass === 'ALL' || (inv.className && inv.className.toLowerCase() === selectedClass.toLowerCase());
    return matchSearch && matchClass;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Overdue Fees
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              Late Payment Notice
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Accounts past their designated payment deadline. Apply late fine or issue notices.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={fetchOverdue}
            variant="outline"
            className="h-10 w-10 p-0 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-2xl border-rose-200 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-rose-800 dark:text-rose-400 tracking-wider">
                Total Overdue Amount
              </p>
              <h3 className="text-3xl font-black text-rose-900 dark:text-rose-300 mt-1">
                Rs. {totalOverdue.toLocaleString()}
              </h3>
              <p className="text-xs text-rose-700/80 mt-0.5">{invoices.length} accounts past deadline</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                Default Late Surcharge
              </p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                Rs. 300 / mo
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Configured institutional fine</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search overdue student by name, roll, admission..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="ALL">All Classes</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Table */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Overdue Balance</th>
                  <th className="py-3 px-4 text-right">Late Fine</th>
                  <th className="py-3 px-4 text-right">Total Payable</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                      Checking overdue accounts...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-emerald-600 font-medium">
                      No overdue fees recorded. All student accounts are within valid due dates.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const balance = Number(inv.balance) || Number(inv.amount) || 0;
                    const fine = Number(inv.fine) || 300;
                    const totalWithFine = balance + fine;
                    return (
                      <tr key={inv._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">{inv.student}</div>
                          <div className="text-xs text-zinc-400">ID: {inv.admissionNo || inv.rollNo || 'N/A'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 font-medium">
                          {inv.className} ({inv.section || 'All'})
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-zinc-500">
                          {inv.billingMonth || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-rose-600">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'Overdue'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100">
                          Rs. {balance.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                          + Rs. {fine}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-rose-600 dark:text-rose-400 text-base">
                          Rs. {totalWithFine.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            onClick={() => router.push(`/dashboard/accountant/fees/collect?admissionNo=${inv.admissionNo}&invoiceId=${inv._id}`)}
                            size="sm"
                            className="h-8 px-3 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
                          >
                            Collect Overdue
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
