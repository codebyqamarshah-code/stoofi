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
  Inbox,
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
  Share2,
  Archive,
  UserCheck
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
  const s = status || 'Received';
  switch (s) {
    case 'Received':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
          <Inbox className="w-3 h-3 text-zinc-500" />
          Received
        </span>
      );
    case 'Forwarded':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-white border border-zinc-900">
          <Share2 className="w-3 h-3 text-emerald-400" />
          Forwarded
        </span>
      );
    case 'In Process':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-900 border border-zinc-300">
          <Clock className="w-3 h-3 text-zinc-700" />
          In Process
        </span>
      );
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Completed
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

export default function PostalReceivePage() {
  // Main Data States
  const [postalReceives, setPostalReceives] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals & Panels
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewReceive, setViewReceive] = useState(null);
  const [forwardModalReceive, setForwardModalReceive] = useState(null);
  const [statusModalReceive, setStatusModalReceive] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const initialFormState = {
    fromTitle: '',
    senderName: '',
    senderType: 'Individual',
    address: '',
    phone: '',
    email: '',
    postalType: 'Letter',
    subject: '',
    referenceNo: '',
    note: '',
    receiveDate: getTodayDateString(),
    receiveTime: getCurrentTimeFormatted(),
    receivedBy: 'Admin',
    toTitle: 'Principal',
    department: 'Administration',
    recipientStaffName: '',
    forwardedTo: '',
    forwardDate: '',
    forwardRemarks: '',
    status: 'Received',
    file: null
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Forward Modal Form State
  const [forwardData, setForwardData] = useState({
    forwardedTo: '',
    forwardDate: getTodayDateString(),
    forwardRemarks: ''
  });
  const [forwarding, setForwarding] = useState(false);

  // Status Modal Form State
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: 'Completed',
    completedDate: getTodayDateString(),
    completedBy: '',
    completionRemarks: ''
  });
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [postalTypeFilter, setPostalTypeFilter] = useState('All');
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

      const [receiveRes, deptRes, staffRes, teacherRes] = await Promise.all([
        api.get('/postal-receive'),
        api.get('/department').catch(() => ({ data: [] })),
        api.get('/staff').catch(() => ({ data: [] })),
        api.get('/teachers').catch(() => ({ data: [] }))
      ]);

      if (receiveRes?.success) {
        setPostalReceives(receiveRes.data || []);
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
      const combinedStaff = ['Principal', 'Vice Principal', 'Administration Office', 'Examination Branch', 'Accounts Department', 'Front Desk / Reception', 'Class Teacher'];
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
      console.error('Error fetching postal receive records:', err);
      setError('Failed to load postal receive records. Please check your network connection.');
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

    if (!formData.fromTitle.trim()) {
      errors.fromTitle = 'Sender title / organization name is required.';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject / Document title is required.';
    }

    if (!formData.toTitle.trim()) {
      errors.toTitle = 'To / Destination title is required.';
    }

    if (!formData.receiveDate) {
      errors.receiveDate = 'Receive date is required.';
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
      payload.append('fromTitle', formData.fromTitle.trim());
      payload.append('senderName', formData.fromTitle.trim());
      payload.append('senderType', formData.senderType);
      payload.append('address', formData.address ? formData.address.trim() : '');
      payload.append('phone', formData.phone ? formData.phone.trim() : '');
      payload.append('email', formData.email ? formData.email.trim() : '');
      payload.append('postalType', formData.postalType);
      payload.append('subject', formData.subject.trim());
      payload.append('referenceNo', formData.referenceNo ? formData.referenceNo.trim() : '');
      payload.append('note', formData.note ? formData.note.trim() : '');
      payload.append('receiveDate', formData.receiveDate);
      payload.append('receiveTime', formData.receiveTime ? formData.receiveTime.trim() : '');
      payload.append('receivedBy', formData.receivedBy || 'Admin');
      payload.append('toTitle', formData.toTitle.trim());
      payload.append('department', formData.department || 'Administration');
      payload.append('recipientStaffName', formData.recipientStaffName ? formData.recipientStaffName.trim() : '');
      payload.append('forwardedTo', formData.forwardedTo ? formData.forwardedTo.trim() : '');
      payload.append('forwardDate', formData.forwardDate || '');
      payload.append('forwardRemarks', formData.forwardRemarks ? formData.forwardRemarks.trim() : '');
      payload.append('status', formData.forwardedTo ? 'Forwarded' : (formData.status || 'Received'));

      if (formData.file) {
        payload.append('file', formData.file);
      }

      let res;
      if (editingId) {
        res = await api.put(`/postal-receive/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res?.success) {
          setPostalReceives(prev => prev.map(p => p._id === editingId ? res.data : p));
          showToast(`Receive record ${res.data.receiveId || ''} updated successfully!`);
        }
      } else {
        res = await api.post('/postal-receive', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res?.success) {
          setPostalReceives(prev => [res.data, ...prev]);
          showToast(`Postal receive record saved (${res.data.receiveId || 'PR'}).`);
        }
      }

      // Reset form
      setFormData(initialFormState);
      setFormErrors({});
      setShowForm(false);
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error saving postal receive:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save postal receive record.', true);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Action
  const handleEdit = (receive) => {
    setEditingId(receive._id);
    setFormData({
      fromTitle: receive.fromTitle || receive.senderName || '',
      senderName: receive.senderName || receive.fromTitle || '',
      senderType: receive.senderType || 'Individual',
      address: receive.address || '',
      phone: receive.phone || '',
      email: receive.email || '',
      postalType: receive.postalType || 'Letter',
      subject: receive.subject || '',
      referenceNo: receive.referenceNo || '',
      note: receive.note || '',
      receiveDate: receive.receiveDate ? receive.receiveDate.substring(0, 10) : getTodayDateString(),
      receiveTime: receive.receiveTime || getCurrentTimeFormatted(),
      receivedBy: receive.receivedBy || 'Admin',
      toTitle: receive.toTitle || 'Principal',
      department: receive.department || 'Administration',
      recipientStaffName: receive.recipientStaffName || '',
      forwardedTo: receive.forwardedTo || '',
      forwardDate: receive.forwardDate ? receive.forwardDate.substring(0, 10) : '',
      forwardRemarks: receive.forwardRemarks || '',
      status: receive.status || 'Received',
      file: null
    });
    setFormErrors({});
    setShowForm(true);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Forward Action Submit
  const handleForwardSubmit = async (e) => {
    e.preventDefault();
    if (!forwardModalReceive) return;

    if (!forwardData.forwardedTo.trim()) {
      showToast('Please select a staff member / department to forward to.', true);
      return;
    }

    try {
      setForwarding(true);
      const res = await api.patch(`/postal-receive/${forwardModalReceive._id}/forward`, {
        forwardedTo: forwardData.forwardedTo.trim(),
        forwardDate: forwardData.forwardDate,
        forwardRemarks: forwardData.forwardRemarks.trim()
      });

      if (res?.success) {
        setPostalReceives(prev => prev.map(p => p._id === forwardModalReceive._id ? res.data : p));
        if (viewReceive && viewReceive._id === forwardModalReceive._id) {
          setViewReceive(res.data);
        }
        showToast(`Item forwarded to ${forwardData.forwardedTo.trim()}!`);
        setForwardModalReceive(null);
      }
    } catch (err) {
      console.error('Failed to forward item:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to forward item', true);
    } finally {
      setForwarding(false);
    }
  };

  // Status Change Submit
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalReceive) return;

    try {
      setStatusUpdating(true);
      const res = await api.patch(`/postal-receive/${statusModalReceive._id}/status`, {
        status: statusUpdateData.status,
        completedDate: statusUpdateData.completedDate,
        completedBy: statusUpdateData.completedBy.trim(),
        completionRemarks: statusUpdateData.completionRemarks.trim()
      });

      if (res?.success) {
        setPostalReceives(prev => prev.map(p => p._id === statusModalReceive._id ? res.data : p));
        if (viewReceive && viewReceive._id === statusModalReceive._id) {
          setViewReceive(res.data);
        }
        showToast(`Status updated to ${statusUpdateData.status}!`);
        setStatusModalReceive(null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to update status', true);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Delete Action
  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const res = await api.delete(`/postal-receive/${deleteConfirmId}`);
      if (res?.success) {
        setPostalReceives(prev => prev.filter(p => p._id !== deleteConfirmId));
        if (viewReceive && viewReceive._id === deleteConfirmId) {
          setViewReceive(null);
        }
        showToast('Postal receive record deleted successfully.');
      }
    } catch (err) {
      console.error('Error deleting postal receive:', err);
      showToast(err?.response?.data?.message || 'Failed to delete record.', true);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Real-time Summary Cards
  const stats = useMemo(() => {
    const todayStr = getTodayDateString();
    const total = postalReceives.length;
    const receivedToday = postalReceives.filter(p => {
      const pDate = p.receiveDate ? p.receiveDate.substring(0, 10) : p.date;
      return pDate === todayStr;
    }).length;
    const inProcess = postalReceives.filter(p => p.status === 'In Process' || p.status === 'Forwarded').length;
    const completed = postalReceives.filter(p => p.status === 'Completed').length;

    return { total, receivedToday, inProcess, completed };
  }, [postalReceives]);

  // Multi-Filter & Search Pipeline
  const filteredReceives = useMemo(() => {
    return postalReceives.filter(p => {
      // 1. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const idMatch = (p.receiveId || '').toLowerCase().includes(query);
        const fromMatch = (p.fromTitle || p.senderName || '').toLowerCase().includes(query);
        const refMatch = (p.referenceNo || '').toLowerCase().includes(query);
        const addressMatch = (p.address || '').toLowerCase().includes(query);
        const subjectMatch = (p.subject || '').toLowerCase().includes(query);
        const toMatch = (p.toTitle || '').toLowerCase().includes(query);
        const deptMatch = (p.department || '').toLowerCase().includes(query);
        const fwdMatch = (p.forwardedTo || '').toLowerCase().includes(query);

        if (!idMatch && !fromMatch && !refMatch && !addressMatch && !subjectMatch && !toMatch && !deptMatch && !fwdMatch) {
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

      // 4. Department Filter
      if (departmentFilter !== 'All' && (p.department || 'Administration') !== departmentFilter && p.toTitle !== departmentFilter) {
        return false;
      }

      // 5. Date Filter
      if (dateFilter === 'Today') {
        const todayStr = getTodayDateString();
        const pDate = p.receiveDate ? p.receiveDate.substring(0, 10) : p.date;
        if (pDate !== todayStr) return false;
      } else if (dateFilter === 'Custom' && customDate) {
        const pDate = p.receiveDate ? p.receiveDate.substring(0, 10) : p.date;
        if (pDate !== customDate) return false;
      }

      return true;
    });
  }, [postalReceives, searchQuery, statusFilter, postalTypeFilter, departmentFilter, dateFilter, customDate]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPostalTypeFilter('All');
    setDepartmentFilter('All');
    setDateFilter('All');
    setCustomDate('');
    setCurrentPage(1);
  };

  // Pagination Slice
  const totalPages = Math.ceil(filteredReceives.length / itemsPerPage) || 1;
  const paginatedReceives = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReceives.slice(start, start + itemsPerPage);
  }, [filteredReceives, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Export Filtered Records
  const handleExport = (type) => {
    if (filteredReceives.length === 0) {
      showToast('No postal receive records to export', true);
      return;
    }

    const exportData = filteredReceives.map(p => ({
      'Receive ID': p.receiveId || '-',
      'Sender / From': p.fromTitle || p.senderName || '-',
      'Sender Type': p.senderType || '-',
      'Sender Address': p.address || '-',
      'Phone': p.phone || '-',
      'Postal Type': p.postalType || 'Letter',
      'Subject': p.subject || '-',
      'Reference No': p.referenceNo || '-',
      'To / Destination': p.toTitle || '-',
      'Department': p.department || 'Administration',
      'Receive Date': formatDate(p.receiveDate || p.date),
      'Forwarded To': p.forwardedTo || '-',
      'Status': p.status || 'Received',
      'Completed Date': formatDate(p.completedDate)
    }));

    const headers = Object.keys(exportData[0] || {});
    const filename = `Postal_Receive_${getTodayDateString()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi PRO - Incoming Postal Receive Register');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV export downloaded successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'PostalReceive');
      showToast('Excel file downloaded successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Stoofi PRO - Postal Receive Register', filename);
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
            <Inbox className="w-6 h-6 text-zinc-800" />
            Postal Receive
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Record, assign, and manage incoming institutional letters, parcels, and notices</p>
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
            {showForm && !editingId ? 'Close Form' : 'Add Postal Receive'}
          </Button>

          <div className="flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-2 rounded-lg">
            <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-700 transition-colors">Admin Section</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-semibold">Postal Receive</span>
          </div>
        </div>
      </div>

      {/* Real-time Summary Cards (4 Compact Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Received */}
        <div 
          onClick={() => { setStatusFilter('All'); setDateFilter('All'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-xs ${statusFilter === 'All' && dateFilter === 'All' ? 'ring-2 ring-zinc-900 border-zinc-900' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Received</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-zinc-950">{stats.total}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">All incoming items</p>
          </div>
        </div>

        {/* Received Today */}
        <div 
          onClick={() => { setDateFilter('Today'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-xs ${dateFilter === 'Today' ? 'ring-2 ring-zinc-900 border-zinc-900' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Received Today</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-emerald-400">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-zinc-900">{stats.receivedToday}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Logged today</p>
          </div>
        </div>

        {/* In Process / Forwarded */}
        <div 
          onClick={() => { setStatusFilter('In Process'); setDateFilter('All'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-xs ${statusFilter === 'In Process' ? 'ring-2 ring-zinc-800 border-zinc-800' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">In Process</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-zinc-900">{stats.inProcess}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Active / Forwarded</p>
          </div>
        </div>

        {/* Completed */}
        <div 
          onClick={() => { setStatusFilter('Completed'); setDateFilter('All'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-xs ${statusFilter === 'Completed' ? 'ring-2 ring-emerald-600 border-emerald-600' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-700">{stats.completed}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Resolved & archived</p>
          </div>
        </div>

      </div>

      {/* Main Content Layout: Form (if open) + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* ADD / EDIT POSTAL RECEIVE FORM */}
        {showForm && (
          <div ref={formRef} className="xl:col-span-1">
            <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden sticky top-6">
              
              <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-900" />
                  <h2 className="text-base font-bold text-zinc-950">
                    {editingId ? 'Edit Postal Receive' : 'Log Incoming Postal Item'}
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
                
                {/* 1. SENDER INFORMATION */}
                <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-lg border border-zinc-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sender Information</span>
                  
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-700">
                      From Title / Sender Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input 
                      value={formData.fromTitle}
                      onChange={e => setFormData({ ...formData, fromTitle: e.target.value })}
                      placeholder="e.g. Board of Secondary Education / Mr. Tariq (Parent)"
                      className="h-8 text-xs bg-white border-zinc-300"
                      required
                    />
                    {formErrors.fromTitle && <p className="text-[11px] text-rose-500">{formErrors.fromTitle}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Sender Type</Label>
                      <select
                        value={formData.senderType}
                        onChange={e => setFormData({ ...formData, senderType: e.target.value })}
                        className="flex h-8 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                      >
                        <option value="Individual">Individual / Parent</option>
                        <option value="Government Office">Government Office / Board</option>
                        <option value="School/Institution">School / Institution</option>
                        <option value="Company">Company / Vendor</option>
                        <option value="Organization">Organization / NGO</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Sender Phone</Label>
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
                    <Label className="text-xs font-medium text-zinc-600">Sender Address</Label>
                    <Input 
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Origin address / city"
                      className="h-8 text-xs bg-white border-zinc-300"
                    />
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
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Reference No</Label>
                      <Input 
                        value={formData.referenceNo}
                        onChange={e => setFormData({ ...formData, referenceNo: e.target.value })}
                        placeholder="e.g. IN-2026/41"
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
                      placeholder="e.g. Admission Application / Govt Inquiry Notice"
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
                      placeholder="Brief note or summary of received document..."
                      rows={2}
                      className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 resize-y"
                    />
                  </div>
                </div>

                {/* 3. RECEIVING & DESTINATION INFO */}
                <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-lg border border-zinc-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Destination & Receiving Meta</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-zinc-700">
                        To / Destination Title <span className="text-rose-500">*</span>
                      </Label>
                      <Input 
                        value={formData.toTitle}
                        onChange={e => setFormData({ ...formData, toTitle: e.target.value })}
                        placeholder="e.g. Principal / Examination Officer"
                        className="h-8 text-xs bg-white border-zinc-300"
                        required
                      />
                      {formErrors.toTitle && <p className="text-[11px] text-rose-500">{formErrors.toTitle}</p>}
                    </div>

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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-zinc-700">
                        Receive Date <span className="text-rose-500">*</span>
                      </Label>
                      <Input 
                        type="date"
                        value={formData.receiveDate}
                        onChange={e => setFormData({ ...formData, receiveDate: e.target.value })}
                        className="h-8 text-xs bg-white border-zinc-300"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Receive Time</Label>
                      <Input 
                        value={formData.receiveTime}
                        onChange={e => setFormData({ ...formData, receiveTime: e.target.value })}
                        placeholder="e.g. 10:30 AM"
                        className="h-8 text-xs bg-white border-zinc-300"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. FORWARD / ASSIGN (OPTIONAL) */}
                <div className="space-y-2 bg-zinc-50/60 p-3.5 rounded-lg border border-zinc-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Forward / Assign (Optional)</span>
                  
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-zinc-600">Forward To Staff / Officer</Label>
                    <select
                      value={formData.forwardedTo}
                      onChange={e => setFormData({ ...formData, forwardedTo: e.target.value })}
                      className="flex h-8 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                    >
                      <option value="">-- Keep in Reception / Unassigned --</option>
                      {staffList.map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {formData.forwardedTo && (
                    <div className="space-y-1 pt-1">
                      <Label className="text-xs font-medium text-zinc-600">Forward Remarks / Instructions</Label>
                      <Input 
                        value={formData.forwardRemarks}
                        onChange={e => setFormData({ ...formData, forwardRemarks: e.target.value })}
                        placeholder="e.g. Please verify and reply by Friday."
                        className="h-8 text-xs bg-white border-zinc-300"
                      />
                    </div>
                  )}
                </div>

                {/* 5. ATTACHMENT */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                    <span>Supporting Document / Scan</span>
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
                      editingId ? 'UPDATE POSTAL RECEIVE' : 'LOG POSTAL RECEIVE'
                    )}
                  </Button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* POSTAL RECEIVE TABLE & TOOLBAR */}
        <div className={showForm ? 'xl:col-span-2' : 'xl:col-span-3'}>
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
            
            {/* Top Toolbar */}
            <div className="p-4 border-b border-zinc-200 space-y-3 bg-zinc-50/40">
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-950">Incoming Postal Register</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {filteredReceives.length} records
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
                
                {/* Search */}
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    value={searchQuery} 
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by ID, sender, subject, reference..." 
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
                    <option value="Received">Received</option>
                    <option value="Forwarded">Forwarded</option>
                    <option value="In Process">In Process</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Postal Type Filter */}
                <div>
                  <select
                    value={postalTypeFilter}
                    onChange={e => { setPostalTypeFilter(e.target.value); setCurrentPage(1); }}
                    className="h-8 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  >
                    <option value="All">All Types</option>
                    <option value="Letter">Letter</option>
                    <option value="Application">Application</option>
                    <option value="Parcel">Parcel</option>
                    <option value="Courier">Courier</option>
                    <option value="Notice">Notice</option>
                    <option value="Document">Document</option>
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

                  {(searchQuery || statusFilter !== 'All' || postalTypeFilter !== 'All' || departmentFilter !== 'All' || dateFilter !== 'All') && (
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
                  <p className="text-xs text-zinc-500 font-medium">Loading postal receive records...</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold bg-zinc-50/70 border-b border-zinc-200">
                    <tr>
                      <th className="px-3.5 py-3 font-semibold">Receive ID</th>
                      <th className="px-3.5 py-3 font-semibold">Sender / From</th>
                      <th className="px-3.5 py-3 font-semibold">Type</th>
                      <th className="px-3.5 py-3 font-semibold">Subject & Ref No</th>
                      <th className="px-3.5 py-3 font-semibold">Destination / To</th>
                      <th className="px-3.5 py-3 font-semibold">Receive Date</th>
                      <th className="px-3.5 py-3 font-semibold">Forwarded To</th>
                      <th className="px-3.5 py-3 font-semibold">Status</th>
                      <th className="px-3.5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/70">
                    {paginatedReceives.length > 0 ? (
                      paginatedReceives.map((p) => {
                        const sender = p.fromTitle || p.senderName || '-';

                        return (
                          <tr key={p._id} className="hover:bg-zinc-50/80 transition-colors">
                            
                            {/* Receive ID */}
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-[11px] border border-zinc-200">
                                {p.receiveId || 'PR-2026-0000'}
                              </span>
                            </td>

                            {/* Sender / From */}
                            <td className="px-3.5 py-3 max-w-[220px]">
                              <div className="font-semibold text-zinc-950 truncate" title={sender}>
                                {sender}
                              </div>
                              {p.address && (
                                <div className="text-[11px] text-zinc-500 truncate" title={p.address}>
                                  {p.address}
                                </div>
                              )}
                              {p.phone && (
                                <div className="text-[10px] text-zinc-400">
                                  Ph: {p.phone}
                                </div>
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

                            {/* Destination / To */}
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <div className="font-medium text-zinc-900">{p.toTitle}</div>
                              <div className="text-[10px] text-zinc-400">{p.department || 'Administration'}</div>
                            </td>

                            {/* Date & Time */}
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <div className="text-zinc-700 font-medium">{formatDate(p.receiveDate || p.date)}</div>
                              {p.receiveTime && <div className="text-[10px] text-zinc-400">{p.receiveTime}</div>}
                            </td>

                            {/* Forwarded To */}
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              {p.forwardedTo ? (
                                <span className="font-medium text-zinc-800 flex items-center gap-1">
                                  <UserCheck className="w-3 h-3 text-zinc-500" />
                                  {p.forwardedTo}
                                </span>
                              ) : (
                                <span className="text-zinc-400 italic text-[11px]">Unassigned</span>
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
                                  onClick={() => setViewReceive(p)} 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                                  title="View Full Details"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>

                                {/* Forward / Assign */}
                                <Button 
                                  onClick={() => {
                                    setForwardModalReceive(p);
                                    setForwardData({
                                      forwardedTo: p.forwardedTo || '',
                                      forwardDate: getTodayDateString(),
                                      forwardRemarks: p.forwardRemarks || ''
                                    });
                                  }} 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100"
                                  title="Forward / Assign"
                                >
                                  <Share2 className="h-3.5 w-3.5" />
                                </Button>

                                {/* Status / Complete */}
                                <Button 
                                  onClick={() => {
                                    setStatusModalReceive(p);
                                    setStatusUpdateData({
                                      status: p.status === 'Completed' ? 'Completed' : 'Completed',
                                      completedDate: getTodayDateString(),
                                      completedBy: p.forwardedTo || 'Admin',
                                      completionRemarks: p.completionRemarks || ''
                                    });
                                  }} 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                  title="Update Status / Complete"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>

                                {/* Edit */}
                                <Button 
                                  onClick={() => handleEdit(p)} 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                                  title="Edit Record"
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
                            <p className="text-sm font-semibold text-zinc-900">No postal receive records found</p>
                            <p className="text-xs text-zinc-500">
                              {searchQuery || statusFilter !== 'All' 
                                ? 'No receive records match the selected search or filter criteria.' 
                                : 'There are no incoming postal items recorded in the system yet.'}
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
                Showing {filteredReceives.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredReceives.length)} of {filteredReceives.length} entries
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
      {viewReceive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-sm bg-zinc-900 text-white px-2.5 py-0.5 rounded">
                  {viewReceive.receiveId || 'PR'}
                </span>
                <StatusBadge status={viewReceive.status} />
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium border border-zinc-200">
                  {viewReceive.postalType || 'Letter'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewReceive(null)} 
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
                  {viewReceive.subject}
                </h3>
                {viewReceive.note && (
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-700 whitespace-pre-wrap leading-relaxed">
                    {viewReceive.note}
                  </div>
                )}
              </div>

              {/* Two Column Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-zinc-50/70 border border-zinc-200">
                
                {/* Sender Details */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sender Information</span>
                  <div className="font-semibold text-zinc-950 text-sm">
                    {viewReceive.fromTitle || viewReceive.senderName}
                  </div>
                  {viewReceive.address && (
                    <div className="text-zinc-600 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{viewReceive.address}</span>
                    </div>
                  )}
                  {viewReceive.phone && (
                    <div className="text-zinc-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      <span>{viewReceive.phone}</span>
                    </div>
                  )}
                  {viewReceive.email && (
                    <div className="text-zinc-600 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-zinc-400" />
                      <span>{viewReceive.email}</span>
                    </div>
                  )}
                  {viewReceive.senderType && (
                    <div className="text-[11px] text-zinc-500">
                      Type: <span className="font-medium text-zinc-800">{viewReceive.senderType}</span>
                    </div>
                  )}
                </div>

                {/* Destination & Meta */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Destination & Receiving Details</span>
                  <div className="text-zinc-600 flex items-center gap-1">
                    <Building className="w-3 h-3 text-zinc-400" />
                    To: <span className="font-semibold text-zinc-900">{viewReceive.toTitle}</span>
                  </div>
                  <div className="text-zinc-600">
                    Department: <span className="font-medium text-zinc-800">{viewReceive.department || 'Administration'}</span>
                  </div>
                  <div className="text-zinc-600">
                    Received Date: <span className="font-medium text-zinc-900">{formatDate(viewReceive.receiveDate || viewReceive.date)} {viewReceive.receiveTime ? `at ${viewReceive.receiveTime}` : ''}</span>
                  </div>
                  {viewReceive.referenceNo && (
                    <div className="text-zinc-600 font-mono">
                      Ref No: <span className="font-bold text-zinc-900">{viewReceive.referenceNo}</span>
                    </div>
                  )}
                  {viewReceive.forwardedTo && (
                    <div className="text-zinc-800 font-medium pt-1">
                      Forwarded To: <span className="font-bold text-zinc-950">{viewReceive.forwardedTo}</span>
                    </div>
                  )}
                  {viewReceive.attachmentUrl && (
                    <div className="pt-1">
                      <a 
                        href={viewReceive.attachmentUrl} 
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

              {/* Completion Details */}
              {viewReceive.status === 'Completed' && (
                <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Resolution / Completion Details
                    </span>
                    {viewReceive.completedDate && (
                      <span className="text-[10px] text-emerald-700">
                        Completed on: {formatDateTime(viewReceive.completedDate)}
                      </span>
                    )}
                  </div>
                  {viewReceive.completionRemarks && (
                    <div className="text-zinc-800 font-medium">
                      Remarks: {viewReceive.completionRemarks}
                    </div>
                  )}
                  {viewReceive.completedBy && (
                    <div className="text-[11px] text-emerald-800">
                      Completed By: {viewReceive.completedBy}
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
                  {viewReceive.history && viewReceive.history.length > 0 ? (
                    viewReceive.history.map((h, i) => (
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
                    <div className="text-zinc-400 italic py-1 text-center">Initial receive record created.</div>
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
                  const rec = viewReceive;
                  setViewReceive(null);
                  handleEdit(rec);
                }}
                className="text-xs"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit Record
              </Button>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  onClick={() => {
                    const rec = viewReceive;
                    setViewReceive(null);
                    setForwardModalReceive(rec);
                    setForwardData({
                      forwardedTo: rec.forwardedTo || '',
                      forwardDate: getTodayDateString(),
                      forwardRemarks: rec.forwardRemarks || ''
                    });
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold"
                >
                  Forward / Assign
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setViewReceive(null)}
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
      {/* MODAL 2: FORWARD / ASSIGN                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {forwardModalReceive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-md w-full overflow-hidden">
            
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-900" />
                <h3 className="font-bold text-sm text-zinc-950">
                  Forward Item - {forwardModalReceive.receiveId || 'PR'}
                </h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setForwardModalReceive(null)} 
                className="h-7 w-7 p-0 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleForwardSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="font-semibold text-zinc-900">From: {forwardModalReceive.fromTitle || forwardModalReceive.senderName}</div>
                <div className="text-[11px] text-zinc-500">{forwardModalReceive.subject}</div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Forward To Staff / Department *</Label>
                <select
                  value={forwardData.forwardedTo}
                  onChange={e => setForwardData({ ...forwardData, forwardedTo: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  required
                >
                  <option value="">-- Select Staff Member or Department --</option>
                  {staffList.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Forward Date *</Label>
                <Input 
                  type="date"
                  value={forwardData.forwardDate}
                  onChange={e => setForwardData({ ...forwardData, forwardDate: e.target.value })}
                  className="h-8 text-xs bg-white border-zinc-300"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Forward Remarks / Action Instructions</Label>
                <textarea 
                  value={forwardData.forwardRemarks}
                  onChange={e => setForwardData({ ...forwardData, forwardRemarks: e.target.value })}
                  placeholder="e.g. Please process this application and prepare a reply."
                  rows={2}
                  className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 resize-y"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setForwardModalReceive(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={forwarding}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs"
                >
                  {forwarding ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Forwarding...
                    </span>
                  ) : (
                    'Confirm Forward'
                  )}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: STATUS / COMPLETE                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {statusModalReceive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-md w-full overflow-hidden">
            
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                <h3 className="font-bold text-sm text-zinc-950">
                  Update Status - {statusModalReceive.receiveId || 'PR'}
                </h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStatusModalReceive(null)} 
                className="h-7 w-7 p-0 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700">Next Status *</Label>
                <select
                  value={statusUpdateData.status}
                  onChange={e => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  required
                >
                  <option value="Completed">Completed (Processing finished)</option>
                  <option value="In Process">In Process (Being reviewed)</option>
                  <option value="Forwarded">Forwarded</option>
                  <option value="Received">Received (Pending review)</option>
                </select>
              </div>

              {statusUpdateData.status === 'Completed' && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-700">Completion Date *</Label>
                    <Input 
                      type="date"
                      value={statusUpdateData.completedDate}
                      onChange={e => setStatusUpdateData({ ...statusUpdateData, completedDate: e.target.value })}
                      className="h-8 text-xs bg-white border-zinc-300"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-700">Completed / Resolved By</Label>
                    <Input 
                      value={statusUpdateData.completedBy}
                      onChange={e => setStatusUpdateData({ ...statusUpdateData, completedBy: e.target.value })}
                      placeholder="e.g. Principal / Examination Branch"
                      className="h-8 text-xs bg-white border-zinc-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-700">Completion Remarks / Resolution</Label>
                    <textarea 
                      value={statusUpdateData.completionRemarks}
                      onChange={e => setStatusUpdateData({ ...statusUpdateData, completionRemarks: e.target.value })}
                      placeholder="e.g. Application reviewed, approved and certificate issued."
                      rows={2}
                      className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 resize-y"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setStatusModalReceive(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={statusUpdating}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs"
                >
                  {statusUpdating ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Update Status'
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
              Are you sure you want to permanently delete this postal receive record from the database?
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
