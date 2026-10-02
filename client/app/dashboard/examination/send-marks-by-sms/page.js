'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

export default function SendMarksBySmsPage() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [formData, setFormData] = useState({ examId: '', classId: '', receiver: '' });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [eRes, cRes] = await Promise.all([
          api.get('/exam-type'),
          api.get('/class')
        ]);
        if (eRes.success) setExams(eRes.data);
        if (cRes.success) setClasses(cRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDropdowns();
  }, []);

  const handleSend = () => {
    if (!formData.examId || !formData.classId || !formData.receiver) {
      alert('Please fill all required fields to send marks.');
      return;
    }
    alert('SMS marks sending initiated!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Send Marks By Sms</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Examinations</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Send Marks By Sms</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-950">Send Marks Via SMS</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">SELECT EXAM <span className="text-rose-500">*</span></label>
              <SearchableSelect 
                value={formData.examId} onChange={(val) => setFormData({...formData, examId: val})}
                placeholder="Select Exam *"
                options={exams.map(e => ({ label: e.name, value: e._id }))}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">SELECT CLASS <span className="text-rose-500">*</span></label>
              <SearchableSelect 
                value={formData.classId} onChange={(val) => setFormData({...formData, classId: val})}
                placeholder="Select Class *"
                options={classes.map(c => ({ label: c.name, value: c._id }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">SELECT RECEIVER <span className="text-rose-500">*</span></label>
              <SearchableSelect 
                value={formData.receiver} onChange={(val) => setFormData({...formData, receiver: val})}
                placeholder="Select Receiver *"
                options={[
                  { label: 'Students', value: 'students' },
                  { label: 'Parents', value: 'parents' },
                  { label: 'Both', value: 'both' }
                ]}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8">
              <Send className="h-4 w-4 mr-2" />
              SEND MARKS VIA SMS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
