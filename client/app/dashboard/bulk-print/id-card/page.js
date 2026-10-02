'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Printer, CreditCard, User, CheckSquare, Square, Building, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

const DEFAULT_CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'
];

const SAMPLE_STUDENTS = [
  {
    _id: 'sample-stu-1',
    firstName: 'Muhammad',
    lastName: 'Rayyan',
    admissionNo: '101',
    rollNo: '101',
    className: 'Class 10',
    section: 'A',
    fatherName: 'Tariq Mehmood',
    phone: '+92 300 1234567',
    academicYear: '2026'
  },
  {
    _id: 'sample-stu-2',
    firstName: 'Zoya',
    lastName: 'Fatima',
    admissionNo: '102',
    rollNo: '102',
    className: 'Class 10',
    section: 'A',
    fatherName: 'Syed Ali',
    phone: '+92 321 7654321',
    academicYear: '2026'
  },
  {
    _id: 'sample-stu-3',
    firstName: 'Bilal',
    lastName: 'Hassan',
    admissionNo: '103',
    rollNo: '103',
    className: 'Class 9',
    section: 'B',
    fatherName: 'Hassan Raza',
    phone: '+92 333 9876543',
    academicYear: '2026'
  }
];

const SAMPLE_STAFF = [
  {
    _id: 'sample-staff-1',
    firstName: 'Mudassir',
    lastName: 'Bajwa',
    staffNo: 'ST-001',
    designation: 'Senior Physics Teacher',
    department: 'Science & Academics',
    phone: '+92 301 5551234'
  },
  {
    _id: 'sample-staff-2',
    firstName: 'Fatima',
    lastName: 'Zahra',
    staffNo: 'ST-002',
    designation: 'Head of Mathematics',
    department: 'Academics',
    phone: '+92 302 4445678'
  }
];

