'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function GenerateCertificatePage() {
  const [formData, setFormData] = useState({ class: '', section: '', certificate: '' });
  const [hasSearched, setHasSearched] = useState(false);
  const [availableCerts, setAvailableCerts] = useState([]);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.get('/certificate');
        if (res.success) setAvailableCerts(res.data);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      }
    };
    fetchCerts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!formData.class || !formData.certificate) {
      alert('Please select Class and Certificate');
      return;
    }
    setHasSearched(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Generate Certificate</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-500 transition-colors">Admin Section</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Generate Certificate</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white">Select Criteria</h2>
        </div>
        
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
              <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-white" required>
                <option value="">Select Class *</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
              <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-white">
                <option value="">Select Section</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Certificate <span className="text-rose-500">*</span></Label>
              <select value={formData.certificate} onChange={e => setFormData({...formData, certificate: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-white" required>
                <option value="">Select Certificate *</option>
                {availableCerts.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
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
            <h2 className="text-lg font-semibold text-white">Certificate Results</h2>
          </div>
          <div className="p-12 flex flex-col items-center justify-center text-zinc-500">
            <FileText className="h-12 w-12 mb-4 text-zinc-700" />
            <p>No students found in {formData.class} {formData.section && `(Section ${formData.section})`} for generating &quot;{formData.certificate}&quot;.</p>
            <p className="text-sm mt-1">Please ensure students are enrolled in this class.</p>
          </div>
        </div>
      )}
    </div>
  );
}
