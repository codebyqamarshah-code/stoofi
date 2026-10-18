'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Timer, BookOpen, AlertCircle, CheckCircle, ChevronLeft, 
  ChevronRight, Trophy, ArrowLeft, Send, CheckCircle2, XCircle, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function TakeOnlineExamPage({ params }) {
  // Unwrap params in Next.js 15
  const resolvedParams = use(params);
  const examId = resolvedParams.id;
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Exam state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadExam() {
      try {
        setLoading(true);
        const res = await api.get(`/online-exam/${examId}`);
        if (res?.success && res.data) {
          setExam(res.data);
          if (res.data.hasSubmitted && res.data.submission) {
            setResult(res.data.submission);
          } else {
            const durationMins = Number(res.data.duration) || 30;
            setSecondsRemaining(durationMins * 60);
          }
        } else {
          setError(res?.message || 'Exam could not be loaded');
        }
      } catch (err) {
        console.error('Error loading exam:', err);
        setError('Failed to connect to examination server.');
      } finally {
        setLoading(false);
      }
    }

    if (examId) loadExam();
  }, [examId]);

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining === null || result) return;

    if (secondsRemaining <= 0) {
      handleFinalSubmit(true); // Auto-submit when timer expires
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [secondsRemaining, result]);

  const handleFinalSubmit = async (isAuto = false) => {
    if (submitting || result) return;
    try {
      setSubmitting(true);
      setShowConfirmModal(false);
      const res = await api.post(`/online-exam/${examId}/submit`, { answers });
      if (res?.success && res.data) {
        setResult(res.data);
        if (isAuto) {
          alert('Time is up! Your answers have been automatically submitted.');
        }
      } else {
        alert(res?.message || 'Error submitting exam');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit exam: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-zinc-500">
        <div className="h-8 w-8 rounded-full border-3 border-[#084A86] border-t-transparent animate-spin mb-4" />
        <p className="font-semibold text-zinc-700">Loading Examination Portal...</p>
        <p className="text-xs text-zinc-400 mt-1">Please do not refresh the page.</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Exam Unavailable</h2>
        <p className="text-sm text-zinc-500 mb-6">{error || 'This exam was not found or is currently closed.'}</p>
        <Link href="/dashboard/student/online-exam/active">
          <Button className="bg-[#084A86] text-white">Back to Active Exams</Button>
        </Link>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (result) {
    const isPass = result.status === 'Passed';
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden text-center p-8 sm:p-10">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
            isPass ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
          }`}>
            {isPass ? <Trophy className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
          </div>

          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
            isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            Exam Completed: {result.status}
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 mb-2">{exam.title}</h1>
          <p className="text-sm text-zinc-500 mb-8">
            Candidate: <span className="font-semibold text-zinc-800">{result.studentName}</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-zinc-50 rounded-xl border border-zinc-200 mb-8 text-left">
            <div>
              <div className="text-xs text-zinc-400 font-semibold uppercase">Total Score</div>
              <div className="text-xl font-black text-zinc-900 mt-1">{result.score} / {result.totalMarks}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-semibold uppercase">Percentage</div>
              <div className={`text-xl font-black mt-1 ${isPass ? 'text-emerald-600' : 'text-rose-600'}`}>
                {result.percentage}%
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-semibold uppercase">Correct Answers</div>
              <div className="text-xl font-black text-emerald-600 mt-1">{result.correctCount} Qs</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-semibold uppercase">Wrong / Skipped</div>
              <div className="text-xl font-black text-rose-600 mt-1">{result.wrongCount} Qs</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard/student/online-exam/view-result" className="w-full sm:w-auto">
              <Button className="w-full bg-[#084A86] hover:bg-[#073b6b] text-white font-bold px-6">
                View All Results Slip
              </Button>
            </Link>
            <Link href="/dashboard/student/online-exam/active" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-zinc-300 text-zinc-700">
                Back to Exams
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- QUESTIONS INTERFACE ---
  const questions = exam.questions || [];
  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <BookOpen className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-zinc-800">No Questions Configured</h2>
        <p className="text-sm text-zinc-500 mt-1 mb-6">The teacher has not added questions to this exam yet.</p>
        <Link href="/dashboard/student/online-exam/active">
          <Button variant="outline">Back to Exams</Button>
        </Link>
      </div>
    );
  }

  const mins = String(Math.floor((secondsRemaining || 0) / 60)).padStart(2, '0');
  const secs = String((secondsRemaining || 0) % 60).padStart(2, '0');
  const timerUrgent = (secondsRemaining || 0) < 180; // less than 3 mins

  const currentQObj = questions[currentQ] || questions[0];
  const qOptions = [
    { label: 'A', text: currentQObj.optionA },
    { label: 'B', text: currentQObj.optionB },
    { label: 'C', text: currentQObj.optionC || null },
    { label: 'D', text: currentQObj.optionD || null }
  ].filter(o => o.text !== null && o.text !== undefined && String(o.text).trim() !== '');


  const answeredCount = Object.keys(answers).length;

  return (
    <>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
            <Send className="h-12 w-12 text-[#084A86] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-950 mb-1">Submit Your Exam?</h3>
            <p className="text-sm text-zinc-500 mb-4">
              You have answered <span className="font-bold text-[#084A86]">{answeredCount}</span> of <span className="font-bold">{questions.length}</span> questions.
              {answeredCount < questions.length && (
                <span className="block text-amber-600 font-semibold text-xs mt-1">
                  ⚠️ You have {questions.length - answeredCount} unanswered question(s).
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 border-zinc-300"
              >
                Continue Exam
              </Button>
              <Button
                disabled={submitting}
                onClick={() => handleFinalSubmit(false)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Now'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-4 pb-12">
        {/* Sticky Exam Banner */}
        <div className="bg-[#084A86] text-white rounded-2xl shadow-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <BookOpen className="h-4 w-4" />
              <span>Timed Online Examination</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">{exam.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Countdown Clock */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg shadow-inner ${
              timerUrgent ? 'bg-rose-600 text-white animate-pulse' : 'bg-white/15 text-white'
            }`}>
              <Timer className="h-5 w-5" />
              <span>{mins}:{secs}</span>
            </div>

            <Button
              onClick={() => setShowConfirmModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 h-10 shadow-sm"
            >
              Submit Exam
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#084A86] transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Palette & Card */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Question Display */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Question {currentQ + 1} of {questions.length}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#084A86]">
                  {currentQObj.marks || 1} {Number(currentQObj.marks) === 1 ? 'Mark' : 'Marks'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-zinc-950 mb-6 leading-relaxed">
                {currentQObj.question}
              </h2>

              <div className="space-y-3">
                {qOptions.map((opt) => {
                  const isSelected = answers[currentQObj._id || String(currentQ)] === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setAnswers(prev => ({
                        ...prev,
                        [currentQObj._id || String(currentQ)]: opt.label
                      }))}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all flex items-center gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'border-[#084A86] bg-blue-50/80 text-[#084A86] shadow-xs'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-[#084A86] text-white border-[#084A86]'
                          : 'border-zinc-300 text-zinc-500'
                      }`}>
                        {opt.label}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prev / Next controls */}
            <div className="flex items-center justify-between pt-6 border-t border-zinc-100 mt-6">
              <Button
                variant="outline"
                disabled={currentQ === 0}
                onClick={() => setCurrentQ(q => q - 1)}
                className="border-zinc-300 text-zinc-700 font-bold"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              {currentQ === questions.length - 1 ? (
                <Button
                  onClick={() => setShowConfirmModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Review & Submit
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQ(q => q + 1)}
                  className="bg-[#084A86] hover:bg-[#073b6b] text-white font-bold"
                >
                  Next Question <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-zinc-200 shadow-xs p-5 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3">
              Questions Navigation
            </h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentQ;
                const isAnswered = answers[q._id || String(idx)] !== undefined;

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQ(idx)}
                    className={`h-9 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-[#084A86] bg-[#084A86] text-white'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-xs space-y-2 pt-3 border-t border-zinc-100 text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-zinc-100 border border-zinc-200" />
                <span>Unanswered ({questions.length - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
