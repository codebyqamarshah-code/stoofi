'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, Percent, 
  Award, School, RefreshCw, CheckCircle2, User, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CLASSES = ['FSC OTT', 'BS Psychology', 'BS RIT', 'FSC Nursing', 'DPT', 'FSC Dental'];
const EXAM_TERMS = ['Final Examination 2026', 'Mid Term 2026', 'First Term 2026', 'Annual Board Prep 2026'];

export default function ProgressCardReport100PercentPage() {
  const [selectedClass, setSelectedClass] = useState('FSC OTT');
  const [selectedExam, setSelectedExam] = useState('Final Examination 2026');
  const [records, setRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.set('className', selectedClass);
      if (selectedExam) params.set('examTerm', selectedExam);

      const res = await fetch(`/api/report/exam/data?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data || []);
        if (json.data && json.data.length > 0) {
          setSelectedStudent(json.data[0]);
        } else {
          setSelectedStudent(null);
        }
      }
    } catch (e) {
      console.error('Failed to load normalized progress card data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClass, selectedExam]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Rank', 'Roll No', 'Admission No', 'Student Name', 'Father Name', 'Class', 'Normalized Aggregate %', 'Equivalence GPA', 'Overall Grade', 'Status'];
    const rows = records.map(r => [
      r.position,
      r.rollNo,
      r.admissionNo,
      `"${r.name}"`,
      `"${r.fatherName}"`,
      r.className,
      `${r.percentage}%`,
      r.gpa,
      r.overallGrade,
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NormalizedTranscript_100Scale_${selectedClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/dashboard/report/exam" className="hover:text-zinc-600">Exam Report</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#084A86] font-bold">Progress Card (100% Scale)</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <Percent className="h-6 w-6 text-[#084A86]" />
            Standardized 100% Scale Progress Transcript
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Normalized 100-point course scaling and board equivalence transcript format
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-xs font-semibold h-9 border-zinc-200 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-[#084A86]" /> Export CSV
          </Button>
          <Button
            onClick={handlePrint}
            size="sm"
            className="text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Transcript
          </Button>
        </div>
      </div>

      {/* Selector & Criteria Bar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-600 uppercase">Class / Program</Label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-600 uppercase">Examination Term</Label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              {EXAM_TERMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-600 uppercase">Select Candidate</Label>
            <select
              value={selectedStudent?.rollNo || ''}
              onChange={(e) => {
                const found = records.find(r => r.rollNo === e.target.value);
                if (found) setSelectedStudent(found);
              }}
              className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              {records.map((r) => (
                <option key={r.rollNo} value={r.rollNo}>
                  Roll {r.rollNo} - {r.name} ({r.percentage}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Standardized 100% Transcript Card */}
      {loading ? (
        <div className="p-16 bg-white border border-zinc-200/80 rounded-2xl text-center text-zinc-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#084A86]" />
          Normalizing scores to 100% scale...
        </div>
      ) : !selectedStudent ? (
        <div className="p-16 bg-white border border-zinc-200/80 rounded-2xl text-center text-zinc-400">
          No student record selected.
        </div>
      ) : (
        <div className="bg-white border-2 border-zinc-300 rounded-2xl shadow-md overflow-hidden max-w-4xl mx-auto print:border print:border-zinc-400 print:shadow-none print:max-w-none">
          {/* Header */}
          <div className="p-6 border-b-2 border-zinc-200 bg-zinc-50/70 print:bg-white text-center space-y-1.5">
            <div className="flex items-center justify-center gap-3">
              <School className="h-8 w-8 text-[#084A86]" />
              <div>
                <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-wide">
                  Pak Royal College Sharaqpur Sharif
                </h2>
                <p className="text-[11px] font-bold text-[#084A86] uppercase tracking-wider">
                  Academic Evaluation &amp; Equivalence Directorate
                </p>
              </div>
            </div>
            <div className="pt-2">
              <span className="inline-block bg-zinc-900 text-white px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-xs">
                Standardized 100% Scale Academic Transcript
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-semibold">{selectedExam} • Normalized Evaluation Matrix</p>
          </div>

          {/* Student Dossier */}
          <div className="p-6 bg-zinc-50/30 border-b border-zinc-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Student Name</span>
              <p className="font-extrabold text-sm text-zinc-950 mt-0.5">{selectedStudent.name}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Father Name</span>
              <p className="font-bold text-zinc-900 mt-0.5">{selectedStudent.fatherName}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Roll Number</span>
              <p className="font-mono font-black text-sm text-[#084A86] mt-0.5">{selectedStudent.rollNo}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Class &amp; Standing</span>
              <p className="font-black text-amber-700 mt-0.5">Rank #{selectedStudent.position} ({selectedStudent.className})</p>
            </div>
          </div>

          {/* Normalized 100% Course Table */}
          <div className="p-6 space-y-4">
            <div className="overflow-x-auto border border-zinc-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100/80 text-[10px] uppercase font-black text-zinc-600 border-b border-zinc-200">
                  <tr>
                    <th className="px-3 py-2.5">Code</th>
                    <th className="px-4 py-2.5">Course Title</th>
                    <th className="px-3 py-2.5 text-center">Raw Marks</th>
                    <th className="px-3 py-2.5 text-center">Max Base</th>
                    <th className="px-4 py-2.5 text-center bg-zinc-200/60 font-black">Normalized (100%)</th>
                    <th className="px-3 py-2.5 text-center">Quality Pts</th>
                    <th className="px-3 py-2.5 text-center">Letter Grade</th>
                    <th className="px-3 py-2.5 text-center">Equivalence Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-800">
                  {selectedStudent.subjects.map((s, idx) => {
                    const normalized = Math.round((s.obtained / s.maxMarks) * 100);
                    const qPoints = (normalized * 0.04).toFixed(2);
                    return (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="px-3 py-2.5 font-mono font-bold text-zinc-700">{s.code}</td>
                        <td className="px-4 py-2.5 font-bold text-zinc-900">{s.name}</td>
                        <td className="px-3 py-2.5 text-center text-zinc-600">{s.obtained}</td>
                        <td className="px-3 py-2.5 text-center text-zinc-400">{s.maxMarks}</td>
                        <td className="px-4 py-2.5 text-center font-black text-sm bg-zinc-50 text-[#084A86]">
                          {normalized} / 100
                        </td>
                        <td className="px-3 py-2.5 text-center font-semibold text-zinc-700">{qPoints}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                            s.grade.startsWith('A') ? 'bg-emerald-100 text-emerald-800' :
                            s.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                            'bg-zinc-100 text-zinc-800'
                          }`}>
                            {s.grade}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center text-[10px] font-bold text-emerald-700">
                          Satisfied
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-zinc-100/90 font-black text-zinc-950 border-t-2 border-zinc-300">
                  <tr>
                    <td colSpan="4" className="px-4 py-2.5 text-right uppercase text-[11px]">Normalized Cohort Aggregate:</td>
                    <td className="px-4 py-2.5 text-center text-sm text-[#084A86] bg-zinc-200/60 font-black">
                      {selectedStudent.percentage}% (100 Scale)
                    </td>
                    <td className="px-3 py-2.5 text-center text-amber-700">GPA {selectedStudent.gpa}</td>
                    <td className="px-3 py-2.5 text-center text-emerald-700">{selectedStudent.overallGrade}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-emerald-700 font-extrabold">{selectedStudent.status}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Official Certification Note */}
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600 leading-relaxed">
              <strong className="text-zinc-900">Statutory Notice:</strong> This 100-point normalized progress report is computed pursuant to standardized Pakistani college criteria. Any alteration, erasure, or unauthorized tampering renders this document void.
            </div>

            {/* Official Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs">
              <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
                Prepared By (Registrar)
              </div>
              <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
                In-Charge Academic Equivalence
              </div>
              <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
                Controller of Examinations
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
