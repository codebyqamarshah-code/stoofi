'use client';

import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Settings,
  Layers,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Download,
  Printer,
  FileCheck,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  Tag,
  MessageSquare,
  HelpCircle,
  Send,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

const SETUP_CATEGORIES = [
  { id: 'All', label: 'All Categories', icon: Layers },
  { id: 'Purpose', label: 'Visitor Purpose', icon: HelpCircle },
  { id: 'Complaint Type', label: 'Complaint Type', icon: MessageSquare },
  { id: 'Source', label: 'Admission Source', icon: Tag },
  { id: 'Reference', label: 'Reference', icon: SlidersHorizontal },
  { id: 'Call Purpose', label: 'Call Purpose', icon: Phone },
  { id: 'Postal Type', label: 'Postal Type', icon: Send }
];

export default function AdminSetupPage() {
  const [setups, setSetups] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalCategories: 6 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  // Form / Editing
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  const [formData, setFormData] = useState({
    type: 'Purpose',
    name: '',
    description: '',
    status: 'Active'
  });

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: searchQuery.trim(),
        type: activeCategory !== 'All' ? activeCategory : '',
        status: statusFilter !== 'All' ? statusFilter : ''
      });

      const [res, statsRes] = await Promise.all([
        api.get(`/setup?${queryParams.toString()}`),
        api.get('/setup/stats').catch(() => null)
      ]);

      if (res?.success) {
        setSetups(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }

      if (statsRes?.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Error fetching admin setups:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch admin setup records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, activeCategory, statusFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      type: activeCategory !== 'All' ? activeCategory : 'Purpose',
      name: '',
      description: '',
      status: 'Active'
    });
    setShowFormModal(true);
  };

  const handleEdit = (setup) => {
    setEditingId(setup._id);
    setFormData({
      type: setup.type || 'Purpose',
      name: setup.name || '',
      description: setup.description || '',
      status: setup.status || 'Active'
    });
    setShowFormModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Item name is required.', true);
      return;
    }
    if (!formData.type.trim()) {
      showToast('Category type is required.', true);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        type: formData.type.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status
      };

      if (editingId) {
        const res = await api.put(`/setup/${editingId}`, payload);
        if (res?.success) {
          showToast('Setup item updated successfully!');
          fetchData();
        }
      } else {
        const res = await api.post('/setup', payload);
        if (res?.success) {
          showToast('Setup item created successfully!');
          fetchData();
        }
      }

      setShowFormModal(false);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save setup item:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save setup item.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (setup) => {
    try {
      const res = await api.patch(`/setup/${setup._id}/status`);
      if (res?.success) {
        setSetups(prev => prev.map(s => s._id === setup._id ? { ...s, status: res.data.status } : s));
        showToast(res.message || `Status updated to ${res.data.status}`);
        const statsRes = await api.get('/setup/stats').catch(() => null);
        if (statsRes?.success) setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to update status.', true);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await api.delete(`/setup/${deleteConfirmItem._id}`);
      if (res?.success) {
        showToast('Setup record deleted successfully.');
        setDeleteConfirmItem(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete setup record:', err);
      showToast(err?.response?.data?.message || 'Failed to delete setup record.', true);
    }
  };

  const handleExport = (type) => {
    if (setups.length === 0) {
      showToast('No setup items available to export.', true);
      return;
    }

    const exportData = setups.map((item, index) => ({
      'SL': (page - 1) * 10 + index + 1,
      'Category Type': item.type,
      'Item Name': item.name,
      'Description': item.description || '-',
      'Status': item.status,
      'Updated Date': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : '-'
    }));

    const headers = Object.keys(exportData[0] || {});
    const filename = `Admin_Setup_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi ERP - Admin Setup Configurations');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV export downloaded successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'AdminSetup');
      showToast('Excel export downloaded successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Admin Setup Configuration Register', filename);
      showToast('PDF summary downloaded successfully!');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-4 ${
            toastMessage.isError 
              ? 'bg-rose-50 text-rose-800 border-rose-200' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toastMessage.isError ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-zinc-400 hover:text-zinc-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Settings className="w-6 h-6 text-zinc-900" />
            Admin Setup
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage system-wide dropdown categories: visitor purposes, complaint types, inquiry sources, and references
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg">
          <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-700 transition-colors">Admin Section</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-semibold">Admin Setup</span>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Items</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{stats.total}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Configured across all categories</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active Items</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{stats.active}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Visible in ERP dropdowns</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Inactive</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
              <X className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-700 mt-2">{stats.inactive}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Archived / Hidden items</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Categories</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{stats.totalCategories || 6}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">System setup types</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {SETUP_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                isActive 
                  ? 'bg-zinc-950 text-white shadow-xs' 
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main List Container */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-950">
              {activeCategory === 'All' ? 'All Setup Configurations' : `${activeCategory} Items`}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
              {pagination.total} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search by name or description..." 
                className="pl-8 h-8 text-xs bg-white border-zinc-300 text-zinc-950 focus-visible:ring-1 focus-visible:ring-zinc-900" 
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            {/* Export Toolbar */}
            <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-2xs">
              <button onClick={() => handleExport('Excel')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 text-xs font-medium" title="Excel">
                <Download className="h-3.5 w-3.5 text-emerald-600" />
              </button>
              <button onClick={() => handleExport('CSV')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 text-xs font-medium border-l border-zinc-200" title="CSV">
                <FileCheck className="h-3.5 w-3.5 text-blue-600" />
              </button>
              <button onClick={() => handleExport('PDF')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 text-xs font-medium border-l border-zinc-200" title="PDF">
                <Download className="h-3.5 w-3.5 text-rose-600" />
              </button>
              <button onClick={() => handleExport('Print')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 text-xs font-medium border-l border-zinc-200" title="Print">
                <Printer className="h-3.5 w-3.5 text-zinc-700" />
              </button>
            </div>

            {/* Refresh */}
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-zinc-600 border-zinc-300 hover:bg-zinc-100"
              title="Refresh setup items"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>

            {/* Create Button */}
            <Button 
              onClick={handleOpenCreate}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium h-8 text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              ADD SETUP ITEM
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={fetchData} className="h-7 text-xs bg-white border-rose-200 text-rose-700 hover:bg-rose-100">
              Retry
            </Button>
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto min-h-[260px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <Loader2 className="w-7 h-7 animate-spin text-zinc-800" />
              <p className="text-xs text-zinc-500">Loading admin setup configurations...</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold bg-zinc-50/80 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">SL</th>
                  <th className="px-4 py-3 font-semibold">Category Type</th>
                  <th className="px-4 py-3 font-semibold">Item Name</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated Date</th>
                  <th className="px-4 py-3 font-semibold w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70">
                {setups.length > 0 ? (
                  setups.map((s, i) => {
                    const slNo = (page - 1) * 10 + i + 1;
                    return (
                      <tr key={s._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3 text-center text-zinc-500 font-mono">{slNo}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {s.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-zinc-950">
                          {s.name}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 max-w-sm truncate">
                          {s.description || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatus(s)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors border ${
                              s.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-600' : 'bg-zinc-400'}`} />
                            {s.status || 'Active'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              onClick={() => handleEdit(s)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                              title="Edit Record"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              onClick={() => setDeleteConfirmItem(s)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete Record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-16 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Settings className="w-10 h-10 text-zinc-300" />
                        <p className="font-semibold text-zinc-800 text-sm">No Setup Records Found</p>
                        <p className="text-xs text-zinc-400 max-w-sm">
                          {searchQuery || activeCategory !== 'All'
                            ? 'No records match your selected category or search keyword.' 
                            : 'Click "+ ADD SETUP ITEM" to configure a new option for school modules.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/40 text-xs text-zinc-600">
            <div>
              Showing <span className="font-semibold text-zinc-950">{(page - 1) * 10 + 1}</span> to <span className="font-semibold text-zinc-950">{Math.min(page * 10, pagination.total)}</span> of <span className="font-semibold text-zinc-950">{pagination.total}</span> items
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="h-7 text-xs px-2.5 bg-white border-zinc-300"
              >
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={`h-7 w-7 p-0 text-xs ${
                    p === page 
                      ? 'bg-zinc-950 text-white font-bold' 
                      : 'bg-white border-zinc-300 text-zinc-700'
                  }`}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                className="h-7 text-xs px-2.5 bg-white border-zinc-300"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                <h2 className="text-base font-bold text-zinc-950">
                  {editingId ? 'Edit Setup Item' : 'Add New Setup Item'}
                </h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFormModal(false)} 
                className="text-zinc-400 hover:text-zinc-700 h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                  Category / Setup Type <span className="text-rose-500">*</span>
                </Label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({ ...formData, type: e.target.value })} 
                  className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 font-semibold" 
                  required
                >
                  <option value="Purpose">Purpose (Visitor Book / Campus)</option>
                  <option value="Complaint Type">Complaint Type</option>
                  <option value="Source">Source (Admission Inquiries)</option>
                  <option value="Reference">Reference (Inquiries / Referrals)</option>
                  <option value="Call Purpose">Call Purpose (Phone Call Log)</option>
                  <option value="Postal Type">Postal Type (Dispatch / Receive)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                  Item Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g. Academic Consultation / Transport Inquiry" 
                  className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                  Description
                </Label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Optional details or context for this setup option..." 
                  className="w-full min-h-[70px] rounded-lg border border-zinc-300 bg-white p-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                  Status
                </Label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({ ...formData, status: e.target.value })} 
                  className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900" 
                >
                  <option value="Active">Active (Visible in dropdowns)</option>
                  <option value="Inactive">Inactive (Hidden from dropdowns)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFormModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs px-5 shadow-xs"
                >
                  {submitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    editingId ? 'UPDATE ITEM' : 'SAVE SETUP ITEM'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-950">Confirm Deletion</h3>
                <p className="text-xs text-zinc-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              Are you sure you want to delete <strong className="text-zinc-900">&ldquo;{deleteConfirmItem.name}&rdquo;</strong> from category <strong className="text-zinc-900">&ldquo;{deleteConfirmItem.type}&rdquo;</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteConfirmItem(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Delete Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
