'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Search, 
  Printer, 
  CreditCard, 
  CheckSquare, 
  Square, 
  UserCheck, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  FileText,
  Sparkles,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

const DEFAULT_EXAMS = [
  { _id: 'e1', name: 'First Term Examination 2026' },
  { _id: 'e2', name: 'Mid Term Examination 2026' },
  { _id: 'e3', name: 'Final Term Examination 2026' },
  { _id: 'e4', name: 'Monthly Class Assessment' },
];

const DEFAULT_CLASSES = [
  { _id: 'c1', name: 'Class 1' },
  { _id: 'c2', name: 'Class 2' },
  { _id: 'c3', name: 'Class 3' },
  { _id: 'c4', name: 'Class 4' },
  { _id: 'c5', name: 'Class 5' },
  { _id: 'c6', name: 'Class 6' },
  { _id: 'c7', name: 'Class 7' },
  { _id: 'c8', name: 'Class 8' },
  { _id: 'c9', name: 'Class 9' },
  { _id: 'c10', name: 'Class 10' },
  { _id: 'c11', name: 'O-Levels' },
  { _id: 'c12', name: 'A-Levels' },
];

const DEFAULT_SECTIONS = [
  { _id: 'sec_all', name: 'All Sections' },
  { _id: 'sec1', name: 'Section A' },
  { _id: 'sec2', name: 'Section B' },
  { _id: 'sec3', name: 'Section C' },
  { _id: 'sec4', name: 'Section D' },
];

const SAMPLE_STUDENTS = [
  { _id: 's1', rollNo: '101', admissionNo: 'STU-2026-001', name: 'Muhammad Ali', fatherName: 'Tariq Mehmood', gender: 'Male', section: 'Section A', photo: null },
  { _id: 's2', rollNo: '102', admissionNo: 'STU-2026-002', name: 'Ayesha Fatima', fatherName: 'Dr. Sajid Khan', gender: 'Female', section: 'Section A', photo: null },
  { _id: 's3', rollNo: '103', admissionNo: 'STU-2026-003', name: 'Zainab Bibi', fatherName: 'Abdul Rehman', gender: 'Female', section: 'Section A', photo: null },
  { _id: 's4', rollNo: '104', admissionNo: 'STU-2026-004', name: 'Hamza Farooq', fatherName: 'Farooq Ahmed', gender: 'Male', section: 'Section B', photo: null },
  { _id: 's5', rollNo: '105', admissionNo: 'STU-2026-005', name: 'Fatima Noor', fatherName: 'Usman Ghani', gender: 'Female', section: 'Section B', photo: null },
  { _id: 's6', rollNo: '106', admissionNo: 'STU-2026-006', name: 'Bilal Hussain', fatherName: 'Hussain Ali', gender: 'Male', section: 'Section A', photo: null },
];

const SAMPLE_SCHEDULE = [
  { date: '2026-05-10', day: 'Monday', subject: 'Mathematics', time: '09:00 AM - 12:00 PM', room: 'Hall A' },
  { date: '2026-05-12', day: 'Wednesday', subject: 'English Language', time: '09:00 AM - 12:00 PM', room: 'Hall A' },
  { date: '2026-05-14', day: 'Friday', subject: 'General Science', time: '09:00 AM - 12:00 PM', room: 'Hall B' },
  { date: '2026-05-17', day: 'Monday', subject: 'Urdu Literature', time: '09:00 AM - 12:00 PM', room: 'Hall A' },
  { date: '2026-05-19', day: 'Wednesday', subject: 'Computer Science', time: '09:00 AM - 12:00 PM', room: 'Lab 1' },
];

