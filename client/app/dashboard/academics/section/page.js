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
  Edit2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  Layers,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function SectionPage() {
  const { user } = useAuth();
  const canManage = !user?.role || ['Super Admin', 'Admin'].includes(user.role);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({ name: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Delete modal state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/section');
      if (res && res.success && Array.isArray(res.data)) {
        setData(res.data);
      } else if (Array.isArray(res)) {
        setData(res);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load sections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const trimmed = formData.name.trim();
    if (!trimmed) {
      setFormError('Section name is required.');
      return false;
    }

    // Check duplicate locally
    const duplicate = data.find(item => 
      item.name.trim().toLowerCase() === trimmed.toLowerCase() && 
      (!isEditing || item._id !== editId)
    );

    if (duplicate) {
      setFormError(`Section "${trimmed}" already exists.`);
      return false;
    }

    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setFormError('');

      if (isEditing) {
        const res = await api.put(`/section/${editId}`, { name: formData.name.trim() });
        if (res && res.success) {
          showToast(res.message || 'Section updated successfully.');
          setData(prev => prev.map(item => item._id === editId ? { ...item, name: formData.name.trim() } : item));
        } else {
          showToast(res?.message || 'Section updated successfully.');
          fetchData();
        }
      } else {
        const res = await api.post('/section', { name: formData.name.trim() });
        if (res && res.success && res.data) {
          showToast(res.message || 'Section added successfully.');
          setData(prev => [res.data, ...prev]);
        } else {
          showToast('Section added successfully.');
          fetchData();
        }
      }

      setFormData({ name: '' });
      setIsEditing(false);
      setEditId(null);
    } catch (err) {
      console.error('Submit section error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save section. Please try again.';
      setFormError(errorMsg);
      showToast(errorMsg, true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name });
    setIsEditing(true);
    setEditId(item._id);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '' });
    setFormError('');
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/section/${deleteConfirmItem._id}`);
      if (res && res.success) {
        showToast('Section deleted successfully.');
        setData(prev => prev.filter(item => item._id !== deleteConfirmItem._id));
      } else {
        showToast(res?.message || 'Section deleted successfully.');
        fetchData();
      }
      setDeleteConfirmItem(null);
    } catch (err) {
      console.error('Delete section error:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to delete section.', true);
    } finally {
      setDeleting(false);
    }
  };

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return data;
    return data.filter(item => item.name?.toLowerCase().includes(q));
  }, [data, searchTerm]);

  const exportData = useMemo(() => {
    return filteredData.map((item, idx) => ({
      '#': idx + 1,
      'Section Name': item.name,
      'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-PK') : '-'
    }));
  }, [filteredData]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.isError 
              ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
          }`}
        >
          {toast.isError ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-zinc-400 hover:text-zinc-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Section</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Manage class divisions and academic sections</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg shadow-2xs">
          <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 text-zinc-400" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Academics</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 text-zinc-400" />
          <span className="text-zinc-950 dark:text-zinc-100 font-semibold">Section</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column: Add / Edit Section Form (Restricted to Authorized Roles) */}
        {canManage && (
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#009966]"></div>
                  <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                    {isEditing ? 'Edit Section' : 'Add Section'}
                  </h2>
                </div>
                {isEditing && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md">
                    Editing
                  </span>
                )}
              </div>
              
              <form className="p-5 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                    Section Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ name: e.target.value });
                      if (formError) setFormError('');
                    }}
                    placeholder="e.g. A, B, Red, Green" 
                    className={`bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50 focus-visible:ring-emerald-600 font-medium ${
                      formError ? 'border-rose-400 focus-visible:ring-rose-400' : ''
                    }`}
                    disabled={submitting}
                  />
                  {formError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formError}</span>
                    </p>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-[#009966] dark:hover:bg-[#008055] text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      isEditing ? 'UPDATE SECTION' : 'ADD SECTION'
                    )}
                  </Button>

                  {isEditing && (
                    <Button 
                      type="button" 
                      onClick={handleCancelEdit} 
                      variant="outline" 
                      disabled={submitting}
                      className="border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs py-2.5 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Right Column: Section List Table */}
        <div className={canManage ? 'xl:col-span-2' : 'xl:col-span-3'}>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs h-full flex flex-col">
            
            {/* Table Header & Search/Export Toolbar */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-100">Section List</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Sections: {data.length}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    placeholder="Search section..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-8 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50 focus-visible:ring-emerald-600 h-9 w-full font-medium text-xs rounded-lg" 
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                
                {/* Export Buttons */}
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                  <Button 
                    onClick={() => exportToCSV(exportData, 'Section_List')} 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer" 
                    title="Download CSV"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    onClick={() => exportToExcel(exportData, 'Section_List')} 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer" 
                    title="Export Excel"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    onClick={() => printData('Section List', exportData)} 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer" 
                    title="Print"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Error State Banner */}
            {error && (
              <div className="m-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
                <Button 
                  onClick={fetchData} 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2.5 text-xs border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Try Again
                </Button>
              </div>
            )}
            
            {/* Table Area */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-zinc-700 dark:text-zinc-300 uppercase bg-zinc-50/80 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Section</th>
                    {canManage && <th className="px-5 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                  {/* Loading State */}
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-4">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-28"></div>
                        </td>
                        {canManage && (
                          <td className="px-5 py-4 text-right">
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16 ml-auto"></div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : filteredData.length === 0 ? (
                    /* Empty State */
                    <tr>
                      <td colSpan={canManage ? 2 : 1} className="px-5 py-14 text-center">
                        <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2 text-zinc-400">
                            <Layers className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                            {searchTerm ? 'No matching sections found' : 'No sections have been added yet.'}
                          </span>
                          <span className="text-zinc-400 text-xs mt-1">
                            {searchTerm 
                              ? `No results for "${searchTerm}". Try a different search term.` 
                              : canManage ? 'Add your first section using the form on the left.' : 'Sections will appear here once added by an administrator.'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    /* Table Rows */
                    filteredData.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-3.5 text-zinc-950 dark:text-zinc-100 font-bold flex items-center gap-2.5">
                          <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-zinc-200 dark:border-zinc-700">
                            {item.name}
                          </span>
                        </td>
                        {canManage && (
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                onClick={() => handleEdit(item)} 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer"
                                title="Edit Section"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                onClick={() => setDeleteConfirmItem(item)} 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md cursor-pointer"
                                title="Delete Section"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/20 flex items-center justify-between text-xs text-zinc-500 font-medium">
              <div>Showing {filteredData.length} of {data.length} {data.length === 1 ? 'section' : 'sections'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">Delete Section</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Are you sure you want to delete <strong className="text-zinc-950 dark:text-zinc-100">Section {deleteConfirmItem.name}</strong>? Any classes associated with this section may need manual reassignment.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={deleting}
                onClick={() => setDeleteConfirmItem(null)}
                className="text-xs border-zinc-300 dark:border-zinc-700"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                disabled={deleting}
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {deleting ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete Section'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
