'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic, STANDARD_SUBJECTS_LIST } from '@/lib/academicUtils';
import api from '@/services/api';

export default function LessonPlanPage() {
  const [teachersList, setTeachersList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  const [teacher, setTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searched, setSearched] = useState(false);

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
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Lesson Plan Create</h1>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Lesson Plan</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Lesson Plan Create</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs overflow-visible">
        <div className="mb-4">
          <h2 className="text-base font-bold text-zinc-950">Select Criteria</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Teacher <span className="text-rose-500">*</span></Label>
            <SearchableSelect 
              name="teacher"
              value={teacher}
              onChange={(v) => setTeacher(v?.target ? v.target.value : v)}
              placeholder="Select Teacher *"
              options={teachersList}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class</Label>
            <SearchableSelect 
              name="class"
              value={selectedClass}
              onChange={(v) => setSelectedClass(v?.target ? v.target.value : v)}
              placeholder="Select Class"
              options={[{ label: 'All Classes', value: '' }, ...classesList]}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Subject</Label>
            <SearchableSelect 
              name="subject"
              value={selectedSubject}
              onChange={(v) => setSelectedSubject(v?.target ? v.target.value : v)}
              placeholder="Select Subject"
              options={[{ label: 'All Subjects', value: '' }, ...subjectsList]}
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={() => setSearched(true)} className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>

      {searched && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-zinc-700" />
              <h2 className="text-base font-bold text-zinc-950">Active Weekly Lesson Plans</h2>
            </div>
            <Link href="/dashboard/lesson-plan/lesson">
              <Button size="sm" className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold">
                <Plus className="h-4 w-4 mr-1.5" /> ADD NEW LESSON
              </Button>
            </Link>
          </div>
          <div className="p-8 text-center text-zinc-500 font-medium">
            No lesson plan timetable scheduled for selected teacher and criteria. Click &quot;ADD NEW LESSON&quot; to define syllabus units.
          </div>
        </div>
      )}
    </div>
  );
}
