'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Filter,
  Printer,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Eye,
  RefreshCw,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function PaymentReceiptsPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      // Fetch fee transactions from centralized accountant transactions API
      const res = await api.get('/accountant/transactions?type=FEE&limit=200');
      if (res?.success && Array.isArray(res.data)) {
        setReceipts(res.data);
      } else {
        setReceipts([]);
      }
    } catch (err) {
      console.error('Failed to load receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filteredReceipts = receipts.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      (r.reference && r.reference.toLowerCase().includes(q)) ||
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q));
    const matchMethod = methodFilter === 'ALL' || (r.paymentMethod && r.paymentMethod.toLowerCase() === methodFilter.toLowerCase());
    return matchSearch && matchMethod;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Fee Payment Receipts
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Search, view, audit and reprint official fee payment receipts issued to students.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => router.push('/dashboard/accountant/fees/collect')}
            className="h-10 px-4 rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
          >
            <DollarSign className="w-4 h-4 mr-1.5" />
            Issue New Receipt
          </Button>
          <Button
            onClick={fetchReceipts}
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
                placeholder="Search by receipt number, student name, reference ID..."
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
                <option value="ALL">All Payment Methods</option>
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

      {/* Receipts Table */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center justify-between">
            <span>Official Receipts Directory ({filteredReceipts.length})</span>
            <span className="text-xs font-normal text-zinc-500">Live verified payments</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Receipt / Ref #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount Received</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                      Loading receipts...
                    </td>
                  </tr>
                ) : filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-zinc-400">
                      No receipts found. Record fee payments to populate receipts.
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {r.reference || 'REC-AUTO'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{r.name}</div>
                        <div className="text-xs text-zinc-400 truncate max-w-xs">{r.description}</div>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300 font-medium">
                        {r.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-xs text-zinc-500">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        Rs. {(Number(r.amount) || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {r.status || 'Verified'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => setSelectedReceipt(r)}
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-xs font-bold"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Receipt
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

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white text-zinc-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-4 print:p-0 print:border-none print:shadow-none">
            <div className="text-center border-b border-zinc-200 pb-4">
              <div className="text-xl font-black tracking-tight uppercase">Stoofi School & College ERP</div>
              <p className="text-xs text-zinc-500">Official Student Fee Receipt</p>
              <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                Receipt #{selectedReceipt.reference || selectedReceipt.id.slice(-8).toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-b border-zinc-200 pb-3">
              <div>
                <span className="text-zinc-500 block">Student Name:</span>
                <span className="font-extrabold text-sm">{selectedReceipt.name}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Date of Payment:</span>
                <span className="font-bold">{new Date(selectedReceipt.date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Payment Method:</span>
                <span className="font-bold">{selectedReceipt.paymentMethod}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Category:</span>
                <span className="font-bold">{selectedReceipt.category}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs border-b border-zinc-200 pb-3">
              <div className="flex justify-between py-1">
                <span>Description / Particulars:</span>
                <span className="font-medium text-zinc-600">{selectedReceipt.description || 'Tuition & Academic Fees'}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-zinc-300 font-black text-base text-emerald-700 bg-emerald-50 px-2 rounded-lg">
                <span>Total Net Paid:</span>
                <span>Rs. {(Number(selectedReceipt.amount) || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 text-center italic">
              Verified by the Accounts & Finance Department • Stoofi ERP
            </div>

            <div className="flex justify-end gap-2 pt-2 print:hidden">
              <Button
                variant="outline"
                onClick={() => setSelectedReceipt(null)}
                className="rounded-xl font-bold"
              >
                Close
              </Button>
              <Button
                onClick={handlePrint}
                className="rounded-xl font-bold bg-zinc-950 text-white"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
