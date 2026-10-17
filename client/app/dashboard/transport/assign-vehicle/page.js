'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Plus,
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

export default function AssignVehiclePage() {
  const [assigns, setAssigns] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  const [formData, setFormData] = useState({ routeId: '', vehicleId: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAssign, setEditingAssign] = useState(null);
  const [editFormData, setEditFormData] = useState({ routeId: '', vehicleId: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchData = async () => {
    try {
      setLoading(true);

      const [aRes, rRes, vRes] = await Promise.allSettled([
        api.get('/transport-assign'),
        api.get('/transport-route'),
        api.get('/transport-vehicle')
      ]);

      if (aRes.status === 'fulfilled' && aRes.value?.success && Array.isArray(aRes.value.data)) {
        setAssigns(aRes.value.data);
      } else {
        setAssigns([]);
      }

      if (rRes.status === 'fulfilled' && rRes.value?.success && Array.isArray(rRes.value.data)) {
        setRoutes(rRes.value.data);
      } else {
        setRoutes([]);
      }

      if (vRes.status === 'fulfilled' && vRes.value?.success && Array.isArray(vRes.value.data)) {
        setVehicles(vRes.value.data);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching assign data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.routeId) {
      alert('Please select a Route');
      return;
    }
    if (!formData.vehicleId) {
      alert('Please select a Vehicle');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/transport-assign', formData);
      if (res?.success) {
        setFormData({ routeId: '', vehicleId: '' });
        setMessage({ type: 'success', text: 'Vehicle assigned to route successfully!' });
        setTimeout(() => setMessage(null), 3000);
        fetchData();
      } else {
        alert(res?.message || 'Failed to save vehicle assignment');
      }
    } catch (error) {
      alert(error.message || 'Error creating assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (assign) => {
    setEditingAssign(assign);
    setEditFormData({
      routeId: assign.routeId || '',
      vehicleId: assign.vehicleId || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.routeId || !editFormData.vehicleId) {
      return alert('Both Route and Vehicle are required');
    }
    try {
      setEditSaving(true);
      const res = await api.put(`/transport-assign/${editingAssign._id}`, editFormData);
      if (res?.success) {
        setIsEditOpen(false);
        setMessage({ type: 'success', text: 'Assignment updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
        fetchData();
      } else {
        alert(res?.message || 'Failed to update assignment');
      }
    } catch (err) {
      alert(err.message || 'Failed to update assignment');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to remove this vehicle assignment?')) {
      try {
        const res = await api.delete(`/transport-assign/${id}`);
        if (res?.success) {
          setMessage({ type: 'success', text: 'Assignment deleted successfully!' });
          setTimeout(() => setMessage(null), 3000);
          fetchData();
        } else {
          alert(res?.message || 'Failed to delete assignment');
        }
      } catch (error) {
        alert(error.message || 'Error deleting assignment');
      }
    }
  };

  const getRouteObj = (id) => routes.find(x => String(x._id) === String(id));
  const getVehicleObj = (id) => vehicles.find(x => String(x._id) === String(id));

  const filteredAssigns = useMemo(() => {
    return assigns.filter(a => {
      const r = getRouteObj(a.routeId);
      const v = getVehicleObj(a.vehicleId);
      const routeTitle = (r?.title || a.routeTitle || '').toLowerCase();
      const vehicleNo = (v?.vehicleNo || a.vehicleNo || '').toLowerCase();
      const driverName = (v?.driverName || a.driverName || '').toLowerCase();
      const q = search.toLowerCase();
      return routeTitle.includes(q) || vehicleNo.includes(q) || driverName.includes(q);
    });
  }, [assigns, routes, vehicles, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAssigns.length / pageSize));
  const paginatedAssigns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssigns.slice(start, start + pageSize);
  }, [filteredAssigns, currentPage]);

  const routeOptions = useMemo(() => {
    return routes.map(r => ({
      label: `${r.title} ($${Number(r.fare || 0).toLocaleString()})`,
      value: String(r._id)
    }));
  }, [routes]);

  const vehicleOptions = useMemo(() => {
    return vehicles.map(v => ({
      label: `${v.vehicleNo}${v.driverName ? ` (${v.driverName})` : ''}`,
      value: String(v._id)
    }));
  }, [vehicles]);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs matching reference screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-[#0c3559] tracking-tight">Assign Vehicle</h1>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <Link href="/dashboard/transport/routes" className="hover:text-zinc-600 transition-colors">Transport</Link>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <span className="text-zinc-700 font-semibold">Assign Vehicle</span>
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

      {/* Main Grid: Add Assign Vehicle (Left) and Assigned Vehicle List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Add Assign Vehicle Form */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-bold text-[#0c3559]">Add Assign Vehicle</h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                    SELECT ROUTE <span className="text-rose-500">*</span>
                  </Label>
                  {routes.length === 0 && !loading && (
                    <Link href="/dashboard/transport/routes" className="text-[11px] font-bold text-blue-600 hover:underline">
                      + Add Route
                    </Link>
                  )}
                </div>
                <SearchableSelect 
                  value={formData.routeId} 
                  onChange={(val) => setFormData({ ...formData, routeId: val })}
                  placeholder="Select Route"
                  options={routeOptions}
                />
                {routes.length === 0 && !loading && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                    No routes found. Please create a route in the <strong>Routes</strong> page first.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                    SELECT VEHICLE <span className="text-rose-500">*</span>
                  </Label>
                  {vehicles.length === 0 && !loading && (
                    <Link href="/dashboard/transport/vehicle" className="text-[11px] font-bold text-blue-600 hover:underline">
                      + Add Vehicle
                    </Link>
                  )}
                </div>
                <SearchableSelect 
                  value={formData.vehicleId} 
                  onChange={(val) => setFormData({ ...formData, vehicleId: val })}
                  placeholder="Select Vehicle"
                  options={vehicleOptions}
                />
                {vehicles.length === 0 && !loading && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                    No vehicles found. Please register a vehicle in the <strong>Vehicle</strong> page first.
                  </p>
                )}
              </div>

              <Button 
                disabled={submitting} 
                type="submit" 
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-lg shadow-xs cursor-pointer uppercase tracking-wider text-xs"
              >
                {submitting ? 'SAVING...' : 'SAVE ASSIGN VEHICLE'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Assigned Vehicle List Table */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-[#0c3559]">Assigned Vehicle List</h2>

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
                    <th className="px-5 py-3 font-bold">ROUTE</th>
                    <th className="px-5 py-3 font-bold">VEHICLE</th>
                    <th className="px-5 py-3 font-bold">DRIVER</th>
                    <th className="px-5 py-3 font-bold text-right w-24">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-16 text-center text-zinc-400">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          <span>Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAssigns.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-16 text-center text-sm font-medium text-zinc-400">
                        No Data Available In Table
                      </td>
                    </tr>
                  ) : (
                    paginatedAssigns.map((assign, idx) => {
                      const r = getRouteObj(assign.routeId);
                      const v = getVehicleObj(assign.vehicleId);
                      const routeName = r?.title || assign.routeTitle || 'Unknown Route';
                      const vehicleName = v?.vehicleNo || assign.vehicleNo || 'Unknown Vehicle';
                      const driver = v?.driverName || assign.driverName || '—';

                      return (
                        <tr key={assign._id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="px-5 py-3.5 text-zinc-600 font-semibold">
                            {(currentPage - 1) * pageSize + idx + 1}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-[#0c3559]">
                            {routeName}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-zinc-800">
                            {vehicleName}
                          </td>
                          <td className="px-5 py-3.5 text-zinc-600">
                            {driver}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => handleOpenEdit(assign)}
                                className="p-1.5 text-zinc-400 hover:text-[#084A86] hover:bg-zinc-100 rounded-md transition"
                                title="Edit Assignment"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(assign._id)}
                                className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 rounded-md transition"
                                title="Delete Assignment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer with green active circle */}
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

      {/* Edit Assign Vehicle Modal */}
      {isEditOpen && editingAssign && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-5 text-zinc-950 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#0c3559] uppercase tracking-wider">
                Edit Assigned Vehicle
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
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">SELECT ROUTE *</Label>
                <SearchableSelect 
                  value={editFormData.routeId}
                  onChange={val => setEditFormData({ ...editFormData, routeId: val })}
                  placeholder="Select Route"
                  options={routeOptions}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">SELECT VEHICLE *</Label>
                <SearchableSelect 
                  value={editFormData.vehicleId}
                  onChange={val => setEditFormData({ ...editFormData, vehicleId: val })}
                  placeholder="Select Vehicle"
                  options={vehicleOptions}
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
                  {editSaving ? 'Updating...' : 'Update Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
