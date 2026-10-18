'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
﻿import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, Plus, Edit, Trash2, X, Save, Upload, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import Link from 'next/link';
import { sortClassesAcademic } from '@/lib/academicUtils';
import { formatDateDMY, getPhotoUrl } from '@/lib/utils';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import StudentAvatar from '@/components/student/StudentAvatar';
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
  const [classes, setClasses] = useState([]);
  useEffect(() => {
    const fetchDynamicClasses = async () => {
      try {
        const res = await api.get('/class');
        if (res && res.success) {
          setClasses(res.data);
        }
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    };
    fetchDynamicClasses();
  }, []);

  const [sections, setSections] = useState([]);
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
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Selection & Bulk Action state
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const isAllSelected = students.length > 0 && students.every(s => selectedStudentIds.includes(s._id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s._id));
    }
  };

  const toggleSelectStudent = (id) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedStudentIds.length) return;
    const count = selectedStudentIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} selected student${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }
    setBulkDeleting(true);
    try {
      await api.post('/student/bulk-delete', { ids: selectedStudentIds });
      setStudents(prev => prev.filter(s => !selectedStudentIds.includes(s._id)));
      setSelectedStudentIds([]);
      await fetchData();
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Failed to delete selected students: ' + (err.response?.data?.message || err.message));
    } finally {
      setBulkDeleting(false);
    }
  };

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

      // Natural sequential sort by admissionNo (ADM260001, ADM260002, ADM260003...)
      list.sort((a, b) => {
        const admA = String(a.admissionNo || '').trim();
        const admB = String(b.admissionNo || '').trim();
        if (admA && admB) {
          return admA.localeCompare(admB, undefined, { numeric: true, sensitivity: 'base' });
        }
        if (admA) return -1;
        if (admB) return 1;
        return 0;
      });

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
        setSelectedStudentIds(prev => prev.filter(item => item !== id));
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
                <Plus className="h-4 w-4 text-zinc-950" /> ADD STUDENT
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
            
            <TableExportToolbar data={exportData} filename="Stoofi_Students" title="Student Directory Report" />
          </div>
        </div>
        
        {/* Bulk Action Bar */}
        {selectedStudentIds.length > 0 && (
          <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center justify-between gap-4 flex-wrap">
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-black">{selectedStudentIds.length}</span>
              {selectedStudentIds.length === 1 ? 'Student Selected' : 'Students Selected'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedStudentIds([])}
                className="text-xs text-zinc-500 hover:text-zinc-900 h-8 px-3 cursor-pointer"
              >
                Clear Selection
              </Button>
              <Button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 px-4 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedStudentIds.length})`}
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-600 uppercase bg-zinc-100/70 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-3 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer"
                    title={isAllSelected ? 'Deselect All' : 'Select All'}
                  />
                </th>
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
                  <td colSpan="10" className="px-4 py-8 text-center text-zinc-500">Loading...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td>
                </tr>
              ) : (
                students.map((student) => {
                  const isSelected = selectedStudentIds.includes(student._id);
                  return (
                    <tr key={student._id} className={`hover:bg-zinc-50/80 transition-colors ${isSelected ? 'bg-zinc-100/80 border-l-2 border-l-zinc-900' : ''}`}>
                      <td className="px-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStudent(student._id)}
                          className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-bold text-zinc-900">{student.admissionNo || '-'}</td>
                      <td className="px-4 py-3.5">
                        <Link href={`/dashboard/students/${student._id}`} className="flex items-center gap-3 group">
                          <StudentAvatar
                            photo={getPhotoUrl(student)}
                            firstName={student.firstName}
                            lastName={student.lastName}
                            size="md"
                          />
                          <span className="font-bold text-zinc-900 group-hover:text-emerald-700 cursor-pointer">{student.firstName} {student.lastName}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-700">{student.fatherName || '-'}</td>
                      <td className="px-4 py-3.5 text-zinc-700">{formatDateDMY(student.dob)}</td>
                      <td className="px-4 py-3.5 text-zinc-800 font-semibold">{student.className}({student.section})</td>
                      <td className="px-4 py-3.5 text-zinc-700">{student.gender || '-'}</td>
                      <td className="px-4 py-3.5 text-zinc-700">{student.type || 'Regular'}</td>
                      <td className="px-4 py-3.5 text-zinc-700">{student.phone || '-'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/students/${student._id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer rounded-lg" title="View Profile">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/students/${student._id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-500 hover:text-emerald-600 hover:bg-zinc-100 cursor-pointer rounded-lg"
                              title="Edit Full Profile"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
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
                                'Date of Birth': formatDateDMY(student.dob),
                                'Class': student.className || '—',
                                'Section': student.section || '—',
                                'Gender': student.gender || '—',
                                'Type': student.type || 'Regular',
                                'Phone': student.phone || '—',
                                'Email': student.email || '—',
                                'Address': student.currentAddress || student.address || '—',
                                'Blood Group': student.bloodGroup || '—',
                                'Religion': student.religion || '—',
                                'Roll No': student.rollNo || '—',
                                'Father Phone': student.fatherPhone || '—',
                                'Emergency Contact': student.emergencyContact || '—',
                                'Joining Date': formatDateDMY(student.joiningDate || student.admissionDate),
                                'CNIC / B-Form': student.cnic || student.bForm || '—',
                              };
                              exportToExcel([row], `Student_${student.firstName}_${student.admissionNo || 'export'}`, 'Student Profile');
                            }}
                            variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200 cursor-pointer" title="Export to Excel"
                          >
                            <Download className="h-4 w-4" />
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
        onSuccess={async () => {
          setPage(1);
          await fetchData();
        }}
        availableClasses={classes}
      />
    </div>
  );
}