'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Printer,
  Eye,
  RotateCcw,
  Warehouse,
  User,
  CreditCard,
  DollarSign,
  FileText,
  Boxes,
  ArrowRight,
  ShieldAlert,
  Percent,
  Receipt,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDMY } from '@/lib/utils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';
import InventoryNav from '@/components/inventory/InventoryNav';

export default function ItemSellPage() {
  const [activeTab, setActiveTab] = useState('new-sale'); // 'new-sale' or 'sales-list'

  // Dropdown data
  const [stores, setStores] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Form State
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [storeId, setStoreId] = useState('');
  const [customerType, setCustomerType] = useState('Student');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [paidAmount, setPaidAmount] = useState(0);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Line items
  const [items, setItems] = useState([
    {
      id: 1,
      itemId: '',
      itemName: '',
      itemCode: '',
      unit: '',
      availableStock: 0,
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      lineTotal: 0
    }
  ]);

  // Sales list & stats
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalSells: 0,
    totalQuantity: 0,
    totalAmount: 0,
    paidAmount: 0,
    postedCount: 0,
    reversedCount: 0
  });
  const [loadingSales, setLoadingSales] = useState(true);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Feedback
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [reverseTarget, setReverseTarget] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing] = useState(false);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Generate unique invoice number
  const generateInvoiceNo = () => {
    const dateStamp = new Date().toISOString().slice(2, 7).replace('-', '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `INV-${dateStamp}-${randomSuffix}`;
  };

  // Load stores, items, recipients on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingDropdowns(true);
        const [strRes, itmRes] = await Promise.all([
          api.get('/inventory/store?status=Active'),
          api.get('/inventory/item?status=Active')
        ]);

        if (strRes && strRes.success) {
          const loadedStores = strRes.data || [];
          setStores(loadedStores);
          if (loadedStores.length > 0 && !storeId) {
            setStoreId(loadedStores[0]._id);
          }
        }
        if (itmRes && itmRes.success) {
          setAvailableItems(itmRes.data || []);
        }

        setInvoiceNo(generateInvoiceNo());
      } catch (err) {
        console.error('Error loading initial dropdown data:', err);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch recipients whenever customerType changes
  useEffect(() => {
    const loadRecipients = async () => {
      if (customerType === 'Walk-in / External') {
        setRecipientOptions([]);
        return;
      }
      try {
        const res = await api.get(`/inventory/recipients?type=${customerType}`);
        if (res && res.success) {
          setRecipientOptions(res.data || []);
        }
      } catch (err) {
        console.error('Error loading recipients:', err);
      }
    };

    loadRecipients();
  }, [customerType]);

  // Fetch sales records
  const fetchSales = async () => {
    try {
      setLoadingSales(true);
      let url = '/inventory/sell';
      const params = [];
      if (storeFilter !== 'All') params.push(`store=${encodeURIComponent(storeFilter)}`);
      if (typeFilter !== 'All') params.push(`customerType=${encodeURIComponent(typeFilter)}`);
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res && res.success) {
        setSales(res.data || []);
        if (res.stats) setStats(res.stats);
      } else if (Array.isArray(res)) {
        setSales(res);
      }
    } catch (err) {
      console.error('Error fetching sales list:', err);
      showToast('Error loading sales invoices', true);
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [storeFilter, typeFilter]);

  // When recipient is picked from dropdown
  const handleSelectRecipient = (e) => {
    const selectedId = e.target.value;
    setCustomerId(selectedId);
    const rec = recipientOptions.find(r => r.id === selectedId);
    if (rec) {
      setCustomerName(rec.name);
      setCustomerContact(rec.phone || '');
    }
  };

  // Helper to get stock of an item in the currently selected store
  const getStoreStock = (item, currentStoreId) => {
    if (!item) return 0;
    if (!currentStoreId) return item.totalStock || 0;
    const storeRecord = item.storeStock?.find(s => s.storeId?._id === currentStoreId || s.storeId === currentStoreId);
    return storeRecord ? storeRecord.quantity : 0;
  };

  // Update item selection in a row
  const handleItemSelect = (rowId, selectedItemId) => {
    const selectedItem = availableItems.find(i => i._id === selectedItemId);
    setItems(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      if (!selectedItem) {
        return {
          ...row,
          itemId: '',
          itemName: '',
          itemCode: '',
          unit: '',
          availableStock: 0,
          unitPrice: 0,
          lineTotal: 0
        };
      }

      const availableInStore = getStoreStock(selectedItem, storeId);
      const price = selectedItem.unitPrice || selectedItem.unitCost || 0;
      const qty = Number(row.quantity) || 1;
      const disc = Number(row.discount) || 0;
      const total = Math.max(0, (qty * price) - disc);

      return {
        ...row,
        itemId: selectedItem._id,
        itemName: selectedItem.name,
        itemCode: selectedItem.code,
        unit: selectedItem.unit || 'pcs',
        availableStock: availableInStore,
        unitPrice: price,
        lineTotal: total
      };
    }));
  };

  // When store changes, re-evaluate available stock on all selected lines
  const handleStoreChange = (newStoreId) => {
    setStoreId(newStoreId);
    setItems(prev => prev.map(row => {
      if (!row.itemId) return row;
      const item = availableItems.find(i => i._id === row.itemId);
      const updatedStock = getStoreStock(item, newStoreId);
      return {
        ...row,
        availableStock: updatedStock
      };
    }));
  };

  const handleRowChange = (rowId, field, value) => {
    setItems(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      const updated = { ...row, [field]: value };

      const qty = field === 'quantity' ? Number(value) || 0 : Number(row.quantity) || 0;
      const price = field === 'unitPrice' ? Number(value) || 0 : Number(row.unitPrice) || 0;
      const disc = field === 'discount' ? Number(value) || 0 : Number(row.discount) || 0;

      updated.lineTotal = Math.max(0, (qty * price) - disc);
      return updated;
    }));
  };

  const addRow = () => {
    const newId = items.length > 0 ? Math.max(...items.map(r => r.id)) + 1 : 1;
    setItems([
      ...items,
      {
        id: newId,
        itemId: '',
        itemName: '',
        itemCode: '',
        unit: '',
        availableStock: 0,
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        lineTotal: 0
      }
    ]);
  };

  const removeRow = (rowId) => {
    if (items.length === 1) {
      showToast('At least one sales line is required.', true);
      return;
    }
    setItems(items.filter(r => r.id !== rowId));
  };

  // Calculations
  const totalUnits = items.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const itemsSubtotal = items.reduce((sum, r) => sum + (Number(r.lineTotal) || 0), 0);
  const netGrandTotal = Math.max(0, itemsSubtotal - (Number(overallDiscount) || 0));

  // Sync paidAmount when paymentStatus is 'Paid'
  useEffect(() => {
    if (paymentStatus === 'Paid') {
      setPaidAmount(netGrandTotal);
    } else if (paymentStatus === 'Unpaid') {
      setPaidAmount(0);
    }
  }, [netGrandTotal, paymentStatus]);

  // Submit Handler
  const handleSubmitSale = async (targetStatus = 'Posted') => {
    if (!storeId) {
      showToast('Please select a dispensing store.', true);
      return;
    }
    if (!customerName.trim()) {
      showToast('Please specify customer / student / buyer name.', true);
      return;
    }

    // Validate stock and items
    const validItems = items.filter(r => r.itemId && Number(r.quantity) > 0);
    if (validItems.length === 0) {
      showToast('Please add at least one item with quantity greater than zero.', true);
      return;
    }

    if (targetStatus === 'Posted') {
      for (const row of validItems) {
        if (Number(row.quantity) > row.availableStock) {
          showToast(`Insufficient stock for "${row.itemName}". Available in store: ${row.availableStock}, Requested: ${row.quantity}`, true);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        invoiceNo: invoiceNo.trim() || generateInvoiceNo(),
        date,
        storeId,
        customerType,
        customerId: customerId || undefined,
        customerName: customerName.trim(),
        customerContact: customerContact.trim(),
        paymentMethod,
        paymentStatus,
        paidAmount: Number(paidAmount) || 0,
        notes: notes.trim(),
        status: targetStatus,
        items: validItems.map(row => ({
          itemId: row.itemId,
          quantity: Number(row.quantity),
          unitPrice: Number(row.unitPrice) || 0,
          discount: Number(row.discount) || 0
        }))
      };

      const res = await api.post('/inventory/sell', payload);
      if (res && res.success) {
        showToast(targetStatus === 'Posted' ? 'Sale completed & stock deducted!' : 'Invoice saved as draft.');
        setViewInvoice(res.data);
        resetSaleForm();
        fetchSales();
      } else {
        showToast(res?.message || 'Failed to complete sale.', true);
      }
    } catch (err) {
      console.error('Error submitting sale:', err);
      showToast(err.response?.data?.message || 'Failed to complete sale transaction.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReverse = (sale) => {
    setReverseTarget(sale);
    setReversalReason('Order cancelled / customer returned items');
  };

  const handleConfirmReverse = async () => {
    if (!reverseTarget) return;
    try {
      setReversing(true);
      const res = await api.post(`/inventory/sell/${reverseTarget._id}/reverse`, {
        reversalReason
      });
      if (res && res.success) {
        showToast(`Invoice ${reverseTarget.invoiceNo} reversed. Stock has been restored.`);
        setReverseTarget(null);
        fetchSales();
      } else {
        showToast(res?.message || 'Failed to reverse sale.', true);
      }
    } catch (err) {
      console.error('Error reversing sale:', err);
      showToast(err.response?.data?.message || 'Failed to reverse invoice.', true);
    } finally {
      setReversing(false);
    }
  };

  const resetSaleForm = () => {
    setInvoiceNo(generateInvoiceNo());
    setDate(new Date().toISOString().split('T')[0]);
    setCustomerType('Student');
    setCustomerId('');
    setCustomerName('');
    setCustomerContact('');
    setPaymentMethod('Cash');
    setPaymentStatus('Paid');
    setPaidAmount(0);
    setOverallDiscount(0);
    setNotes('');
    setItems([
      {
        id: 1,
        itemId: '',
        itemName: '',
        itemCode: '',
        unit: '',
        availableStock: 0,
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        lineTotal: 0
      }
    ]);
  };

  // Filtered sales
  const filteredSales = sales.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.invoiceNo?.toLowerCase().includes(q) ||
      s.customerName?.toLowerCase().includes(q) ||
      s.customerContact?.toLowerCase().includes(q) ||
      s.storeId?.name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportColumns = [
    { key: 'invoiceNo', label: 'Invoice Number' },
    { key: 'date', label: 'Date' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerType', label: 'Customer Type' },
    { key: 'storeName', label: 'Dispensing Store' },
    { key: 'totalQuantity', label: 'Total Units' },
    { key: 'totalAmount', label: 'Grand Total (Rs.)' },
    { key: 'paidAmount', label: 'Paid Amount (Rs.)' },
    { key: 'paymentStatus', label: 'Payment Status' },
    { key: 'status', label: 'Invoice Status' }
  ];

  const exportData = filteredSales.map(s => ({
    ...s,
    date: formatDateDMY(s.date),
    storeName: s.storeId?.name || 'N/A'
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
            <ShoppingCart className="h-7 w-7 text-[#009966]" />
            Item Sell & Point of Sale (POS)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Issue invoices for uniforms, stationery, books, and college merchandise with real-time store stock deduction.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/accounts/inventory/item-list" className="hover:text-zinc-500 transition-colors">Inventory</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Item Sell</span>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <InventoryNav />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-[#009966]">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{stats.totalSells || sales.length}</div>
            <div className="text-xs text-zinc-500 font-medium">Total Sales Invoices</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{(stats.totalQuantity || 0).toLocaleString()}</div>
            <div className="text-xs text-zinc-500 font-medium">Total Units Sold</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">
              Rs. {stats.totalAmount ? Math.round(stats.totalAmount).toLocaleString() : 0}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Total Sales Revenue</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">
              Rs. {stats.paidAmount ? Math.round(stats.paidAmount).toLocaleString() : 0}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Collected Cash / Payments</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: New Sale vs Sales Invoices List */}
      <div className="flex border-b border-zinc-200 bg-white px-4 pt-2 rounded-t-xl">
        <button
          onClick={() => setActiveTab('new-sale')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'new-sale'
              ? 'border-[#009966] text-[#009966]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          Create Sales Invoice
        </button>

        <button
          onClick={() => { setActiveTab('sales-list'); fetchSales(); }}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sales-list'
              ? 'border-[#009966] text-[#009966]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          Sales History & Invoices
          <span className="text-[10px] bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded-full font-bold">
            {sales.length}
          </span>
        </button>
      </div>

      {/* TAB 1: NEW SALE FORM */}
      {activeTab === 'new-sale' && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-b-xl overflow-hidden">
          {/* Form Header Info */}
          <div className="p-5 border-b border-zinc-200 bg-zinc-50/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Invoice # */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Invoice No. <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={invoiceNo}
                  onChange={e => setInvoiceNo(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 font-mono text-xs focus-visible:ring-[#009966]"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Sales Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 text-xs focus-visible:ring-[#009966]"
                  required
                />
              </div>

              {/* Source Store */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Dispensing Store <span className="text-red-500">*</span>
                </Label>
                <select
                  value={storeId}
                  onChange={e => handleStoreChange(e.target.value)}
                  disabled={loadingDropdowns}
                  className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                  required
                >
                  <option value="">Select Source Store...</option>
                  {stores.map(str => (
                    <option key={str._id} value={str._id}>
                      {str.name} {str.location ? `(${str.location})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Customer Type <span className="text-red-500">*</span>
                </Label>
                <select
                  value={customerType}
                  onChange={e => {
                    setCustomerType(e.target.value);
                    setCustomerId('');
                    setCustomerName('');
                    setCustomerContact('');
                  }}
                  className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                >
                  <option value="Student">Student</option>
                  <option value="Staff">Faculty / Staff</option>
                  <option value="Walk-in / External">Walk-in / External Customer</option>
                </select>
              </div>

              {/* Dynamic Pick from Database for Student/Staff */}
              {customerType !== 'Walk-in / External' && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">
                    Select Enrolled {customerType}
                  </Label>
                  <select
                    value={customerId}
                    onChange={handleSelectRecipient}
                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                  >
                    <option value="">Choose from database or type custom name below...</option>
                    {recipientOptions.map(rec => (
                      <option key={rec.id} value={rec.id}>
                        {rec.name} {rec.info ? `— ${rec.info}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Customer Name */}
              <div className={`space-y-1.5 ${customerType === 'Walk-in / External' ? 'sm:col-span-2' : ''}`}>
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Ali Raza"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 text-xs focus-visible:ring-[#009966]"
                  required
                />
              </div>

              {/* Customer Contact */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Contact Phone
                </Label>
                <Input
                  type="text"
                  placeholder="0300-1234567"
                  value={customerContact}
                  onChange={e => setCustomerContact(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 text-xs focus-visible:ring-[#009966]"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Payment Method
                </Label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>

              {/* Payment Status */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Payment Status
                </Label>
                <select
                  value={paymentStatus}
                  onChange={e => setPaymentStatus(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                >
                  <option value="Paid">Fully Paid</option>
                  <option value="Partial">Partial Payment</option>
                  <option value="Unpaid">Unpaid / On Credit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart className="h-4 w-4 text-[#009966]" />
                Sales Line Items
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                className="h-8 text-xs gap-1 border-dashed border-[#009966] text-[#009966] hover:bg-emerald-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item Line
              </Button>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <table className="w-full text-xs text-left min-w-[700px]">
                <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200 text-[11px] uppercase">
                  <tr>
                    <th className="px-3 py-2.5 w-10 text-center">#</th>
                    <th className="px-3 py-2.5 min-w-[240px]">Select Item <span className="text-red-500">*</span></th>
                    <th className="px-3 py-2.5 w-28 text-center">Store Stock</th>
                    <th className="px-3 py-2.5 w-24 text-right">Qty <span className="text-red-500">*</span></th>
                    <th className="px-3 py-2.5 w-28 text-right">Unit Price</th>
                    <th className="px-3 py-2.5 w-24 text-right">Discount</th>
                    <th className="px-3 py-2.5 w-32 text-right">Line Total</th>
                    <th className="px-3 py-2.5 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {items.map((row, index) => {
                    const isOutOfStock = row.itemId && (row.availableStock < 1 || Number(row.quantity) > row.availableStock);

                    return (
                      <tr key={row.id} className="hover:bg-zinc-50/50">
                        <td className="px-3 py-2 text-center text-zinc-400 font-medium">
                          {index + 1}
                        </td>

                        {/* Item selector */}
                        <td className="px-3 py-2">
                          <select
                            value={row.itemId}
                            onChange={e => handleItemSelect(row.id, e.target.value)}
                            className="w-full h-8 rounded border border-zinc-300 bg-white px-2 text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-[#009966]"
                          >
                            <option value="">Select Item to sell...</option>
                            {availableItems.map(item => (
                              <option key={item._id} value={item._id}>
                                {item.name} ({item.code}) — Rs. {item.unitPrice || item.unitCost}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Available Stock badge */}
                        <td className="px-3 py-2 text-center">
                          {row.itemId ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              row.availableStock > 0 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {row.availableStock} {row.unit}
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-[10px]">—</span>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="px-3 py-2 text-right">
                          <Input
                            type="number"
                            min="1"
                            max={row.availableStock || 99999}
                            value={row.quantity}
                            onChange={e => handleRowChange(row.id, 'quantity', e.target.value)}
                            className={`h-8 text-right bg-white text-xs font-semibold ${
                              isOutOfStock ? 'border-red-400 text-red-700 focus-visible:ring-red-400' : 'border-zinc-300'
                            }`}
                          />
                        </td>

                        {/* Unit Price */}
                        <td className="px-3 py-2 text-right">
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={row.unitPrice}
                            onChange={e => handleRowChange(row.id, 'unitPrice', e.target.value)}
                            className="h-8 text-right bg-white border-zinc-300 text-xs font-mono"
                          />
                        </td>

                        {/* Line Discount */}
                        <td className="px-3 py-2 text-right">
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={row.discount}
                            onChange={e => handleRowChange(row.id, 'discount', e.target.value)}
                            className="h-8 text-right bg-white border-zinc-300 text-xs font-mono"
                          />
                        </td>

                        {/* Line Total */}
                        <td className="px-3 py-2 text-right font-bold text-zinc-900">
                          Rs. {row.lineTotal.toLocaleString()}
                        </td>

                        {/* Action */}
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove line"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Footer Summary & Post */}
          <div className="p-5 border-t border-zinc-200 bg-zinc-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="bg-white border border-zinc-200 px-3.5 py-2 rounded-lg shadow-2xs">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Units to Sell</span>
                <span className="text-sm font-bold text-zinc-900">{totalUnits.toLocaleString()} units</span>
              </div>

              <div className="bg-white border border-zinc-200 px-3.5 py-2 rounded-lg shadow-2xs">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Grand Total</span>
                <span className="text-base font-extrabold text-[#009966]">
                  Rs. {netGrandTotal.toLocaleString()}
                </span>
              </div>

              {paymentStatus === 'Partial' && (
                <div className="bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Amount Paid (Rs.)</span>
                  <Input
                    type="number"
                    min="0"
                    max={netGrandTotal}
                    value={paidAmount}
                    onChange={e => setPaidAmount(Number(e.target.value) || 0)}
                    className="h-7 w-28 text-xs font-bold font-mono text-emerald-700 bg-white border-zinc-300"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetSaleForm}
                className="border-zinc-300 text-zinc-600 hover:bg-zinc-100 text-xs h-9"
              >
                Reset
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => handleSubmitSale('Draft')}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs h-9"
              >
                Save as Draft
              </Button>

              <Button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitSale('Posted')}
                className="bg-[#009966] hover:bg-[#007a52] text-white text-xs h-9 font-semibold gap-1.5 shadow-xs"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Processing Sale...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Complete Sale & Print
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALES INVOICES LIST */}
      {activeTab === 'sales-list' && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-b-xl overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#009966]" />
              <h2 className="text-base font-semibold text-zinc-950">Sales History Registry</h2>
              <span className="text-xs bg-zinc-200 text-zinc-700 font-semibold px-2 py-0.5 rounded-full">
                {filteredSales.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative w-44 sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input 
                  placeholder="Search invoice, customer..." 
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

              {/* Customer Type Filter */}
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
              >
                <option value="All">All Customers</option>
                <option value="Student">Student</option>
                <option value="Staff">Staff</option>
                <option value="Walk-in / External">Walk-in</option>
              </select>

              {/* Store Filter */}
              <select
                value={storeFilter}
                onChange={e => { setStoreFilter(e.target.value); setCurrentPage(1); }}
                className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966] max-w-[140px]"
              >
                <option value="All">All Stores</option>
                {stores.map(str => (
                  <option key={str._id} value={str._id}>{str.name}</option>
                ))}
              </select>

              {/* Reload */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchSales}
                disabled={loadingSales}
                className="h-8 w-8 p-0 border-zinc-300 hover:bg-zinc-100"
                title="Reload"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-zinc-600 ${loadingSales ? 'animate-spin' : ''}`} />
              </Button>

              {/* Export Toolbar */}
              <TableExportToolbar 
                data={exportData} 
                columns={exportColumns} 
                fileName="sales-invoices-list" 
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-zinc-600 uppercase font-semibold bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">SL</th>
                  <th className="px-3 py-3">Invoice #</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Store</th>
                  <th className="px-3 py-3 text-center">Total Units</th>
                  <th className="px-3 py-3 text-right">Grand Total</th>
                  <th className="px-3 py-3 text-center">Payment</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loadingSales ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-[#009966]" />
                        <span className="text-xs text-zinc-500 font-medium">Loading sales history...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedSales.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShoppingCart className="h-8 w-8 text-zinc-300" />
                        <p className="text-zinc-600 font-medium">No sales records found</p>
                        <p className="text-zinc-400 text-[11px]">
                          Create a sales invoice using the first tab to begin logging transactions.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSales.map((s, index) => {
                    const slNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    const isPosted = s.status === 'Posted';
                    const isReversed = s.status === 'Reversed';

                    return (
                      <tr 
                        key={s._id} 
                        className="hover:bg-zinc-50/80 transition-colors"
                      >
                        <td className="px-3 py-3 text-center text-zinc-400 font-medium">
                          {slNumber}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-zinc-900">
                          {s.invoiceNo}
                        </td>
                        <td className="px-3 py-3 text-zinc-700">
                          {formatDateDMY(s.date)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-zinc-900 flex items-center gap-1">
                            <User className="h-3 w-3 text-zinc-400 shrink-0" />
                            {s.customerName}
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            {s.customerType} {s.customerContact ? `• ${s.customerContact}` : ''}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-zinc-700">
                          <div className="flex items-center gap-1">
                            <Warehouse className="h-3 w-3 text-zinc-400 shrink-0" />
                            {s.storeId?.name || 'General Store'}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-zinc-800">
                          {(s.totalQuantity || 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right font-extrabold text-zinc-900">
                          Rs. {(s.totalAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            s.paymentStatus === 'Paid' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : s.paymentStatus === 'Partial'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {s.paymentStatus}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isPosted 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : isReversed
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              isPosted ? 'bg-emerald-500' : isReversed ? 'bg-red-500' : 'bg-amber-500'
                            }`} />
                            {s.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewInvoice(s)}
                              className="p-1 rounded text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View Invoice & Print"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {isPosted && (
                              <button
                                onClick={() => handleOpenReverse(s)}
                                className="p-1 rounded text-zinc-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Reverse this sale (restores store stock)"
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
          {filteredSales.length > itemsPerPage && (
            <div className="p-3 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50 text-xs">
              <span className="text-zinc-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSales.length)} of {filteredSales.length} sales
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
      )}

      {/* View & Print Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#009966]" />
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Sales Invoice #{viewInvoice.invoiceNo}</h3>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Status: {viewInvoice.status} • {formatDateDMY(viewInvoice.date)}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewInvoice(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Printable Receipt */}
            <div className="p-6 overflow-y-auto space-y-4 printable-voucher">
              <div className="text-center border-b border-zinc-200 pb-3">
                <h2 className="text-lg font-bold text-zinc-900 uppercase">Pak Royal College</h2>
                <p className="text-xs text-zinc-500">Official POS Sales Invoice & Cash Receipt</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="font-bold text-zinc-900">{viewInvoice.customerName}</span>
                  <span className="block text-[10px] text-zinc-500">{viewInvoice.customerType}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Dispensing Store</span>
                  <span className="font-semibold text-zinc-800">{viewInvoice.storeId?.name || stores.find(s => s._id === storeId)?.name || 'Store'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Payment Method</span>
                  <span className="font-semibold text-zinc-800">{viewInvoice.paymentMethod || 'Cash'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Payment Status</span>
                  <span className="font-semibold text-emerald-700">{viewInvoice.paymentStatus || 'Paid'}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-100 text-zinc-700 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Rate</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {viewInvoice.items?.map((it, idx) => {
                      const itemMatch = availableItems.find(i => i._id === (it.itemId?._id || it.itemId));
                      return (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-medium text-zinc-900">
                            {it.itemId?.name || itemMatch?.name || 'Item'}
                            <span className="block text-[10px] text-zinc-400 font-mono">
                              {it.itemId?.code || itemMatch?.code}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-zinc-800">
                            {it.quantity}
                          </td>
                          <td className="px-3 py-2 text-right text-zinc-700">
                            Rs. {it.unitPrice?.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-zinc-900">
                            Rs. {((it.quantity * it.unitPrice) - (it.discount || 0)).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-zinc-50 border-t border-zinc-200 font-bold">
                    <tr>
                      <td colSpan="3" className="px-3 py-2 text-right text-zinc-700 uppercase text-[10px]">Grand Total:</td>
                      <td className="px-3 py-2 text-right text-[#009966] text-sm">
                        Rs. {(viewInvoice.totalAmount || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="px-3 py-1.5 text-right text-zinc-500 text-[10px]">Paid Amount:</td>
                      <td className="px-3 py-1.5 text-right text-zinc-800">
                        Rs. {(viewInvoice.paidAmount || 0).toLocaleString()}
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
                onClick={() => window.print()}
                className="text-xs border-zinc-300 text-zinc-700 gap-1.5"
              >
                <Printer className="h-3.5 w-3.5 text-zinc-600" />
                Print Receipt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewInvoice(null)}
                className="text-xs border-zinc-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Reversal Modal */}
      {reverseTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 bg-amber-50 flex items-center gap-2 text-amber-900">
              <RotateCcw className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h3 className="font-bold text-base">Reverse Sales Invoice?</h3>
                <p className="text-[11px] text-amber-700">Invoice: {reverseTarget.invoiceNo}</p>
              </div>
            </div>

            <div className="p-5 space-y-3 text-xs text-zinc-700">
              <p className="text-zinc-600">
                Reversing this sale will automatically restore all sold stock units back into store <strong>{reverseTarget.storeId?.name}</strong> via an <strong>ADJUSTMENT_IN</strong> movement.
              </p>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Reason for Reversal <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={reversalReason}
                  onChange={e => setReversalReason(e.target.value)}
                  placeholder="e.g. Return of wrong uniform size / order cancelled"
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
