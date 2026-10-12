'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Download, Printer, FileText, Shield, 
  Award, AlertTriangle, TrendingUp, Users, CheckCircle2, Star, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import behaviourService from '@/services/behaviourService';

export default function BehaviourReportPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await behaviourService.getOverallSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load overall behaviour summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (summary?.topStudents || []).map((s, idx) => ({
    'Rank': idx + 1,
    'Student Name': s.studentName,
    'Admission No': s.admissionNo,
    'Class(Section)': `${s.className} (${s.section})`,
    'Behaviour Score': `+${s.score}`,
    'Category': 'Star Conduct Leaderboard'
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Behaviour Analytics & Report</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Comprehensive institution-wide conduct overview, discipline trends & student recognition</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-400">Behaviour</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Behaviour Report</span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Incidents</p>
            <h3 className="text-2xl font-black text-zinc-950 mt-0.5">
              {loading ? '...' : summary?.totalIncidents || 0}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Across all classes</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Positive Points (+)</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-0.5">
              +{loading ? '...' : summary?.totalPositivePoints || 0}
            </h3>
            <p className="text-[10px] text-emerald-600/80 mt-0.5">Merit awards & achievements</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Negative Infractions (-)</p>
            <h3 className="text-2xl font-black text-rose-700 mt-0.5">
              {loading ? '...' : summary?.totalNegativePoints || 0}
            </h3>
            <p className="text-[10px] text-rose-600/80 mt-0.5">Disciplinary penalties</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Net Discipline Score</p>
            <h3 className="text-2xl font-black text-blue-800 mt-0.5">
              {loading ? '...' : (summary?.netScore > 0 ? `+${summary.netScore}` : summary?.netScore || 0)} Pts
            </h3>
            <p className="text-[10px] text-blue-600/80 mt-0.5">Overall school standing</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Star Students Leaderboard vs Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Star Students Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Exemplary Conduct Leaderboard</h3>
                <p className="text-[11px] text-zinc-500">Students with the highest positive merit points</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                onClick={() => exportToExcel(exportData, 'Exemplary_Students_Leaderboard', 'Leaderboard')} 
                variant="outline" size="icon" className="h-7 w-7 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-lg" title="Export Excel"
              >
                <FileText className="h-3 w-3 text-zinc-700" />
              </Button>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 flex-1 p-2">
            {loading ? (
              <p className="text-xs text-zinc-400 text-center py-8">Loading leaderboard...</p>
            ) : (summary?.topStudents || []).length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-8">No positive awards recorded yet.</p>
            ) : (
              (summary?.topStudents || []).map((stu, idx) => (
                <div key={stu.admissionNo || idx} className="p-3 rounded-xl hover:bg-zinc-50 transition-colors flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                      idx === 0 ? 'bg-amber-400 text-zinc-950 shadow-xs' :
                      idx === 1 ? 'bg-zinc-200 text-zinc-800' :
                      idx === 2 ? 'bg-amber-700/20 text-amber-900' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-950">{stu.studentName}</p>
                      <p className="text-[11px] text-zinc-500">{stu.admissionNo} &bull; {stu.className} ({stu.section})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                      +{stu.score} Pts
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Students Requiring Intervention Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-rose-100 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Intervention & Discipline Watch</h3>
                <p className="text-[11px] text-zinc-500">Students with negative infractions requiring counseling</p>
              </div>
            </div>
            <Link href="/dashboard/behaviour/assign">
              <Button size="sm" variant="outline" className="h-7 text-[11px] font-bold border-zinc-200 rounded-lg cursor-pointer">
                Assign Record
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 flex-1 p-2">
            {loading ? (
              <p className="text-xs text-zinc-400 text-center py-8">Loading watch list...</p>
            ) : (summary?.needsAttentionStudents || []).length === 0 ? (
              <div className="text-center py-12 px-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-zinc-800 text-xs">No Disciplinary Red Flags</p>
                <p className="text-zinc-400 text-[11px] mt-0.5">All evaluated students maintain a positive or neutral standing.</p>
              </div>
            ) : (
              (summary?.needsAttentionStudents || []).map((stu, idx) => (
                <div key={stu.admissionNo || idx} className="p-3 rounded-xl hover:bg-zinc-50 transition-colors flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0">
                      !
                    </div>
                    <div>
                      <p className="font-bold text-zinc-950">{stu.studentName}</p>
                      <p className="text-[11px] text-zinc-500">{stu.admissionNo} &bull; {stu.className} ({stu.section})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-xs bg-rose-50 text-rose-700 border border-rose-200">
                      {stu.score} Pts
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
