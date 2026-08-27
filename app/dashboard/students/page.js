'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import Link from 'next/link';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quickSearch, setQuickSearch] = useState('');
  
  // Filters
  const [academicYear, setAcademicYear] = useState('2026[Jan-Dec]');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [rollFilter, setRollFilter] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    academicYear: '2026[Jan-Dec]', classFilter: '', sectionFilter: '', nameFilter: '', rollFilter: ''
  });

  const fetchData = async () => {
    try {
      const [stuRes, classRes, secRes] = await Promise.all([
        api.get('/student'),
        api.get('/class'),
        api.get('/section')
      ]);
      
      if (stuRes.success) setStudents(stuRes.data);
      if (classRes.success) setClasses(classRes.data);
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

  const handleSearch = () => {
    setAppliedFilters({ academicYear, classFilter, sectionFilter, nameFilter, rollFilter });
  };

  const handleDelete = async (id) => {
    if(confirm('Are you sure you want to delete this student?')) {
      try {
        const res = await api.delete(`/student/${id}`);
        if(res.success) {
          setStudents(students.filter(s => s._id !== id));
        }
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Apply Quick Search
      if (quickSearch && 
          !(s.firstName + ' ' + s.lastName).toLowerCase().includes(quickSearch.toLowerCase()) && 
          !s.admissionNo?.includes(quickSearch)) {
        return false;
      }
      // Apply Advanced Filters
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
      if (appliedFilters.nameFilter && !fullName.includes(appliedFilters.nameFilter.toLowerCase())) return false;
      if (appliedFilters.rollFilter && s.rollNo !== appliedFilters.rollFilter && s.admissionNo !== appliedFilters.rollFilter) return false;
      if (appliedFilters.classFilter && s.className !== appliedFilters.classFilter) return false;
      if (appliedFilters.sectionFilter && s.section !== appliedFilters.sectionFilter) return false;
      
      return true;
    });
  }, [students, quickSearch, appliedFilters]);

  const exportData = filteredStudents.map(s => ({
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
        <h1 className="text-2xl font-bold text-white">Manage Student</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Student Info</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Student List</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
          <Link href="/dashboard/students/add">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" /> ADD STUDENT
            </Button>
          </Link>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Academic Year <span className="text-rose-500">*</span></Label>
            <SearchableSelect 
              name="academicYear" 
              value={academicYear} 
              onChange={(e) => setAcademicYear(e.target.value)} 
              placeholder="Select Year"
              options={[
                { label: '2026[Jan-Dec]', value: '2026[Jan-Dec]' },
                { label: '2027[Jan-Dec]', value: '2027[Jan-Dec]' }
              ]} 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class</Label>
            <SearchableSelect 
              name="classFilter" 
              value={classFilter} 
              onChange={(e) => setClassFilter(e.target.value)} 
              placeholder="Select Class"
              options={[{ label: 'All Classes', value: '' }, ...classes.map(c => ({ label: c.name, value: c.name }))]} 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
            <SearchableSelect 
              name="sectionFilter" 
              value={sectionFilter} 
              onChange={(e) => setSectionFilter(e.target.value)} 
              placeholder="Select Section"
              options={[{ label: 'All Sections', value: '' }, ...sections.map(s => ({ label: s.name, value: s.name }))]} 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Search by Name</Label>
            <Input 
              placeholder="Name" 
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Search by Roll/Admission</Label>
            <Input 
              placeholder="Roll or Admission No" 
              value={rollFilter}
              onChange={(e) => setRollFilter(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" 
            />
          </div>
          <div className="flex items-end justify-end">
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Student List</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="QUICK SEARCH" 
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="pl-9 w-full sm:w-[200px] bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs font-semibold"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={() => exportToCSV(exportData, 'Student_List')} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white" title="Download CSV">
                <Download className="h-4 w-4" />
              </Button>
              <Button onClick={() => exportToExcel(exportData, 'Student_List')} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white text-emerald-500" title="Export Excel">
                <FileText className="h-4 w-4" />
              </Button>
              <Button onClick={() => printData('Student List', exportData)} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white text-rose-500" title="Print">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Admission No</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Father Name</th>
                <th className="px-4 py-3 font-semibold">Date Of Birth</th>
                <th className="px-4 py-3 font-semibold">Class(Section)</th>
                <th className="px-4 py-3 font-semibold">Gender</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-zinc-500">Loading...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 text-zinc-300">{student.admissionNo || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                          {student.photo ? (
                            <img src={`http://localhost:5000/${student.photo}`} alt={student.firstName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500 uppercase">{student.firstName?.charAt(0)}</div>
                          )}
                        </div>
                        <span className="font-medium text-emerald-500 hover:text-emerald-400 cursor-pointer">{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{student.fatherName || '-'}</td>
                    <td className="px-4 py-3 text-zinc-300">{student.dob || '-'}</td>
                    <td className="px-4 py-3 text-zinc-300">{student.className}({student.section})</td>
                    <td className="px-4 py-3 text-zinc-300">{student.gender || '-'}</td>
                    <td className="px-4 py-3 text-zinc-300">Regular</td>
                    <td className="px-4 py-3 text-zinc-300">{student.phone || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDelete(student._id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
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
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing 1 to {filteredStudents.length} of {filteredStudents.length} entries</div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white" disabled>
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
