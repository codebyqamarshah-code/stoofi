'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Search, 
  Printer, 
  LayoutDashboard, 
  Armchair, 
  Users, 
  Building2, 
  CheckCircle2, 
  Shuffle, 
  Tag, 
  FileText 
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
  { _id: 'c-bs-psych', name: 'BS Psychology' },
  { _id: 'c-bs-rit', name: 'BS RIT' },
  { _id: 'c-dpt', name: 'DPT' },
  { _id: 'c-fsc-dental', name: 'FSC Dental' },
  { _id: 'c-fsc-nursing', name: 'FSC NURSING' },
  { _id: 'c-fsc-ott', name: 'FSC OTT' },
];

const DEFAULT_SECTIONS = [
  { _id: 'sec_all', name: 'All Sections' },
  { _id: 'sec1', name: 'Section A' },
  { _id: 'sec2', name: 'Section B' },
  { _id: 'sec3', name: 'Section C' },
  { _id: 'sec4', name: 'Section D' },
];

const DEFAULT_HALLS = [
  { _id: 'h1', name: 'Main Examination Hall A (Capacity: 40)', capacity: 40, rows: 5, cols: 8 },
  { _id: 'h2', name: 'Room 101 - Senior Wing (Capacity: 24)', capacity: 24, rows: 4, cols: 6 },
  { _id: 'h3', name: 'Room 102 - Senior Wing (Capacity: 24)', capacity: 24, rows: 4, cols: 6 },
  { _id: 'h4', name: 'Science Auditorium (Capacity: 60)', capacity: 60, rows: 6, cols: 10 },
  { _id: 'h5', name: 'Computer Lab 1 (Capacity: 30)', capacity: 30, rows: 5, cols: 6 },
];

const SAMPLE_STUDENTS = [
  { _id: 'st1', rollNo: '101', admissionNo: 'STU-001', name: 'Muhammad Ali', class: 'FSC OTT', section: 'A' },
  { _id: 'st2', rollNo: '102', admissionNo: 'STU-002', name: 'Ayesha Fatima', class: 'FSC OTT', section: 'A' },
  { _id: 'st3', rollNo: '103', admissionNo: 'STU-003', name: 'Zainab Bibi', class: 'FSC OTT', section: 'A' },
  { _id: 'st4', rollNo: '104', admissionNo: 'STU-004', name: 'Hamza Farooq', class: 'FSC OTT', section: 'B' },
  { _id: 'st5', rollNo: '105', admissionNo: 'STU-005', name: 'Fatima Noor', class: 'FSC OTT', section: 'B' },
  { _id: 'st6', rollNo: '106', admissionNo: 'STU-006', name: 'Bilal Hussain', class: 'FSC OTT', section: 'A' },
  { _id: 'st7', rollNo: '107', admissionNo: 'STU-007', name: 'Usman Ghani', class: 'FSC OTT', section: 'A' },
  { _id: 'st8', rollNo: '108', admissionNo: 'STU-008', name: 'Hassan Raza', class: 'FSC OTT', section: 'B' },
  { _id: 'st9', rollNo: '109', admissionNo: 'STU-009', name: 'Mariam Tariq', class: 'FSC OTT', section: 'A' },
  { _id: 'st10', rollNo: '110', admissionNo: 'STU-010', name: 'Ahmed Ali Khan', class: 'FSC OTT', section: 'B' },
  { _id: 'st11', rollNo: '111', admissionNo: 'STU-011', name: 'Sara Kamran', class: 'FSC OTT', section: 'A' },
  { _id: 'st12', rollNo: '112', admissionNo: 'STU-012', name: 'Danish Qureshi', class: 'FSC OTT', section: 'B' },
  { _id: 'st13', rollNo: '113', admissionNo: 'STU-013', name: 'Zoya Naveed', class: 'FSC OTT', section: 'A' },
  { _id: 'st14', rollNo: '114', admissionNo: 'STU-014', name: 'Omer Farooq', class: 'FSC OTT', section: 'B' },
  { _id: 'st15', rollNo: '115', admissionNo: 'STU-015', name: 'Khadija Rehman', class: 'FSC OTT', section: 'A' },
  { _id: 'st16', rollNo: '116', admissionNo: 'STU-016', name: 'Sufyan Aslam', class: 'FSC OTT', section: 'A' },
  { _id: 'st17', rollNo: '117', admissionNo: 'STU-017', name: 'Noor ul Huda', class: 'FSC OTT', section: 'B' },
  { _id: 'st18', rollNo: '118', admissionNo: 'STU-018', name: 'Taimoor Shah', class: 'FSC OTT', section: 'A' },
];

