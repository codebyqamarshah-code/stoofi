'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  BookOpen, 
  Plus, 
  ListOrdered, 
  FileCheck, 
  Calendar, 
  Clock, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Users, 
  Sparkles,
  Paperclip,
  Eye
} from 'lucide-react';
import api from '@/services/api';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';

export default function HomeworkDashboardHub() {
  const [homeworkList, setHomeworkList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hwRes, clsRes, subRes] = await Promise.all([
          api.get('/homework').catch(() => null),
          api.get('/class').catch(() => null),
          api.get('/subject').catch(() => null)
        ]);

        if (hwRes?.success && Array.isArray(hwRes.data)) {
          setHomeworkList(hwRes.data);
        }
        if (clsRes?.success && Array.isArray(clsRes.data)) {
          setClasses(clsRes.data);
        }
        if (subRes?.success && Array.isArray(subRes.data)) {
          setSubjects(subRes.data);
        }
      } catch (err) {
        console.error('Error loading homework overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute live KPIs
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const total = homeworkList.length;
    let active = 0;
    let dueToday = 0;
    let pastDue = 0;
    const subjectSet = new Set();

    homeworkList.forEach(hw => {
      if (hw.subject) subjectSet.add(hw.subject);
      const subDate = hw.submissionDate ? hw.submissionDate.split('T')[0] : '';
      if (subDate === today) {
        dueToday++;
      } else if (subDate > today) {
        active++;
      } else if (subDate && subDate < today) {
        pastDue++;
      }
    });

    return {
      total,
      active,
      dueToday,
      pastDue,
      totalSubjects: subjectSet.size
    };
  }, [homeworkList]);

  // Export configs
  const exportColumns = [
    { key: 'className', label: 'Class' },
    { key: 'section', label: 'Section' },
    { key: 'subject', label: 'Subject' },
    { key: 'marks', label: 'Marks' },
    { key: 'homeworkDate', label: 'Assign Date' },
    { key: 'submissionDate', label: 'Due Date' },
    { key: 'description', label: 'Description' }
  ];

  const exportData = homeworkList.map(hw => ({
    className: hw.className || '—',
    section: hw.section || '—',
    subject: hw.subject || '—',
    marks: hw.marks || '0',
    homeworkDate: hw.homeworkDate ? new Date(hw.homeworkDate).toLocaleDateString() : '—',
    submissionDate: hw.submissionDate ? new Date(hw.submissionDate).toLocaleDateString() : '—',
    description: hw.description || '—'
  }));

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#084A86]" />
            Homework Management Hub
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Assign curriculum homework, manage student submissions, notify classes, and evaluate scores.
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Homework Hub</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Tasks Assigned</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{stats.total}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#084A86]">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Active Upcoming</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.active}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Due Today</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.dueToday}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Past Due / Overdue</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.pastDue}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3 Quick Navigation Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link 
          href="/dashboard/homework/add" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#084A86] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-[#084A86] transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Add & Publish Homework</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Create homework assignments with due dates, maximum marks, file attachments, and broadcast instant notifications to enrolled students.
            </p>
          </div>
          <span className="text-xs font-bold text-[#084A86] mt-4 flex items-center gap-1">
            Create Assignment &rarr;
          </span>
        </Link>

        <Link 
          href="/dashboard/homework/list" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ListOrdered className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-emerald-700 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Homework Directory & List</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Filter by class, section, and subject. Manage assignment descriptions, download student worksheets, and remove expired tasks.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
            Browse Directory &rarr;
          </span>
        </Link>

        <Link 
          href="/dashboard/homework/report" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCheck className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-purple-700 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Evaluation & Reports</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Track student homework submission rates, evaluate student answers, assign marks, and export comprehensive class performance reports.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 mt-4 flex items-center gap-1">
            Review Reports &rarr;
          </span>
        </Link>
      </div>

      {/* Recent Assignments Table */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          <div>
            <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#084A86]" />
              Recent Homework Assignments
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Real-time listing of active and published student assignments</p>
          </div>

          <div className="flex items-center gap-2">
            <TableExportToolbar
              data={exportData}
              columns={exportColumns}
              filename="Homework_Assignments_Report"
            />
            <Link href="/dashboard/homework/add">
              <Button 
                size="sm"
                style={{ backgroundColor: '#084A86' }}
                className="hover:opacity-95 text-white font-bold text-xs h-8 px-3 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Assign Homework
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Class & Section</th>
                <th className="px-4 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Max Marks</th>
                <th className="px-4 py-3.5">Assign Date</th>
                <th className="px-4 py-3.5">Due Date</th>
                <th className="px-4 py-3.5">Attachment</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                      Loading homework assignments...
                    </div>
                  </td>
                </tr>
              ) : homeworkList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    No homework assigned yet. Click &quot;Assign Homework&quot; to publish your first task.
                  </td>
                </tr>
              ) : (
                homeworkList.slice(0, 10).map((hw, idx) => {
                  const subDate = hw.submissionDate ? hw.submissionDate.split('T')[0] : '';
                  const isDueToday = subDate === todayStr;
                  const isOverdue = subDate && subDate < todayStr;
                  const isActive = subDate > todayStr;

                  return (
                    <tr key={hw._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-zinc-500 text-xs">#{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800">
                          {hw.className || 'Class'} ({hw.section || 'A'})
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-zinc-950">
                        {hw.subject || 'Subject'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-zinc-700">
                        {hw.marks || '0'}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 text-xs">
                        {hw.homeworkDate ? new Date(hw.homeworkDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold">
                        <span className={isOverdue ? 'text-rose-600' : isDueToday ? 'text-amber-600' : 'text-zinc-800'}>
                          {hw.submissionDate ? new Date(hw.submissionDate).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {hw.file ? (
                          <a 
                            href={hw.file} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#084A86] hover:underline font-bold"
                          >
                            <Paperclip className="h-3 w-3" />
                            File Attached
                          </a>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isDueToday 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : isOverdue 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isDueToday && <Clock className="h-3 w-3" />}
                          {isOverdue && <AlertCircle className="h-3 w-3" />}
                          {isActive && <CheckCircle2 className="h-3 w-3" />}
                          {isDueToday ? 'Due Today' : isOverdue ? 'Past Due' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link href="/dashboard/homework/list">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2.5 text-xs font-semibold border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-lg inline-flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Manage
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {homeworkList.length > 10 && (
          <div className="p-4 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-500 bg-zinc-50/30">
            <span>Showing top 10 recent assignments of {homeworkList.length}</span>
            <Link href="/dashboard/homework/list" className="text-[#084A86] font-bold hover:underline">
              View All Homework &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
