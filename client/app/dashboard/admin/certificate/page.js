'use client';

import Link from 'next/link';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Award,
  FileText,
  Download,
  Printer,
  FileCheck,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Layers,
  Sparkles,
  ExternalLink,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

const CERT_TYPE_OPTIONS = [
  'Character Certificate',
  'Transfer Certificate',
  'Bonafide Certificate',
  'Academic Excellence / Merit',
  'Sports & Extracurricular',
  'Appreciation Certificate',
  'Leaving Certificate',
  'Custom Certificate'
];

const THEME_STYLES = [
  { id: 'stoofi-emerald', label: 'Stoofi Emerald', border: 'border-emerald-700', bg: 'bg-emerald-50/50', accent: 'text-emerald-800' },
  { id: 'classic-gold', label: 'Classic Gold / Amber', border: 'border-amber-600', bg: 'bg-amber-50/50', accent: 'text-amber-800' },
  { id: 'academic-navy', label: 'Academic Navy', border: 'border-sky-900', bg: 'bg-sky-50/40', accent: 'text-sky-950' },
  { id: 'modern-slate', label: 'Modern Slate', border: 'border-zinc-800', bg: 'bg-zinc-50/50', accent: 'text-zinc-900' }
];

const PLACEHOLDER_TAGS = [
  { tag: '[student_name]', label: 'Student Name' },
  { tag: '[father_name]', label: 'Father Name' },
  { tag: '[admission_no]', label: 'Admission No' },
  { tag: '[roll_no]', label: 'Roll No' },
  { tag: '[class_name]', label: 'Class' },
  { tag: '[section]', label: 'Section' },
  { tag: '[academic_session]', label: 'Academic Year' },
  { tag: '[dob]', label: 'Date of Birth' },
  { tag: '[gender]', label: 'Gender' },
  { tag: '[school_name]', label: 'School Name' },
  { tag: '[school_address]', label: 'School Address' },
  { tag: '[certificate_date]', label: 'Issue Date' },
  { tag: '[tc_no]', label: 'TC / Cert No' }
];

const SAMPLE_REPLACEMENTS = {
  '[student_name]': 'Muhammad Rayyan',
  '[father_name]': 'Tariq Mehmood',
  '[mother_name]': 'Sobia Tariq',
  '[guardian_name]': 'Tariq Mehmood',
  '[admission_no]': 'ADM-2026-101',
  '[roll_no]': '101',
  '[class_name]': 'Class 10',
  '[section]': 'A',
  '[academic_session]': '2026 [Jan-Dec]',
  '[academic_year]': '2026 [Jan-Dec]',
  '[dob]': '15 August 2010',
  '[gender]': 'Male',
  '[school_name]': 'Stoofi Public School & College',
  '[school_address]': 'Main Campus, Lahore, Pakistan',
  '[school_phone]': '+92 300 1234567',
  '[certificate_date]': new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  '[issue_date]': new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  '[tc_no]': 'TC-2026-084'
};

