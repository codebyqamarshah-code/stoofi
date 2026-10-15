'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Save, Plus, Trash2, CheckCircle, AlertCircle,
  Bell, Star, BarChart2, Settings, GripVertical
} from 'lucide-react';
import api from '@/services/api';

const DEFAULT_CRITERIA = [
  { id: 1, name: 'Communication Skills', weight: 20 },
  { id: 2, name: 'Subject Knowledge', weight: 25 },
  { id: 3, name: 'Classroom Management', weight: 20 },
  { id: 4, name: 'Punctuality & Attendance', weight: 15 },
  { id: 5, name: 'Student Engagement', weight: 20 },
];

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-semibold transition-all ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {message}
      <button onClick={onClose} className="ml-2 text-white/70 hover:text-white text-lg leading-none">&times;</button>
    </div>
  );
}

export default function TeacherEvaluationSettingsPage() {
  const [evaluation, setEvaluation] = useState('Enable');
  const [evaluationApproval, setEvaluationApproval] = useState('Auto');
  const [submittedBy, setSubmittedBy] = useState('Student');
  const [submissionTime, setSubmissionTime] = useState('Any Time');
  const [ratingScale, setRatingScale] = useState('1-10');
  const [emailNotification, setEmailNotification] = useState(true);
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [newCriteria, setNewCriteria] = useState({ name: '', weight: '' });
  const [saving, setSaving] = useState({ evaluation: false, submission: false, criteria: false });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/teacher-evaluation-settings').catch(() => null);
        if (res?.data) {
          const d = res.data;
          if (d.evaluation) setEvaluation(d.evaluation);
          if (d.evaluationApproval) setEvaluationApproval(d.evaluationApproval);
          if (d.submittedBy) setSubmittedBy(d.submittedBy);
          if (d.submissionTime) setSubmissionTime(d.submissionTime);
          if (d.ratingScale) setRatingScale(d.ratingScale);
          if (typeof d.emailNotification === 'boolean') setEmailNotification(d.emailNotification);
          if (Array.isArray(d.criteria) && d.criteria.length > 0) setCriteria(d.criteria);
        }
      } catch (e) { /* use defaults */ }
    };
    loadSettings();
  }, []);

  const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);

  const handleAddCriteria = () => {
    if (!newCriteria.name.trim()) return showToast('Please enter a criteria name.', 'error');
    if (!newCriteria.weight || Number(newCriteria.weight) <= 0) return showToast('Please enter a valid weight.', 'error');
    if (totalWeight + Number(newCriteria.weight) > 100) return showToast('Total weight cannot exceed 100%.', 'error');
    setCriteria(prev => [...prev, { id: Date.now(), name: newCriteria.name.trim(), weight: Number(newCriteria.weight) }]);
    setNewCriteria({ name: '', weight: '' });
  };

  const handleRemoveCriteria = (id) => setCriteria(prev => prev.filter(c => c.id !== id));

  const handleUpdateWeight = (id, weight) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, weight: Number(weight) } : c));
  };

  const handleSave = async (type) => {
    setSaving(prev => ({ ...prev, [type]: true }));
    try {
      const payload = type === 'evaluation'
        ? { evaluation, evaluationApproval, ratingScale, emailNotification }
        : type === 'submission'
        ? { submittedBy, submissionTime }
        : { criteria };

      await api.post('/teacher-evaluation-settings', { ...payload, type }).catch(() => null);
      showToast(
        type === 'evaluation' ? 'Evaluation settings saved successfully!'
        : type === 'submission' ? 'Submission settings saved successfully!'
        : 'Evaluation criteria saved successfully!'
      );
    } catch {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setSaving(prev => ({ ...prev, [type]: false }));
    }
  };

  const radioClass = "w-4 h-4 accent-[#084A86] cursor-pointer";
  const selectClass = "w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-[#084A86]/40 focus:border-[#084A86]";
  const inputClass = "w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-[#084A86]/40 focus:border-[#084A86]";
  const saveBtn = (type) => `flex items-center gap-2 px-6 py-2 bg-[#084A86] hover:bg-[#073b6b] text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-60`;

  return (
    <div className="space-y-6">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#084A86]" /> Teacher Evaluation Settings
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Configure evaluation parameters, criteria, and notification preferences.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
          <span>Teacher Evaluation</span>
          <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Settings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Evaluation Settings */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
            <Star className="w-4 h-4 text-[#084A86]" />
            <h2 className="text-base font-bold text-zinc-950">Evaluation Settings</h2>
          </div>
          <div className="p-6 flex-1 space-y-6">
            {/* Enable/Disable */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">Evaluation Status</label>
              <div className="flex items-center gap-6">
                {['Enable', 'Disable'].map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="evaluation" value={v} checked={evaluation === v}
                      onChange={e => setEvaluation(e.target.value)} className={radioClass} />
                    <span className={`text-sm font-semibold ${evaluation === v ? 'text-[#084A86]' : 'text-zinc-700'}`}>{v}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Approval Mode */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">Evaluation Approval</label>
              <div className="flex items-center gap-6">
                {['Auto', 'Manual'].map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="approval" value={v} checked={evaluationApproval === v}
                      onChange={e => setEvaluationApproval(e.target.value)} className={radioClass} />
                    <span className={`text-sm font-semibold ${evaluationApproval === v ? 'text-[#084A86]' : 'text-zinc-700'}`}>{v}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Scale */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">
                <BarChart2 className="inline w-3.5 h-3.5 mr-1" />Rating Scale
              </label>
              <select value={ratingScale} onChange={e => setRatingScale(e.target.value)} className={selectClass}>
                <option value="1-5">1 to 5 Stars</option>
                <option value="1-10">1 to 10 Points</option>
                <option value="1-100">Percentage (1–100)</option>
              </select>
            </div>

            {/* Email Notification */}
            <div className="flex items-center justify-between p-3 bg-[#084A86]/5 rounded-lg border border-[#084A86]/20">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#084A86]" />
                <div>
                  <p className="text-sm font-bold text-zinc-800">Email Notification</p>
                  <p className="text-xs text-zinc-500">Notify admin when evaluation is submitted</p>
                </div>
              </div>
              <button
                onClick={() => setEmailNotification(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotification ? 'bg-[#084A86]' : 'bg-zinc-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${emailNotification ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="p-4 border-t border-zinc-100 flex justify-center bg-zinc-50/30">
            <button onClick={() => handleSave('evaluation')} disabled={saving.evaluation} className={saveBtn('evaluation')}>
              <Save className="w-4 h-4" /> {saving.evaluation ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Card 2: Submission Settings */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-base font-bold text-zinc-950">Submission Settings</h2>
          </div>
          <div className="p-6 flex-1 space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">Submitted By</label>
              <div className="flex flex-wrap gap-6">
                {['Student', 'Parent', 'Admin', 'Coordinator'].map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="submittedBy" value={v} checked={submittedBy === v}
                      onChange={e => setSubmittedBy(e.target.value)} className={radioClass} />
                    <span className={`text-sm font-semibold ${submittedBy === v ? 'text-[#084A86]' : 'text-zinc-700'}`}>{v}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">Submission Time</label>
              <div className="flex flex-wrap gap-6">
                {['Any Time', 'Fixed Time', 'End of Term'].map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="submissionTime" value={v} checked={submissionTime === v}
                      onChange={e => setSubmissionTime(e.target.value)} className={radioClass} />
                    <span className={`text-sm font-semibold ${submissionTime === v ? 'text-[#084A86]' : 'text-zinc-700'}`}>{v}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-zinc-100 flex justify-center bg-zinc-50/30">
            <button onClick={() => handleSave('submission')} disabled={saving.submission} className={saveBtn('submission')}>
              <Save className="w-4 h-4" /> {saving.submission ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Evaluation Criteria */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-[#084A86]" />
            <h2 className="text-base font-bold text-zinc-950">Evaluation Criteria</h2>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${totalWeight === 100 ? 'bg-emerald-100 text-emerald-700' : totalWeight > 100 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
            Total Weight: {totalWeight}%
          </span>
        </div>
        <div className="p-6 space-y-4">
          {criteria.map((c, idx) => (
            <div key={c.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <span className="w-6 h-6 bg-[#084A86] text-white text-xs font-black rounded-full flex items-center justify-center shrink-0">{idx + 1}</span>
              <span className="flex-1 text-sm font-semibold text-zinc-800">{c.name}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="1" max="100" value={c.weight}
                  onChange={e => handleUpdateWeight(c.id, e.target.value)}
                  className="w-20 text-center border border-zinc-300 rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#084A86]/40"
                />
                <span className="text-xs text-zinc-500 font-bold">%</span>
                <div className="w-24 bg-zinc-200 rounded-full h-2">
                  <div className="bg-[#084A86] h-2 rounded-full transition-all" style={{ width: `${Math.min(c.weight, 100)}%` }} />
                </div>
              </div>
              <button onClick={() => handleRemoveCriteria(c.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add new criteria */}
          <div className="flex items-center gap-3 p-3 border border-dashed border-[#084A86]/40 rounded-lg bg-[#084A86]/3">
            <Plus className="w-5 h-5 text-[#084A86] shrink-0" />
            <input
              type="text" placeholder="Criteria name (e.g. Innovation)"
              value={newCriteria.name}
              onChange={e => setNewCriteria(prev => ({ ...prev, name: e.target.value }))}
              className={`flex-1 ${inputClass}`}
            />
            <input
              type="number" placeholder="%" min="1" max="100"
              value={newCriteria.weight}
              onChange={e => setNewCriteria(prev => ({ ...prev, weight: e.target.value }))}
              className="w-24 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-[#084A86]/40"
            />
            <button onClick={handleAddCriteria} className="px-4 py-2 bg-[#084A86] hover:bg-[#073b6b] text-white text-sm font-bold rounded-lg transition-colors">
              Add
            </button>
          </div>
        </div>
        <div className="p-4 border-t border-zinc-100 flex justify-center bg-zinc-50/30">
          <button onClick={() => handleSave('criteria')} disabled={saving.criteria || totalWeight !== 100} className={saveBtn('criteria')}>
            <Save className="w-4 h-4" />
            {saving.criteria ? 'Saving...' : totalWeight !== 100 ? `Weight must equal 100% (currently ${totalWeight}%)` : 'Save Criteria'}
          </button>
        </div>
      </div>
    </div>
  );
}
