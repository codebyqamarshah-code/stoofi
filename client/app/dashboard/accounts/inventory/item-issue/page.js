'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Trash2, 
  SendHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Printer,
  Eye,
  RotateCcw,
  Warehouse,
  User,
  Building,
  Calendar,
  FileText,
  Boxes,
  ShieldCheck,
  X,
  Undo2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDMY } from '@/lib/utils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';
import InventoryNav from '@/components/inventory/InventoryNav';

export default function ItemIssuePage() {
  const [activeTab, setActiveTab] = useState('new-issue'); // 'new-issue' or 'issue-list'

  // Dropdown data
  const [stores, setStores] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Form State
  const [issueNo, setIssueNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [storeId, setStoreId] = useState('');
  const [recipientType, setRecipientType] = useState('Department');
  const [recipientId, setRecipientId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [department, setDepartment] = useState('');
  const [purpose, setPurpose] = useState('');

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
      condition: 'Good',
      remarks: ''
    }
  ]);

  // Issues list & stats
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    totalQuantity: 0,
    issuedCount: 0,
    partiallyReturnedCount: 0,
    fullyReturnedCount: 0,
    cancelledCount: 0
  });
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Feedback
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewIssue, setViewIssue] = useState(null);

  // Return modal state
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [returnLines, setReturnLines] = useState([]);
  const [returnRemarks, setReturnRemarks] = useState('');
  const [processingReturn, setProcessingReturn] = useState(false);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const generateIssueNo = () => {
    const dateStamp = new Date().toISOString().slice(2, 7).replace('-', '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `ISS-${dateStamp}-${randomSuffix}`;
  };

  // Load stores & items on mount
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

        setIssueNo(generateIssueNo());
      } catch (err) {
        console.error('Error loading initial dropdown data:', err);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch dynamic recipients when recipientType changes
  useEffect(() => {
    const loadRecipients = async () => {
      try {
        const res = await api.get(`/inventory/recipients?type=${recipientType}`);
        if (res && res.success) {
          setRecipientOptions(res.data || []);
        }
      } catch (err) {
        console.error('Error loading recipients:', err);
      }
    };

    loadRecipients();
  }, [recipientType]);

  // Fetch issues records
  const fetchIssues = async () => {
    try {
      setLoadingIssues(true);
      let url = '/inventory/issue';
      const params = [];
      if (storeFilter !== 'All') params.push(`store=${encodeURIComponent(storeFilter)}`);
      if (typeFilter !== 'All') params.push(`recipientType=${encodeURIComponent(typeFilter)}`);
      if (statusFilter !== 'All') params.push(`status=${encodeURIComponent(statusFilter)}`);
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res && res.success) {
        setIssues(res.data || []);
        if (res.stats) setStats(res.stats);
      } else if (Array.isArray(res)) {
        setIssues(res);
      }
    } catch (err) {
      console.error('Error fetching issue list:', err);
      showToast('Error loading issued records', true);
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [storeFilter, typeFilter, statusFilter]);

  // Pick recipient from dropdown
  const handleSelectRecipient = (e) => {
    const selectedId = e.target.value;
    setRecipientId(selectedId);
    const rec = recipientOptions.find(r => r.id === selectedId);
    if (rec) {
      setRecipientName(rec.name);
      if (rec.department) setDepartment(rec.department);
      else if (recipientType === 'Department') setDepartment(rec.name);
    }
  };

  // Helper to get stock of an item in the currently selected store
  const getStoreStock = (item, currentStoreId) => {
    if (!item) return 0;
    if (!currentStoreId) return item.totalStock || 0;
    const storeRecord = item.storeStock?.find(s => s.storeId?._id === currentStoreId || s.storeId === currentStoreId);
    return storeRecord ? storeRecord.quantity : 0;
  };

  // Update item selection
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
          availableStock: 0
        };
      }

      const availableInStore = getStoreStock(selectedItem, storeId);

      return {
        ...row,
        itemId: selectedItem._id,
        itemName: selectedItem.name,
        itemCode: selectedItem.code,
        unit: selectedItem.unit || 'pcs',
        availableStock: availableInStore
      };
    }));
  };

  // Handle store change
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
      return { ...row, [field]: value };
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
        condition: 'Good',
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

  // Total quantity
  const totalUnits = items.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

  // Submit Issue
  const handleSubmitIssue = async () => {
    if (!storeId) {
      showToast('Please select a issuing store.', true);
      return;
    }
    if (!recipientName.trim()) {
      showToast('Please specify recipient / department name.', true);
      return;
    }

    const validItems = items.filter(r => r.itemId && Number(r.quantity) > 0);
    if (validItems.length === 0) {
      showToast('Please add at least one item with quantity greater than zero.', true);
      return;
    }

    // Stock check
    for (const row of validItems) {
      if (Number(row.quantity) > row.availableStock) {
        showToast(`Insufficient stock for "${row.itemName}". Available in store: ${row.availableStock}, Requested: ${row.quantity}`, true);
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        issueNo: issueNo.trim() || generateIssueNo(),
        date,
        expectedReturnDate: expectedReturnDate || undefined,
        storeId,
        recipientType,
        recipientId: recipientId || undefined,
        recipientName: recipientName.trim(),
        department: department.trim(),
        purpose: purpose.trim(),
        items: validItems.map(row => ({
          itemId: row.itemId,
          quantity: Number(row.quantity),
          condition: row.condition || 'Good',
          remarks: row.remarks ? row.remarks.trim() : ''
        }))
      };

      const res = await api.post('/inventory/issue', payload);
      if (res && res.success) {
        showToast('Items issued successfully! Stock deducted from store.');
        setViewIssue(res.data);
        resetIssueForm();
        fetchIssues();
      } else {
        showToast(res?.message || 'Failed to issue items.', true);
      }
    } catch (err) {
      console.error('Error submitting issue:', err);
      showToast(err.response?.data?.message || 'Failed to issue inventory items.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetIssueForm = () => {
    setIssueNo(generateIssueNo());
    setDate(new Date().toISOString().split('T')[0]);
    setExpectedReturnDate('');
    setRecipientType('Department');
    setRecipientId('');
    setRecipientName('');
    setDepartment('');
    setPurpose('');
    setItems([
      {
        id: 1,
        itemId: '',
        itemName: '',
        itemCode: '',
        unit: '',
        availableStock: 0,
        quantity: 1,
        condition: 'Good',
        remarks: ''
      }
    ]);
  };

  // Open Return Modal
  const handleOpenReturn = (issue) => {
    setReturnTarget(issue);
    setReturnDate(new Date().toISOString().split('T')[0]);
    setReturnRemarks('');
    // Initialize return lines with pending return quantities
    const lines = (issue.items || []).map(it => {
      const pendingQty = Math.max(0, it.quantity - (it.returnedQuantity || 0));
      return {
        itemId: it.itemId?._id || it.itemId,
        name: it.itemId?.name || 'Item',
        code: it.itemId?.code || '',
        unit: it.itemId?.unit || 'pcs',
        issuedQuantity: it.quantity,
        alreadyReturned: it.returnedQuantity || 0,
        pendingQuantity: pendingQty,
        returnQuantity: pendingQty, // default to returning all pending
        condition: 'Good',
        remarks: ''
      };
    });
    setReturnLines(lines);
  };

  // Confirm Return API
  const handleConfirmReturn = async () => {
    if (!returnTarget) return;

    const itemsToReturn = returnLines.filter(l => Number(l.returnQuantity) > 0);
    if (itemsToReturn.length === 0) {
      showToast('Please enter return quantity greater than zero.', true);
      return;
    }

    try {
      setProcessingReturn(true);
      const payload = {
        returnDate,
        remarks: returnRemarks.trim(),
        items: itemsToReturn.map(l => ({
          itemId: l.itemId,
          returnQuantity: Number(l.returnQuantity),
          condition: l.condition,
          remarks: l.remarks
        }))
      };

      const res = await api.post(`/inventory/issue/${returnTarget._id}/return`, payload);
      if (res && res.success) {
        showToast('Returned items processed! Stock has been returned to store.');
        setReturnTarget(null);
        fetchIssues();
      } else {
        showToast(res?.message || 'Failed to process return.', true);
      }
    } catch (err) {
      console.error('Error processing return:', err);
      showToast(err.response?.data?.message || 'Failed to record returned items.', true);
    } finally {
      setProcessingReturn(false);
    }
  };

  // Filtered issues
  const filteredIssues = issues.filter(iss => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      iss.issueNo?.toLowerCase().includes(q) ||
      iss.recipientName?.toLowerCase().includes(q) ||
      iss.department?.toLowerCase().includes(q) ||
      iss.storeId?.name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage) || 1;
  const paginatedIssues = filteredIssues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportColumns = [
    { key: 'issueNo', label: 'Issue Number' },
    { key: 'date', label: 'Issue Date' },
    { key: 'recipientName', label: 'Recipient Name' },
    { key: 'recipientType', label: 'Type' },
    { key: 'department', label: 'Department' },
    { key: 'storeName', label: 'Issuing Store' },
    { key: 'totalQuantity', label: 'Total Units' },
    { key: 'expectedReturnDate', label: 'Expected Return' },
    { key: 'status', label: 'Status' }
  ];

  const exportData = filteredIssues.map(iss => ({
    ...iss,
    date: formatDateDMY(iss.date),
    expectedReturnDate: iss.expectedReturnDate ? formatDateDMY(iss.expectedReturnDate) : 'N/A',
    storeName: iss.storeId?.name || 'N/A'
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
            <SendHorizontal className="h-7 w-7 text-[#009966]" />
            Item Issue & Internal Requisition
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Dispatch laboratory equipment, teaching materials, books, or tools to departments and staff with return tracking.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/accounts/inventory/item-list" className="hover:text-zinc-500 transition-colors">Inventory</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Item Issue</span>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <InventoryNav />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-[#009966]">
            <SendHorizontal className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{stats.totalIssues || issues.length}</div>
            <div className="text-xs text-zinc-500 font-medium">Total Requisitions</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">{(stats.totalQuantity || 0).toLocaleString()}</div>
            <div className="text-xs text-zinc-500 font-medium">Total Units Issued</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">
              {stats.issuedCount || issues.filter(i => i.status === 'Issued').length}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Currently Issued (Out)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
            <Undo2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900">
              {(stats.fullyReturnedCount || 0) + (stats.partiallyReturnedCount || 0)}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Returned Requisitions</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: New Issue vs Issued History */}
      <div className="flex border-b border-zinc-200 bg-white px-4 pt-2 rounded-t-xl">
        <button
          onClick={() => setActiveTab('new-issue')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'new-issue'
              ? 'border-[#009966] text-[#009966]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <SendHorizontal className="h-4 w-4" />
          Issue Items Requisition
        </button>

        <button
          onClick={() => { setActiveTab('issue-list'); fetchIssues(); }}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'issue-list'
              ? 'border-[#009966] text-[#009966]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          Issued Items History & Returns
          <span className="text-[10px] bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded-full font-bold">
            {issues.length}
          </span>
        </button>
      </div>

      {/* TAB 1: NEW ISSUE FORM */}
      {activeTab === 'new-issue' && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-b-xl overflow-hidden">
          {/* Header Inputs */}
          <div className="p-5 border-b border-zinc-200 bg-zinc-50/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Issue # */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Requisition / Issue No. <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={issueNo}
                  onChange={e => setIssueNo(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 font-mono text-xs focus-visible:ring-[#009966]"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Issue Date <span className="text-red-500">*</span>
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
                  Issuing Store <span className="text-red-500">*</span>
                </Label>
                <select
                  value={storeId}
                  onChange={e => handleStoreChange(e.target.value)}
                  disabled={loadingDropdowns}
                  className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                  required
                >
                  <option value="">Select Issuing Store...</option>
                  {stores.map(str => (
                    <option key={str._id} value={str._id}>
                      {str.name} {str.location ? `(${str.location})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expected Return Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Expected Return Date (Optional)
                </Label>
                <Input
                  type="date"
                  value={expectedReturnDate}
                  onChange={e => setExpectedReturnDate(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 text-xs focus-visible:ring-[#009966]"
                />
              </div>

              {/* Recipient Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Recipient Type <span className="text-red-500">*</span>
                </Label>
                <select
                  value={recipientType}
                  onChange={e => {
                    setRecipientType(e.target.value);
                    setRecipientId('');
                    setRecipientName('');
                    setDepartment('');
                  }}
                  className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                >
                  <option value="Department">Academic / Admin Department</option>
                  <option value="Teacher">Faculty / Teacher</option>
                  <option value="Staff">Administrative Staff</option>
                  <option value="Student">Student (Lab / Project)</option>
                </select>
              </div>

              {/* Select Recipient from Database */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Select {recipientType} from Database
                </Label>
                <select
                  value={recipientId}
                  onChange={handleSelectRecipient}
                  className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
                >
                  <option value="">Select or type manually below...</option>
                  {recipientOptions.map(rec => (
                    <option key={rec.id} value={rec.id}>
                      {rec.name} {rec.info ? `— ${rec.info}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Recipient Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Physics Department"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 text-xs focus-visible:ring-[#009966]"
                  required
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Department / Lab
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Sciences & IT"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 text-xs focus-visible:ring-[#009966]"
                />
              </div>

              {/* Purpose */}
              <div className="space-y-1.5 sm:col-span-3">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">
                  Requisition Purpose / Notes
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Required for intermediate annual practical examination sessions"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 text-xs focus-visible:ring-[#009966]"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="h-4 w-4 text-[#009966]" />
                Items to Issue
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
              <table className="w-full text-xs text-left min-w-[700px]">
                <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200 text-[11px] uppercase">
                  <tr>
                    <th className="px-3 py-2.5 w-10 text-center">#</th>
                    <th className="px-3 py-2.5 min-w-[240px]">Select Item <span className="text-red-500">*</span></th>
                    <th className="px-3 py-2.5 w-28 text-center">Store Stock</th>
                    <th className="px-3 py-2.5 w-24 text-right">Quantity <span className="text-red-500">*</span></th>
                    <th className="px-3 py-2.5 w-32">Condition</th>
                    <th className="px-3 py-2.5 min-w-[180px]">Remarks / Serial</th>
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
                            <option value="">Select Item to issue...</option>
                            {availableItems.map(item => (
                              <option key={item._id} value={item._id}>
                                {item.name} ({item.code})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Available Stock in Store */}
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

                        {/* Condition */}
                        <td className="px-3 py-2">
                          <select
                            value={row.condition}
                            onChange={e => handleRowChange(row.id, 'condition', e.target.value)}
                            className="w-full h-8 rounded border border-zinc-300 bg-white px-2 text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-[#009966]"
                          >
                            <option value="Brand New">Brand New</option>
                            <option value="Good">Good / Working</option>
                            <option value="Fair">Fair Condition</option>
                          </select>
                        </td>

                        {/* Remarks */}
                        <td className="px-3 py-2">
                          <Input
                            type="text"
                            placeholder="Tag #, Serial, or condition notes"
                            value={row.remarks}
                            onChange={e => handleRowChange(row.id, 'remarks', e.target.value)}
                            className="h-8 bg-white border-zinc-300 text-xs"
                          />
                        </td>

                        {/* Remove */}
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

          {/* Footer Submit */}
          <div className="p-5 border-t border-zinc-200 bg-zinc-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="bg-white border border-zinc-200 px-3.5 py-2 rounded-lg shadow-2xs">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Total Items to Dispatch</span>
                <span className="text-sm font-bold text-zinc-900">{items.filter(i => i.itemId).length} item lines</span>
              </div>

              <div className="bg-white border border-zinc-200 px-3.5 py-2 rounded-lg shadow-2xs">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Total Units Issued</span>
                <span className="text-sm font-bold text-[#009966]">{totalUnits.toLocaleString()} units</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetIssueForm}
                className="border-zinc-300 text-zinc-600 hover:bg-zinc-100 text-xs h-9"
              >
                Reset
              </Button>

              <Button
                type="button"
                disabled={submitting}
                onClick={handleSubmitIssue}
                className="bg-[#009966] hover:bg-[#007a52] text-white text-xs h-9 font-semibold gap-1.5 shadow-xs"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Dispatching Items...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Confirm & Dispatch Items
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ISSUED ITEMS LIST */}
      {activeTab === 'issue-list' && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-b-xl overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#009966]" />
              <h2 className="text-base font-semibold text-zinc-950">Issued Items Registry</h2>
              <span className="text-xs bg-zinc-200 text-zinc-700 font-semibold px-2 py-0.5 rounded-full">
                {filteredIssues.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative w-44 sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input 
                  placeholder="Search issue #, recipient..." 
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
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
              >
                <option value="All">All Status</option>
                <option value="Issued">Issued (Out)</option>
                <option value="Partially Returned">Partially Returned</option>
                <option value="Fully Returned">Fully Returned</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Recipient Type Filter */}
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[#009966]"
              >
                <option value="All">All Recipients</option>
                <option value="Department">Department</option>
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
                <option value="Student">Student</option>
              </select>

              {/* Reload */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchIssues}
                disabled={loadingIssues}
                className="h-8 w-8 p-0 border-zinc-300 hover:bg-zinc-100"
                title="Reload"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-zinc-600 ${loadingIssues ? 'animate-spin' : ''}`} />
              </Button>

              {/* Export Toolbar */}
              <TableExportToolbar 
                data={exportData} 
                columns={exportColumns} 
                fileName="issued-items-list" 
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-zinc-600 uppercase font-semibold bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">SL</th>
                  <th className="px-3 py-3">Issue #</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Recipient & Department</th>
                  <th className="px-3 py-3">Source Store</th>
                  <th className="px-3 py-3 text-center">Units Issued</th>
                  <th className="px-3 py-3">Expected Return</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loadingIssues ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-[#009966]" />
                        <span className="text-xs text-zinc-500 font-medium">Loading issue records...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedIssues.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <SendHorizontal className="h-8 w-8 text-zinc-300" />
                        <p className="text-zinc-600 font-medium">No issue records found</p>
                        <p className="text-zinc-400 text-[11px]">
                          Issue items to teachers, departments or students using the first tab.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedIssues.map((iss, index) => {
                    const slNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    const isIssued = iss.status === 'Issued';
                    const isPartial = iss.status === 'Partially Returned';
                    const isReturned = iss.status === 'Fully Returned';

                    return (
                      <tr 
                        key={iss._id} 
                        className="hover:bg-zinc-50/80 transition-colors"
                      >
                        <td className="px-3 py-3 text-center text-zinc-400 font-medium">
                          {slNumber}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-zinc-900">
                          {iss.issueNo}
                        </td>
                        <td className="px-3 py-3 text-zinc-700">
                          {formatDateDMY(iss.date)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-zinc-900 flex items-center gap-1">
                            <User className="h-3 w-3 text-zinc-400 shrink-0" />
                            {iss.recipientName}
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            {iss.recipientType} {iss.department ? `• ${iss.department}` : ''}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-zinc-700">
                          <div className="flex items-center gap-1">
                            <Warehouse className="h-3 w-3 text-zinc-400 shrink-0" />
                            {iss.storeId?.name || 'General Store'}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-zinc-800">
                          {(iss.totalQuantity || 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-zinc-600">
                          {iss.expectedReturnDate ? formatDateDMY(iss.expectedReturnDate) : '—'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isReturned
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : isPartial
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : isIssued
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              isReturned ? 'bg-emerald-500' : isPartial ? 'bg-blue-500' : 'bg-amber-500'
                            }`} />
                            {iss.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewIssue(iss)}
                              className="p-1 rounded text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View Issue Voucher & Print"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {(isIssued || isPartial) && (
                              <button
                                onClick={() => handleOpenReturn(iss)}
                                className="p-1 rounded text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Process Return of Items (Restores Store Stock)"
                              >
                                <Undo2 className="h-3.5 w-3.5" />
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
          {filteredIssues.length > itemsPerPage && (
            <div className="p-3 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50 text-xs">
              <span className="text-zinc-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredIssues.length)} of {filteredIssues.length} records
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

      {/* View Issue Voucher Modal */}
      {viewIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <SendHorizontal className="h-5 w-5 text-[#009966]" />
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Issue Voucher #{viewIssue.issueNo}</h3>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Status: {viewIssue.status} • {formatDateDMY(viewIssue.date)}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewIssue(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Voucher body */}
            <div className="p-6 overflow-y-auto space-y-4 printable-voucher">
              <div className="text-center border-b border-zinc-200 pb-3">
                <h2 className="text-lg font-bold text-zinc-900 uppercase">Pak Royal College</h2>
                <p className="text-xs text-zinc-500">Official Internal Inventory Requisition & Issue Voucher</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Recipient</span>
                  <span className="font-bold text-zinc-900">{viewIssue.recipientName}</span>
                  <span className="block text-[10px] text-zinc-500">{viewIssue.recipientType}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Department / Lab</span>
                  <span className="font-semibold text-zinc-800">{viewIssue.department || 'General'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Issuing Store</span>
                  <span className="font-semibold text-zinc-800">{viewIssue.storeId?.name || stores.find(s => s._id === storeId)?.name || 'Store'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Expected Return</span>
                  <span className="font-semibold text-zinc-800">{viewIssue.expectedReturnDate ? formatDateDMY(viewIssue.expectedReturnDate) : 'Not specified'}</span>
                </div>
              </div>

              {viewIssue.purpose && (
                <div className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded border border-zinc-100">
                  <span className="font-semibold text-zinc-700">Purpose: </span>{viewIssue.purpose}
                </div>
              )}

              {/* Items List */}
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-100 text-zinc-700 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2 text-right">Issued Qty</th>
                      <th className="px-3 py-2 text-right">Returned</th>
                      <th className="px-3 py-2">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {viewIssue.items?.map((it, idx) => {
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
                            {it.quantity} {itemMatch?.unit || 'units'}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-700">
                            {it.returnedQuantity || 0}
                          </td>
                          <td className="px-3 py-2 text-zinc-600">
                            {it.condition || 'Good'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-zinc-50 border-t border-zinc-200 font-bold">
                    <tr>
                      <td className="px-3 py-2 text-right text-zinc-700 uppercase text-[10px]">Total Units:</td>
                      <td className="px-3 py-2 text-right text-[#009966]">
                        {viewIssue.totalQuantity || 0}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs border-zinc-300 text-zinc-700 gap-1.5"
              >
                <Printer className="h-3.5 w-3.5 text-zinc-600" />
                Print Voucher
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewIssue(null)}
                className="text-xs border-zinc-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Return Items Modal */}
      {returnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-emerald-50 flex items-center gap-2 text-emerald-950">
              <Undo2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-base">Process Item Return</h3>
                <p className="text-[11px] text-emerald-700">Requisition: {returnTarget.issueNo} • Recipient: {returnTarget.recipientName}</p>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Return Date</Label>
                  <Input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Return Remarks / Inspection</Label>
                  <Input
                    type="text"
                    value={returnRemarks}
                    onChange={e => setReturnRemarks(e.target.value)}
                    placeholder="e.g. Inspected by lab technician"
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>
              </div>

              {/* Items returning table */}
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-100 text-zinc-700 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2 text-center">Issued</th>
                      <th className="px-3 py-2 text-center">Pending</th>
                      <th className="px-3 py-2 w-24 text-right">Return Qty</th>
                      <th className="px-3 py-2 w-28">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {returnLines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="px-3 py-2 font-medium text-zinc-900">
                          {line.name}
                          <span className="block text-[10px] text-zinc-400 font-mono">{line.code}</span>
                        </td>
                        <td className="px-3 py-2 text-center text-zinc-600">
                          {line.issuedQuantity}
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-amber-700">
                          {line.pendingQuantity}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Input
                            type="number"
                            min="0"
                            max={line.pendingQuantity}
                            value={line.returnQuantity}
                            onChange={e => {
                              const val = Math.min(line.pendingQuantity, Math.max(0, Number(e.target.value) || 0));
                              setReturnLines(prev => prev.map((l, i) => i === idx ? { ...l, returnQuantity: val } : l));
                            }}
                            className="h-7 text-right bg-white border-zinc-300 text-xs font-bold"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={line.condition}
                            onChange={e => {
                              const val = e.target.value;
                              setReturnLines(prev => prev.map((l, i) => i === idx ? { ...l, condition: val } : l));
                            }}
                            className="w-full h-7 text-xs rounded border border-zinc-300 bg-white px-1"
                          >
                            <option value="Good">Good</option>
                            <option value="Damaged">Damaged</option>
                            <option value="Needs Repair">Needs Repair</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={processingReturn}
                onClick={() => setReturnTarget(null)}
                className="text-xs border-zinc-300"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={processingReturn}
                onClick={handleConfirmReturn}
                className="text-xs bg-[#009966] hover:bg-[#007a52] text-white font-semibold"
              >
                {processingReturn ? 'Processing Return...' : 'Confirm Return & Restore Stock'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
