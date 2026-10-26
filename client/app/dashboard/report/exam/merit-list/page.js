'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, Trophy, Award, 
  Medal, Star, GraduationCap, CheckCircle2, RefreshCw, School, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CLASSES = ['FSC OTT', 'BS Psychology', 'BS RIT', 'FSC Nursing', 'DPT', 'FSC Dental'];
const EXAM_TERMS = ['Final Examination 2026', 'Mid Term 2026', 'First Term 2026', 'Annual Board Prep 2026'];

export default function MeritListReportPage() {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('FSC OTT');
  const [selectedExam, setSelectedExam] = useState('Final Examination 2026');
  const [records, setRecords] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMeritList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedClass) params.set('className', selectedClass);
      if (selectedExam) params.set('examTerm', selectedExam);

      const res = await fetch(`/api/report/exam/data?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        // Sort explicitly by rank/percentage descending
        const sorted = (json.data || []).sort((a, b) => b.percentage - a.percentage);
        setRecords(sorted);
        setMetrics(json.metrics || null);
      }
    } catch (e) {
      console.error('Failed to load merit list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeritList();
  }, [selectedClass, selectedExam]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Merit Rank', 'Roll No', 'Admission No', 'Student Name', 'Father Name', 'Class', 'Total Obtained', 'Max Marks', 'Percentage %', 'GPA', 'Grade', 'Honors / Distinction'];
    const rows = records.map((r, idx) => [
      idx + 1,
      r.rollNo,
      r.admissionNo,
      `"${r.name}"`,
      `"${r.fatherName}"`,
      r.className,
      r.grandTotal,
      r.maxGrandTotal,
      `${r.percentage}%`,
      r.gpa,
      r.overallGrade,
      r.percentage >= 80 ? 'Distinction' : r.percentage >= 70 ? 'First Class' : 'Pass'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MeritList_${selectedClass}_${selectedExam}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const top1 = records[0];
  const top2 = records[1];
  const top3 = records[2];

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
            <span className="text-[#084A86] font-bold">Merit List Report</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <Trophy className="h-6 w-6 text-amber-500" />
            Academic Merit &amp; Position List
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Official class rankings, distinction awards, and honors roll • Pak Royal College Sharaqpur
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
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Merit Register
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
              <option value="">All Academic Programs</option>
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
                placeholder="Search name or roll no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMeritList()}
                className="pl-8 text-xs bg-zinc-50 border-zinc-200 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={fetchMeritList}
              className="w-full text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white flex items-center justify-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" /> Filter Merit
            </Button>
            <Button
              onClick={() => { setSearch(''); setSelectedClass('FSC OTT'); setSelectedExam('Final Examination 2026'); }}
              variant="outline"
              size="icon"
              className="h-9 w-9 border-zinc-200"
              title="Reset Filters"
            >
              <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {records.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
          {/* Silver - 2nd */}
          {top2 && (
            <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Medal className="h-4 w-4 text-slate-400" /> 2nd Position (Silver)
                </span>
                <span className="text-lg font-black text-slate-700">{top2.percentage}%</span>
              </div>
              <div className="my-3 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-700 mx-auto flex items-center justify-center font-black text-lg border-2 border-slate-300">
                  2
                </div>
                <h4 className="font-extrabold text-zinc-950 mt-2 text-sm">{top2.name}</h4>
                <p className="text-xs text-zinc-500">S/O {top2.fatherName}</p>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">Roll: {top2.rollNo}</p>
              </div>
              <div className="text-xs bg-slate-100/70 rounded-xl p-2.5 flex justify-between font-medium text-slate-700">
                <span>Marks: <strong>{top2.grandTotal}</strong>/{top2.maxGrandTotal}</span>
                <span>GPA: <strong>{top2.gpa}</strong></span>
              </div>
            </div>
          )}

          {/* Gold - 1st */}
          {top1 && (
            <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between transform md:-translate-y-2">
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-xs">
                🏆 Class Champion
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-amber-500" /> 1st Position (Gold)
                </span>
                <span className="text-xl font-black text-amber-700">{top1.percentage}%</span>
              </div>
              <div className="my-3 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center font-black text-xl border-2 border-amber-400 shadow-inner">
                  1
                </div>
                <h4 className="font-black text-zinc-950 mt-2 text-base">{top1.name}</h4>
                <p className="text-xs text-zinc-600">S/O {top1.fatherName}</p>
                <p className="text-[11px] font-mono text-amber-800 font-semibold mt-0.5">Roll: {top1.rollNo}</p>
              </div>
              <div className="text-xs bg-amber-100/80 rounded-xl p-2.5 flex justify-between font-bold text-amber-900 border border-amber-200">
                <span>Total: <strong>{top1.grandTotal}</strong>/{top1.maxGrandTotal}</span>
                <span>GPA: <strong>{top1.gpa}</strong></span>
                <span className="text-emerald-700">Grade: {top1.overallGrade}</span>
              </div>
            </div>
          )}

          {/* Bronze - 3rd */}
          {top3 && (
            <div className="bg-gradient-to-b from-amber-50/40 to-white border border-amber-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <Medal className="h-4 w-4 text-amber-700" /> 3rd Position (Bronze)
                </span>
                <span className="text-lg font-black text-amber-800">{top3.percentage}%</span>
              </div>
              <div className="my-3 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center font-black text-lg border-2 border-amber-300">
                  3
                </div>
                <h4 className="font-extrabold text-zinc-950 mt-2 text-sm">{top3.name}</h4>
                <p className="text-xs text-zinc-500">S/O {top3.fatherName}</p>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">Roll: {top3.rollNo}</p>
              </div>
              <div className="text-xs bg-amber-50/70 rounded-xl p-2.5 flex justify-between font-medium text-amber-900">
                <span>Marks: <strong>{top3.grandTotal}</strong>/{top3.maxGrandTotal}</span>
                <span>GPA: <strong>{top3.gpa}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Stats */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Candidates</span>
            <p className="text-xl font-black text-zinc-950 mt-0.5">{records.length}</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">Highest Score</span>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{metrics.highestPercentage}%</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-[#084A86] uppercase">Class Average</span>
            <p className="text-xl font-black text-[#084A86] mt-0.5">{metrics.averagePercentage}%</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 uppercase">Distinctions (&ge;80%)</span>
            <p className="text-xl font-black text-amber-700 mt-0.5">
              {records.filter(r => r.percentage >= 80).length} Candidates
            </p>
          </div>
        </div>
      )}

      {/* Main Table / Print Gazette */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden print:border-none print:shadow-none">
        {/* Printable Official College Header */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 print:bg-white text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <School className="h-6 w-6 text-[#084A86]" />
            <h2 className="text-xl font-black text-zinc-950 uppercase tracking-wide">
              Pak Royal College Sharaqpur Sharif
            </h2>
          </div>
          <p className="text-xs font-semibold text-zinc-600">
            Official Academic Merit &amp; Position Standings • Session 2025-2026
          </p>
          <div className="inline-flex items-center gap-3 text-[11px] text-zinc-500 pt-1 font-medium">
            <span><strong>Program:</strong> {selectedClass || 'All Classes'}</span>
            <span>•</span>
            <span><strong>Term:</strong> {selectedExam}</span>
            <span>•</span>
            <span><strong>Total Ranked:</strong> {records.length} Students</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase font-black text-zinc-600 bg-zinc-100/80 border-b border-zinc-200">
              <tr>
                <th className="px-3.5 py-3 text-center">Rank</th>
                <th className="px-3 py-3">Roll No</th>
                <th className="px-3 py-3">Adm No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Father Name</th>
                <th className="px-3 py-3">Class / Program</th>
                <th className="px-3 py-3 text-center">Obtained</th>
                <th className="px-3 py-3 text-center">Max</th>
                <th className="px-3 py-3 text-center">Score %</th>
                <th className="px-3 py-3 text-center">GPA</th>
                <th className="px-3 py-3 text-center">Grade</th>
                <th className="px-3.5 py-3 text-center">Academic Honors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-4 py-12 text-center text-zinc-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#084A86]" />
                    Compiling class merit rankings...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-12 text-center text-zinc-400">
                    No examination records found for selected criteria.
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr 
                      key={r.studentId || idx} 
                      className={`hover:bg-zinc-50/80 transition-colors ${
                        rank === 1 ? 'bg-amber-50/30 font-semibold' : rank <= 3 ? 'bg-zinc-50/40' : ''
                      }`}
                    >
                      <td className="px-3.5 py-3 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-xs">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-bold text-xs">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-bold">#{rank}</span>
                        )}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-zinc-900">{r.rollNo}</td>
                      <td className="px-3 py-3 font-mono text-zinc-500">{r.admissionNo}</td>
                      <td className="px-4 py-3 font-extrabold text-zinc-950">{r.name}</td>
                      <td className="px-4 py-3 text-zinc-600">{r.fatherName}</td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700">
                          {r.className}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-zinc-900">{r.grandTotal}</td>
                      <td className="px-3 py-3 text-center text-zinc-400 font-medium">{r.maxGrandTotal}</td>
                      <td className="px-3 py-3 text-center font-black text-zinc-950">
                        {r.percentage}%
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-zinc-700">{r.gpa}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                          r.overallGrade.startsWith('A') ? 'bg-emerald-100 text-emerald-800' :
                          r.overallGrade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                          r.overallGrade.startsWith('C') ? 'bg-amber-100 text-amber-800' :
                          'bg-zinc-100 text-zinc-800'
                        }`}>
                          {r.overallGrade}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                            <Sparkles className="h-3 w-3 text-amber-600" /> First Position
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
                            <Medal className="h-3 w-3 text-slate-500" /> Second Position
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-200">
                            <Medal className="h-3 w-3 text-amber-700" /> Third Position
                          </span>
                        ) : r.percentage >= 80 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            <Star className="h-2.5 w-2.5 text-emerald-600 fill-emerald-600" /> Distinction
                          </span>
                        ) : r.percentage >= 70 ? (
                          <span className="text-[10px] font-semibold text-blue-700">First Class</span>
                        ) : (
                          <span className="text-[10px] text-zinc-400">Passed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Print Signatures */}
        <div className="hidden print:grid grid-cols-3 gap-8 p-8 mt-12 text-center text-xs">
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Tabulator / Prepared By
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            In-Charge Examination
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Controller / Principal Seal
          </div>
        </div>
      </div>
    </div>
  );
}
