'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Upload, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

const DEFAULT_CLASSES = [
  { _id: 'c-bs-psych', name: 'BS Psychology' },
  { _id: 'c-bs-rit', name: 'BS RIT' },
  { _id: 'c-dpt', name: 'DPT' },
  { _id: 'c-fsc-dental', name: 'FSC Dental' },
  { _id: 'c-fsc-nursing', name: 'FSC NURSING' },
  { _id: 'c-fsc-ott', name: 'FSC OTT' },
];

const DEFAULT_SECTIONS = [
  { _id: 's1', name: 'A' },
  { _id: 's2', name: 'B' },
  { _id: 's3', name: 'C' },
  { _id: 's4', name: 'D' },
];

const DEFAULT_SUBJECTS = [
  { _id: 'sub1', name: 'Mathematics' },
  { _id: 'sub2', name: 'English Language' },
  { _id: 'sub3', name: 'Urdu Literature' },
  { _id: 'sub4', name: 'General Science' },
  { _id: 'sub5', name: 'Physics' },
  { _id: 'sub6', name: 'Chemistry' },
  { _id: 'sub7', name: 'Biology' },
  { _id: 'sub8', name: 'Computer Science' },
  { _id: 'sub9', name: 'Islamiat' },
  { _id: 'sub10', name: 'Pakistan Studies' },
];

