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
  CreditCard,
  User,
  Users,
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
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

const THEME_STYLES = [
  { id: 'stoofi-emerald', label: '1. Modern Emerald Badge', headerBg: 'bg-emerald-800', border: 'border-emerald-600', text: 'text-emerald-900', accent: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'classic-navy', label: '2. Executive Navy Horizontal', headerBg: 'bg-sky-950', border: 'border-sky-800', text: 'text-sky-950', accent: 'bg-sky-50 text-sky-900 border-sky-200' },
  { id: 'royal-purple', label: '3. Royal Purple Academic', headerBg: 'bg-indigo-900', border: 'border-indigo-700', text: 'text-indigo-900', accent: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
  { id: 'dark-slate', label: '4. Dark Luxury Obsidian', headerBg: 'bg-zinc-950', border: 'border-zinc-800', text: 'text-zinc-950', accent: 'bg-zinc-900 text-emerald-400 border-zinc-700' },
  { id: 'crimson-gold', label: '5. Heritage Crimson & Gold', headerBg: 'bg-rose-950', border: 'border-amber-600', text: 'text-rose-950', accent: 'bg-amber-50 text-amber-900 border-amber-300' },
  { id: 'modern-slate', label: 'Modern Slate', headerBg: 'bg-zinc-900', border: 'border-zinc-700', text: 'text-zinc-900', accent: 'bg-zinc-100 text-zinc-800 border-zinc-300' }
];

export default function IdCardPage() {
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({ total: 0, studentCards: 0, staffCards: 0, activeCards: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewingCard, setViewingCard] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    role: 'Student',
    cardLayout: 'vertical',
    themeStyle: 'stoofi-emerald',
    headerText: 'OFFICIAL IDENTITY CARD',
    footerText: 'Principal Signature & Seal',
    showPhoto: true,
    showAdmissionNo: true,
    showRollNo: true,
    showClass: true,
    showSection: true,
    showFatherName: true,
    showPhone: true,
    showBloodGroup: true,
    showDob: true,
    showDesignation: false,
    showDepartment: false,
    showQrBarcode: true,
    status: 'Active'
  });

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: searchQuery.trim(),
        role: roleFilter !== 'All' ? roleFilter : '',
        status: statusFilter !== 'All' ? statusFilter : ''
      });

      const [res, statsRes] = await Promise.all([
        api.get(`/id-card?${queryParams.toString()}`),
        api.get('/id-card/stats').catch(() => null)
      ]);

      if (res?.success) {
        setCards(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }

      if (statsRes?.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Error fetching ID card templates:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch ID card templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, roleFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleBackgroundUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB', true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, uploadedBackground: reader.result }));
        showToast('Custom template background image loaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      role: 'Student',
      cardLayout: 'vertical',
      themeStyle: 'stoofi-emerald',
      headerText: 'OFFICIAL IDENTITY CARD',
      footerText: 'Principal Signature & Seal',
      showPhoto: true,
      showAdmissionNo: true,
      showRollNo: true,
      showClass: true,
      showSection: true,
      showFatherName: true,
      showPhone: true,
      showBloodGroup: true,
      showDob: true,
      showDesignation: false,
      showDepartment: false,
      showQrBarcode: true,
      uploadedBackground: '',
      status: 'Active'
    });
    setShowFormModal(true);
  };

  const handleEdit = (card) => {
    setEditingId(card._id);
    setFormData({
      title: card.title || '',
      role: card.role || 'Student',
      cardLayout: card.cardLayout || 'vertical',
      themeStyle: card.themeStyle || 'stoofi-emerald',
      headerText: card.headerText || 'OFFICIAL IDENTITY CARD',
      footerText: card.footerText || 'Principal Signature & Seal',
      showPhoto: card.showPhoto !== undefined ? card.showPhoto : true,
      showAdmissionNo: card.showAdmissionNo !== undefined ? card.showAdmissionNo : true,
      showRollNo: card.showRollNo !== undefined ? card.showRollNo : true,
      showClass: card.showClass !== undefined ? card.showClass : true,
      showSection: card.showSection !== undefined ? card.showSection : true,
      showFatherName: card.showFatherName !== undefined ? card.showFatherName : true,
      showPhone: card.showPhone !== undefined ? card.showPhone : true,
      showBloodGroup: card.showBloodGroup !== undefined ? card.showBloodGroup : true,
      showDob: card.showDob !== undefined ? card.showDob : true,
      showDesignation: card.showDesignation !== undefined ? card.showDesignation : true,
      showDepartment: card.showDepartment !== undefined ? card.showDepartment : true,
      showQrBarcode: card.showQrBarcode !== undefined ? card.showQrBarcode : true,
      uploadedBackground: card.uploadedBackground || '',
      status: card.status || 'Active'
    });
    setShowFormModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Template title is required.', true);
      return;
    }
    if (!formData.role.trim()) {
      showToast('Target role is required.', true);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        title: formData.title.trim(),
        headerText: formData.headerText.trim(),
        footerText: formData.footerText.trim()
      };

      if (editingId) {
        const res = await api.put(`/id-card/${editingId}`, payload);
        if (res?.success) {
          showToast('ID card template updated successfully!');
          fetchData();
        }
      } else {
        const res = await api.post('/id-card', payload);
        if (res?.success) {
          showToast('ID card template created successfully!');
          fetchData();
        }
      }

      setShowFormModal(false);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save ID card template:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save template.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (card) => {
    try {
      const res = await api.patch(`/id-card/${card._id}/status`);
      if (res?.success) {
        setCards(prev => prev.map(c => c._id === card._id ? { ...c, status: res.data.status } : c));
        showToast(res.message || `Status updated to ${res.data.status}`);
        const statsRes = await api.get('/id-card/stats').catch(() => null);
        if (statsRes?.success) setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast('Failed to toggle status.', true);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await api.delete(`/id-card/${deleteConfirmItem._id}`);
      if (res?.success) {
        showToast('ID card template deleted successfully.');
        setDeleteConfirmItem(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
      showToast(err?.response?.data?.message || 'Failed to delete template.', true);
    }
  };

  const handleExport = (type) => {
    if (cards.length === 0) {
      showToast('No templates available to export.', true);
      return;
    }

    const exportData = cards.map((item, index) => ({
      'SL': (page - 1) * 10 + index + 1,
      'Card Title': item.title,
      'Target Role': item.role,
      'Layout': item.cardLayout,
      'Theme Style': item.themeStyle,
      'Status': item.status,
      'Updated Date': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : '-'
    }));

    const headers = Object.keys(exportData[0] || {});
    const filename = `ID_Card_Templates_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi ERP - ID Card Templates');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV export downloaded successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'IDCards');
      showToast('Excel export downloaded successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'ID Card Templates Register', filename);
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
            <CreditCard className="w-6 h-6 text-zinc-900" />
            ID Card Templates
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure institutional student, teacher, and staff identity card formats, field visibility, and themes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/dashboard/admin/generate-id-card"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-900 bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Generate ID Cards
          </Link>
          <div className="hidden md:flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg">
            <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-700 transition-colors">Admin Section</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-semibold">ID Card</span>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Cards</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{stats.total}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Configured card designs</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Student Cards</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{stats.studentCards}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">For enrolled students</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Staff / Faculty</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-2">{stats.staffCards}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Faculty & Employee cards</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Status</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{stats.activeCards}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Available for generation</p>
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        {/* Table Toolbar - Single Clean Professional Line */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-zinc-50/50">
          {/* Left: Create Button & Records Count Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button 
              onClick={handleOpenCreate}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold h-8 text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap px-3.5 rounded-lg border border-zinc-950 hover:border-zinc-800 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              CREATE ID CARD
            </Button>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-zinc-700 border border-zinc-200 shadow-2xs whitespace-nowrap">
              {pagination.total} {pagination.total === 1 ? 'Template' : 'Templates'}
            </span>
          </div>

          {/* Right: Search, Filters & Export Tools */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 overflow-x-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[200px] shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search templates..." 
                className="pl-8 h-8 text-xs bg-white border-zinc-300 text-zinc-950 focus-visible:ring-1 focus-visible:ring-zinc-900 rounded-lg" 
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

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium shrink-0 cursor-pointer shadow-2xs"
            >
              <option value="All">All Roles</option>
              <option value="Student">Student Cards</option>
              <option value="Teacher">Teacher Cards</option>
              <option value="Staff">Staff Cards</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium shrink-0 cursor-pointer shadow-2xs"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Export Toolbar */}
            <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-2xs shrink-0">
              <button onClick={() => handleExport('Excel')} className="px-2.5 py-1.5 hover:bg-zinc-100 text-zinc-600 text-xs font-medium cursor-pointer transition-colors" title="Export Excel">
                <Download className="h-3.5 w-3.5 text-emerald-600" />
              </button>
              <button onClick={() => handleExport('CSV')} className="px-2.5 py-1.5 hover:bg-zinc-100 text-zinc-600 text-xs font-medium border-l border-zinc-200 cursor-pointer transition-colors" title="Export CSV">
                <FileCheck className="h-3.5 w-3.5 text-blue-600" />
              </button>
              <button onClick={() => handleExport('PDF')} className="px-2.5 py-1.5 hover:bg-zinc-100 text-zinc-600 text-xs font-medium border-l border-zinc-200 cursor-pointer transition-colors" title="Export PDF">
                <Download className="h-3.5 w-3.5 text-rose-600" />
              </button>
              <button onClick={() => handleExport('Print')} className="px-2.5 py-1.5 hover:bg-zinc-100 text-zinc-600 text-xs font-medium border-l border-zinc-200 cursor-pointer transition-colors" title="Print Register">
                <Printer className="h-3.5 w-3.5 text-zinc-700" />
              </button>
            </div>

            {/* Refresh */}
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-zinc-600 border-zinc-300 hover:bg-zinc-100 rounded-lg shrink-0 cursor-pointer"
              title="Refresh templates"
            >
              <RefreshCw className="h-3.5 w-3.5" />
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
              <p className="text-xs text-zinc-500">Loading ID card templates...</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold bg-zinc-50/80 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">SL</th>
                  <th className="px-4 py-3 font-semibold">Card Title</th>
                  <th className="px-4 py-3 font-semibold">Target Role</th>
                  <th className="px-4 py-3 font-semibold">Theme Style</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated Date</th>
                  <th className="px-4 py-3 font-semibold w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70">
                {cards.length > 0 ? (
                  cards.map((c, i) => {
                    const slNo = (page - 1) * 10 + i + 1;
                    return (
                      <tr key={c._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3 text-center text-zinc-500 font-mono">{slNo}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-zinc-950 text-xs">{c.title}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{c.headerText || 'OFFICIAL IDENTITY CARD'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            c.role === 'Student' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : c.role === 'Teacher'
                              ? 'bg-sky-50 text-sky-900 border-sky-200'
                              : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                          }`}>
                            {c.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize font-mono text-[11px] text-zinc-600">
                            {c.themeStyle?.replace('-', ' ') || 'Stoofi Emerald'} ({c.cardLayout || 'vertical'})
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors border ${
                              c.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-600' : 'bg-zinc-400'}`} />
                            {c.status || 'Active'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              onClick={() => setViewingCard(c)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                              title="Preview Card Design"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Link
                              href={`/dashboard/admin/generate-id-card?role=${c.role}`}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-md text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
                              title="Generate with this layout"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                            </Link>
                            <Button 
                              onClick={() => handleEdit(c)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                              title="Edit Template"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              onClick={() => setDeleteConfirmItem(c)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete Template"
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
                    <td colSpan="7" className="px-4 py-16 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CreditCard className="w-10 h-10 text-zinc-300" />
                        <p className="font-semibold text-zinc-800 text-sm">No ID Card Templates Found</p>
                        <p className="text-xs text-zinc-400 max-w-sm">
                          {searchQuery || roleFilter !== 'All' || statusFilter !== 'All'
                            ? 'No templates match your selected search or filter criteria.' 
                            : 'Click "+ CREATE ID CARD" to design an ID card layout for students or staff.'}
                        </p>
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
              Showing <span className="font-semibold text-zinc-950">{(page - 1) * 10 + 1}</span> to <span className="font-semibold text-zinc-950">{Math.min(page * 10, pagination.total)}</span> of <span className="font-semibold text-zinc-950">{pagination.total}</span> templates
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
                  {editingId ? 'Edit ID Card Template' : 'Create ID Card Template'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Template Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                    placeholder="e.g. Official Student Smart ID Card 2026" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                    required 
                  />
                </div>

                {/* Target Role */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Target Role <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({ ...formData, role: e.target.value })} 
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 font-semibold" 
                    required
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher / Faculty</option>
                    <option value="Staff">Staff / Employee</option>
                  </select>
                </div>

                {/* Theme Style */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Theme Color
                  </Label>
                  <select 
                    value={formData.themeStyle} 
                    onChange={e => setFormData({ ...formData, themeStyle: e.target.value })} 
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900" 
                  >
                    {THEME_STYLES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Header Text */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Card Header Banner Text
                  </Label>
                  <Input 
                    value={formData.headerText} 
                    onChange={e => setFormData({ ...formData, headerText: e.target.value })} 
                    placeholder="e.g. OFFICIAL IDENTITY CARD" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs uppercase" 
                  />
                </div>

                {/* Footer Text */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Card Footer Signature Label
                  </Label>
                  <Input 
                    value={formData.footerText} 
                    onChange={e => setFormData({ ...formData, footerText: e.target.value })} 
                    placeholder="e.g. Principal Signature & Seal" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                  />
                </div>

                {/* Upload Custom Background Graphic */}
                <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-zinc-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                      Upload Custom Card Background Image (Optional)
                    </Label>
                    {formData.uploadedBackground && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, uploadedBackground: '' }))}
                        className="text-[10px] text-rose-600 hover:underline font-bold"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer border border-zinc-300 rounded-lg p-1"
                    />
                    {formData.uploadedBackground && (
                      <div className="w-10 h-10 rounded-lg border border-zinc-300 overflow-hidden shrink-0">
                        <img src={formData.uploadedBackground} alt="Custom Background" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400">Upload high-res PNG/JPG custom school badge frame or card background</p>
                </div>
              </div>

              {/* Field Visibility Checkbox Matrix */}
              <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                  Enabled Card Fields & Information
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                    <input
                      type="checkbox"
                      checked={formData.showPhoto}
                      onChange={e => setFormData({ ...formData, showPhoto: e.target.checked })}
                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>Profile Photo</span>
                  </label>

                  {formData.role === 'Student' ? (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                        <input
                          type="checkbox"
                          checked={formData.showAdmissionNo}
                          onChange={e => setFormData({ ...formData, showAdmissionNo: e.target.checked })}
                          className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span>Admission No</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                        <input
                          type="checkbox"
                          checked={formData.showRollNo}
                          onChange={e => setFormData({ ...formData, showRollNo: e.target.checked })}
                          className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span>Roll Number</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                        <input
                          type="checkbox"
                          checked={formData.showClass}
                          onChange={e => setFormData({ ...formData, showClass: e.target.checked })}
                          className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span>Class & Section</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                        <input
                          type="checkbox"
                          checked={formData.showFatherName}
                          onChange={e => setFormData({ ...formData, showFatherName: e.target.checked })}
                          className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span>Father Name</span>
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                        <input
                          type="checkbox"
                          checked={formData.showDesignation}
                          onChange={e => setFormData({ ...formData, showDesignation: e.target.checked })}
                          className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span>Designation</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                        <input
                          type="checkbox"
                          checked={formData.showDepartment}
                          onChange={e => setFormData({ ...formData, showDepartment: e.target.checked })}
                          className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span>Department</span>
                      </label>
                    </>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                    <input
                      type="checkbox"
                      checked={formData.showPhone}
                      onChange={e => setFormData({ ...formData, showPhone: e.target.checked })}
                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>Emergency Contact</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                    <input
                      type="checkbox"
                      checked={formData.showBloodGroup}
                      onChange={e => setFormData({ ...formData, showBloodGroup: e.target.checked })}
                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>Blood Group</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
                    <input
                      type="checkbox"
                      checked={formData.showQrBarcode}
                      onChange={e => setFormData({ ...formData, showQrBarcode: e.target.checked })}
                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>QR Security Badge</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                  Template Status
                </Label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({ ...formData, status: e.target.value })} 
                  className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900" 
                >
                  <option value="Active">Active (Available in Generator)</option>
                  <option value="Inactive">Inactive (Hidden)</option>
                </select>
              </div>

              {/* Actions */}
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
                    editingId ? 'UPDATE TEMPLATE' : 'SAVE ID CARD'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & PREVIEW MODAL */}
      {viewingCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-950">{viewingCard.title}</h3>
                <p className="text-[11px] text-zinc-500">Live preview with sample institutional identity format</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewingCard(null)} 
                className="text-zinc-400 hover:text-zinc-700 h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* ID Card Canvas Preview */}
            <div className="p-6 bg-zinc-100 rounded-xl flex items-center justify-center">
              <div className="bg-white text-zinc-900 rounded-2xl overflow-hidden shadow-xl border border-zinc-300 w-full max-w-[280px] h-[440px] flex flex-col justify-between">
                {/* Header */}
                <div className={`text-white p-3.5 text-center ${
                  viewingCard.themeStyle === 'stoofi-emerald' ? 'bg-emerald-800' :
                  viewingCard.themeStyle === 'classic-navy' ? 'bg-sky-950' :
                  viewingCard.themeStyle === 'royal-purple' ? 'bg-indigo-900' :
                  'bg-zinc-900'
                }`}>
                  <div className="text-[9px] uppercase font-bold tracking-widest text-emerald-200">
                    {viewingCard.headerText || 'OFFICIAL IDENTITY CARD'}
                  </div>
                  <h4 className="font-bold text-sm leading-tight mt-0.5 truncate">Stoofi Public School</h4>
                  <p className="text-[9px] text-zinc-300 truncate">Main Campus, Lahore</p>
                </div>

                {/* Body */}
                <div className="p-3.5 flex flex-col items-center text-center flex-1">
                  {viewingCard.showPhoto && (
                    <div className="w-20 h-20 rounded-full border-2 border-zinc-200 overflow-hidden bg-zinc-100 shadow-xs mb-2 flex items-center justify-center">
                      <User className="w-10 h-10 text-zinc-400" />
                    </div>
                  )}

                  <h5 className="font-bold text-base text-zinc-900 leading-tight">
                    {viewingCard.role === 'Student' ? 'Muhammad Rayyan' : 'Prof. Mudassir Bajwa'}
                  </h5>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-[10px] font-bold rounded-full uppercase">
                    {viewingCard.role}
                  </span>

                  {/* Attributes */}
                  <div className="w-full mt-3 space-y-1 text-[11px] text-left bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/80">
                    {viewingCard.role === 'Student' ? (
                      <>
                        {viewingCard.showAdmissionNo && (
                          <div className="flex justify-between"><span className="text-zinc-500">Adm No:</span><span className="font-bold font-mono">ADM-2026-101</span></div>
                        )}
                        {viewingCard.showClass && (
                          <div className="flex justify-between"><span className="text-zinc-500">Class:</span><span className="font-bold">Class 10 (A)</span></div>
                        )}
                        {viewingCard.showRollNo && (
                          <div className="flex justify-between"><span className="text-zinc-500">Roll No:</span><span className="font-bold font-mono">101</span></div>
                        )}
                        {viewingCard.showFatherName && (
                          <div className="flex justify-between"><span className="text-zinc-500">Father:</span><span className="font-bold">Tariq Mehmood</span></div>
                        )}
                      </>
                    ) : (
                      <>
                        {viewingCard.showDesignation && (
                          <div className="flex justify-between"><span className="text-zinc-500">Designation:</span><span className="font-bold">Senior Faculty</span></div>
                        )}
                        {viewingCard.showDepartment && (
                          <div className="flex justify-between"><span className="text-zinc-500">Department:</span><span className="font-bold">Academics</span></div>
                        )}
                      </>
                    )}
                    {viewingCard.showBloodGroup && (
                      <div className="flex justify-between"><span className="text-zinc-500">Blood Group:</span><span className="font-bold text-rose-600">O+</span></div>
                    )}
                    {viewingCard.showPhone && (
                      <div className="flex justify-between"><span className="text-zinc-500">Emergency:</span><span className="font-bold font-mono">+92 300 1234567</span></div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-zinc-50 px-3 py-1.5 text-[9px] text-zinc-500 flex justify-between items-center border-t border-zinc-200">
                  <span>Session: 2026</span>
                  <span className="font-bold text-zinc-800">{viewingCard.footerText || 'Authorized Seal'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewingCard(null)}
                className="text-xs"
              >
                Close Preview
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
              Are you sure you want to permanently delete the template <strong className="text-zinc-900">&ldquo;{deleteConfirmItem.title}&rdquo;</strong>?
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
