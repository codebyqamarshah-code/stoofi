'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Download, Printer, FileText, 
  Shield, PlusCircle, MinusCircle, ListFilter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import behaviourService from '@/services/behaviourService';

export default function IncidentWiseReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await behaviourService.getIncidentWiseReport();
      setReports(data);
    } catch (err) {
      console.error('Failed to load incident wise report:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.incidentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.affectedClasses || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || r.pointType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [reports, searchQuery, typeFilter]);

  const exportData = filtered.map(r => ({
    'Incident Title': r.incidentTitle,
    'Type': r.pointType === 'positive' ? 'Positive' : 'Negative',
    'Point Value': r.point > 0 ? `+${r.point}` : r.point,
    'Times Assigned': r.totalCount,
    'Students Count': r.uniqueStudentsCount,
    'Classes Affected': r.affectedClasses || '-',
    'Last Occurred': r.lastDate
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Incident Wise Report</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Frequency breakdown, affected students and classes per incident rule</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-400">Behaviour</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Incident Wise Report</span>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input 
              placeholder="Search incidents or classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl focus-visible:ring-zinc-950"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${typeFilter === 'all' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'}`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('positive')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${typeFilter === 'positive' ? 'bg-white text-emerald-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'}`}
            >
              <PlusCircle className="w-3 h-3 text-emerald-600" /> Positive
            </button>
            <button
              onClick={() => setTypeFilter('negative')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${typeFilter === 'negative' ? 'bg-white text-rose-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'}`}
            >
              <MinusCircle className="w-3 h-3 text-rose-600" /> Negative
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button 
            onClick={() => exportToCSV(exportData, 'Incident_Wise_Behaviour_Report')} 
            variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Download CSV"
          >
            <Download className="h-4 w-4 text-zinc-700" />
          </Button>
          <Button 
            onClick={() => exportToExcel(exportData, 'Incident_Wise_Behaviour_Report', 'Incidents')} 
            variant="outline" size="icon" className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Export Excel"
          >
            <FileText className="h-4 w-4 text-zinc-700" />
          </Button>
          <Button 
            onClick={() => printData('Incident Wise Behaviour Analytics Report', exportData)} 
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
                <th className="px-5 py-3.5">Incident Title</th>
                <th className="px-5 py-3.5">Point Category</th>
                <th className="px-5 py-3.5 text-center">Frequency (Times)</th>
                <th className="px-5 py-3.5 text-center">Students Involved</th>
                <th className="px-5 py-3.5">Affected Classes</th>
                <th className="px-5 py-3.5 text-right">Last Occurred</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-zinc-400">Loading incident wise report...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-zinc-500">
                    <Shield className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-700">No incident occurrences recorded.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const isPositive = r.pointType === 'positive' || r.point > 0;
                  return (
                    <tr key={r.incidentTitle || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-zinc-950">
                        {r.incidentTitle}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          isPositive 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isPositive ? <PlusCircle className="w-3 h-3" /> : <MinusCircle className="w-3 h-3" />}
                          {isPositive ? `+${Math.abs(r.point)} Pts` : `${r.point} Pts`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-black text-sm text-zinc-950">
                        {r.totalCount}
                      </td>
                      <td className="px-5 py-3.5 text-center font-semibold text-zinc-700">
                        {r.uniqueStudentsCount} students
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600 max-w-xs truncate">
                        {r.affectedClasses || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right text-zinc-500 font-medium">
                        {r.lastDate}
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
