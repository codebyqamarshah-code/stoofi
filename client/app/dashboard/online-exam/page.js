'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, Search, BookOpen, Clock, Timer, Trophy, X, ChevronLeft, 
  ChevronRight as ChevronRightIcon, CheckCircle, Copy, Check, Edit, 
  ListPlus, ExternalLink, Share2, Trash2, HelpCircle, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic } from '@/lib/academicUtils';
import { formatDateDMY } from '@/lib/utils';
import api from '@/services/api';

const DEFAULT_CLASSES = [
  { _id: 'c1', name: 'Class 1' }, { _id: 'c2', name: 'Class 2' },
  { _id: 'c3', name: 'Class 3' }, { _id: 'c4', name: 'Class 4' },
  { _id: 'c5', name: 'Class 5' }, { _id: 'c6', name: 'Class 6' },
  { _id: 'c7', name: 'Class 7' }, { _id: 'c8', name: 'Class 8' },
  { _id: 'c9', name: 'Class 9' }, { _id: 'c10', name: 'Class 10' },
];
const DEFAULT_SUBJECTS = [
  { _id: 's1', name: 'Mathematics' }, { _id: 's2', name: 'English Language' },
  { _id: 's3', name: 'Physics' }, { _id: 's4', name: 'Chemistry' },
  { _id: 's5', name: 'Urdu' }, { _id: 's6', name: 'Computer Science' },
];
const DEFAULT_SECTIONS = [
  { _id: 'sec1', name: 'Section A' }, { _id: 'sec2', name: 'Section B' },
  { _id: 'sec3', name: 'Section C' },
];

