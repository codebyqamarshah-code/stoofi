'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, Plus, Edit, Trash2, X, Save, Upload, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import Link from 'next/link';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import dynamic from 'next/dynamic';

const StudentImportModal = dynamic(() => import('@/components/StudentImportModal'), { ssr: false });

const FALLBACK_CLASSES = [
  { _id: 'c-nursery', name: 'Nursery' },
  { _id: 'c-kg', name: 'KG' },
  { _id: 'c-prep', name: 'Prep' },
  { _id: 'c-1', name: 'Class 1' },
  { _id: 'c-2', name: 'Class 2' },
  { _id: 'c-3', name: 'Class 3' },
  { _id: 'c-4', name: 'Class 4' },
  { _id: 'c-5', name: 'Class 5' },
  { _id: 'c-6', name: 'Class 6' },
  { _id: 'c-7', name: 'Class 7' },
  { _id: 'c-8', name: 'Class 8' },
  { _id: 'c-9', name: 'Class 9' },
  { _id: 'c-10', name: 'Class 10' },
  { _id: 'c-olevel', name: 'O-Levels' },
  { _id: 'c-alevel', name: 'A-Levels' },
];

const FALLBACK_SECTIONS = [
  { _id: 's-a', name: 'Section A' },
  { _id: 's-b', name: 'Section B' },
  { _id: 's-c', name: 'Section C' },
  { _id: 's-d', name: 'Section D' },
];

const ACADEMIC_YEARS = [
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2027', value: '2027' },
];

