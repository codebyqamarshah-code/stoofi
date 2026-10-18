'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Clock, Calendar, CheckCircle2, AlertCircle, 
  ChevronRight, ArrowRight, Timer, Search, Copy, Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateDMY } from '@/lib/utils';
import api from '@/services/api';

export default function ActiveOnlineExamsPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [eRes, sRes] = await Promise.all([
          api.get('/online-exam').catch(() => null),
          api.get('/subject').catch(() => null)
        ]);

        if (eRes?.success && Array.isArray(eRes.data)) {
          setExams(eRes.data);
        }
        if (sRes?.success && Array.isArray(sRes.data)) {
          setSubjects(sRes.data);
        }
      } catch (err) {
        console.error('Failed to load active exams:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getSubjectName = (subId) => {
    const s = subjects.find(sub => sub._id === subId || sub.name === subId);
    return s?.name || subId || 'General';
  };

  const handleCopyLink = (examId) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/dashboard/student/online-exam/take/${examId}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopiedId(examId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredExams = exams.filter(e => 
    (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
    getSubjectName(e.subjectId).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#084A86]" />
            Active Online Examinations
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Available online assessments and timed examinations</p>
        </div>
        <div className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
          <Link href="/dashboard/student" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span>Online Exam</span>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-[#084A86] font-bold">Active Exams</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-xs border border-zinc-200 overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search exam or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-zinc-300 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">
              {filteredExams.length} {filteredExams.length === 1 ? 'Exam' : 'Exams'} Available
            </span>
          </div>
        </div>

        {/* Exams Grid / Table */}
        {loading ? (
          <div className="p-12 text-center text-zinc-500">
            <div className="inline-flex items-center gap-2 font-medium">
              <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
              Loading active online exams...
            </div>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="h-10 w-10 text-zinc-300" />
              <p className="font-semibold text-zinc-800">No Active Exams Found</p>
              <p className="text-xs text-zinc-400">There are currently no scheduled online exams for your class.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-xs text-zinc-700 font-bold uppercase border-b border-zinc-200">
                <tr>
                  <th className="px-5 py-3.5">Exam Title</th>
                  <th className="px-4 py-3.5">Subject</th>
                  <th className="px-4 py-3.5">Exam Date</th>
                  <th className="px-4 py-3.5">Time Window</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Questions</th>
                  <th className="px-4 py-3.5">Passing %</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredExams.map((exam) => {
                  const isCopied = copiedId === exam._id;
                  const questionCount = exam.questions?.length || 0;

                  return (
                    <tr key={exam._id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-zinc-950">
                        <div>{exam.title}</div>
                        {exam.instruction && (
                          <div className="text-xs text-zinc-400 font-normal truncate max-w-xs mt-0.5">
                            {exam.instruction}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-200 rounded-md text-xs font-semibold text-zinc-800">
                          {getSubjectName(exam.subjectId)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-zinc-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          {formatDateDMY(exam.date)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-zinc-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" />
                          {exam.startTime} - {exam.endTime}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-zinc-700">
                        <div className="flex items-center gap-1">
                          <Timer className="h-3.5 w-3.5 text-[#084A86]" />
                          {exam.duration || 30} mins
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-[#084A86]">
                        {questionCount} Questions
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                          {exam.minPercentage || 50}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleCopyLink(exam._id)}
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs border-zinc-300 text-zinc-700"
                            title="Copy Direct Exam Link"
                          >
                            {isCopied ? (
                              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                <Check className="h-3.5 w-3.5" /> Copied!
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy className="h-3.5 w-3.5" /> Link
                              </span>
                            )}
                          </Button>

                          <Link href={`/dashboard/student/online-exam/take/${exam._id}`}>
                            <Button
                              size="sm"
                              className="bg-[#084A86] hover:bg-[#073b6b] text-white font-bold text-xs h-8 px-4 flex items-center gap-1.5"
                            >
                              Take Exam <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