export default function AdmitCardPage() {
  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [formData, setFormData] = useState({ examId: 'e2', classId: 'c10', sectionId: 'sec_all' });
  
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Settings
  const [cardTheme, setCardTheme] = useState('navy'); // 'navy' | 'classic' | 'emerald'
  const [showInstructions, setShowInstructions] = useState(true);
  const [showTimetable, setShowTimetable] = useState(true);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [eRes, cRes, sRes] = await Promise.all([
          api.get('/exam-type').catch(() => null),
          api.get('/class').catch(() => null),
          api.get('/section').catch(() => null)
        ]);
        if (eRes?.success && Array.isArray(eRes.data) && eRes.data.length > 0) setExams(eRes.data);
        if (cRes?.success && Array.isArray(cRes.data) && cRes.data.length > 0) setClasses(sortClassesAcademic(cRes.data));
        if (sRes?.success && Array.isArray(sRes.data) && sRes.data.length > 0) {
          setSections([{ _id: 'sec_all', name: 'All Sections' }, ...sRes.data]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchDropdowns();
  }, []);

  const handleSearch = async () => {
    if (!formData.examId || !formData.classId) {
      alert('Please select Exam and Class.');
      return;
    }
    setLoading(true);
    try {
      const selectedClass = classes.find(c => c._id === formData.classId)?.name || formData.classId;
      const res = await api.get(`/student?className=${encodeURIComponent(selectedClass)}`).catch(() => null);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((st, idx) => ({
          _id: st._id,
          rollNo: st.rollNumber || String(101 + idx),
          admissionNo: st.admissionNo || `STU-${st._id.substring(0, 5).toUpperCase()}`,
          name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.fullName || 'Student',
          fatherName: st.parentName || st.guardianName || 'Guardian',
          gender: st.gender || 'Male',
          section: st.section || 'Section A',
          photo: st.photo || st.avatar || null
        }));
        setStudents(mapped);
        setSelectedStudentIds(mapped.map(m => m._id));
      } else {
        setStudents(SAMPLE_STUDENTS);
        setSelectedStudentIds(SAMPLE_STUDENTS.map(s => s._id));
      }
      setGenerated(true);
    } catch (e) {
      setStudents(SAMPLE_STUDENTS);
      setSelectedStudentIds(SAMPLE_STUDENTS.map(s => s._id));
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s._id));
    }
  };

  const toggleStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectedStudents = students.filter(s => selectedStudentIds.includes(s._id));
  const currentExam = exams.find(e => e._id === formData.examId)?.name || 'Annual Examination 2026';
  const currentClass = classes.find(c => c._id === formData.classId)?.name || 'Class 10';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #admit-cards-print-area, #admit-cards-print-area * {
            visibility: visible;
          }
          #admit-cards-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .admit-card-page-break {
            page-break-after: always;
            break-after: page;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <CreditCard className="h-6 w-6" />
            </span>
            Generate Admit Card
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Create, preview, and print official student roll number slips & examination entry permits.
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Exam Plan</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Admit Card</span>
        </div>
      </div>

      {/* Selection Panel */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden no-print">
        <div className="p-4 border-b border-zinc-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Select Criteria</h2>
          <span className="text-xs text-zinc-500 font-medium">Step 1: Choose examination and target class</span>
        </div>
        
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase">
                EXAM <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect 
                value={formData.examId} 
                onChange={(val) => setFormData({...formData, examId: val})}
                placeholder="Select Exam *"
                options={exams.map(e => ({ label: e.name, value: e._id }))}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase">
                CLASS <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect 
                value={formData.classId} 
                onChange={(val) => setFormData({...formData, classId: val})}
                placeholder="Select Class *"
                options={classes.map(c => ({ label: c.name, value: c._id }))}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase">SECTION</label>
              <SearchableSelect 
                value={formData.sectionId} 
                onChange={(val) => setFormData({...formData, sectionId: val})}
                placeholder="Select Section"
                options={sections.map(s => ({ label: s.name, value: s._id }))}
              />
            </div>
          </div>
          
          <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showTimetable} 
                  onChange={e => setShowTimetable(e.target.checked)}
                  className="rounded text-[#084A86] focus:ring-[#084A86]"
                />
                <span>Include Exam Schedule</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showInstructions} 
                  onChange={e => setShowInstructions(e.target.checked)}
                  className="rounded text-[#084A86] focus:ring-[#084A86]"
                />
                <span>Include Candidate Instructions</span>
              </label>
            </div>

            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold uppercase tracking-wider px-7 py-2.5 rounded-xl shadow-md cursor-pointer"
            >
              <Search className="h-4 w-4 mr-1.5" />
              {loading ? 'GENERATING...' : 'FETCH STUDENTS & PREVIEW'}
            </Button>
          </div>
        </div>
      </div>

      {/* Generated Admit Cards & Selection */}
      {generated && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-950 p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50"
              >
                {selectedStudentIds.length === students.length ? (
                  <CheckSquare className="h-4 w-4 text-[#084A86]" />
                ) : (
                  <Square className="h-4 w-4 text-zinc-400" />
                )}
                <span>Select All ({selectedStudentIds.length}/{students.length})</span>
              </button>

              <span className="text-xs text-zinc-500 font-medium">
                Target: <span className="font-bold text-zinc-800">{currentClass}</span> &bull; {currentExam}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrint}
                disabled={selectedStudents.length === 0}
                className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>PRINT ADMIT CARDS ({selectedStudents.length})</span>
              </Button>
            </div>
          </div>

          {/* Student Checkbox Strip (No-print) */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs no-print">
            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3">Enrolled Students in this Batch:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {students.map(s => {
                const isSelected = selectedStudentIds.includes(s._id);
                return (
                  <div
                    key={s._id}
                    onClick={() => toggleStudent(s._id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#084A86] bg-sky-50/50 shadow-xs ring-1 ring-[#084A86]/20' 
                        : 'border-zinc-200 hover:border-zinc-300 opacity-60'
                    }`}
                  >
                    <div className="font-bold text-zinc-900 truncate">{s.name}</div>
                    <div className="text-[10px] text-zinc-500">Roll: #{s.rollNo}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRINTABLE ADMIT CARDS CONTAINER */}
          <div id="admit-cards-print-area" className="space-y-6">
            {selectedStudents.map((student, idx) => (
              <div 
                key={student._id}
                className="admit-card-page-break bg-white border-2 border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-sm relative overflow-hidden"
              >
                {/* Watermark / Header Seal */}
                <div className="absolute right-8 top-8 opacity-5 pointer-events-none select-none">
                  <img src="/logo.png" alt="" className="w-64 h-auto" />
                </div>

                {/* Card Header */}
                <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4 mb-5">
                  <div className="flex items-center gap-3.5">
                    <img src="/logo.png" alt="Stoofi ERP" className="h-14 w-auto object-contain" />
                    <div>
                      <h2 className="text-xl font-extrabold text-zinc-950 uppercase tracking-tight">STOOFI ACADEMY & GRAMMAR SCHOOL</h2>
                      <p className="text-xs text-zinc-600 font-medium">Affiliated & Registered Higher Secondary Institution</p>
                      <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">Campus Main Road &bull; info@stoofi.edu.pk &bull; +92 300 1234567</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-[#084A86] text-white text-xs font-black uppercase tracking-wider rounded-md">
                      EXAM ADMIT CARD
                    </span>
                    <div className="text-[11px] font-bold text-zinc-800 mt-1">SESSION: 2026-2027</div>
                    <div className="text-[10px] text-zinc-500 font-mono">ID: {student.admissionNo}</div>
                  </div>
                </div>

                {/* Examination Banner */}
                <div className="bg-slate-100 border border-slate-300 py-1.5 px-4 rounded-lg text-center mb-5 font-black text-sm text-zinc-900 uppercase tracking-wider">
                  {currentExam} &bull; {currentClass} ({student.section})
                </div>

                {/* Candidate Particulars & Photo Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center mb-6">
                  {/* Candidate Info Columns */}
                  <div className="md:col-span-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div className="flex items-center py-1 border-b border-zinc-100">
                      <span className="w-28 font-bold text-zinc-500 uppercase">Candidate Name:</span>
                      <span className="font-black text-zinc-950 text-sm">{student.name}</span>
                    </div>

                    <div className="flex items-center py-1 border-b border-zinc-100">
                      <span className="w-28 font-bold text-zinc-500 uppercase">Roll Number:</span>
                      <span className="font-mono font-black text-zinc-950 text-sm bg-zinc-100 px-2 py-0.5 rounded">
                        #{student.rollNo}
                      </span>
                    </div>

                    <div className="flex items-center py-1 border-b border-zinc-100">
                      <span className="w-28 font-bold text-zinc-500 uppercase">Father&apos;s Name:</span>
                      <span className="font-semibold text-zinc-800">{student.fatherName}</span>
                    </div>

                    <div className="flex items-center py-1 border-b border-zinc-100">
                      <span className="w-28 font-bold text-zinc-500 uppercase">Admission No:</span>
                      <span className="font-mono font-bold text-zinc-800">{student.admissionNo}</span>
                    </div>

                    <div className="flex items-center py-1 border-b border-zinc-100">
                      <span className="w-28 font-bold text-zinc-500 uppercase">Class &amp; Section:</span>
                      <span className="font-bold text-zinc-900">{currentClass} - {student.section}</span>
                    </div>

                    <div className="flex items-center py-1 border-b border-zinc-100">
                      <span className="w-28 font-bold text-zinc-500 uppercase">Gender:</span>
                      <span className="font-semibold text-zinc-800">{student.gender}</span>
                    </div>
                  </div>

                  {/* Photo Box */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center">
                    <div className="w-28 h-32 border-2 border-dashed border-zinc-400 bg-zinc-50 rounded-lg flex flex-col items-center justify-center text-center p-2">
                      <UserCheck className="w-8 h-8 text-zinc-400 mb-1" />
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Affix Student Photograph</span>
                    </div>
                  </div>
                </div>

                {/* Exam Timetable Matrix */}
                {showTimetable && (
                  <div className="mb-6">
                    <h4 className="text-xs font-black uppercase text-zinc-900 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#084A86]" />
                      Date Sheet / Examination Schedule
                    </h4>
                    <table className="w-full text-left text-xs border border-zinc-300 rounded-lg overflow-hidden">
                      <thead className="bg-zinc-100 border-b border-zinc-300 font-black text-zinc-800">
                        <tr>
                          <th className="p-2 w-10 text-center">#</th>
                          <th className="p-2">Date &amp; Day</th>
                          <th className="p-2">Subject Name</th>
                          <th className="p-2">Exam Timing</th>
                          <th className="p-2">Room / Hall</th>
                          <th className="p-2 text-center">Invigilator Sign</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {SAMPLE_SCHEDULE.map((item, sIdx) => (
                          <tr key={sIdx} className="hover:bg-zinc-50/50">
                            <td className="p-2 text-center text-zinc-500 font-medium">{sIdx + 1}</td>
                            <td className="p-2 font-bold text-zinc-900">{item.date} ({item.day})</td>
                            <td className="p-2 font-semibold text-zinc-800">{item.subject}</td>
                            <td className="p-2 font-mono text-zinc-700">{item.time}</td>
                            <td className="p-2 font-medium text-zinc-700">{item.room}</td>
                            <td className="p-2 border-l border-zinc-200 text-center text-zinc-300 font-mono text-[10px]">
                              _______________
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Candidate Instructions */}
                {showInstructions && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] text-zinc-700 mb-6 space-y-1">
                    <div className="font-black text-zinc-900 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#084A86]" />
                      Candidate Rules &amp; Examination Regulations:
                    </div>
                    <p>1. The admit card must be presented for verification in the examination hall for every single paper.</p>
                    <p>2. Electronic gadgets, mobile phones, smartwatches, and programmable calculators are strictly prohibited.</p>
                    <p>3. Candidates must report at least 15 minutes before the commencement of the scheduled paper.</p>
                    <p>4. Any candidate caught attempting unfair means or copying will have their paper cancelled immediately.</p>
                  </div>
                )}

                {/* Signatures & Seal Footer */}
                <div className="grid grid-cols-3 gap-8 pt-8 mt-4 border-t border-zinc-200 text-center text-xs">
                  <div>
                    <div className="h-8 border-b border-zinc-400 mx-auto w-36"></div>
                    <div className="font-bold text-zinc-700 mt-1">Candidate Signature</div>
                  </div>
                  <div>
                    <div className="h-8 border-b border-zinc-400 mx-auto w-36"></div>
                    <div className="font-bold text-zinc-700 mt-1">Controller of Exams</div>
                  </div>
                  <div>
                    <div className="h-8 border-b border-zinc-400 mx-auto w-36"></div>
                    <div className="font-bold text-zinc-900 mt-1">Principal / Head of Institution</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
