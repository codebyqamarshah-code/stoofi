'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic, STANDARD_SUBJECTS_LIST, STANDARD_SECTIONS_LIST } from '@/lib/academicUtils';
import api from '@/services/api';

export default function LessonPlanOverviewPage() {
  const [rawClasses, setRawClasses] = useState([]);
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
      if (r?.success && Array.isArray(r.data) && r.data.length > 0) {
        setTeachersList(r.data.map(t => ({ label: t.name, value: t.name })));
      } else {
        api.get('/staff').then(sr => {
          if (sr?.success && Array.isArray(sr.data)) {
            const faculty = sr.data.filter(s => s.role === 'Teacher' || s.designation?.toLowerCase().includes('teacher'));
            const list = faculty.length > 0 ? faculty : sr.data;
            setTeachersList(list.map(s => ({ label: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim(), value: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() })));
          }
        }).catch(() => {});
      }
    }).catch(() => {});


    // 2. Classes
    api.get('/class').then(r => {
      if (r && r.success && Array.isArray(r.data) && r.data.length > 0) {
        setRawClasses(r.data);
        const mapped = r.data.map(c => ({ label: c.name, value: c.name }));
        setClassesList(sortClassesAcademic(mapped, { ensureStandardClasses: true }));
      } else {
        setRawClasses([]);
        setClassesList(sortClassesAcademic([], { ensureStandardClasses: true }));
      }
    }).catch(() => {
      setRawClasses([]);
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

  const availableSections = useMemo(() => {
    if (formData.class) {
      const cls = rawClasses.find(c => c.name === formData.class);
      if (cls?.sections && Array.isArray(cls.sections) && cls.sections.length > 0) {
        return cls.sections.map(s => ({ label: s, value: s }));
      }
    }
    return sectionsList.length > 0 ? sectionsList : STANDARD_SECTIONS_LIST.map(s => ({ label: s, value: s }));
  }, [formData.class, rawClasses, sectionsList]);

  const handleSelectChange = (name, value) => {
    const finalValue = value?.target ? value.target.value : value;
    setFormData(prev => {
      const updated = { ...prev, [name]: finalValue };
      if (name === 'class') {
        updated.section = '';
      }
      return updated;
    });
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
              options={availableSections}
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
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 gap-2">
            <div>
              <h2 className="text-base font-bold text-zinc-950">Lesson Plan Status & Syllabus Coverage</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Teacher: <span className="font-semibold text-zinc-900">{formData.teacher || 'All'}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 rounded-md text-zinc-700">
                {formData.class || 'All Classes'} &bull; {formData.section ? `Sec ${formData.section}` : 'All Sections'} &bull; {formData.subject || 'All Subjects'}
              </span>
              <TableExportToolbar />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase">
                Coverage
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-2">
                {matchingTopics.length > 0 ? '100%' : '0%'}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-200 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                <tr>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Lesson Unit</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {matchingTopics.length > 0 ? (
                  matchingTopics.map((t, idx) => (
                    <tr key={t._id || t.id || idx} className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-zinc-950">{t.class}</td>
                      <td className="px-4 py-3.5 text-zinc-800">{t.section || 'All'}</td>
                      <td className="px-4 py-3.5 text-zinc-800">{t.subject}</td>
                      <td className="px-4 py-3.5 font-medium text-zinc-900">{t.lesson}</td>
                      <td className="px-4 py-3.5 text-zinc-900">{t.topic}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 font-medium">
                      No topics found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
