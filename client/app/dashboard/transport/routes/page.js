'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  DollarSign, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [formData, setFormData] = useState({ title: '', fare: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', fare: '' });
  const [editSaving, setEditSaving] = useState(false);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transport-route');
      if (res?.success && Array.isArray(res.data)) setRoutes(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.fare) return alert('Route Title and Fare are required');
    try {
      setSubmitting(true);
      const res = await api.post('/transport-route', formData);
      if (res?.success) {
        setFormData({ title: '', fare: '' });
        fetchRoutes();
      } else {
        alert(res?.message || 'Failed to save route');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (route) => {
    setEditingRoute(route);
    setEditFormData({ title: route.title || '', fare: route.fare || '' });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim() || !editFormData.fare) return alert('Title and fare are required');
    try {
      setEditSaving(true);
      const res = await api.put(`/transport-route/${editingRoute._id}`, editFormData);
      if (res?.success) {
        setIsEditOpen(false);
        fetchRoutes();
      } else {
        alert(res?.message || 'Failed to update route');
      }
    } catch (err) {
      alert('Failed to update route');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this route?')) {
      try {
        const res = await api.delete(`/transport-route/${id}`);
        if (res?.success) fetchRoutes();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter(r => 
      (r.title || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [routes, search]);

  const exportColumns = [
    { key: 'title', label: 'Route Title' },
    { key: 'fare', label: 'Monthly Fare (PKR)' }
  ];

  const exportData = filteredRoutes.map(r => ({
    title: r.title,
    fare: Number(r.fare || 0)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[#084A86]" />
            Transport Routes
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Configure school bus routes, pickup points, and monthly transport fares</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/transport" className="hover:text-zinc-600 transition-colors">Transport</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Routes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Route */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#084A86]" />
                Add New Route
              </h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Route Title <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="e.g. Model Town to School Main Campus"
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-10 rounded-xl" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Monthly Fare (PKR) <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">PKR</span>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="3500"
                    value={formData.fare} 
                    onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                    className="pl-12 h-10 rounded-xl font-bold font-mono" 
                    required
                  />
                </div>
              </div>

              <Button 
                disabled={submitting} 
                type="submit" 
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-xl shadow-xs cursor-pointer"
              >
                {submitting ? 'Saving...' : 'Save Transport Route'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Table: Routes List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Route Directory ({routes.length})</h2>
                <p className="text-xs text-zinc-500 mt-0.5">List of all active transport routes and monthly fares</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search route..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-white border-zinc-200 rounded-xl"
                  />
                </div>

                <TableExportToolbar
                  data={exportData}
                  columns={exportColumns}
                  filename="Transport_Routes_Report"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3.5 font-bold w-14">#</th>
                    <th className="px-4 py-3.5 font-bold">Route Title</th>
                    <th className="px-4 py-3.5 font-bold">Monthly Fare</th>
                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-12 text-center text-zinc-500">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          Loading routes...
                        </div>
                      </td>
                    </tr>
                  ) : filteredRoutes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-12 text-center text-zinc-500">
                        No routes found. Create your first transport route using the form.
                      </td>
                    </tr>
                  ) : (
                    filteredRoutes.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-zinc-500 text-xs">#{idx + 1}</td>
                        <td className="px-4 py-3.5 font-bold text-zinc-950">
                          {item.title}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-emerald-700">
                          PKR {Number(item.fare || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              onClick={() => handleOpenEdit(item)} 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit Route"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(item._id)} 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Route"
                            >
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

            <div className="p-3 border-t border-zinc-200 text-xs text-zinc-500 bg-zinc-50/30">
              Showing {filteredRoutes.length} routes
            </div>
          </div>
        </div>
      </div>

      {/* Edit Route Modal */}
      {isEditOpen && editingRoute && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 text-zinc-950 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <Edit className="h-4 w-4 text-[#084A86]" />
                Edit Transport Route
              </h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Route Title *</Label>
                <Input 
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="h-10 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Monthly Fare (PKR) *</Label>
                <Input 
                  type="number"
                  min="0"
                  value={editFormData.fare}
                  onChange={e => setEditFormData({ ...editFormData, fare: e.target.value })}
                  className="h-10 rounded-xl font-bold font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs h-9 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editSaving}
                  style={{ backgroundColor: '#084A86' }}
                  className="hover:opacity-95 text-white font-bold text-xs h-9 px-4 rounded-xl cursor-pointer"
                >
                  {editSaving ? 'Updating...' : 'Update Route'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