export default function SeatPlanPage() {
  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [halls, setHalls] = useState(DEFAULT_HALLS);

  const [formData, setFormData] = useState({ 
    examId: 'e2', 
    classId: 'c10', 
    sectionId: 'sec_all', 
    hallId: 'h1',
    seatingPattern: 'normal' // 'normal' | 'zigzag'
  });

  const [loading, setLoading] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [students, setStudents] = useState([]);
  const [activeView, setActiveView] = useState('chart'); // 'chart' | 'slips'

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

  const handleGenerate = async () => {
    if (!formData.examId || !formData.classId || !formData.hallId) {
      alert('Please select Exam, Class, and Hall.');
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
          class: selectedClass,
          section: st.section || 'A'
        }));
        setStudents(mapped);
      } else {
        setStudents(SAMPLE_STUDENTS);
      }
      setPlanGenerated(true);
    } catch (e) {
      setStudents(SAMPLE_STUDENTS);
      setPlanGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const selectedHall = halls.find(h => h._id === formData.hallId) || DEFAULT_HALLS[0];
  const selectedExam = exams.find(e => e._id === formData.examId)?.name || 'Examination 2026';
  const selectedClass = classes.find(c => c._id === formData.classId)?.name || 'FSC OTT';

  // Build grid seats
  const totalSlots = selectedHall.capacity || 40;
  const seats = Array.from({ length: totalSlots }, (_, index) => {
    const seatNumber = index + 1;
    let student = null;
    if (formData.seatingPattern === 'zigzag') {
      // Alternate seat allocation
      if (index % 2 === 0 && index / 2 < students.length) {
        student = students[index / 2];
      }
    } else {
      if (index < students.length) {
        student = students[index];
      }
    }
    return {
      seatNumber,
      student
    };
  });

  const assignedCount = seats.filter(s => s.student !== null).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #seat-plan-print-area, #seat-plan-print-area * {
            visibility: visible;
          }
          #seat-plan-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 12px;
          }
          .no-print {
            display: none !important;
          }
          .print-slip-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <LayoutDashboard className="h-6 w-6" />
            </span>
            Generate Seat Plan &amp; Desk Slips
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Automate examination hall seat allocation, door display charts, and printable desk slips.
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Exam Plan</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Seat Plan</span>
        </div>
      </div>

      {/* Selection Form */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden no-print">
        <div className="p-4 border-b border-zinc-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Hall &amp; Seating Criteria</h2>
          <span className="text-xs text-zinc-500 font-medium">Select hall room, target class, and seating order</span>
        </div>
        
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase">
                EXAMINATION HALL / ROOM <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect 
                value={formData.hallId} 
                onChange={(val) => setFormData({...formData, hallId: val})}
                placeholder="Select Hall *"
                options={halls.map(h => ({ label: h.name, value: h._id }))}
              />
            </div>
          </div>
          
          <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600">
              <span className="font-bold text-zinc-700">Seating Strategy:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="pattern"
                  checked={formData.seatingPattern === 'normal'}
                  onChange={() => setFormData(f => ({ ...f, seatingPattern: 'normal' }))}
                  className="text-[#084A86] focus:ring-[#084A86]"
                />
                <span>Sequential Roll No</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="pattern"
                  checked={formData.seatingPattern === 'zigzag'}
                  onChange={() => setFormData(f => ({ ...f, seatingPattern: 'zigzag' }))}
                  className="text-[#084A86] focus:ring-[#084A86]"
                />
                <span>Alternate / Anti-Cheating Spacing</span>
              </label>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold uppercase tracking-wider px-7 py-2.5 rounded-xl shadow-md cursor-pointer"
            >
              <Armchair className="h-4 w-4 mr-1.5" />
              {loading ? 'ALLOCATING...' : 'GENERATE SEAT PLAN'}
            </Button>
          </div>
        </div>
      </div>

      {/* Generated Seat Plan View */}
      {planGenerated && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3">
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActiveView('chart')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeView === 'chart' 
                      ? 'bg-white text-zinc-950 shadow-xs' 
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Hall Seating Chart
                </button>
                <button
                  onClick={() => setActiveView('slips')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeView === 'slips' 
                      ? 'bg-white text-zinc-950 shadow-xs' 
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Printable Desk Slips
                </button>
              </div>

              <div className="text-xs text-zinc-500 font-medium">
                Allocated: <span className="font-bold text-[#084A86]">{assignedCount}</span> / {totalSlots} Desks
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrint}
                className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold px-6 py-2 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>PRINT {activeView === 'chart' ? 'HALL SEATING CHART' : 'DESK SLIPS'}</span>
              </Button>
            </div>
          </div>

          {/* PRINTABLE CONTAINER */}
          <div id="seat-plan-print-area">
            {/* VIEW 1: HALL SEATING CHART */}
            {activeView === 'chart' && (
              <div className="bg-white border-2 border-zinc-900 rounded-2xl p-6 sm:p-8 shadow-sm">
                {/* Official Header */}
                <div className="text-center border-b-2 border-zinc-900 pb-4 mb-6">
                  <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">STOOFI ACADEMY &amp; GRAMMAR SCHOOL</h2>
                  <h3 className="text-sm font-bold text-[#084A86] uppercase tracking-wider mt-0.5">
                    EXAMINATION SEATING CHART &bull; {selectedExam}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-600 font-bold mt-2">
                    <span>ROOM / HALL: <strong className="text-zinc-950">{selectedHall.name}</strong></span>
                    <span>CLASS: <strong className="text-zinc-950">{selectedClass}</strong></span>
                    <span>TOTAL CANDIDATES: <strong className="text-zinc-950">{assignedCount}</strong></span>
                    <span>DATE GENERATED: <strong className="text-zinc-950">{new Date().toLocaleDateString()}</strong></span>
                  </div>
                </div>

                {/* Whiteboard / Invigilator Podium Indicator */}
                <div className="mb-6 p-2 rounded-lg bg-zinc-900 text-white text-center text-xs font-black uppercase tracking-widest">
                  &bull; BLACKBOARD / ROSTRUM / INVIGILATOR DESK (FRONT OF HALL) &bull;
                </div>

                {/* Seating Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3.5 mb-8">
                  {seats.map((seat) => (
                    <div 
                      key={seat.seatNumber}
                      className={`p-3 rounded-xl border-2 flex flex-col justify-between min-h-[95px] transition-all ${
                        seat.student 
                          ? 'border-zinc-800 bg-sky-50/40 shadow-xs' 
                          : 'border-dashed border-zinc-300 bg-zinc-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-1 mb-1.5">
                        <span className="text-[10px] font-black uppercase text-zinc-500">
                          SEAT #{String(seat.seatNumber).padStart(2, '0')}
                        </span>
                        {seat.student && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#084A86] text-white">
                            #{seat.student.rollNo}
                          </span>
                        )}
                      </div>

                      {seat.student ? (
                        <div>
                          <div className="font-bold text-xs text-zinc-950 truncate leading-tight">
                            {seat.student.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                            {seat.student.class} ({seat.student.section})
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-400 font-bold text-center py-2 uppercase">
                          Vacant
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-zinc-900 text-center text-xs font-bold">
                  <div>
                    <div className="h-8 border-b border-zinc-400 mx-auto w-36"></div>
                    <div className="mt-1">Chief Hall Superintendent</div>
                  </div>
                  <div>
                    <div className="h-8 border-b border-zinc-400 mx-auto w-36"></div>
                    <div className="mt-1">Room Invigilator</div>
                  </div>
                  <div>
                    <div className="h-8 border-b border-zinc-400 mx-auto w-36"></div>
                    <div className="mt-1">Principal / Controller</div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: PRINTABLE DESK SLIPS */}
            {activeView === 'slips' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {seats.filter(s => s.student !== null).map((seat) => (
                  <div
                    key={seat.seatNumber}
                    className="print-slip-break bg-white border-2 border-zinc-900 rounded-xl p-4 relative overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <img src="/logo.png" alt="" className="h-6 w-auto object-contain" />
                        <span className="text-[11px] font-black uppercase text-zinc-900 tracking-tight">STOOFI ACADEMY</span>
                      </div>
                      <span className="px-2 py-0.5 bg-[#084A86] text-white text-[10px] font-black rounded">
                        SEAT #{String(seat.seatNumber).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs mb-3">
                      <div className="text-[10px] uppercase font-bold text-zinc-400">EXAM CANDIDATE DESK LABEL</div>
                      <div className="font-black text-sm text-zinc-950 truncate">{seat.student.name}</div>
                      <div className="flex items-center gap-3 text-xs font-mono font-bold text-zinc-700">
                        <span>ROLL: <strong className="text-zinc-950">#{seat.student.rollNo}</strong></span>
                        <span>ADM: {seat.student.admissionNo}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-zinc-600">
                        {seat.student.class} &bull; Section {seat.student.section}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-dashed border-zinc-300 flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                      <span>{selectedExam}</span>
                      <span>{selectedHall.name.split('(')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
