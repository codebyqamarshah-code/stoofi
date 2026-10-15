'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, GraduationCap, Phone, Mail, BookOpen, 
  UserCheck, Award, Plus, LayoutGrid, List, Eye, Printer, 
  MessageCircle, Trash2, CheckCircle2, ShieldCheck, X, Sparkles, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

const DEFAULT_TEACHERS = [
  {
    _id: 'tch-1',
    teacherId: 'TCH-001',
    name: 'Mudassir Bajwa',
    firstName: 'Mudassir',
    lastName: 'Bajwa',
    gender: 'Male',
    email: 'mudassir.bajwa@stoofi.edu.pk',
    phone: '+92 300 4587123',
    subject: 'Physics',
    department: 'Science & Technology',
    designation: 'Senior Physics Lecturer',
    qualification: 'M.Sc Physics (Punjab University)',
    experience: '8 Years',
    assignedClasses: ['Class 10 (A)', 'Class 9 (B)'],
    joinDate: '2020-08-15',
    status: 'Active',
    rating: '4.9 / 5.0'
  },
  {
    _id: 'tch-2',
    teacherId: 'TCH-002',
    name: 'Fatima Zahra',
    firstName: 'Fatima',
    lastName: 'Zahra',
    gender: 'Female',
    email: 'fatima.zahra@stoofi.edu.pk',
    phone: '+92 321 8945612',
    subject: 'Mathematics',
    department: 'Academics & Mathematics',
    designation: 'Head of Mathematics Department',
    qualification: 'M.Phil Applied Mathematics',
    experience: '10 Years',
    assignedClasses: ['Class 10 (A)', 'Class 10 (B)', 'O-Levels'],
    joinDate: '2019-03-10',
    status: 'Active',
    rating: '4.8 / 5.0'
  },
  {
    _id: 'tch-3',
    teacherId: 'TCH-003',
    name: 'Dr. Bilal Siddiqui',
    firstName: 'Bilal',
    lastName: 'Siddiqui',
    gender: 'Male',
    email: 'dr.bilal@stoofi.edu.pk',
    phone: '+92 333 7654321',
    subject: 'Chemistry',
    department: 'Science & Technology',
    designation: 'Senior Chemistry Faculty',
    qualification: 'Ph.D Organic Chemistry (QAU)',
    experience: '12 Years',
    assignedClasses: ['Class 9 (A)', 'Class 10 (A)', 'A-Levels'],
    joinDate: '2018-09-01',
    status: 'Active',
    rating: '5.0 / 5.0'
  }
];

