'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function GenerateIdCardPage() {
  const [formData, setFormData] = useState({ role: '', idCard: '', gridGap: '' });
  const [hasSearched, setHasSearched] = useState(false);
  const [availableCards, setAvailableCards] = useState([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await api.get('/id-card');
        if (res.success) setAvailableCards(res.data);
      } catch (error) {
        console.error('Error fetching ID cards:', error);
      }
    };
    fetchCards();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!formData.role || !formData.idCard) {
      alert('Please select Role and ID Card');
      return;
    }
    setHasSearched(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Generate ID Card</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-500 transition-colors">Admin Section</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Generate ID Card</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white">Select Criteria</h2>
        </div>
        
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Role <span className="text-rose-500">*</span></Label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-white" required>
                <option value="">Select Role *</option>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">ID Card <span className="text-rose-500">*</span></Label>
              <select value={formData.idCard} onChange={e => setFormData({...formData, idCard: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-white" required>
                <option value="">Select Id Card *</option>
                {availableCards.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Grid Gap (PX)</Label>
              <Input type="number" value={formData.gridGap} onChange={e => setFormData({...formData, gridGap: e.target.value})} placeholder="Grid Gap (px)" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button type="submit" className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold">
              <Search className="h-4 w-4 mr-2" /> SEARCH
            </Button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">ID Card Results</h2>
          </div>
          <div className="p-12 flex flex-col items-center justify-center text-zinc-500">
            <FileText className="h-12 w-12 mb-4 text-zinc-700" />
            <p>No {formData.role} records found for generating "{formData.idCard}".</p>
            <p className="text-sm mt-1">Please ensure {formData.role}s are added in the system first.</p>
          </div>
        </div>
      )}
    </div>
  );
}
