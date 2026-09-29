'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, FileSpreadsheet, FileText, Download, Printer, Upload, CheckCircle, Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import StudentImportModal from '@/components/StudentImportModal';

const ACADEMIC_YEARS = [
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
];

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
  { _id: 's-a', name: 'A' },
  { _id: 's-b', name: 'B' },
  { _id: 's-c', name: 'C' },
  { _id: 's-d', name: 'D' },
];

export default function StudentExportPage() {
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

  // Filters
  const [academicYear, setAcademicYear] = useState('2026');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Column export options
  const [includeParents, setIncludeParents] = useState(true);
  const [includeContact, setIncludeContact] = useState(true);
  const [includeAddress, setIncludeAddress] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const [stuRes, classRes, secRes] = await Promise.all([
        api.get('/student').catch(() => null),
        api.get('/class').catch(() => null),
        api.get('/section').catch(() => null),
      ]);

      let list = [];
      if (Array.isArray(stuRes?.data)) list = stuRes.data;
      else if (Array.isArray(stuRes?.students)) list = stuRes.students;
      else if (Array.isArray(stuRes)) list = stuRes;

      setStudents(list);

      if (classRes?.success && Array.isArray(classRes.data) && classRes.data.length > 0) {
        setClasses(classRes.data);
      }
      if (secRes?.success && Array.isArray(secRes.data) && secRes.data.length > 0) {
        setSections(secRes.data);
      }
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filtered dataset
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (classFilter && s.className !== classFilter) return false;
      if (sectionFilter && s.section !== sectionFilter) return false;
      if (genderFilter && s.gender !== genderFilter) return false;
      if (academicYear && s.academicYear && s.academicYear !== academicYear) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
        const matchAdm = s.admissionNo?.toLowerCase().includes(q);
        const matchRoll = s.rollNo?.toLowerCase().includes(q);
        const matchFather = s.fatherName?.toLowerCase().includes(q);
        if (!fullName.includes(q) && !matchAdm && !matchRoll && !matchFather) return false;
      }
      return true;
    });
  }, [students, classFilter, sectionFilter, genderFilter, academicYear, searchQuery]);

  // Prepared data for exports
  const formattedExportData = useMemo(() => {
    return filteredStudents.map((s, idx) => {
      const row = {
        '#': idx + 1,
        'Admission No': s.admissionNo || '-',
        'Roll No': s.rollNo || '-',
        'Student Name': `${s.firstName || ''} ${s.lastName || ''}`.trim(),
        'Class': s.className || '-',
        'Section': s.section || '-',
        'Gender': s.gender || '-',
        'Date of Birth': s.dob || '-',
      };

      if (includeParents) {
        row['Father Name'] = s.fatherName || '-';
        row['Guardian Name'] = s.guardianName || s.fatherName || '-';
      }

      if (includeContact) {
        row['Phone / Mobile'] = s.phone || s.fatherPhone || '-';
      }

      if (includeAddress) {
        row['Current Address'] = s.currentAddress || s.address || '-';
      }

      row['Academic Session'] = s.academicYear || '2026';
      return row;
    });
  }, [filteredStudents, includeParents, includeContact, includeAddress]);

  const handleExportExcel = () => {
    exportToExcel(formattedExportData, 'Stoofi_Students_Official_Export', 'Students');
  };

  const handleExportCSV = () => {
    exportToCSV(formattedExportData, 'Stoofi_Students_Official_Export');
  };

  const handleExportPDF = () => {
    exportToPDF(formattedExportData, 'Stoofi_Students_Report', 'OFFICIAL STUDENT DIRECTORY REPORT');
  };

  const handlePrint = () => {
    printData('OFFICIAL STUDENT DIRECTORY REPORT', formattedExportData);
  };

  const handleResetFilters = () => {
    setClassFilter('');
    setSectionFilter('');
    setGenderFilter('');
    setSearchQuery('');
    setAcademicYear('2026');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Export & Import Center</h1>
          <p className="text-xs text-zinc-400 mt-1">Export filtered student directories or bulk import new students via Excel & CSV</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
          <Link href="/dashboard/students" className="hover:text-zinc-300 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-600" />
          <span className="text-white font-medium">Export & Import</span>
        </div>
      </div>

      {/* Top Action Bar: Quick Import & Template */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Import Banner */}
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shrink-0">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Import Students from Excel</h3>
              <p className="text-xs text-zinc-400">Bulk upload student records with auto column matching</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" /> IMPORT NOW
          </Button>
        </div>

        {/* Total Summary */}
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Matching Students</h3>
              <p className="text-xs text-zinc-400">
                {loading ? 'Counting...' : `Ready to export ${filteredStudents.length} of ${students.length} total students`}
              </p>
            </div>
          </div>
          <div className="text-xl font-extrabold text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
            {filteredStudents.length}
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" /> Filter Criteria
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs text-zinc-400 hover:text-white cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
          </Button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Academic Year</Label>
            <SearchableSelect
              name="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              options={ACADEMIC_YEARS}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class</Label>
            <SearchableSelect
              name="classFilter"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              placeholder="All Classes"
              options={[{ label: 'All Classes', value: '' }, ...classes.map(c => ({ label: c.name, value: c.name }))]}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
            <SearchableSelect
              name="sectionFilter"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              placeholder="All Sections"
              options={[{ label: 'All Sections', value: '' }, ...sections.map(s => ({ label: s.name, value: s.name }))]}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Gender</Label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Search by Keyword</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <Input
                placeholder="Name / Roll / Adm No"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-zinc-900 border-zinc-800 text-xs font-medium text-white"
              />
            </div>
          </div>
        </div>

        {/* Column Inclusion Checkboxes */}
        <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/40 flex flex-wrap items-center gap-6 text-xs text-zinc-300">
          <span className="font-semibold text-zinc-400 uppercase">Include in Export:</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeParents}
              onChange={(e) => setIncludeParents(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-white cursor-pointer"
            />
            <span>Parent / Guardian Name</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeContact}
              onChange={(e) => setIncludeContact(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-white cursor-pointer"
            />
            <span>Phone Numbers</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAddress}
              onChange={(e) => setIncludeAddress(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-white cursor-pointer"
            />
            <span>Residential Address</span>
          </label>
        </div>
      </div>

      {/* Export Actions Panel */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Export Selected Student Records</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Export {filteredStudents.length} student records in professional industry-standard formats.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleExportExcel}
              className="bg-black hover:bg-zinc-800 text-white font-bold text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-white" />
              EXPORT TO EXCEL (.XLSX)
            </Button>

            <Button
              type="button"
              onClick={handleExportCSV}
              className="bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 font-bold text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <Download className="h-4 w-4 text-zinc-900" />
              EXPORT TO CSV (.CSV)
            </Button>

            <Button
              type="button"
              onClick={handleExportPDF}
              className="bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 font-bold text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <FileText className="h-4 w-4 text-zinc-900" />
              EXPORT TO PDF (.PDF)
            </Button>

            <Button
              type="button"
              onClick={handlePrint}
              className="bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 font-bold text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <Printer className="h-4 w-4 text-zinc-900" />
              PRINT OFFICIAL RECORDS
            </Button>
          </div>
        </div>
      </div>

      {/* Live Preview Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Export Preview ({filteredStudents.length} Students)
          </h3>
          <span className="text-xs text-zinc-500">
            Showing first {Math.min(10, filteredStudents.length)} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-100/80 text-zinc-700 uppercase font-bold border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Admission No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Class (Sec)</th>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Father Name</th>
                <th className="px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-zinc-500">Loading student directory...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-zinc-500">No students match the current filter criteria.</td>
                </tr>
              ) : (
                filteredStudents.slice(0, 10).map((stu, idx) => (
                  <tr key={stu._id || idx} className="hover:bg-zinc-100/70 transition-colors border-b border-zinc-100">
                    <td className="px-4 py-2.5 font-bold text-zinc-500">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-semibold text-zinc-900">{stu.admissionNo || '-'}</td>
                    <td className="px-4 py-2.5 font-semibold text-zinc-900">{stu.firstName} {stu.lastName}</td>
                    <td className="px-4 py-2.5 text-zinc-800">{stu.className || '-'} ({stu.section || '-'})</td>
                    <td className="px-4 py-2.5 text-zinc-800">{stu.rollNo || '-'}</td>
                    <td className="px-4 py-2.5 text-zinc-800">{stu.gender || '-'}</td>
                    <td className="px-4 py-2.5 text-zinc-800">{stu.fatherName || '-'}</td>
                    <td className="px-4 py-2.5 text-zinc-800">{stu.phone || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Import Modal Component */}
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
