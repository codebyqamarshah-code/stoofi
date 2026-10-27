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
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Power,
  Eye,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  FileSpreadsheet,
  Receipt,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDMY } from '@/lib/utils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';
import InventoryNav from '@/components/inventory/InventoryNav';

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalPurchasedValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [status, setStatus] = useState('Active');

  // Search, Filter & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // View Modal
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [supplierReceives, setSupplierReceives] = useState([]);
  const [loadingReceives, setLoadingReceives] = useState(false);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      let url = '/inventory/supplier';
      const params = [];
      if (statusFilter !== 'All') params.push(`status=${encodeURIComponent(statusFilter)}`);
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res && res.success) {
        setSuppliers(res.data || []);
        if (res.stats) setStats(res.stats);
      } else if (Array.isArray(res)) {
        setSuppliers(res);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      showToast('Error loading suppliers from database', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [statusFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter supplier name.', true);
      return;
    }
    if (!phone.trim()) {
      showToast('Please enter supplier contact phone.', true);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        address: address.trim(),
        taxNumber: taxNumber.trim(),
        paymentTerms: paymentTerms.trim(),
        status
      };

      let res;
      if (editingId) {
        res = await api.put(`/inventory/supplier/${editingId}`, payload);
      } else {
        res = await api.post('/inventory/supplier', payload);
      }

      if (res && res.success) {
        showToast(editingId ? 'Supplier updated successfully!' : 'Supplier added successfully!');
        resetForm();
        fetchSuppliers();
      } else {
        showToast(res?.message || 'Failed to save supplier.', true);
      }
    } catch (err) {
      console.error('Error saving supplier:', err);
      showToast(err.response?.data?.message || 'Failed to save supplier.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s) => {
    setEditingId(s._id);
    setName(s.name || '');
    setCode(s.code || '');
    setCompanyName(s.companyName || '');
    setContactPerson(s.contactPerson || '');
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setCity(s.city || '');
    setAddress(s.address || '');
    setTaxNumber(s.taxNumber || '');
    setPaymentTerms(s.paymentTerms || 'Net 30');
    setStatus(s.status || 'Active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, sName) => {
    if (!confirm(`Are you sure you want to delete supplier "${sName}"?`)) return;

    try {
      const res = await api.delete(`/inventory/supplier/${id}`);
      if (res && res.success) {
        showToast(`Supplier "${sName}" deleted successfully!`);
        if (editingId === id) resetForm();
        fetchSuppliers();
      } else {
        showToast(res?.message || 'Cannot delete supplier.', true);
      }
    } catch (err) {
      console.error('Error deleting supplier:', err);
      showToast(err.response?.data?.message || 'Failed to delete supplier.', true);
    }
  };

  const handleToggleStatus = async (s) => {
    const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.put(`/inventory/supplier/${s._id}`, { status: nextStatus });
      if (res && res.success) {
        showToast(`Supplier marked as ${nextStatus}!`);
        fetchSuppliers();
      }
    } catch (err) {
      showToast('Failed to toggle status.', true);
    }
  };

  const openViewModal = async (s) => {
    setSelectedSupplier(s);
    setIsViewModalOpen(true);
    try {
      setLoadingReceives(true);
      const res = await api.get(`/inventory/receive?supplier=${s._id}`);
      if (res && res.success) {
        setSupplierReceives(res.data || []);
      } else {
        setSupplierReceives([]);
      }
    } catch (err) {
      console.error('Error loading supplier receipts:', err);
      setSupplierReceives([]);
    } finally {
      setLoadingReceives(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setCity('');
    setAddress('');
    setTaxNumber('');
    setPaymentTerms('Net 30');
    setStatus('Active');
  };

  // Filtered & Paginated records
  const filteredSuppliers = suppliers.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      s.companyName?.toLowerCase().includes(q) ||
      s.contactPerson?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportColumns = [
    { key: 'code', label: 'Supplier Code' },
    { key: 'name', label: 'Supplier Name' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City' },
    { key: 'receiptsCount', label: 'Receipts / GRNs' },
    { key: 'totalPurchased', label: 'Total Purchases (Rs.)' },
    { key: 'status', label: 'Status' }
  ];

  const exportData = filteredSuppliers.map(s => ({
    ...s,
    totalPurchased: s.totalPurchased || 0
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
            <Truck className="h-7 w-7 text-[#009966]" />
            Supplier Management
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Register vendors, maintain procurement contacts, track invoice totals, and view supply histories.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/accounts/inventory/item-list" className="hover:text-zinc-500 transition-colors">Inventory</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Supplier</span>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <InventoryNav />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-[#009966]">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{stats.totalSuppliers || suppliers.length}</div>
            <div className="text-xs text-zinc-500 font-medium">Total Suppliers</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{stats.activeSuppliers || suppliers.filter(s => s.status === 'Active').length}</div>
            <div className="text-xs text-zinc-500 font-medium">Active Vendors</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">
              Rs. {stats.totalPurchasedValue ? Math.round(stats.totalPurchasedValue).toLocaleString() : 0}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Total Procurement Value</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">
              {suppliers.reduce((acc, s) => acc + (s.receiptsCount || 0), 0)}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Total GRN Orders</div>
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
                <Truck className="h-5 w-5 text-[#009966]" />
                <h2 className="text-base font-semibold text-zinc-950">
                  {editingId ? 'Edit Supplier' : 'Add New Supplier'}
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

            <form onSubmit={handleSave} className="p-4 space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Supplier Name <span className="text-red-500">*</span>
                </Label>
                <Input 
                  type="text"
                  placeholder="e.g. Al-Madina Stationers"
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    Supplier Code
                  </Label>
                  <Input 
                    type="text"
                    placeholder="e.g. SUP-001"
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    Company / Firm
                  </Label>
                  <Input 
                    type="text"
                    placeholder="e.g. Al-Madina Traders"
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    Contact Person
                  </Label>
                  <Input 
                    type="text"
                    placeholder="e.g. Haji Bashir"
                    value={contactPerson} 
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    type="text"
                    placeholder="0300-1234567"
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    Email Address
                  </Label>
                  <Input 
                    type="email"
                    placeholder="vendor@example.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    City
                  </Label>
                  <Input 
                    type="text"
                    placeholder="e.g. Lahore / Sialkot"
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    Payment Terms
                  </Label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                    <option value="Advance">Advance Payment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Tax / NTN / STRN No.
                </Label>
                <Input 
                  type="text"
                  placeholder="e.g. NTN-9876543-2"
                  value={taxNumber} 
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#009966] font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Physical Office Address
                </Label>
                <textarea 
                  rows={2}
                  placeholder="Street address, shop number, plaza..."
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white p-2 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966] resize-none"
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
                    'UPDATE SUPPLIER'
                  ) : (
                    'SAVE SUPPLIER'
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

        {/* Right: Supplier Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            {/* Table Header & Controls */}
            <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#009966]" />
                <h2 className="text-base font-semibold text-zinc-950">Supplier Directory</h2>
                <span className="text-xs bg-zinc-200 text-zinc-700 font-semibold px-2 py-0.5 rounded-full">
                  {filteredSuppliers.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative w-44 sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search supplier, phone, city..." 
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
                  onClick={fetchSuppliers}
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
                  fileName="suppliers-list" 
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-zinc-600 uppercase font-semibold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-3 py-3 w-12 text-center">SL</th>
                    <th className="px-3 py-3">Supplier & Code</th>
                    <th className="px-3 py-3">Contact Person</th>
                    <th className="px-3 py-3">Phone & Email</th>
                    <th className="px-3 py-3">City</th>
                    <th className="px-3 py-3 text-center">Orders</th>
                    <th className="px-3 py-3 text-right">Total Purchases</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="h-6 w-6 animate-spin text-[#009966]" />
                          <span className="text-xs text-zinc-500 font-medium">Loading suppliers...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Truck className="h-8 w-8 text-zinc-300" />
                          <p className="text-zinc-600 font-medium">No suppliers found</p>
                          <p className="text-zinc-400 text-[11px]">
                            {search || statusFilter !== 'All' 
                              ? 'Try adjusting your search query or filter.' 
                              : 'Add your first supplier using the form on the left.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedSuppliers.map((s, index) => {
                      const slNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      const isActive = s.status === 'Active';

                      return (
                        <tr 
                          key={s._id} 
                          className="hover:bg-zinc-50/80 transition-colors"
                        >
                          <td className="px-3 py-3 text-center text-zinc-400 font-medium">
                            {slNumber}
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-zinc-900">
                              {s.name}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1.5">
                              <span>{s.code || 'N/A'}</span>
                              {s.companyName && (
                                <span className="text-zinc-500 font-sans">• {s.companyName}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium text-zinc-800 flex items-center gap-1">
                              <User className="h-3 w-3 text-zinc-400 shrink-0" />
                              {s.contactPerson || '—'}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1 text-zinc-800 font-mono text-[11px]">
                              <Phone className="h-3 w-3 text-zinc-400 shrink-0" />
                              {s.phone}
                            </div>
                            {s.email && (
                              <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <Mail className="h-2.5 w-2.5" />
                                {s.email}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-zinc-700">{s.city || '—'}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {s.receiptsCount || 0} GRNs
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="font-bold text-zinc-900">
                              Rs. {(s.totalPurchased || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => handleToggleStatus(s)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                                isActive 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200'
                              }`}
                              title="Click to toggle status"
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                              {s.status}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openViewModal(s)}
                                className="p-1 rounded text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="View Supplier Details & Receipt History"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleEdit(s)}
                                className="p-1 rounded text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Edit Supplier"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(s._id, s.name)}
                                className="p-1 rounded text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Supplier"
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
            {filteredSuppliers.length > itemsPerPage && (
              <div className="p-3 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50 text-xs">
                <span className="text-zinc-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSuppliers.length)} of {filteredSuppliers.length} suppliers
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

      {/* View Supplier Details & Receipts Modal */}
      {isViewModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#009966]" />
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">{selectedSupplier.name}</h3>
                  <div className="text-[11px] text-zinc-500 font-mono">Code: {selectedSupplier.code || 'N/A'}</div>
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
              {/* Supplier metadata summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Contact Person</span>
                  <span className="font-semibold text-zinc-800">{selectedSupplier.contactPerson || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Phone</span>
                  <span className="font-semibold text-zinc-800">{selectedSupplier.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-semibold text-zinc-800 truncate block">{selectedSupplier.email || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">City</span>
                  <span className="font-semibold text-zinc-800">{selectedSupplier.city || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Payment Terms</span>
                  <span className="font-semibold text-zinc-800">{selectedSupplier.paymentTerms || 'Net 30'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Tax / NTN</span>
                  <span className="font-semibold text-zinc-800 font-mono">{selectedSupplier.taxNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Total GRNs</span>
                  <span className="font-bold text-[#009966]">{selectedSupplier.receiptsCount || 0}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Total Purchases</span>
                  <span className="font-bold text-zinc-900">
                    Rs. {(selectedSupplier.totalPurchased || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedSupplier.address && (
                <div className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <span className="font-semibold text-zinc-700">Address: </span>
                  {selectedSupplier.address}
                </div>
              )}

              {/* Receipts from this supplier */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="h-4 w-4 text-[#009966]" />
                    Procurement & Receiving History (GRNs)
                  </h4>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {supplierReceives.length} records
                  </span>
                </div>

                {loadingReceives ? (
                  <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-[#009966]" />
                    Loading receipts history...
                  </div>
                ) : supplierReceives.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg text-xs text-zinc-400">
                    No item receiving records (GRNs) found for this supplier yet.
                  </div>
                ) : (
                  <div className="border border-zinc-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200 text-[10px] uppercase">
                        <tr>
                          <th className="px-3 py-2">GRN #</th>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Destination Store</th>
                          <th className="px-3 py-2 text-center">Items</th>
                          <th className="px-3 py-2 text-right">Total Amount</th>
                          <th className="px-3 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {supplierReceives.map((rec) => (
                          <tr key={rec._id} className="hover:bg-zinc-50/50">
                            <td className="px-3 py-2 font-mono font-medium text-zinc-900">
                              {rec.receiveNo}
                            </td>
                            <td className="px-3 py-2 text-zinc-600">
                              {formatDateDMY(rec.date)}
                            </td>
                            <td className="px-3 py-2 text-zinc-700">
                              {rec.storeId?.name || '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-zinc-700">
                              {rec.items?.length || 0}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-zinc-900">
                              Rs. {(rec.totalAmount || 0).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                rec.status === 'Posted' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : rec.status === 'Draft'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        ))}
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
