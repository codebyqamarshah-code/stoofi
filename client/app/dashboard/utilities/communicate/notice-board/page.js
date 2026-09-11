'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Copy, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Download,
  Bell
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import api from '@/services/api';

export default function NoticeBoardPage() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');
  
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    noticeDate: new Date().toISOString().split('T')[0],
    publishDate: new Date().toISOString().split('T')[0],
    noticeTo: 'All',
    description: '',
    status: 'Active'
  });

  const [selectedNotice, setSelectedNotice] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const audiences = ['All', 'Students', 'Teachers', 'Parents', 'Staff'];

  // Sync with localStorage and Backend API
  useEffect(() => {
    let localSaved = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dashboard_notices');
        if (raw) localSaved = JSON.parse(raw);
      } catch (_) {}
    }

    const fetchNotices = async () => {
      try {
        const res = await api.get('/dashboard/notices');
        if (res && res.success && Array.isArray(res.data)) {
          const combined = [...res.data];
          localSaved.forEach(localItem => {
            if (!combined.some(s => s._id === localItem._id || s.title === localItem.title)) {
              combined.push(localItem);
            }
          });
          const mapped = combined.map(n => ({
            id: n._id,
            title: n.title,
            description: n.description,
            noticeTo: n.noticeTo || n.audience || 'All',
            noticeDate: n.noticeDate || n.date || n.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            publishDate: n.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            createdBy: n.createdBy || 'Admin',
            status: 'Active'
          }));
          setRecords(mapped);
          if (typeof window !== 'undefined') {
            localStorage.setItem('dashboard_notices', JSON.stringify(combined));
          }
          return;
        }
      } catch (err) {}
      
      if (localSaved.length > 0) {
        setRecords(localSaved.map(n => ({
          id: n._id,
          title: n.title,
          description: n.description,
          noticeTo: n.noticeTo || n.audience || 'All',
          noticeDate: n.noticeDate || n.date || n.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          publishDate: n.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          createdBy: n.createdBy || 'Admin',
          status: 'Active'
        })));
      }
    };
    fetchNotices();
  }, []);

  const saveToGlobal = (updatedRecords) => {
    if (typeof window !== 'undefined') {
      const globalFormat = updatedRecords.map(r => ({
        _id: r.id,
        title: r.title,
        description: r.description,
        noticeTo: r.noticeTo,
        audience: r.noticeTo,
        date: r.noticeDate,
        noticeDate: r.noticeDate,
        published: true,
        createdBy: r.createdBy,
        createdAt: new Date().toISOString()
      }));
      localStorage.setItem('dashboard_notices', JSON.stringify(globalFormat));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a Notice Title.');
      return;
    }

    if (editId) {
      const updatedList = records.map(r => r.id === editId ? { ...r, ...form } : r);
      setRecords(updatedList);
      saveToGlobal(updatedList);
      setSuccessMsg('Notice updated successfully!');
      
      try {
        await api.put(`/dashboard/notices/${editId}`, {
          title: form.title,
          description: form.description,
          audience: form.noticeTo,
          date: form.noticeDate
        });
      } catch (err) {}
      
      setEditId(null);
    } else {
      const tempId = 'notice_' + Date.now();
      const newRecord = {
        id: tempId,
        ...form,
        createdBy: 'Admin'
      };
      const updatedList = [newRecord, ...records];
      setRecords(updatedList);
      saveToGlobal(updatedList);
      setSuccessMsg('Notice added and published successfully!');

      try {
        const res = await api.post('/dashboard/notices', {
          title: form.title,
          description: form.description,
          audience: form.noticeTo,
          date: form.noticeDate
        });
        if (res && res.data && res.data._id) {
          const syncedList = updatedList.map(r => r.id === tempId ? { ...r, id: res.data._id } : r);
          setRecords(syncedList);
          saveToGlobal(syncedList);
        }
      } catch (err) {}
    }

    setForm({
      title: '',
      noticeDate: new Date().toISOString().split('T')[0],
      publishDate: new Date().toISOString().split('T')[0],
      noticeTo: 'All',
      description: '',
      status: 'Active'
    });

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      title: item.title,
      noticeDate: item.noticeDate,
      publishDate: item.publishDate,
      noticeTo: item.noticeTo,
      description: item.description || '',
      status: item.status || 'Active'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      const updatedList = records.filter(r => r.id !== id);
      setRecords(updatedList);
      saveToGlobal(updatedList);
      
      if (editId === id) {
        cancelEdit();
      }
      setSuccessMsg('Notice deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);

      try {
        await api.delete(`/dashboard/notices/${id}`);
      } catch (err) {}
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({
      title: '',
      noticeDate: new Date().toISOString().split('T')[0],
      publishDate: new Date().toISOString().split('T')[0],
      noticeTo: 'All',
      description: '',
      status: 'Active'
    });
  };

  const filteredRecords = useMemo(() => records.filter(rec => {
    const matchAudience = filterAudience === 'All' || rec.noticeTo === filterAudience || rec.noticeTo === 'All';
    const matchSearch = !search || 
      rec.title.toLowerCase().includes(search.toLowerCase()) || 
      (rec.description && rec.description.toLowerCase().includes(search.toLowerCase())) ||
      rec.createdBy.toLowerCase().includes(search.toLowerCase());
    return matchAudience && matchSearch;
  }), [records, filterAudience, search]);

  const handleCopy = () => {
    navigator.clipboard.writeText(filteredRecords.map(r => `${r.title} | ${r.noticeTo} | Notice Date: ${r.noticeDate} | Published: ${r.publishDate} | By: ${r.createdBy}`).join('\n'));
    alert('Notice list copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Notice Board</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Publish circulars, institutional announcements, and notifications across school groups.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">Communicate</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-emerald-400 font-medium">Notice Board</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-zinc-100 dark:bg-emerald-950/40 border border-zinc-300 dark:border-emerald-800 text-zinc-900 dark:text-emerald-300 text-sm flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-zinc-800" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="h-4 w-4 text-zinc-800" />
                {editId ? 'Edit Notice' : 'Add Notice'}
              </h2>
              {editId && (
                <button onClick={cancelEdit} className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer">
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Notice Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter notice title..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Notice Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.noticeDate}
                    onChange={(e) => setForm({ ...form, noticeDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Publish On <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.publishDate}
                    onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Notice For <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.noticeTo}
                  onChange={(e) => setForm({ ...form, noticeTo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                >
                  {audiences.map(a => <option key={a} value={a}>{a === 'All' ? 'All (Students, Teachers, Parents, Staff)' : a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Notice Details / Message
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Write notice description or guidelines here..."
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {editId ? 'Update Notice' : 'Save Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: List Table */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Notice Board List</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-900 dark:bg-emerald-950/60 dark:text-emerald-400 border border-zinc-300 dark:border-emerald-800">
                  {filteredRecords.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="SEARCH NOTICES"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                </div>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <button onClick={handleCopy} title="Copy" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToExcel(filteredRecords, 'Notice_Board')} title="Excel" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><FileSpreadsheet className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToCSV(filteredRecords, 'Notice_Board')} title="CSV" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><FileText className="h-3.5 w-3.5" /></button>
                  <button onClick={() => exportToPDF(filteredRecords, ['title', 'noticeTo', 'noticeDate', 'publishDate', 'createdBy'], 'School Notices', 'Notice_Board')} title="PDF" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><Download className="h-3.5 w-3.5" /></button>
                  <button onClick={() => printData(filteredRecords, ['title', 'noticeTo', 'noticeDate', 'publishDate', 'createdBy'], 'School Notices')} title="Print" className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors"><Printer className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-zinc-500 uppercase">Filter Notice For:</span>
              <select
                value={filterAudience}
                onChange={(e) => setFilterAudience(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-1 focus:ring-zinc-600"
              >
                <option value="All">All Audiences</option>
                {audiences.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-3.5 py-3">SL</th>
                    <th className="px-3.5 py-3">Title</th>
                    <th className="px-3.5 py-3">Notice For</th>
                    <th className="px-3.5 py-3">Notice Date</th>
                    <th className="px-3.5 py-3">Publish Date</th>
                    <th className="px-3.5 py-3">Created By</th>
                    <th className="px-3.5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">No Notices Available</td></tr>
                  ) : filteredRecords.map((item, index) => (
                    <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-200">{index + 1}</td>
                      <td className="px-3.5 py-3">
                        <div className="font-semibold text-zinc-900 dark:text-white line-clamp-1">{item.title}</div>
                        {item.description && <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{item.description}</div>}
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 text-zinc-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {item.noticeTo}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.noticeDate}</td>
                      <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{item.publishDate}</td>
                      <td className="px-3.5 py-3 text-zinc-700 dark:text-zinc-300 font-medium whitespace-nowrap">{item.createdBy}</td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedNotice(item)}
                            className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="h-3 w-3" /> View
                          </button>
                          <button onClick={() => handleEdit(item)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded transition-colors" title="Edit">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 rounded transition-colors" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between pt-4 mt-2 text-xs text-zinc-500">
              <div>Showing {filteredRecords.length} of {records.length} entries</div>
              <div className="flex items-center gap-1">
                <button disabled className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-50 cursor-not-allowed">&lt;</button>
                <button className="px-2.5 py-1 rounded border border-zinc-600 bg-zinc-100 dark:bg-emerald-950/40 text-zinc-800 dark:text-emerald-400 font-semibold">1</button>
                <button disabled className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-50 cursor-not-allowed">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notice View Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-zinc-800" /> Circular / Notice Details
              </h3>
              <button onClick={() => setSelectedNotice(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white font-bold text-sm">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                <div className="font-bold text-sm text-zinc-900 dark:text-white">{selectedNotice.title}</div>
                <div className="text-zinc-500 mt-1 flex items-center gap-3">
                  <span>Target: <strong>{selectedNotice.noticeTo}</strong></span>
                  <span>By: <strong>{selectedNotice.createdBy}</strong></span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 block">Notice Date:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedNotice.noticeDate}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 block">Publish Date:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedNotice.publishDate}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 block font-semibold mb-1">Notice Content:</span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedNotice.description || 'No detailed content provided.'}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedNotice(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