export default function BulkPrintIdCardPage() {
  const [role, setRole] = useState('Student');
  const [classFilter, setClassFilter] = useState('');
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [records, setRecords] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolSetting, setSchoolSetting] = useState(null);

  // Auto-fetch data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // When role changes, automatically reload records
  useEffect(() => {
    executeSearch(role, classFilter);
  }, [role, classFilter]);

  const fetchInitialData = async () => {
    try {
      const [clsRes, setRes] = await Promise.all([
        api.get('/class').catch(() => null),
        api.get('/setting').catch(() => null)
      ]);
      if (clsRes?.success && Array.isArray(clsRes.data) && clsRes.data.length > 0) {
        setClasses(clsRes.data.map(c => c.name));
      }
      if (setRes?.success && setRes.data) {
        setSchoolSetting(setRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeSearch = async (selectedRole = role, selectedClass = classFilter) => {
    setLoading(true);
    try {
      let list = [];
      if (selectedRole === 'Student') {
        const url = selectedClass ? `/student?className=${encodeURIComponent(selectedClass)}&limit=1000` : '/student?limit=1000';
        const res = await api.get(url).catch(() => null);
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          list = res.data;
        } else if (res?.success && Array.isArray(res.data) && res.data.length === 0) {
          list = []; // Empty result from DB means no students, don't show samples
        } else {
          // Absolute fallback if API fails
          list = selectedClass 
            ? SAMPLE_STUDENTS.filter(s => String(s.className).toLowerCase().includes(String(selectedClass).toLowerCase()))
            : SAMPLE_STUDENTS;
        }
      } else {
        const res = await api.get('/staff?limit=1000').catch(() => null);
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          list = res.data;
        } else if (res?.success && Array.isArray(res.data) && res.data.length === 0) {
          list = [];
        } else {
          list = SAMPLE_STAFF;
        }
      }

      setRecords(list);
      setSelectedIds(list.map(r => r._id));
    } catch (error) {
      console.error('Error fetching records:', error);
      const fallback = selectedRole === 'Student' ? SAMPLE_STUDENTS : SAMPLE_STAFF;
      setRecords(fallback);
      setSelectedIds(fallback.map(r => r._id));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(role, classFilter);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r._id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedRecords = records.filter(r => selectedIds.includes(r._id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-indigo-400" />
            Generate & Print ID Cards
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Search, preview, and batch-print official identity cards for students and staff.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Bulk Print</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">ID Cards</span>
        </div>
      </div>

      {/* Criteria Filter Card */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-5 shadow-sm print:hidden">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-950 uppercase tracking-wider">Select Criteria</h2>
        </div>
        <form onSubmit={handleSearchSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Role <span className="text-rose-500">*</span></Label>
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)} 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                required
              >
                <option value="Student">Student</option>
                <option value="Staff">Staff / Faculty</option>
              </select>
            </div>

            {role === 'Student' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Class Filter</Label>
                <select 
                  value={classFilter} 
                  onChange={e => setClassFilter(e.target.value)} 
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-10 shadow-md flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" /> 
                {loading ? 'SEARCHING...' : 'SEARCH ID CARDS'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Results & ID Card Grid */}
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-zinc-200 shadow-xs rounded-xl p-4 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={toggleSelectAll} 
              className="flex items-center gap-2 text-sm font-medium text-zinc-950 hover:text-zinc-950 cursor-pointer"
            >
              {selectedIds.length === records.length && records.length > 0 ? (
                <CheckSquare className="h-5 w-5 text-indigo-400" />
              ) : (
                <Square className="h-5 w-5 text-zinc-600" />
              )}
              Select All ({records.length})
            </button>
            <span className="text-xs text-zinc-600">|</span>
            <span className="text-sm text-zinc-400">
              Selected to Print: <strong className="text-zinc-950 font-bold">{selectedIds.length}</strong>
            </span>
          </div>

          <Button 
            onClick={handlePrint} 
            disabled={selectedRecords.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md flex items-center gap-2 px-6"
          >
            <Printer className="h-4 w-4" />
            PRINT SELECTED ID CARDS ({selectedIds.length})
          </Button>
        </div>

        {records.length === 0 ? (
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-12 text-center text-zinc-500">
            <User className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
            <p className="text-base font-semibold text-zinc-950">No {role} records found</p>
            <p className="text-sm text-zinc-500 mt-1">Add students or staff in the directory to generate ID cards.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map(rec => {
              const isSelected = selectedIds.includes(rec._id);
              const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Student Name';
              const photo = rec.photo || rec.studentPhoto || rec.staffPhoto;
              const schoolName = schoolSetting?.schoolName || 'Stoofi Public School & College';
              const phone = rec.phone || rec.guardianPhone || schoolSetting?.phone || '+92 300 0000000';

              return (
                <div 
                  key={rec._id} 
                  onClick={() => toggleSelect(rec._id)}
                  className={`relative cursor-pointer transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-indigo-500 rounded-2xl shadow-xl' : 'opacity-50 hover:opacity-80'
                  } ${!isSelected ? 'print:hidden' : ''}`}
                >
                  {/* Select badge */}
                  <div className="absolute top-3 right-3 z-10 print:hidden">
                    {isSelected ? (
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">Selected</span>
                    ) : (
                      <span className="bg-zinc-800 text-zinc-700 text-[10px] px-2 py-0.5 rounded-full">Click to Select</span>
                    )}
                  </div>

                  {/* ID Card Front Design */}
                  <div className="bg-white text-zinc-900 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 w-full max-w-[340px] mx-auto h-[480px] flex flex-col justify-between">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-zinc-950 p-4 text-center relative">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">OFFICIAL IDENTITY CARD</div>
                      <h3 className="font-bold text-base leading-tight mt-0.5 truncate">{schoolName}</h3>
                      <p className="text-[10px] text-indigo-200 truncate">{schoolSetting?.address || 'Campus Lahore, Pakistan'}</p>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col items-center text-center flex-1">
                      {/* Avatar / Photo */}
                      <div className="w-24 h-24 rounded-full border-4 border-indigo-100 overflow-hidden bg-zinc-100 shadow-md mb-3 flex items-center justify-center">
                        {photo ? (
                          <img src={photo.startsWith('http') || photo.startsWith('data:') ? photo : `http://localhost:5000/${photo}`} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-2xl font-extrabold text-indigo-600 uppercase">{name.charAt(0)}</div>
                        )}
                      </div>

                      <h4 className="font-extrabold text-lg text-zinc-900 leading-tight">{name}</h4>
                      <span className="inline-block mt-1 px-3 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase">
                        {role}
                      </span>

                      {/* Details Table */}
                      <div className="w-full mt-4 space-y-1.5 text-xs text-left bg-zinc-50 p-3 rounded-xl border border-zinc-100 font-sans">
                        {role === 'Student' ? (
                          <>
                            <div className="flex justify-between"><span className="text-zinc-500 font-medium">Adm No:</span><span className="font-bold text-zinc-800">{rec.admissionNo || '101'}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500 font-medium">Class / Sec:</span><span className="font-bold text-zinc-800">{rec.className || 'Class 10'} ({rec.section || 'A'})</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500 font-medium">Roll No:</span><span className="font-bold text-zinc-800">{rec.rollNo || '101'}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500 font-medium">Father:</span><span className="font-bold text-zinc-800 truncate max-w-[140px]">{rec.fatherName || '—'}</span></div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between"><span className="text-zinc-500 font-medium">Staff ID:</span><span className="font-bold text-zinc-800">{rec.staffNo || rec.admissionNo || 'ST-001'}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500 font-medium">Designation:</span><span className="font-bold text-zinc-800">{rec.designation || 'Teacher'}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500 font-medium">Department:</span><span className="font-bold text-zinc-800">{rec.department || 'Academics'}</span></div>
                          </>
                        )}
                        <div className="flex justify-between"><span className="text-zinc-500 font-medium">Emergency:</span><span className="font-bold text-zinc-800">{phone}</span></div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-zinc-100 px-4 py-2 text-[10px] text-zinc-500 flex justify-between items-center border-t border-zinc-200">
                      <span>Session: 2026</span>
                      <span className="font-bold text-indigo-700">Principal Signature</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
