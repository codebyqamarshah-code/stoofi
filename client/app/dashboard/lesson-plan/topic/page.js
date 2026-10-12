'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Search, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useAuth } from '@/hooks/useAuth';
import { sortClassesAcademic, STANDARD_SUBJECTS_LIST, STANDARD_SECTIONS_LIST } from '@/lib/academicUtils';
import api from '@/services/api';

const LOCAL_STORAGE_TOPICS_KEY = 'stoofi_lesson_plan_topics';
const LOCAL_STORAGE_LESSONS_KEY = 'stoofi_lesson_plan_lessons';

export default function TopicPage() {
  const { user } = useAuth();
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [allLessons, setAllLessons] = useState([]);

  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const [formData, setFormData] = useState({ class: '', section: '', subject: '', lesson: '' });
  const [titles, setTitles] = useState([{ id: Date.now(), value: '' }]);

  // Load Classes, Sections, Subjects
  useEffect(() => {
    // 1. Classes
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

    // 2. Sections
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

    // 3. Subjects
    api.get('/subject').then(r => {
      if (r && r.success && Array.isArray(r.data) && r.data.length > 0) {
        setSubjectsList(r.data.map(s => ({ label: s.name, value: s.name })));
      } else {
        setSubjectsList(STANDARD_SUBJECTS_LIST.map(s => ({ label: s, value: s })));
      }
    }).catch(() => {
      setSubjectsList(STANDARD_SUBJECTS_LIST.map(s => ({ label: s, value: s })));
    });

    // 4. Lessons for selection
    api.get('/lesson').then(r => {
      if (r && r.success && Array.isArray(r.data)) {
        setAllLessons(r.data);
      }
    }).catch(() => {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_LESSONS_KEY);
        if (cached) setAllLessons(JSON.parse(cached));
      } catch (_) {}
    });
  }, []);

  // Load Topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/topic');
        if (res && res.success && Array.isArray(res.data)) {
          setTopics(res.data.map(t => ({
            id: t._id || t.id,
            class: t.class,
            section: t.section,
            subject: t.subject,
            lesson: t.lesson,
            topic: t.topic
          })));
          return;
        }
      } catch (_) {}

      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_TOPICS_KEY);
        if (cached) {
          setTopics(JSON.parse(cached));
        }
      } catch (_) {}
    };

    fetchTopics();
  }, []);

  // Filter lessons based on selected class and subject
  const availableLessons = useMemo(() => {
    let list = [];
    if (formData.class && formData.subject) {
      list = allLessons
        .filter(l => l.class === formData.class && l.subject === formData.subject)
        .map(l => ({ label: l.lesson, value: l.lesson }));
    } else if (formData.class) {
      list = allLessons
        .filter(l => l.class === formData.class)
        .map(l => ({ label: l.lesson, value: l.lesson }));
    } else {
      list = allLessons.map(l => ({ label: l.lesson, value: l.lesson }));
    }

    // If no specific lessons were entered yet, provide standard academic fallback units
    if (list.length === 0) {
      const fallbackLessons = [
        'Chapter 1 - Introduction & Basics',
        'Chapter 2 - Fundamentals & Core Concepts',
        'Chapter 3 - Advanced Topics',
        'Unit 1 - Theoretical Foundations',
        'Unit 2 - Practical Applications',
        'Revision & Exercises'
      ];
      return fallbackLessons.map(l => ({ label: l, value: l }));
    }

    // Deduplicate
    const seen = new Set();
    return list.filter(item => {
      if (seen.has(item.value)) return false;
      seen.add(item.value);
      return true;
    });
  }, [allLessons, formData.class, formData.subject]);

  const handleSelectChange = (name, value) => {
    const finalValue = value?.target ? value.target.value : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const addTitleRow = () => {
    setTitles(prev => [...prev, { id: Date.now(), value: '' }]);
  };

  const removeTitleRow = (id) => {
    if (titles.length > 1) {
      setTitles(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleTitleChange = (id, value) => {
    setTitles(prev => prev.map(t => t.id === id ? { ...t, value } : t));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.class || !formData.section || !formData.subject || !formData.lesson) return;

    const validTitles = titles.map(t => t.value.trim()).filter(Boolean);
    if (validTitles.length === 0) return;

    const newTopics = validTitles.map(t => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      class: formData.class,
      section: formData.section,
      subject: formData.subject,
      lesson: formData.lesson,
      topic: t
    }));

    // Optimistic UI update + localStorage cache
    const updated = [...newTopics, ...topics];
    setTopics(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_TOPICS_KEY, JSON.stringify(updated));
    } catch (_) {}

    // Reset Form
    setTitles([{ id: Date.now(), value: '' }]);
    setFormData({ class: '', section: '', subject: '', lesson: '' });

    // Persist to Backend API
    try {
      await api.post('/topic', {
        class: formData.class,
        section: formData.section,
        subject: formData.subject,
        lesson: formData.lesson,
        topics: validTitles
      });
    } catch (_) {}
  };

  const handleDelete = async (id) => {
    const updated = topics.filter(t => t.id !== id);
    setTopics(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_TOPICS_KEY, JSON.stringify(updated));
    } catch (_) {}

    try {
      await api.delete(`/topic/${id}`);
    } catch (_) {}
  };

  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      const matchSearch = (t.topic || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.lesson || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = classFilter ? t.class === classFilter : true;
      const matchSubject = subjectFilter ? t.subject === subjectFilter : true;
      return matchSearch && matchClass && matchSubject;
    });
  }, [topics, searchQuery, classFilter, subjectFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Topic</h1>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Lesson Plan</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Topic</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left: Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-visible shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 rounded-t-xl">
              <h2 className="text-base font-bold text-zinc-950">Add Topic</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSave}>
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

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Lesson <span className="text-rose-500">*</span></Label>
                <SearchableSelect 
                  name="lesson"
                  value={formData.lesson}
                  onChange={(v) => handleSelectChange('lesson', v)}
                  placeholder="Select Lesson *"
                  options={availableLessons}
                />
              </div>

              {titles.map((t, index) => (
                <div key={t.id} className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Topic Title <span className="text-rose-500">*</span></Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Topic Title" 
                      value={t.value}
                      onChange={(e) => handleTitleChange(t.id, e.target.value)}
                      className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium" 
                      required
                    />
                    {index === titles.length - 1 ? (
                      <Button type="button" onClick={addTitleRow} variant="secondary" size="icon" className="h-10 w-10 shrink-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md border border-zinc-200">
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="button" onClick={() => removeTitleRow(t.id)} variant="secondary" size="icon" className="h-10 w-10 shrink-0 bg-rose-600 hover:bg-rose-700 text-white rounded-md">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <Button type="submit" className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg">SAVE TOPIC</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-visible shadow-xs flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-t-xl">
              <h2 className="text-base font-bold text-zinc-950">Topic List</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    placeholder="SEARCH" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[180px] bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 text-xs font-semibold uppercase" 
                  />
                </div>
                <TableExportToolbar />
              </div>
            </div>

            {/* Table Filters */}
            <div className="p-4 border-b border-zinc-100 bg-white flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-[200px]">
                <SearchableSelect 
                  name="classFilter" 
                  value={classFilter} 
                  onChange={(v) => setClassFilter(v?.target ? v.target.value : v)}
                  placeholder="All Classes"
                  options={[{ label: 'All Classes', value: '' }, ...classesList]}
                />
              </div>
              <div className="w-full sm:w-[200px]">
                <SearchableSelect 
                  name="subjectFilter" 
                  value={subjectFilter} 
                  onChange={(v) => setSubjectFilter(v?.target ? v.target.value : v)}
                  placeholder="All Subjects"
                  options={[{ label: 'All Subjects', value: '' }, ...subjectsList]}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Lesson</th>
                    <th className="px-4 py-3">Topic</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopics.length > 0 ? filteredTopics.map((t, i) => (
                    <tr key={t.id} className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-4 text-zinc-950 font-medium">{i + 1}</td>
                      <td className="px-4 py-4 text-zinc-950 font-semibold">{t.class}</td>
                      <td className="px-4 py-4 text-zinc-800">{t.section}</td>
                      <td className="px-4 py-4 text-zinc-800">{t.subject}</td>
                      <td className="px-4 py-4 text-zinc-950">{t.lesson}</td>
                      <td className="px-4 py-4 text-zinc-950 font-medium">{t.topic}</td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          onClick={() => handleDelete(t.id)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> DELETE
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-zinc-500 font-medium">
                        {searchQuery || classFilter || subjectFilter ? "No matching records found" : "No Data Available In Table"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredTopics.length > 0 ? 1 : 0} to {filteredTopics.length} of {filteredTopics.length} entries</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}