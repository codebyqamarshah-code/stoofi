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
  Edit2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Users,
  X,
  RefreshCw,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';
import { sortClassesAcademic } from '@/lib/academicUtils';

export default function AssignClassTeacherPage() {
  const { user } = useAuth();
  const canManage = !user?.role || ['Super Admin', 'Admin'].includes(user.role);

  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [teachersList, setTeachersList] = useState([]);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search & filter
  const [searchTeacherQuery, setSearchTeacherQuery] = useState('');
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    teacher: '',
    teacherId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Delete modal state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch live teachers from backend (/staff and /teacher)
  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      const [staffRes, teacherRes] = await Promise.allSettled([
        api.get('/staff?limit=200'),
        api.get('/teacher?limit=200')
      ]);

      const combinedTeachers = [];
      const seenKeys = new Set();

      if (staffRes.status === 'fulfilled' && staffRes.value?.success && Array.isArray(staffRes.value.data)) {
        const staffData = staffRes.value.data;
        const onlyTeachers = staffData.filter(s => 
          (s.role && s.role.toLowerCase() === 'teacher') ||
          (s.designation && s.designation.toLowerCase().includes('teacher'))
        );
        const listToUse = onlyTeachers.length > 0 ? onlyTeachers : staffData;

        listToUse.forEach(s => {
          const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || s.email;
          const key = name.toLowerCase();
          if (name && !seenKeys.has(key)) {
            seenKeys.add(key);
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
          const key = name.toLowerCase();
          if (name && !seenKeys.has(key)) {
            seenKeys.add(key);
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
        setClasses(sortClassesAcademic(classRes.value.data));
      }
      if (secRes.status === 'fulfilled' && secRes.value?.success && Array.isArray(secRes.value.data)) {
        setAllSections(secRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load classes/sections:', err);
    }
  };

  // 3. Fetch Class Teacher assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setDataError(null);
      const res = await api.get('/class-teacher');
      if (res && res.success && Array.isArray(res.data)) {
        setAssignments(res.data);
      } else if (Array.isArray(res)) {
        setAssignments(res);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error('Failed to load class teacher assignments:', err);
      setDataError(err?.response?.data?.message || err?.message || 'Failed to load class teacher assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchClassesAndSections();
    fetchAssignments();
  }, []);

  // Compute available sections dependent on selected class
  const selectedClassObj = useMemo(() => {
    if (!formData.className) return null;
    return classes.find(c => c.name === formData.className);
  }, [classes, formData.className]);

  const availableSectionsForClass = useMemo(() => {
    if (!formData.className) return [];

    // If the class has explicit sections defined
    if (selectedClassObj && Array.isArray(selectedClassObj.sections) && selectedClassObj.sections.length > 0) {
      return selectedClassObj.sections.map(s => typeof s === 'string' ? s : s.name);
    }

    // Fallback to general sections registered in system
    if (allSections.length > 0) {
      return allSections.map(s => s.name);
    }

    return ['A', 'B', 'C', 'D'];
  }, [formData.className, selectedClassObj, allSections]);

  // Check if an assignment already exists for the currently selected Class + Section
  const existingAssignmentForSelected = useMemo(() => {
    if (!formData.className || !formData.section) return null;
    return assignments.find(a => 
      a.className?.trim().toLowerCase() === formData.className.trim().toLowerCase() &&
      a.section?.trim().toLowerCase() === formData.section.trim().toLowerCase()
    );
  }, [assignments, formData.className, formData.section]);

  // Handle Class dropdown change: reset invalid section selection
  const handleClassChange = (newClassName) => {
    setFormData(prev => ({
      ...prev,
      className: newClassName,
      section: '' // reset section when class changes
    }));
    if (formErrors.className) setFormErrors(prev => ({ ...prev, className: null }));
    if (formErrors.section) setFormErrors(prev => ({ ...prev, section: null }));
  };

  // Handle Section dropdown change
  const handleSectionChange = (newSection) => {
    setFormData(prev => ({
      ...prev,
      section: newSection
    }));
    if (formErrors.section) setFormErrors(prev => ({ ...prev, section: null }));
  };

  // Filter teachers for list
  const filteredTeachers = useMemo(() => {
    const q = searchTeacherQuery.trim().toLowerCase();
    if (!q) return teachersList;
    return teachersList.filter(t => 
      t.name.toLowerCase().includes(q) || 
      (t.designation && t.designation.toLowerCase().includes(q))
    );
  }, [teachersList, searchTeacherQuery]);

  const validate = () => {
    const errs = {};
    if (!formData.className) errs.className = 'Please select a Class.';
    if (!formData.section) errs.section = 'Please select a Section.';
    if (!formData.teacher) errs.teacher = 'Please select a Teacher.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setFormData({
      className: '',
      section: '',
      teacher: '',
      teacherId: ''
    });
    setFormErrors({});
    setIsEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setFormErrors({});

      const payload = {
        className: formData.className.trim(),
        section: formData.section.trim(),
        teacher: formData.teacher.trim(),
        teacherId: formData.teacherId || null
      };

      if (isEditing && editId) {
        const res = await api.put(`/class-teacher/${editId}`, payload);
        if (res && res.success) {
          showToast(res.message || 'Class teacher assignment updated successfully!');
          resetForm();
          fetchAssignments();
        } else {
          showToast(res?.message || 'Assignment updated.');
          resetForm();
          fetchAssignments();
        }
      } else {
        const res = await api.post('/class-teacher', payload);
        if (res && res.success) {
          showToast(res.message || 'Class teacher assigned successfully!');
          resetForm();
          fetchAssignments();
        } else {
          showToast(res?.message || 'Assignment saved.');
          resetForm();
          fetchAssignments();
        }
      }
    } catch (err) {
      console.error('Error saving assignment:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to save class teacher assignment.';
      setFormErrors({ general: msg });
      showToast(msg, true);
    } finally {
      setSubmitting(false);
    }
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
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/class-teacher/${deleteConfirmItem._id}`);
      if (res && res.success) {
        showToast('Class teacher assignment removed successfully.');
        setAssignments(prev => prev.filter(a => a._id !== deleteConfirmItem._id));
      } else {
        showToast(res?.message || 'Assignment removed.');
        fetchAssignments();
      }
      setDeleteConfirmItem(null);
    } catch (err) {
      console.error('Delete assignment error:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to remove assignment.', true);
    } finally {
      setDeleting(false);
    }
  };

  // Table filtering & pagination
  const filteredAssignments = useMemo(() => {
    let list = assignments;

    if (classFilter !== 'All') {
      list = list.filter(a => a.className === classFilter);
    }

    const q = searchTableQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(a => 
        (a.className || '').toLowerCase().includes(q) || 
        (a.section || '').toLowerCase().includes(q) || 
        (a.teacher || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [assignments, searchTableQuery, classFilter]);

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
      '#': idx + 1,
      'Class': a.className,
      'Section': a.section,
      'Teacher': a.teacher
    }));

    const title = 'Class Teacher Assignments';

    if (type === 'Print') {
      printData(title, exportData);
    } else if (type === 'CSV') {
      exportToCSV(exportData, 'Class_Teacher_Assignments');
    } else if (type === 'Excel') {
      exportToExcel(exportData, 'Class_Teacher_Assignments');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.isError 
              ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
          }`}
        >
          {toast.isError ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-zinc-400 hover:text-zinc-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Assign Class Teacher</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Assign designated faculty educators to respective academic classes and sections</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg shadow-2xs">
          <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 text-zinc-400" />
          <Link href="/dashboard/academics/class" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Academics</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1 text-zinc-400" />
          <span className="text-zinc-950 dark:text-zinc-100 font-semibold">Assign Class Teacher</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Panel: Assignment Form (Restricted to Authorized Roles) */}
        {canManage && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#009966]"></div>
                  <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                    {isEditing ? 'Edit Class Teacher' : 'Assign Class Teacher'}
                  </h2>
                </div>
                {isEditing && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md">
                    Editing
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {formErrors.general && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formErrors.general}</span>
                  </div>
                )}

                {/* Class Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    Select Class <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    value={formData.className}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className={`flex h-10 w-full rounded-lg border bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-950 dark:text-zinc-50 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 ${
                      formErrors.className ? 'border-rose-400' : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                    disabled={submitting}
                  >
                    <option value="">-- Choose Class --</option>
                    {classes.map(c => (
                      <option key={c._id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {formErrors.className && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formErrors.className}</span>
                    </p>
                  )}
                </div>

                {/* Section Dropdown (Dependent on Class!) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Select Section <span className="text-rose-500">*</span>
                    </Label>
                    {!formData.className && (
                      <span className="text-[10px] text-zinc-400 italic">Select class first</span>
                    )}
                  </div>
                  <select 
                    value={formData.section}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    disabled={!formData.className || submitting}
                    className={`flex h-10 w-full rounded-lg border bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-950 dark:text-zinc-50 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 ${
                      !formData.className 
                        ? 'opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' 
                        : formErrors.section 
                        ? 'border-rose-400' 
                        : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    <option value="">
                      {!formData.className ? '-- Select Class First --' : '-- Choose Section --'}
                    </option>
                    {availableSectionsForClass.map(s => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                  {formErrors.section && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formErrors.section}</span>
                    </p>
                  )}
                </div>

                {/* Detected Existing Assignment Alert */}
                {existingAssignmentForSelected && !isEditing && (
                  <div className="p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Currently Assigned: {existingAssignmentForSelected.teacher}</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      Selecting another teacher will reassign this class & section without creating a duplicate record.
                    </p>
                  </div>
                )}

                {/* Dynamic Eligible Teachers Selection */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Select Teacher <span className="text-rose-500">*</span>
                    </Label>
                    <span className="text-[10px] text-zinc-400">
                      {teachersList.length} registered
                    </span>
                  </div>

                  {/* Filter search if more than 4 teachers */}
                  {teachersList.length > 4 && (
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400" />
                      <Input 
                        value={searchTeacherQuery}
                        onChange={(e) => setSearchTeacherQuery(e.target.value)}
                        placeholder="Filter teachers..."
                        className="pl-7 h-7 text-xs bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                        disabled={submitting}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-zinc-50/40 dark:bg-zinc-950/40">
                    {teachersLoading ? (
                      <div className="py-6 text-center text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
                        <span>Loading active teachers...</span>
                      </div>
                    ) : filteredTeachers.length === 0 ? (
                      <div className="py-6 px-3 text-center">
                        <Users className="w-6 h-6 text-zinc-300 dark:text-zinc-600 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">No teachers found</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Register faculty under <Link href="/dashboard/hr/staff-directory" className="text-emerald-600 font-semibold underline">Staff Directory</Link>
                        </p>
                      </div>
                    ) : (
                      filteredTeachers.map(t => {
                        const isSelected = formData.teacher === t.name;
                        return (
                          <label 
                            key={t.id || t.name} 
                            className={`flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg border transition-all ${
                              isSelected 
                                ? 'border-[#009966] bg-emerald-50/40 dark:bg-emerald-950/30 text-zinc-950 dark:text-zinc-50 font-bold' 
                                : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name="assignedTeacher" 
                                value={t.name}
                                checked={isSelected}
                                onChange={() => {
                                  setFormData({ ...formData, teacher: t.name, teacherId: t.id });
                                  if (formErrors.teacher) setFormErrors(prev => ({ ...prev, teacher: null }));
                                }}
                                className="w-3.5 h-3.5 accent-[#009966]" 
                                disabled={submitting}
                              />
                              <div>
                                <span className="text-xs font-semibold block leading-tight">{t.name}</span>
                                {t.designation && (
                                  <span className="text-[10px] text-zinc-400 block font-normal">{t.designation}</span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                  {formErrors.teacher && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formErrors.teacher}</span>
                    </p>
                  )}
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-[#009966] dark:hover:bg-[#008055] text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </span>
                    ) : isEditing ? (
                      'UPDATE CLASS TEACHER'
                    ) : existingAssignmentForSelected ? (
                      'REASSIGN CLASS TEACHER'
                    ) : (
                      'ASSIGN CLASS TEACHER'
                    )}
                  </Button>

                  {isEditing && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={resetForm}
                      disabled={submitting}
                      className="border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs py-2.5 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Right Panel: Class Teacher List Table */}
        <div className={canManage ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden flex flex-col">
            
            {/* List Header & Search/Export Toolbar */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-100">Class Teacher List</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Assignments: {assignments.length}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Class Filter */}
                {classes.length > 0 && (
                  <select
                    value={classFilter}
                    onChange={(e) => {
                      setClassFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="All">All Classes</option>
                    {classes.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}

                {/* Search Bar */}
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    value={searchTableQuery}
                    onChange={e => {
                      setSearchTableQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    className="pl-8 pr-7 h-9 text-xs font-medium bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50 focus-visible:ring-emerald-600 rounded-lg"
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
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                  <Button 
                    onClick={() => handleExport('CSV')} 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer" 
                    title="Export CSV"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    onClick={() => handleExport('Excel')} 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer" 
                    title="Export Excel"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    onClick={() => handleExport('Print')} 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer" 
                    title="Print"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {dataError && (
              <div className="m-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{dataError}</span>
                </div>
                <Button 
                  onClick={fetchAssignments} 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2.5 text-xs border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Try Again
                </Button>
              </div>
            )}

            {/* Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-zinc-700 dark:text-zinc-300 uppercase bg-zinc-50/80 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Class</th>
                    <th className="px-5 py-3">Section</th>
                    <th className="px-5 py-3">Teacher</th>
                    {canManage && <th className="px-5 py-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                  {/* Loading State */}
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-4">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-36"></div>
                        </td>
                        {canManage && (
                          <td className="px-5 py-4 text-right">
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16 ml-auto"></div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : paginatedData.length === 0 ? (
                    /* Empty State */
                    <tr>
                      <td colSpan={canManage ? 4 : 3} className="px-5 py-14 text-center">
                        <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2 text-zinc-400">
                            <Users className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                            {searchTableQuery || classFilter !== 'All' 
                              ? 'No matching assignments found' 
                              : 'No class teachers assigned yet.'}
                          </span>
                          <span className="text-zinc-400 text-xs mt-1">
                            {searchTableQuery || classFilter !== 'All'
                              ? 'Try adjusting your search criteria or class filter.'
                              : canManage ? 'Select a class, section, and faculty member on the left to create an assignment.' : 'Assignments will appear here once configured.'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    /* Table Rows */
                    paginatedData.map((item) => (
                      <tr 
                        key={item._id} 
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-bold text-zinc-950 dark:text-zinc-100">
                          {item.className}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                            Section {item.section}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-zinc-950 dark:text-zinc-100 font-semibold">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                              {item.teacher ? item.teacher.charAt(0).toUpperCase() : 'T'}
                            </div>
                            <span>{item.teacher}</span>
                          </div>
                        </td>
                        {canManage && (
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                onClick={() => handleEdit(item)} 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer"
                                title="Edit / Reassign"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                onClick={() => setDeleteConfirmItem(item)} 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md cursor-pointer"
                                title="Remove Assignment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500 font-medium">
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
                    className="h-7 px-2 text-xs border-zinc-200 dark:border-zinc-800"
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-zinc-700 dark:text-zinc-300 font-semibold text-xs">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-7 px-2 text-xs border-zinc-200 dark:border-zinc-800"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">Remove Class Teacher</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">This will unassign the class educator.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Are you sure you want to remove <strong className="text-zinc-950 dark:text-zinc-100">{deleteConfirmItem.teacher}</strong> as class teacher for <strong className="text-zinc-950 dark:text-zinc-100">{deleteConfirmItem.className} (Section {deleteConfirmItem.section})</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={deleting}
                onClick={() => setDeleteConfirmItem(null)}
                className="text-xs border-zinc-300 dark:border-zinc-700"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                disabled={deleting}
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {deleting ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Removing...
                  </span>
                ) : (
                  'Remove'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}