'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, FileText, 
  School, Shield, RotateCcw, TrendingUp, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import behaviourService from '@/services/behaviourService';

export default function ClassSectionReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await behaviourService.getClassSectionReport();
      setReports(data);
    } catch (err) {
      console.error('Failed to load class section report:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return reports.filter(r => 
      r.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.section.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reports, searchQuery]);

  const getClassStanding = (avg) => {
    const num = Number(avg);
    if (num >= 8) return { label: 'Outstanding Conduct', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (num >= 3) return { label: 'Good Discipline', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (num >= 0) return { label: 'Satisfactory', color: 'bg-zinc-100 text-zinc-800 border-zinc-200' };
    return { label: 'Needs Class Counseling', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const exportData = filtered.map(r => ({
    'Class': r.className,
    'Section': r.section,
    'Students Evaluated': r.studentsCount,
    'Total Incidents': r.totalIncidents,
    'Positive Incidents': r.positiveIncidents,
    'Negative Incidents': r.negativeIncidents,
    'Total Net Points': r.totalPoints > 0 ? `+${r.totalPoints}` : r.totalPoints,
    'Avg Score / Student': `${r.avgScore} pts`,
    'Discipline Standing': getClassStanding(r.avgScore).label
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Class Section Behaviour Report</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Comparative discipline scores, positive achievements & infraction statistics per class & section</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-400">Behaviour</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Class Section Report</span>
        </div>
      </div>

      {/* Top Controls Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input 
            placeholder="Search by Class or Section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl focus-visible:ring-zinc-950"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button 
            onClick={() => exportToCSV(exportData, 'Class_Section_Behaviour_Report')} 
            variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Download CSV"
          >
            <Download className="h-4 w-4 text-zinc-700" />
          </Button>
          <Button 
            onClick={() => exportToExcel(exportData, 'Class_Section_Behaviour_Report', 'Class Report')} 
            variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Export Excel"
          >
            <FileText className="h-4 w-4 text-zinc-700" />
          </Button>
          <Button 
            onClick={() => printData('Class Section Behaviour Comparative Analysis', exportData)} 
            variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Print List"
          >
            <Printer className="h-4 w-4 text-zinc-700" />
          </Button>
        </div>
      </div>

      {/* Report Table Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Class</th>
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5 text-center">Students Evaluated</th>
                <th className="px-5 py-3.5 text-center">Total Incidents</th>
                <th className="px-5 py-3.5 text-center">Positive (+)</th>
                <th className="px-5 py-3.5 text-center">Negative (-)</th>
                <th className="px-5 py-3.5 text-center">Total Net Points</th>
                <th className="px-5 py-3.5 text-center">Avg Score / Student</th>
                <th className="px-5 py-3.5 text-right">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-zinc-400">Loading class section report...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-zinc-500">
                    <School className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-700">No class behavior data recorded.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const standing = getClassStanding(r.avgScore);
                  return (
                    <tr key={`${r.className}_${r.section}` || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-black text-zinc-950">{r.className}</td>
                      <td className="px-5 py-3.5 font-bold text-zinc-700">Section {r.section}</td>
                      <td className="px-5 py-3.5 text-center font-semibold text-zinc-700">{r.studentsCount}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-zinc-800">{r.totalIncidents}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-emerald-600">+{r.positiveIncidents}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-rose-600">-{r.negativeIncidents}</td>
                      <td className="px-5 py-3.5 text-center font-black text-sm">
                        <span className={r.totalPoints >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {r.totalPoints > 0 ? `+${r.totalPoints}` : r.totalPoints}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-zinc-900">
                        {r.avgScore} pts
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${standing.color}`}>
                          {standing.label}
                        </span>
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
  );
}
