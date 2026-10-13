'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Bus, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Phone, 
  Users, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({ 
    vehicleNo: '', capacity: '', driverName: '', driverLicense: '', contact: '' 
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editFormData, setEditFormData] = useState({ 
    vehicleNo: '', capacity: '', driverName: '', driverLicense: '', contact: '' 
  });
  const [editSaving, setEditSaving] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transport-vehicle');
      if (res?.success && Array.isArray(res.data)) setVehicles(res.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleNo.trim()) return alert('Vehicle Number is required');
    try {
      setSubmitting(true);
      const res = await api.post('/transport-vehicle', {
        ...formData,
        capacity: formData.capacity ? Number(formData.capacity) : 0
      });
      if (res?.success) {
        setFormData({ vehicleNo: '', capacity: '', driverName: '', driverLicense: '', contact: '' });
        fetchVehicles();
      } else {
        alert(res?.message || 'Failed to save vehicle');
      }
    } catch (error) {
      alert(error.message || 'Error saving vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setEditFormData({
      vehicleNo: vehicle.vehicleNo || '',
      capacity: vehicle.capacity || '',
      driverName: vehicle.driverName || '',
      driverLicense: vehicle.driverLicense || '',
      contact: vehicle.contact || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.vehicleNo.trim()) return alert('Vehicle Number is required');
    try {
      setEditSaving(true);
      const res = await api.put(`/transport-vehicle/${editingVehicle._id}`, {
        ...editFormData,
        capacity: editFormData.capacity ? Number(editFormData.capacity) : 0
      });
      if (res?.success) {
        setIsEditOpen(false);
        fetchVehicles();
      } else {
        alert(res?.message || 'Failed to update vehicle');
      }
    } catch (err) {
      alert(err.message || 'Failed to update vehicle');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this vehicle from the fleet?')) {
      try {
        const res = await api.delete(`/transport-vehicle/${id}`);
        if (res?.success) fetchVehicles();
        else alert(res?.message || 'Failed to delete vehicle');
      } catch (error) {
        alert(error.message || 'Error deleting vehicle');
      }
    }
  };

  // KPIs
  const totalFleet = vehicles.length;
  const totalCapacity = useMemo(() => {
    return vehicles.reduce((sum, v) => sum + (Number(v.capacity) || 0), 0);
  }, [vehicles]);
  const driversCount = useMemo(() => {
    return vehicles.filter(v => v.driverName && v.driverName.trim()).length;
  }, [vehicles]);

  const filtered = vehicles.filter(v => 
    (v.vehicleNo || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.driverName || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.driverLicense || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.contact || '').includes(search)
  );

  const exportData = filtered.map((v, i) => ({
    sl: i + 1,
    vehicleNo: v.vehicleNo,
    capacity: v.capacity || 0,
    driverName: v.driverName || 'Unassigned',
    driverLicense: v.driverLicense || 'N/A',
    contact: v.contact || 'N/A'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Bus className="h-6 w-6 text-[#084A86]" />
            Fleet Vehicles
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Manage school transport buses, passenger capacities, and drivers</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/transport" className="hover:text-zinc-600 transition-colors">Transport</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Vehicles</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#084A86] flex items-center justify-center font-bold">
            <Bus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Fleet</p>
            <p className="text-xl font-bold text-zinc-950">{totalFleet} Vehicles</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Capacity</p>
            <p className="text-xl font-bold text-zinc-950">{totalCapacity} Passengers</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Licensed Drivers</p>
            <p className="text-xl font-bold text-zinc-950">{driversCount} On Record</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Vehicle */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#084A86]" />
                Register New Vehicle
              </h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Vehicle No <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  placeholder="e.g. LHR-4592 or BUS-01"
                  value={formData.vehicleNo} 
                  onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                  className="h-10 rounded-xl font-semibold uppercase tracking-wider" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Passenger Capacity</Label>
                <Input 
                  type="number"
                  min="1"
                  placeholder="e.g. 35"
                  value={formData.capacity} 
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="h-10 rounded-xl" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Driver Name</Label>
                <Input 
                  placeholder="e.g. Muhammad Aslam"
                  value={formData.driverName} 
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className="h-10 rounded-xl" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Driver License Number</Label>
                <Input 
                  placeholder="e.g. DL-98234-A"
                  value={formData.driverLicense} 
                  onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                  className="h-10 rounded-xl uppercase" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Driver Contact Phone</Label>
                <Input 
                  placeholder="e.g. 0300-1234567"
                  value={formData.contact} 
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="h-10 rounded-xl" 
                />
              </div>

              <Button 
                disabled={submitting} 
                type="submit" 
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-xl shadow-xs cursor-pointer"
              >
                {submitting ? 'Registering...' : 'Save Fleet Vehicle'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Table: Vehicle List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Vehicle Directory ({vehicles.length})</h2>
                <p className="text-xs text-zinc-500 mt-0.5">List of all registered school buses, vans, and drivers</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search vehicle or driver..." 
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
                  { key: 'vehicleNo', label: 'Vehicle No' },
                  { key: 'capacity', label: 'Capacity' },
                  { key: 'driverName', label: 'Driver Name' },
                  { key: 'driverLicense', label: 'Driver License' },
                  { key: 'contact', label: 'Contact Phone' }
                ]}
                fileName="Transport_Fleet_Vehicles"
              />
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-zinc-500 uppercase bg-zinc-50/80 border-b border-zinc-200 font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-14">SL</th>
                    <th className="px-4 py-3">Vehicle No</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Driver Name</th>
                    <th className="px-4 py-3">Driver License</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-zinc-400 font-medium text-xs">
                        Loading fleet vehicles...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-zinc-500">
                        <Bus className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                        <p className="font-semibold text-sm">No vehicles found</p>
                        <p className="text-xs text-zinc-400 mt-1">Register a new vehicle using the form on the left</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-zinc-400 font-mono text-xs">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-zinc-950">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#084A86] border border-blue-100 font-mono text-xs">
                            <Bus className="h-3 w-3" />
                            {item.vehicleNo}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-700 font-medium">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
                            <Users className="h-3 w-3 text-zinc-500" />
                            {item.capacity || 0} Seats
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-800 font-semibold">
                          {item.driverName || <span className="text-zinc-400 font-normal italic">Unassigned</span>}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600 font-mono text-xs">
                          {item.driverLicense || <span className="text-zinc-400 font-sans italic">N/A</span>}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600 text-xs">
                          {item.contact ? (
                            <a 
                              href={`tel:${item.contact}`} 
                              className="inline-flex items-center gap-1 text-[#084A86] hover:underline font-medium"
                            >
                              <Phone className="h-3 w-3" />
                              {item.contact}
                            </a>
                          ) : (
                            <span className="text-zinc-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              onClick={() => handleOpenEdit(item)}
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-zinc-600 hover:text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit Vehicle"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(item._id)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Vehicle"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

      {/* Edit Vehicle Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-[#084A86]" />
                <h3 className="text-base font-bold text-zinc-950">Edit Vehicle Information</h3>
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
                  Vehicle No <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={editFormData.vehicleNo} 
                  onChange={(e) => setEditFormData({ ...editFormData, vehicleNo: e.target.value })}
                  className="h-10 rounded-xl font-semibold uppercase tracking-wider" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Passenger Capacity</Label>
                <Input 
                  type="number"
                  min="1"
                  value={editFormData.capacity} 
                  onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })}
                  className="h-10 rounded-xl" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Driver Name</Label>
                <Input 
                  value={editFormData.driverName} 
                  onChange={(e) => setEditFormData({ ...editFormData, driverName: e.target.value })}
                  className="h-10 rounded-xl" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Driver License Number</Label>
                <Input 
                  value={editFormData.driverLicense} 
                  onChange={(e) => setEditFormData({ ...editFormData, driverLicense: e.target.value })}
                  className="h-10 rounded-xl uppercase" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Driver Contact Phone</Label>
                <Input 
                  value={editFormData.contact} 
                  onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                  className="h-10 rounded-xl" 
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
