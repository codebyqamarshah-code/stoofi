'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  Plus,
  Printer,
  ChevronRight,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Receipt,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function AllStudentFeesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let query = '?limit=300';
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedClass !== 'ALL') query += `&class=${encodeURIComponent(selectedClass)}`;
      if (selectedStatus !== 'ALL') query += `&status=${encodeURIComponent(selectedStatus)}`;

      const res = await api.get(`/fees-invoice${query}`);
      if (res?.success && Array.isArray(res.data)) {
        setInvoices(res.data);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [selectedClass, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  const totalBilled = invoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (Number(inv.paid) || 0), 0);
  const totalBalance = invoices.reduce((acc, inv) => acc + (Number(inv.balance) || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              All Student Fees
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Live Ledger
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Complete database record of student invoices, collections and outstanding balances.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => router.push('/dashboard/accountant/fees/collect')}
            className="h-10 px-4 rounded-xl font-bold bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors shadow-xs"
          >
            <DollarSign className="w-4 h-4 mr-1.5" />
            Collect Fee
          </Button>
          <Button
            onClick={() => router.push('/dashboard/accountant/fees/vouchers')}
            variant="outline"
            className="h-10 px-4 rounded-xl font-bold border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Generate Vouchers
          </Button>
          <Button
            onClick={fetchInvoices}
            variant="outline"
            className="h-10 w-10 p-0 rounded-xl border-zinc-300 dark:border-zinc-700"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Mini KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">Total Invoiced</p>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                Rs. {totalBilled.toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{invoices.length} invoices registered</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">Total Collected</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                Rs. {totalPaid.toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0}% recovery rate
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-rose-600 dark:text-rose-400 tracking-wider">Total Remaining</p>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                Rs. {totalBalance.toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Outstanding balance</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by student name, roll number, admission number, challan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="ALL">All Classes</option>
                <option value="Nursery">Nursery</option>
                <option value="Prep">Prep</option>
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

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="ALL">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>

              <Button
                type="submit"
                className="h-10 px-4 rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
              >
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800/80 shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center justify-between">
            <span>Student Invoices Ledger ({invoices.length})</span>
            <span className="text-xs font-normal text-zinc-500">Sorted by most recent</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Challan / Inv</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class & Sec</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4 text-right">Total Fee</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Remaining</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                      Loading records...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-zinc-400">
                      No fee records found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const statusStr = (inv.status || 'Unpaid').toUpperCase();
                    const isPaid = statusStr === 'PAID';
                    const isPartial = statusStr === 'PARTIAL';
                    const balance = Number(inv.balance) || 0;

                    return (
                      <tr key={inv._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {inv.challanNo || inv.invoiceNo || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">{inv.student || 'Student'}</div>
                          <div className="text-xs text-zinc-400">ID: {inv.admissionNo || inv.rollNo || 'N/A'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                          {inv.className || 'General'} {inv.section ? `(${inv.section})` : ''}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {inv.billingMonth || 'Current'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100">
                          Rs. {(Number(inv.amount) || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          Rs. {(Number(inv.paid) || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                          Rs. {balance.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : isPartial
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {inv.status || 'Unpaid'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              onClick={() => setSelectedInvoice(inv)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
                              title="View Invoice Details"
                            >
                              <Eye className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                            </Button>
                            {!isPaid && (
                              <Button
                                onClick={() => router.push(`/dashboard/accountant/fees/collect?admissionNo=${inv.admissionNo}&invoiceId=${inv._id}`)}
                                size="sm"
                                className="h-8 px-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                Pay
                              </Button>
                            )}
                          </div>
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

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-zinc-950 dark:text-zinc-50">Invoice Details</h3>
                <p className="text-xs text-zinc-400 font-mono">Challan: #{selectedInvoice.challanNo || selectedInvoice.invoiceNo}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
                className="rounded-full h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl">
                <span className="text-xs text-zinc-400 block font-semibold">Student Name</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedInvoice.student}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl">
                <span className="text-xs text-zinc-400 block font-semibold">Admission / Roll</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedInvoice.admissionNo || selectedInvoice.rollNo || 'N/A'}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl">
                <span className="text-xs text-zinc-400 block font-semibold">Class & Section</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedInvoice.className} ({selectedInvoice.section || 'All'})</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl">
                <span className="text-xs text-zinc-400 block font-semibold">Billing Month</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedInvoice.billingMonth || 'N/A'}</span>
              </div>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Tuition / Invoiced Amount:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Rs. {(Number(selectedInvoice.amount) || 0).toLocaleString()}</span>
              </div>
              {selectedInvoice.fine > 0 && (
                <div className="flex justify-between text-rose-500">
                  <span>Late Fee / Fine:</span>
                  <span className="font-bold">+ Rs. {selectedInvoice.fine}</span>
                </div>
              )}
              {selectedInvoice.waiver > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount / Waiver:</span>
                  <span className="font-bold">- Rs. {selectedInvoice.waiver}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold border-t border-zinc-100 dark:border-zinc-800/60 pt-1.5">
                <span>Amount Paid:</span>
                <span>Rs. {(Number(selectedInvoice.paid) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-extrabold text-base border-t border-zinc-200 dark:border-zinc-800 pt-1.5">
                <span>Remaining Balance:</span>
                <span>Rs. {(Number(selectedInvoice.balance) || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedInvoice(null)}
                className="rounded-xl"
              >
                Close
              </Button>
              {selectedInvoice.status !== 'Paid' && (
                <Button
                  onClick={() => router.push(`/dashboard/accountant/fees/collect?admissionNo=${selectedInvoice.admissionNo}&invoiceId=${selectedInvoice._id}`)}
                  className="rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                >
                  Proceed to Collect
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
