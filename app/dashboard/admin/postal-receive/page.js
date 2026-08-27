'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronRight, Search, Download, Printer, FileText, MoreVertical, Upload, Trash2, Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function PostalReceivePage() {
  const [postalReceives, setPostalReceives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/postal-receive');
      if (res.success) setPostalReceives(res.data);
    } catch (error) {
      alert(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    fromTitle: '', referenceNo: '', address: '', note: '', toTitle: '', date: ''
  });
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (editingId) {
        await api.put('/postal-receive/' + editingId, payload);
      } else {
        await api.post('/postal-receive', payload);
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

  const handleEdit = (dispatch) => {
    setEditingId(dispatch._id);
    setFormData({
      fromTitle: dispatch.fromTitle, referenceNo: dispatch.referenceNo, 
      address: dispatch.address, note: dispatch.note, 
      toTitle: dispatch.toTitle, date: dispatch.date
    });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete('/postal-receive/' + id);
        setPostalReceives(postalReceives.filter(item => item._id !== id));
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
    postalReceives.filter(p => 
      p.fromTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.toTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ), [postalReceives, searchQuery]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Postal Receive</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Admin Section</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Postal Receive</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit' : 'Add'} Postal Receive</h2>
              {editingId && <Button variant="ghost" size="sm" onClick={() => {setEditingId(null); setFormData({ fromTitle: '', referenceNo: '', address: '', note: '', toTitle: '', date: '' });}} className="text-zinc-400">Cancel</Button>}
            </div>
            
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">From Title <span className="text-rose-500">*</span></Label>
                <Input value={formData.fromTitle} onChange={e => setFormData({...formData, fromTitle: e.target.value})} placeholder="From Title" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Reference No <span className="text-rose-500">*</span></Label>
                <Input value={formData.referenceNo} onChange={e => setFormData({...formData, referenceNo: e.target.value})} placeholder="Reference No" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Address</Label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Address" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Note</Label>
                <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Note" className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-white resize-y" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">To Title <span className="text-rose-500">*</span></Label>
                <Input value={formData.toTitle} onChange={e => setFormData({...formData, toTitle: e.target.value})} placeholder="To Title" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Date</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 [color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">File</Label>
                <div className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={e => setFileName(e.target.files[0]?.name || '')} />
                  <Input type="text" value={fileName} placeholder="File" readOnly className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
                  <Button type="button" onClick={() => fileInputRef.current?.click()} variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-white shrink-0"><Upload className="h-4 w-4 mr-2" /> BROWSE</Button>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  {editingId ? 'UPDATE' : 'SAVE'} POSTAL RECEIVE
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Postal Receive List</h2>
              
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
                    <th className="px-4 py-3 font-semibold">From Title</th>
                    <th className="px-4 py-3 font-semibold">Reference No</th>
                    <th className="px-4 py-3 font-semibold">Address</th>
                    <th className="px-4 py-3 font-semibold">To Title</th>
                    <th className="px-4 py-3 font-semibold">Note</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((p) => (
                      <tr key={p._id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 text-zinc-300 font-medium">{p.fromTitle}</td>
                        <td className="px-4 py-3 text-zinc-300">{p.referenceNo}</td>
                        <td className="px-4 py-3 text-zinc-300">{p.address || '-'}</td>
                        <td className="px-4 py-3 text-zinc-300">{p.toTitle}</td>
                        <td className="px-4 py-3 text-zinc-300">{p.note || '-'}</td>
                        <td className="px-4 py-3 text-zinc-300">{p.date || '-'}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button onClick={() => handleEdit(p)} variant="outline" size="sm" className="h-7 text-xs text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10 px-2"><Edit className="h-3 w-3" /></Button>
                          <Button onClick={() => handleDelete(p._id)} variant="outline" size="sm" className="h-7 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10 px-2"><Trash2 className="h-3 w-3" /></Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-zinc-500">
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
