'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function FeesCarryForwardPage() {
  const [formData, setFormData] = useState({ class: '', section: '' });
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/class').then(r => r.success && setClasses(r.data)).catch(()=>{});
    api.get('/section').then(r => r.success && setSections(r.data)).catch(()=>{});
  }, []);

  const handleSearch = () => {
    // Implement carry forward fetch
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Fees Carry Forward</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Fees Collection</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Fees Carry Forward</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Class <span className="text-rose-500">*</span></Label>
            <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Class</option>
              {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Select Section <span className="text-rose-500">*</span></Label>
            <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Section</option>
              {(classes.find(c => c.name === (formData?.class || formData?.className || (typeof classVal !== 'undefined' ? classVal : '')))?.sections || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
