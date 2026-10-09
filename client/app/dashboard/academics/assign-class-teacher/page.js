'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search,
  Download,
  Printer,
  FileText,
  Trash2,
  Edit,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Users,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function AssignClassTeacherPage() {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [searchTeacherQuery, setSearchTeacherQuery] = useState('');
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    teacher: '',
    teacherId: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch live teachers from backend (/staff and /teacher)
  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      // First try /staff?role=Teacher, then fallback to /staff or /teacher
      const [staffRes, teacherRes] = await Promise.allSettled([
        api.get('/staff?limit=100'),
        api.get('/teacher?limit=100')
      ]);

      let combinedTeachers = [];
      const seenNames = new Set();

      if (staffRes.status === 'fulfilled' && staffRes.value?.success && Array.isArray(staffRes.value.data)) {
        // Filter teachers or all staff
        const staffData = staffRes.value.data;
        const onlyTeachers = staffData.filter(s => 
          (s.role && s.role.toLowerCase() === 'teacher') ||
          (s.designation && s.designation.toLowerCase().includes('teacher'))
        );
        const listToUse = onlyTeachers.length > 0 ? onlyTeachers : staffData;

        listToUse.forEach(s => {
          const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || s.email;
          if (name && !seenNames.has(name.toLowerCase())) {
            seenNames.add(name.toLowerCase());
            combinedTeachers.push({
              id: s._id,
              name,
              role: s.role || 'Teacher',
              designation: s.designation || 'Teacher',
              department: s.department || ''
            });
          }
        });
      }

      if (teacherRes.status === 'fulfilled' && teacherRes.value?.success && Array.isArray(teacherRes.value.data)) {
        teacherRes.value.data.forEach(t => {
          const name = `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name || t.email;
          if (name && !seenNames.has(name.toLowerCase())) {
            seenNames.add(name.toLowerCase());
            combinedTeachers.push({
              id: t._id,
              name,
              role: 'Teacher',
              designation: t.designation || 'Teacher',
              department: t.department || ''
            });
          }
        });
      }

      setTeachersList(combinedTeachers);
    } catch (err) {
      console.error('Failed to load teachers:', err);
      setTeachersList([]);
    } finally {
      setTeachersLoading(false);
    }
  };

  // 2. Fetch classes & sections
  const fetchClassesAndSections = async () => {
    try {
      const [classRes, secRes] = await Promise.allSettled([
        api.get('/class'),
        api.get('/section')
      ]);

      if (classRes.status === 'fulfilled' && classRes.value?.success && Array.isArray(classRes.value.data)) {
        setClasses(classRes.value.data);
      }
      if (secRes.status === 'fulfilled' && secRes.value?.success && Array.isArray(secRes.value.data)) {
        setSections(secRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load classes/sections:', err);
    }
  };

  // 3. Fetch Class Teacher assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/class-teacher');
      if (res?.success && Array.isArray(res.data)) {
        setAssignments(res.data);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error('Failed to load class teacher assignments:', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchClassesAndSections();
    fetchAssignments();
  }, []);

  // Filter teachers for the left panel radio list
  const filteredTeachers = useMemo(() => {
    const q = searchTeacherQuery.trim().toLowerCase();
    if (!q) return teachersList;
    return teachersList.filter(t => 
      t.name.toLowerCase().includes(q) || 
      (t.designation && t.designation.toLowerCase().includes(q))
    );
  }, [teachersList, searchTeacherQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.className) {
      showToast('Please select a Class.', true);
      return;
    }
    if (!formData.section) {
      showToast('Please select a Section.', true);
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
        teacher: formData.teacher,
        teacherId: formData.teacherId || null
      };

      if (isEditing && editId) {
        const res = await api.put(`/class-teacher/${editId}`, payload);
        if (res?.success) {
          showToast('Class teacher assignment updated successfully!');
          resetForm();
          fetchAssignments();
        } else {
          showToast(res?.message || 'Failed to update assignment.', true);
        }
      } else {
        const res = await api.post('/class-teacher', payload);
        if (res?.success) {
          showToast('Class teacher assigned successfully!');
          resetForm();
          fetchAssignments();
        } else {
          showToast(res?.message || 'Failed to assign class teacher.', true);
        }
      }
    } catch (err) {
      console.error('Error saving assignment:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to assign class teacher.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      className: '',
      section: '',
      teacher: '',
      teacherId: ''
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      className: item.className || '',
      section: item.section || '',
      teacher: item.teacher || '',
      teacherId: item.teacherId || ''
    });
    setIsEditing(true);
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await api.delete(`/class-teacher/${deleteConfirmItem._id}`);
      if (res?.success) {
        showToast('Assignment removed successfully!');
        setDeleteConfirmItem(null);
        fetchAssignments();
      } else {
        showToast(res?.message || 'Failed to remove assignment.', true);
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to remove assignment.', true);
    }
  };

  // Table filtering & pagination
  const filteredAssignments = useMemo(() => {
    const q = searchTableQuery.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter(a => 
      (a.className || '').toLowerCase().includes(q) || 
      (a.section || '').toLowerCase().includes(q) || 
      (a.teacher || '').toLowerCase().includes(q)
    );
  }, [assignments, searchTableQuery]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAssignments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAssignments, currentPage, itemsPerPage]);

  const handleExport = (type) => {
    if (filteredAssignments.length === 0) {
      showToast('No records available to export.', true);
      return;
    }

    const exportData = filteredAssignments.map((a, idx) => ({
      'SL': idx + 1,
      'CLASS': a.className,
      'SECTION': a.section,
      'TEACHER': a.teacher
    }));

    const headers = ['SL', 'CLASS', 'SECTION', 'TEACHER'];
    const filename = `Class_Teachers_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi Class Teacher List');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV exported successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'ClassTeachers');
      showToast('Excel exported successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Stoofi Class Teacher List', filename);
      showToast('PDF exported successfully!');
    }
  };

  const availableClassNames = classes.length > 0 
    ? classes.map(c => c.name) 
    : ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'];

  const availableSectionNames = sections.length > 0 
    ? sections.map(s => s.name) 
    : ['A', 'B', 'C', 'D'];

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

      {/* Page Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Assign Class Teacher</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Assign designated class teachers to specific classes and sections</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-700 transition-colors">Academics</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-semibold">Assign Class Teacher</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Panel: Assign Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950">
                {isEditing ? 'Edit Class Teacher' : 'Assign Class Teacher'}
              </h2>
              {isEditing && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                  Editing
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Class Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  CLASS <span className="text-rose-500">*</span>
                </Label>
                <select 
                  value={formData.className}
                  onChange={e => setFormData({ ...formData, className: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  required
                >
                  <option value="">Select Class *</option>
                  {availableClassNames.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Section Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  SECTION <span className="text-rose-500">*</span>
                </Label>
                <select 
                  value={formData.section}
                  onChange={e => setFormData({ ...formData, section: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  required
                >
                  <option value="">Select Section *</option>
                  {availableSectionNames.map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Real Teachers List */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                    TEACHER <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-[10px] text-zinc-400">
                    {teachersList.length} registered {teachersList.length === 1 ? 'teacher' : 'teachers'}
                  </span>
                </div>

                {/* Filter search if more than 5 teachers */}
                {teachersList.length > 5 && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400" />
                    <Input 
                      value={searchTeacherQuery}
                      onChange={e => setSearchTeacherQuery(e.target.value)}
                      placeholder="Filter teachers..."
                      className="pl-7 h-7 text-xs bg-zinc-50 border-zinc-200"
                    />
                  </div>
                )}

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 border border-zinc-200 rounded-lg p-2 bg-zinc-50/40">
                  {teachersLoading ? (
                    <div className="py-6 text-center text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
                      <span>Loading active teachers...</span>
                    </div>
                  ) : filteredTeachers.length === 0 ? (
                    <div className="py-6 px-3 text-center">
                      <Users className="w-6 h-6 text-zinc-300 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-zinc-600">No teachers found</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Please add staff/teachers under <Link href="/dashboard/hr/staff-directory" className="text-emerald-600 font-semibold underline">Staff Directory</Link>
                      </p>
                    </div>
                  ) : (
                    filteredTeachers.map(t => (
                      <label 
                        key={t.id || t.name} 
                        className={`flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg border transition-all ${
                          formData.teacher === t.name 
                            ? 'border-zinc-950 bg-zinc-100/90 shadow-2xs font-bold text-zinc-950' 
                            : 'border-transparent hover:border-zinc-200 hover:bg-white text-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="assignedTeacher" 
                            value={t.name}
                            checked={formData.teacher === t.name}
                            onChange={() => setFormData({ ...formData, teacher: t.name, teacherId: t.id })}
                            className="w-3.5 h-3.5 accent-zinc-950" 
                          />
                          <div>
                            <span className="text-xs font-semibold block leading-tight">{t.name}</span>
                            {t.designation && (
                              <span className="text-[10px] text-zinc-400 block font-normal">{t.designation}</span>
                            )}
                          </div>
                        </div>
                        {formData.teacher === t.name && (
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-[#084A86] hover:bg-[#073d6e] text-white font-bold text-xs uppercase tracking-wider h-10 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  {submitting ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    isEditing ? 'UPDATE CLASS TEACHER' : 'SAVE CLASS TEACHER'
                  )}
                </Button>

                {isEditing && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={resetForm}
                    className="w-full sm:w-auto border-zinc-300 text-zinc-700 font-semibold text-xs h-10 rounded-lg"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel: Class Teacher List Table */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
            
            {/* List Header & Search/Export Toolbar */}
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">Class Teacher List</h2>
                <p className="text-[11px] text-zinc-500">Overview of assigned class educators</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    value={searchTableQuery}
                    onChange={e => {
                      setSearchTableQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="SEARCH"
                    className="pl-8 pr-7 h-8 text-xs font-semibold uppercase bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 rounded-lg"
                  />
                  {searchTableQuery && (
                    <button 
                      onClick={() => setSearchTableQuery('')} 
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">CLASS</th>
                    <th className="px-4 py-3">SECTION</th>
                    <th className="px-4 py-3">TEACHER</th>
                    <th className="px-4 py-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-zinc-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                          <span>Loading assignments...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-14 text-center text-zinc-500">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="w-7 h-7 text-zinc-300 mb-1.5" />
                          <span className="font-semibold text-zinc-600">No Data Available In Table</span>
                          {searchTableQuery && (
                            <span className="text-[11px] text-zinc-400 mt-0.5">
                              No results found for &quot;{searchTableQuery}&quot;
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => (
                      <tr 
                        key={item._id} 
                        className="hover:bg-zinc-50/80 transition-colors text-zinc-950"
                      >
                        <td className="px-4 py-3 font-semibold text-zinc-950">
                          {item.className}
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          Section {item.section}
                        </td>
                        <td className="px-4 py-3 font-bold text-zinc-950 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center justify-center">
                            {item.teacher.charAt(0)}
                          </div>
                          <span>{item.teacher}</span>
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
                              title="Remove Assignment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-zinc-100 bg-zinc-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500 font-medium">
              <div>
                Showing {filteredAssignments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAssignments.length)} of {filteredAssignments.length} entries
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
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-950">Remove Class Teacher</h3>
                <p className="text-xs text-zinc-500">This action will unassign the teacher.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              Are you sure you want to remove <strong className="text-zinc-950">{deleteConfirmItem.teacher}</strong> as class teacher for <strong className="text-zinc-950">{deleteConfirmItem.className} (Section {deleteConfirmItem.section})</strong>?
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
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}