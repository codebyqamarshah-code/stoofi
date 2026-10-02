'use client';
import { useState, useEffect } from 'react';
import { ChevronRight, Save, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

const DEFAULT_EXAM_RULE = {
  skipExamSchedule: false,
  skipExamAttendance: false,
  meritListBy: 'Roll Number',
  resultWithProfileImage: true,
  resultWithHeaderBg: true,
  resultWithBodyBg: true,
  resultWithVerticalBorder: false,
  cbt: '0',
  firstTerm: '0'
};

export default function SetupExamRulePage() {
  const [examRule, setExamRule] = useState(DEFAULT_EXAM_RULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/setting');
      if (res?.success && res.data?.examRule) {
        setExamRule({ ...DEFAULT_EXAM_RULE, ...res.data.examRule });
      }
    } catch (e) {
      console.error('Failed to fetch exam rule settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      await api.put('/setting', { examRule });
      setNotification(`${section} saved successfully!`);
    } catch (e) {
      setNotification('Failed to save. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(''), 3500);
    }
  };

  const totalPercent = (parseInt(examRule.cbt) || 0) + (parseInt(examRule.firstTerm) || 0);

  return (
    <div className="space-y-6 p-6 space-y-6">
      {notification && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border shadow-xl text-sm font-semibold ${notification.includes('Failed') ? 'bg-rose-900 border-rose-700 text-rose-200' : 'bg-emerald-900 border-emerald-700 text-emerald-200'}`}>
          <Check className="h-4 w-4" />{notification}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold text-zinc-950">Setup Exam Rule</h1>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-200">Dashboard</Link><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Examination</span><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Settings</span><span className="mx-2">|</span>
          <span className="text-indigo-400 font-medium">Setup Exam Rule</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          <span className="ml-3 text-sm text-zinc-400">Loading settings...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Final Exam Rule */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-8 space-y-6">
            <h2 className="text-sm font-semibold text-zinc-950">Setup Final Exam Rule</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 uppercase font-bold">EXAM TYPE CBT (%)</span>
                <input
                  type="number"
                  value={examRule.cbt}
                  onChange={e => setExamRule({ ...examRule, cbt: e.target.value })}
                  className="w-32 bg-white border border-zinc-200 shadow-xs text-zinc-950 text-sm rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 uppercase font-bold">EXAM TYPE FIRST TERM EXAM (%)</span>
                <input
                  type="number"
                  value={examRule.firstTerm}
                  onChange={e => setExamRule({ ...examRule, firstTerm: e.target.value })}
                  className="w-32 bg-white border border-zinc-200 shadow-xs text-zinc-950 text-sm rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className={`pt-2 text-xs font-semibold uppercase ${totalPercent > 100 ? 'text-rose-400' : 'text-zinc-400'}`}>
                TOTAL MARK: {totalPercent}% {totalPercent > 100 ? '(exceeds 100%)' : totalPercent === 100 ? '✓' : ''}
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={() => handleSave('Exam Rule')}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                STORE
              </button>
            </div>
          </div>

          {/* Mark Contribution */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-8">
            <h2 className="text-sm font-semibold text-zinc-950 mb-6">Mark Contribution</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200/50">
                  <th className="text-left text-xs font-semibold text-zinc-700 font-bold pb-3">EXAM TERM</th>
                  <th className="text-right text-xs font-semibold text-zinc-700 font-bold pb-3">PERCENTAGE</th>
                </tr>
              </thead>
              <tbody>
                {parseInt(examRule.cbt) > 0 && (
                  <tr>
                    <td className="py-3 font-medium text-zinc-950">CBT</td>
                    <td className="py-3 text-right font-medium text-zinc-950">{examRule.cbt}%</td>
                  </tr>
                )}
                {parseInt(examRule.firstTerm) > 0 && (
                  <tr>
                    <td className="py-3 font-medium text-zinc-950">First Term</td>
                    <td className="py-3 text-right font-medium text-zinc-950">{examRule.firstTerm}%</td>
                  </tr>
                )}
                <tr className="border-t border-zinc-200">
                  <td className="py-4 font-semibold text-zinc-200">Total</td>
                  <td className={`py-4 text-right font-semibold ${totalPercent > 100 ? 'text-rose-400' : 'text-zinc-200'}`}>{totalPercent}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Skip Steps */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-8 space-y-6">
            <h2 className="text-sm font-semibold text-zinc-950">Do you want to skip this step for mark register/store?</h2>
            
            <div className="space-y-3">
              <div className="text-xs font-bold text-zinc-700 uppercase font-bold">NAME OF STEP</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={examRule.skipExamSchedule}
                  onChange={e => setExamRule({ ...examRule, skipExamSchedule: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 bg-white border-zinc-200 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-zinc-950">Exam Schedule</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={examRule.skipExamAttendance}
                  onChange={e => setExamRule({ ...examRule, skipExamAttendance: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 bg-white border-zinc-200 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-zinc-950">Exam Attendance</span>
              </label>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={() => handleSave('Skip Steps')}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                UPDATE
              </button>
            </div>
          </div>

          {/* Merit List */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-8 space-y-6">
            <h2 className="text-sm font-semibold text-zinc-950">Merit List Contribution Using</h2>
            
            <div className="flex items-center gap-6">
              {['Total Mark', 'Total Grade', 'Roll Number'].map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="merit"
                    checked={examRule.meritListBy === option}
                    onChange={() => setExamRule({ ...examRule, meritListBy: option })}
                    className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-200 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-zinc-950">{option}</span>
                </label>
              ))}
            </div>
            
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handleSave('Merit List')}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                UPDATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Print Style */}
      {!loading && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-8 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-950 mb-6">Result Print Style</h2>
          
          <div className="flex flex-wrap gap-8 mb-6">
            {[
              { key: 'resultWithProfileImage', label: 'With Profile Image' },
              { key: 'resultWithHeaderBg', label: 'With Header Background' },
              { key: 'resultWithBodyBg', label: 'With Body Background' },
              { key: 'resultWithVerticalBorder', label: 'With Vertical Border' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!examRule[key]}
                  onChange={e => setExamRule({ ...examRule, [key]: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 bg-white border-zinc-200 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-zinc-950">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => handleSave('Result Print Style')}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              SAVE RESULT STYLE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
