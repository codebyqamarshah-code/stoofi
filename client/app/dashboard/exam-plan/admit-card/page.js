'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

export default function AdmitCardPage() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [formData, setFormData] = useState({ examId: '', classId: '', sectionId: '' });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [eRes, cRes, sRes] = await Promise.all([
          api.get('/exam-type'),
          api.get('/class'),
          api.get('/section')
        ]);
        if (eRes.success) setExams(eRes.data);
        if (cRes.success) setClasses(cRes.data);
        if (sRes.success) setSections(sRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDropdowns();
  }, []);

  const handleSearch = () => {
    if (!formData.examId || !formData.classId) {
      alert('Please select at least Exam and Class.');
      return;
    }
    alert('Admit Card search functionality active. Generating admit cards...');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Generate Admit Card</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Exam Plan</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Generate Admit Card</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">EXAM <span className="text-rose-500">*</span></label>
              <SearchableSelect 
                value={formData.examId} onChange={(val) => setFormData({...formData, examId: val})}
                placeholder="Select Exam *"
                options={exams.map(e => ({ label: e.name, value: e._id }))}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">CLASS <span className="text-rose-500">*</span></label>
              <SearchableSelect 
                value={formData.classId} onChange={(val) => setFormData({...formData, classId: val})}
                placeholder="Select Class *"
                options={classes.map(c => ({ label: c.name, value: c._id }))}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase">SECTION <span className="text-rose-500">*</span></label>
              <SearchableSelect 
                value={formData.sectionId} onChange={(val) => setFormData({...formData, sectionId: val})}
                placeholder="Select Section *"
                options={sections.map(s => ({ label: s.name, value: s._id }))}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-8">
              <Search className="h-4 w-4 mr-2" />
              SEARCH
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
