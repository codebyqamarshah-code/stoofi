'use client';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SetupExamRulePage() {
  const [cbt, setCbt] = useState('0');
  const [firstTerm, setFirstTerm] = useState('0');
  
  return (
    <div className="min-h-screen bg-zinc-950 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white">Setup Exam Rule</h1>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-200">Dashboard</Link><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Examination</span><span className="mx-2">|</span>
          <span className="hover:text-zinc-200 cursor-pointer">Settings</span><span className="mx-2">|</span>
          <span className="text-indigo-400 font-medium">Setup Exam Rule</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6">
          <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Setup Final Exam Rule</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase">EXAM TYPE CBT (%)</span>
              <input type="number" value={cbt} onChange={e => setCbt(e.target.value)} className="w-32 bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase">EXAM TYPE FIRST TERM EXAM (%)</span>
              <input type="number" value={firstTerm} onChange={e => setFirstTerm(e.target.value)} className="w-32 bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div className="pt-2 text-xs font-semibold text-zinc-400 uppercase">
              TOTAL MARK 100%
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2 rounded-lg transition-colors">? STORE</button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-6">Mark Contribution</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50">
                <th className="text-left text-xs font-semibold text-zinc-400 pb-3">EXAM TERM</th>
                <th className="text-right text-xs font-semibold text-zinc-400 pb-3">PERCENTAGE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 font-semibold text-zinc-200">Total</td>
                <td className="py-4 text-right font-semibold text-zinc-200">0%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6">
          <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Do you want to skip this step for mark register/store?</h2>
          
          <div className="space-y-3">
            <div className="text-xs font-bold text-indigo-900 dark:text-indigo-100 uppercase">NAME OF STEP</div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-700 rounded focus:ring-indigo-500" />
              <span className="text-sm text-zinc-400">Exam Schedule</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-700 rounded focus:ring-indigo-500" />
              <span className="text-sm text-zinc-400">Exam Attendance</span>
            </label>
          </div>
          
          <div className="flex justify-center mt-6">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2 rounded-lg transition-colors">? UPDATE</button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6">
          <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Merit List Contribution Using</h2>
          
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="merit" className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-700 focus:ring-indigo-500" />
              <span className="text-sm text-zinc-400">Total Mark</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="merit" className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-700 focus:ring-indigo-500" />
              <span className="text-sm text-zinc-400">Total Grade</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="merit" defaultChecked className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-700 focus:ring-indigo-500" />
              <span className="text-sm text-zinc-400">Roll Number</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-6">Result Print Style</h2>
        
        <div className="flex flex-wrap gap-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-700 rounded focus:ring-indigo-500" />
            <span className="text-sm text-zinc-400">With Profile Image</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-700 rounded focus:ring-indigo-500" />
            <span className="text-sm text-zinc-400">With Header Background</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-700 rounded focus:ring-indigo-500" />
            <span className="text-sm text-zinc-400">With Body Background</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-indigo-600 bg-zinc-950 border-zinc-700 rounded focus:ring-indigo-500" />
            <span className="text-sm text-zinc-400">With Vertical Border</span>
          </label>
        </div>
      </div>
    </div>
  );
}
