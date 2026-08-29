'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
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

export default function SubjectPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ name: '', code: '', type: 'Theory', author: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/subject');
      if (res.success) setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Name is required");
      return;
    }

    try {
      if (isEditing) {
        const res = await api.put(`/subject/${editId}`, formData);
        if (res.success) {
          alert('Subject updated successfully');
        }
      } else {
        const res = await api.post('/subject', formData);
        if (res.success) {
          alert('Subject added successfully');
        }
      }
      setFormData({ name: '', code: '', type: 'Theory', author: '' });
      setIsEditing(false);
      setEditId(null);
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, code: item.code || '', type: item.type || 'Theory', author: item.author || '' });
    setIsEditing(true);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const res = await api.delete(`/subject/${id}`);
      if (res.success) {
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredData = data.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = filteredData.map(item => ({
    'Subject Name': item.name,
    'Subject Code': item.code,
    'Subject Type': item.type,
    'Author': item.author
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Subject</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/academics/class" className="hover:text-emerald-400 transition-colors">Academics</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Subject</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">{isEditing ? 'Edit Subject' : 'Add Subject'}</h2>
            </div>
            
            <form className="p-4 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Subject Name <span className="text-rose-500">*</span></Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Mathematics" 
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Subject Code</Label>
                <Input 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="e.g. MTH101" 
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Subject Type</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.type === 'Theory' ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-500 bg-transparent'}`}>
                      {formData.type === 'Theory' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-zinc-300">Theory</span>
                    <input type="radio" className="hidden" checked={formData.type === 'Theory'} onChange={() => setFormData({...formData, type: 'Theory'})} />
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.type === 'Practical' ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-500 bg-transparent'}`}>
                      {formData.type === 'Practical' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-zinc-300">Practical</span>
                    <input type="radio" className="hidden" checked={formData.type === 'Practical'} onChange={() => setFormData({...formData, type: 'Practical'})} />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  {isEditing ? 'UPDATE SUBJECT' : 'SAVE SUBJECT'}
                </Button>
                {isEditing && (
                  <Button type="button" onClick={() => { setIsEditing(false); setFormData({name: '', code: '', type: 'Theory', author: ''}); }} className="bg-zinc-700 hover:bg-zinc-600 text-white font-semibold">
                    CANCEL
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Subject List</h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 h-9 w-full sm:w-64" 
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button onClick={() => exportToCSV(exportData, 'Subject_List')} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white" title="Download CSV">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => exportToExcel(exportData, 'Subject_List')} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white text-emerald-500" title="Export Excel">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => printData('Subject List', exportData)} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white text-rose-500" title="Print">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Subject Name</th>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr><td colSpan="4" className="px-4 py-4 text-center text-zinc-500">Loading...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan="4" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 text-zinc-300">{item.name}</td>
                        <td className="px-4 py-3 text-zinc-300">{item.code}</td>
                        <td className="px-4 py-3 text-zinc-300">{item.type}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button onClick={() => handleEdit(item)} variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleDelete(item._id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

