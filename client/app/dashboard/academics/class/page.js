'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Search, Layers, Edit, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

export default function ClassManagerPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  
  // Form states
  const [className, setClassName] = useState('');
  const [sections, setSections] = useState([]);
  const [sectionInput, setSectionInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/class');
      setClasses(sortClassesAcademic(res?.data || []));
    } catch (err) {
      console.error(err);
      showToast('Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openAddModal = () => {
    setEditingClass(null);
    setClassName('');
    setSections([]);
    setSectionInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setSections(cls.sections || []);
    setSectionInput('');
    setIsModalOpen(true);
  };

  const handleAddSection = () => {
    const val = sectionInput.trim();
    if (!val) return;
    
    // Capitalize first letter of section usually
    const formatted = val.charAt(0).toUpperCase() + val.slice(1);
    
    if (!sections.includes(formatted)) {
      setSections([...sections, formatted]);
    }
    setSectionInput('');
  };

  const handleRemoveSection = (secToRemove) => {
    setSections(sections.filter(s => s !== secToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;
    
    // Auto-add section if they typed one but forgot to press Add
    let finalSections = [...sections];
    if (sectionInput.trim()) {
      const formatted = sectionInput.trim().charAt(0).toUpperCase() + sectionInput.trim().slice(1);
      if (!finalSections.includes(formatted)) {
        finalSections.push(formatted);
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        name: className.trim(),
        sections: finalSections
      };

      if (editingClass) {
        await api.put(`/class/${editingClass._id}`, payload);
        showToast('Class updated successfully!');
      } else {
        await api.post('/class', payload);
        showToast('Class created successfully!');
      }

      setIsModalOpen(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Action failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (classId) => {
    if (!confirm('Are you sure you want to delete this class? This may affect assigned students.')) return;
    try {
      await api.delete(`/class/${classId}`);
      showToast('Class deleted successfully!');
      fetchClasses();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete class', 'error');
    }
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.sections && c.sections.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-semibold animate-in slide-in-from-top-2 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-rose-600" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Class & Sections</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage all academic classes and their respective sections</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-900 transition-colors">Academics</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Class</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Classes</p>
            <p className="text-3xl font-black text-zinc-950 mt-1">{classes.length}</p>
          </div>
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
            <Layers className="w-6 h-6 text-zinc-900" />
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Sections</p>
            <p className="text-3xl font-black text-zinc-950 mt-1">
              {classes.reduce((acc, curr) => acc + (curr.sections ? curr.sections.length : 0), 0)}
            </p>
          </div>
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
            <Layers className="w-6 h-6 text-zinc-900" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        
        <div className="p-4 sm:p-5 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search classes or sections..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-950 font-medium" 
            />
          </div>
          <Button onClick={openAddModal} className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold whitespace-nowrap shadow-xs">
            <Plus className="h-4 w-4 mr-2" /> ADD CLASS
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-zinc-700 text-xs font-bold uppercase tracking-wider border-b border-zinc-200">
                <th className="px-6 py-4">Class Name</th>
                <th className="px-6 py-4">Sections</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-zinc-500 font-medium">Loading classes...</td></tr>
              ) : filteredClasses.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-zinc-500 font-medium">No classes found. Add one to get started.</td></tr>
              ) : (
                filteredClasses.map((cls) => (
                  <tr key={cls._id} className="hover:bg-zinc-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-950 text-sm">{cls.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(!cls.sections || cls.sections.length === 0) && (
                          <span className="text-xs text-zinc-400 italic">No sections</span>
                        )}
                        {cls.sections && cls.sections.map((sec, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-zinc-100 text-zinc-900 border border-zinc-200">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(cls)} className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(cls._id)} className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-bold text-zinc-950">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-950">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class Name <span className="text-rose-500">*</span></Label>
                <Input 
                  value={className} 
                  onChange={(e) => setClassName(e.target.value)} 
                  placeholder="e.g. Nursery, Class 1, O-Levels" 
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium" 
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Sections</Label>
                <div className="flex gap-2">
                  <Input 
                    value={sectionInput} 
                    onChange={(e) => setSectionInput(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSection(); } }} 
                    placeholder="e.g. A, B, Blue, Red" 
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium" 
                  />
                  <Button type="button" onClick={handleAddSection} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border border-zinc-200 font-bold whitespace-nowrap">
                    ADD
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-zinc-50 rounded-lg border border-zinc-200">
                  {sections.length === 0 ? (
                    <span className="text-xs text-zinc-700 italic py-1">No sections added yet</span>
                  ) : (
                    sections.map((sec, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 bg-white border border-zinc-200 rounded-md shadow-xs">
                        <span className="text-xs font-bold text-zinc-900">{sec}</span>
                        <button type="button" onClick={() => handleRemoveSection(sec)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded p-0.5 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Type section name and press Enter or ADD.</p>
              </div>

              <div className="pt-2 border-t border-zinc-100">
                <Button type="submit" disabled={submitting} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-10 shadow-xs">
                  {submitting ? 'SAVING...' : (editingClass ? 'UPDATE CLASS' : 'SAVE CLASS')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
