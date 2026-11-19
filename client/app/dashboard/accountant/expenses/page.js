'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Printer,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  Eye,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function AllExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expense');
      if (res?.success && Array.isArray(res.data)) {
        setExpenses(res.data);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter(e => {
    const q = search.toLowerCase();
    const matchSearch =
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.voucherNo && e.voucherNo.toLowerCase().includes(q)) ||
      (e.payeeName && e.payeeName.toLowerCase().includes(q)) ||
      (e.invoiceNo && e.invoiceNo.toLowerCase().includes(q));
    const matchCat = categoryFilter === 'ALL' || (e.categoryName && e.categoryName.toLowerCase() === categoryFilter.toLowerCase());
    return matchSearch && matchCat;
  });

  const totalExpenseAmount = filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  const categories = Array.from(new Set(expenses.map(e => e.categoryName).filter(Boolean)));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Expense Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              Institutional Outflows
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Track utility bills, campus maintenance, lab consumables, and operational disbursements.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => router.push('/dashboard/accountant/expenses/add')}
            className="h-10 px-4 rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Expense
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="h-10 px-4 rounded-xl font-bold border-zinc-300 dark:border-zinc-700"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print List
          </Button>
          <Button
            onClick={fetchExpenses}
            variant="outline"
            className="h-10 w-10 p-0 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-rose-600 dark:text-rose-400 tracking-wider">
                Total Expenses
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
                Rs. {totalExpenseAmount.toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{filteredExpenses.length} expense vouchers</p>
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
                Active Categories
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                {categories.length || 10}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Campus expense heads</p>
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
                Average Expense
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                Rs. {filteredExpenses.length > 0 ? Math.round(totalExpenseAmount / filteredExpenses.length).toLocaleString() : '0'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Per voucher average</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search expense by title, voucher #, vendor/payee, invoice #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
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
                  <th className="py-3 px-4">Voucher #</th>
                  <th className="py-3 px-4">Expense Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor / Payee</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                      Loading expense ledger...
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-zinc-400">
                      No expense records found. Click "Add Expense" to record new expenditure.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e) => (
                    <tr key={e._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {e.voucherNo || 'EXP-AUTO'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{e.title}</div>
                        {e.description && <div className="text-xs text-zinc-400 truncate max-w-xs">{e.description}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        {e.categoryName}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">
                        {e.payeeName || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-zinc-500">
                        {e.paymentMethod || 'Cash'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-500">
                        {e.date ? new Date(e.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-rose-600 dark:text-rose-400">
                        Rs. {(Number(e.amount) || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {e.status || 'Paid'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          onClick={() => setSelectedExpense(e)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        >
                          <Eye className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-zinc-950 dark:text-zinc-50">{selectedExpense.title}</h3>
                <p className="text-xs text-zinc-400 font-mono">Voucher: #{selectedExpense.voucherNo}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedExpense(null)}
                className="h-8 w-8 p-0 rounded-full"
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl">
                <span className="text-xs text-zinc-400 block font-semibold">Category</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedExpense.categoryName}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl">
                <span className="text-xs text-zinc-400 block font-semibold">Vendor / Recipient</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedExpense.payeeName || 'N/A'}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl">
                <span className="text-xs text-zinc-400 block font-semibold">Payment Method</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedExpense.paymentMethod}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl">
                <span className="text-xs text-zinc-400 block font-semibold">Disbursement Date</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{new Date(selectedExpense.date).toLocaleDateString()}</span>
              </div>
            </div>

            {selectedExpense.description && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl text-xs text-zinc-600 dark:text-zinc-300">
                <strong>Description:</strong> {selectedExpense.description}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex justify-between items-center">
              <span className="text-sm font-bold text-rose-900 dark:text-rose-300">Amount Disbursed:</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">Rs. {(Number(selectedExpense.amount) || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedExpense(null)}
                className="rounded-xl font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
