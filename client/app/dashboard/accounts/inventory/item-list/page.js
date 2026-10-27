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
  Package, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Power,
  Layers,
  Warehouse,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDMY } from '@/lib/utils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';
import InventoryNav from '@/components/inventory/InventoryNav';

const UNITS = ['Pcs', 'Box', 'Pack', 'Ream', 'Roll', 'Kg', 'Liter', 'Set', 'Bottle', 'Can', 'Meter'];

export default function ItemListPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [minStock, setMinStock] = useState(10);
  const [unitCost, setUnitCost] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // View Modal state
  const [viewItem, setViewItem] = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/inventory/category?status=Active');
        if (res && res.success) {
          setCategories(res.data || []);
          if (res.data?.length > 0 && !categoryId) {
            setCategoryId(res.data[0]._id);
          }
        }
      } catch (e) {}
    };
    fetchCats();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      let url = '/inventory/item';
      const params = [];
      if (categoryFilter !== 'All') params.push(`category=${encodeURIComponent(categoryFilter)}`);
      if (stockStatusFilter !== 'All') params.push(`stockStatus=${encodeURIComponent(stockStatusFilter)}`);
      if (statusFilter !== 'All') params.push(`status=${encodeURIComponent(statusFilter)}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res && res.success) {
        setItems(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      showToast('Error loading inventory items', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [categoryFilter, stockStatusFilter, statusFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter item name.', true);
      return;
    }
    if (!categoryId) {
      showToast('Please select a category.', true);
      return;
    }

    try {
      setSaving(true);
      const selectedCat = categories.find(c => c._id === categoryId);

      const payload = {
        name: name.trim(),
        code: code.trim(),
        barcode: barcode.trim(),
        categoryId,
        categoryName: selectedCat ? selectedCat.name : '',
        unit,
        description: description.trim(),
        minStock: Number(minStock) || 0,
        unitCost: Number(unitCost) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        status
      };

      let res;
      if (editingId) {
        res = await api.put(`/inventory/item/${editingId}`, payload);
      } else {
        res = await api.post('/inventory/item', payload);
      }

      if (res && res.success) {
        showToast(editingId ? 'Item updated successfully!' : 'Item added to catalog successfully!');
        resetForm();
        fetchItems();
      } else {
        showToast(res?.message || 'Operation failed', true);
      }
    } catch (err) {
      showToast(err.message || 'Error saving item', true);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (it) => {
    setEditingId(it._id);
    setName(it.name || '');
    setCode(it.code || '');
    setBarcode(it.barcode || '');
    setCategoryId(it.categoryId || '');
    setUnit(it.unit || 'Pcs');
    setMinStock(it.minStock !== undefined ? it.minStock : 10);
    setUnitCost(it.unitCost !== undefined ? it.unitCost : 0);
    setSellingPrice(it.sellingPrice !== undefined ? it.sellingPrice : 0);
    setDescription(it.description || '');
    setStatus(it.status || 'Active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleStatus = async (it) => {
    const nextStatus = it.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.put(`/inventory/item/${it._id}`, { status: nextStatus });
      if (res && res.success) {
        showToast(`Item marked as ${nextStatus}.`);
        fetchItems();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', true);
    }
  };

  const handleDelete = async (it) => {
    if (it.totalStock > 0) {
      alert(`Cannot delete "${it.name}": There are still ${it.totalStock} units on hand. Please deactivate instead.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete item "${it.name}"?`)) return;

    try {
      const res = await api.delete(`/inventory/item/${it._id}`);
      if (res && res.success) {
        showToast('Item deleted successfully.');
        if (editingId === it._id) resetForm();
        fetchItems();
      } else {
        showToast(res?.message || 'Delete failed', true);
      }
    } catch (err) {
      showToast(err.message || 'Error deleting item', true);
    }
  };

  const handleViewDetails = async (it) => {
    try {
      const res = await api.get(`/inventory/item/${it._id}`);
      if (res && res.success) {
        setViewItem(res.data);
      } else {
        setViewItem(it);
      }
    } catch (e) {
      setViewItem(it);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setBarcode('');
    setUnit('Pcs');
    setMinStock(10);
    setUnitCost(0);
    setSellingPrice(0);
    setDescription('');
    setStatus('Active');
  };

  const filteredItems = items.filter(it => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      it.name?.toLowerCase().includes(q) ||
      it.code?.toLowerCase().includes(q) ||
      it.barcode?.toLowerCase().includes(q) ||
      it.categoryName?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
              <Package className="w-5 h-5" />
            </span>
            Inventory Item Master List
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Real-time stock catalog, reorder thresholds, pricing, and multi-store balances.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <Link href="/dashboard/accounts/inventory" className="hover:text-zinc-900 transition-colors">Inventory</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-[#009966] font-bold">Item List</span>
        </div>
      </div>

      {/* Sub Navigation */}
      <InventoryNav />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total SKUs</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#009966]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{stats?.totalItems || items.length}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Catalogued unique items</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Units On Hand</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{stats?.totalUnitsOnHand || 0}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Aggregated physical stock</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Low Stock Alert</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{stats?.lowStock || 0}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Below reorder minimum level</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Out of Stock</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">{stats?.outOfStock || 0}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Zero available balance</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs sticky top-20">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide flex items-center gap-2">
                <Package className="w-4 h-4 text-[#009966]" />
                {editingId ? 'Edit Inventory Item' : 'Add New Inventory Item'}
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

            <form onSubmit={handleSave} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Item Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sterile Surgical Gloves 7.5 (Box of 50 Pairs)"
                  required
                  className="bg-white border-zinc-300 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Item Code / SKU
                  </Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Auto or ITM-MED-001"
                    className="bg-white border-zinc-300 text-xs font-medium uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Barcode</Label>
                  <Input
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 8964001"
                    className="bg-white border-zinc-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Category <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 font-medium"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Unit <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 font-medium"
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Min Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="bg-white border-zinc-300 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Unit Cost (PKR)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="bg-white border-zinc-300 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Sell Price (PKR)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="bg-white border-zinc-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specifications, brand, storage temperature or clinical usage..."
                  className="flex min-h-[50px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium"
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
                  {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add to Catalog'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Items Table */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                    Master Inventory Records ({filteredItems.length})
                  </h2>
                  <button
                    onClick={fetchItems}
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
                      placeholder="Search Name, Code, Barcode..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                      className="pl-8 w-full sm:w-[220px] h-8 bg-white border-zinc-300 text-zinc-950 text-xs font-medium"
                    />
                  </div>

                  <TableExportToolbar
                    data={filteredItems.map(it => ({
                      Code: it.code,
                      Name: it.name,
                      Category: it.categoryName,
                      Unit: it.unit,
                      AvailableStock: it.totalStock,
                      MinStock: it.minStock,
                      StockStatus: it.stockStatus,
                      UnitCost: it.unitCost,
                      SellPrice: it.sellingPrice,
                      Status: it.status
                    }))}
                    fileName="stoofi_inventory_items"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-100">
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-800"
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>

                <select
                  value={stockStatusFilter}
                  onChange={(e) => { setStockStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-800"
                >
                  <option value="All">All Stock Levels</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock Alert</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-800"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <span className="text-[11px] text-zinc-400 font-medium ml-auto">
                  Showing {paginatedItems.length} of {filteredItems.length} items
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="text-[11px] text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Code / SKU</th>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Available Stock</th>
                    <th className="px-4 py-3">Stock Status</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-12 text-center text-zinc-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#009966] mb-2" />
                        Loading inventory items from database...
                      </td>
                    </tr>
                  ) : paginatedItems.length > 0 ? (
                    paginatedItems.map((it, i) => (
                      <tr key={it._id || i} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                        <td className="px-4 py-3.5 text-zinc-600 font-semibold">
                          {(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[11px] font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded">
                            {it.code}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div 
                            onClick={() => handleViewDetails(it)}
                            className="font-bold text-zinc-950 hover:text-[#009966] cursor-pointer transition-colors max-w-xs truncate"
                            title={it.name}
                          >
                            {it.name}
                          </div>
                          {it.barcode && (
                            <div className="text-[10px] text-zinc-500 font-mono">Barcode: {it.barcode}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-700">
                          {it.categoryName}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-700 font-bold">
                          {it.unit}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-zinc-950 text-sm">
                            {it.totalStock || 0}
                          </span>
                          <span className="text-zinc-500 text-[11px] ml-1">/ min {it.minStock || 0}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            it.stockStatus === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            it.stockStatus === 'Low Stock' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {it.stockStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            it.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}>
                            {it.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(it)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer"
                              title="View Details & Store Stock"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(it)}
                              className={`p-1.5 rounded cursor-pointer ${
                                it.status === 'Active' ? 'text-zinc-400 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={it.status === 'Active' ? 'Deactivate' : 'Activate'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(it)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer"
                              title="Edit Item"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(it)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-4 py-12 text-center text-zinc-500 font-medium">
                        <div className="max-w-xs mx-auto">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-2 text-zinc-400">
                            <Package className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-zinc-900">No Items Found</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Add your first item using the form on the left.
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
                Showing {filteredItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
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

      {/* Item Details Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-zinc-50 to-emerald-50/40 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {viewItem.code}
                </span>
                <h3 className="text-base font-bold text-zinc-950 mt-1">{viewItem.name}</h3>
              </div>
              <button 
                onClick={() => setViewItem(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Core Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-bold">Category</div>
                  <div className="font-bold text-zinc-950 mt-0.5">{viewItem.categoryName}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-bold">Unit of Measure</div>
                  <div className="font-bold text-zinc-950 mt-0.5">{viewItem.unit}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-bold">Total Stock</div>
                  <div className="font-bold text-[#009966] text-sm mt-0.5">{viewItem.totalStock || 0} {viewItem.unit}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-bold">Reorder Level</div>
                  <div className="font-bold text-zinc-950 mt-0.5">{viewItem.minStock || 0} {viewItem.unit}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-bold">Unit Cost</div>
                  <div className="font-bold text-zinc-950 mt-0.5">PKR {Number(viewItem.unitCost || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-bold">Selling Price</div>
                  <div className="font-bold text-zinc-950 mt-0.5">PKR {Number(viewItem.sellingPrice || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-bold">Status</div>
                  <div className="font-bold text-zinc-950 mt-0.5">{viewItem.status}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-bold">Barcode</div>
                  <div className="font-mono text-zinc-950 mt-0.5">{viewItem.barcode || 'N/A'}</div>
                </div>
              </div>

              {/* Store Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Warehouse className="w-3.5 h-3.5 text-[#009966]" /> Stock Available by Store / Warehouse
                </h4>
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-50 font-bold text-zinc-700 uppercase border-b border-zinc-200">
                      <tr>
                        <th className="px-3.5 py-2">Store / Warehouse Name</th>
                        <th className="px-3.5 py-2 text-right">Available Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {viewItem.storeStock && viewItem.storeStock.length > 0 ? (
                        viewItem.storeStock.map((st, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50">
                            <td className="px-3.5 py-2.5 font-bold text-zinc-950">{st.storeName}</td>
                            <td className="px-3.5 py-2.5 text-right font-bold text-zinc-900">
                              {st.quantity} {viewItem.unit}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="px-3.5 py-4 text-center text-zinc-500">
                            No stock recorded in stores yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Movements History */}
              {viewItem.recentMovements && viewItem.recentMovements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#009966]" /> Recent Stock Movement Ledger
                  </h4>
                  <div className="border border-zinc-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-zinc-50 font-bold text-zinc-700 uppercase border-b border-zinc-200">
                        <tr>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Type</th>
                          <th className="px-3 py-2">Store</th>
                          <th className="px-3 py-2">Ref No</th>
                          <th className="px-3 py-2 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {viewItem.recentMovements.map((m, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50">
                            <td className="px-3 py-2 text-zinc-600 font-mono">{formatDateDMY(m.date)}</td>
                            <td className="px-3 py-2">
                              <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                                m.transactionType === 'RECEIVE' ? 'bg-emerald-50 text-emerald-800' :
                                m.transactionType === 'SELL' ? 'bg-blue-50 text-blue-800' :
                                m.transactionType === 'ISSUE' ? 'bg-amber-50 text-amber-800' :
                                'bg-purple-50 text-purple-800'
                              }`}>
                                {m.transactionType}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-zinc-700">{m.storeName}</td>
                            <td className="px-3 py-2 font-mono text-zinc-700">{m.referenceNo || '-'}</td>
                            <td className="px-3 py-2 text-right font-bold">
                              <span className={m.netQuantity > 0 ? 'text-[#009966]' : 'text-rose-600'}>
                                {m.netQuantity > 0 ? `+${m.netQuantity}` : m.netQuantity} {viewItem.unit}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-200 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewItem(null)}
                className="text-xs font-semibold border-zinc-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
