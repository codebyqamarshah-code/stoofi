'use client';

import React, { useState, useEffect } from 'react';
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
  FileCheck2,
  Clock,
  Award,
  Users,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateDMY } from '@/lib/utils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';
import StudyMaterialNav from '@/components/study/StudyMaterialNav';
import ContentDetailModal from '@/components/study/ContentDetailModal';
import ContentFormModal from '@/components/study/ContentFormModal';
import AssignmentSubmissionsModal from '@/components/study/AssignmentSubmissionsModal';

const DEFAULT_CLASSES = ['BS Psychology', 'BS RIT', 'DPT', 'FSC Dental', 'FSC NURSING', 'FSC OTT'];

export default function AssignmentListPage() {
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [timingFilter, setTimingFilter] = useState('All'); // 'All' | 'Active' | 'PastDue'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dropdown data
  const [classesList, setClassesList] = useState([]);

  // Modals state
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submissionsAssignment, setSubmissionsAssignment] = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/class');
        if (res && res.data) setClassesList(res.data);
      } catch (e) {}
    };
    fetchClasses();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      let url = '/study-material?type=Assignment&limit=100';
      if (classFilter && classFilter !== 'All') url += `&className=${encodeURIComponent(classFilter)}`;
      if (statusFilter && statusFilter !== 'All') url += `&status=${encodeURIComponent(statusFilter)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res && res.success) {
        setAssignments(res.data || []);
        if (res.stats) setStats(res.stats);
      } else {
        showToast(res?.message || 'Failed to load assignments', true);
      }
    } catch (e) {
      console.error('Fetch assignments error:', e);
      showToast('Error connecting to backend database', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [classFilter, statusFilter]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete assignment "${title}"?`)) return;

    try {
      const res = await api.delete(`/study-material/${id}`);
      if (res && res.success) {
        showToast('Assignment removed successfully.');
        fetchAssignments();
      } else {
        showToast(res?.message || 'Delete failed', true);
      }
    } catch (e) {
      showToast(e.message || 'Error deleting assignment', true);
    }
  };

  const handleDownload = async (item) => {
    try {
      if (item._id) {
        await api.post(`/study-material/${item._id}/download`);
        setAssignments(prev => prev.map(a => a._id === item._id ? { ...a, downloadsCount: (a.downloadsCount || 0) + 1 } : a));
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
      showToast('Opening external document...');
    }
  };

  // Filter logic
  const now = new Date();
  const filteredAssignments = assignments.filter(a => {
    // Timing filter
    if (timingFilter === 'Active') {
      if (a.dueDate && new Date(a.dueDate) < now) return false;
    } else if (timingFilter === 'PastDue') {
      if (!a.dueDate || new Date(a.dueDate) >= now) return false;
    }

    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.className?.toLowerCase().includes(q) ||
      a.subject?.toLowerCase().includes(q) ||
      a.fileName?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage) || 1;
  const paginatedAssignments = filteredAssignments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Submissions stats
  const totalSubmissionsCount = assignments.reduce((acc, a) => acc + (a.submissions?.length || 0), 0);
  const gradedSubmissionsCount = assignments.reduce((acc, a) => acc + (a.submissions?.filter(s => s.status === 'Graded').length || 0), 0);

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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Academic Assignments & Coursework</h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage course assignments, track student submission deadlines, and evaluate submitted coursework.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setEditItem(null);
              setIsCreateModalOpen(true);
            }}
            className="bg-[#009966] hover:bg-[#007a52] text-white font-bold text-xs shadow-xs h-9 px-4 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Assignment
          </Button>
          <div className="flex items-center text-sm text-zinc-500 font-medium">
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
            <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
            <span>Study Material</span>
            <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
            <span className="text-[#009966] font-bold">Assignments</span>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <StudyMaterialNav stats={stats} />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Assignments</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#009966]">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {assignments.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
            Published course tasks
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Deadlines</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {assignments.filter(a => !a.dueDate || new Date(a.dueDate) >= now).length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
            Open for student submissions
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Past Due</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {assignments.filter(a => a.dueDate && new Date(a.dueDate) < now).length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
            Deadline expired
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Student Submissions</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {totalSubmissionsCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
            <span className="text-[#009966] font-bold">{gradedSubmissionsCount} graded</span> by faculty
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                Assignment Records ({filteredAssignments.length})
              </h2>
              <button
                onClick={fetchAssignments}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded cursor-pointer"
                title="Refresh"
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
                  className="pl-8 w-full sm:w-[220px] h-8 bg-white border-zinc-300 text-zinc-950 text-xs font-medium"
                />
              </div>

              <TableExportToolbar 
                data={filteredAssignments.map(a => ({
                  Title: a.title,
                  Class: a.className,
                  Section: a.section,
                  Subject: a.subject,
                  Published: formatDateDMY(a.publishDate),
                  Due: a.dueDate ? formatDateDMY(a.dueDate) : 'Open',
                  Marks: a.totalMarks,
                  Submissions: a.submissions?.length || 0,
                  Status: a.status
                }))} 
                fileName="stoofi_assignments"
              />
            </div>
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-100">
            <select 
              value={classFilter}
              onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-800"
            >
              <option value="All">All Academic Programs</option>
              {classesList.length > 0 ? (
                classesList.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)
              ) : (
                DEFAULT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)
              )}
            </select>

            <select 
              value={timingFilter}
              onChange={(e) => { setTimingFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-800"
            >
              <option value="All">All Deadlines</option>
              <option value="Active">Active / Open</option>
              <option value="PastDue">Past Due</option>
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
              Showing {paginatedAssignments.length} of {filteredAssignments.length} assignments
            </span>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="text-[11px] text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3">SL</th>
                <th className="px-4 py-3">Assignment Title</th>
                <th className="px-4 py-3">Class (Section)</th>
                <th className="px-4 py-3">Publish Date</th>
                <th className="px-4 py-3">Submission Due</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Submissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#009966] mb-2" />
                    Loading assignments from database...
                  </td>
                </tr>
              ) : paginatedAssignments.length > 0 ? (
                paginatedAssignments.map((a, i) => {
                  const isPastDue = a.dueDate && new Date(a.dueDate) < now;
                  const subsCount = a.submissions?.length || 0;
                  const gradedCount = a.submissions?.filter(s => s.status === 'Graded').length || 0;

                  return (
                    <tr key={a._id || i} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                      <td className="px-4 py-3.5 text-zinc-600 font-semibold">
                        {(currentPage - 1) * itemsPerPage + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div 
                          onClick={() => setViewItem(a)} 
                          className="font-bold text-zinc-950 hover:text-[#009966] cursor-pointer transition-colors max-w-sm truncate"
                          title={a.title}
                        >
                          {a.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                          {a.subject && <span className="font-semibold text-zinc-700">{a.subject}</span>}
                          {a.fileName && (
                            <span className="font-mono flex items-center gap-1 text-zinc-500">
                              <FileText className="w-3 h-3 text-[#009966]" /> {a.fileName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-900 font-semibold">
                        {a.className} {a.section ? `(${a.section})` : ''}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 font-mono text-[11px]">
                        {formatDateDMY(a.publishDate)}
                      </td>
                      <td className="px-4 py-3.5">
                        {a.dueDate ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-[11px] font-bold ${isPastDue ? 'text-rose-600' : 'text-emerald-700'}`}>
                              {formatDateDMY(a.dueDate)}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              isPastDue ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isPastDue ? 'Past Due' : 'Active'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 font-medium text-[11px]">No deadline</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-zinc-900">
                        {a.totalMarks || 100}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSubmissionsAssignment(a)}
                          className="text-[11px] font-bold text-[#009966] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Users className="w-3 h-3" />
                          <span>{subsCount} {subsCount === 1 ? 'Submission' : 'Submissions'}</span>
                          {gradedCount > 0 && (
                            <span className="text-[10px] text-zinc-500 font-normal">({gradedCount} graded)</span>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          a.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSubmissionsAssignment(a)}
                            className="h-7 text-[10px] font-bold border-emerald-200 text-[#009966] bg-emerald-50 hover:bg-emerald-100 shadow-xs px-2"
                          >
                            Submissions
                          </Button>
                          <button
                            type="button"
                            onClick={() => setViewItem(a)}
                            className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(a)}
                            className="p-1.5 text-[#009966] hover:bg-emerald-50 rounded cursor-pointer"
                            title="Download Assignment File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditItem(a);
                              setIsCreateModalOpen(true);
                            }}
                            className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer"
                            title="Edit Assignment"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(a._id, a.title)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500 font-medium">
                    <div className="max-w-xs mx-auto">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-2 text-zinc-400">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-zinc-900">No Assignments Found</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Click the &quot;+ Create Assignment&quot; button above to create coursework for enrolled students.
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
            Showing {filteredAssignments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredAssignments.length)} of {filteredAssignments.length} entries
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

      {/* View Detail Modal */}
      {viewItem && (
        <ContentDetailModal 
          item={viewItem} 
          onClose={() => setViewItem(null)} 
          onDownloadSuccess={() => fetchAssignments()}
        />
      )}

      {/* Create / Edit Modal */}
      {isCreateModalOpen && (
        <ContentFormModal
          isOpen={isCreateModalOpen}
          editItem={editItem}
          defaultType="Assignment"
          lockType={true}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditItem(null);
          }}
          onSuccess={() => {
            fetchAssignments();
            showToast('Assignment saved successfully!');
          }}
        />
      )}

      {/* Submissions & Grading Modal */}
      {submissionsAssignment && (
        <AssignmentSubmissionsModal
          assignment={submissionsAssignment}
          onClose={() => setSubmissionsAssignment(null)}
          onRefresh={() => fetchAssignments()}
        />
      )}
    </div>
  );
}
