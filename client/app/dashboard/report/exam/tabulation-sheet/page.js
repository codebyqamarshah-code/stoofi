'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, FileSpreadsheet, 
  Award, School, RefreshCw, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CLASSES = ['FSC OTT', 'BS Psychology', 'BS RIT', 'FSC Nursing', 'DPT', 'FSC Dental'];
const EXAM_TERMS = ['Final Examination 2026', 'Mid Term 2026', 'First Term 2026', 'Annual Board Prep 2026'];

export default function TabulationSheetReportPage() {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('FSC OTT');
  const [selectedExam, setSelectedExam] = useState('Final Examination 2026');
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTabulationData = async () => {
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
      console.error('Failed to load tabulation sheet:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabulationData();
  }, [selectedClass, selectedExam]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = [
      'Pos', 'Roll No', 'Reg / Adm No', 'Candidate Name', 'Father Name', 'Class',
      ...subjects.map(s => `${s.code} (${s.maxMarks})`),
      'Grand Total', 'Max Marks', 'Percentage %', 'GPA', 'Grade', 'Result Status'
    ];
    const rows = records.map(r => [
      r.position,
      r.rollNo,
      r.admissionNo,
      `"${r.name}"`,
      `"${r.fatherName}"`,
      r.className,
      ...r.subjects.map(s => s.obtained),
      r.grandTotal,
      r.maxGrandTotal,
      `${r.percentage}%`,
      r.gpa,
      r.overallGrade,
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TabulationSheet_${selectedClass}_${selectedExam}.csv`);
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
            <span className="text-[#084A86] font-bold">Tabulation Sheet</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <FileSpreadsheet className="h-6 w-6 text-[#084A86]" />
            Official Broad-Sheet Tabulation Register
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Master cross-subject examination record, grade ledger, and statutory result broadsheet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-xs font-semibold h-9 border-zinc-200 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-[#084A86]" /> Export Broadsheet
          </Button>
          <Button
            onClick={handlePrint}
            size="sm"
            className="text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Tabulation Sheet
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
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
            <Label className="text-xs font-bold text-zinc-600 uppercase">Search Candidate</Label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search name, roll no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchTabulationData()}
                className="pl-8 text-xs bg-zinc-50 border-zinc-200 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={fetchTabulationData}
              className="w-full text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white flex items-center justify-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" /> Filter Broadsheet
            </Button>
          </div>
        </div>
      </div>

      {/* Tabulation Broadsheet Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden print:border-none print:shadow-none">
        {/* Printable Official College Header */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 print:bg-white text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <School className="h-6 w-6 text-[#084A86]" />
            <h2 className="text-xl font-black text-zinc-950 uppercase tracking-wide">
              Pak Royal College Sharaqpur Sharif
            </h2>
          </div>
          <p className="text-xs font-bold text-[#084A86] uppercase tracking-wider">
            Examination Tabulation Broadsheet Register
          </p>
          <div className="inline-flex items-center gap-3 text-[11px] text-zinc-600 pt-1 font-medium">
            <span><strong>Program:</strong> {selectedClass}</span>
            <span>•</span>
            <span><strong>Term:</strong> {selectedExam}</span>
            <span>•</span>
            <span><strong>Candidates:</strong> {records.length}</span>
            <span>•</span>
            <span><strong>Pass Rate:</strong> {metrics ? `${metrics.passRate}%` : '---'}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead className="uppercase font-black text-zinc-600 bg-zinc-100 border-b border-zinc-300">
              <tr>
                <th className="px-2 py-2.5 text-center border-r border-zinc-200">Pos</th>
                <th className="px-2.5 py-2.5 border-r border-zinc-200">Roll No</th>
                <th className="px-2.5 py-2.5 border-r border-zinc-200">Adm No</th>
                <th className="px-3 py-2.5 border-r border-zinc-200 min-w-[130px]">Candidate Name</th>
                <th className="px-3 py-2.5 border-r border-zinc-200 min-w-[120px]">Father Name</th>
                {subjects.map((sub, i) => (
                  <th key={i} className="px-2 py-2.5 text-center border-r border-zinc-200 min-w-[70px]">
                    <div className="font-extrabold text-zinc-800">{sub.code}</div>
                    <div className="text-[9px] text-zinc-500 font-normal">Max {sub.maxMarks}</div>
                  </th>
                ))}
                <th className="px-2.5 py-2.5 text-center border-r border-zinc-200">Total</th>
                <th className="px-2.5 py-2.5 text-center border-r border-zinc-200">%</th>
                <th className="px-2 py-2.5 text-center border-r border-zinc-200">GPA</th>
                <th className="px-2 py-2.5 text-center border-r border-zinc-200">Grade</th>
                <th className="px-2.5 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={10 + subjects.length} className="px-4 py-12 text-center text-zinc-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#084A86]" />
                    Compiling broadsheet tabulation data...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10 + subjects.length} className="px-4 py-12 text-center text-zinc-400">
                    No examination records found for selected criteria.
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <tr key={r.studentId || idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-2 py-2 text-center border-r border-zinc-200 font-black text-zinc-900">
                      {r.position}
                    </td>
                    <td className="px-2.5 py-2 font-mono font-bold text-zinc-900 border-r border-zinc-200">
                      {r.rollNo}
                    </td>
                    <td className="px-2.5 py-2 font-mono text-zinc-500 border-r border-zinc-200">
                      {r.admissionNo}
                    </td>
                    <td className="px-3 py-2 font-extrabold text-zinc-950 border-r border-zinc-200">
                      {r.name}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 border-r border-zinc-200">
                      {r.fatherName}
                    </td>
                    {subjects.map((sub, sIdx) => {
                      const studentSub = r.subjects.find(s => s.code === sub.code);
                      const score = studentSub ? studentSub.obtained : '-';
                      const isPassing = studentSub ? studentSub.obtained >= Math.round(sub.maxMarks * 0.4) : true;
                      return (
                        <td 
                          key={sIdx} 
                          className={`px-2 py-2 text-center border-r border-zinc-200 font-bold ${
                            !isPassing ? 'text-rose-600 bg-rose-50/50' : 'text-zinc-900'
                          }`}
                        >
                          {score}
                        </td>
                      );
                    })}
                    <td className="px-2.5 py-2 text-center font-black text-zinc-950 border-r border-zinc-200 bg-zinc-50/50">
                      {r.grandTotal}
                    </td>
                    <td className="px-2.5 py-2 text-center font-bold text-zinc-900 border-r border-zinc-200">
                      {r.percentage}%
                    </td>
                    <td className="px-2 py-2 text-center font-bold text-zinc-700 border-r border-zinc-200">
                      {r.gpa}
                    </td>
                    <td className="px-2 py-2 text-center border-r border-zinc-200">
                      <span className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
                        r.overallGrade.startsWith('A') ? 'bg-emerald-100 text-emerald-800' :
                        r.overallGrade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                        r.overallGrade.startsWith('C') ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {r.overallGrade}
                      </span>
                    </td>
                    <td className="px-2.5 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 font-extrabold text-[10px] ${
                        r.status === 'Passed' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {r.status === 'Passed' ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-rose-600" />
                        )}
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Broadsheet Signatures */}
        <div className="grid grid-cols-4 gap-6 p-8 border-t border-zinc-200 text-center text-xs">
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Assistant Tabulator
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Senior Tabulator
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            In-Charge Result Verification
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Controller of Examinations
          </div>
        </div>
      </div>
    </div>
  );
}
