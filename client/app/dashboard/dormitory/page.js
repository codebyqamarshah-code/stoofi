'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  BedDouble, 
  DoorClosed, 
  Users, 
  ArrowRight,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';

export default function DormitoryListPage() {
  const [dormitories, setDormitories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', type: '', address: '', intake: '', description: '' 
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDormitory, setEditingDormitory] = useState(null);
  const [editFormData, setEditFormData] = useState({ 
    name: '', type: '', address: '', intake: '', description: '' 
  });
  const [editSaving, setEditSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dRes, rRes] = await Promise.all([
        api.get('/dormitory'),
        api.get('/dormitory-room')
      ]);
      if (dRes?.success && Array.isArray(dRes.data)) setDormitories(dRes.data);
      if (rRes?.success && Array.isArray(rRes.data)) setRooms(rRes.data);
    } catch (error) {
      console.error('Error fetching dormitory data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.type || !formData.address.trim() || !formData.intake) {
      return alert('Please fill all required fields');
    }
    try {
      setSubmitting(true);
      const res = await api.post('/dormitory', {
        ...formData,
        intake: Number(formData.intake)
      });
      if (res?.success) {
        setFormData({ name: '', type: '', address: '', intake: '', description: '' });
        fetchData();
      } else {
        alert(res?.message || 'Failed to save dormitory');
      }
    } catch (error) {
      alert(error.message || 'Error saving dormitory');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (dorm) => {
    setEditingDormitory(dorm);
    setEditFormData({
      name: dorm.name || '',
      type: dorm.type || '',
      address: dorm.address || '',
      intake: dorm.intake || '',
      description: dorm.description || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.type || !editFormData.address.trim() || !editFormData.intake) {
      return alert('Please fill all required fields');
    }
    try {
      setEditSaving(true);
      const res = await api.put(`/dormitory/${editingDormitory._id}`, {
        ...editFormData,
        intake: Number(editFormData.intake)
      });
      if (res?.success) {
        setIsEditOpen(false);
        fetchData();
      } else {
        alert(res?.message || 'Failed to update dormitory');
      }
    } catch (err) {
      alert(err.message || 'Failed to update dormitory');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this dormitory building?')) {
      try {
        const res = await api.delete(`/dormitory/${id}`);
        if (res?.success) fetchData();
        else alert(res?.message || 'Failed to delete dormitory');
      } catch (error) {
        alert(error.message || 'Error deleting dormitory');
      }
    }
  };

  // KPIs
  const totalDorms = dormitories.length;
  const totalIntake = useMemo(() => {
    return dormitories.reduce((sum, d) => sum + (Number(d.intake) || 0), 0);
  }, [dormitories]);
  const boysDorms = dormitories.filter(d => d.type === 'Boys').length;
  const girlsDorms = dormitories.filter(d => d.type === 'Girls').length;
  const totalConfiguredRooms = rooms.length;

  const filtered = dormitories.filter(d => 
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.address || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.type || '').toLowerCase().includes(search.toLowerCase())
  );

  const exportData = filtered.map((d, i) => ({
    sl: i + 1,
    name: d.name,
    type: d.type,
    address: d.address,
    intake: d.intake || 0,
    description: d.description || 'N/A'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#084A86]" />
            Hostel & Dormitory Management
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Manage school residential hostels, capacity allocations, and student accommodations</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Dormitory</span>
        </div>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/dashboard/dormitory/dormitory-rooms"
          className="group bg-white border border-zinc-200 hover:border-[#084A86]/50 rounded-xl p-4 shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#084A86] group-hover:bg-[#084A86] group-hover:text-white transition-colors flex items-center justify-center font-bold">
              <DoorClosed className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 group-hover:text-[#084A86] transition-colors">Dormitory Rooms</h3>
              <p className="text-xs text-zinc-500">Configure room numbers, bed allocations & monthly tariffs</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-[#084A86] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          href="/dashboard/dormitory/room-type"
          className="group bg-white border border-zinc-200 hover:border-[#084A86]/50 rounded-xl p-4 shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center font-bold">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 group-hover:text-emerald-700 transition-colors">Room Categories</h3>
              <p className="text-xs text-zinc-500">Manage Standard, AC, Suite & Single/Double occupancy categories</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#084A86] flex items-center justify-center font-bold">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Hostel Buildings</p>
            <p className="text-xl font-bold text-zinc-950">{totalDorms} Hostels</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Intake</p>
            <p className="text-xl font-bold text-zinc-950">{totalIntake} Students</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <DoorClosed className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Rooms</p>
            <p className="text-xl font-bold text-zinc-950">{totalConfiguredRooms} Rooms</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Hostel Types</p>
            <p className="text-xs font-bold text-zinc-950 mt-1">
              <span className="text-blue-700">{boysDorms} Boys</span> • <span className="text-pink-700">{girlsDorms} Girls</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Dormitory */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#084A86]" />
                Add Hostel / Dormitory
              </h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Dormitory Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  placeholder="e.g. Jinnah Hall - Boys Hostel"
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 rounded-xl" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Dormitory Type <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={formData.type} 
                  onChange={(val) => setFormData({ ...formData, type: val })}
                  placeholder="Select Hostel Type *"
                  options={[
                    { label: 'Boys Hostel', value: 'Boys' },
                    { label: 'Girls Hostel', value: 'Girls' },
                    { label: 'Mixed / Staff Residence', value: 'Mixed' }
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Location / Address <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  placeholder="e.g. East Wing, Block C, Campus Ground"
                  value={formData.address} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-10 rounded-xl" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Total Student Intake <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  type="number"
                  min="1"
                  placeholder="e.g. 150"
                  value={formData.intake} 
                  onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                  className="h-10 rounded-xl" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Description / Notes</Label>
                <textarea 
                  rows={3}
                  placeholder="Facilities, rules, warden contact details..."
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86]/20 font-medium resize-none"
                />
              </div>

              <Button 
                disabled={submitting} 
                type="submit" 
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-xl shadow-xs cursor-pointer mt-2"
              >
                {submitting ? 'Saving...' : 'Save Dormitory Building'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Table: Dormitory List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Dormitory Buildings ({dormitories.length})</h2>
                <p className="text-xs text-zinc-500 mt-0.5">List of all school dormitories, capacities, and residential complexes</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search dormitory or address..." 
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
                  { key: 'name', label: 'Dormitory Name' },
                  { key: 'type', label: 'Type' },
                  { key: 'address', label: 'Address' },
                  { key: 'intake', label: 'Intake Capacity' },
                  { key: 'description', label: 'Description' }
                ]}
                fileName="Dormitory_Buildings_Directory"
              />
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-zinc-500 uppercase bg-zinc-50/80 border-b border-zinc-200 font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-14">SL</th>
                    <th className="px-4 py-3">Dormitory Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Address / Location</th>
                    <th className="px-4 py-3">Intake</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-zinc-400 font-medium text-xs">
                        Loading dormitory buildings...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                        <Building2 className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                        <p className="font-semibold text-sm">No dormitories found</p>
                        <p className="text-xs text-zinc-400 mt-1">Add a hostel building using the form on the left</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-zinc-400 font-mono text-xs">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-zinc-950 flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-[#084A86]" />
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.type === 'Boys' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : item.type === 'Girls'
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600 text-xs font-medium">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-zinc-400" />
                            {item.address}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-800">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
                            <Users className="h-3 w-3 text-zinc-500" />
                            {item.intake} Students
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              onClick={() => handleOpenEdit(item)}
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-zinc-600 hover:text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit Dormitory"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(item._id)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Dormitory"
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

      {/* Edit Dormitory Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#084A86]" />
                <h3 className="text-base font-bold text-zinc-950">Edit Hostel / Dormitory</h3>
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
                  Dormitory Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={editFormData.name} 
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="h-10 rounded-xl" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Dormitory Type <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={editFormData.type} 
                  onChange={(val) => setEditFormData({ ...editFormData, type: val })}
                  placeholder="Select Hostel Type *"
                  options={[
                    { label: 'Boys Hostel', value: 'Boys' },
                    { label: 'Girls Hostel', value: 'Girls' },
                    { label: 'Mixed / Staff Residence', value: 'Mixed' }
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Location / Address <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={editFormData.address} 
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="h-10 rounded-xl" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Total Student Intake <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  type="number"
                  min="1"
                  value={editFormData.intake} 
                  onChange={(e) => setEditFormData({ ...editFormData, intake: e.target.value })}
                  className="h-10 rounded-xl" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Description / Notes</Label>
                <textarea 
                  rows={3}
                  value={editFormData.description} 
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86]/20 font-medium resize-none"
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
