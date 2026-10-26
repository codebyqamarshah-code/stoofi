'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, FileText, 
  Award, RefreshCw, Trophy, CheckCircle2, AlertCircle, BookOpen, School, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CLASSES = ['FSC OTT', 'BS Psychology', 'BS RIT', 'FSC Nursing', 'DPT', 'FSC Dental'];
const EXAM_TERMS = ['Final Examination 2026', 'Mid Term 2026', 'First Term 2026', 'Annual Board Prep 2026'];

export default function ExamMarkSheetReportPage() {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('FSC OTT');
  const [selectedExam, setSelectedExam] = useState('Final Examination 2026');
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMarkSheet = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedClass) params.set('className', selectedClass);
      if (selectedExam) params.set('examTerm', selectedExam);

      const res = await fetch(`/api/report/exam/data?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data || []);
        setSubjects(json.subjects || []);
        setMetrics(json.metrics || null);
      }
    } catch (e) {
      console.error('Failed to load exam mark sheet:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkSheet();
  }, [selectedClass, selectedExam]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Position', 'Roll No', 'Admission No', 'Student Name', 'Father Name', 'Class', 'Section', ...subjects.map(s => s.code), 'Grand Total', 'Max Marks', 'Percentage %', 'Grade', 'Result Status'];
    const rows = records.map(r => [
      r.position,
      r.rollNo,
      r.admissionNo,
      `"${r.name}"`,
      `"${r.fatherName}"`,
      r.className,
      r.section,
      ...r.subjects.map(s => s.obtained),
      r.grandTotal,
      r.maxGrandTotal,
      `${r.percentage}%`,
      r.overallGrade,
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MarkSheet_${selectedClass}_${selectedExam}.csv`);
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
            <span className="text-[#084A86] font-bold">Mark Sheet Report</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <Award className="h-6 w-6 text-[#084A86]" />
            Official Examination Mark Sheet Gazette
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Subject-wise examination scores, class merit ranking, and grading ledger • Pak Royal College Sharaqpur
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
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Official Gazette
          </Button>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6 text-center">
        <h2 className="text-xl font-black uppercase tracking-wider text-zinc-950">PAK ROYAL COLLEGE SHARAQPUR SHARIF</h2>
        <p className="text-xs text-zinc-600 font-medium">Affiliated with PBTE, Punjab University &amp; Pharmacy Council of Pakistan</p>
        <h3 className="text-sm font-bold text-zinc-900 mt-2 uppercase tracking-wide underline">
          Official Examination Mark Sheet Ledger — {selectedClass} ({selectedExam})
        </h3>
      </div>

      {/* Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Class Pass Percentage</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {metrics.passPercentage}%
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              {metrics.passedCount} Passed / {metrics.totalStudents} Candidates
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Class Average Score</span>
            <span className="text-2xl font-black text-zinc-950 mt-1 block">
              {metrics.classAverage}%
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              Normalized score benchmark
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Highest Score in Class</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {metrics.highestMarks} / 500
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              1st Merit Position
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Reappear / Failed</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {metrics.failedCount} Students
            </span>
            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">
              Supplementary evaluation
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs print:hidden space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs font-bold text-zinc-700">Academic Program / Class</Label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 font-semibold text-zinc-800"
            >
              {CLASSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Exam Term</Label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full mt-1 text-xs h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 font-semibold text-zinc-800"
            >
              {EXAM_TERMS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs font-bold text-zinc-700">Search Candidate</Label>
            <div className="flex items-center gap-1.5 mt-1">
              <Input
                type="text"
                placeholder="Search by student name or roll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMarkSheet()}
                className="text-xs h-9 bg-zinc-50 border-zinc-200"
              />
              <Button
                size="sm"
                onClick={fetchMarkSheet}
                className="h-9 px-3 bg-[#084A86] hover:bg-[#073d6e] text-white shrink-0 text-xs"
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mark Sheet Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-zinc-900">
              {selectedClass} — Examination Candidates ({records.length} Students)
            </span>
          </div>
          {loading && <RefreshCw className="h-4 w-4 animate-spin text-[#084A86]" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-600 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-3 text-center">Rank</th>
                <th className="px-3 py-3">Roll No</th>
                <th className="px-3 py-3">Student Name</th>
                {subjects.map(s => (
                  <th key={s.code} className="px-2 py-3 text-center">
                    <span className="block truncate max-w-[90px]" title={s.name}>{s.code}</span>
                    <span className="text-[9px] text-zinc-400 block font-normal">({s.maxMarks})</span>
                  </th>
                ))}
                <th className="px-3 py-3 text-right">Total</th>
                <th className="px-3 py-3 text-right">Percentage</th>
                <th className="px-3 py-3 text-center">Grade</th>
                <th className="px-3 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7 + subjects.length} className="px-4 py-12 text-center text-zinc-500 font-medium">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#084A86] mb-2" />
                    Calculating official marks and merit rankings...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7 + subjects.length} className="px-4 py-12 text-center text-zinc-500">
                    No student marks found for selected class.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-3 py-3 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                        r.position === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        r.position === 2 ? 'bg-zinc-200 text-zinc-800' :
                        r.position === 3 ? 'bg-orange-100 text-orange-900' :
                        'text-zinc-500'
                      }`}>
                        {r.position}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-zinc-700">{r.rollNo}</td>
                    <td className="px-3 py-3">
                      <div className="font-extrabold text-zinc-950">{r.name}</div>
                      <div className="text-[10px] text-zinc-400">S/D/O {r.fatherName}</div>
                    </td>
                    {r.subjects.map((sub, sIdx) => (
                      <td key={sIdx} className="px-2 py-3 text-center font-bold">
                        <span className={sub.obtained < 50 ? 'text-rose-600 font-black' : 'text-zinc-800'}>
                          {sub.obtained}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-3 text-right font-black text-zinc-950 text-sm">
                      {r.grandTotal}
                    </td>
                    <td className="px-3 py-3 text-right font-black text-zinc-800">
                      {r.percentage}%
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                        r.overallGrade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                        r.overallGrade === 'A' ? 'bg-blue-100 text-blue-800' :
                        r.overallGrade === 'B' ? 'bg-zinc-100 text-zinc-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {r.overallGrade}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures Section for Printing */}
      <div className="hidden print:grid grid-cols-3 gap-8 pt-16 mt-8 border-t border-zinc-300 text-xs text-center font-bold text-zinc-800">
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Tabulator / Incharge</div>
          <span className="text-[10px] text-zinc-500">Examination Branch</span>
        </div>
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Controller of Examinations</div>
          <span className="text-[10px] text-zinc-500">College Board &amp; University Affairs</span>
        </div>
        <div>
          <div className="border-b border-zinc-400 pb-1 mb-1">Principal / Head of Institution</div>
          <span className="text-[10px] text-zinc-500">Pak Royal College Sharaqpur</span>
        </div>
      </div>
    </div>
  );
}
