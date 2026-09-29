'use client';
import { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/class');
      setClasses(res?.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    const val = sectionInput.trim();
    if (!val) return;
    if (!sections.includes(val)) {
      setSections([...sections, val]);
    }
    setSectionInput('');
  };

  const handleRemoveSection = (secToRemove) => {
    setSections(sections.filter(s => s !== secToRemove));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;
    
    // Auto-add section if they typed one but forgot to press Add
    let finalSections = [...sections];
    if (sectionInput.trim() && !finalSections.includes(sectionInput.trim())) {
      finalSections.push(sectionInput.trim());
    }

    try {
      setSubmitting(true);
      const payload = { 
        name: className.trim(), 
        sections: finalSections 
      };

      if (editingClass) {
        await api.put(`/class/${editingClass._id}`, payload);
      } else {
        await api.post('/class', payload);
      }
      
      await fetchClasses();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save class:', error);
      alert(error?.response?.data?.message || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class? This cannot be undone.')) return;
    
    try {
      await api.delete(`/class/${id}`);
      await fetchClasses();
    } catch (error) {
      console.error('Failed to delete class:', error);
      alert('Failed to delete class');
    }
  };

  const filteredClasses = classes.filter(cls => {
    const term = searchTerm.toLowerCase();
    return cls.name.toLowerCase().includes(term) || (cls.sections && cls.sections.some(s => s.toLowerCase().includes(term)));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Class & Sections</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage academic classes and their associated sections.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search classes or sections..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-zinc-900 dark:text-white"
            />
          </div>
          <Button onClick={openAddModal} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold whitespace-nowrap shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> ADD CLASS
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4 font-semibold">Class Name</th>
                <th className="px-6 py-4 font-semibold">Sections</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-zinc-500">Loading classes...</td></tr>
              ) : filteredClasses.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-zinc-500">No classes found. Add one to get started.</td></tr>
              ) : (
                filteredClasses.map((cls) => (
                  <tr key={cls._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900 dark:text-white text-sm">{cls.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(!cls.sections || cls.sections.length === 0) && (
                          <span className="text-xs text-zinc-400 italic">No sections</span>
                        )}
                        {cls.sections && cls.sections.map((sec, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(cls)} className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(cls._id)} className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <h3 className="font-bold text-zinc-900 dark:text-white">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">Class Name <span className="text-rose-500">*</span></Label>
                <Input 
                  value={className} 
                  onChange={(e) => setClassName(e.target.value)} 
                  placeholder="e.g. Nursery, Class 1, O-Levels" 
                  className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 focus-visible:ring-emerald-500" 
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">Sections</Label>
                <div className="flex gap-2">
                  <Input 
                    value={sectionInput} 
                    onChange={(e) => setSectionInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSection(); } }}
                    placeholder="e.g. A, B, Blue, Red" 
                    className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 focus-visible:ring-emerald-500" 
                  />
                  <Button type="button" onClick={handleAddSection} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 font-bold whitespace-nowrap">
                    ADD
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {sections.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic py-1">No sections added yet</span>
                  ) : (
                    sections.map((sec, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{sec}</span>
                        <button type="button" onClick={() => handleRemoveSection(sec)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded p-0.5 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Type section name and press Enter or ADD.</p>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <Button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 shadow-sm">
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
