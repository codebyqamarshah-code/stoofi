'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, Monitor, 
  CheckCircle2, XCircle, Clock, Award, School, RefreshCw, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CLASSES = ['FSC OTT', 'BS Psychology', 'BS RIT', 'FSC Nursing', 'DPT', 'FSC Dental'];
const EXAM_CODES = [
  { code: 'CBT-2026-OTT-01', title: 'CBT Mid-Term Assessment — Medical Fundamentals' },
  { code: 'CBT-2026-OTT-02', title: 'CBT Online Quiz — Surgical Anatomy & Sterile Tech' },
  { code: 'CBT-2026-OTT-03', title: 'CBT Mock Exam — Clinical Pharmacology' }
];

export default function OnlineExamReportPage() {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('FSC OTT');
  const [selectedExamCode, setSelectedExamCode] = useState('CBT-2026-OTT-01');
  const [records, setRecords] = useState([]);
  const [examMeta, setExamMeta] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOnlineExamData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.set('className', selectedClass);
      if (selectedExamCode) params.set('examCode', selectedExamCode);

      const res = await fetch(`/api/report/exam/online-exam?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data || []);
        setExamMeta(json.examMeta || null);
        setMetrics(json.metrics || null);
      }
    } catch (e) {
      console.error('Failed to load online exam report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineExamData();
  }, [selectedClass, selectedExamCode]);

  const filteredRecords = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.studentName.toLowerCase().includes(q) ||
      r.rollNo.toLowerCase().includes(q) ||
      r.admissionNo.toLowerCase().includes(q)
    );
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Roll No', 'Admission No', 'Student Name', 'Class', 'Correct Qs', 'Wrong Qs', 'Score Obtained', 'Max Marks', 'Percentage %', 'Time Taken (Mins)', 'Status', 'Submitted At'];
    const rows = filteredRecords.map(r => [
      r.rollNo,
      r.admissionNo,
      `"${r.studentName}"`,
      r.className,
      r.correctAnswers,
      r.wrongAnswers,
      r.score,
      r.totalMarks,
      `${r.percentage}%`,
      r.timeTakenMinutes,
      r.status,
      `"${r.submittedAt}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OnlineCBTReport_${selectedClass}_${selectedExamCode}.csv`);
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
            <span className="text-[#084A86] font-bold">Online Exam Report</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <Monitor className="h-6 w-6 text-[#084A86]" />
            Computer-Based Test (CBT) Examination Logs
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time digital quiz submissions, objective scoring, time elapsed, and pass verification
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
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print CBT Audit
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
            <Label className="text-xs font-bold text-zinc-600 uppercase">CBT Online Assessment</Label>
            <select
              value={selectedExamCode}
              onChange={(e) => setSelectedExamCode(e.target.value)}
              className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              {EXAM_CODES.map((ec) => (
                <option key={ec.code} value={ec.code}>{ec.code} - {ec.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-600 uppercase">Search Candidate</Label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search candidate name or roll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs bg-zinc-50 border-zinc-200 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={fetchOnlineExamData}
              className="w-full text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Load CBT Logs
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 print:hidden">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Candidates</span>
            <p className="text-xl font-black text-zinc-950 mt-0.5">{metrics.totalCandidates}</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">Passed</span>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{metrics.passedCount}</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-rose-600 uppercase">Failed</span>
            <p className="text-xl font-black text-rose-700 mt-0.5">{metrics.failedCount}</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-[#084A86] uppercase">Average Score</span>
            <p className="text-xl font-black text-[#084A86] mt-0.5">{metrics.avgScore} / 100</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-indigo-600 uppercase">Pass Rate %</span>
            <p className="text-xl font-black text-indigo-700 mt-0.5">{metrics.passPercentage}%</p>
          </div>
        </div>
      )}

      {/* Main Table */}
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
            Computer-Based Testing (CBT) Center Examination Audit Ledger
          </p>
          {examMeta && (
            <div className="inline-flex items-center gap-3 text-[11px] text-zinc-600 pt-1 font-medium">
              <span><strong>Paper:</strong> {examMeta.title}</span>
              <span>•</span>
              <span><strong>Code:</strong> {examMeta.examCode}</span>
              <span>•</span>
              <span><strong>Max:</strong> {examMeta.totalMarks} Marks</span>
              <span>•</span>
              <span><strong>Passing:</strong> {examMeta.passingMarks}</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase font-black text-zinc-600 bg-zinc-100/80 border-b border-zinc-200">
              <tr>
                <th className="px-3.5 py-3">Roll No</th>
                <th className="px-3.5 py-3">Adm No</th>
                <th className="px-4 py-3">Candidate Name</th>
                <th className="px-3.5 py-3 text-center">Correct</th>
                <th className="px-3.5 py-3 text-center">Wrong</th>
                <th className="px-3.5 py-3 text-center">Obtained Score</th>
                <th className="px-3.5 py-3 text-center">Percentage %</th>
                <th className="px-4 py-3">Time Taken</th>
                <th className="px-3.5 py-3 text-center">Status</th>
                <th className="px-4 py-3">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#084A86]" />
                    Retrieving CBT submission audit logs...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-400">
                    No CBT attempt records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-3.5 py-3 font-mono font-bold text-zinc-900">{r.rollNo}</td>
                    <td className="px-3.5 py-3 font-mono text-zinc-500">{r.admissionNo}</td>
                    <td className="px-4 py-3 font-extrabold text-zinc-950">{r.studentName}</td>
                    <td className="px-3.5 py-3 text-center font-bold text-emerald-700">
                      {r.correctAnswers} / {r.totalQuestions}
                    </td>
                    <td className="px-3.5 py-3 text-center font-bold text-rose-600">
                      {r.wrongAnswers}
                    </td>
                    <td className="px-3.5 py-3 text-center font-black text-zinc-950">
                      {r.score} / {r.totalMarks}
                    </td>
                    <td className="px-3.5 py-3 text-center font-black text-[#084A86]">
                      {r.percentage}%
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3 text-zinc-400" /> {r.timeTakenMinutes} mins
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black ${
                        r.status === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.status === 'Passed' ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-rose-600" />
                        )}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">{r.submittedAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signatures */}
        <div className="grid grid-cols-3 gap-6 p-8 border-t border-zinc-200 text-center text-xs">
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            CBT Lab Proctor
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Systems Administrator
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Controller of Examinations
          </div>
        </div>
      </div>
    </div>
  );
}
