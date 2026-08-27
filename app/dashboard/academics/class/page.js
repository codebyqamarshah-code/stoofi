'use client';

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

export default function ClassPage() {
  const [data, setData] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ name: '', sections: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      const [classRes, secRes] = await Promise.all([
        api.get('/class'),
        api.get('/section')
      ]);
      if (classRes.success) setData(classRes.data);
      if (secRes.success) setSections(secRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSectionToggle = (secName) => {
    setFormData(prev => {
      const isSelected = prev.sections.includes(secName);
      if (isSelected) {
        return { ...prev, sections: prev.sections.filter(s => s !== secName) };
      } else {
        return { ...prev, sections: [...prev.sections, secName] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Name is required");
      return;
    }

    try {
      if (isEditing) {
        const res = await api.put(`/class/${editId}`, formData);
        if (res.success) {
          alert('Class updated successfully');
        }
      } else {
        const res = await api.post('/class', formData);
        if (res.success) {
          alert('Class added successfully');
        }
      }
      setFormData({ name: '', sections: [] });
      setIsEditing(false);
      setEditId(null);
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, sections: item.sections || [] });
    setIsEditing(true);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const res = await api.delete(`/class/${id}`);
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
    Class: item.name,
    Sections: (item.sections || []).join(', ')
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Class</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Academics</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Class</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">{isEditing ? 'Edit Class' : 'Add Class'}</h2>
            </div>
            
            <form className="p-4 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Name <span className="text-rose-500">*</span></Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Class 1" 
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Sections</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {sections.length === 0 ? (
                    <p className="text-sm text-zinc-500">No sections found. Add sections first.</p>
                  ) : (
                    sections.map(sec => (
                      <label key={sec._id} className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.sections.includes(sec.name) ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-500 bg-transparent'}`}>
                          {formData.sections.includes(sec.name) && <div className="w-2 h-2 rounded-sm bg-white" />}
                        </div>
                        <span className="text-sm text-zinc-300">{sec.name}</span>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={formData.sections.includes(sec.name)}
                          onChange={() => handleSectionToggle(sec.name)} 
                        />
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  {isEditing ? 'UPDATE CLASS' : 'SAVE CLASS'}
                </Button>
                {isEditing && (
                  <Button type="button" onClick={() => { setIsEditing(false); setFormData({name: '', sections: []}); }} className="bg-zinc-700 hover:bg-zinc-600 text-white font-semibold">
                    CANCEL
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel - Data List */}
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Class List</h2>
              
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
                  <Button onClick={() => exportToCSV(exportData, 'Class_List')} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white" title="Download CSV">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => exportToExcel(exportData, 'Class_List')} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white text-emerald-500" title="Export Excel">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => printData('Class List', exportData)} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white text-rose-500" title="Print">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Class</th>
                    <th className="px-4 py-3 font-semibold">Sections</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr><td colSpan="3" className="px-4 py-4 text-center text-zinc-500">Loading...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 text-zinc-300">{item.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(item.sections || []).map((sec, idx) => (
                              <span key={idx} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                                {sec}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button onClick={() => handleEdit(item)} variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
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
