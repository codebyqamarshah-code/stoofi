'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Plus, 
  Download, 
  FileSpreadsheet, 
  RefreshCw, 
  Building2, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  Eye, 
  Printer, 
  DollarSign, 
  ShieldCheck, 
  Lock
} from 'lucide-react';
import api from '@/services/api';
import AccountsNav from '@/components/accounts/AccountsNav';
import { exportToExcel, exportToCSV, formatCurrency } from '@/lib/exportAccounts';

export default function BankAccountPage() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    branchName: '',
    accountType: 'Current',
    openingBalance: '',
    currency: 'PKR',
    status: 'Active',
  });

  // Statement / Ledger modal state
  const [selectedAccountLedger, setSelectedAccountLedger] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerTransactions, setLedgerTransactions] = useState([]);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/bank-account';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      if (res && res.success) {
        setRecords(res.data || []);
        setStats(res.stats || null);
      } else {
        setError(res?.message || 'Failed to fetch bank accounts');
      }
    } catch (err) {
      setError(err?.message || 'Unable to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({
      bankName: '',
      accountTitle: '',
      accountNumber: '',
      branchName: '',
      accountType: 'Current',
      openingBalance: '0',
      currency: 'PKR',
      status: 'Active',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({
      bankName: item.bankName || '',
      accountTitle: item.accountTitle || '',
      accountNumber: item.accountNumber || '',
      branchName: item.branchName || '',
      accountType: item.accountType || 'Current',
      openingBalance: item.openingBalance || '0',
      currency: item.currency || 'PKR',
      status: item.status || 'Active',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bankName || !formData.accountTitle || !formData.accountNumber) {
      alert('Please fill in Bank Name, Account Title, and Account Number.');
      return;
    }

    try {
      setSaving(true);
      if (editId) {
        await api.put(`/bank-account/${editId}`, formData);
      } else {
        await api.post('/bank-account', formData);
      }
      setIsFormOpen(false);
      setEditId(null);
      fetchData();
    } catch (err) {
      alert(err?.message || 'Failed to save bank account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to deactivate / delete this bank account?')) {
      try {
        const res = await api.delete(`/bank-account/${id}`);
        alert(res?.message || 'Account updated.');
        fetchData();
      } catch (err) {
        alert(err?.message || 'Failed to delete account');
      }
    }
  };

  // Inspect Ledger statement
  const openLedgerStatement = async (account) => {
    setSelectedAccountLedger(account);
    setLedgerLoading(true);
    try {
      const res = await api.get(`/bank-account/${account._id}`);
      if (res && res.success) {
        setLedgerTransactions(res.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!records.length) return;
    const exportRows = records.map((r, i) => ({
      SL: i + 1,
      'Bank Name': r.bankName,
      'Account Title': r.accountTitle,
      'Account Number': r.accountNumber,
      'Branch': r.branchName || 'Main',
      'Account Type': r.accountType,
      'Opening Balance (PKR)': r.openingBalance,
      'Current Balance (PKR)': r.currentBalance,
      Status: r.status,
    }));
    exportToExcel(exportRows, 'Bank_Accounts_Summary', 'Bank Accounts');
  };

  const handleExportCSV = () => {
    if (!records.length) return;
    const exportRows = records.map((r, i) => ({
      SL: i + 1,
      'Bank Name': r.bankName,
      'Account Title': r.accountTitle,
      'Account Number': r.accountNumber,
      'Opening Balance (PKR)': r.openingBalance,
      'Current Balance (PKR)': r.currentBalance,
      Status: r.status,
    }));
    exportToCSV(exportRows, 'Bank_Accounts_Summary');
  };

  const filteredRecords = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.bankName && r.bankName.toLowerCase().includes(q)) ||
      (r.accountTitle && r.accountTitle.toLowerCase().includes(q)) ||
      (r.accountNumber && r.accountNumber.toLowerCase().includes(q)) ||
      (r.branchName && r.branchName.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Bank Accounts & Treasury</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage institutional bank accounts, cash registers, real-time balances and ledger statements
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Accounts</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/accounts/accounts/income" className="hover:text-zinc-600 transition-colors">Accounts</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-semibold">Bank Account</span>
        </div>
      </div>

      {/* Accounts Subnav */}
      <AccountsNav />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-[#009966]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Combined Treasury Balance</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#009966]">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-[#009966]">
              {loading ? (
                <div className="h-7 w-28 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats?.combinedBalance || 0)
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Total liquid funds across all accounts</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-zinc-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Accounts</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-zinc-950">
              {loading ? (
                <div className="h-7 w-16 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                stats?.totalAccounts || records.length
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Configured banks & cash drawers</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Opening Capital</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-zinc-950">
              {loading ? (
                <div className="h-7 w-24 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats?.totalOpeningBalance || 0)
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Base opening balances</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-[#009966]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Ledgers</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#009966]">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-zinc-950">
              {loading ? (
                <div className="h-7 w-16 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                stats?.activeAccounts || 0
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Operational accounts</p>
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
                placeholder="Search bank, account title..."
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#009966] hover:bg-[#008055] rounded-lg transition shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Bank Account</span>
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
                <th className="px-4 py-3">Bank & Branch</th>
                <th className="px-4 py-3">Account Title</th>
                <th className="px-4 py-3">Account Number</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Opening Balance</th>
                <th className="px-4 py-3 text-right">Current Available</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-4 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-36 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-zinc-200 rounded ml-auto"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-zinc-200 rounded ml-auto"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-12 bg-zinc-200 rounded mx-auto"></div></td>
                    <td className="px-4 py-3"><div className="h-6 w-20 bg-zinc-200 rounded mx-auto"></div></td>
                  </tr>
                ))
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Building2 className="h-8 w-8 text-zinc-300" />
                      <p className="font-semibold text-zinc-700">No Bank Accounts Found</p>
                      <p className="text-zinc-400 max-w-sm text-[11px]">
                        No accounts match your search. Click "Add Bank Account" to configure an institutional bank or cash drawer.
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
                    <td className="px-4 py-3">
                      <div className="font-bold text-zinc-950">{item.bankName}</div>
                      <div className="text-[11px] text-zinc-500">{item.branchName || 'Main Branch'}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-800">
                      {item.accountTitle}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-700">
                      {item.maskedAccountNumber || item.accountNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700">
                        {item.accountType || 'Current'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-600 font-medium">
                      {formatCurrency(item.openingBalance || 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-[#009966]">
                      {formatCurrency(item.currentBalance ?? item.openingBalance ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Active'
                            ? 'bg-emerald-50 text-[#009966] border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}
                      >
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openLedgerStatement(item)}
                          className="p-1.5 text-zinc-600 hover:text-[#009966] hover:bg-emerald-50 rounded transition cursor-pointer"
                          title="View Ledger Statement"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Deactivate / Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
            <strong className="text-zinc-900">{filteredRecords.length}</strong> accounts
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

      {/* Add / Edit Bank Account Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  {editId ? 'Edit Bank Account' : 'Add Bank Account'}
                </h3>
                <p className="text-xs text-zinc-500">Configure bank credentials and baseline opening balance</p>
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
                  <label className="font-semibold text-zinc-700">Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    required
                    placeholder="e.g. Meezan Bank, HBL, Petty Cash"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Account Type *</label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  >
                    <option value="Current">Current Account</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Islamic">Islamic Banking</option>
                    <option value="Cash / Petty">Cash / Petty Cash Register</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-zinc-700">Account Title *</label>
                  <input
                    type="text"
                    name="accountTitle"
                    required
                    placeholder="e.g. Pak Royal College Main Treasury"
                    value={formData.accountTitle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Account Number / IBAN *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    required
                    placeholder="e.g. PK00MEZN000123456789"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Branch Name / Code</label>
                  <input
                    type="text"
                    name="branchName"
                    placeholder="e.g. Main Boulevard Branch (Code 0123)"
                    value={formData.branchName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Opening Balance (PKR)</label>
                  <input
                    type="number"
                    name="openingBalance"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={formData.openingBalance}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                  disabled={saving}
                  className="px-5 py-2 font-bold text-white bg-[#009966] hover:bg-[#008055] rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editId ? 'Update Account' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Statement / Ledger Drilldown Modal */}
      {selectedAccountLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-950">
                    {selectedAccountLedger.bankName} — Account Statement
                  </h3>
                  <span className="text-xs bg-emerald-50 text-[#009966] px-2 py-0.5 rounded font-mono font-bold">
                    {selectedAccountLedger.maskedAccountNumber || selectedAccountLedger.accountNumber}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {selectedAccountLedger.accountTitle} • {selectedAccountLedger.branchName || 'Main Branch'}
                </p>
              </div>
              <button
                onClick={() => setSelectedAccountLedger(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Account Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Opening Balance</span>
                <span className="font-bold text-zinc-800 text-sm">{formatCurrency(selectedAccountLedger.openingBalance || 0)}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Current Live Balance</span>
                <span className="font-extrabold text-[#009966] text-base">
                  {formatCurrency(selectedAccountLedger.currentBalance ?? selectedAccountLedger.openingBalance ?? 0)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Account Classification</span>
                <span className="font-semibold text-zinc-800">{selectedAccountLedger.accountType || 'Current'}</span>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Recent Activity & Ledger Flow</h4>
              <div className="max-h-72 overflow-y-auto border border-zinc-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-700 uppercase font-bold border-b border-zinc-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Type / Ref</th>
                      <th className="px-3 py-2">Particulars</th>
                      <th className="px-3 py-2 text-right">Debit / Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {ledgerLoading ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-zinc-400">Loading ledger transactions...</td>
                      </tr>
                    ) : ledgerTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-zinc-500">
                          No recent transactions recorded for this bank account.
                        </td>
                      </tr>
                    ) : (
                      ledgerTransactions.map((tx, idx) => {
                        const isCredit = tx.type === 'Credit' || tx.type === 'Income' || tx.type === 'Transfer In';
                        return (
                          <tr key={idx} className="hover:bg-zinc-50">
                            <td className="px-3 py-2 text-zinc-500 font-medium">
                              {tx.date ? new Date(tx.date).toLocaleDateString('en-GB') : '—'}
                            </td>
                            <td className="px-3 py-2">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isCredit ? 'bg-emerald-50 text-[#009966]' : 'bg-rose-50 text-rose-600'
                              }`}>
                                {tx.type}
                              </span>
                              <span className="font-mono text-zinc-500 ml-1.5 text-[11px]">{tx.referenceNo}</span>
                            </td>
                            <td className="px-3 py-2 text-zinc-900 font-medium">
                              {tx.title || tx.description || 'Transaction'}
                            </td>
                            <td className={`px-3 py-2 text-right font-bold ${isCredit ? 'text-[#009966]' : 'text-rose-600'}`}>
                              {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Statement</span>
              </button>
              <button
                onClick={() => setSelectedAccountLedger(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#009966] hover:bg-[#008055] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
