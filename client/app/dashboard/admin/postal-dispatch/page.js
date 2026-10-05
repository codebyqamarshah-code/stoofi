'use client';

import Link from 'next/link';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Search, 
  Download, 
  Printer, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Send,
  Package,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Paperclip,
  FileCheck,
  AlertCircle,
  Truck,
  Hash,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import api from '@/services/api';

// Helper to get today's date in YYYY-MM-DD
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

// Helper to get current time in 12-hour format
function getCurrentTimeFormatted() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Helper to format date cleanly
function formatDate(dateVal) {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateVal;
  }
}

// Helper to format date-time
function formatDateTime(dateVal) {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateVal;
  }
}

// Status badge renderer (using Stoofi PRO green/black/white theme)
function StatusBadge({ status }) {
  const s = status || 'Dispatched';
  switch (s) {
    case 'Draft':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-300">
          <Clock className="w-3 h-3 text-zinc-500" />
          Draft
        </span>
      );
    case 'Dispatched':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-white border border-zinc-900">
          <Send className="w-3 h-3 text-emerald-400" />
          Dispatched
        </span>
      );
    case 'Delivered':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Delivered
        </span>
      );
    case 'Returned':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
          <RotateCcw className="w-3 h-3 text-zinc-600" />
          Returned
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
          {s}
        </span>
      );
  }
}

