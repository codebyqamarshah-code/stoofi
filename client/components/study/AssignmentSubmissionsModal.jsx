'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Award, 
  Plus, 
  FileText, 
  User, 
  Send,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDMY } from '@/lib/utils';
import api from '@/services/api';

export default function AssignmentSubmissionsModal({ assignment, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // New submission form
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [file, setFile] = useState(null);

  if (!assignment) return null;

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStartGrading = (sub) => {
    setGradingSubmission(sub);
    setMarks(sub.marksObtained !== undefined ? String(sub.marksObtained) : '');
    setFeedback(sub.teacherFeedback || '');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      setSaving(true);
      const res = await api.patch(`/study-material/${assignment._id}/submit`, {
        submissionId: gradingSubmission._id,
        marksObtained: Number(marks) || 0,
        teacherFeedback: feedback.trim(),
        status: 'Graded',
        gradedBy: 'Academic Evaluator'
      });

      if (res && res.success) {
        showToast('Evaluation saved successfully!');
        setGradingSubmission(null);
        if (onRefresh) onRefresh();
      } else {
        showToast(res?.message || 'Failed to save grading', true);
      }
    } catch (err) {
      showToast(err.message || 'Error updating marks', true);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubmission = async (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      showToast('Student name is required', true);
      return;
    }

    try {
      setSaving(true);
      let fileUrl = '';
      if (file) {
        fileUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      const res = await api.post(`/study-material/${assignment._id}/submit`, {
        studentName: studentName.trim(),
        rollNo: rollNo.trim(),
        remarks: remarks.trim(),
        fileName: file ? file.name : 'work_sheet.pdf',
        fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB',
        fileUrl
      });

      if (res && res.success) {
        showToast('Submission recorded successfully!');
        setStudentName('');
        setRollNo('');
        setRemarks('');
        setFile(null);
        setActiveTab('list');
        if (onRefresh) onRefresh();
      } else {
        showToast(res?.message || 'Failed to record submission', true);
      }
    } catch (err) {
      showToast(err.message || 'Error adding submission', true);
    } finally {
      setSaving(false);
    }
  };

  const submissions = assignment.submissions || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Toast */}
        {toast && (
          <div className={`p-3 text-xs font-bold text-center ${
            toast.isError ? 'bg-rose-50 text-rose-800 border-b border-rose-200' : 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-zinc-50 to-emerald-50/40 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                Assignment Submissions
              </span>
              <span className="text-xs text-zinc-500 font-semibold">{assignment.className} ({assignment.section})</span>
            </div>
            <h2 className="text-base font-bold text-zinc-950 mt-1">{assignment.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header Tabs & Quick Stats */}
        <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('list'); setGradingSubmission(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list' ? 'bg-[#009966] text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              All Submissions ({submissions.length})
            </button>
            <button
              onClick={() => { setActiveTab('add'); setGradingSubmission(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'add' ? 'bg-[#009966] text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Record Submission
            </button>
          </div>

          <div className="text-xs font-bold text-zinc-600">
            Total Marks: <span className="text-zinc-950">{assignment.totalMarks || 100}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'list' ? (
            <>
              {gradingSubmission ? (
                /* Inline Grading Form */
                <form onSubmit={handleSaveGrade} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Evaluating Student Work</h4>
                      <p className="text-sm font-bold text-[#009966]">{gradingSubmission.studentName} ({gradingSubmission.rollNo})</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setGradingSubmission(null)}
                      className="text-xs text-zinc-500 hover:text-zinc-800"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-zinc-800">
                        Marks Awarded (Max {assignment.totalMarks || 100}) <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max={assignment.totalMarks || 100}
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        placeholder="e.g. 88"
                        required
                        className="bg-white border-zinc-300 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-zinc-800">Teacher Remarks / Feedback</Label>
                      <Input
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="e.g. Excellent work on practical diagram labeling"
                        className="bg-white border-zinc-300"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setGradingSubmission(null)}
                      className="text-xs font-semibold"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      size="sm"
                      className="bg-[#009966] hover:bg-[#007a52] text-white font-bold text-xs"
                    >
                      {saving ? 'Saving...' : 'Save & Grade Submission'}
                    </Button>
                  </div>
                </form>
              ) : null}

              {/* Submissions Table */}
              <div className="border border-zinc-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 text-zinc-700 font-bold uppercase border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Roll No</th>
                      <th className="px-4 py-3">Submitted At</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Marks</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {submissions.length > 0 ? (
                      submissions.map((sub, idx) => (
                        <tr key={sub._id || idx} className="hover:bg-zinc-50 font-medium">
                          <td className="px-4 py-3">
                            <div className="font-bold text-zinc-950">{sub.studentName}</div>
                            {sub.fileName && (
                              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{sub.fileName}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-700 font-mono">{sub.rollNo || '-'}</td>
                          <td className="px-4 py-3 text-zinc-600">{formatDateDMY(sub.submittedAt)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              sub.status === 'Graded' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              sub.status === 'Late' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                              'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-zinc-900">
                            {sub.status === 'Graded' ? (
                              <span className="text-[#009966]">{sub.marksObtained} / {assignment.totalMarks || 100}</span>
                            ) : (
                              <span className="text-zinc-400">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartGrading(sub)}
                              className="h-7 text-[11px] font-bold border-zinc-300 text-zinc-800 bg-white hover:bg-zinc-100"
                            >
                              {sub.status === 'Graded' ? 'Re-grade' : 'Grade'}
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-zinc-500">
                          No student submissions recorded yet for this assignment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* Add Submission Form */
            <form onSubmit={handleAddSubmission} className="space-y-4 max-w-xl mx-auto py-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800">
                  Student Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Ali Raza"
                  required
                  className="bg-white border-zinc-300"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800">Student Roll / Reg No</Label>
                <Input
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. PRC-2026-001"
                  className="bg-white border-zinc-300"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800">Student Submission Remarks</Label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Notes, clinical scenarios completed, or references..."
                  className="w-full min-h-[70px] rounded-md border border-zinc-300 p-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-800">Attach Student Assignment File</Label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-xs text-zinc-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('list')}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  size="sm"
                  className="bg-[#009966] hover:bg-[#007a52] text-white font-bold text-xs"
                >
                  {saving ? 'Submitting...' : 'Record Student Submission'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold border-zinc-300 bg-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
