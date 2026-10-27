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
  Layers,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateDMY } from '@/lib/utils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';
import StudyMaterialNav from '@/components/study/StudyMaterialNav';
import ContentDetailModal from '@/components/study/ContentDetailModal';
import ContentFormModal from '@/components/study/ContentFormModal';

const CATEGORIES = [
  'All',
  'Reference Documents', 
  'Forms & Templates', 
  'Practical Guides', 
  'Notices', 
  'Reading Materials',
  'Lecture Notes',
  'Other'
];

export default function OtherDownloadsListPage() {
  const [downloads, setDownloads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      let url = '/study-material?type=Other%20Download&limit=100';
      if (categoryFilter && categoryFilter !== 'All') url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (statusFilter && statusFilter !== 'All') url += `&status=${encodeURIComponent(statusFilter)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res && res.success) {
        setDownloads(res.data || []);
        if (res.stats) setStats(res.stats);
      } else {
        showToast(res?.message || 'Failed to load download items', true);
      }
    } catch (e) {
      console.error('Fetch downloads error:', e);
      showToast('Error connecting to backend database', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, [categoryFilter, statusFilter]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete resource "${title}"?`)) return;

    try {
      const res = await api.delete(`/study-material/${id}`);
      if (res && res.success) {
        showToast('Resource removed successfully.');
        fetchDownloads();
      } else {
        showToast(res?.message || 'Delete failed', true);
      }
    } catch (e) {
      showToast(e.message || 'Error deleting resource', true);
    }
  };

  const handleDownload = async (item) => {
    try {
      if (item._id) {
        await api.post(`/study-material/${item._id}/download`);
        setDownloads(prev => prev.map(d => d._id === item._id ? { ...d, downloadsCount: (d.downloadsCount || 0) + 1 } : d));
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
      showToast('Opening external resource link...');
    }
  };

  const filteredDownloads = downloads.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.title?.toLowerCase().includes(q) ||
      d.category?.toLowerCase().includes(q) ||
      d.subject?.toLowerCase().includes(q) ||
      d.fileName?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredDownloads.length / itemsPerPage) || 1;
  const paginatedDownloads = filteredDownloads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Summary counts
  const totalDownloadsEvents = downloads.reduce((sum, d) => sum + (Number(d.downloadsCount) || 0), 0);
  const categoriesCount = [...new Set(downloads.map(d => d.category).filter(Boolean))].length;
  const formsCount = downloads.filter(d => d.category === 'Forms & Templates').length;

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
          <h1 className="text-2xl font-bold text-zinc-950">Student & Administrative Downloads</h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Download center for clinical guidelines, student handbooks, application forms, academic calendars, and policy manuals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setEditItem(null);
              setIsModalOpen(true);
            }}
            className="bg-[#009966] hover:bg-[#007a52] text-white font-bold text-xs shadow-xs h-9 px-4 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Resource
          </Button>
          <div className="flex items-center text-sm text-zinc-500 font-medium">
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
            <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
            <span>Study Material</span>
            <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
            <span className="text-[#009966] font-bold">Other Downloads</span>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <StudyMaterialNav stats={stats} />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Available Resources</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#009966]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {downloads.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
            Active printable documents
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Download Events</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {totalDownloadsEvents}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
            Recorded downloads by users
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Categories</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {categoriesCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
            Handbooks, forms, and guides
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Forms & Templates</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">
            {formsCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
            Printable applications & duty sheets
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
                Downloads Directory ({filteredDownloads.length})
              </h2>
              <button
                onClick={fetchDownloads}
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
                data={filteredDownloads.map(d => ({
                  Title: d.title,
                  Category: d.category,
                  AvailableFor: d.availableFor,
                  Published: formatDateDMY(d.publishDate),
                  File: d.fileName,
                  Size: d.fileSize,
                  Downloads: d.downloadsCount || 0,
                  Status: d.status
                }))} 
                fileName="stoofi_downloads"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-100">
            <select 
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-800"
            >
              <option value="All">All Resource Categories</option>
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
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
              Showing {paginatedDownloads.length} of {filteredDownloads.length} downloadable resources
            </span>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="text-[11px] text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3">SL</th>
                <th className="px-4 py-3">Resource Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Available For</th>
                <th className="px-4 py-3">Published Date</th>
                <th className="px-4 py-3">Downloads</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-zinc-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#009966] mb-2" />
                    Loading downloadable resources from database...
                  </td>
                </tr>
              ) : paginatedDownloads.length > 0 ? (
                paginatedDownloads.map((d, i) => (
                  <tr key={d._id || i} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                    <td className="px-4 py-3.5 text-zinc-600 font-semibold">
                      {(currentPage - 1) * itemsPerPage + i + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <div 
                        onClick={() => setViewItem(d)} 
                        className="font-bold text-zinc-950 hover:text-[#009966] cursor-pointer transition-colors max-w-sm truncate"
                        title={d.title}
                      >
                        {d.title}
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                        {d.fileName && (
                          <span className="font-mono flex items-center gap-1 text-zinc-500">
                            <FileText className="w-3 h-3 text-[#009966]" /> {d.fileName} {d.fileSize ? `(${d.fileSize})` : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {d.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700">
                      {d.availableFor || 'Student'}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 font-mono text-[11px]">
                      {formatDateDMY(d.publishDate)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-zinc-900">
                      <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-800">
                        {d.downloadsCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        d.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleDownload(d)}
                          className="bg-[#009966] hover:bg-[#007a52] text-white font-bold h-7 text-[11px] px-2.5 shadow-xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Download
                        </Button>
                        <button
                          type="button"
                          onClick={() => setViewItem(d)}
                          className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditItem(d);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded cursor-pointer"
                          title="Edit Resource"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d._id, d.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-zinc-500 font-medium">
                    <div className="max-w-xs mx-auto">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-2 text-zinc-400">
                        <Download className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-zinc-900">No Downloadable Resources Found</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Click &quot;+ Add Resource&quot; above to upload forms, handbooks, and clinical reference materials.
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
            Showing {filteredDownloads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredDownloads.length)} of {filteredDownloads.length} entries
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
          onDownloadSuccess={() => fetchDownloads()}
        />
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <ContentFormModal
          isOpen={isModalOpen}
          editItem={editItem}
          defaultType="Other Download"
          lockType={true}
          onClose={() => {
            setIsModalOpen(false);
            setEditItem(null);
          }}
          onSuccess={() => {
            fetchDownloads();
            showToast('Resource saved successfully!');
          }}
        />
      )}
    </div>
  );
}
