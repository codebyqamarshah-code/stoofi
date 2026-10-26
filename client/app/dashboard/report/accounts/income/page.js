'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, Banknote, 
  TrendingUp, CreditCard, RefreshCw, School, Calendar, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CATEGORIES = ['All', 'Tuition Fee', 'Lab & Clinical', 'Admission / Prospectus', 'Hostel Charges', 'Transport Fee', 'Examination Fee'];
const PAYMENT_METHODS = ['All', 'Cash Counter', 'Bank Transfer', 'HBL Online'];

export default function AccountsIncomeReportPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [records, setRecords] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      if (methodFilter !== 'All') params.set('paymentMethod', methodFilter);

      const res = await fetch(`/api/report/accounts/income?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data || []);
        setMetrics(json.metrics || null);
      }
    } catch (e) {
      console.error('Failed to load income report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [categoryFilter, methodFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Receipt No', 'Date', 'Income Description', 'Student Name', 'Roll No', 'Category', 'Amount (PKR)', 'Payment Mode', 'Bank / Account', 'Status', 'Received By'];
    const rows = records.map(r => [
      r.receiptNo,
      r.date,
      `"${r.source}"`,
      `"${r.studentName}"`,
      r.rollNo,
      r.category,
      r.amount,
      `"${r.paymentMethod}"`,
      `"${r.bankName}"`,
      r.status,
      `"${r.receivedBy}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IncomeReport_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/dashboard/report/accounts" className="hover:text-zinc-600">Accounts Report</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#084A86] font-bold">Income &amp; Revenue Report</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            Institutional Income &amp; Revenue Receipts Register
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Tuition fee receipts, lab training, hostel collections, and cash/bank deposits • Pak Royal College Sharaqpur
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-xs font-semibold h-9 border-zinc-200 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-[#084A86]" /> Export CSV
          </Button>
          <Button
            onClick={handlePrint}
            size="sm"
            className="text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Income Ledger
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-600 uppercase">Revenue Stream</Label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-600 uppercase">Payment Channel</Label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-600 uppercase">Search Voucher / Student</Label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search receipt, name, roll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchIncome()}
                className="pl-8 text-xs bg-zinc-50 border-zinc-200 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={fetchIncome}
              className="w-full text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white flex items-center justify-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" /> Filter Income
            </Button>
            <Button
              onClick={() => { setSearch(''); setCategoryFilter('All'); setMethodFilter('All'); }}
              variant="outline"
              size="icon"
              className="h-9 w-9 border-zinc-200"
              title="Reset Filters"
            >
              <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Income (PKR)</span>
            <p className="text-xl font-black text-emerald-700 mt-1">
              PKR {metrics.totalIncome.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{metrics.totalReceipts} Valid Receipts</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Banking Collections</span>
            <p className="text-xl font-black text-[#084A86] mt-1">
              PKR {metrics.bankIncome.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Online &amp; Pay Orders</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Cash Counter Collections</span>
            <p className="text-xl font-black text-amber-700 mt-1">
              PKR {metrics.cashIncome.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Campus Direct Window</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Average Ticket</span>
            <p className="text-xl font-black text-zinc-950 mt-1">
              PKR {metrics.avgTicket.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Per receipt average</p>
          </div>
        </div>
      )}

      {/* Main Income Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden print:border-none print:shadow-none">
        {/* Printable Official College Header */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 print:bg-white text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <School className="h-6 w-6 text-[#084A86]" />
            <h2 className="text-xl font-black text-zinc-950 uppercase tracking-wide">
              Pak Royal College Sharaqpur Sharif
            </h2>
          </div>
          <p className="text-xs font-bold text-[#084A86] uppercase tracking-wider">
            Finance &amp; Accounts Directorate • Income Receipts Audit
          </p>
          <div className="inline-flex items-center gap-3 text-[11px] text-zinc-600 pt-1 font-medium">
            <span><strong>Stream:</strong> {categoryFilter}</span>
            <span>•</span>
            <span><strong>Channel:</strong> {methodFilter}</span>
            <span>•</span>
            <span><strong>Total Receipts:</strong> {records.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase font-black text-zinc-600 bg-zinc-100/80 border-b border-zinc-200">
              <tr>
                <th className="px-3.5 py-3">Receipt #</th>
                <th className="px-3.5 py-3">Date</th>
                <th className="px-5 py-3">Income Description</th>
                <th className="px-4 py-3">Student / Payee</th>
                <th className="px-3.5 py-3">Roll / Reg #</th>
                <th className="px-3.5 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount (PKR)</th>
                <th className="px-4 py-3">Payment Channel</th>
                <th className="px-3 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#084A86]" />
                    Compiling income receipt ledger...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-400">
                    No income receipts found for selected criteria.
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-3.5 py-3 font-mono font-bold text-[#084A86]">{r.receiptNo}</td>
                    <td className="px-3.5 py-3 font-mono text-zinc-600">{r.date}</td>
                    <td className="px-5 py-3 font-bold text-zinc-950">{r.source}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-800">{r.studentName}</td>
                    <td className="px-3.5 py-3 font-mono text-zinc-500">{r.rollNo}</td>
                    <td className="px-3.5 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-emerald-700">
                      PKR {r.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 text-[11px]">
                      {r.paymentMethod}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {records.length > 0 && (
              <tfoot className="bg-zinc-100/90 font-black text-zinc-950 border-t-2 border-zinc-300">
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-right uppercase text-xs">Total Inflow Collections:</td>
                  <td className="px-4 py-3 text-right text-sm text-emerald-800 font-black">
                    PKR {records.reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Official Signatures */}
        <div className="grid grid-cols-3 gap-6 p-8 border-t border-zinc-200 text-center text-xs">
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Cashier / Accounts Clerk
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Internal Audit Officer
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Chief Financial Officer / Principal
          </div>
        </div>
      </div>
    </div>
  );
}
