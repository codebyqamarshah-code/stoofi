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

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({ 
    vehicleNo: '', 
    vehicleModel: '', 
    yearMade: '', 
    capacity: '', 
    driverName: '', 
    driverLicense: '', 
    contact: '',
    note: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editFormData, setEditFormData] = useState({ 
    vehicleNo: '', 
    vehicleModel: '', 
    yearMade: '', 
    capacity: '', 
    driverName: '', 
    driverLicense: '', 
    contact: '',
    note: ''
  });
  const [editSaving, setEditSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transport-vehicle');
      if (res?.success && Array.isArray(res.data)) {
        setVehicles(res.data);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleNo.trim()) {
      alert('Vehicle Number is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/transport-vehicle', {
        ...formData,
        capacity: formData.capacity ? Number(formData.capacity) : 0
      });
      if (res?.success) {
        setFormData({ 
          vehicleNo: '', 
          vehicleModel: '', 
          yearMade: '', 
          capacity: '', 
          driverName: '', 
          driverLicense: '', 
          contact: '',
          note: ''
        });
        setMessage({ type: 'success', text: 'Vehicle registered successfully!' });
        setTimeout(() => setMessage(null), 3000);
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
      vehicleModel: vehicle.vehicleModel || '',
      yearMade: vehicle.yearMade || '',
      capacity: vehicle.capacity || '',
      driverName: vehicle.driverName || '',
      driverLicense: vehicle.driverLicense || '',
      contact: vehicle.contact || '',
      note: vehicle.note || ''
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
        setMessage({ type: 'success', text: 'Vehicle updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
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
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const res = await api.delete(`/transport-vehicle/${id}`);
        if (res?.success) {
          setMessage({ type: 'success', text: 'Vehicle deleted successfully!' });
          setTimeout(() => setMessage(null), 3000);
          fetchVehicles();
        } else {
          alert(res?.message || 'Failed to delete vehicle');
        }
      } catch (error) {
        alert(error.message || 'Error deleting vehicle');
      }
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => 
      (v.vehicleNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.driverName || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.vehicleModel || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [vehicles, search]);

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, currentPage]);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs matching reference screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-[#0c3559] tracking-tight">Vehicle</h1>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <Link href="/dashboard/transport/routes" className="hover:text-zinc-600 transition-colors">Transport</Link>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <span className="text-zinc-700 font-semibold">Vehicle</span>
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

      {/* Main Grid: Add Vehicle (Left) and Vehicle List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Add Vehicle Form */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-bold text-[#0c3559]">Add Vehicle</h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                  VEHICLE NUMBER <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={formData.vehicleNo} 
                  onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                  placeholder="e.g. LHR-4592"
                  className="h-10 border-zinc-200 rounded-lg text-sm bg-white focus-visible:ring-1 focus-visible:ring-[#084A86]" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                    VEHICLE MODEL
                  </Label>
                  <Input 
                    value={formData.vehicleModel} 
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    placeholder="Toyota Hiace"
                    className="h-10 border-zinc-200 rounded-lg text-sm bg-white" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                    YEAR MADE
                  </Label>
                  <Input 
                    value={formData.yearMade} 
                    onChange={(e) => setFormData({ ...formData, yearMade: e.target.value })}
                    placeholder="2024"
                    className="h-10 border-zinc-200 rounded-lg text-sm bg-white" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                  SEAT CAPACITY
                </Label>
                <Input 
                  type="number"
                  min="0"
                  value={formData.capacity} 
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="30"
                  className="h-10 border-zinc-200 rounded-lg text-sm bg-white" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                  DRIVER NAME
                </Label>
                <Input 
                  value={formData.driverName} 
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="Driver Full Name"
                  className="h-10 border-zinc-200 rounded-lg text-sm bg-white" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                  DRIVER LICENSE
                </Label>
                <Input 
                  value={formData.driverLicense} 
                  onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                  placeholder="License No"
                  className="h-10 border-zinc-200 rounded-lg text-sm bg-white" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                  DRIVER CONTACT
                </Label>
                <Input 
                  value={formData.contact} 
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="03001234567"
                  className="h-10 border-zinc-200 rounded-lg text-sm bg-white" 
                />
              </div>

              <Button 
                disabled={submitting} 
                type="submit" 
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-lg shadow-xs cursor-pointer uppercase tracking-wider text-xs"
              >
                {submitting ? 'SAVING...' : 'SAVE VEHICLE'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Vehicle List Table */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-[#0c3559]">Vehicle List</h2>

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
                    <th className="px-5 py-3 font-bold">VEHICLE NO</th>
                    <th className="px-5 py-3 font-bold">MODEL</th>
                    <th className="px-5 py-3 font-bold">DRIVER</th>
                    <th className="px-5 py-3 font-bold">CONTACT</th>
                    <th className="px-5 py-3 font-bold text-right w-24">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-16 text-center text-zinc-400">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          <span>Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-16 text-center text-sm font-medium text-zinc-400">
                        No Data Available In Table
                      </td>
                    </tr>
                  ) : (
                    paginatedVehicles.map((vehicle, idx) => (
                      <tr key={vehicle._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-5 py-3.5 text-zinc-600 font-semibold">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#0c3559]">
                          {vehicle.vehicleNo}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-700 font-medium">
                          {vehicle.vehicleModel || '—'} {vehicle.yearMade ? `(${vehicle.yearMade})` : ''}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-800 font-semibold">
                          {vehicle.driverName || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-600 font-mono">
                          {vehicle.contact || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleOpenEdit(vehicle)}
                              className="p-1.5 text-zinc-400 hover:text-[#084A86] hover:bg-zinc-100 rounded-md transition"
                              title="Edit Vehicle"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(vehicle._id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 rounded-md transition"
                              title="Delete Vehicle"
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

      {/* Edit Vehicle Modal */}
      {isEditOpen && editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-5 text-zinc-950 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#0c3559] uppercase tracking-wider">
                Edit Vehicle
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
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">VEHICLE NUMBER *</Label>
                <Input 
                  value={editFormData.vehicleNo}
                  onChange={e => setEditFormData({ ...editFormData, vehicleNo: e.target.value })}
                  className="h-10 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">MODEL</Label>
                  <Input 
                    value={editFormData.vehicleModel}
                    onChange={e => setEditFormData({ ...editFormData, vehicleModel: e.target.value })}
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">YEAR</Label>
                  <Input 
                    value={editFormData.yearMade}
                    onChange={e => setEditFormData({ ...editFormData, yearMade: e.target.value })}
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">DRIVER NAME</Label>
                <Input 
                  value={editFormData.driverName}
                  onChange={e => setEditFormData({ ...editFormData, driverName: e.target.value })}
                  className="h-10 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">DRIVER CONTACT</Label>
                <Input 
                  value={editFormData.contact}
                  onChange={e => setEditFormData({ ...editFormData, contact: e.target.value })}
                  className="h-10 rounded-lg text-sm"
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
                  {editSaving ? 'Updating...' : 'Update Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
