'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Plus, Download, Printer, FileText, 
  Trash2, Shield, PlusCircle, MinusCircle, UserCheck, X, CheckCircle2, RotateCcw, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import behaviourService from '@/services/behaviourService';
import api from '@/services/api';

const DEFAULT_CLASSES = ['BS Psychology', 'BS RIT', 'DPT', 'FSC Dental', 'FSC NURSING', 'FSC OTT'];
const SECTIONS = ['A', 'B', 'C', 'D'];

export default function AssignIncidentPage() {
  const { user } = useAuth();

  const [assignedList, setAssignedList] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [students, setStudents] = useState([]);
  const [classList, setClassList] = useState(DEFAULT_CLASSES);
  const [loading, setLoading] = useState(true);

  // Filters for Main Table
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [modalClass, setModalClass] = useState('');
  const [modalSection, setModalSection] = useState('');
  const [isCustomIncident, setIsCustomIncident] = useState(false);
  const [isManualStudent, setIsManualStudent] = useState(false);

  const [modalForm, setModalForm] = useState({
    studentId: '',
    studentName: '',
    admissionNo: '',
    className: 'FSC OTT',
    section: 'A',
    incidentId: '',
    incidentTitle: '',
    point: 5,
    pointType: 'positive',
    incidentDate: new Date().toISOString().split('T')[0],
    assignedBy: user?.fullName || 'Super Admin',
    remarks: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [assignedData, incData, stuData, classRes] = await Promise.all([
        behaviourService.getAssignedIncidents(),
        behaviourService.getIncidents(),
        behaviourService.getAvailableStudents(),
        api.get('/class').catch(() => null)
      ]);
      setAssignedList(assignedData || []);
      setIncidents(incData || []);
      setStudents(stuData || []);

      if (classRes?.success && Array.isArray(classRes.data) && classRes.data.length > 0) {
        setClassList(classRes.data.map(c => c.name || c.className));
      }

      if (incData?.length > 0) {
        const firstInc = incData[0];
        setModalForm(prev => ({
          ...prev,
          incidentId: firstInc._id,
          incidentTitle: firstInc.title,
          point: Math.abs(firstInc.point),
          pointType: firstInc.pointType,
          assignedBy: user?.fullName || 'Super Admin'
        }));
      }
    } catch (err) {
      console.error('Error loading behaviour assign data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filter students in modal by selected class & section
  const filteredModalStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = !modalClass || s.className === modalClass;
      const matchSec = !modalSection || s.section === modalSection;
      return matchClass && matchSec;
    });
  }, [students, modalClass, modalSection]);

  const handleStudentSelect = (e) => {
    const selectedAdmission = e.target.value;
    const stu = students.find(s => s.admissionNo === selectedAdmission);
    if (stu) {
      setModalForm(prev => ({
        ...prev,
        studentId: stu._id || 'stu-1',
        studentName: `${stu.firstName || ''} ${stu.lastName || ''}`.trim(),
        admissionNo: stu.admissionNo,
        className: stu.className || modalClass || 'FSC OTT',
        section: stu.section || modalSection || 'A'
      }));
    }
  };

  const handleIncidentSelect = (e) => {
    const incId = e.target.value;
    const inc = incidents.find(i => i._id === incId);
    if (inc) {
      setModalForm(prev => ({
        ...prev,
        incidentId: inc._id,
        incidentTitle: inc.title,
        point: Math.abs(inc.point),
        pointType: inc.pointType
      }));
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.studentName || !modalForm.incidentTitle) {
      alert('Please provide student name and incident title.');
      return;
    }

    try {
      await behaviourService.assignIncident(modalForm);
      showToast(`Recorded "${modalForm.incidentTitle}" for ${modalForm.studentName}`);
      setShowAssignModal(false);

      // Reset modal state
      setIsCustomIncident(false);
      setIsManualStudent(false);

      // Refresh live list
      const updated = await behaviourService.getAssignedIncidents();
      setAssignedList(updated || []);
    } catch (err) {
      alert('Failed to assign incident. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to revoke/delete this assigned incident? This will also revert the student behaviour points.')) return;
    try {
      await behaviourService.deleteAssignedIncident(id);
      setAssignedList(prev => prev.filter(item => item._id !== id));
      showToast('Incident assignment revoked successfully.');
    } catch (err) {
      alert('Failed to delete assignment record.');
    }
  };

  const filteredList = useMemo(() => {
    return assignedList.filter(item => {
      const s = searchQuery.toLowerCase();
      const matchesSearch = (item.studentName || '').toLowerCase().includes(s) ||
        (item.admissionNo || '').toLowerCase().includes(s) ||
        (item.incidentTitle || '').toLowerCase().includes(s) ||
        (item.remarks || '').toLowerCase().includes(s);
      const matchesClass = !classFilter || item.className === classFilter;
      const matchesSection = !sectionFilter || item.section === sectionFilter;
      const matchesType = typeFilter === 'all' || item.pointType === typeFilter;
      return matchesSearch && matchesClass && matchesSection && matchesType;
    });
  }, [assignedList, searchQuery, classFilter, sectionFilter, typeFilter]);

  const totalPositive = assignedList.filter(i => i.pointType === 'positive' || i.point > 0).length;
  const totalNegative = assignedList.filter(i => i.pointType === 'negative' || i.point < 0).length;
  const netPoints = assignedList.reduce((sum, curr) => sum + (curr.point || 0), 0);

  const exportData = filteredList.map(item => ({
    'Admission No': item.admissionNo,
    'Student Name': item.studentName,
    'Class(Section)': `${item.className} (${item.section})`,
    'Incident Title': item.incidentTitle,
    'Points': item.point > 0 ? `+${item.point}` : `${item.point}`,
    'Date': item.incidentDate,
    'Assigned By': item.assignedBy,
    'Remarks': item.remarks || '-'
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-950 text-white px-4 py-2.5 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span style={{ color: '#ffffff' }}>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Assign Incident</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Record and assign behaviour incidents to students with real-time points tracking</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-400">Behaviour</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Assign Incident</span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Records</p>
            <h3 className="text-xl font-black text-zinc-950 mt-0.5">{assignedList.length}</h3>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Positive Merits</p>
            <h3 className="text-xl font-black text-emerald-700 mt-0.5">{totalPositive}</h3>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
            <MinusCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Negative Infractions</p>
            <h3 className="text-xl font-black text-rose-700 mt-0.5">{totalNegative}</h3>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Net Points Balance</p>
            <h3 className="text-xl font-black text-indigo-950 mt-0.5">
              {netPoints > 0 ? `+${netPoints}` : netPoints}
            </h3>
          </div>
        </div>
      </div>

      {/* Top Filter & Criteria Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 flex-wrap gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-zinc-500" />
            Filter Incident Assignments
          </h2>
          <Button
            onClick={() => setShowAssignModal(true)}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span style={{ color: '#ffffff' }}>ASSIGN INCIDENT</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Search Student / Incident</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                placeholder="Name, Roll, Admission..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Class</Label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
            >
              <option value="">All Classes</option>
              {classList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Section</Label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
            >
              <option value="">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-zinc-500 uppercase">Incident Type</Label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
            >
              <option value="all">All Types</option>
              <option value="positive">Positive (+ Points)</option>
              <option value="negative">Negative (- Points)</option>
            </select>
          </div>
        </div>

        {(classFilter || sectionFilter || typeFilter !== 'all' || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
            <span className="text-zinc-500">Filtered: <strong>{filteredList.length}</strong> records</span>
            <button
              onClick={() => { setClassFilter(''); setSectionFilter(''); setTypeFilter('all'); setSearchQuery(''); }}
              className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Assigned Incidents Table Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-950">Assigned Incidents Directory</h3>
            <p className="text-[11px] text-zinc-500">Showing {filteredList.length} assigned records</p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => exportToCSV(exportData, 'Assigned_Incidents_Report')} 
              variant="outline" size="icon" className="h-8 w-8 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Download CSV"
            >
              <Download className="h-3.5 w-3.5 text-zinc-700" />
            </Button>
            <Button 
              onClick={() => exportToExcel(exportData, 'Assigned_Incidents_Report', 'Assignments')} 
              variant="outline" size="icon" className="h-8 w-8 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Export Excel"
            >
              <FileText className="h-3.5 w-3.5 text-zinc-700" />
            </Button>
            <Button 
              onClick={() => printData('Assigned Student Behaviour Incidents', exportData)} 
              variant="outline" size="icon" className="h-8 w-8 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Print List"
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
                <th className="px-5 py-3.5">Incident Title</th>
                <th className="px-5 py-3.5">Point</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Assigned By</th>
                <th className="px-5 py-3.5">Remarks</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-16 text-center text-zinc-400">Loading live assigned incidents...</td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-16 text-center text-zinc-500">
                    <Shield className="w-10 h-10 text-zinc-300 mx-auto mb-2.5" />
                    <h4 className="font-bold text-sm text-zinc-800">No Behaviour Records Found</h4>
                    <p className="text-zinc-400 text-xs mt-1 max-w-sm mx-auto">
                      Track student achievements, classroom conduct, uniform compliance, or merits by assigning an incident.
                    </p>
                    <Button
                      onClick={() => setShowAssignModal(true)}
                      className="mt-4 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs h-9 px-4 rounded-xl cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span style={{ color: '#ffffff' }}>Assign Incident</span>
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const isPositive = item.pointType === 'positive' || item.point > 0;
                  return (
                    <tr key={item._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-zinc-950">{item.admissionNo}</td>
                      <td className="px-5 py-3.5 font-semibold text-zinc-900">{item.studentName}</td>
                      <td className="px-5 py-3.5 text-zinc-600">{item.className} ({item.section})</td>
                      <td className="px-5 py-3.5 font-medium text-zinc-950">{item.incidentTitle}</td>
                      <td className="px-5 py-3.5 font-bold">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                          isPositive 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isPositive ? `+${item.point}` : item.point} Pts
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600">{item.incidentDate}</td>
                      <td className="px-5 py-3.5 text-zinc-600">{item.assignedBy}</td>
                      <td className="px-5 py-3.5 text-zinc-500 max-w-xs truncate">{item.remarks || '—'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Revoke / Delete Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Incident Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">Assign Behaviour Incident</h3>
                  <p className="text-[11px] text-zinc-500">Record positive conduct or negative infraction for a student</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Class & Section Filter for Student Dropdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-zinc-700">Filter By Class</Label>
                  <select
                    value={modalClass}
                    onChange={(e) => {
                      setModalClass(e.target.value);
                      const matching = students.find(s => (!e.target.value || s.className === e.target.value) && (!modalSection || s.section === modalSection));
                      if (matching) {
                        setModalForm(prev => ({
                          ...prev,
                          studentId: matching._id,
                          studentName: `${matching.firstName || ''} ${matching.lastName || ''}`.trim(),
                          admissionNo: matching.admissionNo,
                          className: matching.className,
                          section: matching.section
                        }));
                      }
                    }}
                    className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  >
                    <option value="">All Classes</option>
                    {classList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-zinc-700">Filter By Section</Label>
                  <select
                    value={modalSection}
                    onChange={(e) => setModalSection(e.target.value)}
                    className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  >
                    <option value="">All Sections</option>
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>

              {/* Student Selection */}
              {isManualStudent ? (
                <div className="space-y-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-800">Manual Student Entry</span>
                    <button
                      type="button"
                      onClick={() => setIsManualStudent(false)}
                      className="text-[11px] text-zinc-600 hover:text-zinc-950 font-semibold"
                    >
                      ← Select from Registered Students
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="font-bold text-zinc-700">Student Name *</Label>
                      <Input
                        placeholder="e.g. Zain Ahmed"
                        value={modalForm.studentName}
                        onChange={(e) => setModalForm(prev => ({ ...prev, studentName: e.target.value }))}
                        required
                        className="bg-white border-zinc-200 text-xs h-9 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-bold text-zinc-700">Admission No</Label>
                      <Input
                        placeholder="e.g. ADM-2026-088"
                        value={modalForm.admissionNo}
                        onChange={(e) => setModalForm(prev => ({ ...prev, admissionNo: e.target.value }))}
                        className="bg-white border-zinc-200 text-xs h-9 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-zinc-700">Select Student *</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualStudent(true);
                        setModalForm(prev => ({ ...prev, studentName: '', admissionNo: '' }));
                      }}
                      className="text-[11px] text-indigo-600 hover:underline font-semibold"
                    >
                      + Manual Entry
                    </button>
                  </div>
                  <select
                    value={modalForm.admissionNo}
                    onChange={handleStudentSelect}
                    className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                    required
                  >
                    <option value="">-- Choose student ({filteredModalStudents.length} available) --</option>
                    {filteredModalStudents.map(s => (
                      <option key={s._id || s.admissionNo} value={s.admissionNo}>
                        {s.admissionNo} - {s.firstName} {s.lastName || ''} ({s.className || 'FSC OTT'}, Sec {s.section || 'A'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Incident Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-zinc-700">Incident Template / Rule *</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomIncident(!isCustomIncident);
                      if (!isCustomIncident) {
                        setModalForm(prev => ({
                          ...prev,
                          incidentId: '',
                          incidentTitle: '',
                          point: 5,
                          pointType: 'positive'
                        }));
                      }
                    }}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    {isCustomIncident ? '← Pick from Templates' : '+ Custom Conduct Incident'}
                  </button>
                </div>

                {isCustomIncident ? (
                  <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <Input
                      placeholder="Enter custom incident title (e.g. Science Fair Winner, Disrespect to Staff)..."
                      value={modalForm.incidentTitle}
                      onChange={(e) => setModalForm(prev => ({ ...prev, incidentTitle: e.target.value }))}
                      required
                      className="bg-white border-zinc-200 text-xs h-9 rounded-xl"
                    />
                    <div className="flex items-center gap-4 text-xs font-semibold pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="modalPointType"
                          checked={modalForm.pointType === 'positive'}
                          onChange={() => setModalForm(prev => ({ ...prev, pointType: 'positive' }))}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <PlusCircle className="w-3.5 h-3.5" /> Positive Merit (+)
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="modalPointType"
                          checked={modalForm.pointType === 'negative'}
                          onChange={() => setModalForm(prev => ({ ...prev, pointType: 'negative' }))}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <MinusCircle className="w-3.5 h-3.5" /> Negative Infraction (-)
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <select
                    value={modalForm.incidentId}
                    onChange={handleIncidentSelect}
                    className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                    required
                  >
                    <option value="">-- Choose an Incident Template --</option>
                    {incidents.map(inc => (
                      <option key={inc._id} value={inc._id}>
                        [{inc.point > 0 ? `+${inc.point}` : inc.point} Pts] {inc.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Point Adjustment & Live Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-zinc-700">Point Value *</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="100"
                    value={modalForm.point}
                    onChange={(e) => setModalForm(prev => ({ ...prev, point: Math.max(1, Number(e.target.value) || 1) }))}
                    required
                    className="bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-zinc-700">Point Effect</Label>
                  <div className={`h-9 px-3 rounded-xl flex items-center font-black text-xs border ${
                    modalForm.pointType === 'positive' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    {modalForm.pointType === 'positive' ? `+${modalForm.point} Merit Points` : `-${modalForm.point} Penalties`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-zinc-700">Incident Date *</Label>
                  <Input 
                    type="date"
                    value={modalForm.incidentDate}
                    onChange={(e) => setModalForm({ ...modalForm, incidentDate: e.target.value })}
                    required
                    className="bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-zinc-700">Assigned By</Label>
                  <Input 
                    value={modalForm.assignedBy}
                    onChange={(e) => setModalForm({ ...modalForm, assignedBy: e.target.value })}
                    className="bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-zinc-700">Remarks / Observation Details</Label>
                <textarea 
                  rows={3}
                  placeholder="Enter detailed observation, witness info, or counseling notes..."
                  value={modalForm.remarks}
                  onChange={(e) => setModalForm({ ...modalForm, remarks: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAssignModal(false)}
                  className="text-xs h-9 px-4 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-xs cursor-pointer"
                >
                  <span style={{ color: '#ffffff' }}>Assign Incident Now</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