// --- Exam Preview / Attempt Modal ---
function ExamPreviewModal({ exam, onClose }) {
  const fallbackQuestions = [
    { question: 'What is the result of 12 × 8 - 24 ÷ 4?', optionA: '90', optionB: '92', optionC: '96', optionD: '88', correctAnswer: 'A' },
    { question: 'Which of the following is NOT a primary color of light?', optionA: 'Red', optionB: 'Green', optionC: 'Blue', optionD: 'Yellow', correctAnswer: 'D' },
    { question: 'What does "RAM" stand for in computing?', optionA: 'Random Access Memory', optionB: 'Read Absolute Mode', optionC: 'Rapid Application Memory', optionD: 'Remote Access Module', correctAnswer: 'A' },
    { question: 'Which planet is the largest in our solar system?', optionA: 'Saturn', optionB: 'Neptune', optionC: 'Jupiter', optionD: 'Uranus', correctAnswer: 'C' },
    { question: 'The square root of 169 is:', optionA: '11', optionB: '12', optionC: '13', optionD: '14', correctAnswer: 'C' },
  ];

  const questions = (exam?.questions && exam.questions.length > 0) ? exam.questions : fallbackQuestions;

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Timer
  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const examDurationMinutes = Number(exam?.duration) || 15;
  const TOTAL_SECONDS = examDurationMinutes * 60;

  useEffect(() => {
    const interval = setInterval(() => {
      const s = Math.floor((Date.now() - startTime.current) / 1000);
      setElapsed(s);
      if (s >= TOTAL_SECONDS) { clearInterval(interval); setSubmitted(true); }
    }, 1000);
    return () => clearInterval(interval);
  }, [TOTAL_SECONDS]);

  const remaining = Math.max(0, TOTAL_SECONDS - elapsed);
  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  const timerColor = remaining < 120 ? 'text-rose-600' : remaining < 300 ? 'text-amber-600' : 'text-emerald-700';

  const score = questions.filter((q, i) => {
    const chosen = answers[i];
    return chosen && chosen.toUpperCase() === (q.correctAnswer || 'A').toUpperCase();
  }).length;

  const handleSubmit = () => setSubmitted(true);
  const currentQuestionObj = questions[currentQ] || questions[0];
  const qOptions = [
    { label: 'A', text: currentQuestionObj.optionA },
    { label: 'B', text: currentQuestionObj.optionB },
    { label: 'C', text: currentQuestionObj.optionC },
    { label: 'D', text: currentQuestionObj.optionD }
  ].filter(opt => opt.text && opt.text.trim() !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-[#084A86] text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5" />
            <div>
              <h2 className="font-bold text-base leading-tight">{exam?.title || 'Online Exam'}</h2>
              <p className="text-blue-200 text-xs">Preview Mode &bull; {questions.length} Questions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 font-mono font-bold text-lg ${submitted ? 'text-zinc-200' : timerColor} bg-white/10 px-3 py-1 rounded-lg`}>
              <Timer className="h-4 w-4" />
              {mins}:{secs}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center flex-1 p-10 gap-4 text-center">
            <div className="p-5 rounded-full bg-emerald-100">
              <Trophy className="h-12 w-12 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-950">Exam Submitted!</h3>
            <p className="text-zinc-500 text-sm">Your answers have been evaluated</p>
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-10 py-6 mt-2">
              <div className="text-4xl font-black text-[#084A86]">{score} / {questions.length}</div>
              <div className="text-sm text-zinc-500 mt-1">Questions Correct</div>
              <div className="text-2xl font-bold text-emerald-600 mt-3">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <div className="text-xs text-zinc-400 mt-1">Score</div>
            </div>
            <Button onClick={onClose} className="mt-4 bg-[#084A86] text-white px-8">Close Preview</Button>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="h-1.5 bg-zinc-100">
              <div
                className="h-full bg-[#084A86] transition-all duration-300"
                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wide">
                  Question {currentQ + 1} of {questions.length}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQ(i)}
                      className={`w-6 h-6 rounded-full text-xs font-bold border transition-all ${
                        i === currentQ
                          ? 'bg-[#084A86] text-white border-[#084A86]'
                          : answers[i] !== undefined
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 mb-5">
                <p className="font-semibold text-zinc-950 text-base leading-relaxed">
                  {currentQuestionObj.question}
                </p>
              </div>

              <div className="space-y-3">
                {qOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: opt.label }))}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-3 ${
                      answers[currentQ] === opt.label
                        ? 'border-[#084A86] bg-blue-50 text-[#084A86] shadow-sm font-bold'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center ${
                      answers[currentQ] === opt.label
                        ? 'bg-[#084A86] text-white border-[#084A86]'
                        : 'border-zinc-300 text-zinc-500'
                    }`}>
                      {opt.label}
                    </span>
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Nav */}
            <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={currentQ === 0}
                onClick={() => setCurrentQ(q => q - 1)}
                className="flex items-center gap-1.5 border-zinc-300 text-zinc-600"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-xs text-zinc-500">
                {Object.keys(answers).length} / {questions.length} answered
              </span>
              {currentQ === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" /> Submit Exam
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQ(q => q + 1)}
                  className="bg-[#084A86] hover:bg-[#073b6b] text-white flex items-center gap-1.5"
                >
                  Next <ChevronRightIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Manage Questions Modal ---
function ManageQuestionsModal({ exam, onClose, onRefresh }) {
  const [questions, setQuestions] = useState(exam.questions || []);
  const [newQ, setNewQ] = useState({
    question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 1
  });
  const [saving, setSaving] = useState(false);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQ.question || !newQ.optionA || !newQ.optionB) {
      return alert('Please provide the question text and at least options A and B.');
    }

    const updated = [...questions, { ...newQ, marks: Number(newQ.marks) || 1 }];
    setSaving(true);
    try {
      const res = await api.put(`/online-exam/${exam._id}`, { questions: updated });
      if (res?.success) {
        setQuestions(res.data.questions || updated);
        setNewQ({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 1 });
        onRefresh();
      }
    } catch (err) {
      alert(err.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (idx) => {
    if (!confirm('Remove this question?')) return;
    const updated = questions.filter((_, i) => i !== idx);
    setSaving(true);
    try {
      const res = await api.put(`/online-exam/${exam._id}`, { questions: updated });
      if (res?.success) {
        setQuestions(res.data.questions || updated);
        onRefresh();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-[#084A86] text-white">
          <div className="flex items-center gap-2">
            <ListPlus className="h-5 w-5" />
            <div>
              <h2 className="font-bold text-base leading-tight">Question Bank: {exam.title}</h2>
              <p className="text-blue-200 text-xs">{questions.length} Questions Configured &bull; Total Marks: {questions.reduce((s, q) => s + (Number(q.marks) || 1), 0)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add Question Form */}
          <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#084A86] mb-3 flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Add New Question
            </h3>
            <form onSubmit={handleAddQuestion} className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-zinc-700">Question Text *</Label>
                <textarea
                  required
                  placeholder="e.g. What is the powerhouse of the cell?"
                  value={newQ.question}
                  onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
                  className="w-full mt-1 bg-white border border-zinc-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Option A *</Label>
                  <Input
                    required
                    placeholder="Option A text"
                    value={newQ.optionA}
                    onChange={(e) => setNewQ({ ...newQ, optionA: e.target.value })}
                    className="bg-white border-zinc-300 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Option B *</Label>
                  <Input
                    required
                    placeholder="Option B text"
                    value={newQ.optionB}
                    onChange={(e) => setNewQ({ ...newQ, optionB: e.target.value })}
                    className="bg-white border-zinc-300 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Option C (Optional)</Label>
                  <Input
                    placeholder="Option C text"
                    value={newQ.optionC}
                    onChange={(e) => setNewQ({ ...newQ, optionC: e.target.value })}
                    className="bg-white border-zinc-300 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Option D (Optional)</Label>
                  <Input
                    placeholder="Option D text"
                    value={newQ.optionD}
                    onChange={(e) => setNewQ({ ...newQ, optionD: e.target.value })}
                    className="bg-white border-zinc-300 text-sm mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Correct Answer *</Label>
                  <select
                    value={newQ.correctAnswer}
                    onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                    className="w-full mt-1 bg-white border border-zinc-300 rounded-lg p-2 text-sm font-semibold text-zinc-800"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Marks</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newQ.marks}
                    onChange={(e) => setNewQ({ ...newQ, marks: e.target.value })}
                    className="bg-white border-zinc-300 text-sm mt-1"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button disabled={saving} type="submit" className="bg-[#084A86] hover:bg-[#073b6b] text-white text-xs font-bold py-2">
                  {saving ? 'Saving...' : 'Add Question to Exam'}
                </Button>
              </div>
            </form>
          </div>

          {/* Existing Questions List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3">Questions in this Exam ({questions.length})</h3>
            {questions.length === 0 ? (
              <p className="text-sm text-zinc-400 italic py-4 text-center">No questions added yet. Use the form above to add your first question.</p>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q._id || idx} className="border border-zinc-200 rounded-xl p-4 bg-white shadow-xs hover:border-zinc-300 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 text-zinc-700 mr-2">Q{idx + 1}</span>
                        <span className="font-semibold text-sm text-zinc-900">{q.question}</span>
                        <span className="ml-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{q.marks || 1} mark</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteQuestion(idx)}
                        className="text-rose-500 hover:bg-rose-50 h-7 w-7 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                      <div className={`p-2 rounded border ${q.correctAnswer === 'A' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}>
                        <span className="font-bold mr-1">A:</span> {q.optionA}
                      </div>
                      <div className={`p-2 rounded border ${q.correctAnswer === 'B' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}>
                        <span className="font-bold mr-1">B:</span> {q.optionB}
                      </div>
                      {q.optionC && (
                        <div className={`p-2 rounded border ${q.correctAnswer === 'C' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}>
                          <span className="font-bold mr-1">C:</span> {q.optionC}
                        </div>
                      )}
                      {q.optionD && (
                        <div className={`p-2 rounded border ${q.correctAnswer === 'D' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}>
                          <span className="font-bold mr-1">D:</span> {q.optionD}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
          <Button onClick={onClose} variant="outline" className="border-zinc-300 text-zinc-700">Done</Button>
        </div>
      </div>
    </div>
  );
}

// --- Edit Exam Modal ---
function EditExamModal({ exam, classes, subjects, sections, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    title: exam.title || '',
    classId: exam.classId || '',
    subjectId: exam.subjectId || '',
    sectionId: exam.sectionId || '',
    date: exam.date ? exam.date.substring(0, 10) : '',
    endDate: exam.endDate ? exam.endDate.substring(0, 10) : '',
    startTime: exam.startTime || '',
    endTime: exam.endTime || '',
    minPercentage: exam.minPercentage || 50,
    duration: exam.duration || 30,
    instruction: exam.instruction || '',
    autoMarkRegister: exam.autoMarkRegister || false,
    status: exam.status || 'Active'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/online-exam/${exam._id}`, formData);
      if (res?.success) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Failed to update exam');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-[#084A86] text-white">
          <h2 className="font-bold text-base">Edit Online Exam</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase">Exam Title *</Label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-white border-zinc-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">Class *</Label>
              <SearchableSelect
                value={formData.classId}
                onChange={(val) => setFormData({ ...formData, classId: val })}
                options={classes.map(c => ({ label: c.name, value: c._id }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">Subject *</Label>
              <SearchableSelect
                value={formData.subjectId}
                onChange={(val) => setFormData({ ...formData, subjectId: val })}
                options={subjects.map(s => ({ label: s.name, value: s._id }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">Start Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-white border-zinc-300"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">End Date</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="bg-white border-zinc-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">Start Time *</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="bg-white border-zinc-300"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">End Time *</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="bg-white border-zinc-300"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">Duration (mins)</Label>
              <Input
                type="number"
                min="5"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="bg-white border-zinc-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">Passing (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.minPercentage}
                onChange={(e) => setFormData({ ...formData, minPercentage: e.target.value })}
                className="bg-white border-zinc-300"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase">Status</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-sm text-zinc-950 font-medium"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase">Instructions</Label>
            <textarea
              value={formData.instruction}
              onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
              className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-sm text-zinc-950"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <Button type="button" variant="outline" onClick={onClose} className="border-zinc-300">Cancel</Button>
            <Button disabled={saving} type="submit" className="bg-[#084A86] hover:bg-[#073b6b] text-white">
              {saving ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function OnlineExamPage() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [formData, setFormData] = useState({
    title: '', classId: '', subjectId: '', sectionId: '', date: '', endDate: '',
    startTime: '', endTime: '', duration: 30, minPercentage: 50, instruction: '', autoMarkRegister: false
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [previewExam, setPreviewExam] = useState(null);
  const [managingQuestionsExam, setManagingQuestionsExam] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchData = async () => {
    try {
      const [eRes, cRes, subRes, secRes] = await Promise.all([
        api.get('/online-exam').catch(() => null),
        api.get('/class').catch(() => null),
        api.get('/subject').catch(() => null),
        api.get('/section').catch(() => null)
      ]);
      if (eRes?.success && Array.isArray(eRes.data)) setExams(eRes.data);
      if (cRes?.success && Array.isArray(cRes.data) && cRes.data.length > 0) setClasses(sortClassesAcademic(cRes.data));
      if (subRes?.success && Array.isArray(subRes.data) && subRes.data.length > 0) setSubjects(subRes.data);
      if (secRes?.success && Array.isArray(secRes.data) && secRes.data.length > 0) setSections(secRes.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.classId || !formData.subjectId || !formData.date || !formData.startTime || !formData.endTime) {
      return alert('Please fill all required fields marked with *');
    }
    try {
      setSubmitting(true);
      const res = await api.post('/online-exam', formData);
      if (res?.success) {
        setFormData({
          title: '', classId: '', subjectId: '', sectionId: '', date: '', endDate: '',
          startTime: '', endTime: '', duration: 30, minPercentage: 50, instruction: '', autoMarkRegister: false
        });
        fetchData();
      }
    } catch (error) { alert(error.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this online exam? All student results will also be deleted.')) return;
    try {
      const res = await api.delete(`/online-exam/${id}`);
      if (res?.success) fetchData();
    } catch (error) { alert(error.message); }
  };

  const handleCopyLink = (exam) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const examUrl = `${origin}/dashboard/student/online-exam/take/${exam._id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(examUrl);
    }
    setCopiedId(exam._id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getClassName = (id) => classes.find(c => c._id === id || c.name === id)?.name || id || '-';
  const getSectionName = (id) => sections.find(s => s._id === id || s.name === id)?.name || id || '-';
  const getSubjectName = (id) => subjects.find(s => s._id === id || s.name === id)?.name || id || '-';

  const filtered = exams.filter(e =>
    (e.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {previewExam && <ExamPreviewModal exam={previewExam} onClose={() => setPreviewExam(null)} />}
      {managingQuestionsExam && (
        <ManageQuestionsModal
          exam={managingQuestionsExam}
          onClose={() => setManagingQuestionsExam(null)}
          onRefresh={fetchData}
        />
      )}
      {editingExam && (
        <EditExamModal
          exam={editingExam}
          classes={classes}
          subjects={subjects}
          sections={sections}
          onClose={() => setEditingExam(null)}
          onRefresh={fetchData}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#084A86]" />
              Online Exam Management
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Create timed examinations, configure question banks, and generate direct student links</p>
          </div>
          <div className="flex items-center text-sm text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>Online Exam</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-zinc-950 font-bold">Manage Exams</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="xl:col-span-1">
            <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
              <div className="p-4 border-b border-zinc-200 bg-zinc-50">
                <h2 className="text-base font-semibold text-zinc-950">Create Online Exam</h2>
              </div>
              <form className="p-5 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Exam Title <span className="text-rose-500">*</span></Label>
                  <Input
                    placeholder="e.g. Science Mid-Term Online Test"
                    value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Class <span className="text-rose-500">*</span></Label>
                  <SearchableSelect
                    value={formData.classId} onChange={(val) => setFormData({ ...formData, classId: val })}
                    placeholder="Select Class *"
                    options={classes.map(c => ({ label: c.name, value: c._id }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Subject <span className="text-rose-500">*</span></Label>
                  <SearchableSelect
                    value={formData.subjectId} onChange={(val) => setFormData({ ...formData, subjectId: val })}
                    placeholder="Select Subject *"
                    options={subjects.map(s => ({ label: s.name, value: s._id }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Section</Label>
                  <SearchableSelect
                    value={formData.sectionId} onChange={(val) => setFormData({ ...formData, sectionId: val })}
                    placeholder="Select Section"
                    options={sections.map(s => ({ label: s.name, value: s._id }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700 uppercase">Start Date <span className="text-rose-500">*</span></Label>
                    <Input type="date" value={formData.date ? formData.date.substring(0, 10) : ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700 uppercase">End Date</Label>
                    <Input type="date" value={formData.endDate ? formData.endDate.substring(0, 10) : ''} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700 uppercase">Start <span className="text-rose-500">*</span></Label>
                    <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86] px-2" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700 uppercase">End <span className="text-rose-500">*</span></Label>
                    <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86] px-2" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700 uppercase">Mins</Label>
                    <Input type="number" min="5" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86] px-2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Passing Percentage (%)</Label>
                  <Input type="number" min="0" max="100" placeholder="50"
                    value={formData.minPercentage} onChange={(e) => setFormData({ ...formData, minPercentage: e.target.value })}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Instructions for Students</Label>
                  <textarea
                    placeholder="Enter exam guidelines, allowed attempts, etc..."
                    value={formData.instruction} onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                    className="flex min-h-[70px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#084A86]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoMark"
                    checked={formData.autoMarkRegister}
                    onChange={(e) => setFormData({ ...formData, autoMarkRegister: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 accent-[#084A86]"
                  />
                  <label htmlFor="autoMark" className="text-sm text-zinc-600 cursor-pointer">Auto Mark Register on Submission</label>
                </div>

                <Button disabled={submitting} type="submit" className="w-full bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold py-2.5">
                  {submitting ? 'SAVING...' : 'CREATE ONLINE EXAM'}
                </Button>
              </form>
            </div>
          </div>

          {/* Exam List */}
          <div className="xl:col-span-2">
            <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden h-full flex flex-col">
              <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-zinc-950">Active Exams & Links</h2>
                  <span className="text-xs bg-zinc-200/70 text-zinc-600 px-2 py-0.5 rounded-full font-medium">{exams.length} Exams</span>
                </div>
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search exam title..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-[#084A86]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-100/70 border-b border-zinc-200">
                    <tr>
                      <th className="px-3 py-3 font-semibold">Title</th>
                      <th className="px-3 py-3 font-semibold">Class</th>
                      <th className="px-3 py-3 font-semibold">Subject</th>
                      <th className="px-3 py-3 font-semibold">Date</th>
                      <th className="px-3 py-3 font-semibold">Questions</th>
                      <th className="px-3 py-3 font-semibold">Pass%</th>
                      <th className="px-3 py-3 font-semibold text-right">Actions & Share Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {loading ? (
                      <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">Loading exams...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-10 text-center">
                          <div className="flex flex-col items-center gap-2 text-zinc-400">
                            <BookOpen className="h-8 w-8" />
                            <span className="text-sm">No online exams created yet</span>
                            <span className="text-xs">Fill the form on the left to create your first exam</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(item => {
                        const isCopied = copiedId === item._id;
                        const questionCount = item.questions?.length || 0;

                        return (
                          <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="px-3 py-3 font-medium text-zinc-950 max-w-[140px] truncate" title={item.title}>
                              <div>{item.title}</div>
                              <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {item.startTime} - {item.endTime} ({item.duration || 30}m)
                              </div>
                            </td>
                            <td className="px-3 py-3 text-zinc-700 text-xs font-semibold">
                              {getClassName(item.classId)}
                              {item.sectionId ? ` (${getSectionName(item.sectionId)})` : ''}
                            </td>
                            <td className="px-3 py-3 text-zinc-700 text-xs">{getSubjectName(item.subjectId)}</td>
                            <td className="px-3 py-3 text-zinc-700 text-xs font-medium whitespace-nowrap">
                              {formatDateDMY(item.date)}
                            </td>
                            <td className="px-3 py-3">
                              <button
                                onClick={() => setManagingQuestionsExam(item)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#084A86] hover:bg-blue-100 transition-colors"
                                title="Click to manage questions"
                              >
                                <ListPlus className="h-3 w-3" />
                                {questionCount} Qs
                              </button>
                            </td>
                            <td className="px-3 py-3">
                              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {item.minPercentage || 50}%
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-1 flex-wrap">
                                {/* COPY EXAM LINK BUTTON */}
                                <Button
                                  onClick={() => handleCopyLink(item)}
                                  size="sm"
                                  variant="outline"
                                  className={`h-7 px-2 text-xs font-bold transition-all border ${
                                    isCopied
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'bg-blue-50 text-[#084A86] border-blue-200 hover:bg-blue-100'
                                  }`}
                                  title="Copy Exam URL for Students"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 mr-1" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5 mr-1" />
                                      Copy Link
                                    </>
                                  )}
                                </Button>

                                <Button
                                  onClick={() => setManagingQuestionsExam(item)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-zinc-700 hover:bg-zinc-100 text-xs"
                                  title="Add / Edit Questions"
                                >
                                  <ListPlus className="h-3.5 w-3.5 mr-1" />
                                  Questions
                                </Button>

                                <Button
                                  onClick={() => setEditingExam(item)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-zinc-700 hover:bg-zinc-100 text-xs"
                                  title="Edit Exam Settings"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  onClick={() => setPreviewExam(item)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[#084A86] hover:bg-blue-50 text-xs"
                                  title="Preview as Student"
                                >
                                  Preview
                                </Button>

                                <Button
                                  onClick={() => handleDelete(item._id)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-rose-500 hover:bg-rose-50 text-xs"
                                  title="Delete Exam"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