export default function PostalDispatchPage() {
  // Main Data States
  const [postalDispatches, setPostalDispatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals & Panels
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewDispatch, setViewDispatch] = useState(null);
  const [deliverModalDispatch, setDeliverModalDispatch] = useState(null);
  const [returnModalDispatch, setReturnModalDispatch] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const initialFormState = {
    recipientName: '',
    toCategory: 'Parent/Guardian',
    address: '',
    phone: '',
    email: '',
    postalType: 'Letter',
    subject: '',
    referenceNo: '',
    note: '',
    fromTitle: "Principal's Office",
    department: 'Administration',
    dispatchedBy: 'Admin',
    dispatchDate: getTodayDateString(),
    dispatchTime: getCurrentTimeFormatted(),
    dispatchMode: 'Courier',
    trackingNo: '',
    status: 'Dispatched',
    file: null
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Delivery Modal Form State
  const [deliveryData, setDeliveryData] = useState({
    deliveryDate: getTodayDateString(),
    deliveredBy: '',
    deliveryRemarks: ''
  });
  const [delivering, setDelivering] = useState(false);

  // Return Modal Form State
  const [returnData, setReturnData] = useState({
    returnDate: getTodayDateString(),
    returnReason: 'Address Not Found',
    returnRemarks: ''
  });
  const [returning, setReturning] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [postalTypeFilter, setPostalTypeFilter] = useState('All');
  const [dispatchModeFilter, setDispatchModeFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [customDate, setCustomDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Toast notifier
  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dispatchRes, deptRes, staffRes, teacherRes] = await Promise.all([
        api.get('/postal-dispatch'),
        api.get('/department').catch(() => ({ data: [] })),
        api.get('/staff').catch(() => ({ data: [] })),
        api.get('/teachers').catch(() => ({ data: [] }))
      ]);

      if (dispatchRes?.success) {
        setPostalDispatches(dispatchRes.data || []);
      }

      // Populate Departments
      const stdDepts = ['Administration', 'Academic Section', 'Examination Branch', 'Accounts & Fees', 'HR Department', 'Student Affairs', 'Transport Office'];
      if (Array.isArray(deptRes?.data)) {
        deptRes.data.forEach(d => {
          const name = d.departmentName || d.name || d.title;
          if (name && !stdDepts.includes(name)) stdDepts.push(name);
        });
      }
      setDepartments(stdDepts);

      // Populate Staff
      const combinedStaff = ['Admin', 'Principal', 'Vice Principal', 'Front Desk Officer', 'Office Superintendent', 'Dispatch Incharge'];
      if (Array.isArray(staffRes?.data)) {
        staffRes.data.forEach(s => {
          const name = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim();
          if (name && !combinedStaff.includes(name)) combinedStaff.push(name);
        });
      }
      if (Array.isArray(teacherRes?.data)) {
        teacherRes.data.forEach(t => {
          const name = t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim();
          if (name && !combinedStaff.includes(name)) combinedStaff.push(`Teacher: ${name}`);
        });
      }
      setStaffList(combinedStaff);

    } catch (err) {
      console.error('Error fetching postal dispatch records:', err);
      setError('Failed to load postal dispatch records. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.recipientName.trim()) {
      errors.recipientName = 'Recipient / Organization name is required.';
    }

    if (!formData.address.trim()) {
      errors.address = 'Destination address is required.';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject / Document title is required.';
    }

    if (!formData.fromTitle.trim()) {
      errors.fromTitle = 'Sender / From title is required.';
    }

    if (!formData.dispatchDate) {
      errors.dispatchDate = 'Dispatch date is required.';
    }

    if (formData.phone && formData.phone.trim()) {
      const cleaned = formData.phone.replace(/[\s\-()]/g, '');
      if (cleaned.length < 7 || cleaned.length > 15 || /^0+$/.test(cleaned)) {
        errors.phone = 'Please enter a valid phone number (e.g. 03331234567).';
      }
    }

    if (formData.email && formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form (Create / Update)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append('recipientName', formData.recipientName.trim());
      payload.append('toTitle', formData.recipientName.trim());
      payload.append('toCategory', formData.toCategory);
      payload.append('address', formData.address.trim());
      payload.append('phone', formData.phone ? formData.phone.trim() : '');
      payload.append('email', formData.email ? formData.email.trim() : '');
      payload.append('postalType', formData.postalType);
      payload.append('subject', formData.subject.trim());
      payload.append('referenceNo', formData.referenceNo ? formData.referenceNo.trim() : '');
      payload.append('note', formData.note ? formData.note.trim() : '');
      payload.append('fromTitle', formData.fromTitle.trim());
      payload.append('department', formData.department || 'Administration');
      payload.append('dispatchedBy', formData.dispatchedBy || 'Admin');
      payload.append('dispatchDate', formData.dispatchDate);
      payload.append('dispatchTime', formData.dispatchTime ? formData.dispatchTime.trim() : '');
      payload.append('dispatchMode', formData.dispatchMode);
      payload.append('trackingNo', formData.trackingNo ? formData.trackingNo.trim() : '');
      payload.append('status', formData.status || 'Dispatched');

      if (formData.file) {
        payload.append('file', formData.file);
      }

      let res;
      if (editingId) {
        res = await api.put(`/postal-dispatch/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res?.success) {
          setPostalDispatches(prev => prev.map(p => p._id === editingId ? res.data : p));
          showToast(`Dispatch record ${res.data.dispatchId || ''} updated successfully!`);
        }
      } else {
        res = await api.post('/postal-dispatch', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res?.success) {
          setPostalDispatches(prev => [res.data, ...prev]);
          showToast(`Postal dispatch recorded successfully (${res.data.dispatchId || 'PD'}).`);
        }
      }

      // Reset form
      setFormData(initialFormState);
      setFormErrors({});
      setShowForm(false);
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error saving postal dispatch:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save postal dispatch record.', true);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Action
  const handleEdit = (dispatch) => {
    setEditingId(dispatch._id);
    setFormData({
      recipientName: dispatch.recipientName || dispatch.toTitle || '',
      toCategory: dispatch.toCategory || 'Parent/Guardian',
      address: dispatch.address || '',
      phone: dispatch.phone || '',
      email: dispatch.email || '',
      postalType: dispatch.postalType || 'Letter',
      subject: dispatch.subject || '',
      referenceNo: dispatch.referenceNo || '',
      note: dispatch.note || '',
      fromTitle: dispatch.fromTitle || "Principal's Office",
      department: dispatch.department || 'Administration',
      dispatchedBy: dispatch.dispatchedBy || 'Admin',
      dispatchDate: dispatch.dispatchDate ? dispatch.dispatchDate.substring(0, 10) : getTodayDateString(),
      dispatchTime: dispatch.dispatchTime || getCurrentTimeFormatted(),
      dispatchMode: dispatch.dispatchMode || 'Courier',
      trackingNo: dispatch.trackingNo || '',
      status: dispatch.status || 'Dispatched',
      file: null
    });
    setFormErrors({});
    setShowForm(true);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Mark as Delivered Submit
  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!deliverModalDispatch) return;

    try {
      setDelivering(true);
      const res = await api.patch(`/postal-dispatch/${deliverModalDispatch._id}/status`, {
        status: 'Delivered',
        deliveryDate: deliveryData.deliveryDate,
        deliveredBy: deliveryData.deliveredBy.trim(),
        deliveryRemarks: deliveryData.deliveryRemarks.trim()
      });

      if (res?.success) {
        setPostalDispatches(prev => prev.map(p => p._id === deliverModalDispatch._id ? res.data : p));
        if (viewDispatch && viewDispatch._id === deliverModalDispatch._id) {
          setViewDispatch(res.data);
        }
        showToast(`Dispatch ${deliverModalDispatch.dispatchId || ''} marked as Delivered!`);
        setDeliverModalDispatch(null);
      }
    } catch (err) {
      console.error('Failed to mark delivered:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to update status', true);
    } finally {
      setDelivering(false);
    }
  };

  // Handle Mark as Returned Submit
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModalDispatch) return;

    try {
      setReturning(true);
      const res = await api.patch(`/postal-dispatch/${returnModalDispatch._id}/status`, {
        status: 'Returned',
        returnDate: returnData.returnDate,
        returnReason: returnData.returnReason,
        returnRemarks: returnData.returnRemarks.trim()
      });

      if (res?.success) {
        setPostalDispatches(prev => prev.map(p => p._id === returnModalDispatch._id ? res.data : p));
        if (viewDispatch && viewDispatch._id === returnModalDispatch._id) {
          setViewDispatch(res.data);
        }
        showToast(`Dispatch ${returnModalDispatch.dispatchId || ''} marked as Returned.`);
        setReturnModalDispatch(null);
      }
    } catch (err) {
      console.error('Failed to mark returned:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to update status', true);
    } finally {
      setReturning(false);
    }
  };

  // Delete Action
  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const res = await api.delete(`/postal-dispatch/${deleteConfirmId}`);
      if (res?.success) {
        setPostalDispatches(prev => prev.filter(p => p._id !== deleteConfirmId));
        if (viewDispatch && viewDispatch._id === deleteConfirmId) {
          setViewDispatch(null);
        }
        showToast('Postal dispatch record deleted successfully.');
      }
    } catch (err) {
      console.error('Error deleting postal dispatch:', err);
      showToast(err?.response?.data?.message || 'Failed to delete record.', true);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Real-time Summary Cards
  const stats = useMemo(() => {
    const todayStr = getTodayDateString();
    const total = postalDispatches.length;
    const dispatchedToday = postalDispatches.filter(p => {
      const pDate = p.dispatchDate ? p.dispatchDate.substring(0, 10) : p.date;
      return pDate === todayStr && p.status !== 'Draft';
    }).length;
    const delivered = postalDispatches.filter(p => p.status === 'Delivered').length;
    const returned = postalDispatches.filter(p => p.status === 'Returned').length;

    return { total, dispatchedToday, delivered, returned };
  }, [postalDispatches]);

  // Multi-Filter & Search Pipeline
  const filteredDispatches = useMemo(() => {
    return postalDispatches.filter(p => {
      // 1. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const idMatch = (p.dispatchId || '').toLowerCase().includes(query);
        const recipientMatch = (p.recipientName || p.toTitle || '').toLowerCase().includes(query);
        const refMatch = (p.referenceNo || '').toLowerCase().includes(query);
        const addressMatch = (p.address || '').toLowerCase().includes(query);
        const subjectMatch = (p.subject || '').toLowerCase().includes(query);
        const trackMatch = (p.trackingNo || '').toLowerCase().includes(query);
        const fromMatch = (p.fromTitle || '').toLowerCase().includes(query);
        const deptMatch = (p.department || '').toLowerCase().includes(query);

        if (!idMatch && !recipientMatch && !refMatch && !addressMatch && !subjectMatch && !trackMatch && !fromMatch && !deptMatch) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'All' && p.status !== statusFilter) {
        return false;
      }

      // 3. Postal Type Filter
      if (postalTypeFilter !== 'All' && p.postalType !== postalTypeFilter) {
        return false;
      }

      // 4. Dispatch Mode Filter
      if (dispatchModeFilter !== 'All' && p.dispatchMode !== dispatchModeFilter) {
        return false;
      }

      // 5. Department Filter
      if (departmentFilter !== 'All' && (p.department || 'Administration') !== departmentFilter) {
        return false;
      }

      // 6. Date Filter
      if (dateFilter === 'Today') {
        const todayStr = getTodayDateString();
        const pDate = p.dispatchDate ? p.dispatchDate.substring(0, 10) : p.date;
        if (pDate !== todayStr) return false;
      } else if (dateFilter === 'Custom' && customDate) {
        const pDate = p.dispatchDate ? p.dispatchDate.substring(0, 10) : p.date;
        if (pDate !== customDate) return false;
      }

      return true;
    });
  }, [postalDispatches, searchQuery, statusFilter, postalTypeFilter, dispatchModeFilter, departmentFilter, dateFilter, customDate]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPostalTypeFilter('All');
    setDispatchModeFilter('All');
    setDepartmentFilter('All');
    setDateFilter('All');
    setCustomDate('');
    setCurrentPage(1);
  };

  // Pagination Slice
  const totalPages = Math.ceil(filteredDispatches.length / itemsPerPage) || 1;
  const paginatedDispatches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDispatches.slice(start, start + itemsPerPage);
  }, [filteredDispatches, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Export Filtered Records
  const handleExport = (type) => {
    if (filteredDispatches.length === 0) {
      showToast('No dispatch records to export', true);
      return;
    }

    const exportData = filteredDispatches.map(p => ({
      'Dispatch ID': p.dispatchId || '-',
      'Recipient / Organization': p.recipientName || p.toTitle || '-',
      'To Category': p.toCategory || '-',
      'Address': p.address || '-',
      'Phone': p.phone || '-',
      'Postal Type': p.postalType || 'Letter',
      'Subject': p.subject || '-',
      'Reference No': p.referenceNo || '-',
      'From Title': p.fromTitle || '-',
      'Department': p.department || 'Administration',
      'Dispatch Date': formatDate(p.dispatchDate || p.date),
      'Dispatch Mode': p.dispatchMode || 'Courier',
      'Tracking No': p.trackingNo || '-',
      'Status': p.status || 'Dispatched',
      'Delivery Date': formatDate(p.deliveryDate),
      'Return Date': formatDate(p.returnDate)
    }));

    const headers = Object.keys(exportData[0] || {});
    const filename = `Postal_Dispatch_${getTodayDateString()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi PRO - Outgoing Postal Dispatch Register');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV export downloaded successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'PostalDispatch');
      showToast('Excel file downloaded successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Stoofi PRO - Postal Dispatch Register', filename);
      showToast('PDF file downloaded successfully!');
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

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Send className="w-6 h-6 text-zinc-800" />
            Postal Dispatch
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage and track outgoing institutional letters, documents, and parcels</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={() => {
              if (showForm && !editingId) {
                setShowForm(false);
              } else {
                setEditingId(null);
                setFormData(initialFormState);
                setFormErrors({});
                setShowForm(true);
              }
            }}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-sm flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            {showForm && !editingId ? 'Close Form' : 'Add Postal Dispatch'}
          </Button>

          <div className="flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-2 rounded-lg">
            <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-700 transition-colors">Admin Section</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-semibold">Postal Dispatch</span>
          </div>
        </div>
      </div>

      {/* Real-time Summary Cards (4 Compact Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Dispatches */}
        <div 
          onClick={() => { setStatusFilter('All'); setDateFilter('All'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-xs ${statusFilter === 'All' && dateFilter === 'All' ? 'ring-2 ring-zinc-900 border-zinc-900' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Dispatches</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-zinc-950">{stats.total}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">All outgoing dispatches</p>
          </div>
        </div>

        {/* Dispatched Today */}
        <div 
          onClick={() => { setDateFilter('Today'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-xs ${dateFilter === 'Today' ? 'ring-2 ring-zinc-900 border-zinc-900' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Dispatched Today</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-emerald-400">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-zinc-900">{stats.dispatchedToday}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Sent today</p>
          </div>
        </div>

        {/* Delivered */}
        <div 
          onClick={() => { setStatusFilter('Delivered'); setDateFilter('All'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-xs ${statusFilter === 'Delivered' ? 'ring-2 ring-emerald-600 border-emerald-600' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Delivered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-700">{stats.delivered}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Confirmed delivery</p>
          </div>
        </div>

        {/* Returned */}
        <div 
          onClick={() => { setStatusFilter('Returned'); setDateFilter('All'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-xs ${statusFilter === 'Returned' ? 'ring-2 ring-zinc-500 border-zinc-500' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Returned</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-zinc-800">{stats.returned}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Returned to school</p>
          </div>
        </div>

      </div>

      {/* Main Content Layout: Form (if open) + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* ADD / EDIT DISPATCH FORM */}
        {showForm && (
          <div ref={formRef} className="xl:col-span-1">
            <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden sticky top-6">
              
              <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-900" />
                  <h2 className="text-base font-bold text-zinc-950">
                    {editingId ? 'Edit Postal Dispatch' : 'New Postal Dispatch'}
                  </h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData(initialFormState);
                    setFormErrors({});
                  }}
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form className="p-5 space-y-4" onSubmit={handleSave}>
                
                {/* 1. RECIPIENT INFORMATION */}
                <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-lg border border-zinc-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Recipient Information</span>
                  
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Recipient / Organization Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input 
                      value={formData.recipientName}
                      onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                      placeholder="e.g. Board of Intermediate & Secondary Education / Parent Name"
                      className="h-8 text-xs bg-white border-zinc-300"
                      required
                    />
                    {formErrors.recipientName && <p className="text-[11px] text-rose-500">{formErrors.recipientName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">To Category</Label>
                      <select
                        value={formData.toCategory}
                        onChange={e => setFormData({ ...formData, toCategory: e.target.value })}
                        className="flex h-8 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                      >
                        <option value="Parent/Guardian">Parent/Guardian</option>
                        <option value="Principal">Principal</option>
                        <option value="Government Office">Government Office</option>
                        <option value="School">School / College</option>
                        <option value="University">University</option>
                        <option value="Bank">Bank</option>
                        <option value="Company">Company</option>
                        <option value="Organization">Organization</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Phone</Label>
                      <Input 
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 03331234567"
                        className="h-8 text-xs bg-white border-zinc-300"
                      />
                      {formErrors.phone && <p className="text-[11px] text-rose-500">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Destination Address <span className="text-rose-500">*</span>
                    </Label>
                    <Input 
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Full delivery street/city address"
                      className="h-8 text-xs bg-white border-zinc-300"
                      required
                    />
                    {formErrors.address && <p className="text-[11px] text-rose-500">{formErrors.address}</p>}
                  </div>
                </div>

                {/* 2. POSTAL & DOCUMENT INFORMATION */}
                <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-lg border border-zinc-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Postal & Document Details</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-zinc-700">
                        Postal Type <span className="text-rose-500">*</span>
                      </Label>
                      <select
                        value={formData.postalType}
                        onChange={e => setFormData({ ...formData, postalType: e.target.value })}
                        className="flex h-8 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                        required
                      >
                        <option value="Letter">Letter</option>
                        <option value="Application">Application</option>
                        <option value="Parcel">Parcel</option>
                        <option value="Courier">Courier</option>
                        <option value="Notice">Notice</option>
                        <option value="Document">Document</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Reference No</Label>
                      <Input 
                        value={formData.referenceNo}
                        onChange={e => setFormData({ ...formData, referenceNo: e.target.value })}
                        placeholder="e.g. REF-2026/89"
                        className="h-8 text-xs bg-white border-zinc-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Subject / Document Title <span className="text-rose-500">*</span>
                    </Label>
                    <Input 
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Student Transfer Verification / Fee Challan Notice"
                      className="h-8 text-xs bg-white border-zinc-300"
                      required
                    />
                    {formErrors.subject && <p className="text-[11px] text-rose-500">{formErrors.subject}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-zinc-600">Note / Description</Label>
                    <textarea 
                      value={formData.note}
                      onChange={e => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Additional remarks or dispatch contents..."
                      rows={2}
                      className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 resize-y"
                    />
                  </div>
                </div>

                {/* 3. SENDER INFORMATION */}
                <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-lg border border-zinc-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sender Information</span>
                  
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-700">
                      From Title / Office <span className="text-rose-500">*</span>
                    </Label>
                    <Input 
                      value={formData.fromTitle}
                      onChange={e => setFormData({ ...formData, fromTitle: e.target.value })}
                      placeholder="e.g. Principal's Office / Admin Department"
                      className="h-8 text-xs bg-white border-zinc-300"
                      required
                    />
                    {formErrors.fromTitle && <p className="text-[11px] text-rose-500">{formErrors.fromTitle}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Department</Label>
                      <select
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                        className="flex h-8 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                      >
                        {departments.map((d, i) => (
                          <option key={i} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Dispatched By</Label>
                      <select
                        value={formData.dispatchedBy}
                        onChange={e => setFormData({ ...formData, dispatchedBy: e.target.value })}
                        className="flex h-8 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                      >
                        {staffList.map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. DISPATCH DETAILS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Dispatch Date <span className="text-rose-500">*</span>
                    </Label>
                    <Input 
                      type="date"
                      value={formData.dispatchDate}
                      onChange={e => setFormData({ ...formData, dispatchDate: e.target.value })}
                      className="bg-white border-zinc-300 text-zinc-950 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Dispatch Mode <span className="text-rose-500">*</span>
                    </Label>
                    <select
                      value={formData.dispatchMode}
                      onChange={e => setFormData({ ...formData, dispatchMode: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                      required
                    >
                      <option value="Courier">Courier</option>
                      <option value="Registered Post">Registered Post</option>
                      <option value="Ordinary Post">Ordinary Post</option>
                      <option value="Hand Delivery">Hand Delivery</option>
                      <option value="Office Delivery">Office Delivery</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">Tracking / Consignment No</Label>
                    <Input 
                      value={formData.trackingNo}
                      onChange={e => setFormData({ ...formData, trackingNo: e.target.value })}
                      placeholder="e.g. TCS-998231"
                      className="bg-white border-zinc-300 text-zinc-950 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">Initial Status</Label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                    >
                      <option value="Dispatched">Dispatched</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* 5. ATTACHMENT */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                    <span>Supporting Document / Receipt</span>
                    <span className="text-[10px] text-zinc-400">Optional (Image/PDF)</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <input 
                      ref={fileInputRef}
                      type="file"
                      onChange={e => setFormData({ ...formData, file: e.target.files[0] || null })}
                      className="text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-800 hover:file:bg-zinc-200 cursor-pointer"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    />
                    {formData.file && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setFormData({ ...formData, file: null });
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="h-6 px-2 text-xs text-rose-500 hover:text-rose-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs py-2.5 shadow-xs"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving to Database...
                      </span>
                    ) : (
                      editingId ? 'UPDATE POSTAL DISPATCH' : 'RECORD POSTAL DISPATCH'
                    )}
                  </Button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* POSTAL DISPATCH TABLE & TOOLBAR */}
        <div className={showForm ? 'xl:col-span-2' : 'xl:col-span-3'}>
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
            
            {/* Top Toolbar */}
            <div className="p-4 border-b border-zinc-200 space-y-3 bg-zinc-50/40">
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-950">Outgoing Dispatch Register</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {filteredDispatches.length} records
                  </span>
                </div>

                {/* Export Bar */}
                <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button 
                    onClick={() => handleExport('Copy')} 
                    className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1" 
                    title="Copy"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                  <button 
                    onClick={() => handleExport('Excel')} 
                    className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1" 
                    title="Excel"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Excel</span>
                  </button>
                  <button 
                    onClick={() => handleExport('CSV')} 
                    className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1" 
                    title="CSV"
                  >
                    <FileCheck className="h-3.5 w-3.5 text-zinc-800" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                  <button 
                    onClick={() => handleExport('PDF')} 
                    className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1" 
                    title="PDF"
                  >
                    <Download className="h-3.5 w-3.5 text-rose-600" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                  <button 
                    onClick={() => handleExport('Print')} 
                    className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors text-xs font-medium flex items-center gap-1" 
                    title="Print"
                  >
                    <Printer className="h-3.5 w-3.5 text-zinc-700" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </div>
              </div>

              {/* Multi-Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                
                {/* Search */}
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    value={searchQuery} 
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by ID, recipient, subject, tracking..." 
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
                <div>
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="h-8 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>

                {/* Postal Type Filter */}
                <div>
                  <select
                    value={postalTypeFilter}
                    onChange={e => { setPostalTypeFilter(e.target.value); setCurrentPage(1); }}
                    className="h-8 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  >
                    <option value="All">All Postal Types</option>
                    <option value="Letter">Letter</option>
                    <option value="Application">Application</option>
                    <option value="Parcel">Parcel</option>
                    <option value="Courier">Courier</option>
                    <option value="Notice">Notice</option>
                    <option value="Document">Document</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                </div>

                {/* Dispatch Mode Filter */}
                <div>
                  <select
                    value={dispatchModeFilter}
                    onChange={e => { setDispatchModeFilter(e.target.value); setCurrentPage(1); }}
                    className="h-8 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  >
                    <option value="All">All Modes</option>
                    <option value="Courier">Courier</option>
                    <option value="Registered Post">Registered Post</option>
                    <option value="Ordinary Post">Ordinary Post</option>
                    <option value="Hand Delivery">Hand Delivery</option>
                    <option value="Office Delivery">Office Delivery</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-1">
                  <select
                    value={dateFilter}
                    onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
                    className="h-8 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  >
                    <option value="All">All Dates</option>
                    <option value="Today">Today</option>
                    <option value="Custom">Pick Date</option>
                  </select>

                  {(searchQuery || statusFilter !== 'All' || postalTypeFilter !== 'All' || dispatchModeFilter !== 'All' || dateFilter !== 'All') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleResetFilters}
                      className="h-8 px-2 text-zinc-400 hover:text-zinc-800"
                      title="Reset all filters"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

              </div>

              {/* Custom Date Input if selected */}
              {dateFilter === 'Custom' && (
                <div className="flex items-center gap-2 pt-1 max-w-xs">
                  <Label className="text-xs text-zinc-600 font-medium">Select Date:</Label>
                  <Input 
                    type="date"
                    value={customDate}
                    onChange={e => { setCustomDate(e.target.value); setCurrentPage(1); }}
                    className="h-8 text-xs bg-white border-zinc-300"
                  />
                </div>
              )}

            </div>

            {/* Error State */}
            {error && (
              <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{error}</span>
                </div>
                <Button size="sm" variant="outline" onClick={fetchData} className="h-7 text-xs bg-white border-rose-200 text-rose-700 hover:bg-rose-100">
                  Retry
                </Button>
              </div>
            )}

            {/* Table Content */}
            <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-800" />
                  <p className="text-xs text-zinc-500 font-medium">Loading postal dispatch records...</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold bg-zinc-50/70 border-b border-zinc-200">
                    <tr>
                      <th className="px-3.5 py-3 font-semibold">Dispatch ID</th>
                      <th className="px-3.5 py-3 font-semibold">Recipient / Address</th>
                      <th className="px-3.5 py-3 font-semibold">Type</th>
                      <th className="px-3.5 py-3 font-semibold">Subject & Reference</th>
                      <th className="px-3.5 py-3 font-semibold">Sender Office</th>
                      <th className="px-3.5 py-3 font-semibold">Date & Mode</th>
                      <th className="px-3.5 py-3 font-semibold">Tracking No</th>
                      <th className="px-3.5 py-3 font-semibold">Status</th>
                      <th className="px-3.5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/70">
                    {paginatedDispatches.length > 0 ? (
                      paginatedDispatches.map((p) => {
                        const recipient = p.recipientName || p.toTitle || '-';

                        return (
                          <tr key={p._id} className="hover:bg-zinc-50/80 transition-colors">
                            
                            {/* Dispatch ID */}
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-[11px] border border-zinc-200">
                                {p.dispatchId || 'PD-2026-0000'}
                              </span>
                            </td>

                            {/* Recipient & Address */}
                            <td className="px-3.5 py-3 max-w-[220px]">
                              <div className="font-semibold text-zinc-950 truncate" title={recipient}>
                                {recipient}
                              </div>
                              <div className="text-[11px] text-zinc-500 truncate" title={p.address}>
                                {p.address || '-'}
                              </div>
                              {p.toCategory && p.toCategory !== 'Other' && (
                                <span className="inline-block text-[10px] text-zinc-400 font-medium">
                                  ({p.toCategory})
                                </span>
                              )}
                            </td>

                            {/* Postal Type */}
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                                {p.postalType || 'Letter'}
                              </span>
                            </td>

                            {/* Subject & Reference */}
                            <td className="px-3.5 py-3 max-w-[200px]">
                              <div className="font-medium text-zinc-900 truncate" title={p.subject}>
                                {p.subject || '-'}
                              </div>
                              {p.referenceNo && (
                                <div className="text-[10px] text-zinc-400 font-mono">
                                  Ref: {p.referenceNo}
                                </div>
                              )}
                            </td>

                            {/* Sender Office */}
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <div className="font-medium text-zinc-800">{p.fromTitle}</div>
                              <div className="text-[10px] text-zinc-400">{p.department || 'Administration'}</div>
                            </td>

                            {/* Date & Mode */}
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <div className="text-zinc-700 font-medium">{formatDate(p.dispatchDate || p.date)}</div>
                              <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                                <Truck className="w-2.5 h-2.5" />
                                {p.dispatchMode || 'Courier'}
                              </div>
                            </td>

                            {/* Tracking No */}
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              {p.trackingNo ? (
                                <span className="font-mono text-[11px] text-zinc-800 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200">
                                  {p.trackingNo}
                                </span>
                              ) : (
                                <span className="text-zinc-400 italic text-[11px]">-</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <StatusBadge status={p.status} />
                            </td>

                            {/* Actions */}
                            <td className="px-3.5 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                
                                {/* View */}
                                <Button 
                                  onClick={() => setViewDispatch(p)} 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                                  title="View Full Details"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>

                                {/* Mark as Delivered (if not already delivered) */}
                                {p.status !== 'Delivered' && (
                                  <Button 
                                    onClick={() => {
                                      setDeliverModalDispatch(p);
                                      setDeliveryData({
                                        deliveryDate: getTodayDateString(),
                                        deliveredBy: p.dispatchedBy || '',
                                        deliveryRemarks: ''
                                      });
                                    }} 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                    title="Mark as Delivered"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}

                                {/* Mark as Returned */}
                                {p.status !== 'Returned' && (
                                  <Button 
                                    onClick={() => {
                                      setReturnModalDispatch(p);
                                      setReturnData({
                                        returnDate: getTodayDateString(),
                                        returnReason: 'Address Not Found',
                                        returnRemarks: ''
                                      });
                                    }} 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                                    title="Mark as Returned"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  </Button>
                                )}

                                {/* Edit */}
                                <Button 
                                  onClick={() => handleEdit(p)} 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                                  title="Edit Dispatch"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>

                                {/* Delete */}
                                <Button 
                                  onClick={() => setDeleteConfirmId(p._id)} 
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
                        <td colSpan="9" className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                              <Archive className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-900">No postal dispatch records found</p>
                            <p className="text-xs text-zinc-500">
                              {searchQuery || statusFilter !== 'All' 
                                ? 'No dispatch records match the selected search or filter criteria.' 
                                : 'There are no outgoing dispatches recorded in the system yet.'}
                            </p>
                            {(searchQuery || statusFilter !== 'All') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleResetFilters} 
                                className="mt-2 text-xs border-zinc-200"
                              >
                                Clear All Filters
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="p-3.5 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 bg-zinc-50/40">
              <div>
                Showing {filteredDispatches.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredDispatches.length)} of {filteredDispatches.length} entries
              </div>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="h-7 px-2.5 text-xs text-zinc-700 border-zinc-200 bg-white hover:bg-zinc-50"
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1 text-zinc-400">...</span>}
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-7 w-7 p-0 text-xs font-medium ${
                          currentPage === page 
                            ? 'bg-zinc-950 text-white hover:bg-zinc-800' 
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || loading || totalPages === 0}
                  className="h-7 px-2.5 text-xs text-zinc-700 border-zinc-200 bg-white hover:bg-zinc-50"
                >
                  Next
                </Button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: VIEW DETAILS & AUDIT TRAIL                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewDispatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-sm bg-zinc-900 text-white px-2.5 py-0.5 rounded">
                  {viewDispatch.dispatchId || 'PD'}
                </span>
                <StatusBadge status={viewDispatch.status} />
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium border border-zinc-200">
                  {viewDispatch.dispatchMode || 'Courier'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewDispatch(null)} 
                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-800">
              
              {/* Subject & Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-zinc-700" />
                  {viewDispatch.subject}
                </h3>
                {viewDispatch.note && (
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-700 whitespace-pre-wrap leading-relaxed">
                    {viewDispatch.note}
                  </div>
                )}
              </div>

              {/* Two Column Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-zinc-50/70 border border-zinc-200">
                
                {/* Recipient Details */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Recipient Information</span>
                  <div className="font-semibold text-zinc-950 text-sm">
                    {viewDispatch.recipientName || viewDispatch.toTitle}
                  </div>
                  <div className="text-zinc-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>{viewDispatch.address}</span>
                  </div>
                  {viewDispatch.phone && (
                    <div className="text-zinc-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      <span>{viewDispatch.phone}</span>
                    </div>
                  )}
                  {viewDispatch.email && (
                    <div className="text-zinc-600 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-zinc-400" />
                      <span>{viewDispatch.email}</span>
                    </div>
                  )}
                  {viewDispatch.toCategory && (
                    <div className="text-[11px] text-zinc-500">
                      Category: <span className="font-medium text-zinc-800">{viewDispatch.toCategory}</span>
                    </div>
                  )}
                </div>

                {/* Sender & Dispatch Meta */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sender & Dispatch Details</span>
                  <div className="text-zinc-600 flex items-center gap-1">
                    <Building className="w-3 h-3 text-zinc-400" />
                    From: <span className="font-medium text-zinc-900">{viewDispatch.fromTitle}</span>
                  </div>
                  <div className="text-zinc-600">
                    Department: <span className="font-medium text-zinc-800">{viewDispatch.department || 'Administration'}</span>
                  </div>
                  <div className="text-zinc-600 flex items-center gap-1">
                    <User className="w-3 h-3 text-zinc-400" />
                    Dispatched By: <span className="font-medium text-zinc-800">{viewDispatch.dispatchedBy || 'Admin'}</span>
                  </div>
                  <div className="text-zinc-600">
                    Dispatch Date: <span className="font-medium text-zinc-900">{formatDate(viewDispatch.dispatchDate || viewDispatch.date)} {viewDispatch.dispatchTime ? `at ${viewDispatch.dispatchTime}` : ''}</span>
                  </div>
                  {viewDispatch.referenceNo && (
                    <div className="text-zinc-600 font-mono">
                      Ref No: <span className="font-bold text-zinc-900">{viewDispatch.referenceNo}</span>
                    </div>
                  )}
                  {viewDispatch.trackingNo && (
                    <div className="text-zinc-600 font-mono">
                      Tracking No: <span className="font-bold text-zinc-900">{viewDispatch.trackingNo}</span>
                    </div>
                  )}
                  {viewDispatch.attachmentUrl && (
                    <div className="pt-1">
                      <a 
                        href={viewDispatch.attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-medium text-[11px] transition-colors"
                      >
                        <Paperclip className="w-3 h-3" />
                        View Attached Document
                      </a>
                    </div>
                  )}
                </div>

              </div>

              {/* Delivery Info (if Delivered) */}
              {viewDispatch.status === 'Delivered' && (
                <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Delivery Information
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      Delivered on: {formatDateTime(viewDispatch.deliveryDate)}
                    </span>
                  </div>
                  {viewDispatch.deliveryRemarks && (
                    <div className="text-zinc-800 font-medium">
                      Remarks: {viewDispatch.deliveryRemarks}
                    </div>
                  )}
                  {viewDispatch.deliveredBy && (
                    <div className="text-[11px] text-emerald-800">
                      Confirmed By: {viewDispatch.deliveredBy}
                    </div>
                  )}
                </div>
              )}

              {/* Return Info (if Returned) */}
              {viewDispatch.status === 'Returned' && (
                <div className="p-4 rounded-lg bg-zinc-100/80 border border-zinc-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-zinc-600" />
                      Return Information
                    </span>
                    <span className="text-[10px] text-zinc-600">
                      Returned on: {formatDateTime(viewDispatch.returnDate)}
                    </span>
                  </div>
                  {viewDispatch.returnReason && (
                    <div className="text-zinc-900 font-semibold">
                      Reason: {viewDispatch.returnReason}
                    </div>
                  )}
                  {viewDispatch.returnRemarks && (
                    <div className="text-zinc-700 text-[11px]">
                      Remarks: {viewDispatch.returnRemarks}
                    </div>
                  )}
                </div>
              )}

              {/* Audit Trail / History */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Audit Trail & History
                </span>
                <div className="border border-zinc-200 rounded-lg p-3 divide-y divide-zinc-100 bg-zinc-50/30">
                  {viewDispatch.history && viewDispatch.history.length > 0 ? (
                    viewDispatch.history.map((h, i) => (
                      <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                            {h.action}
                          </div>
                          {h.notes && <div className="text-[11px] text-zinc-600 pl-3">{h.notes}</div>}
                        </div>
                        <div className="text-right text-[10px] text-zinc-400 shrink-0">
                          <div>{h.user || 'Admin'}</div>
                          <div>{formatDateTime(h.date)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-400 italic py-1 text-center">Initial dispatch record created.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const disp = viewDispatch;
                  setViewDispatch(null);
                  handleEdit(disp);
                }}
                className="text-xs"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit Record
              </Button>

              <div className="flex items-center gap-2">
                {viewDispatch.status !== 'Delivered' && (
                  <Button 
                    size="sm"
                    onClick={() => {
                      const disp = viewDispatch;
                      setViewDispatch(null);
                      setDeliverModalDispatch(disp);
                      setDeliveryData({
                        deliveryDate: getTodayDateString(),
                        deliveredBy: disp.dispatchedBy || '',
                        deliveryRemarks: ''
                      });
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold"
                  >
                    Mark as Delivered
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setViewDispatch(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: MARK AS DELIVERED                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {deliverModalDispatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-md w-full overflow-hidden">
            
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                <h3 className="font-bold text-sm text-zinc-950">
                  Confirm Delivery - {deliverModalDispatch.dispatchId || 'PD'}
                </h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDeliverModalDispatch(null)} 
                className="h-7 w-7 p-0 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleDeliverySubmit} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="font-semibold text-zinc-900">{deliverModalDispatch.recipientName || deliverModalDispatch.toTitle}</div>
                <div className="text-[11px] text-zinc-500">{deliverModalDispatch.subject}</div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Delivery Date *</Label>
                <Input 
                  type="date"
                  value={deliveryData.deliveryDate}
                  onChange={e => setDeliveryData({ ...deliveryData, deliveryDate: e.target.value })}
                  className="h-8 text-xs bg-white border-zinc-300"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Confirmed / Delivered By</Label>
                <Input 
                  value={deliveryData.deliveredBy}
                  onChange={e => setDeliveryData({ ...deliveryData, deliveredBy: e.target.value })}
                  placeholder="e.g. Courier Receipt / Reception Confirmation"
                  className="h-8 text-xs bg-white border-zinc-300"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Delivery Remarks</Label>
                <textarea 
                  value={deliveryData.deliveryRemarks}
                  onChange={e => setDeliveryData({ ...deliveryData, deliveryRemarks: e.target.value })}
                  placeholder="e.g. Received and signed by Mr. Aslam at reception."
                  rows={2}
                  className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 resize-y"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDeliverModalDispatch(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={delivering}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs"
                >
                  {delivering ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    'Confirm Delivered'
                  )}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: MARK AS RETURNED                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {returnModalDispatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-md w-full overflow-hidden">
            
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-600" />
                <h3 className="font-bold text-sm text-zinc-950">
                  Mark as Returned - {returnModalDispatch.dispatchId || 'PD'}
                </h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setReturnModalDispatch(null)} 
                className="h-7 w-7 p-0 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="font-semibold text-zinc-900">{returnModalDispatch.recipientName || returnModalDispatch.toTitle}</div>
                <div className="text-[11px] text-zinc-500">{returnModalDispatch.subject}</div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Return Date *</Label>
                <Input 
                  type="date"
                  value={returnData.returnDate}
                  onChange={e => setReturnData({ ...returnData, returnDate: e.target.value })}
                  className="h-8 text-xs bg-white border-zinc-300"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Return Reason *</Label>
                <select
                  value={returnData.returnReason}
                  onChange={e => setReturnData({ ...returnData, returnReason: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  required
                >
                  <option value="Address Not Found">Address Not Found / Incomplete Address</option>
                  <option value="Recipient Refused">Recipient Refused Acceptance</option>
                  <option value="Recipient Moved / Shifted">Recipient Moved / Shifted</option>
                  <option value="Unclaimed / Consignment Expired">Unclaimed / Consignment Expired</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Return Remarks</Label>
                <textarea 
                  value={returnData.returnRemarks}
                  onChange={e => setReturnData({ ...returnData, returnRemarks: e.target.value })}
                  placeholder="Additional explanation regarding the returned parcel/letter..."
                  rows={2}
                  className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 resize-y"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setReturnModalDispatch(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={returning}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs"
                >
                  {returning ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    'Record Return'
                  )}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 4: DELETE CONFIRMATION                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {deleteConfirmId && (
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
              Are you sure you want to permanently delete this postal dispatch record from the database?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteConfirmId(null)}
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
