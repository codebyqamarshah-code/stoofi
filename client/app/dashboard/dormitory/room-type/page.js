'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function RoomTypePage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [formData, setFormData] = useState({ roomType: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchRoomTypes = async () => {
    try {
      const res = await api.get('/dormitory-room-type');
      if (res.success) setRoomTypes(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomType) return alert('Room Type is required');
    try {
      setSubmitting(true);
      const res = await api.post('/dormitory-room-type', formData);
      if (res.success) {
        setFormData({ roomType: '', description: '' });
        fetchRoomTypes();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this room type?')) {
      try {
        const res = await api.delete(`/dormitory-room-type/${id}`);
        if (res.success) fetchRoomTypes();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const filtered = roomTypes.filter(r => 
    r.roomType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Room Type</h1>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span>Dormitory</span>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Room Type</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-base font-bold text-zinc-950">Add Room Type</h2>
            </div>
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Room Type <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={formData.roomType} onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                  className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Description</Label>
                <textarea 
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="flex min-h-[90px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>
              <Button disabled={submitting} type="submit" className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg transition-all shadow-xs mt-2">
                {submitting ? 'SAVING...' : 'SAVE ROOM TYPE'}
              </Button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="text-base font-bold text-zinc-950">Room Type List</h2>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  placeholder="SEARCH" 
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 text-xs font-bold uppercase focus-visible:ring-zinc-400"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                  <tr>
                    <th className="px-4 py-3 font-bold w-16">SL</th>
                    <th className="px-4 py-3 font-bold">Room Type</th>
                    <th className="px-4 py-3 font-bold">Description</th>
                    <th className="px-4 py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="4" className="px-4 py-8 text-center text-zinc-500 font-medium">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="4" className="px-4 py-8 text-center text-zinc-500 font-medium">No Data Available In Table</td></tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                        <td className="px-4 py-3.5 text-zinc-600 font-bold">#{idx + 1}</td>
                        <td className="px-4 py-3.5 font-semibold text-zinc-950">{item.roomType}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{item.description || '-'}</td>
                        <td className="px-4 py-3.5 text-right">
                          <Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold">
                            DELETE
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
    </div>
  );
}
