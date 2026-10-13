'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  BedDouble, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  DoorClosed, 
  Layers, 
  Tag, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';

export default function RoomTypePage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({ roomType: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editFormData, setEditFormData] = useState({ roomType: '', description: '' });
  const [editSaving, setEditSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rtRes, rRes] = await Promise.all([
        api.get('/dormitory-room-type'),
        api.get('/dormitory-room')
      ]);
      if (rtRes?.success && Array.isArray(rtRes.data)) setRoomTypes(rtRes.data);
      if (rRes?.success && Array.isArray(rRes.data)) setRooms(rRes.data);
    } catch (error) {
      console.error('Error fetching room types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomType.trim()) return alert('Room Type name is required');
    try {
      setSubmitting(true);
      const res = await api.post('/dormitory-room-type', formData);
      if (res?.success) {
        setFormData({ roomType: '', description: '' });
        fetchData();
      } else {
        alert(res?.message || 'Failed to save room type');
      }
    } catch (error) {
      alert(error.message || 'Error saving room type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingType(item);
    setEditFormData({
      roomType: item.roomType || '',
      description: item.description || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.roomType.trim()) return alert('Room Type name is required');
    try {
      setEditSaving(true);
      const res = await api.put(`/dormitory-room-type/${editingType._id}`, editFormData);
      if (res?.success) {
        setIsEditOpen(false);
        fetchData();
      } else {
        alert(res?.message || 'Failed to update room type');
      }
    } catch (err) {
      alert(err.message || 'Failed to update room type');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this room type?')) {
      try {
        const res = await api.delete(`/dormitory-room-type/${id}`);
        if (res?.success) fetchData();
        else alert(res?.message || 'Failed to delete room type');
      } catch (error) {
        alert(error.message || 'Error deleting room type');
      }
    }
  };

  // KPIs
  const totalCategories = roomTypes.length;
  const totalConfiguredRooms = rooms.length;

  const getRoomsCountForType = (typeName) => {
    return rooms.filter(r => r.roomType === typeName).length;
  };

  const filtered = roomTypes.filter(r => 
    (r.roomType || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const exportData = filtered.map((r, i) => ({
    sl: i + 1,
    roomType: r.roomType,
    roomsCount: getRoomsCountForType(r.roomType),
    description: r.description || 'N/A'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <BedDouble className="h-6 w-6 text-[#084A86]" />
            Dormitory Room Types
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Define categories and tiers for student hostel accommodations</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/dormitory" className="hover:text-zinc-600 transition-colors">Dormitory</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Room Types</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#084A86] flex items-center justify-center font-bold">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Defined Categories</p>
            <p className="text-xl font-bold text-zinc-950">{totalCategories} Types</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DoorClosed className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Associated Rooms</p>
            <p className="text-xl font-bold text-zinc-950">{totalConfiguredRooms} Total Rooms</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Room Type */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#084A86]" />
                Add Room Category
              </h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Room Type / Category <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  placeholder="e.g. Deluxe AC (2 Bed), Standard (4 Bed)"
                  value={formData.roomType} 
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                  className="h-10 rounded-xl font-medium" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Description / Specifications</Label>
                <textarea 
                  rows={4}
                  placeholder="Describe amenities (e.g. Air conditioned, study desk, attached bath)..."
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
                {submitting ? 'Saving...' : 'Save Room Category'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Table: Room Types List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Room Category Directory ({roomTypes.length})</h2>
                <p className="text-xs text-zinc-500 mt-0.5">List of all room categories, amenities, and allocated rooms</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search category..." 
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
                  { key: 'roomType', label: 'Room Category' },
                  { key: 'roomsCount', label: 'Rooms Allocated' },
                  { key: 'description', label: 'Description' }
                ]}
                fileName="Dormitory_Room_Categories"
              />
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-zinc-500 uppercase bg-zinc-50/80 border-b border-zinc-200 font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-14">SL</th>
                    <th className="px-4 py-3">Room Type / Category</th>
                    <th className="px-4 py-3">Rooms Configured</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center text-zinc-400 font-medium text-xs">
                        Loading room categories...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center text-zinc-500">
                        <BedDouble className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                        <p className="font-semibold text-sm">No room categories found</p>
                        <p className="text-xs text-zinc-400 mt-1">Create a room type category using the form on the left</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => {
                      const count = getRoomsCountForType(item.roomType);
                      return (
                        <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="px-4 py-3.5 text-zinc-400 font-mono text-xs">
                            {String(idx + 1).padStart(2, '0')}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#084A86] border border-blue-100 font-medium text-xs">
                              <Tag className="h-3 w-3" />
                              {item.roomType}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-zinc-700">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
                              <DoorClosed className="h-3 w-3 text-zinc-500" />
                              {count} {count === 1 ? 'Room' : 'Rooms'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-zinc-600 text-xs max-w-xs truncate">
                            {item.description || <span className="text-zinc-400 italic">No description provided</span>}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                onClick={() => handleOpenEdit(item)}
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-zinc-600 hover:text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                                title="Edit Room Type"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                onClick={() => handleDelete(item._id)} 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete Room Type"
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

      {/* Edit Room Type Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-[#084A86]" />
                <h3 className="text-base font-bold text-zinc-950">Edit Room Category</h3>
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
                  Room Type / Category <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={editFormData.roomType} 
                  onChange={(e) => setEditFormData({ ...editFormData, roomType: e.target.value })}
                  className="h-10 rounded-xl font-medium" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Description / Specifications</Label>
                <textarea 
                  rows={4}
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
