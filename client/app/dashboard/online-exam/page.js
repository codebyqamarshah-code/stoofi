'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

export default function OnlineExamPage() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);

  const [formData, setFormData] = useState({ 
    title: '', classId: '', subjectId: '', sectionId: '', date: '', endDate: '',
    startTime: '', endTime: '', minPercentage: '', instruction: '', autoMarkRegister: false
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [eRes, cRes, subRes, secRes] = await Promise.all([
        api.get('/online-exam'),
        api.get('/class'),
        api.get('/subject'),
        api.get('/section')
      ]);
      if (eRes.success) setExams(eRes.data);
      if (cRes.success) setClasses(cRes.data);
      if (subRes.success) setSubjects(subRes.data);
      if (secRes.success) setSections(secRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.classId || !formData.subjectId || !formData.date || !formData.startTime || !formData.endTime) {
      return alert('Please fill all required fields');
    }
    try {
      setSubmitting(true);
      const res = await api.post('/online-exam', formData);
      if (res.success) {
        setFormData({ 
          title: '', classId: '', subjectId: '', sectionId: '', date: '', endDate: '',
          startTime: '', endTime: '', minPercentage: '', instruction: '', autoMarkRegister: false
        });
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      try {
        const res = await api.delete(`/online-exam/${id}`);
        if (res.success) fetchData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const getClassName = (id) => classes.find(c => c._id === id)?.name || '-';
  const getSectionName = (id) => sections.find(s => s._id === id)?.name || '-';
  const getSubjectName = (id) => subjects.find(s => s._id === id)?.name || '-';

  const filtered = exams.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Online Exam</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Online Exam</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Online Exam</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Add Online Exam</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Exam Title <span className="text-rose-500">*</span></Label>
                <Input 
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
                <SearchableSelect 
                  value={formData.classId} onChange={(val) => setFormData({...formData, classId: val})}
                  placeholder="Select Class *"
                  options={classes.map(c => ({ label: c.name, value: c._id }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Subject <span className="text-rose-500">*</span></Label>
                <SearchableSelect 
                  value={formData.subjectId} onChange={(val) => setFormData({...formData, subjectId: val})}
                  placeholder="Select Subject *"
                  options={subjects.map(s => ({ label: s.name, value: s._id }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Section <span className="text-rose-500">*</span></Label>
                <SearchableSelect 
                  value={formData.sectionId} onChange={(val) => setFormData({...formData, sectionId: val})}
                  placeholder="Select Section *"
                  options={sections.map(s => ({ label: s.name, value: s._id }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Date <span className="text-rose-500">*</span></Label>
                <Input 
                  type="date"
                  value={formData.date ? formData.date.substring(0,10) : ''} onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600 [color-scheme:dark]" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">End Date <span className="text-rose-500">*</span></Label>
                <Input 
                  type="date"
                  value={formData.endDate ? formData.endDate.substring(0,10) : ''} onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600 [color-scheme:dark]" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Start Time <span className="text-rose-500">*</span></Label>
                <Input 
                  type="time"
                  value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600 [color-scheme:dark]" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">End Time <span className="text-rose-500">*</span></Label>
                <Input 
                  type="time"
                  value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600 [color-scheme:dark]" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Minimum Percentage <span className="text-rose-500">*</span></Label>
                <Input 
                  type="number"
                  value={formData.minPercentage} onChange={(e) => setFormData({...formData, minPercentage: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Instruction</Label>
                <textarea 
                  value={formData.instruction} onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                  className="flex min-h-[100px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600" 
                />
              </div>
              <div className="space-y-1.5 pt-2 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.autoMarkRegister}
                  onChange={(e) => setFormData({...formData, autoMarkRegister: e.target.checked})}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-zinc-400">Auto Mark Register</span>
              </div>
              
              <Button disabled={submitting} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold mt-4">
                {submitting ? 'SAVING...' : 'SAVE ONLINE EXAM'}
              </Button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Online Exam List</h2>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="QUICK SEARCH" 
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-zinc-600"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Class (Section)</th>
                    <th className="px-4 py-3 font-semibold">Subject</th>
                    <th className="px-4 py-3 font-semibold">Exam Date</th>
                    <th className="px-4 py-3 font-semibold">Duration</th>
                    <th className="px-4 py-3 font-semibold">Minimum Percentage</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : (
                    filtered.map(item => (
                      <tr key={item._id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 text-zinc-300">{item.title}</td>
                        <td className="px-4 py-3 text-zinc-400">{getClassName(item.classId)} ({getSectionName(item.sectionId)})</td>
                        <td className="px-4 py-3 text-zinc-400">{getSubjectName(item.subjectId)}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.date ? item.date.substring(0,10) : ''}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.startTime} - {item.endTime}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.minPercentage}%</td>
                        <td className="px-4 py-3 text-right">
                          <Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
                            DELETE
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
