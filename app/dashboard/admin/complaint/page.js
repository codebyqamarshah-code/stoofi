'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronRight, Search, Download, Printer, FileText, MoreVertical, Upload, Edit, Trash2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function ComplaintPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaint');
      if (res.success) setComplaints(res.data);
    } catch (error) {
      alert(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    complaintBy: '', complaintType: '', source: '', phone: '', date: '', actionTaken: '', assigned: '', description: ''
  });
  const [editingId, setEditingId] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (editingId) {
        await api.put('/complaint/' + editingId, payload);
      } else {
        await api.post('/complaint', payload);
      }
      setEditingId(null);
      fetchData();
      if(typeof setShowForm === 'function') setShowForm(false);
      const resetForm = {};
      Object.keys(formData).forEach(k => resetForm[k] = '');
      setFormData(resetForm);
      if (typeof setFileName === 'function') setFileName('');
    } catch (error) {
      alert(error.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (complaint) => {
    setEditingId(complaint._id);
    setFormData({ ...complaint });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete('/complaint/' + id);
        setComplaints(complaints.filter(item => item._id !== id));
      } catch (error) {
        alert(error.message || 'Failed to delete');
      }
    }
  };

    const handleExport = (type) => {
    if (filtered.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Create clean data without _id or v
    const exportData = filtered.map(item => {
      const clean = { ...item };
      delete clean._id;
      delete clean.__v;
      delete clean.createdAt;
      delete clean.updatedAt;
      return clean;
    });

    const headers = Object.keys(exportData[0] || {});
    const filename = `export_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Export');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename);
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Export', filename);
    } else {
      alert(`${type} export started...`);
    }
  };

  const filtered = useMemo(() => 
    complaints.filter(c => 
      c.complaintBy.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery)
    ), [complaints, searchQuery]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Complaint</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Admin Section</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Complaint</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit' : 'Add'} Complaint</h2>
              {editingId && <Button variant="ghost" size="sm" onClick={() => {setEditingId(null); setFormData({ complaintBy: '', complaintType: '', source: '', phone: '', date: '', actionTaken: '', assigned: '', description: '' });}} className="text-zinc-400">Cancel</Button>}
            </div>
            
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Complaint By <span className="text-rose-500">*</span></Label>
                <Input value={formData.complaintBy} onChange={e => setFormData({...formData, complaintBy: e.target.value})} placeholder="Complaint By" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Complaint Type <span className="text-rose-500">*</span></Label>
                <select value={formData.complaintType} onChange={e => setFormData({...formData, complaintType: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-white" required>
                  <option value="">Complaint Type *</option>
                  <option value="Academic">Academic</option>
                  <option value="Administrative">Administrative</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Complaint Source <span className="text-rose-500">*</span></Label>
                <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-white" required>
                  <option value="">Complaint Source *</option>
                  <option value="Parent">Parent</option>
                  <option value="Student">Student</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Phone</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Date</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 [color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Actions Taken</Label>
                <Input value={formData.actionTaken} onChange={e => setFormData({...formData, actionTaken: e.target.value})} placeholder="Actions Taken" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Assigned</Label>
                <Input value={formData.assigned} onChange={e => setFormData({...formData, assigned: e.target.value})} placeholder="Assigned" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Description</Label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description" className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-white resize-y" />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  {editingId ? 'UPDATE' : 'SAVE'} COMPLAINT
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Complaint List</h2>
              
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
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Complaint By</th>
                    <th className="px-4 py-3 font-semibold">Complaint Type</th>
                    <th className="px-4 py-3 font-semibold">Source</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((c) => (
                      <tr key={c._id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 text-zinc-300 font-medium">{c.complaintBy}</td>
                        <td className="px-4 py-3 text-zinc-300">{c.complaintType}</td>
                        <td className="px-4 py-3 text-zinc-300">{c.source}</td>
                        <td className="px-4 py-3 text-zinc-300">{c.phone || '-'}</td>
                        <td className="px-4 py-3 text-zinc-300">{c.date || '-'}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button onClick={() => handleEdit(c)} variant="outline" size="sm" className="h-7 text-xs text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10 px-2"><Edit className="h-3 w-3" /></Button>
                          <Button onClick={() => handleDelete(c._id)} variant="outline" size="sm" className="h-7 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10 px-2"><Trash2 className="h-3 w-3" /></Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-zinc-500">
                        {searchQuery ? 'No matching records found' : 'No Data Available In Table'}
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
      </div>
    </div>
  );
}
