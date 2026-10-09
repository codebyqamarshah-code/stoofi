'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search,
  Download,
  Printer,
  FileText,
  Trash2,
  Edit,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function OptionalSubjectPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state matching screenshot
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch optional subjects
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/subject');
      if (res?.success && Array.isArray(res.data)) {
        // Filter subjects that are optional or have category Optional / Elective / Additional
        const optSubjects = res.data.filter(s => 
          s.isOptional === true || 
          s.category === 'Optional / Elective' || 
          s.category === 'Optional' || 
          s.category === 'Additional'
        );
        // If no subjects are specifically flagged optional, show all or filtered
        setSubjects(optSubjects.length > 0 ? optSubjects : res.data);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error('Failed to load optional subjects:', error);
      showToast('Failed to load optional subjects.', true);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Subject Name is required.', true);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        category: 'Optional / Elective',
        type: 'Theory',
        isOptional: true
      };

      if (isEditing && editId) {
        const res = await api.put(`/subject/${editId}`, payload);
        if (res?.success) {
          showToast('Optional subject updated successfully!');
          resetForm();
          fetchData();
        } else {
          showToast(res?.message || 'Failed to update subject.', true);
        }
      } else {
        const res = await api.post('/subject', payload);
        if (res?.success) {
          showToast('Optional subject saved successfully!');
          resetForm();
          fetchData();
        } else {
          showToast(res?.message || 'Failed to save subject.', true);
        }
      }
    } catch (err) {
      console.error('Error saving subject:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save subject.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '' });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (sub) => {
    setFormData({
      name: sub.name || '',
      code: sub.code || ''
    });
    setIsEditing(true);
    setEditId(sub._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await api.delete(`/subject/${deleteConfirmItem._id}`);
      if (res?.success) {
        showToast('Optional subject deleted successfully!');
        setDeleteConfirmItem(null);
        fetchData();
      } else {
        showToast(res?.message || 'Failed to delete subject.', true);
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to delete subject.', true);
    }
  };

  // Filtered & Paginated records
  const filteredSubjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return subjects;
    return subjects.filter(s => 
      (s.name || '').toLowerCase().includes(term) || 
      (s.code || '').toLowerCase().includes(term)
    );
  }, [subjects, searchTerm]);

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSubjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubjects, currentPage, itemsPerPage]);

  const handleExport = (type) => {
    if (filteredSubjects.length === 0) {
      showToast('No subjects available to export.', true);
      return;
    }

    const exportData = filteredSubjects.map((s, idx) => ({
      'SL': idx + 1,
      'SUBJECT NAME': s.name,
      'SUBJECT CODE': s.code || '-'
    }));

    const headers = ['SL', 'SUBJECT NAME', 'SUBJECT CODE'];
    const filename = `Optional_Subjects_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi Optional Subject List');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV exported successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'OptionalSubjects');
      showToast('Excel exported successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Stoofi Optional Subject List', filename);
      showToast('PDF exported successfully!');
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
          <h1 className="text-2xl font-bold text-zinc-950">Optional Subject</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Define elective course subjects and subject codes for student selection</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-700 transition-colors">Academics</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-semibold">Optional Subject</span>
        </div>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Panel: Add / Edit Optional Subject */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950">
                {isEditing ? 'Edit Optional Subject' : 'Add Optional Subject'}
              </h2>
              {isEditing && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                  Editing
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Subject Name Field */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  SUBJECT NAME <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Subject Name"
                  className="bg-white border-zinc-300 text-zinc-950 text-sm font-medium focus-visible:ring-1 focus-visible:ring-zinc-900 h-10 rounded-lg"
                  required
                />
              </div>

              {/* Subject Code Field */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  SUBJECT CODE
                </Label>
                <Input 
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Subject Code"
                  className="bg-white border-zinc-300 text-zinc-950 text-sm font-medium focus-visible:ring-1 focus-visible:ring-zinc-900 h-10 rounded-lg"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-[#084A86] hover:bg-[#073d6e] text-white font-bold text-xs uppercase tracking-wider h-10 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  {submitting ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    isEditing ? 'UPDATE SUBJECT' : 'SAVE SUBJECT'
                  )}
                </Button>

                {isEditing && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={resetForm}
                    className="w-full sm:w-auto border-zinc-300 text-zinc-700 font-semibold text-xs h-10 rounded-lg"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel: Optional Subject List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
            
            {/* List Header & Search/Export Toolbar */}
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">Optional Subject List</h2>
                <p className="text-[11px] text-zinc-500">List of all active elective subjects</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="SEARCH"
                    className="pl-8 pr-7 h-8 text-xs font-semibold uppercase bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-900 rounded-lg"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Export Buttons */}
                <div className="flex items-center border border-zinc-200 rounded-lg bg-white shadow-2xs overflow-hidden">
                  <button 
                    onClick={() => handleExport('CSV')} 
                    className="p-1.5 hover:bg-zinc-100 text-zinc-600 border-r border-zinc-200 transition-colors" 
                    title="Export CSV"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => handleExport('Excel')} 
                    className="p-1.5 hover:bg-zinc-100 text-zinc-600 border-r border-zinc-200 transition-colors" 
                    title="Export Excel"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => handleExport('Print')} 
                    className="p-1.5 hover:bg-zinc-100 text-zinc-600 transition-colors" 
                    title="Print"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3 w-14">SL</th>
                    <th className="px-4 py-3">SUBJECT NAME</th>
                    <th className="px-4 py-3">SUBJECT CODE</th>
                    <th className="px-4 py-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-zinc-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                          <span>Loading subjects...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-14 text-center text-zinc-500">
                        <div className="flex flex-col items-center justify-center">
                          <BookOpen className="w-7 h-7 text-zinc-300 mb-1.5" />
                          <span className="font-semibold text-zinc-600">No Data Available In Table</span>
                          {searchTerm && (
                            <span className="text-[11px] text-zinc-400 mt-0.5">
                              No results found for &quot;{searchTerm}&quot;
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, index) => {
                      const sl = (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <tr 
                          key={item._id} 
                          className="hover:bg-zinc-50/80 transition-colors text-zinc-950 group"
                        >
                          <td className="px-4 py-3 text-zinc-500 font-mono text-[11px]">
                            {sl}
                          </td>
                          <td className="px-4 py-3 font-semibold text-zinc-950">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 font-mono text-[11px]">
                            {item.code || '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                onClick={() => handleEdit(item)} 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md"
                                title="Edit Subject"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                onClick={() => setDeleteConfirmItem(item)} 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                                title="Delete Subject"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-3.5 border-t border-zinc-100 bg-zinc-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500 font-medium">
              <div>
                Showing {filteredSubjects.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSubjects.length)} of {filteredSubjects.length} entries
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2 text-xs border-zinc-200"
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-zinc-700 font-semibold text-xs">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-7 px-2 text-xs border-zinc-200"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-950">Delete Optional Subject</h3>
                <p className="text-xs text-zinc-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              Are you sure you want to permanently delete the optional subject <strong className="text-zinc-950">&ldquo;{deleteConfirmItem.name}&rdquo;</strong>?
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
                Delete Subject
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
