'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [formData, setFormData] = useState({ title: '', fare: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', fare: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transport-route');
      if (res?.success && Array.isArray(res.data)) {
        setRoutes(res.data);
      } else {
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Route Title is required');
      return;
    }
    if (formData.fare === '' || isNaN(Number(formData.fare))) {
      alert('Valid Fare is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/transport-route', {
        title: formData.title.trim(),
        fare: Number(formData.fare)
      });
      if (res?.success) {
        setFormData({ title: '', fare: '' });
        setMessage({ type: 'success', text: 'Route saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
        fetchRoutes();
      } else {
        alert(res?.message || 'Failed to save route');
      }
    } catch (error) {
      alert(error.message || 'Error saving route');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (route) => {
    setEditingRoute(route);
    setEditFormData({ title: route.title || '', fare: route.fare ?? '' });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim()) return alert('Route Title is required');
    try {
      setEditSaving(true);
      const res = await api.put(`/transport-route/${editingRoute._id}`, {
        title: editFormData.title.trim(),
        fare: Number(editFormData.fare) || 0
      });
      if (res?.success) {
        setIsEditOpen(false);
        setMessage({ type: 'success', text: 'Route updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
        fetchRoutes();
      } else {
        alert(res?.message || 'Failed to update route');
      }
    } catch (err) {
      alert(err.message || 'Failed to update route');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this route?')) {
      try {
        const res = await api.delete(`/transport-route/${id}`);
        if (res?.success) {
          setMessage({ type: 'success', text: 'Route deleted successfully!' });
          setTimeout(() => setMessage(null), 3000);
          fetchRoutes();
        } else {
          alert(res?.message || 'Failed to delete route');
        }
      } catch (error) {
        alert(error.message || 'Error deleting route');
      }
    }
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter(r => 
      (r.title || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [routes, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / pageSize));
  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoutes.slice(start, start + pageSize);
  }, [filteredRoutes, currentPage]);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs matching reference screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-[#0c3559] tracking-tight">Routes</h1>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <Link href="/dashboard/transport/routes" className="hover:text-zinc-600 transition-colors">Transport</Link>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <span className="text-zinc-700 font-semibold">Routes</span>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid: Add Route (Left) and Route List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Add Route Form */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-bold text-[#0c3559]">Add Route</h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                  ROUTE TITLE <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-10 border-zinc-200 rounded-lg text-sm bg-white focus-visible:ring-1 focus-visible:ring-[#084A86]" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                  FARE ($) <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  type="number" 
                  step="any"
                  min="0"
                  value={formData.fare} 
                  onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                  className="h-10 border-zinc-200 rounded-lg text-sm bg-white focus-visible:ring-1 focus-visible:ring-[#084A86]" 
                  required
                />
              </div>

              <Button 
                disabled={submitting} 
                type="submit" 
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-lg shadow-xs cursor-pointer uppercase tracking-wider text-xs"
              >
                {submitting ? 'SAVING...' : 'SAVE ROUTE'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Route List Table */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-[#0c3559]">Route List</h2>

              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input 
                  placeholder="SEARCH" 
                  value={search} 
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="pl-8.5 h-8.5 text-xs bg-white border-zinc-200 rounded-lg uppercase tracking-wider text-zinc-700 placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-[#0c3559] uppercase font-bold bg-[#f8fafc] border-b border-zinc-100">
                  <tr>
                    <th className="px-5 py-3 font-bold w-16">SL</th>
                    <th className="px-5 py-3 font-bold">ROUTE TITLE</th>
                    <th className="px-5 py-3 font-bold">FARE ($)</th>
                    <th className="px-5 py-3 font-bold text-right w-24">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-16 text-center text-zinc-400">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          <span>Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRoutes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-16 text-center text-sm font-medium text-zinc-400">
                        No Data Available In Table
                      </td>
                    </tr>
                  ) : (
                    paginatedRoutes.map((route, idx) => (
                      <tr key={route._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-5 py-3.5 text-zinc-600 font-semibold">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#0c3559]">
                          {route.title}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-800 font-semibold font-mono">
                          ${Number(route.fare || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleOpenEdit(route)}
                              className="p-1.5 text-zinc-400 hover:text-[#084A86] hover:bg-zinc-100 rounded-md transition"
                              title="Edit Route"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(route._id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 rounded-md transition"
                              title="Delete Route"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer with green active circle indicator matching reference */}
            <div className="p-4 border-t border-zinc-100 flex items-center justify-center">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      currentPage === i + 1 
                        ? 'border-2 border-emerald-500 bg-white text-emerald-600 shadow-2xs' 
                        : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Route Modal */}
      {isEditOpen && editingRoute && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-5 text-zinc-950 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#0c3559] uppercase tracking-wider">
                Edit Route
              </h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">ROUTE TITLE *</Label>
                <Input 
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="h-10 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">FARE ($) *</Label>
                <Input 
                  type="number"
                  step="any"
                  min="0"
                  value={editFormData.fare}
                  onChange={e => setEditFormData({ ...editFormData, fare: e.target.value })}
                  className="h-10 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs h-9 rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editSaving}
                  style={{ backgroundColor: '#084A86' }}
                  className="hover:opacity-95 text-white font-bold text-xs h-9 px-4 rounded-lg cursor-pointer"
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
