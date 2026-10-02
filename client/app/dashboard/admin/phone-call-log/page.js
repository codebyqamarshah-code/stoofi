'use client';

import Link from 'next/link';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  Search,
  Download,
  Printer,
  FileText,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function PhoneCallLogPage() {
  const [logs, setLogs] = useState([]);

  const [isMounted, setIsMounted] = useState(false);
  
  const fetchLogs = async () => {
    try {
      const res = await api.get('/phone-call-log');
      if (res.success) setLogs(res.data);
    } catch(e) {}
  };

  useEffect(() => {
    fetchLogs();
    setIsMounted(true);
  }, []);

  const [callType, setCallType] = useState('Incoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '', phone: '', date: '', followUpDate: '', duration: '', description: ''
  });
  const [editingId, setEditingId] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (editingId) {
        await api.put('/phone-call-log/' + editingId, payload);
      } else {
        await api.post('/phone-call-log', payload);
      }
      setEditingId(null);
      fetchLogs();
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

  const handleEdit = (log) => {
    setEditingId(log._id);
    setFormData({
      name: log.name, phone: log.phone, date: log.date, 
      followUpDate: log.followUpDate, duration: log.duration, description: log.description
    });
    setCallType(log.type);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete('/phone-call-log/' + id);
        setCallLogs(callLogs.filter(item => item._id !== id));
      } catch (error) {
        alert(error.message || 'Failed to delete');
      }
    }
  };

    const handleExport = (type) => {
    if (type === 'Print') {
      window.print();
      return;
    }
    if (filteredLogs.length === 0) {
      alert('No data to export');
      return;
    }
    if (type === 'CSV' || type === 'Excel') {
      const headers = Object.keys(filteredLogs[0] || {}).filter(k => k !== 'id' && k !== 'recordId');
      const csvData = filteredLogs.map(item => headers.map(h => item[h]).join(','));
      const blob = new Blob([[headers.join(','), '\n', ...csvData].join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert(type + ' export started...');
    }
  };

  const filteredLogs = useMemo(() => 
    logs.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.phone.includes(searchQuery)
    ), [logs, searchQuery]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Phone Call Log</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-500 transition-colors">Admin Section</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Phone Call Log</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-950">{editingId ? 'Edit' : 'Add'} Phone Call</h2>
              {editingId && <Button variant="ghost" size="sm" onClick={() => {setEditingId(null); setFormData({ name: '', phone: '', date: '', followUpDate: '', duration: '', description: '' });}} className="text-zinc-400">Cancel</Button>}
            </div>
            
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Name <span className="text-rose-500">*</span></Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Name" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Phone <span className="text-rose-500">*</span></Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Date</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600 [color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Follow Up Date</Label>
                <Input type="date" value={formData.followUpDate} onChange={e => setFormData({...formData, followUpDate: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600 [color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Call Duration</Label>
                <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="Call Duration" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Description</Label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description" className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-950 resize-y" />
              </div>
              
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Type</Label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${callType === 'Incoming' ? 'border-zinc-600 bg-zinc-600' : 'border-zinc-500 bg-transparent'}`}>
                      {callType === 'Incoming' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-zinc-950">Incoming</span>
                    <input type="radio" className="hidden" name="callType" value="Incoming" checked={callType === 'Incoming'} onChange={() => setCallType('Incoming')} />
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${callType === 'Outgoing' ? 'border-zinc-600 bg-zinc-600' : 'border-zinc-500 bg-transparent'}`}>
                      {callType === 'Outgoing' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-zinc-950">Outgoing</span>
                    <input type="radio" className="hidden" name="callType" value="Outgoing" checked={callType === 'Outgoing'} onChange={() => setCallType('Outgoing')} />
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold">
                  {editingId ? 'UPDATE' : 'SAVE'} PHONE CALL
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-zinc-950">Phone Call List</h2>
              
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
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Follow Up</th>
                    <th className="px-4 py-3 font-semibold">Duration</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((l) => (
                      <tr key={l._id} className="border-b border-zinc-200/50 hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 text-zinc-950">{l.name}</td>
                        <td className="px-4 py-3 text-zinc-950">{l.phone}</td>
                        <td className="px-4 py-3 text-zinc-950">{l.date || '-'}</td>
                        <td className="px-4 py-3 text-zinc-950">{l.followUpDate || '-'}</td>
                        <td className="px-4 py-3 text-zinc-950">{l.duration || '-'}</td>
                        <td className="px-4 py-3 text-zinc-950">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${l.type === 'Incoming' ? 'bg-zinc-600/10 text-zinc-600 border border-zinc-600/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                             {l.type}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                           <Button onClick={() => handleEdit(l)} variant="outline" size="sm" className="h-7 text-xs text-zinc-600 border-zinc-600/50 hover:bg-zinc-600/10 px-2"><Edit className="h-3 w-3" /></Button>
                           <Button onClick={() => handleDelete(l._id)} variant="outline" size="sm" className="h-7 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10 px-2"><Trash2 className="h-3 w-3" /></Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-zinc-500">
                        {searchQuery ? 'No matching logs found' : 'No Data Available In Table'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredLogs.length > 0 ? 1 : 0} to {filteredLogs.length} of {filteredLogs.length} entries</div>
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



