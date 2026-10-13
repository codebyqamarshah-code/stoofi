'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  DoorClosed, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  BedDouble, 
  Building2, 
  Users, 
  DollarSign, 
  Tag 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';

export default function DormitoryRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [dormitories, setDormitories] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  
  const [formData, setFormData] = useState({ 
    dormitoryId: '', 
    roomNumber: '', 
    roomType: '', 
    numberOfBeds: '', 
    costPerBed: '',
    description: '' 
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editFormData, setEditFormData] = useState({ 
    dormitoryId: '', 
    roomNumber: '', 
    roomType: '', 
    numberOfBeds: '', 
    costPerBed: '',
    description: '' 
  });
  const [editSaving, setEditSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, dRes, rtRes] = await Promise.all([
        api.get('/dormitory-room'),
        api.get('/dormitory'),
        api.get('/dormitory-room-type')
      ]);
      if (rRes?.success && Array.isArray(rRes.data)) setRooms(rRes.data);
      if (dRes?.success && Array.isArray(dRes.data)) setDormitories(dRes.data);
      if (rtRes?.success && Array.isArray(rtRes.data)) setRoomTypes(rtRes.data);
    } catch (error) {
      console.error('Error fetching dormitory rooms data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dormitoryId || !formData.roomNumber.trim() || !formData.roomType || !formData.numberOfBeds || !formData.costPerBed) {
      return alert('Please fill all required fields');
    }
    try {
      setSubmitting(true);
      const res = await api.post('/dormitory-room', {
        ...formData,
        numberOfBeds: Number(formData.numberOfBeds),
        costPerBed: Number(formData.costPerBed)
      });
      if (res?.success) {
        setFormData({ dormitoryId: '', roomNumber: '', roomType: '', numberOfBeds: '', costPerBed: '', description: '' });
        fetchData();
      } else {
        alert(res?.message || 'Failed to save room');
      }
    } catch (error) {
      alert(error.message || 'Error saving room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setEditFormData({
      dormitoryId: room.dormitoryId || '',
      roomNumber: room.roomNumber || '',
      roomType: room.roomType || '',
      numberOfBeds: room.numberOfBeds || '',
      costPerBed: room.costPerBed || '',
      description: room.description || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.dormitoryId || !editFormData.roomNumber.trim() || !editFormData.roomType || !editFormData.numberOfBeds || !editFormData.costPerBed) {
      return alert('Please fill all required fields');
    }
    try {
      setEditSaving(true);
      const res = await api.put(`/dormitory-room/${editingRoom._id}`, {
        ...editFormData,
        numberOfBeds: Number(editFormData.numberOfBeds),
        costPerBed: Number(editFormData.costPerBed)
      });
      if (res?.success) {
        setIsEditOpen(false);
        fetchData();
      } else {
        alert(res?.message || 'Failed to update room');
      }
    } catch (err) {
      alert(err.message || 'Failed to update room');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        const res = await api.delete(`/dormitory-room/${id}`);
        if (res?.success) fetchData();
        else alert(res?.message || 'Failed to delete room');
      } catch (error) {
        alert(error.message || 'Error deleting room');
      }
    }
  };

  const getDormitoryName = (id) => {
    const d = dormitories.find(x => x._id === id);
    return d ? d.name : 'Unknown Dormitory';
  };

  // KPIs
  const totalRooms = rooms.length;
  const totalBeds = useMemo(() => {
    return rooms.reduce((sum, r) => sum + (Number(r.numberOfBeds) || 0), 0);
  }, [rooms]);
  const averageBedCost = useMemo(() => {
    if (rooms.length === 0) return 0;
    const totalCost = rooms.reduce((sum, r) => sum + (Number(r.costPerBed) || 0), 0);
    return Math.round(totalCost / rooms.length);
  }, [rooms]);

  const filtered = rooms.filter(r => {
    const dormName = getDormitoryName(r.dormitoryId).toLowerCase();
    const roomNum = (r.roomNumber || '').toLowerCase();
    const type = (r.roomType || '').toLowerCase();
    const q = search.toLowerCase();
    return dormName.includes(q) || roomNum.includes(q) || type.includes(q);
  });

  const exportData = filtered.map((r, i) => ({
    sl: i + 1,
    dormitory: getDormitoryName(r.dormitoryId),
    roomNumber: r.roomNumber,
    roomType: r.roomType,
    numberOfBeds: r.numberOfBeds,
    costPerBed: `PKR ${Number(r.costPerBed || 0).toLocaleString()}`,
    description: r.description || 'N/A'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <DoorClosed className="h-6 w-6 text-[#084A86]" />
            Dormitory Rooms
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Configure individual hostel rooms, bed capacities, and monthly tariffs</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/dormitory" className="hover:text-zinc-600 transition-colors">Dormitory</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Dormitory Rooms</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#084A86] flex items-center justify-center font-bold">
            <DoorClosed className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Rooms</p>
            <p className="text-xl font-bold text-zinc-950">{totalRooms} Active</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BedDouble className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Bed Capacity</p>
            <p className="text-xl font-bold text-zinc-950">{totalBeds} Beds</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Avg Bed Tariff</p>
            <p className="text-xl font-bold text-zinc-950 font-mono">PKR {averageBedCost.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Room */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#084A86]" />
                Add Dormitory Room
              </h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Dormitory / Hostel <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={formData.dormitoryId} 
                  onChange={(val) => setFormData({ ...formData, dormitoryId: val })}
                  placeholder="Select Hostel *"
                  options={dormitories.map(d => ({ label: `${d.name} (${d.type})`, value: d._id }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Room Number / Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  placeholder="e.g. 101, A-12, Ground 04"
                  value={formData.roomNumber} 
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="h-10 rounded-xl font-semibold" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Room Category / Type <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={formData.roomType} 
                  onChange={(val) => setFormData({ ...formData, roomType: val })}
                  placeholder="Select Room Category *"
                  options={roomTypes.map(rt => ({ label: rt.roomType, value: rt.roomType }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Number of Beds <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  type="number"
                  min="1"
                  placeholder="e.g. 2, 4"
                  value={formData.numberOfBeds} 
                  onChange={(e) => setFormData({ ...formData, numberOfBeds: e.target.value })}
                  className="h-10 rounded-xl" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Monthly Cost Per Bed (PKR) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">PKR</span>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="8500"
                    value={formData.costPerBed} 
                    onChange={(e) => setFormData({ ...formData, costPerBed: e.target.value })}
                    className="pl-12 h-10 rounded-xl font-bold font-mono" 
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Description / Amenities</Label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Attached washroom, study table, balcony view..."
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
                {submitting ? 'Saving...' : 'Save Room'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Table: Rooms List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Room Directory ({rooms.length})</h2>
                <p className="text-xs text-zinc-500 mt-0.5">List of all residential rooms, bed configurations, and rates</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search hostel, room, type..." 
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
                  { key: 'dormitory', label: 'Hostel' },
                  { key: 'roomNumber', label: 'Room Number' },
                  { key: 'roomType', label: 'Room Category' },
                  { key: 'numberOfBeds', label: 'Beds' },
                  { key: 'costPerBed', label: 'Monthly Tariff' },
                  { key: 'description', label: 'Amenities' }
                ]}
                fileName="Dormitory_Rooms_Directory"
              />
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-zinc-500 uppercase bg-zinc-50/80 border-b border-zinc-200 font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-14">SL</th>
                    <th className="px-4 py-3">Hostel</th>
                    <th className="px-4 py-3">Room No</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Beds</th>
                    <th className="px-4 py-3">Tariff / Bed</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-zinc-400 font-medium text-xs">
                        Loading dormitory rooms...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-zinc-500">
                        <DoorClosed className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                        <p className="font-semibold text-sm">No rooms configured yet</p>
                        <p className="text-xs text-zinc-400 mt-1">Add a new room using the form on the left</p>
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
                            {getDormitoryName(item.dormitoryId)}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-zinc-950 font-mono">
                            {item.roomNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#084A86] border border-blue-200 text-xs font-semibold">
                            <Tag className="h-3 w-3" />
                            {item.roomType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-700">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
                            <BedDouble className="h-3 w-3 text-zinc-500" />
                            {item.numberOfBeds} Beds
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold font-mono text-zinc-950 text-xs">
                          PKR {Number(item.costPerBed || 0).toLocaleString()} <span className="text-[10px] text-zinc-400 font-sans font-normal">/ mo</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              onClick={() => handleOpenEdit(item)}
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-zinc-600 hover:text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit Room"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(item._id)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Room"
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

      {/* Edit Room Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <DoorClosed className="h-5 w-5 text-[#084A86]" />
                <h3 className="text-base font-bold text-zinc-950">Edit Room Details</h3>
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
                  Dormitory / Hostel <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={editFormData.dormitoryId} 
                  onChange={(val) => setEditFormData({ ...editFormData, dormitoryId: val })}
                  placeholder="Select Hostel *"
                  options={dormitories.map(d => ({ label: `${d.name} (${d.type})`, value: d._id }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Room Number / Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={editFormData.roomNumber} 
                  onChange={(e) => setEditFormData({ ...editFormData, roomNumber: e.target.value })}
                  className="h-10 rounded-xl font-semibold" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Room Category / Type <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={editFormData.roomType} 
                  onChange={(val) => setEditFormData({ ...editFormData, roomType: val })}
                  placeholder="Select Room Category *"
                  options={roomTypes.map(rt => ({ label: rt.roomType, value: rt.roomType }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Number of Beds <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  type="number"
                  min="1"
                  value={editFormData.numberOfBeds} 
                  onChange={(e) => setEditFormData({ ...editFormData, numberOfBeds: e.target.value })}
                  className="h-10 rounded-xl" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Monthly Cost Per Bed (PKR) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">PKR</span>
                  <Input 
                    type="number"
                    min="0"
                    value={editFormData.costPerBed} 
                    onChange={(e) => setEditFormData({ ...editFormData, costPerBed: e.target.value })}
                    className="pl-12 h-10 rounded-xl font-bold font-mono" 
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Description / Amenities</Label>
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
