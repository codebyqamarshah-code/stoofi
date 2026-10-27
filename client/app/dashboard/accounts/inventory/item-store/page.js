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
  Warehouse, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Power,
  Eye,
  MapPin,
  Phone,
  User,
  PackageCheck,
  Boxes,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDMY } from '@/lib/utils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';
import InventoryNav from '@/components/inventory/InventoryNav';

export default function ItemStorePage() {
  const [stores, setStores] = useState([]);
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    totalItemsStored: 0,
    totalStockUnits: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [managerName, setManagerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');

  // Search, Filter & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // View Modal
  const [selectedStore, setSelectedStore] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [storeItems, setStoreItems] = useState([]);
  const [loadingStoreItems, setLoadingStoreItems] = useState(false);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      let url = '/inventory/store';
      const params = [];
      if (statusFilter !== 'All') params.push(`status=${encodeURIComponent(statusFilter)}`);
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res && res.success) {
        setStores(res.data || []);
        if (res.stats) setStats(res.stats);
      } else if (Array.isArray(res)) {
        setStores(res);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      showToast('Error loading item stores from database', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [statusFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter store name.', true);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        location: location.trim(),
        managerName: managerName.trim(),
        contactNumber: contactNumber.trim(),
        description: description.trim(),
        status
      };

      let res;
      if (editingId) {
        res = await api.put(`/inventory/store/${editingId}`, payload);
      } else {
        res = await api.post('/inventory/store', payload);
      }

      if (res && res.success) {
        showToast(editingId ? 'Store updated successfully!' : 'Store created successfully!');
        resetForm();
        fetchStores();
      } else {
        showToast(res?.message || 'Failed to save store record.', true);
      }
    } catch (err) {
      console.error('Error saving store:', err);
      showToast(err.response?.data?.message || 'Failed to save store.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (store) => {
    setEditingId(store._id);
    setName(store.name || '');
    setCode(store.code || '');
    setLocation(store.location || '');
    setManagerName(store.managerName || '');
    setContactNumber(store.contactNumber || '');
    setDescription(store.description || '');
    setStatus(store.status || 'Active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, storeName) => {
    if (!confirm(`Are you sure you want to delete store "${storeName}"?`)) return;

    try {
      const res = await api.delete(`/inventory/store/${id}`);
      if (res && res.success) {
        showToast(`Store "${storeName}" deleted successfully!`);
        if (editingId === id) resetForm();
        fetchStores();
      } else {
        showToast(res?.message || 'Cannot delete store.', true);
      }
    } catch (err) {
      console.error('Error deleting store:', err);
      showToast(err.response?.data?.message || 'Failed to delete store.', true);
    }
  };

  const handleToggleStatus = async (store) => {
    const nextStatus = store.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.put(`/inventory/store/${store._id}`, { status: nextStatus });
      if (res && res.success) {
        showToast(`Store marked as ${nextStatus}!`);
        fetchStores();
      }
    } catch (err) {
      showToast('Failed to toggle status.', true);
    }
  };

  const openViewModal = async (store) => {
    setSelectedStore(store);
    setIsViewModalOpen(true);
    try {
      setLoadingStoreItems(true);
      // Fetch items stored in this store
      const res = await api.get(`/inventory/item?storeId=${store._id}&status=Active`);
      if (res && res.success) {
        setStoreItems(res.data || []);
      } else {
        setStoreItems([]);
      }
    } catch (err) {
      console.error('Error loading store items:', err);
      setStoreItems([]);
    } finally {
      setLoadingStoreItems(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setLocation('');
    setManagerName('');
    setContactNumber('');
    setDescription('');
    setStatus('Active');
  };

  // Filtered & Paginated records
  const filteredStores = stores.filter(store => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      store.name?.toLowerCase().includes(q) ||
      store.code?.toLowerCase().includes(q) ||
      store.location?.toLowerCase().includes(q) ||
      store.managerName?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage) || 1;
  const paginatedStores = filteredStores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportColumns = [
    { key: 'code', label: 'Store Code' },
    { key: 'name', label: 'Store Name' },
    { key: 'location', label: 'Location' },
    { key: 'managerName', label: 'Manager / In-Charge' },
    { key: 'contactNumber', label: 'Contact Number' },
    { key: 'itemCount', label: 'Items Stored' },
    { key: 'totalStockQuantity', label: 'Total Stock Units' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created At' }
  ];

  const exportData = filteredStores.map(s => ({
    ...s,
    createdAt: formatDateDMY(s.createdAt)
  }));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
          toast.isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.isError ? <AlertCircle className="h-4 w-4 shrink-0 text-red-600" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2.5">
            <Warehouse className="h-7 w-7 text-[#009966]" />
            Item Store Management
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage physical warehouses, department stores, lab stock rooms, and track real-time inventory allocation.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/accounts/inventory/item-list" className="hover:text-zinc-500 transition-colors">Inventory</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Item Store</span>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <InventoryNav />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-[#009966]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{stats.totalStores || stores.length}</div>
            <div className="text-xs text-zinc-500 font-medium">Total Stores</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{stats.activeStores || stores.filter(s => s.status === 'Active').length}</div>
            <div className="text-xs text-zinc-500 font-medium">Active Stores</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{stats.totalItemsStored || 0}</div>
            <div className="text-xs text-zinc-500 font-medium">Unique Items Stored</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{stats.totalStockUnits ? stats.totalStockUnits.toLocaleString() : 0}</div>
            <div className="text-xs text-zinc-500 font-medium">Total Units in Stock</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Form + Right Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left: Add/Edit Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl sticky top-4">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-[#009966]" />
                <h2 className="text-base font-semibold text-zinc-950">
                  {editingId ? 'Edit Item Store' : 'Add New Store'}
                </h2>
              </div>
              {editingId && (
                <button 
                  onClick={resetForm}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                  title="Cancel edit"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Store Name <span className="text-red-500">*</span>
                </Label>
                <Input 
                  type="text"
                  placeholder="e.g. Main Campus Store"
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    Store Code
                  </Label>
                  <Input 
                    type="text"
                    placeholder="e.g. STR-MAIN"
                    value={code} 
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966] font-mono text-xs uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    Status
                  </Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Location / Room / Building
                </Label>
                <Input 
                  type="text"
                  placeholder="e.g. Block A, Basement Room 12"
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    Manager / In-Charge
                  </Label>
                  <Input 
                    type="text"
                    placeholder="e.g. Tariq Mehmood"
                    value={managerName} 
                    onChange={(e) => setManagerName(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    Contact Phone
                  </Label>
                  <Input 
                    type="text"
                    placeholder="e.g. 0300-1234567"
                    value={contactNumber} 
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Description / Notes
                </Label>
                <textarea 
                  rows={2}
                  placeholder="Optional details, operating hours, notes..."
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white p-2.5 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-zinc-100">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 bg-[#009966] hover:bg-[#007a52] text-white font-medium text-xs h-9 shadow-xs"
                >
                  {saving ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : editingId ? (
                    'UPDATE STORE'
                  ) : (
                    'SAVE STORE'
                  )}
                </Button>
                {editingId && (
                  <Button 
                    type="button" 
                    onClick={resetForm} 
                    variant="outline" 
                    className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs h-9"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Store Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            {/* Table Header & Controls */}
            <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#009966]" />
                <h2 className="text-base font-semibold text-zinc-950">Item Store List</h2>
                <span className="text-xs bg-zinc-200 text-zinc-700 font-semibold px-2 py-0.5 rounded-full">
                  {filteredStores.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative w-44 sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search store, code, manager..." 
                    value={search} 
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
                    className="pl-8 h-8 text-xs bg-white border-zinc-300 text-zinc-900" 
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>

                {/* Reload */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchStores}
                  disabled={loading}
                  className="h-8 w-8 p-0 border-zinc-300 hover:bg-zinc-100"
                  title="Reload"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-zinc-600 ${loading ? 'animate-spin' : ''}`} />
                </Button>

                {/* Export Toolbar */}
                <TableExportToolbar 
                  data={exportData} 
                  columns={exportColumns} 
                  fileName="item-stores-list" 
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-zinc-600 uppercase font-semibold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-3 py-3 w-12 text-center">SL</th>
                    <th className="px-3 py-3">Store Info</th>
                    <th className="px-3 py-3">Location</th>
                    <th className="px-3 py-3">Manager / In-Charge</th>
                    <th className="px-3 py-3 text-center">Items</th>
                    <th className="px-3 py-3 text-center">Total Stock</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="h-6 w-6 animate-spin text-[#009966]" />
                          <span className="text-xs text-zinc-500 font-medium">Loading item stores...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedStores.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Warehouse className="h-8 w-8 text-zinc-300" />
                          <p className="text-zinc-600 font-medium">No stores found</p>
                          <p className="text-zinc-400 text-[11px]">
                            {search || statusFilter !== 'All' 
                              ? 'Try adjusting your search query or filter.' 
                              : 'Create your first store using the form on the left.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedStores.map((store, index) => {
                      const slNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      const isActive = store.status === 'Active';

                      return (
                        <tr 
                          key={store._id} 
                          className="hover:bg-zinc-50/80 transition-colors"
                        >
                          <td className="px-3 py-3 text-center text-zinc-400 font-medium">
                            {slNumber}
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                              {store.name}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              {store.code || 'N/A'}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1 text-zinc-700">
                              <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{store.location || '—'}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium text-zinc-800 flex items-center gap-1">
                              <User className="h-3 w-3 text-zinc-400 shrink-0" />
                              {store.managerName || 'Unassigned'}
                            </div>
                            {store.contactNumber && (
                              <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <Phone className="h-2.5 w-2.5" />
                                {store.contactNumber}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              {store.itemCount || 0} items
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="font-semibold text-zinc-900">
                              {(store.totalStockQuantity || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-zinc-400 ml-1">units</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => handleToggleStatus(store)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                                isActive 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200'
                              }`}
                              title="Click to toggle status"
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                              {store.status}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openViewModal(store)}
                                className="p-1 rounded text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="View Store Stock & Details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleEdit(store)}
                                className="p-1 rounded text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Edit Store"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(store._id, store.name)}
                                className="p-1 rounded text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Store"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredStores.length > itemsPerPage && (
              <div className="p-3 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50 text-xs">
                <span className="text-zinc-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStores.length)} of {filteredStores.length} stores
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="h-7 px-2 text-xs border-zinc-300"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <Button
                      key={idx}
                      variant={currentPage === idx + 1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`h-7 w-7 p-0 text-xs ${
                        currentPage === idx + 1 
                          ? 'bg-[#009966] text-white hover:bg-[#007a52]' 
                          : 'border-zinc-300 text-zinc-700'
                      }`}
                    >
                      {idx + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="h-7 px-2 text-xs border-zinc-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Store Details & Stock Modal */}
      {isViewModalOpen && selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-[#009966]" />
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">{selectedStore.name}</h3>
                  <div className="text-[11px] text-zinc-500 font-mono">Code: {selectedStore.code || 'N/A'}</div>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Store metadata summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Location</span>
                  <span className="font-semibold text-zinc-800">{selectedStore.location || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Manager</span>
                  <span className="font-semibold text-zinc-800">{selectedStore.managerName || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Contact</span>
                  <span className="font-semibold text-zinc-800">{selectedStore.contactNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Status</span>
                  <span className={`inline-block font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                    selectedStore.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
                  }`}>
                    {selectedStore.status}
                  </span>
                </div>
              </div>

              {selectedStore.description && (
                <div className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <span className="font-semibold text-zinc-700">Description: </span>
                  {selectedStore.description}
                </div>
              )}

              {/* Items housed in this store */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes className="h-4 w-4 text-[#009966]" />
                    Current Inventory in this Store
                  </h4>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {storeItems.length} items recorded
                  </span>
                </div>

                {loadingStoreItems ? (
                  <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-[#009966]" />
                    Loading items in this store...
                  </div>
                ) : storeItems.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg text-xs text-zinc-400">
                    No items currently recorded in this store.
                  </div>
                ) : (
                  <div className="border border-zinc-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200 text-[10px] uppercase">
                        <tr>
                          <th className="px-3 py-2">Item Name</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2 text-right">Available in Store</th>
                          <th className="px-3 py-2 text-right">Unit Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {storeItems.map((item) => {
                          const storeAlloc = item.storeStock?.find(s => s.storeId?._id === selectedStore._id || s.storeId === selectedStore._id);
                          const storeQty = storeAlloc ? storeAlloc.quantity : 0;

                          return (
                            <tr key={item._id} className="hover:bg-zinc-50/50">
                              <td className="px-3 py-2 font-medium text-zinc-900">
                                {item.name}
                                <span className="block text-[10px] text-zinc-400 font-mono">{item.code}</span>
                              </td>
                              <td className="px-3 py-2 text-zinc-600">
                                {item.categoryId?.name || 'General'}
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-zinc-900">
                                {storeQty} <span className="text-[10px] text-zinc-400 font-normal">{item.unit || 'units'}</span>
                              </td>
                              <td className="px-3 py-2 text-right text-zinc-700">
                                Rs. {item.unitCost ? item.unitCost.toLocaleString() : 0}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsViewModalOpen(false)}
                className="text-xs border-zinc-300"
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
