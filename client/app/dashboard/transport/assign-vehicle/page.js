'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Shuffle, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Bus, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';

export default function AssignVehiclePage() {
  const [assigns, setAssigns] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  const [formData, setFormData] = useState({ routeId: '', vehicleId: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAssign, setEditingAssign] = useState(null);
  const [editFormData, setEditFormData] = useState({ routeId: '', vehicleId: '' });
  const [editSaving, setEditSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aRes, rRes, vRes] = await Promise.all([
        api.get('/transport-assign'),
        api.get('/transport-route'),
        api.get('/transport-vehicle')
      ]);
      if (aRes?.success && Array.isArray(aRes.data)) setAssigns(aRes.data);
      if (rRes?.success && Array.isArray(rRes.data)) setRoutes(rRes.data);
      if (vRes?.success && Array.isArray(vRes.data)) setVehicles(vRes.data);
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
    if (!formData.routeId || !formData.vehicleId) {
      return alert('Both Route and Vehicle selection are required');
    }
    try {
      setSubmitting(true);
      const res = await api.post('/transport-assign', formData);
      if (res?.success) {
        setFormData({ routeId: '', vehicleId: '' });
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
      return alert('Both Route and Vehicle selection are required');
    }
    try {
      setEditSaving(true);
      const res = await api.put(`/transport-assign/${editingAssign._id}`, editFormData);
      if (res?.success) {
        setIsEditOpen(false);
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
        if (res?.success) fetchData();
        else alert(res?.message || 'Failed to delete assignment');
      } catch (error) {
        alert(error.message || 'Error deleting assignment');
      }
    }
  };

  const getRouteObj = (id) => routes.find(x => x._id === id);
  const getVehicleObj = (id) => vehicles.find(x => x._id === id);

  // KPIs
  const totalAssignments = assigns.length;
  const uniqueRoutesCovered = new Set(assigns.map(a => a.routeId)).size;
  const uniqueVehiclesDeployed = new Set(assigns.map(a => a.vehicleId)).size;

  const filtered = assigns.filter(a => {
    const route = getRouteObj(a.routeId);
    const vehicle = getVehicleObj(a.vehicleId);
    const routeTitle = (route?.title || '').toLowerCase();
    const vehicleNo = (vehicle?.vehicleNo || '').toLowerCase();
    const driverName = (vehicle?.driverName || '').toLowerCase();
    const q = search.toLowerCase();
    return routeTitle.includes(q) || vehicleNo.includes(q) || driverName.includes(q);
  });

  const exportData = filtered.map((a, i) => {
    const r = getRouteObj(a.routeId);
    const v = getVehicleObj(a.vehicleId);
    return {
      sl: i + 1,
      route: r?.title || 'Unknown Route',
      fare: r?.fare ? `PKR ${Number(r.fare).toLocaleString()}` : 'N/A',
      vehicleNo: v?.vehicleNo || 'Unknown Vehicle',
      driver: v?.driverName || 'Unassigned',
      capacity: v?.capacity || 'N/A',
      contact: v?.contact || 'N/A'
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Shuffle className="h-6 w-6 text-[#084A86]" />
            Assign Vehicle to Route
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Map school buses and vans to specific operational transit routes</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/transport" className="hover:text-zinc-600 transition-colors">Transport</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Assign Vehicle</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#084A86] flex items-center justify-center font-bold">
            <Shuffle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Assignments</p>
            <p className="text-xl font-bold text-zinc-950">{totalAssignments} Active Mappings</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Routes Covered</p>
            <p className="text-xl font-bold text-zinc-950">{uniqueRoutesCovered} of {routes.length} Routes</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Bus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Vehicles Deployed</p>
            <p className="text-xl font-bold text-zinc-950">{uniqueVehiclesDeployed} of {vehicles.length} Fleet</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Assign Vehicle */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#084A86]" />
                New Route Assignment
              </h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Select Route <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={formData.routeId} 
                  onChange={(val) => setFormData({ ...formData, routeId: val })}
                  placeholder="Select Transport Route *"
                  options={routes.map(r => ({ 
                    label: `${r.title} (PKR ${Number(r.fare || 0).toLocaleString()})`, 
                    value: r._id 
                  }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Select Vehicle <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={formData.vehicleId} 
                  onChange={(val) => setFormData({ ...formData, vehicleId: val })}
                  placeholder="Select Fleet Vehicle *"
                  options={vehicles.map(v => ({ 
                    label: `${v.vehicleNo} • ${v.capacity || 0} Seats • ${v.driverName || 'No Driver'}`, 
                    value: v._id 
                  }))}
                />
              </div>

              <Button 
                disabled={submitting} 
                type="submit" 
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-xl shadow-xs cursor-pointer mt-2"
              >
                {submitting ? 'Assigning...' : 'Assign Vehicle to Route'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Table: Assigned Vehicle List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Assigned Fleet Directory ({assigns.length})</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Active route and vehicle pairings across the school fleet</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search route, vehicle, driver..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8.5 h-9 bg-white border-zinc-200 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 border-b border-zinc-100 bg-white">
              <TableExportToolbar 
                data={exportData}
                columns={[
                  { key: 'sl', label: 'SL' },
                  { key: 'route', label: 'Route Title' },
                  { key: 'fare', label: 'Monthly Fare' },
                  { key: 'vehicleNo', label: 'Vehicle No' },
                  { key: 'driver', label: 'Driver' },
                  { key: 'capacity', label: 'Capacity' },
                  { key: 'contact', label: 'Driver Contact' }
                ]}
                fileName="Transport_Assigned_Vehicles"
              />
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-zinc-500 uppercase bg-zinc-50/80 border-b border-zinc-200 font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-14">SL</th>
                    <th className="px-4 py-3">Route Title</th>
                    <th className="px-4 py-3">Assigned Vehicle</th>
                    <th className="px-4 py-3">Driver Info</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-zinc-400 font-medium text-xs">
                        Loading route assignments...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                        <Shuffle className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                        <p className="font-semibold text-sm">No vehicle assignments found</p>
                        <p className="text-xs text-zinc-400 mt-1">Map a vehicle to a route using the form on the left</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => {
                      const route = getRouteObj(item.routeId);
                      const vehicle = getVehicleObj(item.vehicleId);
                      return (
                        <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="px-4 py-3.5 text-zinc-400 font-mono text-xs">
                            {String(idx + 1).padStart(2, '0')}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-[#084A86]" />
                              {route?.title || <span className="text-zinc-400 italic">Route Deleted</span>}
                            </div>
                            {route?.fare && (
                              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                                PKR {Number(route.fare).toLocaleString()} / month
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {vehicle ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#084A86] border border-blue-100 font-mono text-xs font-bold">
                                <Bus className="h-3 w-3" />
                                {vehicle.vehicleNo}
                              </span>
                            ) : (
                              <span className="text-rose-600 text-xs italic">Vehicle Removed</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-800 text-xs">
                            <p className="font-semibold text-zinc-950">{vehicle?.driverName || 'Unassigned'}</p>
                            {vehicle?.contact && (
                              <p className="text-zinc-500 font-mono text-[11px]">{vehicle.contact}</p>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-700">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
                              <Users className="h-3 w-3 text-zinc-500" />
                              {vehicle?.capacity || 0} Seats
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                onClick={() => handleOpenEdit(item)}
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-zinc-600 hover:text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                                title="Edit Assignment"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                onClick={() => handleDelete(item._id)} 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete Assignment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Assignment Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <Shuffle className="h-5 w-5 text-[#084A86]" />
                <h3 className="text-base font-bold text-zinc-950">Edit Vehicle Assignment</h3>
              </div>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Select Route <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={editFormData.routeId} 
                  onChange={(val) => setEditFormData({ ...editFormData, routeId: val })}
                  placeholder="Select Transport Route *"
                  options={routes.map(r => ({ 
                    label: `${r.title} (PKR ${Number(r.fare || 0).toLocaleString()})`, 
                    value: r._id 
                  }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Select Vehicle <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={editFormData.vehicleId} 
                  onChange={(val) => setEditFormData({ ...editFormData, vehicleId: val })}
                  placeholder="Select Fleet Vehicle *"
                  options={vehicles.map(v => ({ 
                    label: `${v.vehicleNo} • ${v.capacity || 0} Seats • ${v.driverName || 'No Driver'}`, 
                    value: v._id 
                  }))}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl h-10 px-4 font-semibold text-xs border-zinc-300"
                >
                  Cancel
                </Button>
                <Button 
                  disabled={editSaving} 
                  type="submit" 
                  style={{ backgroundColor: '#084A86' }}
                  className="rounded-xl h-10 px-5 font-bold text-xs text-white hover:opacity-95"
                >
                  {editSaving ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
