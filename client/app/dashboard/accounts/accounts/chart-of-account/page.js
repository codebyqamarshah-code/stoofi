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
  BookOpen, 
  CheckCircle, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Scale
} from 'lucide-react';
import api from '@/services/api';
import AccountsNav from '@/components/accounts/AccountsNav';
import { exportToExcel, exportToCSV } from '@/lib/exportAccounts';

const ACCOUNT_TYPES = ['All', 'Asset', 'Liability', 'Equity', 'Income', 'Expense'];

export default function ChartOfAccountPage() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Income',
    description: '',
    status: 'Active',
  });

  // Filters
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/chart-of-account';
      if (selectedType !== 'All') {
        url += `?type=${selectedType}`;
      }
      const res = await api.get(url);
      if (res && res.success) {
        setRecords(res.data || []);
        setStats(res.stats || null);
      } else {
        setError(res?.message || 'Failed to fetch Chart of Accounts');
      }
    } catch (err) {
      setError(err?.message || 'Unable to load Chart of Accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [selectedType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({
      code: '',
      name: '',
      type: selectedType !== 'All' ? selectedType : 'Income',
      description: '',
      status: 'Active',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      type: item.type || 'Income',
      description: item.description || '',
      status: item.status || 'Active',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      alert('Please fill in Account Name and Type.');
      return;
    }

    try {
      setSaving(true);
      if (editId) {
        await api.put(`/chart-of-account/${editId}`, formData);
      } else {
        await api.post('/chart-of-account', formData);
      }
      setIsFormOpen(false);
      setEditId(null);
      fetchData();
    } catch (err) {
      alert(err?.message || 'Failed to save account definition');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete or deactivate this account from the Chart of Accounts?')) {
      try {
        const res = await api.delete(`/chart-of-account/${id}`);
        alert(res?.message || 'Account removed / deactivated.');
        fetchData();
      } catch (err) {
        alert(err?.message || 'Failed to delete account');
      }
    }
  };

  const handleExportExcel = () => {
    if (!records.length) return;
    const exportRows = records.map((r, i) => ({
      SL: i + 1,
      Code: r.code,
      Name: r.name,
      Type: r.type,
      Description: r.description || '',
      Status: r.status,
    }));
    exportToExcel(exportRows, 'Chart_Of_Accounts', 'COA');
  };

  const handleExportCSV = () => {
    if (!records.length) return;
    const exportRows = records.map((r, i) => ({
      SL: i + 1,
      Code: r.code,
      Name: r.name,
      Type: r.type,
      Description: r.description || '',
      Status: r.status,
    }));
    exportToCSV(exportRows, 'Chart_Of_Accounts');
  };

  const filteredRecords = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.code && r.code.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Income':
        return 'bg-emerald-50 text-[#009966] border-emerald-200';
      case 'Expense':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'Asset':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Liability':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Equity':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Chart of Accounts (COA)</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Standard general ledger account hierarchy for classifying assets, liabilities, revenue & expenditures
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Accounts</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/accounts/accounts/income" className="hover:text-zinc-600 transition-colors">Accounts</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-semibold">Chart of Account</span>
        </div>
      </div>

      {/* Accounts Subnav */}
      <AccountsNav />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-bold uppercase">
            <span>Total Accounts</span>
            <Layers className="h-3.5 w-3.5 text-zinc-600" />
          </div>
          <p className="text-xl font-black text-zinc-950 mt-1">
            {loading ? '-' : stats?.total || records.length}
          </p>
          <span className="text-[10px] text-zinc-400">All General Ledgers</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 text-[11px] font-bold uppercase">
            <span>Income Headings</span>
            <TrendingUp className="h-3.5 w-3.5 text-[#009966]" />
          </div>
          <p className="text-xl font-black text-[#009966] mt-1">
            {loading ? '-' : stats?.income || 0}
          </p>
          <span className="text-[10px] text-zinc-400">Tuition & revenues</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-rose-800 text-[11px] font-bold uppercase">
            <span>Expense Heads</span>
            <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
          </div>
          <p className="text-xl font-black text-rose-600 mt-1">
            {loading ? '-' : stats?.expense || 0}
          </p>
          <span className="text-[10px] text-zinc-400">Salaries & utilities</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-blue-800 text-[11px] font-bold uppercase">
            <span>Asset Accounts</span>
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-700 mt-1">
            {loading ? '-' : stats?.asset || 0}
          </p>
          <span className="text-[10px] text-zinc-400">Bank, Cash, Property</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold uppercase">
            <span>Liabilities</span>
            <Scale className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-700 mt-1">
            {loading ? '-' : stats?.liability || 0}
          </p>
          <span className="text-[10px] text-zinc-400">Payables & security</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-purple-800 text-[11px] font-bold uppercase">
            <span>Equity Accounts</span>
            <BookOpen className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <p className="text-xl font-black text-purple-700 mt-1">
            {loading ? '-' : stats?.equity || 0}
          </p>
          <span className="text-[10px] text-zinc-400">Capital & Reserves</span>
        </div>
      </div>

      {/* Main Container: Controls & Table */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Account Type Tabs */}
            <div className="flex items-center bg-zinc-100 p-1 rounded-lg">
              {ACCOUNT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                    selectedType === type
                      ? 'bg-white text-zinc-950 shadow-xs font-bold'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search account code or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-950 focus:outline-none focus:ring-1 focus:ring-[#009966]"
              />
            </div>
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
              <span>New Account Head</span>
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
                <th className="px-4 py-3">Account Code</th>
                <th className="px-4 py-3">Account Title / Heading</th>
                <th className="px-4 py-3">Classification</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-4 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-40 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-48 bg-zinc-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-14 bg-zinc-200 rounded mx-auto"></div></td>
                    <td className="px-4 py-3"><div className="h-6 w-16 bg-zinc-200 rounded mx-auto"></div></td>
                  </tr>
                ))
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <BookOpen className="h-8 w-8 text-zinc-300" />
                      <p className="font-semibold text-zinc-700">No Account Heads Found</p>
                      <p className="text-zinc-400 max-w-sm text-[11px]">
                        No account heads match the selected filter. Click "New Account Head" above to add one.
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
                      {item.code || '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-950">
                      {item.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTypeBadge(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 max-w-xs truncate">
                      {item.description || '—'}
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
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete / Deactivate"
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
            <strong className="text-zinc-900">{filteredRecords.length}</strong> account heads
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

      {/* Record / Edit Chart of Account Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  {editId ? 'Edit Account Head' : 'Add New Account Head'}
                </h3>
                <p className="text-xs text-zinc-500">Configure ledger classification and accounting rules</p>
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
                  <label className="font-semibold text-zinc-700">Account Code</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="e.g. 1010, 4010, 5020"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950 font-mono font-bold"
                  />
                  <p className="text-[10px] text-zinc-400">Leave blank for auto-numbering</p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Account Classification *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950 font-medium"
                  >
                    <option value="Income">Income (Revenue)</option>
                    <option value="Expense">Expense (Disbursement)</option>
                    <option value="Asset">Asset (Current & Fixed)</option>
                    <option value="Liability">Liability (Current & Long-term)</option>
                    <option value="Equity">Equity (Capital & Reserves)</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-zinc-700">Account Title / Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Examination Fee, Laboratory Chemical Supplies"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-zinc-700">Description / Purpose</label>
                  <textarea
                    name="description"
                    rows="2"
                    placeholder="Brief explanation of transactions posted under this heading..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#009966] text-zinc-950"
                  ></textarea>
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
    </div>
  );
}
