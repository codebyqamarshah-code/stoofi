'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Search, Download, Printer, FileText,
  Shield, PlusCircle, MinusCircle, User, Award, Eye, X, RotateCcw,
  CheckCircle2, AlertTriangle, TrendingUp, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';
import behaviourService from '@/services/behaviourService';
import api from '@/services/api';

const DEFAULT_CLASSES = ['BS Psychology', 'BS RIT', 'DPT', 'FSC Dental', 'FSC NURSING', 'FSC OTT'];
const SECTIONS = ['A', 'B', 'C', 'D'];

export default function StudentIncidentReportPage() {
  const [reportList, setReportList] = useState([]);
  const [classList, setClassList] = useState(DEFAULT_CLASSES);
  const [incidentsList, setIncidentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignModalStudent, setAssignModalStudent] = useState(null);
  const [assignForm, setAssignForm] = useState({
    incidentTitle: '',
    point: 5,
    pointType: 'positive',
    remarks: '',
    incidentDate: new Date().toISOString().split('T')[0]
  });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    // Fetch dynamic classes and incident types
    Promise.all([
      api.get('/class').catch(() => null),
      behaviourService.getIncidents().catch(() => [])
    ]).then(([classRes, incRes]) => {
      if (classRes?.success && Array.isArray(classRes.data) && classRes.data.length > 0) {
        const names = classRes.data.map(c => c.name || c.className).filter(Boolean);
        if (names.length > 0) setClassList(names);
      }
      if (Array.isArray(incRes) && incRes.length > 0) {
        setIncidentsList(incRes);
        setAssignForm(prev => ({
          ...prev,
          incidentTitle: incRes[0].title,
          point: Math.abs(incRes[0].point),
          pointType: incRes[0].pointType
        }));
      }
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [classFilter, sectionFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await behaviourService.getStudentReport({
        className: classFilter,
        section: sectionFilter
      });
      setReportList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load student incident report:', err);
      setReportList([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const filteredList = useMemo(() => {
    return reportList.filter(item => {
      const s = searchQuery.toLowerCase();
      const name = (item.studentName || '').toLowerCase();
      const adm = (item.admissionNo || '').toLowerCase();
      return name.includes(s) || adm.includes(s);
    });
  }, [reportList, searchQuery]);

  const stats = useMemo(() => {
    const total = reportList.length;
    let exemplary = 0;
    let good = 0;
    let needsAttn = 0;
    reportList.forEach(s => {
      if (s.totalScore >= 10) exemplary++;
      else if (s.totalScore >= 0) good++;
      else needsAttn++;
    });
    return { total, exemplary, good, needsAttn };
  }, [reportList]);

  const getStandingBadge = (score) => {
    if (score >= 20) {
      return { label: 'Exemplary Conduct', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    } else if (score >= 5) {
      return { label: 'Good Standing', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    } else if (score >= 0) {
      return { label: 'Satisfactory', color: 'bg-zinc-100 text-zinc-800 border-zinc-200' };
    } else if (score >= -10) {
      return { label: 'Needs Improvement', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
      return { label: 'Critical Intervention', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
  };

  const handleOpenAssignModal = (student) => {
    setAssignModalStudent(student);
    const defaultInc = incidentsList[0];
    setAssignForm({
      incidentTitle: defaultInc ? defaultInc.title : 'Academic Excellence & High Test Score',
      point: defaultInc ? Math.abs(defaultInc.point) : 5,
      pointType: defaultInc ? defaultInc.pointType : 'positive',
      remarks: '',
      incidentDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleSaveAssign = async (e) => {
    e.preventDefault();
    if (!assignModalStudent) return;
    try {
      setAssigning(true);
      await behaviourService.assignIncident({
        studentId: assignModalStudent.studentId,
        studentName: assignModalStudent.studentName,
        admissionNo: assignModalStudent.admissionNo,
        className: assignModalStudent.className,
        section: assignModalStudent.section,
        incidentTitle: assignForm.incidentTitle,
        point: assignForm.point,
        pointType: assignForm.pointType,
        incidentDate: assignForm.incidentDate,
        remarks: assignForm.remarks,
        assignedBy: 'Administration'
      });
      showToast(`Incident recorded for ${assignModalStudent.studentName}!`);
      setAssignModalStudent(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to record incident');
    } finally {
      setAssigning(false);
    }
  };

  const exportData = filteredList.map(item => ({
    'Admission No': item.admissionNo,
    'Student Name': item.studentName,
    'Class(Section)': `${item.className} (${item.section})`,
    'Total Incidents': item.totalIncidents,
    'Positive Points': `+${item.positivePoints}`,
    'Negative Points': `${item.negativePoints}`,
    'Total Score': item.totalScore > 0 ? `+${item.totalScore}` : `${item.totalScore}`,
    'Standing': getStandingBadge(item.totalScore).label
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Student Incident Report</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Individual student conduct scorecards, positive vs negative infractions breakdown</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-400">Behaviour</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Student Report</span>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>Total Evaluated</span>
            <User className="w-4 h-4 text-[#084A86]" />
          </div>
          <p className="text-2xl font-black text-zinc-950 mt-2">{stats.total}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Enrolled Students</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>Exemplary Conduct</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{stats.exemplary}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Score 10+ Points</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 text-xs font-semibold">
            <span>Good / Satisfactory</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{stats.good}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Clean / Positive Record</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{stats.needsAttn}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Negative Score</p>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Search by Name / Admission No</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl text-zinc-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Filter Class</Label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              <option value="">All Classes</option>
              {classList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Filter Section</Label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              <option value="">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
        </div>

        {(classFilter || sectionFilter || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
            <span className="text-zinc-500">Filtered: <strong>{filteredList.length}</strong> students evaluated</span>
            <button
              onClick={() => { setClassFilter(''); setSectionFilter(''); setSearchQuery(''); }}
              className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Report Table Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-950">Student Behaviour Directory</h3>
            <p className="text-[11px] text-zinc-500">Showing {filteredList.length} students with behavior metrics</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/behaviour/assign"
              className="inline-flex items-center gap-1.5 bg-[#084A86] hover:bg-[#0c3559] text-white text-xs font-semibold px-3 h-8 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Incident</span>
            </Link>

            <Button
              onClick={() => exportToCSV(exportData, 'Student_Behaviour_Report')}
              variant="outline" size="icon" className="h-8 w-8 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Download CSV"
            >
              <Download className="h-3.5 w-3.5 text-zinc-700" />
            </Button>
            <Button
              onClick={() => exportToExcel(exportData, 'Student_Behaviour_Report', 'Report')}
              variant="outline" size="icon" className="h-8 w-8 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Export Excel"
            >
              <FileText className="h-3.5 w-3.5 text-zinc-700" />
            </Button>
            <Button
              onClick={() => printData('Student Incident Behaviour Scorecard', exportData)}
              variant="outline" size="icon" className="h-8 w-8 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Print Report"
            >
              <Printer className="h-3.5 w-3.5 text-zinc-700" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Admission No</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Class (Sec)</th>
                <th className="px-5 py-3.5 text-center">Total Incidents</th>
                <th className="px-5 py-3.5 text-center">Positive (+)</th>
                <th className="px-5 py-3.5 text-center">Negative (-)</th>
                <th className="px-5 py-3.5 text-center">Total Score</th>
                <th className="px-5 py-3.5">Standing</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-zinc-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#084A86] border-t-transparent rounded-full animate-spin" />
                      <span>Loading student behavior directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-zinc-500">
                    <Shield className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-700">No student incident reports match the criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const badge = getStandingBadge(item.totalScore);
                  return (
                    <tr key={item.studentId || item.admissionNo || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-zinc-950 font-mono">{item.admissionNo}</td>
                      <td className="px-5 py-3.5 font-semibold text-zinc-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#084A86]/10 text-[#084A86] font-bold text-[11px] flex items-center justify-center shrink-0">
                            {item.studentName?.charAt(0) || 'S'}
                          </div>
                          <span>{item.studentName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600 font-medium">
                        {item.className} ({item.section})
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-zinc-700">
                        {item.totalIncidents}
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-emerald-600">
                        +{item.positivePoints}
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-rose-600">
                        {item.negativePoints}
                      </td>
                      <td className="px-5 py-3.5 text-center font-black text-sm">
                        <span className={item.totalScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {item.totalScore > 0 ? `+${item.totalScore}` : item.totalScore}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(item)}
                            className="h-7 px-2.5 text-[11px] font-bold rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 cursor-pointer flex items-center gap-1 transition-colors"
                            title="View Incident History"
                          >
                            <Eye className="w-3.5 h-3.5 text-zinc-500" />
                            <span>History</span>
                          </button>
                          <button
                            onClick={() => handleOpenAssignModal(item)}
                            className="h-7 px-2 text-[11px] font-bold rounded-lg bg-[#084A86] hover:bg-[#0c3559] text-white cursor-pointer flex items-center gap-1 transition-colors"
                            title="Assign Incident to Student"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Award</span>
                          </button>
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

      {/* Incident History Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#084A86] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {selectedStudent.studentName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-950">{selectedStudent.studentName}</h3>
                  <p className="text-xs text-zinc-500">
                    {selectedStudent.admissionNo} &bull; {selectedStudent.className} ({selectedStudent.section})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Summary Banner */}
            <div className="px-6 py-4 bg-zinc-100/60 border-b border-zinc-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Total Incidents</p>
                <p className="text-lg font-black text-zinc-950 mt-0.5">{selectedStudent.totalIncidents}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Positive / Negative</p>
                <p className="text-lg font-black text-zinc-950 mt-0.5">
                  <span className="text-emerald-600">+{selectedStudent.positivePoints}</span>
                  <span className="text-zinc-400 mx-1">/</span>
                  <span className="text-rose-600">{selectedStudent.negativePoints}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Net Behaviour Score</p>
                <p className={`text-lg font-black mt-0.5 ${selectedStudent.totalScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedStudent.totalScore > 0 ? `+${selectedStudent.totalScore}` : selectedStudent.totalScore} Pts
                </p>
              </div>
            </div>

            {/* Incident Timeline */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Chronological Incident Records
                </h4>
                <button
                  onClick={() => {
                    const stu = selectedStudent;
                    setSelectedStudent(null);
                    handleOpenAssignModal(stu);
                  }}
                  className="text-xs text-[#084A86] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Record New Incident
                </button>
              </div>

              {selectedStudent.incidentsList && selectedStudent.incidentsList.length > 0 ? (
                selectedStudent.incidentsList.map((inc, i) => (
                  <div key={inc._id || i} className="p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-950">{inc.incidentTitle}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">&bull; {inc.incidentDate}</span>
                      </div>
                      {inc.remarks && (
                        <p className="text-zinc-600 text-[11px] italic bg-white p-2 rounded-xl border border-zinc-100">
                          "{inc.remarks}"
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-400">Assigned by: {inc.assignedBy || 'Administration'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full font-black text-xs shrink-0 ${
                      inc.point > 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {inc.point > 0 ? `+${inc.point}` : inc.point} Pts
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-zinc-400">
                  <Shield className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-sm font-semibold text-zinc-700">Clean Conduct Standing</p>
                  <p className="text-xs text-zinc-400 mt-0.5">No negative or positive infractions recorded for this student yet.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudent(null)}
                className="text-xs rounded-xl px-4 border-zinc-200 cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Assign Incident Modal */}
      {assignModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div>
                <h3 className="text-sm font-bold text-[#0c3559] uppercase tracking-wider">
                  Record Student Conduct Incident
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {assignModalStudent.studentName} ({assignModalStudent.admissionNo})
                </p>
              </div>
              <button
                onClick={() => setAssignModalStudent(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssign} className="p-5 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Incident Title *</Label>
                <select
                  value={assignForm.incidentTitle}
                  onChange={(e) => {
                    const sel = incidentsList.find(i => i.title === e.target.value);
                    if (sel) {
                      setAssignForm(prev => ({
                        ...prev,
                        incidentTitle: sel.title,
                        point: Math.abs(sel.point),
                        pointType: sel.pointType
                      }));
                    } else {
                      setAssignForm(prev => ({ ...prev, incidentTitle: e.target.value }));
                    }
                  }}
                  className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                  required
                >
                  {incidentsList.map((inc) => (
                    <option key={inc._id || inc.title} value={inc.title}>
                      {inc.title} ({inc.point > 0 ? `+${inc.point}` : inc.point} pts)
                    </option>
                  ))}
                  <option value="Custom Infraction">Other / Custom Infraction</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Point Impact *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={assignForm.point}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, point: Number(e.target.value) || 1 }))}
                    className="h-10 rounded-xl text-xs bg-white border-zinc-200 text-zinc-900"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Point Type *</Label>
                  <select
                    value={assignForm.pointType}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, pointType: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                  >
                    <option value="positive">Positive (+) Merit</option>
                    <option value="negative">Negative (-) Demerit</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Incident Date *</Label>
                <Input
                  type="date"
                  value={assignForm.incidentDate}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, incidentDate: e.target.value }))}
                  className="h-10 rounded-xl text-xs bg-white border-zinc-200 text-zinc-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Remarks / Notes</Label>
                <textarea
                  value={assignForm.remarks}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, remarks: e.target.value }))}
                  rows={2}
                  placeholder="Optional observation details..."
                  className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setAssignModalStudent(null)}
                  className="text-xs h-9 px-4 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="h-9 px-5 rounded-xl bg-[#084A86] hover:bg-[#0c3559] text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
                >
                  {assigning ? 'Saving...' : 'Record Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
