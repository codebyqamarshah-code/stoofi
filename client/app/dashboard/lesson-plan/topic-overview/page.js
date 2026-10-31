'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic, STANDARD_SUBJECTS_LIST, STANDARD_SECTIONS_LIST } from '@/lib/academicUtils';
import api from '@/services/api';

const LOCAL_STORAGE_TOPICS_KEY = 'stoofi_lesson_plan_topics';

export default function TopicOverviewPage() {
  const [rawClasses, setRawClasses] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const [allTopics, setAllTopics] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTopics = async (cls = '', sec = '', sub = '') => {
    setLoading(true);
    try {
      const params = {};
      if (cls && cls !== 'All Classes' && cls !== 'All') {
        params.class = cls.replace(/^Class\s*/i, '').trim();
      }
      if (sec && sec !== 'All Sections' && sec !== 'All') {
        params.section = sec.replace(/^Section\s*/i, '').trim();
      }
      if (sub && sub !== 'All Subjects' && sub !== 'All') {
        params.subject = sub.trim();
      }

      const r = await api.get('/topic', { params });
      if (r && r.success && Array.isArray(r.data)) {
        setFilteredResults(r.data);
        if (!cls && !sec && !sub) {
          setAllTopics(r.data);
        }
        return;
      }
    } catch (err) {
      console.warn('API /topic fetch error:', err);
    } finally {
      setLoading(false);
    }

    // Robust Fallback: in-memory filter
    let list = allTopics;
    if (cls && cls !== 'All Classes' && cls !== 'All') {
      const c = cls.replace(/^Class\s*/i, '').toLowerCase().trim();
      list = list.filter(t => (t.class || '').toLowerCase().includes(c));
    }
    if (sec && sec !== 'All Sections' && sec !== 'All') {
      const s = sec.replace(/^Section\s*/i, '').toLowerCase().trim();
      list = list.filter(t => (t.section || '').toLowerCase() === s);
    }
    if (sub && sub !== 'All Subjects' && sub !== 'All') {
      const sb = sub.toLowerCase().trim();
      list = list.filter(t => (t.subject || '').toLowerCase().includes(sb));
    }
    setFilteredResults(list);
  };

  // Load Dropdown Lookups & Initial Topics
  useEffect(() => {
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

    api.get('/subject').then(r => {
      if (r && r.success && Array.isArray(r.data) && r.data.length > 0) {
        setSubjectsList(r.data.map(s => ({ label: s.name, value: s.name })));
      } else {
        setSubjectsList(STANDARD_SUBJECTS_LIST.map(s => ({ label: s, value: s })));
      }
    }).catch(() => {
      setSubjectsList(STANDARD_SUBJECTS_LIST.map(s => ({ label: s, value: s })));
    });

    // Fetch initial topics from live Atlas
    fetchTopics('', '', '');
  }, []);

  const handleSearch = () => {
    fetchTopics(selectedClass, selectedSection, selectedSubject);
  };

  const displayedList = useMemo(() => {
    if (!tableSearch) return filteredResults;
    const q = tableSearch.toLowerCase();
    return filteredResults.filter(r => 
      (r.lesson || '').toLowerCase().includes(q) ||
      (r.topic || '').toLowerCase().includes(q) ||
      (r.class || '').toLowerCase().includes(q) ||
      (r.subject || '').toLowerCase().includes(q)
    );
  }, [filteredResults, tableSearch]);

  const availableSections = useMemo(() => {
    if (selectedClass) {
      const cls = rawClasses.find(c => c.name === selectedClass);
      if (cls?.sections && Array.isArray(cls.sections) && cls.sections.length > 0) {
        return cls.sections.map(s => ({ label: s, value: s }));
      }
    }
    return sectionsList.length > 0 ? sectionsList : STANDARD_SECTIONS_LIST.map(s => ({ label: s, value: s }));
  }, [selectedClass, rawClasses, sectionsList]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Topic Overview</h1>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Lesson Plan</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Topic Overview</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs overflow-visible">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class</Label>
            <SearchableSelect 
              name="class"
              value={selectedClass}
              onChange={(v) => {
                const val = v?.target ? v.target.value : v;
                setSelectedClass(val);
                setSelectedSection('');
              }}
              placeholder="Select Class"
              options={[{ label: 'All Classes', value: '' }, ...classesList]}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section</Label>
            <SearchableSelect 
              name="section"
              value={selectedSection}
              onChange={(v) => setSelectedSection(v?.target ? v.target.value : v)}
              placeholder="Select Section"
              options={[{ label: 'All Sections', value: '' }, ...availableSections]}
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
          <Button 
            onClick={handleSearch} 
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 h-10 shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Search className="h-4 w-4" /> 
            {loading ? 'SEARCHING...' : 'SEARCH'}
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-visible shadow-xs flex flex-col">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-t-xl">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="SEARCH TABLE" 
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="pl-9 w-[220px] bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 text-xs font-semibold uppercase" 
            />
          </div>
          <TableExportToolbar />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Lesson</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedList.length > 0 ? (
                displayedList.map((r, i) => (
                  <tr key={r.id || r._id || i} className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-4 text-zinc-950 font-semibold">{r.class}</td>
                    <td className="px-4 py-4 text-zinc-800 font-medium">{r.section}</td>
                    <td className="px-4 py-4 text-zinc-800 font-medium">{r.subject}</td>
                    <td className="px-4 py-4 text-zinc-950 font-semibold">{r.lesson}</td>
                    <td className="px-4 py-4 text-zinc-950 font-medium">{r.topic}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        r.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {r.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-zinc-500 font-medium">
                    {selectedClass || selectedSubject || tableSearch ? "No matching records found" : "No Data Available In Table"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing {displayedList.length > 0 ? 1 : 0} to {displayedList.length} of {displayedList.length} entries</div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled>
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}