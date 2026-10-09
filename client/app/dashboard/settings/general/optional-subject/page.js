'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import React, { useState } from 'react';
import { Search, ChevronRight, CheckCircle2, AlertCircle, Trash2, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OptionalSubjectPage() {
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [gpaAbove, setGpaAbove] = useState('3.0');
  const [list, setList] = useState([
    { id: '1', className: 'Class 9', gpaAbove: '3.5' },
    { id: '2', className: 'Class 10', gpaAbove: '3.0' }
  ]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [editId, setEditId] = useState(null);

  const classes = ['Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 9', 'Class 10'];

  const showToast = (msg, isErr = false) => {
    setToast({ text: msg, isError: isErr });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedClass) {
      showToast('Please select a class.', true);
      return;
    }
    if (!gpaAbove || isNaN(gpaAbove)) {
      showToast('Please enter a valid GPA.', true);
      return;
    }

    if (editId) {
      setList(prev => prev.map(item => item.id === editId ? { ...item, className: selectedClass, gpaAbove } : item));
      showToast('Optional subject criteria updated successfully!');
      setEditId(null);
    } else {
      const exists = list.some(item => item.className === selectedClass);
      if (exists) {
        showToast(`Rule for ${selectedClass} already exists.`, true);
        return;
      }
      setList(prev => [...prev, { id: String(Date.now()), className: selectedClass, gpaAbove }]);
      showToast('Optional subject criteria saved successfully!');
    }
  };

  const handleDelete = (id) => {
    setList(prev => prev.filter(item => item.id !== id));
    showToast('Criteria removed successfully.');
  };

  const handleEdit = (item) => {
    setSelectedClass(item.className);
    setGpaAbove(item.gpaAbove);
    setEditId(item.id);
  };

  const filteredList = list.filter(item => 
    item.className.toLowerCase().includes(search.toLowerCase()) || 
    item.gpaAbove.includes(search)
  );

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950 font-sans space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-4 ${
            toast.isError ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toast.isError ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-zinc-400 hover:text-zinc-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div>
        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
          <span>Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>General Settings</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-950 font-bold">Assign Optional Subject</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">Assign Optional Subject</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Assign Optional Subject Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="border-b border-zinc-200 px-6 py-4 bg-zinc-50/60">
              <h2 className="text-sm font-bold text-zinc-950">
                {editId ? 'Edit Criteria' : 'Assign Optional Subject'}
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3">
                  SELECT CLASS <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {classes.map((cls) => (
                    <label key={cls} className="flex items-center gap-2 cursor-pointer hover:text-zinc-900">
                      <input 
                        type="radio" 
                        name="selectedClass" 
                        value={cls} 
                        checked={selectedClass === cls} 
                        onChange={() => setSelectedClass(cls)} 
                        className="w-4 h-4 accent-zinc-950 cursor-pointer" 
                      />
                      <span className="text-sm font-medium text-zinc-900">{cls}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
                  GPA ABOVE <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="number" 
                  value={gpaAbove} 
                  onChange={(e) => setGpaAbove(e.target.value)} 
                  className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900" 
                  step="0.01"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  type="submit"
                  className="w-full bg-[#084A86] hover:bg-[#073d6e] text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {editId ? 'UPDATE CRITERIA' : 'SAVE'}
                </Button>
                {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setEditId(null); setSelectedClass(classes[0]); setGpaAbove('3.0'); }}
                    className="w-full text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Optional Subject List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="border-b border-zinc-200 px-6 py-4 bg-zinc-50/60">
              <h2 className="text-sm font-bold text-zinc-950">Optional Subject List</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <TableExportToolbar />
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-zinc-400" />
                  </div>
                  <input 
                    type="text" 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..." 
                    className="pl-9 pr-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 w-full sm:w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold text-zinc-700 uppercase">
                      <th className="p-3">SL</th>
                      <th className="p-3">Class Name</th>
                      <th className="p-3">GPA Above</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs font-medium">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-zinc-500 font-medium">
                          No Data Available In Table
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((item, index) => (
                        <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-3 text-zinc-500 font-mono">{index + 1}</td>
                          <td className="p-3 font-semibold text-zinc-950">{item.className}</td>
                          <td className="p-3 text-zinc-800 font-mono">{item.gpaAbove}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                onClick={() => handleEdit(item)}
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button 
                                onClick={() => handleDelete(item.id)}
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
}