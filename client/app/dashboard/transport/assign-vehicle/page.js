'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
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

  const fetchData = async () => {
    try {
      const [aRes, rRes, vRes] = await Promise.all([
        api.get('/transport-assign'),
        api.get('/transport-route'),
        api.get('/transport-vehicle')
      ]);
      if (aRes.success) setAssigns(aRes.data);
      if (rRes.success) setRoutes(rRes.data);
      if (vRes.success) setVehicles(vRes.data);
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
    if (!formData.routeId || !formData.vehicleId) return alert('Route and Vehicle are required');
    try {
      setSubmitting(true);
      const res = await api.post('/transport-assign', formData);
      if (res.success) {
        setFormData({ routeId: '', vehicleId: '' });
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        const res = await api.delete(`/transport-assign/${id}`);
        if (res.success) fetchData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const getRouteTitle = (id) => {
    const r = routes.find(x => x._id === id);
    return r ? r.title : '-';
  };

  const getVehicleNo = (id) => {
    const v = vehicles.find(x => x._id === id);
    return v ? v.vehicleNo : '-';
  };

  const filtered = assigns.filter(a => {
    const routeTitle = getRouteTitle(a.routeId).toLowerCase();
    const vehicleNo = getVehicleNo(a.vehicleId).toLowerCase();
    return routeTitle.includes(search.toLowerCase()) || vehicleNo.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Assign Vehicle</h1>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span>Transport</span>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Assign Vehicle</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-base font-bold text-zinc-950">Add Assign Vehicle</h2>
            </div>
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Select Route <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={formData.routeId} onChange={(val) => setFormData({...formData, routeId: val})}
                  placeholder="Select Route *"
                  options={routes.map(r => ({ label: r.title, value: r._id }))}
                />
              </div>
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Vehicle <span className="text-rose-500">*</span>
                </Label>
                <div className="space-y-2 mt-2">
                  {vehicles.map(v => (
                    <label key={v._id} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="vehicle"
                        value={v._id}
                        checked={formData.vehicleId === v._id}
                        onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                        className="text-zinc-900 focus:ring-zinc-800 border-zinc-300"
                      />
                      <span className="text-sm text-zinc-800 font-medium">{v.vehicleNo}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button disabled={submitting} type="submit" className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg transition-all shadow-xs mt-4">
                {submitting ? 'SAVING...' : 'SAVE'}
              </Button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="text-base font-bold text-zinc-950">Assigned Vehicle List</h2>
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
                    <th className="px-4 py-3 font-bold">Route</th>
                    <th className="px-4 py-3 font-bold">Vehicle</th>
                    <th className="px-4 py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-zinc-500 font-medium">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-zinc-500 font-medium">No Data Available In Table</td></tr>
                  ) : (
                    filtered.map(item => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors text-zinc-950 font-medium">
                        <td className="px-4 py-3.5 font-semibold text-zinc-950">{getRouteTitle(item.routeId)}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{getVehicleNo(item.vehicleId)}</td>
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
