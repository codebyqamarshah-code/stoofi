'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
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

  const fetchData = async () => {
    try {
      const [rRes, dRes, rtRes] = await Promise.all([
        api.get('/dormitory-room'),
        api.get('/dormitory'),
        api.get('/dormitory-room-type')
      ]);
      if (rRes.success) setRooms(rRes.data);
      if (dRes.success) setDormitories(dRes.data);
      if (rtRes.success) setRoomTypes(rtRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dormitoryId || !formData.roomNumber || !formData.roomType || !formData.numberOfBeds || !formData.costPerBed) {
      return alert('Please fill all required fields');
    }
    try {
      setSubmitting(true);
      const res = await api.post('/dormitory-room', formData);
      if (res.success) {
        setFormData({ dormitoryId: '', roomNumber: '', roomType: '', numberOfBeds: '', costPerBed: '', description: '' });
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        const res = await api.delete(`/dormitory-room/${id}`);
        if (res.success) fetchData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const getDormitoryName = (id) => {
    const d = dormitories.find(x => x._id === id);
    return d ? d.name : '-';
  };

  const filtered = rooms.filter(r => 
    r.roomNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Dormitory Rooms</h1>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span>Dormitory</span>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Dormitory Rooms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-base font-bold text-zinc-950">Add Dormitory Rooms</h2>
            </div>
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Dormitory <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={formData.dormitoryId} onChange={(val) => setFormData({...formData, dormitoryId: val})}
                  placeholder="Dormitory *"
                  options={dormitories.map(d => ({ label: d.name, value: d._id }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Room Number <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Type <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={formData.roomType} onChange={(val) => setFormData({...formData, roomType: val})}
                  placeholder="Room Type *"
                  options={roomTypes.map(rt => ({ label: rt.roomType, value: rt.roomType }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Number of Bed <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  type="number"
                  value={formData.numberOfBeds} onChange={(e) => setFormData({...formData, numberOfBeds: e.target.value})}
                  className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Cost Per Bed ($) <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  type="number"
                  value={formData.costPerBed} onChange={(e) => setFormData({...formData, costPerBed: e.target.value})}
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
                {submitting ? 'SAVING...' : 'SAVE ROOM'}
              </Button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="text-base font-bold text-zinc-950">Dormitory Rooms List</h2>
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
                    <th className="px-4 py-3 font-bold">Dormitory</th>
                    <th className="px-4 py-3 font-bold">Room Number</th>
                    <th className="px-4 py-3 font-bold">Room Type</th>
                    <th className="px-4 py-3 font-bold">No. of Bed</th>
                    <th className="px-4 py-3 font-bold">Cost Per Bed ($)</th>
                    <th className="px-4 py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500 font-medium">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500 font-medium">No Data Available In Table</td></tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                        <td className="px-4 py-3.5 text-zinc-600 font-bold">#{idx + 1}</td>
                        <td className="px-4 py-3.5 font-semibold text-zinc-950">{getDormitoryName(item.dormitoryId)}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{item.roomNumber}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{item.roomType}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{item.numberOfBeds}</td>
                        <td className="px-4 py-3.5 text-zinc-700">${item.costPerBed}</td>
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