export default function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState(FALLBACK_CLASSES);
  const [sections, setSections] = useState(FALLBACK_SECTIONS);
  const [loading, setLoading] = useState(true);

  const [quickSearch, setQuickSearch] = useState('');
  
  // Filters
  const [academicYear, setAcademicYear] = useState('2026');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [rollFilter, setRollFilter] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    academicYear: '2026', classFilter: '', sectionFilter: '', nameFilter: '', rollFilter: ''
  });

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchData = async (overrideFilters) => {
    setLoading(true);
    const active = overrideFilters || appliedFilters;
    try {
      const params = { page, limit };
      if (quickSearch && quickSearch.trim()) params.search = quickSearch.trim();
      if (active.classFilter && active.classFilter !== 'All Classes') params.className = active.classFilter;
      if (active.sectionFilter && active.sectionFilter !== 'All Sections') params.section = active.sectionFilter;
      if (active.nameFilter && active.nameFilter.trim()) params.name = active.nameFilter.trim();
      if (active.rollFilter && active.rollFilter.trim()) params.rollNo = active.rollFilter.trim();

      const [stuRes, classRes, secRes] = await Promise.all([
        api.get('/student', { params }).catch(err => {
          console.error('Fetch students error:', err);
          return null;
        }),
        api.get('/class').catch(() => null),
        api.get('/section').catch(() => null)
      ]);
      
      let list = [];
      if (Array.isArray(stuRes?.data)) list = stuRes.data;
      else if (Array.isArray(stuRes?.students)) list = stuRes.students;
      else if (Array.isArray(stuRes)) list = stuRes;

      setStudents(list);
      if (stuRes?.pagination) {
        setTotalPages(stuRes.pagination.totalPages || 1);
        setTotalRecords(stuRes.pagination.total || list.length);
      } else {
        setTotalRecords(list.length);
        setTotalPages(Math.ceil(list.length / limit) || 1);
      }

      if (classRes?.success && Array.isArray(classRes.data) && classRes.data.length > 0) {
        setClasses(classRes.data);
      } else {
        setClasses(FALLBACK_CLASSES);
      }
      if (secRes?.success && Array.isArray(secRes.data) && secRes.data.length > 0) {
        setSections(secRes.data);
      } else {
        setSections(FALLBACK_SECTIONS);
      }
    } catch (error) {
      console.error('Student fetch error:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [page, limit, appliedFilters, quickSearch]);

  const handleSearch = () => {
    setPage(1);
    const newFilters = { academicYear, classFilter, sectionFilter, nameFilter, rollFilter };
    setAppliedFilters(newFilters);
    fetchData(newFilters);
  };

  const handleReset = () => {
    setAcademicYear('2026');
    setClassFilter('');
    setSectionFilter('');
    setNameFilter('');
    setRollFilter('');
    setQuickSearch('');
    setPage(1);
    const emptyFilters = { academicYear: '2026', classFilter: '', sectionFilter: '', nameFilter: '', rollFilter: '' };
    setAppliedFilters(emptyFilters);
    fetchData(emptyFilters);
  };

  const handleDelete = async (id) => {
    if(confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/student/${id}`);
        setStudents(prev => prev.filter(s => s._id !== id));
      } catch (error) {
        console.error('API delete error:', error.message);
        alert('Failed to delete student.');
      }
    }
  };

  const openEdit = (student) => {
    setEditStudent({ ...student });
    setEditModal(true);
  };

  const closeEdit = () => {
    setEditModal(false);
    setEditStudent(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editStudent.firstName) {
      alert('First Name is required');
      return;
    }
    setEditLoading(true);
    
    try {
      await api.put(`/student/${editStudent._id}`, editStudent);
      setStudents(prev => prev.map(s => s._id === editStudent._id ? { ...s, ...editStudent } : s));
      closeEdit();
    } catch (error) {
      console.error('API update error:', error.message);
      alert('Failed to update student.');
    } finally {
      setEditLoading(false);
    }
  };

  const exportData = students.map(s => ({
    'Admission No': s.admissionNo,
    Name: `${s.firstName} ${s.lastName}`,
    'Father Name': s.fatherName,
    'Date of Birth': s.dob,
    'Class(Section)': `${s.className} (${s.section})`,
    Gender: s.gender,
    Phone: s.phone
  }));

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      {editModal && editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-zinc-600" />
                Edit Student
              </h2>
              <button onClick={closeEdit} className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">First Name <span className="text-rose-500">*</span></Label>
                  <Input
                    name="firstName"
                    value={editStudent.firstName || ''}
                    onChange={handleEditChange}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-white"
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Last Name</Label>
                  <Input
                    name="lastName"
                    value={editStudent.lastName || ''}
                    onChange={handleEditChange}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-white"
                    placeholder="Last Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Father Name</Label>
                  <Input
                    name="fatherName"
                    value={editStudent.fatherName || ''}
                    onChange={handleEditChange}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-white"
                    placeholder="Father Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Mother Name</Label>
                  <Input
                    name="motherName"
                    value={editStudent.motherName || ''}
                    onChange={handleEditChange}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-white"
                    placeholder="Mother Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Date of Birth</Label>
                  <Input
                    name="dob"
                    type="date"
                    value={editStudent.dob || ''}
                    onChange={handleEditChange}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Gender</Label>
                  <select
                    name="gender"
                    value={editStudent.gender || ''}
                    onChange={handleEditChange}
                    className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Phone</Label>
                  <Input
                    name="phone"
                    value={editStudent.phone || ''}
                    onChange={handleEditChange}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-white"
                    placeholder="Phone Number"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Email</Label>
                  <Input
                    name="email"
                    type="email"
                    value={editStudent.email || ''}
                    onChange={handleEditChange}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-white"
                    placeholder="Email Address"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Class</Label>
                  <select
                    name="className"
                    value={editStudent.className || ''}
                    onChange={handleEditChange}
                    className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
                  <select
                    name="section"
                    value={editStudent.section || ''}
                    onChange={handleEditChange}
                    className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  >
                    <option value="">Select Section</option>
                    {(classes.find(c => c.name === (formData?.class || formData?.className || (typeof classVal !== 'undefined' ? classVal : '')))?.sections || []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Roll No</Label>
                  <Input
                    name="rollNo"
                    value={editStudent.rollNo || ''}
                    onChange={handleEditChange}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-white"
                    placeholder="Roll Number"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Admission No</Label>
                  <Input
                    name="admissionNo"
                    value={editStudent.admissionNo || ''}
                    onChange={handleEditChange}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-white"
                    placeholder="Admission Number"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">Address</Label>
                  <Input
                    name="address"
                    value={editStudent.address || ''}
                    onChange={handleEditChange}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-white"
                    placeholder="Address"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={closeEdit} className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading} className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Manage Student</h1>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-900 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-semibold text-zinc-900">Student List</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center flex-wrap gap-2 bg-zinc-50/50">
          <h2 className="text-base font-bold text-zinc-900">Select Criteria</h2>
          <div className="flex items-center gap-2">
            <Button 
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 font-bold flex items-center gap-2 cursor-pointer text-xs h-9 px-3.5 shadow-xs"
            >
              <Upload className="h-4 w-4 text-zinc-900" /> IMPORT STUDENTS
            </Button>
            <Link href="/dashboard/students/add">
              <Button 
                type="button"
                className="bg-black hover:bg-zinc-800 text-white font-bold flex items-center gap-2 cursor-pointer text-xs h-9 px-4 shadow-sm"
              >
                <Plus className="h-4 w-4 text-white" /> ADD STUDENT
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Academic Year <span className="text-rose-500">*</span></Label>
            <SearchableSelect 
              name="academicYear" 
              value={academicYear} 
              onChange={(e) => setAcademicYear(e.target.value)} 
              placeholder="Select Year"
              options={ACADEMIC_YEARS} 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Class</Label>
            <SearchableSelect 
              name="classFilter" 
              value={classFilter} 
              onChange={(e) => setClassFilter(e.target.value)} 
              placeholder="Select Class"
              options={[{ label: 'All Classes', value: '' }, ...classes.map(c => ({ label: c.name, value: c.name }))]} 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Section</Label>
            <SearchableSelect 
              name="sectionFilter" 
              value={sectionFilter} 
              onChange={(e) => setSectionFilter(e.target.value)} 
              placeholder="Select Section"
              options={[{ label: 'All Sections', value: '' }, ...sections.map(s => ({ label: s.name, value: s.name }))]} 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Search by Name</Label>
            <Input 
              placeholder="Name" 
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="bg-white border-zinc-200 text-zinc-900 rounded-xl" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Search by Roll/Admission</Label>
            <Input 
              placeholder="Roll or Admission No" 
              value={rollFilter}
              onChange={(e) => setRollFilter(e.target.value)}
              className="bg-white border-zinc-200 text-zinc-900 rounded-xl" 
            />
          </div>
          <div className="flex items-end justify-end gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={handleReset}
              className="border-zinc-200 bg-white text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer text-xs flex items-center gap-1.5 rounded-xl font-bold"
            >
              <RotateCcw className="h-3.5 w-3.5" /> RESET
            </Button>
            <Button onClick={handleSearch} className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold flex items-center gap-2 cursor-pointer text-xs rounded-xl">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs h-full flex flex-col">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          <h2 className="text-base font-bold text-zinc-900">Student List</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="QUICK SEARCH" 
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="pl-9 w-full sm:w-[200px] bg-white border-zinc-200 text-zinc-900 text-xs font-semibold rounded-xl"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={() => exportToCSV(exportData, 'Stoofi_Students')} variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 cursor-pointer rounded-xl" title="Download CSV">
                <Download className="h-4 w-4" />
              </Button>
              <Button onClick={() => exportToExcel(exportData, 'Stoofi_Students', 'Students')} variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 cursor-pointer rounded-xl" title="Export Excel (.xlsx)">
                <FileText className="h-4 w-4" />
              </Button>
              <Button onClick={() => exportToPDF(exportData, 'Stoofi_Students', 'Student Directory Report')} variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 cursor-pointer rounded-xl" title="Export PDF">
                <Download className="h-4 w-4" />
              </Button>
              <Button onClick={() => printData('Student List Report', exportData)} variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 cursor-pointer rounded-xl" title="Print Official Records">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-600 uppercase bg-zinc-100/70 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">Admission No</th>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Father Name</th>
                <th className="px-4 py-3.5">Date Of Birth</th>
                <th className="px-4 py-3.5">Class(Section)</th>
                <th className="px-4 py-3.5">Gender</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-zinc-500">Loading...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-zinc-900">{student.admissionNo || '-'}</td>
                    <td className="px-4 py-3.5">
                      <Link href={`/dashboard/students/${student._id}`} className="flex items-center gap-3 group">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 text-zinc-900 overflow-hidden border border-zinc-200 flex items-center justify-center shrink-0">
                          {student.photo || student.studentPhoto ? (
                            <img 
                              src={(student.photo || student.studentPhoto).startsWith('http') || (student.photo || student.studentPhoto).startsWith('data:') ? (student.photo || student.studentPhoto) : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || ''}/${student.photo || student.studentPhoto}`} 
                              alt={student.firstName} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-bold text-zinc-800 uppercase">{student.firstName?.charAt(0)}</div>
                          )}
                        </div>
                        <span className="font-bold text-zinc-900 group-hover:text-emerald-700 cursor-pointer">{student.firstName} {student.lastName}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700">{student.fatherName || '-'}</td>
                    <td className="px-4 py-3.5 text-zinc-700">{student.dob || '-'}</td>
                    <td className="px-4 py-3.5 text-zinc-800 font-semibold">{student.className}({student.section})</td>
                    <td className="px-4 py-3.5 text-zinc-700">{student.gender || '-'}</td>
                    <td className="px-4 py-3.5 text-zinc-700">Regular</td>
                    <td className="px-4 py-3.5 text-zinc-700">{student.phone || '-'}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/students/${student._id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer rounded-lg" title="View Profile">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => openEdit(student)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-emerald-600 hover:bg-zinc-100 cursor-pointer rounded-lg"
                          title="Edit Student"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(student._id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-rose-600 hover:bg-zinc-100 cursor-pointer rounded-lg"
                          title="Delete Student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            const row = {
                              'Admission No': student.admissionNo || '—',
                              'Full Name': `${student.firstName || ''} ${student.lastName || ''}`.trim(),
                              'Father Name': student.fatherName || '—',
                              'Mother Name': student.motherName || '—',
                              'Date of Birth': student.dob || '—',
                              'Class': student.className || '—',
                              'Section': student.section || '—',
                              'Gender': student.gender || '—',
                              'Type': student.type || 'Regular',
                              'Phone': student.phone || '—',
                              'Email': student.email || '—',
                              'Address': student.address || '—',
                              'Blood Group': student.bloodGroup || '—',
                              'Religion': student.religion || '—',
                              'Roll No': student.rollNo || '—',
                              'Father Phone': student.fatherPhone || '—',
                              'Emergency Contact': student.emergencyContact || '—',
                            };
                            exportToExcel([row], `Student_${student.firstName}_${student.admissionNo || 'export'}`, 'Student Profile');
                          }}
                          variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200 cursor-pointer" title="Export to Excel"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => openEdit(student)} variant="ghost" size="icon" className="h-8 w-8 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 cursor-pointer" title="Edit Student">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDelete(student._id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer" title="Delete Student">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-600 font-medium">
          <div>Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalRecords)} of {totalRecords} entries</div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 w-7 p-0 border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 cursor-pointer" 
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <div className="flex items-center justify-center h-7 px-2 border border-zinc-200 bg-zinc-50 rounded text-zinc-700 font-bold">
              {page} / {totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 w-7 p-0 border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 cursor-pointer" 
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Student Import Modal */}
      <StudentImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={(updatedList) => {
          setStudents(updatedList);
        }}
        availableClasses={classes}
      />
    </div>
  );
}

