'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Trash2, 
  X, 
  Plus, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  RefreshCw, 
  ArrowLeftRight, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle,
  Building2,
  DollarSign
} from 'lucide-react';
import api from '@/services/api';
import AccountsNav from '@/components/accounts/AccountsNav';
import TransactionReceiptModal from '@/components/accounts/TransactionReceiptModal';
import { exportToExcel, exportToCSV, formatCurrency } from '@/lib/exportAccounts';

export default function FundTransferPage() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    transferMethod: 'Online Bank Transfer',
    referenceNo: '',
    description: '',
  });

  // Dropdown bank accounts
  const [bankAccounts, setBankAccounts] = useState([]);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Slip modal
  const [selectedSlip, setSelectedSlip] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/fund-transfer';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      if (res && res.success) {
        setRecords(res.data || []);
        setStats(res.stats || null);
      } else {
        setError(res?.message || 'Failed to fetch fund transfers');
      }
    } catch (err) {
      setError(err?.message || 'Unable to load fund transfers');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const res = await api.get('/bank-account');
      if (res && res.success) {
        setBankAccounts(res.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
    fetchData();
  }, [statusFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    const active = bankAccounts.filter((b) => b.status === 'Active');
    setFormData({
      fromAccount: active[0]?._id || '',
      toAccount: active[1]?._id || '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      transferMethod: 'Online Bank Transfer',
      referenceNo: '',
      description: '',
    });
    setIsFormOpen(true);
  };

  // Selected source bank details for validation
  const sourceBank = bankAccounts.find((b) => b._id === formData.fromAccount);
  const availableSourceBalance = sourceBank ? (sourceBank.currentBalance ?? sourceBank.openingBalance ?? 0) : 0;
  const isOverdraft = Number(formData.amount) > availableSourceBalance;
  const isSameAccount = formData.fromAccount && formData.fromAccount === formData.toAccount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fromAccount || !formData.toAccount) {
      alert('Please select both source and destination accounts.');
      return;
    }
    if (formData.fromAccount === formData.toAccount) {
      alert('Source and destination accounts cannot be identical.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Please specify a positive transfer amount.');
      return;
    }
    if (isOverdraft) {
      alert(`Insufficient funds! Source account only has ${formatCurrency(availableSourceBalance)} available.`);
      return;
    }

    try {
      setSaving(true);
      await api.post('/fund-transfer', formData);
      setIsFormOpen(false);
      fetchData();
      fetchBankAccounts(); // refresh bank balances
    } catch (err) {
      alert(err?.message || 'Fund transfer failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReverseTransfer = async (id) => {
    if (confirm('Are you sure you want to REVERSE this fund transfer? Money will be refunded to the source account and debited from the destination account.')) {
      try {
        const res = await api.delete(`/fund-transfer/${id}`);
        alert(res?.message || 'Transfer reversed successfully.');
        fetchData();
        fetchBankAccounts();
      } catch (err) {
        alert(err?.message || 'Failed to reverse transfer');
      }
    }
  };

  const handleExportExcel = () => {
    if (!records.length) return;
    const exportRows = records.map((r, i) => ({
      SL: i + 1,
      'Transfer Ref': r.transferNo || 'N/A',
      'From Account': r.fromAccountName || r.fromAccount?.bankName || 'N/A',
      'To Account': r.toAccountName || r.toAccount?.bankName || 'N/A',
      'Amount (PKR)': r.amount,
      Date: r.date ? new Date(r.date).toLocaleDateString('en-GB') : '',
      Method: r.transferMethod,
      Status: r.status,
    }));
    exportToExcel(exportRows, 'Fund_Transfers_Report', 'Transfers');
  };

  const handleExportCSV = () => {
    if (!records.length) return;
    const exportRows = records.map((r, i) => ({
      SL: i + 1,
      'Transfer Ref': r.transferNo || 'N/A',
      'From Account': r.fromAccountName || r.fromAccount?.bankName || 'N/A',
      'To Account': r.toAccountName || r.toAccount?.bankName || 'N/A',
      'Amount (PKR)': r.amount,
      Date: r.date ? new Date(r.date).toLocaleDateString('en-GB') : '',
      Status: r.status,
    }));
    exportToCSV(exportRows, 'Fund_Transfers_Report');
  };

  const filteredRecords = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.transferNo && r.transferNo.toLowerCase().includes(q)) ||
      (r.fromAccountName && r.fromAccountName.toLowerCase().includes(q)) ||
      (r.toAccountName && r.toAccountName.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Internal Fund Transfers</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Inter-bank liquidity movements, treasury balancing, cash register top-ups, and audit trails
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Accounts</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/accounts/accounts/income" className="hover:text-zinc-600 transition-colors">Accounts</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-teal-700 font-semibold">Fund Transfer</span>
        </div>
      </div>

      {/* Accounts Subnav */}
      <AccountsNav />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-teal-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Transfer Volume</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-zinc-950">
              {loading ? (
                <div className="h-7 w-28 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats?.totalVolume || 0)
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Total liquidity relocated</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-zinc-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Operations</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-zinc-950">
              {loading ? (
                <div className="h-7 w-16 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                stats?.totalTransfers || records.length
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Inter-account transfers recorded</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-teal-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Transferred Today</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-teal-800">
              {loading ? (
                <div className="h-7 w-24 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats?.todayTotal || 0)
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Volume transferred today</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Transferred This Month</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#009966]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-[#009966]">
              {loading ? (
                <div className="h-7 w-28 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats?.thisMonthTotal || 0)
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Monthly treasury adjustments</p>
          </div>
        </div>
      </div>

      {/* Main Container: Controls & Table */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search transfer ref or account..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-950 focus:outline-none focus:ring-1 focus:ring-[#009966]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#009966]"
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Excel</span>
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#009966]' : ''}`} />
            </button>
            <button
              onClick={openAddForm}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Transfer Funds</span>
            </button>
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchData} className="underline font-bold hover:text-rose-900 cursor-pointer">Retry</button>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-700 uppercase font-bold border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">SL</th>
                <th className="px-4 py-3">Transfer Ref</th>
                <th className="px-4 py-3">Source Account (From)</th>
                <th className="px-4 py-3">Destination Account (To)</th>
                <th className="px-4 py-3 text-right">Transfer Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-4 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-zinc-200 rounded ml-auto"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-12 bg-zinc-200 rounded mx-auto"></div></td>
                    <td className="px-4 py-3"><div className="h-6 w-16 bg-zinc-200 rounded mx-auto"></div></td>
                  </tr>
                ))
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ArrowLeftRight className="h-8 w-8 text-zinc-300" />
                      <p className="font-semibold text-zinc-700">No Fund Transfers Recorded</p>
                      <p className="text-zinc-400 max-w-sm text-[11px]">
                        No transfers match your current filter. Click "Transfer Funds" above to move money between accounts.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3 text-zinc-500 font-medium">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-zinc-800">
                      {item.transferNo || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-zinc-950">{item.fromAccountName || item.fromAccount?.bankName}</div>
                      <div className="text-[11px] text-zinc-500">{item.fromAccount?.accountTitle}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-zinc-950 flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 text-teal-600 inline" />
                        {item.toAccountName || item.toAccount?.bankName}
                      </div>
                      <div className="text-[11px] text-zinc-500">{item.toAccount?.accountTitle}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-teal-800">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 font-medium">
                      {item.transferMethod || 'Internal'}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 font-medium">
                      {item.date ? new Date(item.date).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-[#009966] border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.status || 'Completed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedSlip(item)}
                          className="p-1.5 text-zinc-600 hover:text-teal-700 hover:bg-teal-50 rounded transition cursor-pointer"
                          title="Print Transfer Slip"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        {item.status === 'Completed' && (
                          <button
                            onClick={() => handleReverseTransfer(item._id)}
                            className="p-1.5 text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="Reverse Transfer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count footer */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-2">
          <div>
            Showing <strong className="text-zinc-900">{filteredRecords.length ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
            <strong className="text-zinc-900">{Math.min(currentPage * itemsPerPage, filteredRecords.length)}</strong> of{' '}
            <strong className="text-zinc-900">{filteredRecords.length}</strong> transfers
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 bg-white border border-zinc-300 rounded hover:bg-zinc-100 disabled:opacity-40 transition cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 py-1 font-semibold text-zinc-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 bg-white border border-zinc-300 rounded hover:bg-zinc-100 disabled:opacity-40 transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Record Fund Transfer Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  Record Inter-Account Fund Transfer
                </h3>
                <p className="text-xs text-zinc-500">Atomic balance debit and credit across institutional accounts</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Source Account (Transfer From) *</label>
                  <select
                    name="fromAccount"
                    required
                    value={formData.fromAccount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  >
                    <option value="">Select Source Account</option>
                    {bankAccounts.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.bankName} - {b.accountTitle} ({formatCurrency(b.currentBalance ?? b.openingBalance)})
                      </option>
                    ))}
                  </select>
                  {sourceBank && (
                    <p className="text-[10px] text-zinc-500">
                      Available balance: <strong className="text-[#009966]">{formatCurrency(availableSourceBalance)}</strong>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Destination Account (Transfer To) *</label>
                  <select
                    name="toAccount"
                    required
                    value={formData.toAccount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  >
                    <option value="">Select Destination Account</option>
                    {bankAccounts.map((b) => (
                      <option key={b._id} value={b._id} disabled={b._id === formData.fromAccount}>
                        {b.bankName} - {b.accountTitle} ({formatCurrency(b.currentBalance ?? b.openingBalance)})
                      </option>
                    ))}
                  </select>
                </div>

                {isSameAccount && (
                  <div className="col-span-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Source and destination accounts must be different.</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Transfer Amount (PKR) *</label>
                  <input
                    type="number"
                    name="amount"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 50000"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Transfer Date *</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  />
                </div>

                {isOverdraft && (
                  <div className="col-span-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px] flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Insufficient funds in source account! You cannot transfer more than {formatCurrency(availableSourceBalance)}.</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Transfer Method</label>
                  <select
                    name="transferMethod"
                    value={formData.transferMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  >
                    <option value="Online Bank Transfer">Online Bank Transfer (IBFT / RTGS)</option>
                    <option value="Cheque">Cheque Transfer</option>
                    <option value="Internal Book Transfer">Internal Book Adjustment</option>
                    <option value="Cash Deposit">Cash Deposit / Withdrawal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Bank Cheque / Transaction Ref #</label>
                  <input
                    type="text"
                    name="referenceNo"
                    placeholder="e.g. CHQ-40291, TRF-0912"
                    value={formData.referenceNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-zinc-700">Purpose / Transfer Note</label>
                  <textarea
                    name="description"
                    rows="2"
                    placeholder="e.g. Replenishing Petty Cash register from Meezan Main Account..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  ></textarea>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || isOverdraft || isSameAccount}
                  className="px-5 py-2 font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Processing...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Fund Transfer Slip Modal */}
      <TransactionReceiptModal
        isOpen={!!selectedSlip}
        onClose={() => setSelectedSlip(null)}
        data={selectedSlip}
        type="transfer"
      />
    </div>
  );
}
