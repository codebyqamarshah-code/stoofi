'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic, STANDARD_SUBJECTS_LIST, STANDARD_SECTIONS_LIST } from '@/lib/academicUtils';
import api from '@/services/api';

export default function LessonPlanOverviewPage() {
  const [teachersList, setTeachersList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  const [formData, setFormData] = useState({
    teacher: '',
    class: '',
    section: '',
    subject: ''
  });

  const [searched, setSearched] = useState(false);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    // 1. Teachers
    api.get('/teacher').then(r => {
      if (r && r.success && Array.isArray(r.data) && r.data.length > 0) {
        setTeachersList(r.data.map(t => ({ label: t.name, value: t.name })));
      } else {
        api.get('/staff').then(sr => {
          if (sr && sr.success && Array.isArray(sr.data)) {
            setTeachersList(sr.data.map(s => ({ label: s.name, value: s.name })));
          } else {
            setTeachersList([
              { label: 'Mudassir Bajwa', value: 'Mudassir Bajwa' },
              { label: 'Muhammad Ali', value: 'Muhammad Ali' },
              { label: 'Ayesha Khan', value: 'Ayesha Khan' }
            ]);
          }
        }).catch(() => {
          setTeachersList([
            { label: 'Mudassir Bajwa', value: 'Mudassir Bajwa' },
            { label: 'Muhammad Ali', value: 'Muhammad Ali' },
            { label: 'Ayesha Khan', value: 'Ayesha Khan' }
          ]);
        });
      }
    }).catch(() => {
      setTeachersList([
        { label: 'Mudassir Bajwa', value: 'Mudassir Bajwa' },
        { label: 'Muhammad Ali', value: 'Muhammad Ali' },
        { label: 'Ayesha Khan', value: 'Ayesha Khan' }
      ]);
    });

    // 2. Classes
    api.get('/class').then(r => {
      if (r && r.success && Array.isArray(r.data) && r.data.length > 0) {
        const mapped = r.data.map(c => ({ label: c.name, value: c.name }));
        setClassesList(sortClassesAcademic(mapped, { ensureStandardClasses: true }));
      } else {
        setClassesList(sortClassesAcademic([], { ensureStandardClasses: true }));
      }
    }).catch(() => {
      setClassesList(sortClassesAcademic([], { ensureStandardClasses: true }));
    });

    // 3. Sections
    api.get('/section').then(r => {
      if (r && r.success && Array.isArray(r.data) && r.data.length > 0) {
        const uniqueSecs = Array.from(new Set(r.data.map(s => String(s.name || '').replace(/^section\s+/i, '').trim()))).filter(Boolean);
        setSectionsList(uniqueSecs.map(s => ({ label: s, value: s })));
      } else {
        setSectionsList(STANDARD_SECTIONS_LIST.map(s => ({ label: s, value: s })));
      }
    }).catch(() => {
      setSectionsList(STANDARD_SECTIONS_LIST.map(s => ({ label: s, value: s })));
    });

    // 4. Subjects
    api.get('/subject').then(r => {
      if (r && r.success && Array.isArray(r.data) && r.data.length > 0) {
        setSubjectsList(r.data.map(s => ({ label: s.name, value: s.name })));
      } else {
        setSubjectsList(STANDARD_SUBJECTS_LIST.map(s => ({ label: s, value: s })));
      }
    }).catch(() => {
      setSubjectsList(STANDARD_SUBJECTS_LIST.map(s => ({ label: s, value: s })));
    });

    // Load topics
    api.get('/topic').then(r => {
      if (r && r.success && Array.isArray(r.data)) {
        setTopics(r.data);
      }
    }).catch(() => {});
  }, []);

  const handleSelectChange = (name, value) => {
    const finalValue = value?.target ? value.target.value : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSearch = () => {
    setSearched(true);
  };

  const matchingTopics = topics.filter(t => {
    if (formData.class && t.class !== formData.class) return false;
    if (formData.section && t.section !== formData.section) return false;
    if (formData.subject && t.subject !== formData.subject) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Lesson Plan Overview</h1>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Lesson Plan</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Overview</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs overflow-visible">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Teacher <span className="text-rose-500">*</span></Label>
            <SearchableSelect 
              name="teacher"
              value={formData.teacher}
              onChange={(v) => handleSelectChange('teacher', v)}
              placeholder="Select Teacher *"
              options={teachersList}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class <span className="text-rose-500">*</span></Label>
            <SearchableSelect 
              name="class"
              value={formData.class}
              onChange={(v) => handleSelectChange('class', v)}
              placeholder="Select Class *"
              options={classesList}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section <span className="text-rose-500">*</span></Label>
            <SearchableSelect 
              name="section"
              value={formData.section}
              onChange={(v) => handleSelectChange('section', v)}
              placeholder="Select Section *"
              options={sectionsList}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Subject <span className="text-rose-500">*</span></Label>
            <SearchableSelect 
              name="subject"
              value={formData.subject}
              onChange={(v) => handleSelectChange('subject', v)}
              placeholder="Select Subject *"
              options={subjectsList}
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSearch} className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>

      {searched && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h2 className="text-base font-bold text-zinc-950">Lesson Plan Status & Syllabus Coverage</h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 rounded-md text-zinc-700">
              {formData.class || 'All Classes'} &bull; {formData.subject || 'All Subjects'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase">
                <BookOpen className="h-4 w-4 text-blue-600" /> Total Topics
              </div>
              <div className="text-2xl font-black text-zinc-950 mt-2">{matchingTopics.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase">
                <CheckCircle className="h-4 w-4 text-emerald-600" /> Completed
              </div>
              <div className="text-2xl font-black text-zinc-950 mt-2">{matchingTopics.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase">
                <Clock className="h-4 w-4 text-amber-600" /> Remaining
              </div>
              <div className="text-2xl font-black text-zinc-950 mt-2">0</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
