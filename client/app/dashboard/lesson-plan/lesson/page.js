'use client';

import Link from 'next/link';

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useAuth } from '@/hooks/useAuth';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

export default function LessonPage() {
  const { user } = useAuth();
  const [classesList, setClassesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  
  const [lessons, setLessons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const [formData, setFormData] = useState({ class: '', subject: '' });
  const [titles, setTitles] = useState([]);

  useEffect(() => {
    if (user) {
      if (user.role === 'Teacher') {
        if (user.assignedClass) setClassesList([{ label: user.assignedClass, value: user.assignedClass }]);
        if (user.subjects) setSubjectsList(user.subjects.map(s => ({ label: s.name, value: s.name })));
      } else {
        api.get('/class').then(r => {
          if (r.success && Array.isArray(r.data)) {
            const mapped = r.data.map(c => ({ label: c.name, value: c.name }));
            setClassesList(sortClassesAcademic(mapped));
          }
        }).catch(()=>{});
        api.get('/subject').then(r => r.success && setSubjectsList(r.data.map(s => ({ label: s.name, value: s.name })))).catch(()=>{});
      }
    }
  }, [user]);

  const handleSelectChange = (name, value) => {
    const finalValue = value?.target ? value.target.value : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const addTitleRow = () => {
    setTitles([...titles, { id: Date.now(), value: '' }]);
  };

  const removeTitleRow = (id) => {
    if (titles.length > 1) {
      setTitles(titles.filter(t => t.id !== id));
    }
  };

  const handleTitleChange = (id, value) => {
    setTitles(titles.map(t => t.id === id ? { ...t, value } : t));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.class || !formData.subject) return;

    const newLessons = titles
      .filter(t => t.value.trim() !== '')
      .map(t => ({
        id: Date.now() + Math.random(),
        class: formData.class,
        subject: formData.subject,
        lesson: t.value.trim()
      }));

    if (newLessons.length > 0) {
      setLessons([...newLessons, ...lessons]);
      setTitles([{ id: Date.now(), value: '' }]); // reset titles
      setFormData({ class: '', subject: '' }); // reset form
    }
  };

  const handleDelete = (id) => {
    setLessons(lessons.filter(l => l.id !== id));
  };

  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      const matchSearch = l.lesson.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = classFilter ? l.class === classFilter : true;
      const matchSubject = subjectFilter ? l.subject === subjectFilter : true;
      return matchSearch && matchClass && matchSubject;
    });
  }, [lessons, searchQuery, classFilter, subjectFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Lesson</h1>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Lesson Plan</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Lesson</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-base font-bold text-zinc-950">Add Lesson</h2>
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
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Subject <span className="text-rose-500">*</span></Label>
                <SearchableSelect 
                  name="subject" 
                  value={formData.subject} 
                  onChange={(v) => handleSelectChange('subject', v)}
                  placeholder="Select Subject *"
                  options={subjectsList}
                />
              </div>

              {titles.map((t, index) => (
                <div key={t.id} className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Title <span className="text-rose-500">*</span></Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Title" 
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
                <Button type="submit" className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg">SAVE LESSON</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-zinc-950">Lesson List</h2>
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
                <div className="flex items-center border border-zinc-200 rounded-md bg-white">
                  {[FileText, Download, FileText, Download, Printer, MoreVertical].map((Icon, i) => (
                    <button key={i} className={`p-2 hover:bg-zinc-100 text-zinc-600 transition-colors ${i < 5 ? 'border-r border-zinc-200' : ''}`}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
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
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Lesson</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLessons.length > 0 ? filteredLessons.map((l, i) => (
                    <tr key={l.id} className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-4 text-zinc-950 font-medium">{i + 1}</td>
                      <td className="px-4 py-4 text-zinc-950 font-semibold">{l.class}</td>
                      <td className="px-4 py-4 text-zinc-800">{l.subject}</td>
                      <td className="px-4 py-4 text-zinc-950 font-medium">{l.lesson}</td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          onClick={() => handleDelete(l.id)}
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
                      <td colSpan="5" className="px-4 py-8 text-center text-zinc-500 font-medium">
                        {searchQuery || classFilter || subjectFilter ? "No matching records found" : "No Data Available In Table"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredLessons.length > 0 ? 1 : 0} to {filteredLessons.length} of {filteredLessons.length} entries</div>
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
