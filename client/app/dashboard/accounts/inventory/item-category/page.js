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
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Layers,
  Power
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDMY } from '@/lib/utils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';
import InventoryNav from '@/components/inventory/InventoryNav';

export default function ItemCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      let url = '/inventory/category';
      if (statusFilter !== 'All') url += `?status=${statusFilter}`;
      if (search) url += `${url.includes('?') ? '&' : '?'}search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res && res.success) {
        setCategories(res.data || []);
      } else if (Array.isArray(res)) {
        setCategories(res);
      }
    } catch (err) {
      console.error('Error fetching item categories:', err);
      showToast('Error loading item categories', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [statusFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter category name.', true);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        status
      };

      let res;
      if (editingId) {
        res = await api.put(`/inventory/category/${editingId}`, payload);
      } else {
        res = await api.post('/inventory/category', payload);
      }

      if (res && res.success) {
        showToast(editingId ? 'Category updated successfully!' : 'Category created successfully!');
        resetForm();
        fetchCategories();
      } else {
        showToast(res?.message || 'Operation failed', true);
      }
    } catch (err) {
      showToast(err.message || 'Error saving category', true);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name || '');
    setCode(cat.code || '');
    setDescription(cat.description || '');
    setStatus(cat.status || 'Active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleStatus = async (cat) => {
    const nextStatus = cat.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.put(`/inventory/category/${cat._id}`, { status: nextStatus });
      if (res && res.success) {
        showToast(`Category marked as ${nextStatus}.`);
        fetchCategories();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', true);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.itemCount > 0) {
      alert(`Cannot delete "${cat.name}": ${cat.itemCount} inventory items belong to this category. Please deactivate it instead.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await api.delete(`/inventory/category/${cat._id}`);
      if (res && res.success) {
        showToast('Category deleted successfully.');
        if (editingId === cat._id) resetForm();
        fetchCategories();
      } else {
        showToast(res?.message || 'Delete failed', true);
      }
    } catch (err) {
      showToast(err.message || 'Error deleting category', true);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setDescription('');
    setStatus('Active');
  };

  // Filtered
  const filteredCategories = categories.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalItemsCount = categories.reduce((sum, c) => sum + (Number(c.itemCount) || 0), 0);
  const activeCategoriesCount = categories.filter(c => c.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 ${
          toast.isError ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {toast.isError ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-[#009966]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-[#009966]">
              <Tag className="w-5 h-5" />
            </span>
            Item Categories
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Classify and group laboratory, clinical, medical, and stationery inventory items.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <Link href="/dashboard/accounts/inventory" className="hover:text-zinc-900 transition-colors">Inventory</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-[#009966] font-bold">Item Category</span>
        </div>
      </div>

      {/* Sub Navigation */}
      <InventoryNav />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Categories</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#009966]">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{categories.length}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Configured inventory classifications</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Categories</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{activeCategoriesCount}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Available in item master & GRN dropdowns</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Linked Items</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{totalItemsCount}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">SKUs assigned across categories</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs sticky top-20">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#009966]" />
                {editingId ? 'Edit Item Category' : 'Add Item Category'}
              </h2>
              {editingId && (
                <button 
                  onClick={resetForm}
                  className="p-1 text-zinc-400 hover:text-zinc-700 rounded cursor-pointer"
                  title="Cancel edit"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Category Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Laboratory Equipment & Glassware"
                  required
                  className="bg-white border-zinc-300 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Category Code <span className="text-zinc-400 font-normal lowercase">(optional)</span>
                </Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CAT-LAB"
                  className="bg-white border-zinc-300 text-xs font-medium uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what items belong to this category..."
                  className="flex min-h-[70px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 border-zinc-300 text-zinc-700 text-xs h-9"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#009966] hover:bg-[#007a52] text-white font-bold text-xs shadow-xs h-9"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Category' : 'Save Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Category List Table */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                  Item Category List ({filteredCategories.length})
                </h2>
                <button
                  onClick={fetchCategories}
                  className="p-1 text-zinc-400 hover:text-zinc-700 rounded cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#009966]' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input
                    placeholder="Search Categories..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="pl-8 w-full sm:w-[200px] h-8 bg-white border-zinc-300 text-zinc-950 text-xs font-medium"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-800"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <TableExportToolbar
                  data={filteredCategories.map(c => ({
                    Name: c.name,
                    Code: c.code,
                    Items: c.itemCount || 0,
                    Description: c.description,
                    Status: c.status,
                    Created: formatDateDMY(c.createdAt)
                  }))}
                  fileName="stoofi_item_categories"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="text-[11px] text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Category Title</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Items Count</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-zinc-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#009966] mb-2" />
                        Loading item categories from database...
                      </td>
                    </tr>
                  ) : paginatedCategories.length > 0 ? (
                    paginatedCategories.map((c, i) => (
                      <tr key={c._id || i} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                        <td className="px-4 py-3.5 text-zinc-600 font-semibold">
                          {(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-zinc-950">{c.name}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {c.code || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-zinc-900">
                          <span className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                            {c.itemCount || 0} items
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600 max-w-xs truncate" title={c.description}>
                          {c.description || '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            c.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(c)}
                              className={`p-1.5 rounded cursor-pointer ${
                                c.status === 'Active' ? 'text-zinc-400 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={c.status === 'Active' ? 'Deactivate' : 'Activate'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(c)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-zinc-500 font-medium">
                        <div className="max-w-xs mx-auto">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-2 text-zinc-400">
                            <Tag className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-zinc-900">No Categories Found</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Create your first item category using the form on the left.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium">
              <div>
                Showing {filteredCategories.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className="h-7 px-2.5 text-xs text-zinc-700 border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-40"
                >
                  Previous
                </Button>
                <span className="px-2 text-zinc-700 font-bold">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-7 px-2.5 text-xs text-zinc-700 border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-40"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
