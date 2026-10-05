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
  const [setupSources, setSetupSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admission-query');
      const setupRes = await api.get('/setup').catch(() => null);
      if (setupRes?.success) {
        const src = setupRes.data.filter(s => s.type === 'Source');
        if (src.length > 0) setSetupSources(src);
      }
      if (res?.success) {
        setQueries(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch queries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ queryDate: '', source: '', status: '' });
  
  const [formData, setFormData] = useState({
    name: '', phone: '', source: '', queryDate: '', status: 'Interested', notes: ''
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
      setFormData({ name: '', phone: '', source: '', queryDate: '', status: 'Interested', notes: '' });
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
      status: query.status || 'Interested',
      notes: query.notes || ''
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

  const handleExport = (type) => {
    if (filtered.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = filtered.map(q => ({
      'Name': q.name,
      'Phone': q.phone || '-',
      'Source': q.source || '-',
      'Status': q.status || 'Interested',
      'Query Date': q.queryDate ? q.queryDate.substring(0, 10) : '-'
    }));

    const headers = ['Name', 'Phone', 'Source', 'Status', 'Query Date'];
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
      // Quick search by name or phone
      const matchSearch = (q.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (q.phone && q.phone.includes(searchQuery));
      
      // Live Criteria filters
      const matchSource = !filters.source || q.source === filters.source;
      const matchStatus = !filters.status || q.status === filters.status;
      const matchQueryDate = !filters.queryDate || (q.queryDate && q.queryDate.startsWith(filters.queryDate));
      
      return matchSearch && matchSource && matchStatus && matchQueryDate;
    }), [queries, searchQuery, filters]
  );

  return (
    <div className="space-y-6">
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Admission Query</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-600 transition-colors">Admin Section</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Admission Query</span>
        </div>
      </div>

      {/* Add / Edit Form Modal Card */}
      {showForm && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden mb-6">
          <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
            <h2 className="text-base font-semibold text-zinc-950">{editingId ? 'Edit' : 'Add'} Admission Query</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowForm(false); 
                setEditingId(null); 
                setFormData({ name: '', phone: '', source: '', queryDate: '', status: 'Interested', notes: '' });
              }} 
              className="text-zinc-500 hover:text-zinc-950"
            >
              Cancel
            </Button>
          </div>
          
          <form className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" onSubmit={handleSave}>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase">Name <span className="text-rose-500">*</span></Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Student Name" 
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase">Phone</Label>
              <Input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                placeholder="Phone Number" 
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase">Source</Label>
              <select 
                value={formData.source} 
                onChange={e => setFormData({...formData, source: e.target.value})} 
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              >
                <option value="">Select Source</option>
                {setupSources.length > 0 ? setupSources.map(s => <option key={s._id} value={s.name}>{s.name}</option>) : ['Building Advertisment', 'Digital Marketing', 'Print Media', 'SMS', 'Friend', 'Family', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase">Status</Label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})} 
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              >
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Follow-up Later">Follow-up Later</option>
                <option value="Lost">Lost</option>
                <option value="Invalid Query">Invalid Query</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase">Query Date</Label>
              <Input 
                type="date" 
                value={formData.queryDate} 
                onChange={e => setFormData({...formData, queryDate: e.target.value})} 
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950" 
              />
            </div>
            <div className="space-y-1.5 lg:col-span-3">
              <Label className="text-xs font-bold text-zinc-700 uppercase">Query Details / Note</Label>
              <textarea 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                placeholder="Enter any notes related to this query..." 
                rows={1}
                className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 resize-none h-10" 
              />
            </div>
            <div className="lg:col-span-4 flex justify-end mt-2">
              <Button type="submit" disabled={submitting} className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingId ? 'UPDATE' : 'SAVE'} QUERY
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Select Criteria Filter Box (Without Date To & Search Button) */}
      {!showForm && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-zinc-950">Select Criteria</h2>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold h-8 px-4 text-xs shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> ADD
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase">Date</Label>
              <Input 
                type="date" 
                value={filters.queryDate} 
                onChange={e => setFilters({...filters, queryDate: e.target.value})} 
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase">Source</Label>
              <select 
                value={filters.source} 
                onChange={e => setFilters({...filters, source: e.target.value})} 
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              >
                <option value="">All Sources</option>
                {setupSources.length > 0 ? setupSources.map(s => <option key={s._id} value={s.name}>{s.name}</option>) : ['Building Advertisment', 'Digital Marketing', 'Print Media', 'SMS', 'Friend', 'Family', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase">Status</Label>
              <select 
                value={filters.status} 
                onChange={e => setFilters({...filters, status: e.target.value})} 
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              >
                <option value="">All Statuses</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Follow-up Later">Follow-up Later</option>
                <option value="Lost">Lost</option>
                <option value="Invalid Query">Invalid Query</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Query List Table */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-zinc-950">Query List</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Quick Search" 
                className="pl-9 w-full sm:w-[200px] bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950"
              />
            </div>
            
            <div className="flex items-center border border-zinc-200 rounded-md bg-zinc-50">
              <button onClick={() => handleExport('Copy')} className="p-2 hover:bg-zinc-200 text-zinc-600 transition-colors border-r border-zinc-200" title="Copy"><FileText className="h-4 w-4" /></button>
              <button onClick={() => handleExport('Excel')} className="p-2 hover:bg-zinc-200 text-zinc-600 transition-colors border-r border-zinc-200" title="Excel"><Download className="h-4 w-4" /></button>
              <button onClick={() => handleExport('CSV')} className="p-2 hover:bg-zinc-200 text-zinc-600 transition-colors border-r border-zinc-200" title="CSV"><FileText className="h-4 w-4" /></button>
              <button onClick={() => handleExport('PDF')} className="p-2 hover:bg-zinc-200 text-zinc-600 transition-colors border-r border-zinc-200" title="PDF"><Download className="h-4 w-4" /></button>
              <button onClick={() => handleExport('Print')} className="p-2 hover:bg-zinc-200 text-zinc-600 transition-colors" title="Print"><Printer className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Phone</th>
                <th className="px-4 py-3 font-bold">Source</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Query Date</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-zinc-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-950 mb-2" />
                    <p>Loading queries...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((q) => (
                  <tr key={q._id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-zinc-950 font-medium">{q.name}</td>
                    <td className="px-4 py-3 text-zinc-700">{q.phone || '-'}</td>
                    <td className="px-4 py-3 text-zinc-700">{q.source || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        q.status === 'Interested' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : q.status === 'Follow-up Later' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{q.queryDate ? q.queryDate.substring(0, 10) : '-'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button 
                        onClick={() => handleEdit(q)} 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs text-zinc-700 border-zinc-300 hover:bg-zinc-100 px-2"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        onClick={() => handleDelete(q._id)} 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-zinc-500">
                    {searchQuery || Object.values(filters).some(Boolean) ? 'No matching queries found' : 'No Data Available In Table'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled>
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