export default function AddHomeworkPage() {
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    subject: '',
    homeworkDate: new Date().toISOString().split('T')[0],
    submissionDate: new Date().toISOString().split('T')[0],
    marks: '',
    description: ''
  });
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [cRes, sRes, subRes] = await Promise.all([
          api.get('/class').catch(() => null),
          api.get('/section').catch(() => null),
          api.get('/subject').catch(() => null)
        ]);
        if (cRes?.success && Array.isArray(cRes.data) && cRes.data.length > 0) setClasses(cRes.data);
        if (sRes?.success && Array.isArray(sRes.data) && sRes.data.length > 0) setSections(sRes.data);
        if (subRes?.success && Array.isArray(subRes.data) && subRes.data.length > 0) setSubjects(subRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    const finalValue = value?.target ? value.target.value : value;
    setFormData(prev => {
      const nextData = { ...prev, [name]: finalValue };
      if (name === 'className') {
        nextData.section = ''; // reset section when class changes
      }
      return nextData;
    });
  };

  // Derive dynamic sections based on selected class
  const activeClass = classes.find(c => c.name === formData.className);
  // If the class from the DB has sections, use them. Otherwise fallback to the global sections list (or empty).
  const dynamicSections = activeClass?.sections?.length > 0 
    ? activeClass.sections.map(s => ({ _id: s, name: s })) 
    : sections;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName('');
      return;
    }
    const maxMb = 25;
    if (file.size > maxMb * 1024 * 1024) {
      const actualMb = (file.size / (1024 * 1024)).toFixed(1);
      alert(`Selected file (${actualMb} MB) exceeds the maximum limit of ${maxMb} MB. Please select a smaller file.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFileName('');
      return;
    }
    setFileName(file.name);
  };

  const handleClearFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFileName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.className || !formData.section || !formData.subject || !formData.description) {
      return alert('Please fill all required fields (Class, Section, Subject, Description).');
    }

    const file = fileInputRef.current?.files?.[0];
    if (file && file.size > 25 * 1024 * 1024) {
      return alert('Attached file exceeds 25 MB. Please select a smaller file.');
    }

    try {
      setSubmitting(true);
      setUploadProgress(0);
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        const val = formData[key];
        // Send marks as 0 if blank
        data.append(key, key === 'marks' && !val ? '0' : val);
      });
      if (file) {
        data.append('file', file);
      }

      // Do NOT specify manual Content-Type header so Axios/browser automatically appends boundary
      const res = await api.post('/homework', data, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        }
      });

      if (res && res.success !== false) {
        alert('Homework saved and published successfully!');
        setFormData({
          className: '', section: '', subject: '', marks: '', description: '',
          homeworkDate: new Date().toISOString().split('T')[0],
          submissionDate: new Date().toISOString().split('T')[0]
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFileName('');
      } else {
        alert(res?.message || 'Failed to save homework');
      }
    } catch (err) {
      console.error('Error saving homework:', err);
      const msg = err.response?.data?.message || err.message || 'Error saving homework';
      alert(msg);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            Add Homework
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Assign homework tasks and track student submissions</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Homework</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Add Homework</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 bg-zinc-900/30">
          <h2 className="text-sm font-semibold text-zinc-950 uppercase tracking-wider">Homework Details</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Class <span className="text-rose-500">*</span></Label>
              <SearchableSelect 
                name="className" value={formData.className} onChange={(v) => handleSelectChange('className', v)}
                placeholder="Select Class *"
                options={sortClassesAcademic(classes.map(c => ({ label: c.name, value: c.name })))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Section <span className="text-rose-500">*</span></Label>
              <SearchableSelect 
                name="section" value={formData.section} onChange={(v) => handleSelectChange('section', v)}
                placeholder="Select Section *"
                options={dynamicSections.map(s => ({ label: s.name.startsWith('Section') ? s.name : `Section ${s.name}`, value: s.name }))}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Subject <span className="text-rose-500">*</span></Label>
              <SearchableSelect 
                name="subject" value={formData.subject} onChange={(v) => handleSelectChange('subject', v)}
                placeholder="Select Subject *"
                options={subjects.map(s => ({ label: s.name, value: s.name }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Homework Date <span className="text-rose-500">*</span></Label>
              <Input 
                type="date" name="homeworkDate" 
                value={formData.homeworkDate} onChange={handleChange}
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-indigo-500 text-zinc-950" 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Submission Date <span className="text-rose-500">*</span></Label>
              <Input 
                type="date" name="submissionDate" 
                value={formData.submissionDate} onChange={handleChange}
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-indigo-500 text-zinc-950" 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Total Marks</Label>
              <Input 
                type="number" name="marks" 
                placeholder="e.g. 20"
                value={formData.marks} onChange={handleChange}
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-indigo-500 text-zinc-950" 
              />
            </div>

            <div className="space-y-1.5 lg:col-span-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Attach File / Document (Max 25 MB)</Label>
                {fileName && (
                  <button 
                    type="button" 
                    onClick={handleClearFile} 
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold"
                  >
                    <X className="h-3.5 w-3.5" /> Remove attachment
                  </button>
                )}
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  id="hw-file" 
                  onChange={handleFileChange}
                />
                <Label htmlFor="hw-file" className="flex items-center justify-between h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm cursor-pointer hover:border-zinc-300 transition-colors">
                  <span className={`truncate ${fileName ? 'text-zinc-900 font-medium' : 'text-zinc-400'}`}>
                    {fileName || 'Click to attach assignment document (PDF, Word, Image)...'}
                  </span>
                  <div className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 -mr-2 rounded text-xs font-semibold transition-colors">
                    BROWSE
                  </div>
                </Label>
              </div>
              {submitting && uploadProgress > 0 && (
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-xs text-zinc-600 font-semibold">
                    <span>Uploading attachment...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-200" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 lg:col-span-3">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Description / Instructions <span className="text-rose-500">*</span></Label>
              <textarea 
                name="description" 
                rows={4}
                placeholder="Enter homework instructions, questions, reading materials, or problem numbers..."
                value={formData.description} onChange={handleChange}
                className="flex min-h-[120px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none" 
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-200">
            <Button 
              disabled={submitting} 
              type="submit" 
              style={{ backgroundColor: '#084A86' }}
              className="hover:opacity-95 text-white font-bold min-w-[200px] h-10 rounded-xl cursor-pointer"
            >
              {submitting 
                ? (uploadProgress > 0 && uploadProgress < 100 ? `UPLOADING (${uploadProgress}%)...` : 'SAVING HOMEWORK...') 
                : 'PUBLISH HOMEWORK'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
