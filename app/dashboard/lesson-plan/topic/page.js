'use client';

import Link from 'next/link';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TopicPage() {
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const [formData, setFormData] = useState({ class: '', section: '', subject: '', lesson: '' });
  const [titles, setTitles] = useState([{ id: Date.now(), value: '' }]);

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
    if (!formData.class || !formData.section || !formData.subject || !formData.lesson) return;

    const newTopics = titles
      .filter(t => t.value.trim() !== '')
      .map(t => ({
        id: Date.now() + Math.random(),
        class: formData.class,
        section: formData.section,
        subject: formData.subject,
        lesson: formData.lesson,
        topic: t.value.trim()
      }));

    if (newTopics.length > 0) {
      setTopics([...newTopics, ...topics]);
      setTitles([{ id: Date.now(), value: '' }]); // reset titles
      setFormData({ class: '', section: '', subject: '', lesson: '' }); // reset form
    }
  };

  const handleDelete = (id) => {
    setTopics(topics.filter(t => t.id !== id));
  };

  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      const matchSearch = t.topic.toLowerCase().includes(searchQuery.toLowerCase()) || t.lesson.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = classFilter ? t.class === classFilter : true;
      const matchSubject = subjectFilter ? t.subject === subjectFilter : true;
      return matchSearch && matchClass && matchSubject;
    });
  }, [topics, searchQuery, classFilter, subjectFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Topic</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Lesson Plan</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Topic</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Add Topic</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
                <select 
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  required
                >
                  <option value="">Select Class</option>
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Section <span className="text-rose-500">*</span></Label>
                <select 
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  required
                >
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Subject <span className="text-rose-500">*</span></Label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Lesson <span className="text-rose-500">*</span></Label>
                <select 
                  value={formData.lesson}
                  onChange={(e) => setFormData({...formData, lesson: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  required
                >
                  <option value="">Select Lesson</option>
                  <option value="Algebra Basics">Algebra Basics</option>
                  <option value="Grammar">Grammar</option>
                </select>
              </div>

              {titles.map((t, index) => (
                <div key={t.id} className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Topic Title <span className="text-rose-500">*</span></Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Topic Title" 
                      value={t.value}
                      onChange={(e) => handleTitleChange(t.id, e.target.value)}
                      className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
                      required
                    />
                    {index === titles.length - 1 ? (
                      <Button type="button" onClick={addTitleRow} variant="secondary" size="icon" className="h-10 w-10 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
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
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">SAVE TOPIC</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Topic List</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="SEARCH" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[180px] bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs font-semibold uppercase" 
                  />
                </div>
                <div className="flex items-center border border-zinc-800 rounded-md bg-zinc-900">
                  {[FileText, Download, FileText, Download, Printer, MoreVertical].map((Icon, i) => (
                    <button key={i} className={`p-2 hover:bg-zinc-800 text-zinc-400 transition-colors ${i < 5 ? 'border-r border-zinc-800' : ''}`}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Filters */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/30 flex flex-col sm:flex-row gap-4">
               <select 
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="flex h-9 w-full sm:w-[200px] rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="">All Classes</option>
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                </select>
                <select 
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="flex h-9 w-full sm:w-[200px] rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="">All Subjects</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">SL</th>
                    <th className="px-4 py-3 font-semibold">Class</th>
                    <th className="px-4 py-3 font-semibold">Section</th>
                    <th className="px-4 py-3 font-semibold">Subject</th>
                    <th className="px-4 py-3 font-semibold">Lesson</th>
                    <th className="px-4 py-3 font-semibold">Topic</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopics.length > 0 ? filteredTopics.map((t, i) => (
                    <tr key={t.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-4 text-zinc-300">{i + 1}</td>
                      <td className="px-4 py-4 text-zinc-300">{t.class}</td>
                      <td className="px-4 py-4 text-zinc-300">{t.section}</td>
                      <td className="px-4 py-4 text-zinc-300">{t.subject}</td>
                      <td className="px-4 py-4 text-zinc-300">{t.lesson}</td>
                      <td className="px-4 py-4 text-zinc-300">{t.topic}</td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          onClick={() => handleDelete(t.id)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> DELETE
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-zinc-500">
                        {searchQuery || classFilter || subjectFilter ? "No matching records found" : "No Data Available In Table"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredTopics.length > 0 ? 1 : 0} to {filteredTopics.length} of {filteredTopics.length} entries</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
