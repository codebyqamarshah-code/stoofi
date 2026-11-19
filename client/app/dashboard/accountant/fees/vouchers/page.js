'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Layers,
  Calendar,
  DollarSign,
  Download,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function FeeVouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Voucher generator form state
  const [showGenModal, setShowGenModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({
    mode: 'class', // 'class' | 'single'
    className: 'Class 1',
    section: 'A',
    billingMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().slice(0, 10),
    feeType: 'Tuition Fee',
    totalAmount: 5000,
    heads: [
      { head: 'Tuition Fee', amount: 4000 },
      { head: 'Utility / Exams', amount: 1000 }
    ]
  });

  const [activePrintVoucher, setActivePrintVoucher] = useState(null);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      let query = '?limit=200';
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedClass !== 'ALL') query += `&class=${encodeURIComponent(selectedClass)}`;
      if (selectedMonth) query += `&billingMonth=${encodeURIComponent(selectedMonth)}`;

      const res = await api.get(`/accountant/fees/vouchers${query}`);
      if (res?.success && Array.isArray(res.data)) {
        setVouchers(res.data);
      } else {
        setVouchers([]);
      }
    } catch (err) {
      console.error('Failed to load vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [selectedClass, selectedMonth]);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await api.post('/accountant/fees/vouchers', genForm);
      if (res?.success) {
        setShowGenModal(false);
        fetchVouchers();
      } else {
        alert(res?.message || 'Failed to generate vouchers');
      }
    } catch (err) {
      alert(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Fee Vouchers & Challans
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Generate, track and print 3-copy student bank challans for classes or individual students.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setShowGenModal(true)}
            className="h-10 px-4 rounded-xl font-bold bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Generate Vouchers
          </Button>
          <Button
            onClick={fetchVouchers}
            variant="outline"
            className="h-10 w-10 p-0 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search voucher by student name, challan no, admission no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVouchers()}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
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

              <Button
                onClick={fetchVouchers}
                className="h-10 px-4 rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
              >
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center justify-between">
            <span>Generated Fee Challans ({vouchers.length})</span>
            <span className="text-xs font-normal text-zinc-500">Live database vouchers</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Challan #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                      Loading vouchers...
                    </td>
                  </tr>
                ) : vouchers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-zinc-400">
                      No vouchers found. Click "Generate Vouchers" to issue new challans.
                    </td>
                  </tr>
                ) : (
                  vouchers.map((v) => {
                    const statusStr = (v.status || 'Unpaid').toUpperCase();
                    const isPaid = statusStr === 'PAID';
                    return (
                      <tr key={v._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="py-3 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {v.challanNo || v.invoiceNo || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">{v.student || 'Student'}</div>
                          <div className="text-xs text-zinc-400">ID: {v.admissionNo || v.rollNo || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300">
                          {v.className || 'General'}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-zinc-500">
                          {v.billingMonth || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-xs text-zinc-500">
                          {v.dueDate ? new Date(v.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100">
                          Rs. {(Number(v.amount) || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          Rs. {(Number(v.paid) || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {v.status || 'Unpaid'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            onClick={() => setActivePrintVoucher(v)}
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-xs font-bold"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            Print
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

      {/* Generation Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-zinc-950 dark:text-zinc-50">Generate Fee Vouchers</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGenModal(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Target Class</label>
                <select
                  value={genForm.className}
                  onChange={(e) => setGenForm({ ...genForm, className: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                >
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Billing Month</label>
                  <input
                    type="month"
                    value={genForm.billingMonth}
                    onChange={(e) => setGenForm({ ...genForm, billingMonth: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={genForm.dueDate}
                    onChange={(e) => setGenForm({ ...genForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Total Fee Amount (PKR)</label>
                <input
                  type="number"
                  value={genForm.totalAmount}
                  onChange={(e) => setGenForm({ ...genForm, totalAmount: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGenModal(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={generating}
                  className="rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                >
                  {generating ? 'Generating...' : 'Confirm & Generate'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3-Copy Bank Voucher Print Modal */}
      {activePrintVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white text-zinc-950 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:p-0">
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <h3 className="text-base font-extrabold uppercase">Bank Challan Voucher Print Preview</h3>
              <div className="flex items-center gap-2">
                <Button onClick={handlePrint} size="sm" className="font-bold bg-zinc-950 text-white">
                  <Printer className="w-4 h-4 mr-1.5" />
                  Print 3-Copy Challan
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setActivePrintVoucher(null)}>
                  ✕
                </Button>
              </div>
            </div>

            {/* 3-Column Voucher Layout (School Copy, Bank Copy, Student Copy) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-zinc-300 p-4 rounded-xl text-xs print:border-none print:p-0">
              {['Bank Copy', 'School Copy', 'Student Copy'].map((copyTitle, i) => (
                <div key={copyTitle} className={`space-y-3 p-3 ${i !== 2 ? 'md:border-r border-dashed border-zinc-400' : ''}`}>
                  <div className="text-center border-b pb-2">
                    <div className="font-black text-sm uppercase">Stoofi School & College</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{copyTitle}</div>
                    <div className="font-mono text-[11px] font-bold mt-1">Challan: #{activePrintVoucher.challanNo || activePrintVoucher.invoiceNo}</div>
                  </div>

                  <div className="space-y-1">
                    <div><strong>Student:</strong> {activePrintVoucher.student}</div>
                    <div><strong>ID / Roll:</strong> {activePrintVoucher.admissionNo || activePrintVoucher.rollNo || 'N/A'}</div>
                    <div><strong>Class:</strong> {activePrintVoucher.className} ({activePrintVoucher.section || 'All'})</div>
                    <div><strong>Month:</strong> {activePrintVoucher.billingMonth || 'N/A'}</div>
                    <div><strong>Due Date:</strong> {activePrintVoucher.dueDate ? new Date(activePrintVoucher.dueDate).toLocaleDateString() : '15th'}</div>
                  </div>

                  <div className="border-t border-b py-2 space-y-1 font-semibold">
                    <div className="flex justify-between">
                      <span>Tuition Fee:</span>
                      <span>Rs. {activePrintVoucher.amount || 5000}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500 font-normal">
                      <span>Late Fine (after due date):</span>
                      <span>Rs. 300</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t text-sm">
                      <span>Total Payable:</span>
                      <span>Rs. {activePrintVoucher.amount || 5000}</span>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between text-[10px] text-zinc-400">
                    <div>Cashier Signature</div>
                    <div>Officer / Stamp</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
