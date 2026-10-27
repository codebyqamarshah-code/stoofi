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
  Printer, 
  Download, 
  FileSpreadsheet, 
  RefreshCw, 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';
import AccountsNav from '@/components/accounts/AccountsNav';
import TransactionReceiptModal from '@/components/accounts/TransactionReceiptModal';
import { exportToExcel, exportToCSV, formatCurrency } from '@/lib/exportAccounts';

export default function ExpensePage() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    bankAccount: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Cash',
    vendor: '',
    invoiceNo: '',
    description: '',
    status: 'Paid',
  });

  // Dropdowns data
  const [categories, setCategories] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Voucher modal
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/expense?dateFilter=${dateFilter}`;
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res && res.success) {
        setRecords(res.data || []);
        setStats(res.stats || null);
      } else {
        setError(res?.message || 'Failed to fetch expense transactions');
      }
    } catch (err) {
      setError(err?.message || 'Unable to load expense records');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [coaRes, bankRes] = await Promise.all([
        api.get('/chart-of-account?type=Expense'),
        api.get('/bank-account'),
      ]);
      if (coaRes?.success) setCategories(coaRes.data || []);
      if (bankRes?.success) setBankAccounts(bankRes.data || []);
    } catch (e) {
      console.error('Error fetching dropdowns:', e);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [dateFilter, categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({
      title: '',
      amount: '',
      category: categories[0]?.name || 'Staff Salaries',
      bankAccount: bankAccounts[0]?._id || '',
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Cash',
      vendor: '',
      invoiceNo: '',
      description: '',
      status: 'Paid',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({
      title: item.title || '',
      amount: item.amount || '',
      category: item.category || '',
      bankAccount: item.bankAccount?._id || item.bankAccount || '',
      date: item.date ? item.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      paymentMethod: item.paymentMethod || 'Cash',
      vendor: item.vendor || '',
      invoiceNo: item.invoiceNo || '',
      description: item.description || '',
      status: item.status || 'Paid',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || Number(formData.amount) <= 0) {
      alert('Please provide a valid title and positive amount.');
      return;
    }

    try {
      setSaving(true);
      if (editId) {
        await api.put(`/expense/${editId}`, formData);
      } else {
        await api.post('/expense', formData);
      }
      setIsFormOpen(false);
      setEditId(null);
      fetchData();
    } catch (err) {
      alert(err?.message || 'Failed to save expense record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete/void this expense voucher?')) {
      try {
        await api.delete(`/expense/${id}`);
        fetchData();
      } catch (err) {
        alert(err?.message || 'Failed to delete record');
      }
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    if (!records.length) return;
    const exportRows = records.map((r, i) => ({
      SL: i + 1,
      'Voucher No': r.voucherNo || 'N/A',
      Title: r.title,
      Category: r.category,
      'Paid From': r.bankAccountName || r.bankAccount?.name || 'Cash',
      'Amount (PKR)': r.amount,
      Date: r.date ? new Date(r.date).toLocaleDateString('en-GB') : '',
      'Payment Method': r.paymentMethod,
      Vendor: r.vendor || '',
      'Invoice No': r.invoiceNo || '',
      Status: r.status,
    }));
    exportToExcel(exportRows, 'Expense_Records', 'Expenses');
  };

  const handleExportCSV = () => {
    if (!records.length) return;
    const exportRows = records.map((r, i) => ({
      SL: i + 1,
      'Voucher No': r.voucherNo || 'N/A',
      Title: r.title,
      Category: r.category,
      'Paid From': r.bankAccountName || r.bankAccount?.name || 'Cash',
      'Amount (PKR)': r.amount,
      Date: r.date ? new Date(r.date).toLocaleDateString('en-GB') : '',
      Vendor: r.vendor || '',
      Status: r.status,
    }));
    exportToCSV(exportRows, 'Expense_Records');
  };

  // Selected bank account balance preview
  const selectedBank = bankAccounts.find((b) => b._id === formData.bankAccount);
  const isInsufficient = selectedBank && Number(formData.amount) > (selectedBank.currentBalance || selectedBank.openingBalance || 0);

  // Client-side search and pagination
  const filteredRecords = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.voucherNo && r.voucherNo.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      (r.vendor && r.vendor.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Expense Management</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Track disbursements, vendor payments, payroll disbursements, and issue payment vouchers
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Accounts</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/accounts/accounts/income" className="hover:text-zinc-600 transition-colors">Accounts</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-rose-600 font-semibold">Expense</span>
        </div>
      </div>

      {/* Accounts Subnav */}
      <AccountsNav />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Recognized</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-zinc-950">
              {loading ? (
                <div className="h-7 w-28 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats?.totalRecognized || 0)
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Confirmed & disbursed expenses</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Paid Today</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-zinc-950">
              {loading ? (
                <div className="h-7 w-24 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats?.todayTotal || 0)
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Disbursements today</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Paid This Month</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-600">
              {loading ? (
                <div className="h-7 w-28 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats?.thisMonthTotal || 0)
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Monthly operational costs</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs hover:border-amber-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pending / Due</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-600">
              {loading ? (
                <div className="h-7 w-20 bg-zinc-200 animate-pulse rounded"></div>
              ) : (
                formatCurrency(stats?.pendingTotal || 0)
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Unsettled vouchers</p>
          </div>
        </div>
      </div>

      {/* Main Container: Controls & Table */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search title, voucher, vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-950 focus:outline-none focus:ring-1 focus:ring-[#009966]"
              />
            </form>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#009966]"
            >
              <option value="">All Expense Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#009966]"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Void">Void</option>
            </select>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#009966]"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="this-year">This Year</option>
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Record Expense</span>
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
                <th className="px-4 py-3">Voucher No</th>
                <th className="px-4 py-3">Expense Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Paid From</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Payee / Vendor</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-4 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-zinc-200 rounded ml-auto"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-12 bg-zinc-200 rounded mx-auto"></div></td>
                    <td className="px-4 py-3"><div className="h-6 w-20 bg-zinc-200 rounded mx-auto"></div></td>
                  </tr>
                ))
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ArrowUpRight className="h-8 w-8 text-zinc-300" />
                      <p className="font-semibold text-zinc-700">No Expense Records Found</p>
                      <p className="text-zinc-400 max-w-sm text-[11px]">
                        No expenses match your current filters. Click "Record Expense" to issue a new disbursement voucher.
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
                      {item.voucherNo || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-950">{item.title}</div>
                      {item.invoiceNo && (
                        <div className="text-[11px] text-zinc-400">Inv: {item.invoiceNo}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700">
                        {item.category || 'General Expense'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 font-medium">
                      {item.bankAccountName || item.bankAccount?.name || 'Cash in Hand'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {item.vendor || '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 font-medium">
                      {item.date ? new Date(item.date).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Paid'
                            ? 'bg-emerald-50 text-[#009966] border border-emerald-200'
                            : item.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}
                      >
                        {item.status || 'Paid'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedVoucher(item)}
                          className="p-1.5 text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Print Payment Voucher"
                        >
                          <Printer className="h-3.5 w-3.5" />
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
                          title="Delete / Void"
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
            <strong className="text-zinc-900">{filteredRecords.length}</strong> vouchers
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

      {/* Record / Edit Expense Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  {editId ? 'Edit Expense Voucher' : 'Record New Expense'}
                </h3>
                <p className="text-xs text-zinc-500">Provide disbursement details and paying account information</p>
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
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-zinc-700">Expense Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Monthly Electricity Bill, Science Lab Chemicals"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Amount (PKR) *</label>
                  <input
                    type="number"
                    name="amount"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 15000"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Date *</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Expense Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  >
                    {categories.length === 0 ? (
                      <option value="Staff Salaries">Staff Salaries</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Paid From (Bank / Cash Account) *</label>
                  <select
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  >
                    <option value="">Select Paying Account</option>
                    {bankAccounts.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.bankName} - {b.accountTitle} ({formatCurrency(b.currentBalance || b.openingBalance)})
                      </option>
                    ))}
                  </select>
                </div>

                {isInsufficient && (
                  <div className="col-span-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-[11px]">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Warning: Selected account has insufficient balance ({formatCurrency(selectedBank.currentBalance || selectedBank.openingBalance)} available).</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Payee / Vendor</label>
                  <input
                    type="text"
                    name="vendor"
                    placeholder="e.g. WAPDA, Local Book Store"
                    value={formData.vendor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Bill / Invoice Reference #</label>
                  <input
                    type="text"
                    name="invoiceNo"
                    placeholder="e.g. INV-99823"
                    value={formData.invoiceNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Disbursement Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  >
                    <option value="Paid">Paid (Recognized)</option>
                    <option value="Pending">Pending (Payment Due)</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-zinc-700">Particulars / Notes</label>
                  <textarea
                    name="description"
                    rows="2"
                    placeholder="Provide details about this expense..."
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
                  disabled={saving}
                  className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editId ? 'Update Voucher' : 'Issue Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Payment Voucher Modal */}
      <TransactionReceiptModal
        isOpen={!!selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        data={selectedVoucher}
        type="expense"
      />
    </div>
  );
}
