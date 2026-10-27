'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search,
  Download,
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Plus,
  BookOpen,
  FileCheck2,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDMY } from '@/lib/utils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';
import StudyMaterialNav from '@/components/study/StudyMaterialNav';
import ContentDetailModal from '@/components/study/ContentDetailModal';
import ContentFormModal from '@/components/study/ContentFormModal';

const DEFAULT_CLASSES = ['BS Psychology', 'BS RIT', 'DPT', 'FSC Dental', 'FSC NURSING', 'FSC OTT'];
const CATEGORIES = [
  'General', 
  'Lecture Notes', 
  'Lab Manual', 
  'Reading Materials', 
  'Reference Documents', 
  'Forms & Templates', 
  'Practical Guides', 
  'Notices', 
  'Course Outline',
  'Other'
];

export default function UploadContentPage() {
  const fileInputRef = useRef(null);
  
  // Data state
  const [contents, setContents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Left form states
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('Assignment');
  const [category, setCategory] = useState('General');
  const [availAdmin, setAvailAdmin] = useState(false);
  const [availStudent, setAvailStudent] = useState(true);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [version, setVersion] = useState('1.0');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

  // Dropdowns metadata
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState(['All', 'A', 'B', 'C', 'D']);
  const [subjectsList, setSubjectsList] = useState([]);

  // Modals state
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch initial classes and subjects
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [clsRes, subRes] = await Promise.all([
          api.get('/class'),
          api.get('/subject')
        ]);
        if (clsRes && clsRes.data) setClassesList(clsRes.data);
        if (subRes && subRes.data) setSubjectsList(subRes.data);
      } catch (e) {
        console.error('Dropdown fetch failed:', e);
      }
    };
    fetchDropdowns();
  }, []);

  // Update sections when class selection changes
  useEffect(() => {
    if (selectedClass === 'All') {
      setSectionsList(['All', 'A', 'B', 'C', 'D']);
      return;
    }
    const found = classesList.find(c => c.name === selectedClass);
    if (found && Array.isArray(found.sections) && found.sections.length > 0) {
      setSectionsList(['All', ...found.sections]);
    } else {
      setSectionsList(['All', 'A', 'B', 'C', 'D']);
    }
  }, [selectedClass, classesList]);

  // Load content from API
  const fetchContents = async () => {
    try {
      setLoading(true);
      let url = '/study-material?limit=100';
      if (typeFilter && typeFilter !== 'All') url += `&type=${encodeURIComponent(typeFilter)}`;
      if (classFilter && classFilter !== 'All') url += `&className=${encodeURIComponent(classFilter)}`;
      if (statusFilter && statusFilter !== 'All') url += `&status=${encodeURIComponent(statusFilter)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res && res.success) {
        setContents(res.data || []);
        if (res.stats) setStats(res.stats);
      } else {
        showToast(res?.message || 'Failed to load materials', true);
      }
    } catch (e) {
      console.error('Fetch study materials error:', e);
      showToast('Error connecting to backend database', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [typeFilter, classFilter, statusFilter]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileUrl(reader.result);
      };
      reader.readAsDataURL(file);
      showToast(`Selected file: ${file.name}`);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (targetStatus = 'Published') => {
    if (!title.trim()) {
      showToast('Please enter Content Title.', true);
      return;
    }
    if (!contentType) {
      showToast('Please select Content Type.', true);
      return;
    }

    try {
      setSaving(true);
      const availableList = [];
      if (availAdmin) availableList.push('All Admin');
      if (availStudent) availableList.push('Student');
      const availableStr = availableList.length > 0 ? availableList.join(', ') : 'Student';

      const payload = {
        title: title.trim(),
        contentType,
        category,
        description: description.trim(),
        availableFor: availableStr,
        availAdmin,
        availStudent,
        className: selectedClass,
        section: selectedSection,
        subject: subject.trim() || 'General',
        publishDate: date ? new Date(date) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        version: version || '1.0',
        status: targetStatus,
        sourceUrl: sourceUrl.trim(),
        fileUrl,
        fileName: selectedFile ? selectedFile.name : (sourceUrl ? 'External Link' : `${title.replace(/\s+/g, '_')}.pdf`),
        fileType: selectedFile ? selectedFile.name.split('.').pop().toLowerCase() : 'pdf',
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB'
      };

      const res = await api.post('/study-material', payload);
      if (res && res.success) {
        showToast(`${contentType} uploaded & saved successfully!`);
        // Reset form
        setTitle('');
        setDescription('');
        setSourceUrl('');
        setSelectedFile(null);
        setFileUrl('');
        setDueDate('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchContents();
      } else {
        showToast(res?.message || 'Upload failed', true);
      }
    } catch (e) {
      showToast(e.message || 'Error saving study content', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, itemTitle) => {
    if (!confirm(`Are you sure you want to delete "${itemTitle}"?`)) return;

    try {
      const res = await api.delete(`/study-material/${id}`);
      if (res && res.success) {
        showToast('Study material removed.');
        fetchContents();
      } else {
        showToast(res?.message || 'Delete failed', true);
      }
    } catch (e) {
      showToast(e.message || 'Error deleting item', true);
    }
  };

  const handleDownload = async (item) => {
    try {
      if (item._id) {
        await api.post(`/study-material/${item._id}/download`);
        // Update local count
        setContents(prev => prev.map(c => c._id === item._id ? { ...c, downloadsCount: (c.downloadsCount || 0) + 1 } : c));
      }
    } catch (e) {}

    if (item.fileUrl) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName || `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloading: ${item.fileName || item.title}`);
    } else if (item.sourceUrl) {
      window.open(item.sourceUrl, '_blank');
      showToast('Opening external document link...');
    } else {
      showToast('No downloadable file attached', true);
    }
  };

  // Filtered contents
  const filteredContents = contents.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.contentType?.toLowerCase().includes(q) ||
      c.className?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.fileName?.toLowerCase().includes(q)
    );
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredContents.length / itemsPerPage) || 1;
  const paginatedContents = filteredContents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 ${
          toast.isError ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {toast.isError ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-[#009966]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.mp3,.txt" 
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Study Material & Content Repository</h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Centralized academic content management for Pak Royal College students, faculty, and administrators.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span>Study Material</span>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-[#009966] font-bold">Upload Content</span>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <StudyMaterialNav stats={stats} />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Materials</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#009966]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {stats ? stats.totalContents : contents.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1 font-medium">
            <span className="text-[#009966] font-bold">{stats?.totalDrafts || 0} drafts</span> in preparation
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Assignments</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {stats ? stats.totalAssignments : 0}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1 font-medium">
            <span className="text-amber-700 font-bold">{stats?.activeAssignments || 0} active</span> submission deadlines
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Course Syllabi</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {stats ? stats.totalSyllabi : 0}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1 font-medium">
            Covering <span className="text-blue-700 font-bold">{stats?.programsCovered || 0} programs</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Resource Downloads</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {stats ? stats.totalDownloadEvents : 0}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1 font-medium">
            Across <span className="text-purple-700 font-bold">{stats?.totalDownloads || 0} downloadable files</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Upload Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs sticky top-20">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#009966]" /> Upload Study Content
              </h2>
              <span className="text-[10px] bg-emerald-50 text-[#009966] border border-emerald-200 px-2 py-0.5 rounded font-bold">
                MongoDB Live
              </span>
            </div>
            
            <form className="p-5 space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit('Published'); }}>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Content Title <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  placeholder="e.g. Anatomy & Physiology Practical Manual" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-950 text-xs font-medium" 
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Type <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 font-medium"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Other Download">Other Download</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Category</Label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 font-medium"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class / Program</Label>
                  <select 
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 font-medium"
                  >
                    <option value="All">All Programs</option>
                    {classesList.length > 0 ? (
                      classesList.map(c => (
                        <option key={c._id || c.name} value={c.name}>{c.name}</option>
                      ))
                    ) : (
                      DEFAULT_CLASSES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section</Label>
                  <select 
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-950 font-medium"
                  >
                    {sectionsList.map(s => (
                      <option key={s} value={s}>{s === 'All' ? 'All Sections' : `Section ${s}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject & Dates */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Subject Area</Label>
                <Input 
                  placeholder="e.g. Clinical Psychology"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white border-zinc-300 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Publish Date</Label>
                  <Input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-white border-zinc-300 text-xs font-medium" 
                  />
                </div>

                {contentType === 'Assignment' ? (
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Due Date</Label>
                    <Input 
                      type="date" 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-white border-zinc-300 text-xs font-medium" 
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Version</Label>
                    <Input 
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="e.g. 1.0"
                      className="bg-white border-zinc-300 text-xs font-medium" 
                    />
                  </div>
                )}
              </div>

              {/* Available For */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Available For</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={availAdmin}
                      onChange={(e) => setAvailAdmin(e.target.checked)}
                      className="rounded border-zinc-300 text-[#009966] focus:ring-[#009966] cursor-pointer h-4 w-4" 
                    />
                    <span className="text-xs text-zinc-800 font-medium">All Admin</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={availStudent}
                      onChange={(e) => setAvailStudent(e.target.checked)}
                      className="rounded border-zinc-300 text-[#009966] focus:ring-[#009966] cursor-pointer h-4 w-4" 
                    />
                    <span className="text-xs text-zinc-800 font-medium">Enrolled Students</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Description</Label>
                <textarea 
                  placeholder="Instructions for students and clinical preceptors..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium" 
                />
              </div>

              {/* Source URL */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Source URL <span className="text-zinc-400 font-normal lowercase">(Optional)</span>
                </Label>
                <Input 
                  placeholder="https://drive.google.com/..." 
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="bg-white border-zinc-300 text-xs font-medium" 
                />
              </div>

              {/* File Attachment */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Attach Document</Label>
                <div className="flex items-center gap-2">
                  <div 
                    onClick={handleBrowseClick}
                    className="flex-1 bg-zinc-50 border border-zinc-300 rounded-md px-3 py-2 text-xs text-zinc-950 font-medium cursor-pointer truncate hover:border-zinc-400"
                  >
                    {selectedFile ? (
                      <span className="font-bold text-[#009966] flex items-center gap-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    ) : (
                      <span className="text-zinc-400">Click to browse file</span>
                    )}
                  </div>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileUrl('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleBrowseClick}
                    className="bg-[#009966] hover:bg-[#007a52] text-white font-bold shrink-0 text-xs shadow-xs cursor-pointer h-9 px-3"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" /> Browse
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => handleSubmit('Draft')}
                  className="flex-1 border-zinc-300 text-zinc-800 font-bold text-xs h-9"
                >
                  Save Draft
                </Button>
                <Button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#009966] hover:bg-[#007a52] text-white font-bold text-xs shadow-xs h-9 uppercase tracking-wider"
                >
                  {saving ? 'Uploading...' : 'Upload & Publish'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Repository Data Table */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
            {/* Header Controls */}
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                    Study Material Repository ({filteredContents.length})
                  </h2>
                  <button
                    onClick={fetchContents}
                    className="p-1 text-zinc-400 hover:text-zinc-700 rounded cursor-pointer"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#009966]' : ''}`} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <Input 
                      placeholder="Quick Search..." 
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                      className="pl-8 w-full sm:w-[200px] h-8 bg-white border-zinc-300 text-zinc-950 text-xs font-medium"
                    />
                  </div>
                  <TableExportToolbar 
                    data={filteredContents.map(c => ({
                      Title: c.title,
                      Type: c.contentType,
                      Class: c.className,
                      Section: c.section,
                      Subject: c.subject,
                      Date: formatDateDMY(c.publishDate),
                      Status: c.status,
                      AvailableFor: c.availableFor,
                      Downloads: c.downloadsCount || 0
                    }))} 
                    fileName="stoofi_study_materials"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-100">
                <select 
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                  className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-800"
                >
                  <option value="All">All Types</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Other Download">Other Download</option>
                </select>

                <select 
                  value={classFilter}
                  onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
                  className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-800"
                >
                  <option value="All">All Classes</option>
                  {classesList.length > 0 ? (
                    classesList.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)
                  ) : (
                    DEFAULT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)
                  )}
                </select>

                <select 
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-800"
                >
                  <option value="All">All Statuses</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>

                <span className="text-[11px] text-zinc-400 font-medium ml-auto">
                  Showing {paginatedContents.length} of {filteredContents.length} records
                </span>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="text-[11px] text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Content Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Class (Sec)</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-zinc-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#009966] mb-2" />
                        Loading study materials from database...
                      </td>
                    </tr>
                  ) : paginatedContents.length > 0 ? (
                    paginatedContents.map((c, i) => (
                      <tr key={c._id || i} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                        <td className="px-4 py-3.5 text-zinc-600 font-semibold">
                          {(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-zinc-950 hover:text-[#009966] cursor-pointer transition-colors" onClick={() => setViewItem(c)}>
                            {c.title}
                          </div>
                          <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                            {c.fileName && (
                              <span className="font-mono flex items-center gap-1">
                                <FileText className="w-3 h-3 text-[#009966]" /> {c.fileName}
                              </span>
                            )}
                            {c.category && c.category !== 'General' && (
                              <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded text-[9px] font-semibold">
                                {c.category}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            c.contentType === 'Assignment' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            c.contentType === 'Syllabus' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {c.contentType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-900 font-semibold">
                          {c.className} {c.section ? `(${c.section})` : ''}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600 font-mono text-[11px]">
                          {formatDateDMY(c.publishDate)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setViewItem(c)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(c)}
                              className="p-1.5 text-[#009966] hover:bg-emerald-50 rounded cursor-pointer"
                              title="Download document"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditItem(c);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c._id, c.title)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-zinc-500 font-medium">
                        <div className="max-w-xs mx-auto">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-2 text-zinc-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-zinc-900">No Data Available In Table</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Try clearing your search query or upload a new study document on the left.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium">
              <div>
                Showing {filteredContents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredContents.length)} of {filteredContents.length} entries
              </div>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className="h-7 px-2.5 text-xs text-zinc-700 border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-40"
                >
                  Previous
                </Button>
                <span className="px-2 text-zinc-700 font-bold">
                  {currentPage} / {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-7 px-2.5 text-xs text-zinc-700 border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-40"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Detail Modal */}
      {viewItem && (
        <ContentDetailModal 
          item={viewItem} 
          onClose={() => setViewItem(null)} 
          onDownloadSuccess={() => fetchContents()}
        />
      )}

      {/* Edit Content Modal */}
      {isEditModalOpen && (
        <ContentFormModal
          isOpen={isEditModalOpen}
          editItem={editItem}
          defaultType={editItem?.contentType || 'Assignment'}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditItem(null);
          }}
          onSuccess={() => {
            fetchContents();
            showToast('Changes saved successfully!');
          }}
        />
      )}
    </div>
  );
}
