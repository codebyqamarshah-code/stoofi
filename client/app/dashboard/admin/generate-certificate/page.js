'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Printer, Award, User, CheckSquare, Square, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const CERT_TYPES = [
  'Character Certificate',
  'School Leaving / Transfer Certificate',
  'Academic Excellence & Merit Award',
  'Course Completion Certificate',
  'Sports & Extra-Curricular Achievement'
];

export default function GenerateCertificatePage() {
  const [classFilter, setClassFilter] = useState('');
  const [certType, setCertType] = useState(CERT_TYPES[0]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [schoolSetting, setSchoolSetting] = useState(null);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [clsRes, setRes] = await Promise.all([
          api.get('/class').catch(() => null),
          api.get('/setting').catch(() => null)
        ]);
        if (clsRes?.success && Array.isArray(clsRes.data)) setClasses(clsRes.data);
        if (setRes?.success && setRes.data) setSchoolSetting(setRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInit();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setHasSearched(true);
      setSelectedIds([]);

      const res = await api.get('/student');
      let list = [];
      if (res?.success && Array.isArray(res.data)) {
        list = res.data;
        if (classFilter) {
          list = list.filter(s => s.className === classFilter);
        }
      }

      setStudents(list);
      setSelectedIds(list.map(s => s._id));
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s._id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedStudents = students.filter(s => selectedIds.includes(s._id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" />
            Generate & Print Certificates
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Generate official School Leaving, Character, and Achievement Certificates.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Admin</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Generate Certificate</span>
        </div>
      </div>

      {/* Criteria */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm print:hidden">
        <h2 className="text-base font-semibold text-white mb-4">Select Certificate Criteria</h2>
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Certificate Type *</Label>
              <select 
                value={certType} 
                onChange={e => setCertType(e.target.value)} 
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                required
              >
                {CERT_TYPES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Class Filter</Label>
              <select 
                value={classFilter} 
                onChange={e => setClassFilter(e.target.value)} 
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-10 shadow-md"
              >
                <Search className="h-4 w-4 mr-2" /> 
                {loading ? 'SEARCHING...' : 'SEARCH STUDENTS'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Results & Certificates */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-950 border border-zinc-800 rounded-xl p-4 print:hidden">
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={toggleSelectAll} 
                className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white"
              >
                {selectedIds.length === students.length && students.length > 0 ? (
                  <CheckSquare className="h-5 w-5 text-indigo-500" />
                ) : (
                  <Square className="h-5 w-5 text-zinc-600" />
                )}
                Select All ({students.length})
              </button>
              <span className="text-xs text-zinc-500">|</span>
              <span className="text-sm text-zinc-400">
                Selected: <strong className="text-white">{selectedIds.length}</strong>
              </span>
            </div>

            <Button 
              onClick={handlePrint} 
              disabled={selectedStudents.length === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md"
            >
              <Printer className="h-4 w-4 mr-2" />
              PRINT SELECTED CERTIFICATES ({selectedIds.length})
            </Button>
          </div>

          {students.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
              <User className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
              <p className="text-base font-semibold text-zinc-300">No student records found</p>
              <p className="text-sm text-zinc-500 mt-1">Please add students in the directory first.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {students.map(st => {
                const isSelected = selectedIds.includes(st._id);
                const fullName = `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student Name';
                const schoolName = schoolSetting?.schoolName || 'Stoofi Public School & College';
                const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

                return (
                  <div 
                    key={st._id} 
                    onClick={() => toggleSelect(st._id)}
                    className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-amber-500' : 'opacity-50'} ${!isSelected && 'print:hidden'}`}
                  >
                    {/* Certificate Paper Design */}
                    <div className="bg-white text-zinc-900 border-8 border-double border-amber-600/80 rounded-xl p-8 sm:p-12 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
                      {/* Corner Accents */}
                      <div className="absolute top-2 left-2 text-xs font-serif text-amber-700 font-bold">★ ★ ★</div>
                      <div className="absolute top-2 right-2 text-xs font-serif text-amber-700 font-bold">★ ★ ★</div>
                      <div className="absolute bottom-2 left-2 text-xs font-serif text-amber-700 font-bold">★ ★ ★</div>
                      <div className="absolute bottom-2 right-2 text-xs font-serif text-amber-700 font-bold">★ ★ ★</div>

                      {/* Header */}
                      <div className="text-center border-b-2 border-amber-600/40 pb-6 mb-8">
                        <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wide font-serif text-zinc-900">{schoolName}</h2>
                        <p className="text-sm text-zinc-600 mt-1">{schoolSetting?.address || 'Main Campus, Lahore, Pakistan'} • {schoolSetting?.phone || '+92 300 1234567'}</p>
                        <div className="inline-block mt-4 px-6 py-1.5 bg-amber-50 border border-amber-600/50 rounded-full">
                          <span className="text-base sm:text-xl font-bold uppercase tracking-widest text-amber-900 font-serif">{certType}</span>
                        </div>
                      </div>

                      {/* Certificate Text Body */}
                      <div className="text-center space-y-6 text-base sm:text-lg text-zinc-800 leading-relaxed font-serif">
                        <p>This is to officially certify that</p>
                        <p className="text-2xl sm:text-3xl font-extrabold text-indigo-950 underline decoration-amber-500 decoration-2 underline-offset-8">
                          {fullName}
                        </p>
                        <p>
                          Son / Daughter of <strong className="text-zinc-900">{st.fatherName || '—'}</strong>, having Admission No <strong className="text-zinc-900">{st.admissionNo || '—'}</strong>, Roll No <strong className="text-zinc-900">{st.rollNo || '—'}</strong>, was a bona fide student of Class <strong className="text-zinc-900">{st.className || '—'}</strong> (Section {st.section || 'A'}) in this institution for the Academic Session <strong className="text-zinc-900">{st.academicYear || '2026'}</strong>.
                        </p>
                        <p className="text-sm sm:text-base text-zinc-600 pt-2">
                          During their stay at the institution, their conduct and academic character were found to be exemplary and commendable. We wish them success in all their future endeavors.
                        </p>
                      </div>

                      {/* Signatures & Footer */}
                      <div className="mt-16 pt-8 border-t border-zinc-300 flex justify-between items-end text-center font-serif text-sm">
                        <div>
                          <p className="font-bold text-zinc-900">{today}</p>
                          <p className="text-xs text-zinc-500 uppercase mt-1 border-t border-zinc-400 pt-1">Date of Issue</p>
                        </div>

                        <div>
                          <p className="font-bold text-zinc-900">Class Teacher</p>
                          <p className="text-xs text-zinc-500 uppercase mt-1 border-t border-zinc-400 pt-1">Checked By</p>
                        </div>

                        <div>
                          <p className="font-bold text-amber-900">Principal</p>
                          <p className="text-xs text-zinc-500 uppercase mt-1 border-t border-zinc-400 pt-1">Authorized Signature & Seal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
