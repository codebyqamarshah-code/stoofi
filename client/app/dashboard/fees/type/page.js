'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Trash2, Edit2, Tag, X } from 'lucide-react';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

export default function FeesTypePage() {
  const [types, setTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');
  const [feesGroup, setFeesGroup] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [editingType, setEditingType] = useState(null);
  const [editName, setEditName] = useState('');
  const [editFeesGroup, setEditFeesGroup] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [typeRes, groupRes] = await Promise.all([
        api.get('/fees/type'),
        api.get('/fees/group')
      ]);
      if (typeRes?.success && Array.isArray(typeRes.data)) setTypes(typeRes.data);
      if (groupRes?.success && Array.isArray(groupRes.data)) setGroups(groupRes.data);
    } catch (error) {
      console.error('Error fetching fees types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !feesGroup) {
      return alert('Fee type name and Fees Group are required');
    }
    try {
      setSubmitting(true);
      const res = await api.post('/fees/type', { 
        name: name.trim(), 
        feesGroup, 
        description: description.trim() 
      });
      if (res?.success) {
        setName('');
        setFeesGroup('');
        setDescription('');
        fetchData();
      }
    } catch (error) {
      alert(error.message || 'Failed to save fee type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (t) => {
    setEditingType(t);
    setEditName(t.name);
    setEditFeesGroup(t.feesGroup?._id || t.feesGroup || '');
    setEditDescription(t.description || '');
    setIsEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editFeesGroup) {
      return alert('Fee type name and Fees Group are required');
    }
    try {
      setSubmitting(true);
      const res = await api.put(`/fees/type/${editingType._id}`, {
        name: editName.trim(),
        feesGroup: editFeesGroup,
        description: editDescription.trim()
      });
      if (res?.success) {
        setIsEditOpen(false);
        setEditingType(null);
        fetchData();
      }
    } catch (error) {
      alert(error.message || 'Failed to update fee type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this fee type?')) {
      try {
        const res = await api.delete(`/fees/type/${id}`);
        if (res?.success) fetchData();
      } catch (error) {
        alert(error.message || 'Failed to delete fee type');
      }
    }
  };

  const filteredTypes = types.filter(t => 
    (t.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (t.feesGroup?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Fees Type</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage individual fee heads (Tuition, Admission, Sports, Exam, Bus, etc.).</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/fees" className="hover:text-zinc-900 transition-colors">Fees</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Fees Type</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Fee Type */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#084A86]" /> Add Fees Type
              </h2>
            </div>
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Type Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Monthly Tuition, Annual Charges"
                  className="bg-white border-zinc-300 text-zinc-950 text-sm rounded-xl focus-visible:ring-[#084A86]" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Fees Group <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  name="feesGroup"
                  value={feesGroup}
                  onChange={(val) => setFeesGroup(val?.target ? val.target.value : val)}
                  placeholder="Select Fees Group *"
                  options={groups.map(g => ({ label: g.name, value: g._id }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Description
                </Label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional billing notes..."
                  className="flex min-h-[90px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#084A86]" 
                />
              </div>

              <Button 
                disabled={submitting} 
                type="submit" 
                className="w-full bg-[#084A86] hover:bg-[#063968] text-white font-bold text-xs h-10 rounded-xl shadow-xs"
              >
                {submitting ? 'SAVING...' : 'SAVE FEES TYPE'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Table: Fee Type List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Fees Type List</h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#084A86] border border-blue-200">
                  {filteredTypes.length} Total
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-48 sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search type or group..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 bg-white border-zinc-300 text-zinc-950 text-xs rounded-xl focus-visible:ring-[#084A86]"
                  />
                </div>
                <TableExportToolbar />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3">Type Name</th>
                    <th className="px-4 py-3">Fees Group</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-zinc-500 font-medium">Loading fee types...</td>
                    </tr>
                  ) : filteredTypes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-zinc-500 font-medium">
                        No Fee Types Available. Create a fee type to attach to student vouchers.
                      </td>
                    </tr>
                  ) : (
                    filteredTypes.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-zinc-950 text-sm">
                          {item.name}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {item.feesGroup?.name || 'General Group'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600">
                          {item.description || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1">
                          <Button 
                            onClick={() => handleOpenEdit(item)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2.5 text-[#084A86] hover:bg-blue-50 rounded-lg text-xs font-semibold"
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          <Button 
                            onClick={() => handleDelete(item._id)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                          </Button>
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

      {/* Edit Fees Type Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Edit Fees Type</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Type Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-950 text-sm rounded-xl focus-visible:ring-[#084A86]" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Fees Group <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  name="editFeesGroup"
                  value={editFeesGroup}
                  onChange={(val) => setEditFeesGroup(val?.target ? val.target.value : val)}
                  placeholder="Select Fees Group *"
                  options={groups.map(g => ({ label: g.name, value: g._id }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Description
                </Label>
                <textarea 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="flex min-h-[90px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#084A86]" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl text-xs h-9"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-[#084A86] hover:bg-[#063968] text-white text-xs font-bold h-9 rounded-xl px-5"
                >
                  {submitting ? 'Updating...' : 'Update Type'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
