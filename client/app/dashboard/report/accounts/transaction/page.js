'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, FileText, 
  ArrowRightLeft, ArrowDownLeft, ArrowUpRight, RefreshCw, Calendar, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AccountsTransactionReportPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [records, setRecords] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter && typeFilter !== 'All') params.set('type', typeFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`/api/report/accounts/transaction?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data || []);
        setMetrics(json.metrics || null);
      }
    } catch (e) {
      console.error('Failed to fetch transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, dateFrom, dateTo]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['TXN ID', 'Date', 'Account Head', 'Entity / Payer / Payee', 'Type', 'Amount (PKR)', 'Payment Mode', 'Reference', 'Status'];
    const rows = records.map(r => [
      r.txId,
      r.date,
      `"${r.head}"`,
      `"${r.entityName}"`,
      r.type,
      r.amount,
      r.paymentMethod,
      r.reference,
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Accounts_Transaction_Report_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span className="text-[#084A86] font-bold">Transaction Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <ArrowRightLeft className="h-6 w-6 text-[#084A86]" />
            Accounts General Ledger &amp; Transaction Audit
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit logs of fee receipts, operating disbursements, and closing balances • Pak Royal College Sharaqpur
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
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Official Ledger
          </Button>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6 text-center">
        <h2 className="text-xl font-black uppercase tracking-wider text-zinc-950">PAK ROYAL COLLEGE SHARAQPUR SHARIF</h2>
        <p className="text-xs text-zinc-600 font-medium">Affiliated with PBTE, Punjab University &amp; Pharmacy Council of Pakistan</p>
        <h3 className="text-sm font-bold text-zinc-900 mt-2 uppercase tracking-wide underline">
          Financial Transaction &amp; Cash Book Ledger Statement
        </h3>
      </div>

      {/* Financial Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Total Credits (Inflow)</span>
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              PKR {metrics.totalCredit.toLocaleString()}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              Student tuition &amp; bank deposits
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Total Debits (Outflow)</span>
              <ArrowUpRight className="h-4 w-4 text-rose-600" />
            </div>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              PKR {metrics.totalDebit.toLocaleString()}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              Faculty payroll &amp; operations
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Net Operating Balance</span>
            <span className={`text-2xl font-black mt-1 block ${metrics.netBalance >= 0 ? 'text-zinc-950' : 'text-rose-600'}`}>
              PKR {metrics.netBalance.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              {metrics.netBalance >= 0 ? 'Positive Cash Flow' : 'Deficit'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Transaction Entries</span>
            <span className="text-2xl font-black text-zinc-950 mt-1 block">
              {metrics.totalTransactions} Records
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              Audited Ledger Vouchers
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs print:hidden space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-bold text-zinc-700">Transaction Type</Label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3"
            >
              <option value="All">All Entries (Credit &amp; Debit)</option>
              <option value="Credit">Credit Only (Income / Inflow)</option>
              <option value="Debit">Debit Only (Expense / Outflow)</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Date From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 text-xs h-9 bg-zinc-50 border-zinc-200"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Date To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 text-xs h-9 bg-zinc-50 border-zinc-200"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Search Particulars</Label>
            <div className="flex items-center gap-1.5 mt-1">
              <Input
                type="text"
                placeholder="Search head, reference, TXN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
                className="text-xs h-9 bg-zinc-50 border-zinc-200"
              />
              <Button
                size="sm"
                onClick={fetchTransactions}
                className="h-9 px-3 bg-[#084A86] hover:bg-[#073d6e] text-white shrink-0 text-xs"
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-zinc-900">Financial Ledger Vouchers</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
              {records.length} Entries
            </span>
          </div>
          {loading && <RefreshCw className="h-4 w-4 animate-spin text-[#084A86]" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-600 font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">TXN ID</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Account Particulars / Head</th>
                <th className="px-4 py-3.5">Entity / Party</th>
                <th className="px-4 py-3.5 text-center">Type</th>
                <th className="px-4 py-3.5 text-right">Amount</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5">Reference</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500 font-medium">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#084A86] mb-2" />
                    Loading financial ledger transactions...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    No transactions matching selected criteria.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const isCredit = r.type === 'Credit';
                  return (
                    <tr key={r._id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-zinc-700">{r.txId}</td>
                      <td className="px-4 py-3.5 font-mono text-zinc-600 whitespace-nowrap">{r.date}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-zinc-950">{r.head}</div>
                        <div className="text-[11px] text-zinc-500 line-clamp-1">{r.description}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-zinc-800">{r.entityName}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          isCredit
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 text-right font-extrabold text-sm ${
                        isCredit ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {isCredit ? '+' : '-'}PKR {r.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600">{r.paymentMethod}</td>
                      <td className="px-4 py-3.5 font-mono text-zinc-500 text-[11px]">{r.reference}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures Section for Printing */}
      <div className="hidden print:grid grid-cols-3 gap-8 pt-16 mt-8 border-t border-zinc-300 text-xs text-center font-bold text-zinc-800">
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Accounts Officer</div>
          <span className="text-[10px] text-zinc-500">General Ledger Branch</span>
        </div>
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Chief Bursar</div>
          <span className="text-[10px] text-zinc-500">Internal Audit &amp; Reconciliation</span>
        </div>
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Principal / Director</div>
          <span className="text-[10px] text-zinc-500">Pak Royal College Sharaqpur</span>
        </div>
      </div>
    </div>
  );
}
