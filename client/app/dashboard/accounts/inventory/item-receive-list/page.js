'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Trash2, 
  X, 
  Plus, 
  PackagePlus, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Eye,
  Printer,
  FileText,
  RotateCcw,
  Truck,
  Warehouse,
  Calendar,
  Filter,
  Boxes,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDMY } from '@/lib/utils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';
import InventoryNav from '@/components/inventory/InventoryNav';

export default function ItemReceiveListPage() {
  const [receives, setReceives] = useState([]);
  const [stats, setStats] = useState({
    totalReceives: 0,
    totalQuantity: 0,
    totalAmount: 0,
    postedCount: 0,
    draftCount: 0,
    reversedCount: 0
  });
  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [selectedStore, setSelectedStore] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // View / Print Modal
  const [selectedReceive, setSelectedReceive] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Reverse Modal
  const [reverseTarget, setReverseTarget] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing] = useState(false);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [supRes, strRes] = await Promise.all([
          api.get('/inventory/supplier'),
          api.get('/inventory/store')
        ]);
        if (supRes && supRes.success) setSuppliers(supRes.data || []);
        if (strRes && strRes.success) setStores(strRes.data || []);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    loadFilterOptions();
  }, []);

  const fetchReceives = async () => {
    try {
      setLoading(true);
      let url = '/inventory/receive';
      const params = [];
      if (selectedSupplier !== 'All') params.push(`supplier=${encodeURIComponent(selectedSupplier)}`);
      if (selectedStore !== 'All') params.push(`store=${encodeURIComponent(selectedStore)}`);
      if (statusFilter !== 'All') params.push(`status=${encodeURIComponent(statusFilter)}`);
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res && res.success) {
        setReceives(res.data || []);
        if (res.stats) setStats(res.stats);
      } else if (Array.isArray(res)) {
        setReceives(res);
      }
    } catch (err) {
      console.error('Error fetching receive list:', err);
      showToast('Error loading item receive records', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceives();
  }, [selectedSupplier, selectedStore, statusFilter]);

  const handleOpenReverse = (rec) => {
    setReverseTarget(rec);
    setReversalReason('Incorrect shipment details or returned to vendor');
  };

  const handleConfirmReverse = async () => {
    if (!reverseTarget) return;
    try {
      setReversing(true);
      const res = await api.post(`/inventory/receive/${reverseTarget._id}/reverse`, {
        reversalReason
      });
      if (res && res.success) {
        showToast(`GRN ${reverseTarget.receiveNo} reversed successfully! Stock has been deducted.`);
        setReverseTarget(null);
        fetchReceives();
      } else {
        showToast(res?.message || 'Failed to reverse GRN.', true);
      }
    } catch (err) {
      console.error('Error reversing GRN:', err);
      showToast(err.response?.data?.message || 'Failed to reverse receipt.', true);
    } finally {
      setReversing(false);
    }
  };

  const openViewModal = (rec) => {
    setSelectedReceive(rec);
    setIsViewModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered & Paginated records
  const filteredReceives = receives.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.receiveNo?.toLowerCase().includes(q) ||
      r.supplierId?.name?.toLowerCase().includes(q) ||
      r.storeId?.name?.toLowerCase().includes(q) ||
      r.purchaseOrderNo?.toLowerCase().includes(q) ||
      r.invoiceNo?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredReceives.length / itemsPerPage) || 1;
  const paginatedReceives = filteredReceives.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportColumns = [
    { key: 'receiveNo', label: 'GRN Number' },
    { key: 'date', label: 'Date' },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'storeName', label: 'Destination Store' },
    { key: 'purchaseOrderNo', label: 'PO Number' },
    { key: 'invoiceNo', label: 'Invoice Number' },
    { key: 'totalQuantity', label: 'Total Units' },
    { key: 'totalAmount', label: 'Total Amount (Rs.)' },
    { key: 'status', label: 'Status' }
  ];

  const exportData = filteredReceives.map(r => ({
    ...r,
    date: formatDateDMY(r.date),
    supplierName: r.supplierId?.name || 'N/A',
    storeName: r.storeId?.name || 'N/A'
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
            <Receipt className="h-7 w-7 text-[#009966]" />
            Item Receive List (GRN History)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Browse goods received notes, inspect shipment vouchers, audit procurement expenses, and manage reversals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounts/inventory/item-receive">
            <Button size="sm" className="h-8 text-xs gap-1.5 bg-[#009966] hover:bg-[#007a52] text-white font-medium shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              Receive New Items (GRN)
            </Button>
          </Link>
          <div className="hidden sm:flex items-center text-sm text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Accounts</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/dashboard/accounts/inventory/item-list" className="hover:text-zinc-500 transition-colors">Inventory</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-zinc-950 font-bold">Item Receive List</span>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <InventoryNav />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-[#009966]">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{stats.totalReceives || receives.length}</div>
            <div className="text-xs text-zinc-500 font-medium">Total GRN Receipts</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{(stats.totalQuantity || 0).toLocaleString()}</div>
            <div className="text-xs text-zinc-500 font-medium">Units Received</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">
              Rs. {stats.totalAmount ? Math.round(stats.totalAmount).toLocaleString() : 0}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Total Received Value</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">
              {stats.postedCount || receives.filter(r => r.status === 'Posted').length}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Active Posted GRNs</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-4 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#009966]" />
            <h2 className="text-base font-semibold text-zinc-950">Item Receive Registry</h2>
            <span className="text-xs bg-zinc-200 text-zinc-700 font-semibold px-2 py-0.5 rounded-full">
              {filteredReceives.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-44 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                placeholder="Search GRN, supplier, PO..." 
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

            {/* Supplier Filter */}
            <select
              value={selectedSupplier}
              onChange={e => { setSelectedSupplier(e.target.value); setCurrentPage(1); }}
              className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966] max-w-[150px]"
            >
              <option value="All">All Suppliers</option>
              {suppliers.map(sup => (
                <option key={sup._id} value={sup._id}>{sup.name}</option>
              ))}
            </select>

            {/* Store Filter */}
            <select
              value={selectedStore}
              onChange={e => { setSelectedStore(e.target.value); setCurrentPage(1); }}
              className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966] max-w-[140px]"
            >
              <option value="All">All Stores</option>
              {stores.map(str => (
                <option key={str._id} value={str._id}>{str.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
            >
              <option value="All">All Status</option>
              <option value="Posted">Posted</option>
              <option value="Draft">Draft</option>
              <option value="Reversed">Reversed</option>
            </select>

            {/* Reload */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchReceives}
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
              fileName="item-receive-list" 
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-zinc-600 uppercase font-semibold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-3 py-3 w-10 text-center">SL</th>
                <th className="px-3 py-3">GRN #</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Supplier</th>
                <th className="px-3 py-3">Destination Store</th>
                <th className="px-3 py-3 text-center">Lines</th>
                <th className="px-3 py-3 text-center">Total Qty</th>
                <th className="px-3 py-3 text-right">Total Amount</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-[#009966]" />
                      <span className="text-xs text-zinc-500 font-medium">Loading item receipts...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedReceives.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="h-8 w-8 text-zinc-300" />
                      <p className="text-zinc-600 font-medium">No item receipts found</p>
                      <p className="text-zinc-400 text-[11px]">
                        {search || statusFilter !== 'All' 
                          ? 'Try adjusting your search filters.' 
                          : 'Receive items to begin building your inventory history.'}
                      </p>
                      <Link href="/dashboard/accounts/inventory/item-receive" className="mt-2">
                        <Button size="sm" className="text-xs bg-[#009966] hover:bg-[#007a52] text-white">
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Receive First Item
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReceives.map((rec, index) => {
                  const slNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  const isPosted = rec.status === 'Posted';
                  const isDraft = rec.status === 'Draft';
                  const isReversed = rec.status === 'Reversed';

                  return (
                    <tr 
                      key={rec._id} 
                      className="hover:bg-zinc-50/80 transition-colors"
                    >
                      <td className="px-3 py-3 text-center text-zinc-400 font-medium">
                        {slNumber}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-zinc-900">
                        {rec.receiveNo}
                        {rec.invoiceNo && (
                          <span className="block text-[10px] text-zinc-400 font-normal">
                            Inv: {rec.invoiceNo}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-zinc-700">
                        {formatDateDMY(rec.date)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-zinc-900 flex items-center gap-1">
                          <Truck className="h-3 w-3 text-zinc-400 shrink-0" />
                          {rec.supplierId?.name || 'Unknown Supplier'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-zinc-700">
                        <div className="flex items-center gap-1">
                          <Warehouse className="h-3 w-3 text-zinc-400 shrink-0" />
                          {rec.storeId?.name || 'General Store'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700">
                          {rec.items?.length || 0}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-zinc-800">
                        {(rec.totalQuantity || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right font-extrabold text-zinc-900">
                        Rs. {(rec.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isPosted 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : isDraft
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            isPosted ? 'bg-emerald-500' : isDraft ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openViewModal(rec)}
                            className="p-1 rounded text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View GRN Voucher & Print"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {isPosted && (
                            <button
                              onClick={() => handleOpenReverse(rec)}
                              className="p-1 rounded text-zinc-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Reverse this GRN (restores stock)"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
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
        {filteredReceives.length > itemsPerPage && (
          <div className="p-3 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50 text-xs">
            <span className="text-zinc-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReceives.length)} of {filteredReceives.length} records
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

      {/* View GRN Voucher Modal */}
      {isViewModalOpen && selectedReceive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#009966]" />
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">GRN Voucher #{selectedReceive.receiveNo}</h3>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Status: {selectedReceive.status} • Date: {formatDateDMY(selectedReceive.date)}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Voucher */}
            <div className="p-6 overflow-y-auto space-y-4 printable-voucher">
              <div className="text-center border-b border-zinc-200 pb-3">
                <h2 className="text-lg font-bold text-zinc-900 uppercase">Pak Royal College</h2>
                <p className="text-xs text-zinc-500">Official Goods Received Note (GRN)</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Supplier</span>
                  <span className="font-semibold text-zinc-800">{selectedReceive.supplierId?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Destination Store</span>
                  <span className="font-semibold text-zinc-800">{selectedReceive.storeId?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">PO Number</span>
                  <span className="font-mono text-zinc-800">{selectedReceive.purchaseOrderNo || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Supplier Invoice</span>
                  <span className="font-mono text-zinc-800">{selectedReceive.invoiceNo || '—'}</span>
                </div>
              </div>

              {selectedReceive.remarks && (
                <div className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <span className="font-semibold text-zinc-700">Remarks: </span>
                  {selectedReceive.remarks}
                </div>
              )}

              {/* Items Table */}
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-100 text-zinc-700 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2 w-8 text-center">#</th>
                      <th className="px-3 py-2">Item Description</th>
                      <th className="px-3 py-2 text-right">Received Qty</th>
                      <th className="px-3 py-2 text-right">Unit Cost</th>
                      <th className="px-3 py-2 text-right">Discount</th>
                      <th className="px-3 py-2 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {selectedReceive.items?.map((it, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="px-3 py-2 text-center text-zinc-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-zinc-900">
                          {it.itemId?.name || 'Item'}
                          <span className="block text-[10px] text-zinc-400 font-mono">
                            {it.itemId?.code || ''}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-zinc-800">
                          {it.quantity} <span className="text-[10px] text-zinc-400 font-normal">{it.itemId?.unit || 'units'}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-700">
                          Rs. {it.unitCost?.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-500">
                          {it.discount ? `Rs. ${it.discount.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-zinc-900">
                          Rs. {((it.quantity * it.unitCost) - (it.discount || 0)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-zinc-50 border-t border-zinc-200 font-bold">
                    <tr>
                      <td colSpan="5" className="px-3 py-2 text-right text-zinc-700 uppercase text-[10px]">Grand Total:</td>
                      <td className="px-3 py-2 text-right text-[#009966] text-sm">
                        Rs. {(selectedReceive.totalAmount || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs border-zinc-300 text-zinc-700 gap-1.5"
              >
                <Printer className="h-3.5 w-3.5 text-zinc-600" />
                Print Voucher
              </Button>
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

      {/* Reversal Confirmation Modal */}
      {reverseTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 bg-amber-50 flex items-center gap-2 text-amber-900">
              <RotateCcw className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h3 className="font-bold text-base">Reverse Goods Received Note?</h3>
                <p className="text-[11px] text-amber-700">GRN: {reverseTarget.receiveNo}</p>
              </div>
            </div>

            <div className="p-5 space-y-3 text-xs text-zinc-700">
              <p className="text-zinc-600">
                Reversing this receipt will automatically create an <strong>ADJUSTMENT_OUT</strong> transaction to deduct the received stock units from store <strong>{reverseTarget.storeId?.name}</strong>.
              </p>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Reversal Reason <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={reversalReason}
                  onChange={e => setReversalReason(e.target.value)}
                  placeholder="e.g. Return to vendor / shipment error"
                  className="bg-white border-zinc-300 text-xs"
                  required
                />
              </div>
            </div>

            <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={reversing}
                onClick={() => setReverseTarget(null)}
                className="text-xs border-zinc-300"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={reversing || !reversalReason.trim()}
                onClick={handleConfirmReverse}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                {reversing ? 'Reversing...' : 'Confirm Reversal'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
