'use client';

import Link from 'next/link';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronRight, Search, Download, Printer, FileText, MoreVertical, Upload, Trash2, Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import api from '@/services/api';

export default function VisitorBookPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/visitor-book');
      if (res.success) {
        setVisitors(res.data);
      }
    } catch (error) {
      alert(error.message || 'Failed to fetch visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    purpose: '', name: '', phone: '', idType: '', noOfPerson: '', date: '', inTime: '', outTime: ''
  });
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.purpose) return alert('Name and Purpose are required');
    
    try {
      setSubmitting(true);
      const dataToSubmit = new FormData();
      Object.keys(formData).forEach(key => dataToSubmit.append(key, formData[key]));
      if (fileInputRef.current?.files[0]) {
        dataToSubmit.append('file', fileInputRef.current.files[0]);
      }

      // Send FormData to support file upload
      if (editingId) {
        await api.put(`/visitor-book/${editingId}`, formData); // For put, just send JSON since file upload on edit might be complex
      } else {
        await api.post('/visitor-book', dataToSubmit, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setFileName('');
      setFormData({ purpose: '', name: '', phone: '', idType: '', noOfPerson: '', date: '', inTime: '', outTime: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setEditingId(null);
      fetchVisitors();
    } catch (error) {
      alert(error.message || 'Failed to save visitor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (visitor) => {
    setEditingId(visitor._id);
    setFormData({ 
      purpose: visitor.purpose || '', 
      name: visitor.name || '', 
      phone: visitor.phone || '', 
      idType: visitor.idType || '', 
      noOfPerson: visitor.noOfPerson || '', 
      date: visitor.date ? visitor.date.substring(0, 10) : '', 
      inTime: visitor.inTime || '', 
      outTime: visitor.outTime || '' 
    });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this visitor?')) {
      try {
        await api.delete(`/visitor-book/${id}`);
        setVisitors(visitors.filter(v => v._id !== id));
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

    const exportData = filtered.map(v => ({
      'Name': v.name,
      'No Of Person': v.noOfPerson || '-',
      'Phone': v.phone || '-',
      'Purpose': v.purpose,
      'Date': v.date ? v.date.substring(0, 10) : '-',
      'In Time': v.inTime || '-'
    }));

    const headers = ['Name', 'No Of Person', 'Phone', 'Purpose', 'Date', 'In Time'];
    const filename = `visitor_book_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Visitor Book');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename);
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Visitor Book', filename);
    } else {
      alert(`${type} export started...`);
    }
  };

  const filtered = useMemo(() => 
    visitors.filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.phone.includes(searchQuery) ||
      v.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    ), [visitors, searchQuery]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Visitor Book</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-500 transition-colors">Admin Section</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Visitor Book</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-950">{editingId ? 'Edit' : 'Add'} Visitor</h2>
              {editingId && <Button variant="ghost" size="sm" onClick={() => {setEditingId(null); setFormData({ purpose: '', name: '', phone: '', id: '', noOfPerson: '', date: '', inTime: '', outTime: '' });}} className="text-zinc-400">Cancel</Button>}
            </div>
            
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Purpose <span className="text-rose-500">*</span></Label>
                <Input value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} placeholder="Purpose" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Name <span className="text-rose-500">*</span></Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Name" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Phone</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">ID</Label>
                <Input value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} placeholder="Id" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">No Of Person</Label>
                <Input type="number" value={formData.noOfPerson} onChange={e => setFormData({...formData, noOfPerson: e.target.value})} placeholder="No Of Person" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Date</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600 [color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">In Time</Label>
                <Input type="time" value={formData.inTime} onChange={e => setFormData({...formData, inTime: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600 [color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Out Time</Label>
                <Input type="time" value={formData.outTime} onChange={e => setFormData({...formData, outTime: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600 [color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">File</Label>
                <div className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={e => setFileName(e.target.files[0]?.name || '')} />
                  <Input type="text" value={fileName} placeholder="File" readOnly className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" />
                  <Button type="button" onClick={() => fileInputRef.current?.click()} variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 shrink-0"><Upload className="h-4 w-4 mr-2" /> BROWSE</Button>
                </div>
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold">
                  {editingId ? 'UPDATE' : 'SAVE'} VISITOR
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-zinc-950">Visitor List</h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Quick Search" 
                    className="pl-9 w-full sm:w-[200px] bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600"
                  />
                </div>
                
                <div className="flex items-center border border-zinc-200 rounded-md bg-zinc-900">
                  <button onClick={() => handleExport('Copy')} className="p-2 hover:bg-zinc-100 text-zinc-400 transition-colors border-r border-zinc-200" title="Copy"><FileText className="h-4 w-4" /></button>
              <button onClick={() => handleExport('Excel')} className="p-2 hover:bg-zinc-100 text-zinc-400 transition-colors border-r border-zinc-200" title="Excel"><Download className="h-4 w-4" /></button>
              <button onClick={() => handleExport('CSV')} className="p-2 hover:bg-zinc-100 text-zinc-400 transition-colors border-r border-zinc-200" title="CSV"><FileText className="h-4 w-4" /></button>
              <button onClick={() => handleExport('PDF')} className="p-2 hover:bg-zinc-100 text-zinc-400 transition-colors border-r border-zinc-200" title="PDF"><Download className="h-4 w-4" /></button>
              <button onClick={() => handleExport('Print')} className="p-2 hover:bg-zinc-100 text-zinc-400 transition-colors border-r border-zinc-200" title="Print"><Printer className="h-4 w-4" /></button>
              <button className="p-2 hover:bg-zinc-100 text-zinc-400 transition-colors" title="Columns"><MoreVertical className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">No Of Person</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Purpose</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">In Time</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((v) => (
                      <tr key={v._id} className="border-b border-zinc-200/50 hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 text-zinc-950 font-medium">{v.name}</td>
                        <td className="px-4 py-3 text-zinc-950">{v.noOfPerson || '-'}</td>
                        <td className="px-4 py-3 text-zinc-950">{v.phone || '-'}</td>
                        <td className="px-4 py-3 text-zinc-950">{v.purpose}</td>
                        <td className="px-4 py-3 text-zinc-950">{v.date ? v.date.substring(0, 10) : '-'}</td>
                        <td className="px-4 py-3 text-zinc-950">{v.inTime || '-'}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button onClick={() => handleEdit(v)} variant="outline" size="sm" className="h-7 text-xs text-zinc-600 border-zinc-600/50 hover:bg-zinc-600/10 px-2"><Edit className="h-3 w-3" /></Button>
                          <Button onClick={() => handleDelete(v._id)} variant="outline" size="sm" className="h-7 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10 px-2"><Trash2 className="h-3 w-3" /></Button>
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
            
            <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
