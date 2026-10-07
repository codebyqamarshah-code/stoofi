'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Search,
  Download,
  Printer,
  FileText,
  Trash2,
  Edit,
  BookOpen,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function SubjectPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    type: 'Theory', 
    category: 'Compulsory', 
    author: '' 
  });
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
      alert("Subject Name is required");
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
      setFormData({ name: '', code: '', type: 'Theory', category: 'Compulsory', author: '' });
      setIsEditing(false);
      setEditId(null);
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({ 
      name: item.name, 
      code: item.code || '', 
      type: item.type || 'Theory', 
      category: item.category || 'Compulsory', 
      author: item.author || '' 
    });
    setIsEditing(true);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
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
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = filteredData.map(item => ({
    'Subject Name': item.name,
    'Subject Code': item.code,
    'Category': item.category || 'Compulsory',
    'Subject Type': item.type,
    'Author': item.author || '-'
  }));

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Optional / Elective':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Additional':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Compulsory':
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Subjects Directory</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage school curriculum subjects, allocation schemes, and syllabus types</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-900 transition-colors">Academics</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Subjects</span>
        </div>
      </div>

      {/* Info Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Compulsory</h4>
            <p className="text-xs text-emerald-800 mt-0.5 font-medium leading-relaxed">
              Automatically assigned to all students enrolled in the class.
            </p>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-600 text-white shrink-0 mt-0.5">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">Optional / Elective</h4>
            <p className="text-xs text-amber-800 mt-0.5 font-medium leading-relaxed">
              Student selects from available elective choices (e.g. Bio vs CS).
            </p>
          </div>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">Additional</h4>
            <p className="text-xs text-indigo-800 mt-0.5 font-medium leading-relaxed">
              Extra subject beyond the normal scheme, if institution permits.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-base font-bold text-zinc-950">{isEditing ? 'Edit Subject' : 'Add New Subject'}</h2>
            </div>
            
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Subject Name <span className="text-rose-500">*</span></Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Mathematics, Biology" 
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Subject Code</Label>
                <Input 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="e.g. MTH101, BIO202" 
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>

              {/* Subject Category / Allocation Scheme */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                  Subject Category <span className="text-rose-500">*</span>
                </Label>
                <div className="space-y-2">
                  {[
                    { id: 'Compulsory', label: 'Compulsory', desc: 'Automatically assigned to all students' },
                    { id: 'Optional / Elective', label: 'Optional / Elective', desc: 'Student selects from available choices' },
                    { id: 'Additional', label: 'Additional', desc: 'Extra subject beyond the normal scheme' }
                  ].map((cat) => (
                    <label 
                      key={cat.id} 
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        formData.category === cat.id 
                          ? 'border-zinc-950 bg-zinc-50/80 shadow-xs' 
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="subjectCategory" 
                        checked={formData.category === cat.id} 
                        onChange={() => setFormData({...formData, category: cat.id})}
                        className="mt-0.5 text-zinc-950 border-zinc-300 focus:ring-zinc-500" 
                      />
                      <div className="text-xs">
                        <span className="font-bold text-zinc-950 block">{cat.label}</span>
                        <span className="text-zinc-500 text-[11px] block mt-0.5">{cat.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subject Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Subject Type</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="subjectType" 
                      checked={formData.type === 'Theory'} 
                      onChange={() => setFormData({...formData, type: 'Theory'})}
                      className="w-4 h-4 text-zinc-950 border-zinc-300 focus:ring-zinc-500" 
                    />
                    <span className="text-sm font-semibold text-zinc-900">Theory</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="subjectType" 
                      checked={formData.type === 'Practical'} 
                      onChange={() => setFormData({...formData, type: 'Practical'})}
                      className="w-4 h-4 text-zinc-950 border-zinc-300 focus:ring-zinc-500" 
                    />
                    <span className="text-sm font-semibold text-zinc-900">Practical</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button type="submit" className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg">
                  {isEditing ? 'UPDATE SUBJECT' : 'SAVE SUBJECT'}
                </Button>
                {isEditing && (
                  <Button 
                    type="button" 
                    onClick={() => { 
                      setIsEditing(false); 
                      setFormData({ name: '', code: '', type: 'Theory', category: 'Compulsory', author: '' }); 
                    }} 
                    variant="outline" 
                    className="border-zinc-300 text-zinc-800 font-semibold"
                  >
                    CANCEL
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Subject List</h2>
                <p className="text-xs text-zinc-500">Total Subjects: {filteredData.length}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    placeholder="Search by name, code..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 h-9 w-full sm:w-64 font-medium" 
                  />
                </div>
                
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-zinc-200">
                  <Button onClick={() => exportToCSV(exportData, 'Subject_List')} variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100 text-zinc-600" title="Download CSV">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => exportToExcel(exportData, 'Subject_List')} variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100 text-zinc-600" title="Export Excel">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => printData('Subject List', exportData)} variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100 text-zinc-600" title="Print">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                  <tr>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="5" className="px-4 py-6 text-center text-zinc-500 font-medium">Loading subjects...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500 font-medium">No Subjects Available</td></tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3 text-zinc-950 font-bold">{item.name}</td>
                        <td className="px-4 py-3 text-zinc-800 font-mono text-xs">{item.code || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadge(item.category)}`}>
                            {item.category || 'Compulsory'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {item.type || 'Theory'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button onClick={() => handleEdit(item)} variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleDelete(item._id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50">
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
            
            <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium">
              <div>Showing {filteredData.length} entries</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
