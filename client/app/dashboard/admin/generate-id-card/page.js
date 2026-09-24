'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Printer, CreditCard, User, CheckSquare, Square, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function GenerateIdCardPage() {
  const [role, setRole] = useState('Student');
  const [classFilter, setClassFilter] = useState('');
  const [classes, setClasses] = useState([]);
  const [records, setRecords] = useState([]);
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

      let list = [];
      if (role === 'Student') {
        const res = await api.get('/student');
        if (res?.success && Array.isArray(res.data)) {
          list = res.data;
          if (classFilter) {
            list = list.filter(s => s.className === classFilter);
          }
        }
      } else {
        const res = await api.get('/staff');
        if (res?.success && Array.isArray(res.data)) {
          list = res.data;
        }
      }

      setRecords(list);
      // Auto-select all by default
      setSelectedIds(list.map(r => r._id));
    } catch (error) {
      console.error('Error fetching records:', error);
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
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-indigo-500" />
            Generate & Print ID Cards
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Generate official student and staff identity cards with school branding.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Admin</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Generate ID Card</span>
        </div>
      </div>

      {/* Criteria Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm print:hidden">
        <h2 className="text-base font-semibold text-white mb-4">Select Criteria</h2>
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Role *</Label>
              <select 
                value={role} 
                onChange={e => { setRole(e.target.value); setRecords([]); setHasSearched(false); }} 
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                required
              >
                <option value="Student">Student</option>
                <option value="Staff">Staff / Teachers</option>
              </select>
            </div>

            {role === 'Student' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Class Filter (Optional)</Label>
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
            )}

            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-10 shadow-md"
              >
                <Search className="h-4 w-4 mr-2" /> 
                {loading ? 'SEARCHING...' : 'SEARCH RECORDS'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Results & ID Card Grid */}
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
                {selectedIds.length === records.length && records.length > 0 ? (
                  <CheckSquare className="h-5 w-5 text-indigo-500" />
                ) : (
                  <Square className="h-5 w-5 text-zinc-600" />
                )}
                Select All ({records.length})
              </button>
              <span className="text-xs text-zinc-500">|</span>
              <span className="text-sm text-zinc-400">
                Selected: <strong className="text-white">{selectedIds.length}</strong>
              </span>
            </div>

            <Button 
              onClick={handlePrint} 
              disabled={selectedRecords.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
            >
              <Printer className="h-4 w-4 mr-2" />
              PRINT SELECTED ID CARDS ({selectedIds.length})
            </Button>
          </div>

          {records.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
              <User className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
              <p className="text-base font-semibold text-zinc-300">No {role} records found</p>
              <p className="text-sm text-zinc-500 mt-1">Please add students or staff in the directory first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {records.map(rec => {
                const isSelected = selectedIds.includes(rec._id);
                const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Student';
                const photo = rec.photo || rec.studentPhoto || rec.staffPhoto;
                const schoolName = schoolSetting?.schoolName || 'Stoofi Public School';
                const phone = rec.phone || rec.guardianPhone || schoolSetting?.phone || '+92 300 0000000';

                return (
                  <div 
                    key={rec._id} 
                    onClick={() => toggleSelect(rec._id)}
                    className={`relative cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-indigo-500' : 'opacity-60'} ${!isSelected && 'print:hidden'}`}
                  >
                    {/* ID Card Front Design */}
                    <div className="bg-white text-zinc-900 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 w-full max-w-[340px] mx-auto h-[480px] flex flex-col justify-between">
                      {/* Card Header */}
                      <div className="bg-indigo-700 text-white p-4 text-center relative">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">IDENTITY CARD</div>
                        <h3 className="font-bold text-base leading-tight mt-0.5 truncate">{schoolName}</h3>
                        <p className="text-[10px] text-indigo-200 truncate">{schoolSetting?.address || 'Campus Lahore'}</p>
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
                        <div className="w-full mt-4 space-y-1.5 text-xs text-left bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                          {role === 'Student' ? (
                            <>
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Adm No:</span><span className="font-bold text-zinc-800">{rec.admissionNo || '—'}</span></div>
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Class / Sec:</span><span className="font-bold text-zinc-800">{rec.className || '—'} ({rec.section || 'A'})</span></div>
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Roll No:</span><span className="font-bold text-zinc-800">{rec.rollNo || '—'}</span></div>
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Father:</span><span className="font-bold text-zinc-800 truncate max-w-[140px]">{rec.fatherName || '—'}</span></div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Staff ID:</span><span className="font-bold text-zinc-800">{rec.staffNo || rec.admissionNo || '—'}</span></div>
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Designation:</span><span className="font-bold text-zinc-800">{rec.designation || 'Teacher'}</span></div>
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Department:</span><span className="font-bold text-zinc-800">{rec.department || 'Academics'}</span></div>
                            </>
                          )}
                          <div className="flex justify-between"><span className="text-zinc-500 font-medium">Emergency:</span><span className="font-bold text-zinc-800">{phone}</span></div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="bg-zinc-100 px-4 py-2 text-[10px] text-zinc-500 flex justify-between items-center border-t border-zinc-200">
                        <span>Issued: {new Date().getFullYear()}</span>
                        <span className="font-bold text-indigo-700">Principal Signature</span>
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
