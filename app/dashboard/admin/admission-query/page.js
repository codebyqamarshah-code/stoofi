'use client';

import Link from 'next/link';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, Search, Download, Printer, FileText, MoreVertical, Plus, Edit, Trash2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import api from '@/services/api';

export default function AdmissionQueryPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admission-query');
      if (res.success) {
        setQueries(res.data);
      }
    } catch (error) {
      alert(error.message || 'Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', source: '', status: '' });
  const [activeFilters, setActiveFilters] = useState({ dateFrom: '', dateTo: '', source: '', status: '' });
  
  const [formData, setFormData] = useState({
    name: '', phone: '', source: '', queryDate: '', lastFollowUpDate: '', nextFollowUpDate: '', status: 'Active'
  });
  const [editingId, setEditingId] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Name is required');
    
    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/admission-query/${editingId}`, formData);
      } else {
        await api.post('/admission-query', formData);
      }
      setFormData({ name: '', phone: '', source: '', queryDate: '', lastFollowUpDate: '', nextFollowUpDate: '', status: 'Active' });
      setShowForm(false);
      setEditingId(null);
      fetchQueries();
    } catch (error) {
      alert(error.message || 'Failed to save query');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (query) => {
    setEditingId(query._id);
    setFormData({
      name: query.name || '',
      phone: query.phone || '',
      source: query.source || '',
      queryDate: query.queryDate ? query.queryDate.substring(0, 10) : '',
      lastFollowUpDate: query.lastFollowUpDate ? query.lastFollowUpDate.substring(0, 10) : '',
      nextFollowUpDate: query.nextFollowUpDate ? query.nextFollowUpDate.substring(0, 10) : '',
      status: query.status || 'Active'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this query?')) {
      try {
        await api.delete(`/admission-query/${id}`);
        setQueries(queries.filter(q => q._id !== id));
      } catch (error) {
        alert(error.message || 'Failed to delete query');
      }
    }
  };

  const handleCriteriaSearch = () => {
    setActiveFilters({ ...filters });
  };
  const handleExport = (type) => {
    if (filtered.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = filtered.map(q => ({
      'Name': q.name,
      'Phone': q.phone || '-',
      'Source': q.source || '-',
      'Query Date': q.queryDate ? q.queryDate.substring(0, 10) : '-',
      'Last Follow Up': q.lastFollowUpDate ? q.lastFollowUpDate.substring(0, 10) : '-',
      'Next Follow Up': q.nextFollowUpDate ? q.nextFollowUpDate.substring(0, 10) : '-',
      'Status': q.status || 'Active'
    }));

    const headers = ['Name', 'Phone', 'Source', 'Query Date', 'Last Follow Up', 'Next Follow Up', 'Status'];
    const filename = `admission_queries_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Admission Queries');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename);
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Admission Queries', filename);
    } else {
      alert(`${type} export started...`);
    }
  };

  const filtered = useMemo(() => 
    queries.filter(q => {
      // Quick search
      const matchSearch = q.name.toLowerCase().includes(searchQuery.toLowerCase()) || (q.phone && q.phone.includes(searchQuery));
      
      // Criteria search
      const matchSource = !activeFilters.source || q.source === activeFilters.source;
      const matchStatus = !activeFilters.status || q.status === activeFilters.status;
      const matchDateFrom = !activeFilters.dateFrom || (q.queryDate && q.queryDate >= activeFilters.dateFrom);
      const matchDateTo = !activeFilters.dateTo || (q.queryDate && q.queryDate <= activeFilters.dateTo);
      
      return matchSearch && matchSource && matchStatus && matchDateFrom && matchDateTo;
    }), [queries, searchQuery, activeFilters]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Admission Query</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/admin/admission-query" className="hover:text-emerald-400 transition-colors">Admin Section</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Admission Query</span>
        </div>
      </div>

      {showForm && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mb-6">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit' : 'Add'} Admission Query</h2>
            <Button variant="ghost" size="sm" onClick={() => {setShowForm(false); setEditingId(null); setFormData({ name: '', phone: '', source: '', queryDate: '', lastFollowUpDate: '', nextFollowUpDate: '', status: 'Active' });}} className="text-zinc-400">Cancel</Button>
          </div>
          
          <form className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" onSubmit={handleSave}>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Name <span className="text-rose-500">*</span></Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Name" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Phone</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Source</Label>
              <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-white">
                <option value="">Select Source</option>
                <option value="Front Office">Front Office</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Status</Label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-white">
                <option value="Active">Active</option>
                <option value="Passive">Passive</option>
                <option value="Dead">Dead</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Query Date</Label>
              <Input type="date" value={formData.queryDate} onChange={e => setFormData({...formData, queryDate: e.target.value})} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Last Follow Up Date</Label>
              <Input type="date" value={formData.lastFollowUpDate} onChange={e => setFormData({...formData, lastFollowUpDate: e.target.value})} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Next Follow Up Date</Label>
              <Input type="date" value={formData.nextFollowUpDate} onChange={e => setFormData({...formData, nextFollowUpDate: e.target.value})} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 [color-scheme:dark]" />
            </div>
            <div className="lg:col-span-4 flex justify-end mt-2">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                {editingId ? 'UPDATE' : 'SAVE'} QUERY
              </Button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Select Criteria</h2>
            <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-8 px-4 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> ADD
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Date From</Label>
              <Input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Date To</Label>
              <Input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 [color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Source</Label>
              <select value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-white">
                <option value="">Select Source</option>
                <option value="Front Office">Front Office</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Status</Label>
              <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-white">
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Passive">Passive</option>
                <option value="Dead">Dead</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleCriteriaSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <Search className="h-4 w-4 mr-2" /> SEARCH
            </Button>
          </div>
        </div>
      )}

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Query List</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Quick Search" 
                className="pl-9 w-full sm:w-[200px] bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
              />
            </div>
            
            <div className="flex items-center border border-zinc-800 rounded-md bg-zinc-900">
              <button onClick={() => handleExport('Copy')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Copy"><FileText className="h-4 w-4" /></button>
              <button onClick={() => handleExport('Excel')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Excel"><Download className="h-4 w-4" /></button>
              <button onClick={() => handleExport('CSV')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="CSV"><FileText className="h-4 w-4" /></button>
              <button onClick={() => handleExport('PDF')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="PDF"><Download className="h-4 w-4" /></button>
              <button onClick={() => handleExport('Print')} className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors border-r border-zinc-800" title="Print"><Printer className="h-4 w-4" /></button>
              <button className="p-2 hover:bg-zinc-800 text-zinc-400 transition-colors" title="Columns"><MoreVertical className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Query Date</th>
                <th className="px-4 py-3 font-semibold">Last Follow Up</th>
                <th className="px-4 py-3 font-semibold">Next Follow Up</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((q) => (
                  <tr key={q._id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 text-zinc-300 font-medium">{q.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{q.phone || '-'}</td>
                    <td className="px-4 py-3 text-zinc-300">{q.source || '-'}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${q.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : q.status === 'Won' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{q.queryDate ? q.queryDate.substring(0, 10) : '-'}</td>
                    <td className="px-4 py-3 text-zinc-300">{q.lastFollowUpDate ? q.lastFollowUpDate.substring(0, 10) : '-'}</td>
                    <td className="px-4 py-3 text-zinc-300">{q.nextFollowUpDate ? q.nextFollowUpDate.substring(0, 10) : '-'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button onClick={() => handleEdit(q)} variant="outline" size="sm" className="h-7 text-xs text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10 px-2"><Edit className="h-3 w-3" /></Button>
                      <Button onClick={() => handleDelete(q._id)} variant="outline" size="sm" className="h-7 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10 px-2"><Trash2 className="h-3 w-3" /></Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-zinc-500">
                    {searchQuery || Object.values(activeFilters).some(Boolean) ? 'No matching queries found' : 'No Data Available In Table'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
