'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({ 
    vehicleNo: '', capacity: '', driverName: '', driverLicense: '', contact: '' 
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/transport-vehicle');
      if (res.success) setVehicles(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleNo) return alert('Vehicle No is required');
    try {
      setSubmitting(true);
      const res = await api.post('/transport-vehicle', formData);
      if (res.success) {
        setFormData({ vehicleNo: '', capacity: '', driverName: '', driverLicense: '', contact: '' });
        fetchVehicles();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const res = await api.delete(`/transport-vehicle/${id}`);
        if (res.success) fetchVehicles();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const filtered = vehicles.filter(v => 
    v.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
    (v.driverName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Vehicle</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Transport</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Vehicle</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Add Vehicle</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Vehicle No <span className="text-rose-500">*</span></Label>
                <Input 
                  value={formData.vehicleNo} onChange={(e) => setFormData({...formData, vehicleNo: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Capacity</Label>
                <Input 
                  type="number"
                  value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Driver Name</Label>
                <Input 
                  value={formData.driverName} onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Driver License</Label>
                <Input 
                  value={formData.driverLicense} onChange={(e) => setFormData({...formData, driverLicense: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Contact</Label>
                <Input 
                  value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <Button disabled={submitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                {submitting ? 'SAVING...' : 'SAVE VEHICLE'}
              </Button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Vehicle List</h2>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="SEARCH" 
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-16">SL</th>
                    <th className="px-4 py-3 font-semibold">Vehicle No</th>
                    <th className="px-4 py-3 font-semibold">Capacity</th>
                    <th className="px-4 py-3 font-semibold">Driver Name</th>
                    <th className="px-4 py-3 font-semibold">Driver License</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 text-emerald-500 font-medium">+{idx + 1}</td>
                        <td className="px-4 py-3 text-zinc-300">{item.vehicleNo}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.capacity || '-'}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.driverName || '-'}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.driverLicense || '-'}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.contact || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
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
