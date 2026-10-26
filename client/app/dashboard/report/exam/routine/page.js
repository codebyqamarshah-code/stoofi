'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, Calendar, Clock, 
  MapPin, UserCheck, ShieldAlert, School, RefreshCw, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CLASSES = ['FSC OTT', 'BS Psychology', 'BS RIT', 'FSC Nursing', 'DPT', 'FSC Dental'];
const EXAM_TERMS = ['Final Examination 2026', 'Mid Term 2026', 'First Term 2026', 'Annual Board Prep 2026'];

export default function ExamRoutinePage() {
  const [selectedClass, setSelectedClass] = useState('FSC OTT');
  const [selectedExam, setSelectedExam] = useState('Final Examination 2026');
  const [search, setSearch] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [centerInfo, setCenterInfo] = useState({ centerCode: '', centerName: '', session: '' });
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutine = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.set('className', selectedClass);
      if (selectedExam) params.set('examTerm', selectedExam);

      const res = await fetch(`/api/report/exam/routine?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSchedule(json.data || []);
        setCenterInfo({
          centerCode: json.centerCode,
          centerName: json.centerName,
          session: json.session
        });
        setInstructions(json.instructions || []);
      }
    } catch (e) {
      console.error('Failed to load exam routine:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutine();
  }, [selectedClass, selectedExam]);

  const filteredSchedule = schedule.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.subject.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.hall.toLowerCase().includes(q) ||
      item.invigilator.toLowerCase().includes(q)
    );
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (schedule.length === 0) return;
    const headers = ['Paper #', 'Date', 'Day', 'Time Slot', 'Subject Code', 'Subject Title', 'Examination Hall', 'Max Marks', 'Invigilator'];
    const rows = schedule.map(item => [
      item.paperNo,
      item.date,
      item.day,
      `"${item.time}"`,
      item.code,
      `"${item.subject}"`,
      `"${item.hall}"`,
      item.maxMarks,
      `"${item.invigilator}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DateSheet_${selectedClass}_${selectedExam}.csv`);
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
            <span className="text-[#084A86] font-bold">Exam Date Sheet Routine</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <Calendar className="h-6 w-6 text-[#084A86]" />
            Official Examination Date Sheet &amp; Routine
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Paper schedules, timing slots, exam halls, and invigilator duties • Pak Royal College Sharaqpur
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-xs font-semibold h-9 border-zinc-200 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-[#084A86]" /> Export Schedule
          </Button>
          <Button
            onClick={handlePrint}
            size="sm"
            className="text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Official Date Sheet
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
            <Label className="text-xs font-bold text-zinc-600 uppercase">Filter Subject / Hall</Label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search subject or hall..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs bg-zinc-50 border-zinc-200 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={fetchRoutine}
              className="w-full text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Load Routine
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[#084A86]" /> Total Papers Scheduled
          </span>
          <p className="text-xl font-black text-zinc-950 mt-1">{schedule.length} Papers</p>
          <p className="text-xs text-zinc-500 mt-0.5">Comprehensive theoretical and practical exam</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-[#084A86]" /> Official Examination Center
          </span>
          <p className="text-sm font-extrabold text-zinc-950 mt-1 truncate">{centerInfo.centerName}</p>
          <p className="text-xs font-mono text-zinc-500 mt-0.5">Center Code: {centerInfo.centerCode}</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#084A86]" /> Schedule Duration
          </span>
          <p className="text-sm font-extrabold text-zinc-950 mt-1">
            {schedule[0]?.date} to {schedule[schedule.length - 1]?.date}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">Morning &amp; Evening Academic Sessions</p>
        </div>
      </div>

      {/* Official Date Sheet Sheet */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden print:border-none print:shadow-none">
        {/* Printable Official College Header */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 print:bg-white text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <School className="h-7 w-7 text-[#084A86]" />
            <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-wide">
              Pak Royal College Sharaqpur Sharif
            </h2>
          </div>
          <p className="text-xs font-bold text-[#084A86] uppercase tracking-wider">
            Office of the Controller of Examinations
          </p>
          <p className="text-sm font-extrabold text-zinc-800">
            Official Examination Date Sheet • {selectedExam}
          </p>
          <div className="inline-flex items-center gap-4 text-xs text-zinc-600 pt-1 font-medium">
            <span><strong>Program:</strong> {selectedClass}</span>
            <span>•</span>
            <span><strong>Session:</strong> {centerInfo.session}</span>
            <span>•</span>
            <span><strong>Center:</strong> {centerInfo.centerCode}</span>
          </div>
        </div>

        {/* Timetable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase font-black text-zinc-600 bg-zinc-100/80 border-b border-zinc-200">
              <tr>
                <th className="px-3.5 py-3 text-center">Paper</th>
                <th className="px-3.5 py-3">Date</th>
                <th className="px-3.5 py-3">Day</th>
                <th className="px-4 py-3">Paper Timing</th>
                <th className="px-3.5 py-3">Course Code</th>
                <th className="px-5 py-3">Subject Title</th>
                <th className="px-4 py-3">Examination Hall</th>
                <th className="px-3 py-3 text-center">Max Marks</th>
                <th className="px-4 py-3">Chief Invigilator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#084A86]" />
                    Loading exam timetable schedule...
                  </td>
                </tr>
              ) : filteredSchedule.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-400">
                    No papers scheduled for this program.
                  </td>
                </tr>
              ) : (
                filteredSchedule.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-3.5 py-3.5 text-center font-bold text-zinc-900">
                      #{item.paperNo}
                    </td>
                    <td className="px-3.5 py-3.5 font-bold font-mono text-[#084A86]">
                      {item.date}
                    </td>
                    <td className="px-3.5 py-3.5 font-medium text-zinc-600">
                      {item.day}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-zinc-900">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-zinc-400" /> {item.time}
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5 font-mono font-bold text-zinc-700">
                      {item.code}
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-zinc-950">
                      {item.subject}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                        <MapPin className="h-2.5 w-2.5 text-zinc-400" /> {item.hall}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center font-black text-zinc-900">
                      {item.maxMarks}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-emerald-600" /> {item.invigilator}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Instructions Section */}
        {instructions.length > 0 && (
          <div className="p-6 bg-amber-50/40 border-t border-amber-200/80 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-600" /> Critical Instructions For Examination Candidates
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-amber-950 font-medium pl-1">
              {instructions.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Official Signatures */}
        <div className="grid grid-cols-3 gap-8 p-8 border-t border-zinc-200 text-center text-xs">
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Assistant Controller
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            In-Charge Date Sheet Committee
          </div>
          <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
            Controller of Examinations / Principal
          </div>
        </div>
      </div>
    </div>
  );
}
