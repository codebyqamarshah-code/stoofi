'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, CheckCircle2, XCircle, ChevronRight, Search, 
  Printer, ArrowLeft, Calendar, FileText, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateDMY } from '@/lib/utils';
import api from '@/services/api';

export default function StudentOnlineExamResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const res = await api.get('/online-exam/student/results');
        if (res?.success && Array.isArray(res.data)) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Failed to load exam results:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  const filtered = results.filter(r => 
    (r.examTitle || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.status || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Result Slip Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200">
            <div className="bg-[#084A86] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-300" />
                <h3 className="font-bold text-base">Examination Result Slip</h3>
              </div>
              <button onClick={() => setSelectedResult(null)} className="p-1 rounded-lg hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-zinc-200">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                  selectedResult.status === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedResult.status}
                </span>
                <h2 className="text-xl font-bold text-zinc-950">{selectedResult.examTitle}</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Candidate: <span className="font-bold text-zinc-800">{selectedResult.studentName || 'Student'}</span>
                  {selectedResult.rollNo ? ` • Roll No: ${selectedResult.rollNo}` : ''}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div>
                  <span className="text-xs text-zinc-500 block">Total Marks:</span>
                  <span className="font-bold text-zinc-900">{selectedResult.totalMarks || 0}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Marks Obtained:</span>
                  <span className="font-bold text-[#084A86]">{selectedResult.score || 0}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Percentage:</span>
                  <span className="font-bold text-emerald-600">{selectedResult.percentage || 0}%</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Date Taken:</span>
                  <span className="font-bold text-zinc-900">{formatDateDMY(selectedResult.submittedAt)}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Correct Answers:</span>
                  <span className="font-bold text-emerald-600">{selectedResult.correctCount || 0} Qs</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 block">Wrong / Unanswered:</span>
                  <span className="font-bold text-rose-600">{selectedResult.wrongCount || 0} Qs</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex-1 border-zinc-300 text-zinc-700"
                >
                  <Printer className="h-4 w-4 mr-1.5" /> Print Result Slip
                </Button>
                <Button
                  onClick={() => setSelectedResult(null)}
                  className="flex-1 bg-[#084A86] hover:bg-[#073b6b] text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-[#084A86]" />
              Online Exam Results
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Review your completed test scores and performance analysis</p>
          </div>
          <div className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
            <Link href="/dashboard/student" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
            <span>Online Exam</span>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
            <span className="text-[#084A86] font-bold">Results</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xs border border-zinc-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search by exam title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white border-zinc-300 text-sm"
              />
            </div>
            <span className="text-xs font-semibold text-zinc-500">
              {filtered.length} {filtered.length === 1 ? 'Result' : 'Results'} Recorded
            </span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center text-zinc-500">
              <div className="inline-flex items-center gap-2 font-medium">
                <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                Loading your exam results...
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <div className="flex flex-col items-center gap-2">
                <Trophy className="h-10 w-10 text-zinc-300" />
                <p className="font-semibold text-zinc-800">No Exam Results Yet</p>
                <p className="text-xs text-zinc-400">You haven't attempted any online examinations yet.</p>
                <Link href="/dashboard/student/online-exam/active" className="mt-3">
                  <Button className="bg-[#084A86] text-white text-xs">Browse Active Exams</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 text-xs text-zinc-700 font-bold uppercase border-b border-zinc-200">
                  <tr>
                    <th className="px-5 py-3.5">Exam Title</th>
                    <th className="px-4 py-3.5">Score</th>
                    <th className="px-4 py-3.5">Total Marks</th>
                    <th className="px-4 py-3.5">Percentage</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Date Taken</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {filtered.map((item) => {
                    const isPass = item.status === 'Passed';
                    return (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-5 py-4 font-bold text-zinc-950">
                          {item.examTitle || 'Online Assessment'}
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-[#084A86]">
                          {item.score || 0}
                        </td>
                        <td className="px-4 py-4 font-mono text-zinc-600">
                          {item.totalMarks || 0}
                        </td>
                        <td className="px-4 py-4 font-bold">
                          <span className={isPass ? 'text-emerald-600' : 'text-rose-600'}>
                            {item.percentage || 0}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isPass 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {isPass ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-zinc-600 whitespace-nowrap">
                          {formatDateDMY(item.submittedAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            onClick={() => setSelectedResult(item)}
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs border-zinc-300 text-zinc-700 font-semibold"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" /> View Slip
                          </Button>
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
    </>
  );
}
