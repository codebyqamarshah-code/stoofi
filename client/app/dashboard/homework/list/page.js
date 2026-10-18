'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  BookOpen, 
  Trash2, 
  Eye, 
  Paperclip, 
  Calendar, 
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { sortClassesAcademic, normalizeClassName } from '@/lib/academicUtils';
import { formatDateDMY } from '@/lib/utils';
import api from '@/services/api';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';

export default function HomeworkListPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({ class: '', subject: '', section: '' });
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // View modal state
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cRes, sRes, subRes, hwRes] = await Promise.all([
          api.get('/class').catch(() => null),
          api.get('/section').catch(() => null),
          api.get('/subject').catch(() => null),
          api.get('/homework').catch(() => null)
        ]);

        if (cRes?.success && Array.isArray(cRes.data)) setClasses(cRes.data);
        if (sRes?.success && Array.isArray(sRes.data)) setSections(sRes.data);
        if (subRes?.success && Array.isArray(subRes.data)) setSubjects(subRes.data);
        if (hwRes?.success && Array.isArray(hwRes.data)) setRecords(hwRes.data);
      } catch (e) {
        console.error('Error fetching homework data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this homework assignment?')) return;
    try {
      const res = await api.delete(`/homework/${id}`);
      if (res?.success !== false) {
        setRecords(prev => prev.filter(r => r._id !== id));
      } else {
        alert(res?.message || 'Failed to delete homework');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete homework assignment.');
    }
  };

  const handleReset = () => {
    setFormData({ class: '', subject: '', section: '' });
    setSearch('');
  };

  const classOptions = useMemo(() => {
    return [
      { value: '', label: 'All Classes' },
      ...sortClassesAcademic(classes.map(c => ({ value: c.name, label: c.name })))
    ];
  }, [classes]);

  const subjectOptions = useMemo(() => {
    return [
      { value: '', label: 'All Subjects' },
      ...subjects.map(s => ({ value: s.name, label: s.name }))
    ];
  }, [subjects]);

  const availableSections = useMemo(() => {
    if (formData.class) {
      const selectedClassObj = classes.find(c => 
        c.name === formData.class || 
        normalizeClassName(c.name) === normalizeClassName(formData.class)
      );
      if (selectedClassObj?.sections && Array.isArray(selectedClassObj.sections) && selectedClassObj.sections.length > 0) {
        return [
          { value: '', label: 'All Sections' },
          ...selectedClassObj.sections.map(s => {
            const raw = typeof s === 'string' ? s : (s.name || '');
            const clean = raw.replace(/^section\s+/i, '');
            return { value: raw, label: `Section ${clean}` };
          })
        ];
      }
    }

    const allSecSet = new Set();
    (sections || []).forEach(s => {
      const name = typeof s === 'string' ? s : (s.name || '');
      if (name) allSecSet.add(name);
    });
    (classes || []).forEach(c => {
      (c.sections || []).forEach(s => {
        if (s) allSecSet.add(s);
      });
    });
    if (allSecSet.size === 0) {
      ['A', 'B', 'C', 'D'].forEach(s => allSecSet.add(s));
    }

    return [
      { value: '', label: 'All Sections' },
      ...Array.from(allSecSet).sort().map(s => {
        const clean = String(s).replace(/^section\s+/i, '');
        return { value: s, label: `Section ${clean}` };
      })
    ];
  }, [formData.class, classes, sections]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchClass = !formData.class || 
        String(r.className || '').toLowerCase() === String(formData.class).toLowerCase() ||
        String(r.className || '').toLowerCase() === `class ${String(formData.class).toLowerCase()}`;
      
      const matchSubject = !formData.subject || 
        String(r.subject || '').toLowerCase() === String(formData.subject).toLowerCase();

      const matchSection = !formData.section || 
        String(r.section || '').toLowerCase() === String(formData.section).toLowerCase() ||
        String(r.section || '').toLowerCase() === `section ${String(formData.section).toLowerCase()}`;

      const q = search.toLowerCase().trim();
      const matchSearch = !q || 
        String(r.subject || '').toLowerCase().includes(q) || 
        String(r.className || '').toLowerCase().includes(q) ||
        String(r.description || '').toLowerCase().includes(q);

      return matchClass && matchSubject && matchSection && matchSearch;
    });
  }, [records, formData, search]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Stats for filtered
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    let dueToday = 0;
    let overdue = 0;
    let active = 0;
    filteredRecords.forEach(r => {
      const sub = r.submissionDate ? r.submissionDate.split('T')[0] : '';
      if (sub === todayStr) dueToday++;
      else if (sub && sub < todayStr) overdue++;
      else active++;
    });
    return { total, dueToday, overdue, active };
  }, [filteredRecords, todayStr]);

  // Export configs
  const exportColumns = [
    { key: 'className', label: 'Class' },
    { key: 'section', label: 'Section' },
    { key: 'subject', label: 'Subject' },
    { key: 'marks', label: 'Marks' },
    { key: 'homeworkDate', label: 'Homework Date' },
    { key: 'submissionDate', label: 'Due Date' },
    { key: 'status', label: 'Status' },
    { key: 'description', label: 'Description' }
  ];

  const exportData = filteredRecords.map(r => {
    const sub = r.submissionDate ? r.submissionDate.split('T')[0] : '';
    const status = sub === todayStr ? 'Due Today' : (sub && sub < todayStr ? 'Overdue' : 'Active');
    return {
      className: r.className || '—',
      section: r.section || '—',
      subject: r.subject || '—',
      marks: r.marks || '0',
      homeworkDate: formatDateDMY(r.homeworkDate),
      submissionDate: formatDateDMY(r.submissionDate),
      status,
      description: r.description || '—'
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#084A86]" />
            Homework Directory
          </h1>
          <p className="text-xs text-zinc-500 mt-1">View, filter, track deadlines, and manage published homework</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/homework" className="hover:text-zinc-600 transition-colors">Homework</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Homework List</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Filtered Homework</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{stats.total}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#084A86]">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Active Assignments</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.active}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Due Today</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.dueToday}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Overdue Tasks</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.overdue}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Box */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-visible">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
            <Search className="h-4 w-4 text-[#084A86]" />
            Filter Homework
          </h2>
          <Link href="/dashboard/homework/add">
            <Button 
              style={{ backgroundColor: '#084A86' }}
              className="hover:opacity-95 text-white font-bold flex items-center gap-2 text-xs h-9 px-4 rounded-xl cursor-pointer"
            >
              <Plus className="h-4 w-4" /> ADD HOMEWORK
            </Button>
          </Link>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Class</Label>
            <SearchableSelect
              options={classOptions}
              value={formData.class}
              onChange={e => setFormData(prev => ({ ...prev, class: e.target.value, section: '' }))}
              placeholder="All Classes"
              name="class"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Subject</Label>
            <SearchableSelect
              options={subjectOptions}
              value={formData.subject}
              onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="All Subjects"
              name="subject"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Section</Label>
            <SearchableSelect
              options={availableSections}
              value={formData.section}
              onChange={e => setFormData(prev => ({ ...prev, section: e.target.value }))}
              placeholder="All Sections"
              name="section"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400 font-medium"
            />
          </div>

          <div className="md:col-span-3 flex justify-end gap-3 pt-2 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-bold rounded-xl h-9 px-4 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Homework Table Card */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          <div>
            <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#084A86]" />
              Assigned Homework ({filteredRecords.length})
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Click details to inspect student instructions or attachments</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                placeholder="Search subject, class, notes..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="pl-9 h-9 bg-white border-zinc-200 text-zinc-950 text-xs rounded-xl focus-visible:ring-[#084A86]" 
              />
            </div>

            <TableExportToolbar
              data={exportData}
              columns={exportColumns}
              filename="Homework_Assignments_Directory"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3.5 font-bold w-12">#</th>
                <th className="px-4 py-3.5 font-bold">Class & Section</th>
                <th className="px-4 py-3.5 font-bold">Subject</th>
                <th className="px-4 py-3.5 font-bold">Max Marks</th>
                <th className="px-4 py-3.5 font-bold">Assign Date</th>
                <th className="px-4 py-3.5 font-bold">Due Date</th>
                <th className="px-4 py-3.5 font-bold">Attachment</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                      Loading homework records...
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    No homework assigned matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => {
                  const sub = r.submissionDate ? r.submissionDate.split('T')[0] : '';
                  const isDueToday = sub === todayStr;
                  const isOverdue = sub && sub < todayStr;
                  const isActive = sub > todayStr;

                  return (
                    <tr key={r._id || i} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-zinc-500 text-xs">#{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800">
                          {r.className} ({r.section?.startsWith('Section') ? r.section : `Section ${r.section}`})
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-zinc-950">
                        {r.subject}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-zinc-700">
                        {r.marks || '0'}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 text-xs font-medium whitespace-nowrap">
                        {formatDateDMY(r.homeworkDate)}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold whitespace-nowrap">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : isDueToday ? 'text-amber-600 font-bold' : 'text-zinc-800'}>
                          {formatDateDMY(r.submissionDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {r.file ? (
                          <a 
                            href={r.file} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#084A86] hover:underline font-bold"
                          >
                            <Paperclip className="h-3 w-3" />
                            File
                          </a>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isDueToday 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : isOverdue 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isDueToday && <Clock className="h-3 w-3" />}
                          {isOverdue && <AlertCircle className="h-3 w-3" />}
                          {isActive && <CheckCircle2 className="h-3 w-3" />}
                          {isDueToday ? 'Due Today' : isOverdue ? 'Overdue' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            onClick={() => { setSelectedHomework(r); setIsViewOpen(true); }}
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={() => handleDelete(r._id)} 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Assignment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500 bg-zinc-50/30">
          <div>Showing <span className="font-bold text-zinc-900">{filteredRecords.length}</span> assigned homework tasks</div>
          <Link href="/dashboard/homework/report" className="text-[#084A86] font-bold hover:underline">
            Go to Evaluation & Reports &rarr;
          </Link>
        </div>
      </div>

      {/* Homework Details Modal */}
      {isViewOpen && selectedHomework && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 text-zinc-950 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#084A86]" />
                  Homework Task Details
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {selectedHomework.className} &bull; Section {selectedHomework.section}
                </p>
              </div>
              <button 
                onClick={() => setIsViewOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Subject</span>
                  <span className="font-bold text-zinc-900 text-sm">{selectedHomework.subject}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Total Marks</span>
                  <span className="font-bold text-zinc-900 text-sm font-mono">{selectedHomework.marks || '0'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Assign Date</span>
                  <span className="font-medium text-zinc-800">
                    {formatDateDMY(selectedHomework.homeworkDate)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Submission Due</span>
                  <span className="font-bold text-rose-600">
                    {formatDateDMY(selectedHomework.submissionDate)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block font-semibold uppercase text-[10px] mb-1">Homework Instructions</span>
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 whitespace-pre-wrap leading-relaxed text-xs">
                  {selectedHomework.description || 'No description provided.'}
                </div>
              </div>

              {selectedHomework.file && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-[#084A86]" />
                    <span className="font-bold text-[#084A86]">Attached Assignment Worksheet</span>
                  </div>
                  <a 
                    href={selectedHomework.file} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#084A86] text-white rounded-lg font-bold text-xs hover:opacity-90 inline-flex items-center gap-1"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 mt-5">
              <Button 
                variant="outline" 
                onClick={() => setIsViewOpen(false)}
                className="text-xs h-9 text-zinc-700 border-zinc-200 rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