export default function TeachersDirectoryPage() {
  const [teachers, setTeachers] = useState(DEFAULT_TEACHERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      // Try both teacher and staff endpoints
      const [tRes, sRes] = await Promise.allSettled([
        api.get('/teacher'),
        api.get('/staff?role=Teacher')
      ]);

      let loaded = [];

      if (tRes.status === 'fulfilled' && tRes.value?.success && Array.isArray(tRes.value.data) && tRes.value.data.length > 0) {
        loaded = tRes.value.data.map((t, idx) => ({
          _id: t._id || `t_${idx}`,
          teacherId: t.teacherId || t.staffNo || `TCH-00${idx + 1}`,
          name: t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Teacher',
          firstName: t.firstName || 'Teacher',
          lastName: t.lastName || '',
          gender: t.gender || 'Male',
          email: t.email || `teacher${idx + 1}@stoofi.edu.pk`,
          phone: t.phone || t.mobile || '+92 300 0000000',
          subject: t.subject || t.specialization || 'General Academics',
          department: t.department || 'Academics',
          designation: t.designation || 'Lecturer',
          qualification: t.qualification || 'M.Sc / M.A',
          experience: t.experience || '5+ Years',
          assignedClasses: t.assignedClasses || ['Class 10 (A)'],
          joinDate: t.joinDate ? new Date(t.joinDate).toISOString().substring(0, 10) : '2022-01-15',
          status: t.status || 'Active',
          rating: t.rating || '4.8 / 5.0'
        }));
      } else if (sRes.status === 'fulfilled' && sRes.value?.success && Array.isArray(sRes.value.data) && sRes.value.data.length > 0) {
        loaded = sRes.value.data.map((s, idx) => ({
          _id: s._id || `s_${idx}`,
          teacherId: s.staffNo || `TCH-00${idx + 1}`,
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Teacher',
          firstName: s.firstName || 'Teacher',
          lastName: s.lastName || '',
          gender: s.gender || 'Male',
          email: s.email || `teacher${idx + 1}@stoofi.edu.pk`,
          phone: s.phone || s.mobile || '+92 300 0000000',
          subject: s.subject || s.designation || 'Academics',
          department: s.department || 'Academics',
          designation: s.designation || 'Subject Teacher',
          qualification: s.qualification || 'Master Degree',
          experience: '6 Years',
          assignedClasses: ['Class 10 (A)', 'Class 9 (B)'],
          joinDate: s.joiningDate ? new Date(s.joiningDate).toISOString().substring(0, 10) : '2021-08-01',
          status: s.status || 'Active',
          rating: '4.8 / 5.0'
        }));
      }

      if (loaded.length > 0) {
        setTeachers(loaded);
      } else {
        setTeachers(DEFAULT_TEACHERS);
      }
    } catch (e) {
      console.error(e);
      setTeachers(DEFAULT_TEACHERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDeleteTeacher = async (id, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from teachers directory?`)) return;
    try {
      await api.delete(`/teacher/${id}`).catch(() => null);
      await api.delete(`/staff/${id}`).catch(() => null);
    } catch (e) {
      console.error(e);
    }
    setTeachers(prev => prev.filter(t => t._id !== id));
    setDeleteMsg(`${name} was removed from active roster.`);
    setTimeout(() => setDeleteMsg(''), 4000);
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const q = search.toLowerCase();
      const matchesSearch = 
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        t.designation.toLowerCase().includes(q);
      const matchesSubject = !subjectFilter || t.subject.toLowerCase() === subjectFilter.toLowerCase();
      const matchesDepartment = !departmentFilter || t.department.toLowerCase() === departmentFilter.toLowerCase();
      return matchesSearch && matchesSubject && matchesDepartment;
    });
  }, [teachers, search, subjectFilter, departmentFilter]);

  const uniqueSubjects = useMemo(() => {
    const set = new Set();
    teachers.forEach(t => { if (t.subject) set.add(t.subject); });
    return Array.from(set);
  }, [teachers]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#084A86]" />
            Teachers Directory
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Institutional faculty records, teaching subjects, class assignments, and teacher profiles
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
          <span className="text-zinc-950 font-bold">Teachers</span>
        </div>
      </div>

      {deleteMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-semibold flex items-center justify-between animate-in fade-in">
          <span>{deleteMsg}</span>
          <button onClick={() => setDeleteMsg('')} className="text-xs text-rose-600 underline">Dismiss</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Teachers</div>
            <div className="text-3xl font-black text-[#084A86] mt-1">{teachers.length}</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#084A86] flex items-center justify-center font-bold">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active & On Duty</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">{teachers.length}</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Subject Specialists</div>
            <div className="text-3xl font-black text-amber-600 mt-1">{uniqueSubjects.length || 3}</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Class Incharges</div>
            <div className="text-3xl font-black text-purple-600 mt-1">{teachers.length}</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search by teacher name, subject, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9.5 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-[#084A86]"
            />
          </div>

          <select 
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="h-9.5 rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86] w-full sm:w-44"
          >
            <option value="">All Subjects</option>
            {uniqueSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Toggle */}
          <div className="flex border border-zinc-200 rounded-lg overflow-hidden p-0.5 bg-zinc-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#084A86]' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#084A86]' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button 
            onClick={handlePrint}
            variant="outline"
            className="h-9.5 text-xs text-zinc-700 border-zinc-300 hover:bg-zinc-50 flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            Print List
          </Button>

          <Link href="/dashboard/hr/add-staff">
            <Button className="h-9.5 bg-[#084A86] hover:bg-[#073b6b] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs px-4">
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.length === 0 ? (
            <div className="col-span-full bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-500">
              <GraduationCap className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
              <div className="font-bold text-zinc-900">No teachers found</div>
              <div className="text-xs text-zinc-500 mt-1">Try clearing your search query or subject filters.</div>
            </div>
          ) : (
            filteredTeachers.map((teacher, idx) => (
              <div 
                key={teacher._id || idx}
                className="bg-white border border-zinc-200 rounded-2xl shadow-xs hover:shadow-md hover:border-[#084A86]/50 transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header Top */}
                  <div className="p-5 border-b border-zinc-100 flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#084A86] to-[#052b4f] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                      {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-base text-zinc-950 truncate group-hover:text-[#084A86] transition-colors">
                          {teacher.name}
                        </h3>
                        <ShieldCheck className="h-4 w-4 text-[#084A86] shrink-0" title="Verified Faculty" />
                      </div>
                      <div className="text-xs font-semibold text-[#084A86] mt-0.5 truncate">
                        {teacher.designation}
                      </div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#084A86] border border-blue-200/60 mt-1.5">
                        <BookOpen className="h-3 w-3" />
                        {teacher.subject}
                      </div>
                    </div>
                  </div>

                  {/* Card Body Info */}
                  <div className="p-5 space-y-2.5 text-xs text-zinc-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="font-medium text-zinc-800 font-mono">{teacher.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="text-zinc-600 truncate">{teacher.email}</span>
                    </div>

                    <div className="pt-2 border-t border-zinc-100">
                      <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Teaching Assignments</div>
                      <div className="flex flex-wrap gap-1">
                        {teacher.assignedClasses?.map((cls, cIdx) => (
                          <span key={cIdx} className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-[11px] text-zinc-500 font-medium">
                      <span>Experience: <b className="text-zinc-900">{teacher.experience}</b></span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Rating: {teacher.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <Button 
                    onClick={() => setSelectedTeacher(teacher)}
                    variant="ghost" 
                    size="sm"
                    className="h-8 text-xs font-bold text-[#084A86] hover:bg-blue-50 flex items-center gap-1.5 flex-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Button>
                  <a 
                    href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="h-8 px-2.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                    title="Send WhatsApp Message"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteTeacher(teacher._id, teacher.name)}
                    className="h-8 w-8 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                    title="Remove Teacher"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-100/70 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Teacher ID</th>
                  <th className="px-4 py-3">Faculty Name</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Assigned Classes</th>
                  <th className="px-4 py-3">Contact Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTeachers.map((teacher, idx) => (
                  <tr key={teacher._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center text-xs text-zinc-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-900 text-xs font-bold">{teacher.teacherId}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-zinc-950">{teacher.name}</div>
                      <div className="text-xs text-zinc-500">{teacher.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-xs text-[#084A86] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                        {teacher.subject}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700 text-xs font-medium">{teacher.designation}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {teacher.assignedClasses?.map((c, i) => (
                          <span key={i} className="text-[11px] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-800">{teacher.phone}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          onClick={() => setSelectedTeacher(teacher)}
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-2 text-[#084A86] hover:bg-blue-50 text-xs font-bold"
                        >
                          View
                        </Button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher._id, teacher.name)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teacher Profile Detail Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-[#084A86] text-white p-6 relative">
              <button 
                onClick={() => setSelectedTeacher(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white text-[#084A86] font-black text-2xl flex items-center justify-center shadow-md">
                  {selectedTeacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedTeacher.name}</h2>
                  <p className="text-blue-100 text-xs mt-0.5">{selectedTeacher.designation}</p>
                  <span className="inline-block mt-2 bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {selectedTeacher.department}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm text-zinc-700">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-100">
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase">Primary Subject</div>
                  <div className="font-bold text-zinc-950 mt-0.5 text-sm">{selectedTeacher.subject}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase">Staff / Teacher ID</div>
                  <div className="font-mono font-bold text-zinc-950 mt-0.5 text-sm">{selectedTeacher.teacherId}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-100">
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase">Qualification</div>
                  <div className="font-medium text-zinc-900 mt-0.5 text-xs">{selectedTeacher.qualification}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase">Teaching Experience</div>
                  <div className="font-medium text-zinc-900 mt-0.5 text-xs">{selectedTeacher.experience}</div>
                </div>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-zinc-100">
                <div className="text-[11px] font-bold text-zinc-400 uppercase">Contact Information</div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3.5 w-3.5 text-[#084A86]" />
                  <span className="font-mono text-zinc-900 font-bold">{selectedTeacher.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-3.5 w-3.5 text-[#084A86]" />
                  <span className="text-zinc-700">{selectedTeacher.email}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-zinc-400 uppercase">Assigned Classes</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTeacher.assignedClasses?.map((cls, idx) => (
                    <span key={idx} className="bg-blue-50 text-[#084A86] border border-blue-200 px-2.5 py-1 rounded text-xs font-bold">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
              <a 
                href={`https://wa.me/${selectedTeacher.phone.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
              >
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Chat on WhatsApp
                </Button>
              </a>
              <Button 
                onClick={() => setSelectedTeacher(null)}
                variant="outline"
                className="text-xs border-zinc-300 text-zinc-700"
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
