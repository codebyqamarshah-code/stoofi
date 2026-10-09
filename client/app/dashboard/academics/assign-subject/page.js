'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Download, 
  Printer, 
  FileText, 
  Loader2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  BookOpen,
  Filter,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function AssignSubjectPage() {
  const [assignedList, setAssignedList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Criteria Filter
  const [filterClass, setFilterClass] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Modal Form State
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    subject: '',
    teacher: '',
    type: 'Theory'
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch live classes, sections, subjects & teachers
  const loadDependencies = async () => {
    try {
      const [classRes, secRes, subjRes, staffRes, teacherRes] = await Promise.allSettled([
        api.get('/class'),
        api.get('/section'),
        api.get('/subject'),
        api.get('/staff?limit=100'),
        api.get('/teacher?limit=100')
      ]);

      if (classRes.status === 'fulfilled' && classRes.value?.success && Array.isArray(classRes.value.data)) {
        setClasses(classRes.value.data);
      }
      if (secRes.status === 'fulfilled' && secRes.value?.success && Array.isArray(secRes.value.data)) {
        setSections(secRes.value.data);
      }
      if (subjRes.status === 'fulfilled' && subjRes.value?.success && Array.isArray(subjRes.value.data)) {
        setSubjects(subjRes.value.data);
      }

      // Collect real teachers
      let combinedTeachers = [];
      const seen = new Set();

      if (staffRes.status === 'fulfilled' && staffRes.value?.success && Array.isArray(staffRes.value.data)) {
        const staffList = staffRes.value.data;
        const onlyTeachers = staffList.filter(s => 
          (s.role && s.role.toLowerCase() === 'teacher') || 
          (s.designation && s.designation.toLowerCase().includes('teacher'))
        );
        const listToUse = onlyTeachers.length > 0 ? onlyTeachers : staffList;
        listToUse.forEach(s => {
          const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || s.email;
          if (name && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            combinedTeachers.push(name);
          }
        });
      }

      if (teacherRes.status === 'fulfilled' && teacherRes.value?.success && Array.isArray(teacherRes.value.data)) {
        teacherRes.value.data.forEach(t => {
          const name = `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name || t.email;
          if (name && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            combinedTeachers.push(name);
          }
        });
      }

      setTeachers(combinedTeachers);
    } catch (err) {
      console.error('Failed to load dependencies:', err);
    }
  };

  // 2. Fetch assigned subjects
  const fetchAssignedSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assign-subject');
      if (res?.success && Array.isArray(res.data)) {
        setAssignedList(res.data);
      } else {
        setAssignedList([]);
      }
    } catch (err) {
      console.error('Failed to load assigned subjects:', err);
      setAssignedList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDependencies();
    fetchAssignedSubjects();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      className: classes[0]?.name || '',
      section: sections[0]?.name || '',
      subject: subjects[0]?.name || '',
      teacher: teachers[0] || '',
      type: 'Theory'
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setFormData({
      className: item.className || '',
      section: item.section || '',
      subject: item.subject || '',
      teacher: item.teacher || '',
      type: item.type || 'Theory'
    });
    setShowModal(true);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.className) {
      showToast('Please select a Class.', true);
      return;
    }
    if (!formData.section) {
      showToast('Please select a Section.', true);
      return;
    }
    if (!formData.subject) {
      showToast('Please select a Subject.', true);
      return;
    }
    if (!formData.teacher) {
      showToast('Please select a Teacher.', true);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        className: formData.className,
        section: formData.section,
        subject: formData.subject,
        teacher: formData.teacher,
        type: formData.type
      };

      if (isEditing && editId) {
        const res = await api.put(`/assign-subject/${editId}`, payload);
        if (res?.success) {
          showToast('Subject assignment updated successfully!');
          setShowModal(false);
          fetchAssignedSubjects();
        } else {
          showToast(res?.message || 'Failed to update subject assignment.', true);
        }
      } else {
        const res = await api.post('/assign-subject', payload);
        if (res?.success) {
          showToast('Subject assigned successfully!');
          setShowModal(false);
          fetchAssignedSubjects();
        } else {
          showToast(res?.message || 'Failed to assign subject.', true);
        }
      }
    } catch (err) {
      console.error('Error saving subject assignment:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to assign subject.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await api.delete(`/assign-subject/${deleteConfirmItem._id}`);
      if (res?.success) {
        showToast('Subject assignment deleted successfully!');
        setDeleteConfirmItem(null);
        fetchAssignedSubjects();
      } else {
        showToast(res?.message || 'Failed to delete assignment.', true);
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to delete assignment.', true);
    }
  };

  // Filter & Search Table
  const filteredList = useMemo(() => {
    return assignedList.filter(item => {
      const matchClass = filterClass === 'All' || item.className === filterClass;
      const matchSec = filterSection === 'All' || item.section === filterSection;
      const term = searchTerm.trim().toLowerCase();
      const matchSearch = !term || 
        (item.subject || '').toLowerCase().includes(term) ||
        (item.teacher || '').toLowerCase().includes(term) ||
        (item.className || '').toLowerCase().includes(term) ||
        (item.section || '').toLowerCase().includes(term);
      return matchClass && matchSec && matchSearch;
    });
  }, [assignedList, filterClass, filterSection, searchTerm]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  const handleExport = (type) => {
    if (filteredList.length === 0) {
      showToast('No assignments available to export.', true);
      return;
    }

    const exportData = filteredList.map((item, idx) => ({
      'SL': idx + 1,
      'CLASS': item.className,
      'SECTION': item.section,
      'SUBJECT': item.subject,
      'TEACHER': item.teacher,
      'TYPE': item.type || 'Theory'
    }));

    const headers = ['SL', 'CLASS', 'SECTION', 'SUBJECT', 'TEACHER', 'TYPE'];
    const filename = `Assigned_Subjects_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi Assigned Subject List');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV exported successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'AssignedSubjects');
      showToast('Excel exported successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Stoofi Assigned Subject List', filename);
      showToast('PDF exported successfully!');
    }
  };

  const availableClassNames = classes.length > 0 
    ? classes.map(c => c.name) 
    : ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'];

  const availableSectionNames = sections.length > 0 
    ? sections.map(s => s.name) 
    : ['A', 'B', 'C', 'D'];

  const availableSubjectNames = subjects.length > 0 
    ? subjects.map(s => s.name) 
    : ['English', 'Mathematics', 'Science', 'Urdu', 'Islamiyat', 'Computer Science', 'Physics', 'Chemistry', 'Biology'];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-4 ${
            toastMessage.isError 
              ? 'bg-rose-50 text-rose-800 border-rose-200' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toastMessage.isError ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-zinc-400 hover:text-zinc-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Assign Subject</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Assign subjects and course instructors to each class & section</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-700 transition-colors">Academics</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-semibold">Assign Subject</span>
        </div>
      </div>

      {/* Filter & Criteria Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            Select Criteria
          </h2>
          {/* Main + ASSIGN SUBJECT Button with exact styling */}
          <Button 
            onClick={handleOpenCreateModal}
            className="bg-[#084A86] hover:bg-[#073d6e] text-white font-bold h-9 text-xs px-4 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            ASSIGN SUBJECT
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Class</Label>
            <select 
              value={filterClass}
              onChange={e => {
                setFilterClass(e.target.value);
                setCurrentPage(1);
              }}
              className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="All">All Classes</option>
              {availableClassNames.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Section</Label>
            <select 
              value={filterSection}
              onChange={e => {
                setFilterSection(e.target.value);
                setCurrentPage(1);
              }}
              className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="All">All Sections</option>
              {availableSectionNames.map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={fetchAssignedSubjects}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-10 px-5 text-xs rounded-lg shadow-xs flex items-center gap-2 cursor-pointer flex-1"
            >
              <Search className="h-3.5 w-3.5" /> 
              SEARCH ASSIGNMENTS
            </Button>
          </div>
        </div>
      </div>

      {/* Assigned Subject List Table Card */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-950">Assigned Subject List</h2>
            <p className="text-[11px] text-zinc-500">Curriculum teaching assignments per class & section</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="SEARCH SUBJECT / TEACHER"
                className="pl-8 pr-7 h-8 text-xs font-semibold uppercase bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 rounded-lg"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Export Buttons */}
            <div className="flex items-center border border-zinc-200 rounded-lg bg-white shadow-2xs overflow-hidden">
              <button 
                onClick={() => handleExport('CSV')} 
                className="p-1.5 hover:bg-zinc-100 text-zinc-600 border-r border-zinc-200 transition-colors" 
                title="Export CSV"
              >
                <FileText className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => handleExport('Excel')} 
                className="p-1.5 hover:bg-zinc-100 text-zinc-600 border-r border-zinc-200 transition-colors" 
                title="Export Excel"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => handleExport('Print')} 
                className="p-1.5 hover:bg-zinc-100 text-zinc-600 transition-colors" 
                title="Print"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider">
                <th className="px-4 py-3 w-14">SL</th>
                <th className="px-4 py-3">CLASS</th>
                <th className="px-4 py-3">SECTION</th>
                <th className="px-4 py-3">SUBJECT</th>
                <th className="px-4 py-3">TEACHER</th>
                <th className="px-4 py-3">TYPE</th>
                <th className="px-4 py-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                      <span>Loading subject assignments...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center">
                      <BookOpen className="w-7 h-7 text-zinc-300 mb-1.5" />
                      <span className="font-semibold text-zinc-600">No Data Available In Table</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Click &quot;+ ASSIGN SUBJECT&quot; above to assign a subject to a class
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const sl = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr 
                      key={item._id} 
                      className="hover:bg-zinc-50/80 transition-colors text-zinc-950"
                    >
                      <td className="px-4 py-3 text-zinc-500 font-mono text-[11px]">{sl}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-950">{item.className}</td>
                      <td className="px-4 py-3 text-zinc-700">Section {item.section}</td>
                      <td className="px-4 py-3 font-bold text-zinc-950">{item.subject}</td>
                      <td className="px-4 py-3 font-medium text-zinc-800 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-[10px] font-extrabold flex items-center justify-center">
                          {item.teacher?.charAt(0) || 'T'}
                        </div>
                        <span>{item.teacher}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.type === 'Practical' 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {item.type || 'Theory'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            onClick={() => handleEdit(item)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-md"
                            title="Edit Assignment"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            onClick={() => setDeleteConfirmItem(item)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                            title="Delete Assignment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

        {/* Footer / Pagination */}
        <div className="p-3.5 border-t border-zinc-100 bg-zinc-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500 font-medium">
          <div>
            Showing {filteredList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredList.length)} of {filteredList.length} entries
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-7 px-2 text-xs border-zinc-200"
              >
                Previous
              </Button>
              <span className="px-2 text-zinc-700 font-semibold text-xs">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-7 px-2 text-xs border-zinc-200"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/70 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#084A86]" />
                <h2 className="text-sm font-bold text-zinc-950">
                  {isEditing ? 'Edit Subject Assignment' : 'Assign Subject to Class'}
                </h2>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Class */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Class <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    value={formData.className}
                    onChange={e => setFormData({ ...formData, className: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    required
                  >
                    <option value="">Select Class *</option>
                    {availableClassNames.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Section <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    required
                  >
                    <option value="">Select Section *</option>
                    {availableSectionNames.map(s => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Subject <span className="text-rose-500">*</span>
                </Label>
                <select 
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  required
                >
                  <option value="">Select Subject *</option>
                  {availableSubjectNames.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Assigned Teacher <span className="text-rose-500">*</span>
                  </Label>
                  {teachers.length === 0 && (
                    <span className="text-[10px] text-amber-700 font-semibold">
                      (No staff teachers found)
                    </span>
                  )}
                </div>
                {teachers.length > 0 ? (
                  <select 
                    value={formData.teacher}
                    onChange={e => setFormData({ ...formData, teacher: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    required
                  >
                    <option value="">Select Teacher *</option>
                    {teachers.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                ) : (
                  <Input 
                    value={formData.teacher}
                    onChange={e => setFormData({ ...formData, teacher: e.target.value })}
                    placeholder="Enter teacher name (e.g. Sir Aslam)"
                    className="bg-white border-zinc-300 text-xs font-medium text-zinc-950 h-10 rounded-lg"
                    required
                  />
                )}
              </div>

              {/* Subject Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Subject Type
                </Label>
                <div className="flex gap-4 pt-1">
                  {['Theory', 'Practical', 'Both'].map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-800">
                      <input 
                        type="radio" 
                        name="subjType" 
                        checked={formData.type === t} 
                        onChange={() => setFormData({ ...formData, type: t })}
                        className="w-3.5 h-3.5 accent-zinc-950" 
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-[#084A86] hover:bg-[#073d6e] text-white font-bold text-xs px-5 shadow-xs"
                >
                  {submitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    isEditing ? 'UPDATE ASSIGNMENT' : 'ASSIGN SUBJECT'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-950">Remove Assignment</h3>
                <p className="text-xs text-zinc-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              Are you sure you want to remove the assignment of <strong className="text-zinc-950">{deleteConfirmItem.subject}</strong> ({deleteConfirmItem.className} - {deleteConfirmItem.section}) taught by <strong className="text-zinc-950">{deleteConfirmItem.teacher}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteConfirmItem(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Delete Assignment
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
