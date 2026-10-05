'use client';

import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneForwarded,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Eye,
  Download,
  Printer,
  FileCheck,
  FileText,
  RefreshCw,
  Clock3,
  CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

const CONTACT_TYPES = [
  'Parent / Guardian',
  'Student',
  'Teacher',
  'Staff',
  'Vendor',
  'Visitor',
  'Other'
];

const DEFAULT_PURPOSES = [
  'Admission Inquiry',
  'Fee Due Follow-up',
  'Attendance & Absence Verification',
  'Homework & Academics',
  'Student Discipline / Complaint',
  'General Inquiry',
  'Leave / Sick Notice',
  'Transport & Bus Inquiry',
  'Emergency Contact',
  'Other'
];

export default function PhoneCallLogPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, incoming: 0, outgoing: 0, followUpsPending: 0, callsToday: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Dynamic resources for dropdowns
  const [staffList, setStaffList] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState(DEFAULT_PURPOSES);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [callTypeFilter, setCallTypeFilter] = useState('All');
  const [contactTypeFilter, setContactTypeFilter] = useState('All');
  const [followUpFilter, setFollowUpFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewingLog, setViewingLog] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    callType: 'Incoming',
    name: '',
    phone: '',
    contactType: 'Parent / Guardian',
    relatedPersonName: '',
    purpose: 'Admission Inquiry',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: '5 mins',
    followUp: 'No',
    followUpDate: '',
    followUpStatus: 'Not Required',
    assignedTo: 'Front Desk Admin',
    description: '',
    note: ''
  });

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial dropdown resources
  const fetchDropdownResources = async () => {
    try {
      const [staffRes, setupRes] = await Promise.all([
        api.get('/staff?limit=100').catch(() => null),
        api.get('/setup?all=true').catch(() => null)
      ]);

      if (staffRes?.success && Array.isArray(staffRes.data)) {
        setStaffList(staffRes.data);
      }

      if (setupRes?.success && Array.isArray(setupRes.data)) {
        const customPurposes = setupRes.data
          .filter(s => s.type === 'Call Purpose' || s.type === 'Purpose')
          .map(s => s.name);
        if (customPurposes.length > 0) {
          const merged = Array.from(new Set([...customPurposes, ...DEFAULT_PURPOSES]));
          setPurposeOptions(merged);
        }
      }
    } catch (err) {
      console.error('Error fetching dropdown resources:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: searchQuery.trim(),
        callType: callTypeFilter !== 'All' ? callTypeFilter : '',
        contactType: contactTypeFilter !== 'All' ? contactTypeFilter : '',
        followUpStatus: followUpFilter !== 'All' ? followUpFilter : '',
        purpose: purposeFilter !== 'All' ? purposeFilter : '',
        date: dateFilter || ''
      });

      const [res, statsRes] = await Promise.all([
        api.get(`/phone-call-log?${queryParams.toString()}`),
        api.get('/phone-call-log/stats').catch(() => null)
      ]);

      if (res?.success) {
        setLogs(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }

      if (statsRes?.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Error fetching phone call logs:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch phone call logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownResources();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, callTypeFilter, contactTypeFilter, followUpFilter, purposeFilter, dateFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      callType: 'Incoming',
      name: '',
      phone: '',
      contactType: 'Parent / Guardian',
      relatedPersonName: '',
      purpose: purposeOptions[0] || 'Admission Inquiry',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: '5 mins',
      followUp: 'No',
      followUpDate: '',
      followUpStatus: 'Not Required',
      assignedTo: 'Front Desk Admin',
      description: '',
      note: ''
    });
    setShowFormModal(true);
  };

  const handleEdit = (log) => {
    setEditingId(log._id);
    setFormData({
      callType: log.callType || 'Incoming',
      name: log.name || '',
      phone: log.phone || '',
      contactType: log.contactType || 'Parent / Guardian',
      relatedPersonName: log.relatedPersonName || '',
      purpose: log.purpose || purposeOptions[0] || 'Admission Inquiry',
      date: log.date ? log.date.split('T')[0] : new Date().toISOString().split('T')[0],
      time: log.time || '',
      duration: log.duration || '5 mins',
      followUp: log.followUp || 'No',
      followUpDate: log.followUpDate ? log.followUpDate.split('T')[0] : '',
      followUpStatus: log.followUpStatus || 'Not Required',
      assignedTo: log.assignedTo || 'Front Desk Admin',
      description: log.description || '',
      note: log.note || ''
    });
    setShowFormModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Contact/Caller name is required.', true);
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Phone number is required.', true);
      return;
    }
    if (!formData.purpose.trim()) {
      showToast('Call purpose is required.', true);
      return;
    }
    if (formData.followUp === 'Yes' && !formData.followUpDate) {
      showToast('Follow-up date is required when Follow Up is set to Yes.', true);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        purpose: formData.purpose.trim(),
        description: formData.description.trim(),
        note: formData.note.trim()
      };

      if (editingId) {
        const res = await api.put(`/phone-call-log/${editingId}`, payload);
        if (res?.success) {
          showToast('Phone call record updated successfully!');
          fetchData();
        }
      } else {
        const res = await api.post('/phone-call-log', payload);
        if (res?.success) {
          showToast('Phone call logged successfully!');
          fetchData();
        }
      }

      setShowFormModal(false);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save phone call log:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save call record.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFollowUp = async (log) => {
    try {
      const res = await api.patch(`/phone-call-log/${log._id}/follow-up`);
      if (res?.success) {
        setLogs(prev => prev.map(l => l._id === log._id ? { ...l, followUpStatus: res.data.followUpStatus, followUp: res.data.followUp } : l));
        showToast(res.message || 'Follow-up status updated');
        // Refresh stats
        const statsRes = await api.get('/phone-call-log/stats').catch(() => null);
        if (statsRes?.success) setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to update follow-up status:', err);
      showToast('Failed to update follow-up status.', true);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await api.delete(`/phone-call-log/${deleteConfirmItem._id}`);
      if (res?.success) {
        showToast('Phone call record deleted successfully.');
        setDeleteConfirmItem(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete call log:', err);
      showToast(err?.response?.data?.message || 'Failed to delete call record.', true);
    }
  };

  const handleExport = (type) => {
    if (logs.length === 0) {
      showToast('No call records available to export.', true);
      return;
    }

    const exportData = logs.map((item, index) => ({
      'SL': (page - 1) * 10 + index + 1,
      'Caller Name': item.name,
      'Phone': item.phone,
      'Call Type': item.callType,
      'Contact Type': item.contactType,
      'Purpose': item.purpose,
      'Date': item.date,
      'Time': item.time || '-',
      'Duration': item.duration,
      'Follow Up': item.followUp,
      'Follow Up Date': item.followUpDate || '-',
      'Follow Up Status': item.followUpStatus,
      'Assigned To': item.assignedTo || '-'
    }));

    const headers = Object.keys(exportData[0] || {});
    const filename = `Phone_Call_Logs_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi ERP - Phone Call Register');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV export downloaded successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'PhoneCalls');
      showToast('Excel export downloaded successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Phone Call Log Register', filename);
      showToast('PDF summary downloaded successfully!');
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

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Phone className="w-6 h-6 text-zinc-900" />
            Phone Call Log
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Log and manage incoming & outgoing institutional inquiries, parent calls, and follow-ups
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg">
          <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-700 transition-colors">Admin Section</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-semibold">Phone Call Log</span>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Calls</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{stats.total}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">{stats.callsToday} logged today</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Incoming</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <PhoneIncoming className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{stats.incoming}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Inbound queries & calls</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Outgoing</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <PhoneOutgoing className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-2">{stats.outgoing}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Outbound institutional calls</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Follow-Ups</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{stats.followUpsPending}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Requires callback / action</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-950">Call Logs Register</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
              {pagination.total} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search name, phone, purpose..." 
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

            {/* Call Type Filter */}
            <select
              value={callTypeFilter}
              onChange={e => { setCallTypeFilter(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="All">All Call Types</option>
              <option value="Incoming">Incoming Only</option>
              <option value="Outgoing">Outgoing Only</option>
            </select>

            {/* Follow-Up Filter */}
            <select
              value={followUpFilter}
              onChange={e => { setFollowUpFilter(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="All">All Follow-ups</option>
              <option value="Pending">Pending Callback</option>
              <option value="Completed">Completed</option>
              <option value="Not Required">Not Required</option>
            </select>

            {/* Contact Type Filter */}
            <select
              value={contactTypeFilter}
              onChange={e => { setContactTypeFilter(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="All">All Contacts</option>
              {CONTACT_TYPES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Export Toolbar */}
            <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-2xs">
              <button onClick={() => handleExport('Excel')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 text-xs font-medium" title="Excel">
                <Download className="h-3.5 w-3.5 text-emerald-600" />
              </button>
              <button onClick={() => handleExport('CSV')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 text-xs font-medium border-l border-zinc-200" title="CSV">
                <FileCheck className="h-3.5 w-3.5 text-blue-600" />
              </button>
              <button onClick={() => handleExport('PDF')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 text-xs font-medium border-l border-zinc-200" title="PDF">
                <Download className="h-3.5 w-3.5 text-rose-600" />
              </button>
              <button onClick={() => handleExport('Print')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 text-xs font-medium border-l border-zinc-200" title="Print">
                <Printer className="h-3.5 w-3.5 text-zinc-700" />
              </button>
            </div>

            {/* Refresh */}
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-zinc-600 border-zinc-300 hover:bg-zinc-100"
              title="Refresh logs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>

            {/* Create Button */}
            <Button 
              onClick={handleOpenCreate}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium h-8 text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              LOG PHONE CALL
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={fetchData} className="h-7 text-xs bg-white border-rose-200 text-rose-700 hover:bg-rose-100">
              Retry
            </Button>
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto min-h-[260px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <Loader2 className="w-7 h-7 animate-spin text-zinc-800" />
              <p className="text-xs text-zinc-500">Loading phone call logs...</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold bg-zinc-50/80 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">SL</th>
                  <th className="px-4 py-3 font-semibold">Caller & Contact</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                  <th className="px-4 py-3 font-semibold">Date & Time</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Follow-Up</th>
                  <th className="px-4 py-3 font-semibold">Assigned To</th>
                  <th className="px-4 py-3 font-semibold w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70">
                {logs.length > 0 ? (
                  logs.map((l, i) => {
                    const slNo = (page - 1) * 10 + i + 1;
                    const isIncoming = l.callType === 'Incoming';
                    const isPending = l.followUpStatus === 'Pending';
                    const isCompleted = l.followUpStatus === 'Completed';

                    return (
                      <tr key={l._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3 text-center text-zinc-500 font-mono">{slNo}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-zinc-950 text-xs">{l.name}</div>
                          <div className="text-[11px] font-mono text-zinc-500">{l.phone}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{l.contactType}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            isIncoming 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                          }`}>
                            {isIncoming ? <PhoneIncoming className="w-3 h-3 text-emerald-700" /> : <PhoneOutgoing className="w-3 h-3 text-zinc-700" />}
                            {l.callType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-zinc-900">{l.purpose}</span>
                          {l.relatedPersonName && (
                            <div className="text-[11px] text-zinc-400 truncate max-w-[150px]">
                              Ref: {l.relatedPersonName}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          <div>{l.date}</div>
                          {l.time && <div className="text-[11px] text-zinc-400 font-mono">{l.time}</div>}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 font-mono">
                          {l.duration || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {l.followUp === 'Yes' ? (
                            <div>
                              <button
                                onClick={() => handleToggleFollowUp(l)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors border ${
                                  isPending 
                                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                }`}
                                title="Click to toggle follow-up completion"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-600 animate-pulse' : 'bg-emerald-600'}`} />
                                {l.followUpStatus || 'Pending'}
                              </button>
                              {l.followUpDate && (
                                <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                                  Due: {l.followUpDate}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 text-[11px]">
                          {l.assignedTo || 'Front Desk'}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              onClick={() => setViewingLog(l)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              onClick={() => handleEdit(l)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                              title="Edit Record"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              onClick={() => setDeleteConfirmItem(l)} 
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
                    <td colSpan="9" className="px-4 py-16 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Phone className="w-10 h-10 text-zinc-300" />
                        <p className="font-semibold text-zinc-800 text-sm">No Phone Call Logs Found</p>
                        <p className="text-xs text-zinc-400 max-w-sm">
                          {searchQuery || callTypeFilter !== 'All' || followUpFilter !== 'All'
                            ? 'No call records match your selected search or filter criteria.' 
                            : 'Click "+ LOG PHONE CALL" to record your first incoming or outgoing call inquiry.'}
                        </p>
                        {!searchQuery && callTypeFilter === 'All' && followUpFilter === 'All' && (
                          <Button 
                            onClick={handleOpenCreate} 
                            size="sm" 
                            className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs mt-2"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Log Phone Call
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/40 text-xs text-zinc-600">
            <div>
              Showing <span className="font-semibold text-zinc-950">{(page - 1) * 10 + 1}</span> to <span className="font-semibold text-zinc-950">{Math.min(page * 10, pagination.total)}</span> of <span className="font-semibold text-zinc-950">{pagination.total}</span> records
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="h-7 text-xs px-2.5 bg-white border-zinc-300"
              >
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={`h-7 w-7 p-0 text-xs ${
                    p === page 
                      ? 'bg-zinc-950 text-white font-bold' 
                      : 'bg-white border-zinc-300 text-zinc-700'
                  }`}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                className="h-7 text-xs px-2.5 bg-white border-zinc-300"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-2xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/70 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                <h2 className="text-base font-bold text-zinc-950">
                  {editingId ? 'Edit Phone Call Log' : 'Log Phone Call'}
                </h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFormModal(false)} 
                className="text-zinc-400 hover:text-zinc-700 h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Call Type Selection */}
              <div className="space-y-1.5 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                  Call Direction / Type <span className="text-rose-500">*</span>
                </Label>
                <div className="flex items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modalCallType"
                      value="Incoming"
                      checked={formData.callType === 'Incoming'}
                      onChange={() => setFormData({ ...formData, callType: 'Incoming' })}
                      className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="font-semibold text-zinc-900 flex items-center gap-1">
                      <PhoneIncoming className="w-3.5 h-3.5 text-emerald-700" />
                      Incoming Call
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modalCallType"
                      value="Outgoing"
                      checked={formData.callType === 'Outgoing'}
                      onChange={() => setFormData({ ...formData, callType: 'Outgoing' })}
                      className="text-zinc-900 focus:ring-zinc-500 w-4 h-4"
                    />
                    <span className="font-semibold text-zinc-900 flex items-center gap-1">
                      <PhoneOutgoing className="w-3.5 h-3.5 text-zinc-700" />
                      Outgoing Call
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Caller / Contact Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="e.g. Tariq Mehmood / Dr. Sarah" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                    required 
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Phone Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                    placeholder="e.g. 0300 1234567 / +923001234567" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs font-mono" 
                    required 
                  />
                </div>

                {/* Contact Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Contact Type
                  </Label>
                  <select 
                    value={formData.contactType} 
                    onChange={e => setFormData({ ...formData, contactType: e.target.value })} 
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900" 
                  >
                    {CONTACT_TYPES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Call Purpose */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Call Purpose <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    value={formData.purpose} 
                    onChange={e => setFormData({ ...formData, purpose: e.target.value })} 
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 font-semibold" 
                    required
                  >
                    {purposeOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Related Person / Student */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Related Student / Reference
                  </Label>
                  <Input 
                    value={formData.relatedPersonName} 
                    onChange={e => setFormData({ ...formData, relatedPersonName: e.target.value })} 
                    placeholder="e.g. Rayyan Tariq (Class 10-A)" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                  />
                </div>

                {/* Assigned To */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Assigned Staff / Officer
                  </Label>
                  <select 
                    value={formData.assignedTo} 
                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })} 
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900" 
                  >
                    <option value="Front Desk Admin">Front Desk Admin</option>
                    <option value="Principal Office">Principal Office</option>
                    <option value="Accounts Department">Accounts Department</option>
                    <option value="Academic Coordinator">Academic Coordinator</option>
                    {staffList.map(st => (
                      <option key={st._id} value={`${st.firstName || ''} ${st.lastName || ''}`.trim()}>
                        {st.firstName} {st.lastName} ({st.designation || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Call Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({ ...formData, date: e.target.value })} 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                    required 
                  />
                </div>

                {/* Time & Duration */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Time</Label>
                    <Input 
                      value={formData.time} 
                      onChange={e => setFormData({ ...formData, time: e.target.value })} 
                      placeholder="10:30 AM" 
                      className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Duration</Label>
                    <Input 
                      value={formData.duration} 
                      onChange={e => setFormData({ ...formData, duration: e.target.value })} 
                      placeholder="e.g. 5 mins" 
                      className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                    />
                  </div>
                </div>
              </div>

              {/* Follow Up Section */}
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                    Follow-Up Required?
                  </Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="followUpToggle"
                        value="No"
                        checked={formData.followUp === 'No'}
                        onChange={() => setFormData({ ...formData, followUp: 'No', followUpStatus: 'Not Required', followUpDate: '' })}
                        className="text-zinc-900 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-zinc-700 font-medium">No</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="followUpToggle"
                        value="Yes"
                        checked={formData.followUp === 'Yes'}
                        onChange={() => setFormData({ ...formData, followUp: 'Yes', followUpStatus: 'Pending', followUpDate: formData.followUpDate || new Date().toISOString().split('T')[0] })}
                        className="text-emerald-600 w-3.5 h-3.5"
                      />
                      <span className="text-xs font-bold text-emerald-800">Yes, Follow-up</span>
                    </label>
                  </div>
                </div>

                {formData.followUp === 'Yes' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-200">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-zinc-700">Follow-Up Date <span className="text-rose-500">*</span></span>
                      <Input
                        type="date"
                        value={formData.followUpDate}
                        onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
                        className="bg-white border-zinc-300 text-zinc-950 text-xs"
                        required={formData.followUp === 'Yes'}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-zinc-700">Follow-Up Status</span>
                      <select
                        value={formData.followUpStatus}
                        onChange={e => setFormData({ ...formData, followUpStatus: e.target.value })}
                        className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      >
                        <option value="Pending">Pending Callback</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Description / Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                  Call Conversation Notes & Discussion Points
                </Label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize key points discussed during the phone call..."
                  className="w-full min-h-[80px] rounded-lg border border-zinc-300 bg-white p-3 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFormModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs px-5 shadow-xs"
                >
                  {submitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    editingId ? 'UPDATE CALL RECORD' : 'SAVE CALL LOG'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  viewingLog.callType === 'Incoming' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-800'
                }`}>
                  {viewingLog.callType === 'Incoming' ? <PhoneIncoming className="w-4 h-4" /> : <PhoneOutgoing className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-950">{viewingLog.name}</h3>
                  <p className="text-[11px] font-mono text-zinc-500">{viewingLog.phone}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewingLog(null)} 
                className="text-zinc-400 hover:text-zinc-700 h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Call Type</span>
                <p className="font-semibold text-zinc-900 mt-0.5">{viewingLog.callType}</p>
              </div>
              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Contact Category</span>
                <p className="font-semibold text-zinc-900 mt-0.5">{viewingLog.contactType}</p>
              </div>
              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Call Purpose</span>
                <p className="font-semibold text-zinc-900 mt-0.5">{viewingLog.purpose}</p>
              </div>
              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Date & Time</span>
                <p className="font-semibold text-zinc-900 mt-0.5">{viewingLog.date} {viewingLog.time ? `(${viewingLog.time})` : ''}</p>
              </div>
              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Call Duration</span>
                <p className="font-semibold text-zinc-900 mt-0.5">{viewingLog.duration || '5 mins'}</p>
              </div>
              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Assigned To</span>
                <p className="font-semibold text-zinc-900 mt-0.5">{viewingLog.assignedTo || 'Front Desk'}</p>
              </div>
            </div>

            {viewingLog.followUp === 'Yes' && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-amber-700" />
                    Follow-Up Callback Required
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    viewingLog.followUpStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {viewingLog.followUpStatus}
                  </span>
                </div>
                {viewingLog.followUpDate && (
                  <p className="text-[11px] text-amber-800">Target Date: <strong>{viewingLog.followUpDate}</strong></p>
                )}
              </div>
            )}

            {viewingLog.description && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Discussion Notes:</span>
                <p className="text-xs text-zinc-800 bg-zinc-50 p-3 rounded-lg border border-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {viewingLog.description}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewingLog(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
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
              Are you sure you want to permanently delete the phone call log for <strong className="text-zinc-900">&ldquo;{deleteConfirmItem.name}&rdquo;</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteConfirmItem(null)}
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
