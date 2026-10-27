'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  Plus, 
  Trash2, 
  PackagePlus, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Warehouse,
  Truck,
  Calendar,
  FileText,
  Printer,
  ArrowRight,
  ListOrdered,
  Calculator,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDMY } from '@/lib/utils';
import api from '@/services/api';
import InventoryNav from '@/components/inventory/InventoryNav';

export default function ItemReceivePage() {
  const router = useRouter();

  // Dropdown data sources
  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Form Header State
  const [receiveNo, setReceiveNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [supplierId, setSupplierId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [purchaseOrderNo, setPurchaseOrderNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [overallDiscount, setOverallDiscount] = useState(0);

  // Line items state
  const [items, setItems] = useState([
    {
      id: 1,
      itemId: '',
      itemName: '',
      itemCode: '',
      unit: '',
      orderedQuantity: '',
      quantity: 1,
      unitCost: 0,
      discount: 0,
      lineTotal: 0,
      remarks: ''
    }
  ]);

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [postedReceipt, setPostedReceipt] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Load suppliers, stores, items on mount
  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        setLoadingDropdowns(true);
        const [supRes, strRes, itmRes] = await Promise.all([
          api.get('/inventory/supplier?status=Active'),
          api.get('/inventory/store?status=Active'),
          api.get('/inventory/item?status=Active')
        ]);

        if (supRes && supRes.success) setSuppliers(supRes.data || []);
        if (strRes && strRes.success) {
          const loadedStores = strRes.data || [];
          setStores(loadedStores);
          if (loadedStores.length > 0 && !storeId) {
            setStoreId(loadedStores[0]._id);
          }
        }
        if (itmRes && itmRes.success) setAvailableItems(itmRes.data || []);

        // Auto-generate suggested GRN number
        const dateStamp = new Date().toISOString().slice(2, 7).replace('-', '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        setReceiveNo(`GRN-${dateStamp}-${randomSuffix}`);
      } catch (err) {
        console.error('Error loading dropdown data:', err);
        showToast('Error loading suppliers or stores list', true);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadPrerequisites();
  }, []);

  // Handle line item change
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
          unitCost: 0,
          lineTotal: 0
        };
      }
      const cost = selectedItem.unitCost || 0;
      const qty = Number(row.quantity) || 1;
      const disc = Number(row.discount) || 0;
      const total = Math.max(0, (qty * cost) - disc);

      return {
        ...row,
        itemId: selectedItem._id,
        itemName: selectedItem.name,
        itemCode: selectedItem.code,
        unit: selectedItem.unit || 'pcs',
        unitCost: cost,
        lineTotal: total
      };
    }));
  };

  const handleRowChange = (rowId, field, value) => {
    setItems(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      const updated = { ...row, [field]: value };

      const qty = field === 'quantity' ? Number(value) || 0 : Number(row.quantity) || 0;
      const cost = field === 'unitCost' ? Number(value) || 0 : Number(row.unitCost) || 0;
      const disc = field === 'discount' ? Number(value) || 0 : Number(row.discount) || 0;

      updated.lineTotal = Math.max(0, (qty * cost) - disc);
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
        orderedQuantity: '',
        quantity: 1,
        unitCost: 0,
        discount: 0,
        lineTotal: 0,
        remarks: ''
      }
    ]);
  };

  const removeRow = (rowId) => {
    if (items.length === 1) {
      showToast('At least one item line is required.', true);
      return;
    }
    setItems(items.filter(r => r.id !== rowId));
  };

  // Calculations
  const totalQuantity = items.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const itemsSubtotal = items.reduce((sum, r) => sum + (Number(r.lineTotal) || 0), 0);
  const netGrandTotal = Math.max(0, itemsSubtotal - (Number(overallDiscount) || 0));

  // Submit Handler
  const handleSubmit = async (targetStatus = 'Posted') => {
    if (!supplierId) {
      showToast('Please select a supplier.', true);
      return;
    }
    if (!storeId) {
      showToast('Please select a destination store.', true);
      return;
    }
    if (!receiveNo.trim()) {
      showToast('Please provide a GRN number.', true);
      return;
    }

    // Validate rows
    const validItems = items.filter(r => r.itemId && Number(r.quantity) > 0);
    if (validItems.length === 0) {
      showToast('Please add at least one valid item with quantity greater than zero.', true);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        receiveNo: receiveNo.trim(),
        date,
        supplierId,
        storeId,
        purchaseOrderNo: purchaseOrderNo.trim(),
        invoiceNo: invoiceNo.trim(),
        remarks: remarks.trim(),
        status: targetStatus,
        items: validItems.map(row => ({
          itemId: row.itemId,
          quantity: Number(row.quantity),
          unitCost: Number(row.unitCost) || 0,
          discount: Number(row.discount) || 0,
          remarks: row.remarks ? row.remarks.trim() : ''
        }))
      };

      const res = await api.post('/inventory/receive', payload);
      if (res && res.success) {
        showToast(
          targetStatus === 'Posted' 
            ? 'GRN posted successfully! Stock and accounts updated.' 
            : 'GRN saved as draft.'
        );
        setPostedReceipt(res.data);
        setShowVoucherModal(true);
      } else {
        showToast(res?.message || 'Failed to process item receipt.', true);
      }
    } catch (err) {
      console.error('Error submitting receive:', err);
      showToast(err.response?.data?.message || 'Failed to submit item receive.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    const dateStamp = new Date().toISOString().slice(2, 7).replace('-', '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setReceiveNo(`GRN-${dateStamp}-${randomSuffix}`);
    setDate(new Date().toISOString().split('T')[0]);
    setSupplierId('');
    setPurchaseOrderNo('');
    setInvoiceNo('');
    setRemarks('');
    setOverallDiscount(0);
    setItems([
      {
        id: 1,
        itemId: '',
        itemName: '',
        itemCode: '',
        unit: '',
        orderedQuantity: '',
        quantity: 1,
        unitCost: 0,
        discount: 0,
        lineTotal: 0,
        remarks: ''
      }
    ]);
    setShowVoucherModal(false);
    setPostedReceipt(null);
  };

  const handlePrint = () => {
    window.print();
  };

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
            <PackagePlus className="h-7 w-7 text-[#009966]" />
            Item Receive (Goods Received Note)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Receive incoming inventory from suppliers, verify shipments, and post stock updates directly to destination store accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounts/inventory/item-receive-list">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-zinc-300 text-zinc-700 hover:bg-zinc-100">
              <ListOrdered className="h-3.5 w-3.5 text-[#009966]" />
              View Receive List
            </Button>
          </Link>
          <div className="hidden sm:flex items-center text-sm text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Accounts</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/dashboard/accounts/inventory/item-list" className="hover:text-zinc-500 transition-colors">Inventory</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-zinc-950 font-bold">Item Receive</span>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <InventoryNav />

      {/* Main Receiving Card */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        {/* Card Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#009966]" />
            <div>
              <h2 className="text-base font-semibold text-zinc-950">GRN Voucher Details</h2>
              <p className="text-[11px] text-zinc-500">Fill in receipt metadata and add line items to increase store stock.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetForm}
              className="text-xs h-8 border-zinc-300 text-zinc-600 hover:bg-zinc-100"
            >
              Reset Form
            </Button>
          </div>
        </div>

        {/* Section 1: Header Metadata Form */}
        <div className="p-5 border-b border-zinc-200 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* GRN # */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">
                GRN / Receive No. <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={receiveNo}
                onChange={e => setReceiveNo(e.target.value)}
                placeholder="GRN-202610-001"
                className="bg-white border-zinc-300 text-zinc-900 font-mono text-xs focus-visible:ring-[#009966]"
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">
                Receiving Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900 text-xs focus-visible:ring-[#009966]"
                required
              />
            </div>

            {/* Supplier */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">
                Supplier / Vendor <span className="text-red-500">*</span>
              </Label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                disabled={loadingDropdowns}
                className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                required
              >
                <option value="">Select Supplier...</option>
                {suppliers.map(sup => (
                  <option key={sup._id} value={sup._id}>
                    {sup.name} {sup.phone ? `(${sup.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Store */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">
                Destination Store <span className="text-red-500">*</span>
              </Label>
              <select
                value={storeId}
                onChange={e => setStoreId(e.target.value)}
                disabled={loadingDropdowns}
                className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                required
              >
                <option value="">Select Store...</option>
                {stores.map(str => (
                  <option key={str._id} value={str._id}>
                    {str.name} {str.location ? `— ${str.location}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase Order # */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">
                Purchase Order No. (Optional)
              </Label>
              <Input
                type="text"
                value={purchaseOrderNo}
                onChange={e => setPurchaseOrderNo(e.target.value)}
                placeholder="PO-2026-092"
                className="bg-white border-zinc-300 text-zinc-900 text-xs focus-visible:ring-[#009966]"
              />
            </div>

            {/* Supplier Invoice # */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">
                Supplier Invoice / Bill No.
              </Label>
              <Input
                type="text"
                value={invoiceNo}
                onChange={e => setInvoiceNo(e.target.value)}
                placeholder="INV-99881"
                className="bg-white border-zinc-300 text-zinc-900 text-xs focus-visible:ring-[#009966]"
              />
            </div>

            {/* General Remarks */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">
                Receiving Notes / Shipment Remarks
              </Label>
              <Input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="e.g. Delivered by courier, inspected cartons in intact condition"
                className="bg-white border-zinc-300 text-zinc-900 text-xs focus-visible:ring-[#009966]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Line Items Dynamic Table */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <PackagePlus className="h-4 w-4 text-[#009966]" />
              Received Items List
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              className="h-8 text-xs gap-1 border-dashed border-[#009966] text-[#009966] hover:bg-emerald-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Another Item
            </Button>
          </div>

          <div className="overflow-x-auto border border-zinc-200 rounded-lg">
            <table className="w-full text-xs text-left min-w-[750px]">
              <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200 text-[11px] uppercase">
                <tr>
                  <th className="px-3 py-2.5 w-10 text-center">#</th>
                  <th className="px-3 py-2.5 min-w-[220px]">Item Description <span className="text-red-500">*</span></th>
                  <th className="px-3 py-2.5 w-24">Unit</th>
                  <th className="px-3 py-2.5 w-28 text-right">Qty Received <span className="text-red-500">*</span></th>
                  <th className="px-3 py-2.5 w-32 text-right">Unit Cost (Rs.)</th>
                  <th className="px-3 py-2.5 w-24 text-right">Discount</th>
                  <th className="px-3 py-2.5 w-32 text-right">Line Total (Rs.)</th>
                  <th className="px-3 py-2.5 min-w-[150px]">Notes</th>
                  <th className="px-3 py-2.5 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {items.map((row, index) => (
                  <tr key={row.id} className="hover:bg-zinc-50/50">
                    <td className="px-3 py-2 text-center text-zinc-400 font-medium">
                      {index + 1}
                    </td>

                    {/* Item Selector */}
                    <td className="px-3 py-2">
                      <select
                        value={row.itemId}
                        onChange={e => handleItemSelect(row.id, e.target.value)}
                        className="w-full h-8 rounded border border-zinc-300 bg-white px-2 text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-[#009966]"
                      >
                        <option value="">Select Item...</option>
                        {availableItems.map(item => (
                          <option key={item._id} value={item._id}>
                            {item.name} ({item.code}) — {item.totalStock} {item.unit || 'units'} in stock
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Unit */}
                    <td className="px-3 py-2">
                      <span className="inline-block px-2 py-1 bg-zinc-100 rounded text-zinc-700 font-mono text-[11px]">
                        {row.unit || '—'}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={row.quantity}
                        onChange={e => handleRowChange(row.id, 'quantity', e.target.value)}
                        className="h-8 text-right bg-white border-zinc-300 text-xs font-semibold"
                      />
                    </td>

                    {/* Unit Cost */}
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={row.unitCost}
                        onChange={e => handleRowChange(row.id, 'unitCost', e.target.value)}
                        className="h-8 text-right bg-white border-zinc-300 text-xs font-mono"
                      />
                    </td>

                    {/* Discount */}
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

                    {/* Line Remarks */}
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        placeholder="Batch / remarks"
                        value={row.remarks}
                        onChange={e => handleRowChange(row.id, 'remarks', e.target.value)}
                        className="h-8 bg-white border-zinc-300 text-xs"
                      />
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Summary & Footer Actions */}
        <div className="p-5 border-t border-zinc-200 bg-zinc-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Summary Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-white border border-zinc-200 px-3.5 py-2 rounded-lg shadow-2xs">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Total Items</span>
              <span className="text-sm font-bold text-zinc-900">{items.filter(i => i.itemId).length} lines</span>
            </div>

            <div className="bg-white border border-zinc-200 px-3.5 py-2 rounded-lg shadow-2xs">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Total Units Received</span>
              <span className="text-sm font-bold text-blue-600">{totalQuantity.toLocaleString()} units</span>
            </div>

            <div className="bg-white border border-zinc-200 px-3.5 py-2 rounded-lg shadow-2xs">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Total Value</span>
              <span className="text-base font-extrabold text-[#009966]">
                Rs. {netGrandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleSubmit('Draft')}
              className="flex-1 md:flex-none border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs h-9"
            >
              Save as Draft
            </Button>

            <Button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('Posted')}
              className="flex-1 md:flex-none bg-[#009966] hover:bg-[#007a52] text-white text-xs h-9 font-semibold gap-1.5 shadow-xs"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Posting Stock...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Post & Update Stock
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Post Success / Print Modal */}
      {showVoucherModal && postedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-2xl w-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 bg-emerald-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-emerald-950 text-base">GRN Posted Successfully!</h3>
                  <div className="text-[11px] text-emerald-700 font-mono">
                    Voucher: {postedReceipt.receiveNo} • Status: {postedReceipt.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body / Printable Receipt */}
            <div className="p-6 space-y-4 printable-voucher">
              <div className="text-center border-b border-zinc-200 pb-3">
                <h2 className="text-lg font-bold text-zinc-900 uppercase">Pak Royal College</h2>
                <p className="text-xs text-zinc-500">Goods Received Note (GRN) / Receiving Voucher</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">GRN Number</span>
                  <span className="font-mono font-bold text-zinc-900">{postedReceipt.receiveNo}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Date</span>
                  <span className="font-medium text-zinc-800">{formatDateDMY(postedReceipt.date)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Destination Store</span>
                  <span className="font-medium text-zinc-800">{stores.find(s => s._id === storeId)?.name || 'Store'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Supplier</span>
                  <span className="font-medium text-zinc-800">{suppliers.find(s => s._id === supplierId)?.name || 'Supplier'}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-100 text-zinc-700 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2 text-right">Quantity</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {postedReceipt.items?.map((it, idx) => {
                      const itemMatch = availableItems.find(i => i._id === (it.itemId?._id || it.itemId));
                      return (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-medium text-zinc-900">
                            {itemMatch?.name || 'Item'}
                            <span className="block text-[10px] text-zinc-400 font-mono">{itemMatch?.code}</span>
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-zinc-800">
                            {it.quantity} {itemMatch?.unit || 'units'}
                          </td>
                          <td className="px-3 py-2 text-right text-zinc-700">
                            Rs. {it.unitCost?.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-zinc-900">
                            Rs. {((it.quantity * it.unitCost) - (it.discount || 0)).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-zinc-50 border-t border-zinc-200 font-bold">
                    <tr>
                      <td colSpan="3" className="px-3 py-2 text-right text-zinc-700 uppercase text-[10px]">Grand Total:</td>
                      <td className="px-3 py-2 text-right text-[#009966] text-sm">
                        Rs. {(postedReceipt.totalAmount || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs border-zinc-300 text-zinc-700 gap-1.5"
              >
                <Printer className="h-3.5 w-3.5 text-zinc-600" />
                Print GRN Voucher
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  className="text-xs border-zinc-300 text-zinc-700"
                >
                  Create Another GRN
                </Button>
                <Link href="/dashboard/accounts/inventory/item-receive-list">
                  <Button
                    size="sm"
                    className="text-xs bg-[#009966] hover:bg-[#007a52] text-white font-medium gap-1"
                  >
                    View All Receives
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