export default function CertificatePage() {
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalTypes: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Search, Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewingCert, setViewingCert] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    type: 'Character Certificate',
    description: '',
    headerTitle: '',
    headerSubtitle: 'TO WHOM IT MAY CONCERN',
    templateBody: 'This is to certify that [student_name], Son/Daughter of [father_name], bearing Admission No [admission_no] and Roll No [roll_no], is/was a bona fide student of Class [class_name] (Section [section]) in this institution for the Academic Session [academic_session]. During their stay, their conduct and academic character were exemplary. We wish them success in all future endeavors.',
    footerLeft: 'Date of Issue',
    footerCenter: 'Class Teacher / Checked By',
    footerRight: 'Principal / Authorized Seal',
    themeStyle: 'stoofi-emerald',
    status: 'Active'
  });

  const textareaRef = useRef(null);

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
        type: typeFilter !== 'All' ? typeFilter : '',
        status: statusFilter !== 'All' ? statusFilter : ''
      });

      const [res, statsRes] = await Promise.all([
        api.get(`/certificate?${queryParams.toString()}`),
        api.get('/certificate/stats').catch(() => null)
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
      console.error('Error fetching certificates:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch certificate templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, typeFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const insertPlaceholder = (tag) => {
    if (!textareaRef.current) {
      setFormData(prev => ({ ...prev, templateBody: prev.templateBody + ' ' + tag }));
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = formData.templateBody || '';
    const updated = current.substring(0, start) + tag + current.substring(end);
    setFormData(prev => ({ ...prev, templateBody: updated }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      type: 'Character Certificate',
      description: '',
      headerTitle: '',
      headerSubtitle: 'TO WHOM IT MAY CONCERN',
      templateBody: 'This is to certify that [student_name], Son/Daughter of [father_name], bearing Admission No [admission_no] and Roll No [roll_no], is/was a bona fide student of Class [class_name] (Section [section]) in this institution for the Academic Session [academic_session]. During their stay, their conduct and academic character were exemplary. We wish them all success in their future endeavors.',
      footerLeft: 'Date of Issue',
      footerCenter: 'Class Teacher / Checked By',
      footerRight: 'Principal / Authorized Seal',
      themeStyle: 'stoofi-emerald',
      status: 'Active'
    });
    setShowFormModal(true);
  };

  const handleEdit = (cert) => {
    setEditingId(cert._id);
    setFormData({
      title: cert.title || '',
      type: cert.type || 'Transfer Certificate',
      description: cert.description || '',
      headerTitle: cert.headerTitle || '',
      headerSubtitle: cert.headerSubtitle || 'TO WHOM IT MAY CONCERN',
      templateBody: cert.templateBody || '',
      footerLeft: cert.footerLeft || 'Date of Issue',
      footerCenter: cert.footerCenter || 'Class Teacher / Checked By',
      footerRight: cert.footerRight || 'Principal / Authorized Seal',
      themeStyle: cert.themeStyle || 'stoofi-emerald',
      status: cert.status || 'Active'
    });
    setShowFormModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Certificate title is required.', true);
      return;
    }
    if (!formData.type.trim()) {
      showToast('Certificate type is required.', true);
      return;
    }
    if (!formData.templateBody.trim()) {
      showToast('Certificate template content is required.', true);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        type: formData.type.trim(),
        description: formData.description.trim(),
        headerTitle: formData.headerTitle.trim() || formData.title.trim().toUpperCase(),
        headerSubtitle: formData.headerSubtitle.trim(),
        templateBody: formData.templateBody.trim(),
        footerLeft: formData.footerLeft.trim(),
        footerCenter: formData.footerCenter.trim(),
        footerRight: formData.footerRight.trim(),
        themeStyle: formData.themeStyle,
        status: formData.status
      };

      if (editingId) {
        const res = await api.put(`/certificate/${editingId}`, payload);
        if (res?.success) {
          showToast('Certificate template updated successfully!');
          fetchData();
        }
      } else {
        const res = await api.post('/certificate', payload);
        if (res?.success) {
          showToast('Certificate template created successfully!');
          fetchData();
        }
      }

      setShowFormModal(false);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save certificate template:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save certificate template.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cert) => {
    try {
      const res = await api.patch(`/certificate/${cert._id}/status`);
      if (res?.success) {
        setCards(prev => prev.map(c => c._id === cert._id ? { ...c, status: res.data.status } : c));
        showToast(res.message || `Status updated to ${res.data.status}`);
        // Refresh stats
        const statsRes = await api.get('/certificate/stats').catch(() => null);
        if (statsRes?.success) setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast(err?.response?.data?.message || 'Failed to update status.', true);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await api.delete(`/certificate/${deleteConfirmItem._id}`);
      if (res?.success) {
        showToast('Certificate template deleted successfully.');
        setDeleteConfirmItem(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete certificate template:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to delete certificate template.', true);
    }
  };

  const handleExport = (type) => {
    if (cards.length === 0) {
      showToast('No templates available to export.', true);
      return;
    }

    const exportData = cards.map((item, index) => ({
      'SL': (page - 1) * 10 + index + 1,
      'Certificate Title': item.title,
      'Type': item.type,
      'Status': item.status,
      'Theme Style': item.themeStyle,
      'Updated Date': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : '-'
    }));

    const headers = Object.keys(exportData[0] || {});
    const filename = `Certificate_Templates_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi Institutional Certificate Templates');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV export downloaded successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'Certificates');
      showToast('Excel export downloaded successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Stoofi Certificate Templates', filename);
      showToast('PDF export downloaded successfully!');
    }
  };

  // Helper to render preview template with sample replacements
  const renderSamplePreviewText = (text) => {
    if (!text) return '';
    let result = text;
    Object.keys(SAMPLE_REPLACEMENTS).forEach(tag => {
      result = result.split(tag).join(SAMPLE_REPLACEMENTS[tag]);
    });
    return result;
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
            <Award className="w-6 h-6 text-zinc-900" />
            Certificate Templates
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure institutional certificate formats, dynamic student tags, and layout themes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/dashboard/admin/generate-certificate"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-900 bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Generate Certificates
          </Link>
          <div className="hidden md:flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg">
            <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-700 transition-colors">Admin Section</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-semibold">Certificate</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Templates</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{stats.total}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Configured certificate designs</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{stats.active}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Available for generation</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Inactive</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-700 mt-2">{stats.inactive}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Archived / Hidden</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Categories</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{stats.totalTypes || 6}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Distinct certificate types</p>
        </div>
      </div>

      {/* Main List & Table Container */}
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
              CREATE TEMPLATE
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

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium shrink-0 cursor-pointer shadow-2xs"
            >
              <option value="All">All Types</option>
              {CERT_TYPE_OPTIONS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
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
              <button onClick={() => handleExport('Excel')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1" title="Excel">
                <Download className="h-3.5 w-3.5 text-emerald-600" />
              </button>
              <button onClick={() => handleExport('CSV')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1" title="CSV">
                <FileCheck className="h-3.5 w-3.5 text-blue-600" />
              </button>
              <button onClick={() => handleExport('PDF')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1" title="PDF">
                <Download className="h-3.5 w-3.5 text-rose-600" />
              </button>
              <button onClick={() => handleExport('Print')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors text-xs font-medium flex items-center gap-1" title="Print">
                <Printer className="h-3.5 w-3.5 text-zinc-700" />
              </button>
            </div>

            {/* Refresh */}
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-zinc-600 border border-zinc-200 bg-white shadow-2xs hover:bg-zinc-50 rounded-lg shrink-0 transition-colors"
              title="Refresh data"
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
              <p className="text-xs text-zinc-500">Loading certificate templates...</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold bg-zinc-50/80 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">SL</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
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
                    const isEmerald = c.themeStyle === 'stoofi-emerald';
                    const isGold = c.themeStyle === 'classic-gold';
                    const isNavy = c.themeStyle === 'academic-navy';

                    return (
                      <tr key={c._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-center text-zinc-500 font-mono">{slNo}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-zinc-950 text-sm">{c.title}</div>
                          {c.description && (
                            <div className="text-[11px] text-zinc-500 truncate max-w-sm mt-0.5">
                              {c.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                            isEmerald ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            isGold ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            isNavy ? 'bg-sky-50 text-sky-900 border-sky-200' :
                            'bg-zinc-100 text-zinc-800 border-zinc-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isEmerald ? 'bg-emerald-600' :
                              isGold ? 'bg-amber-600' :
                              isNavy ? 'bg-sky-700' : 'bg-zinc-700'
                            }`} />
                            {THEME_STYLES.find(t => t.id === c.themeStyle)?.label || c.themeStyle || 'Stoofi Emerald'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                              c.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-600' : 'bg-zinc-400'}`} />
                            {c.status || 'Active'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-500">
                          {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              onClick={() => setViewingCert(c)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                              title="View & Preview"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Link
                              href={`/dashboard/admin/generate-certificate?templateId=${c._id}`}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-md text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
                              title="Generate certificate with this template"
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
                        <Award className="w-10 h-10 text-zinc-300" />
                        <p className="font-semibold text-zinc-800 text-sm">No Certificate Templates Found</p>
                        <p className="text-xs text-zinc-400 max-w-sm">
                          {searchQuery || typeFilter !== 'All' || statusFilter !== 'All'
                            ? 'No templates match your selected search or filter criteria.' 
                            : 'Create your first certificate design template to start generating institutional student certificates.'}
                        </p>
                        {!searchQuery && typeFilter === 'All' && statusFilter === 'All' && (
                          <Button 
                            onClick={handleOpenCreate} 
                            size="sm" 
                            className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs mt-2"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Create Certificate Template
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

        {/* Pagination Footer */}
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

      {/* CREATE / EDIT TEMPLATE MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-3xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/70 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h2 className="text-base font-bold text-zinc-950">
                  {editingId ? 'Edit Certificate Template' : 'Create Certificate Template'}
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

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Certificate Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                    placeholder="e.g. Character & Conduct Certificate" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                    required 
                  />
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Certificate Type <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({ ...formData, type: e.target.value })} 
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900" 
                    required
                  >
                    {CERT_TYPE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Description / Purpose
                  </Label>
                  <Input 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    placeholder="Brief description of this certificate's intent (e.g. For student transfer to another board)" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                  />
                </div>

                {/* Header Title Override */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Printed Header Title
                  </Label>
                  <Input 
                    value={formData.headerTitle} 
                    onChange={e => setFormData({ ...formData, headerTitle: e.target.value })} 
                    placeholder="e.g. CHARACTER & CONDUCT CERTIFICATE (Leave blank to use Title)" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs font-mono uppercase" 
                  />
                </div>

                {/* Header Subtitle */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Header Subtitle / Ribbon Text
                  </Label>
                  <Input 
                    value={formData.headerSubtitle} 
                    onChange={e => setFormData({ ...formData, headerSubtitle: e.target.value })} 
                    placeholder="e.g. TO WHOM IT MAY CONCERN / FOR SCHOLASTIC EXCELLENCE" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs uppercase" 
                  />
                </div>

                {/* Theme Style */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Border & Style Theme
                  </Label>
                  <select 
                    value={formData.themeStyle} 
                    onChange={e => setFormData({ ...formData, themeStyle: e.target.value })} 
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900" 
                  >
                    {THEME_STYLES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Template Status
                  </Label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({ ...formData, status: e.target.value })} 
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900" 
                  >
                    <option value="Active">Active (Available for generation)</option>
                    <option value="Inactive">Inactive (Hidden from generator)</option>
                  </select>
                </div>
              </div>

              {/* Template Body with Interactive Tags */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Certificate Body / Content <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-[11px] text-zinc-400">
                    Click tags below to insert student data placeholders
                  </span>
                </div>

                {/* Interactive Placeholder Tag Toolbar */}
                <div className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {PLACEHOLDER_TAGS.map(item => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => insertPlaceholder(item.tag)}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-zinc-200 text-[11px] font-mono font-medium text-zinc-700 transition-colors shadow-2xs"
                      title={`Insert ${item.label}`}
                    >
                      + {item.tag}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={textareaRef}
                  value={formData.templateBody}
                  onChange={e => setFormData({ ...formData, templateBody: e.target.value })}
                  placeholder="Enter the official certificate wording with placeholders..."
                  className="w-full min-h-[120px] rounded-lg border border-zinc-300 bg-white p-3 text-xs text-zinc-950 leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-900 font-sans"
                  required
                />
              </div>

              {/* Footer Signatories Configuration */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                  Signatory & Footer Labels
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-zinc-500">Left Column Label</span>
                    <Input 
                      value={formData.footerLeft} 
                      onChange={e => setFormData({ ...formData, footerLeft: e.target.value })} 
                      placeholder="e.g. Date of Issue / Prepared By" 
                      className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-zinc-500">Center Column Label</span>
                    <Input 
                      value={formData.footerCenter} 
                      onChange={e => setFormData({ ...formData, footerCenter: e.target.value })} 
                      placeholder="e.g. Class Teacher / Checked By" 
                      className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-zinc-500">Right Column Label</span>
                    <Input 
                      value={formData.footerRight} 
                      onChange={e => setFormData({ ...formData, footerRight: e.target.value })} 
                      placeholder="e.g. Principal / Authorized Seal" 
                      className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
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
                    editingId ? 'UPDATE TEMPLATE' : 'SAVE TEMPLATE'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & PREVIEW MODAL */}
      {viewingCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-4xl w-full my-6 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/70 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700" />
                <div>
                  <h2 className="text-base font-bold text-zinc-950">{viewingCert.title}</h2>
                  <p className="text-[11px] text-zinc-500">Live preview with institutional student sample mapping</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/admin/generate-certificate?templateId=${viewingCert._id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-semibold shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Generate Now
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewingCert(null)} 
                  className="text-zinc-400 hover:text-zinc-700 h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content & Preview */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-zinc-100/60">
              {/* Certificate Canvas Mock */}
              <div className={`bg-white rounded-xl shadow-md border-8 border-double p-8 sm:p-12 max-w-3xl mx-auto relative ${
                viewingCert.themeStyle === 'stoofi-emerald' ? 'border-emerald-700/80 text-zinc-900' :
                viewingCert.themeStyle === 'classic-gold' ? 'border-amber-600/80 text-zinc-900' :
                viewingCert.themeStyle === 'academic-navy' ? 'border-sky-950/80 text-zinc-900' :
                'border-zinc-800/80 text-zinc-900'
              }`}>
                {/* Decorative Stars */}
                <div className="absolute top-3 left-3 text-[10px] font-serif text-zinc-400 tracking-widest">★ ★ ★</div>
                <div className="absolute top-3 right-3 text-[10px] font-serif text-zinc-400 tracking-widest">★ ★ ★</div>
                <div className="absolute bottom-3 left-3 text-[10px] font-serif text-zinc-400 tracking-widest">★ ★ ★</div>
                <div className="absolute bottom-3 right-3 text-[10px] font-serif text-zinc-400 tracking-widest">★ ★ ★</div>

                {/* Institutional Header */}
                <div className="text-center border-b pb-5 mb-6 border-zinc-200">
                  <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide font-serif text-zinc-950">
                    Stoofi Public School & College
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Main Campus, Lahore, Pakistan • Ph: +92 300 1234567 • info@stoofi.com
                  </p>
                  <div className={`inline-block mt-3 px-5 py-1 rounded-full border ${
                    viewingCert.themeStyle === 'stoofi-emerald' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
                    viewingCert.themeStyle === 'classic-gold' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                    viewingCert.themeStyle === 'academic-navy' ? 'bg-sky-50 text-sky-950 border-sky-300' :
                    'bg-zinc-100 text-zinc-900 border-zinc-300'
                  }`}>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest font-serif">
                      {viewingCert.headerTitle || viewingCert.title}
                    </span>
                  </div>
                  {viewingCert.headerSubtitle && (
                    <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mt-1.5 font-serif">
                      {viewingCert.headerSubtitle}
                    </div>
                  )}
                </div>

                {/* Certificate Text Body */}
                <div className="text-center space-y-4 text-sm sm:text-base text-zinc-800 leading-relaxed font-serif px-2 sm:px-6">
                  <p className="whitespace-pre-line">
                    {renderSamplePreviewText(viewingCert.templateBody)}
                  </p>
                </div>

                {/* Signatures & Footer */}
                <div className="mt-14 pt-6 border-t border-zinc-200 grid grid-cols-3 text-center font-serif text-xs">
                  <div>
                    <p className="font-bold text-zinc-900">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="text-[10px] text-zinc-500 uppercase mt-1 border-t border-zinc-300 pt-1">
                      {viewingCert.footerLeft || 'Date of Issue'}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-zinc-900">Checked By</p>
                    <p className="text-[10px] text-zinc-500 uppercase mt-1 border-t border-zinc-300 pt-1">
                      {viewingCert.footerCenter || 'Class Teacher'}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-zinc-900">Authorized Signature</p>
                    <p className="text-[10px] text-zinc-500 uppercase mt-1 border-t border-zinc-300 pt-1">
                      {viewingCert.footerRight || 'Principal'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50/70 flex justify-end gap-2 shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewingCert(null)}
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
