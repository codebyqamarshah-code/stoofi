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

const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const SECTIONS = ['A', 'B', 'C', 'D'];

export default function AssignIncidentPage() {
  const { user } = useAuth();

  const [assignedList, setAssignedList] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [modalForm, setModalForm] = useState({
    studentId: '',
    studentName: '',
    admissionNo: '',
    className: 'Class 1',
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
      const [assignedData, incData, stuData] = await Promise.all([
        behaviourService.getAssignedIncidents(),
        behaviourService.getIncidents(),
        behaviourService.getAvailableStudents()
      ]);
      setAssignedList(assignedData);
      setIncidents(incData);
      setStudents(stuData);

      if (incData.length > 0 && stuData.length > 0) {
        const firstStu = stuData[0];
        const firstInc = incData[0];
        setModalForm(prev => ({
          ...prev,
          studentId: firstStu._id || 'stu-1',
          studentName: `${firstStu.firstName || ''} ${firstStu.lastName || ''}`.trim() || 'Student',
          admissionNo: firstStu.admissionNo || 'ADM-2026-001',
          className: firstStu.className || 'Class 1',
          section: firstStu.section || 'A',
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
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleStudentSelect = (e) => {
    const selectedAdmission = e.target.value;
    const stu = students.find(s => s.admissionNo === selectedAdmission);
    if (stu) {
      setModalForm(prev => ({
        ...prev,
        studentId: stu._id || 'stu-1',
        studentName: `${stu.firstName || ''} ${stu.lastName || ''}`.trim(),
        admissionNo: stu.admissionNo,
        className: stu.className || 'Class 1',
        section: stu.section || 'A'
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
      alert('Please select both a student and an incident.');
      return;
    }

    await behaviourService.assignIncident(modalForm);
    showToast(`Assigned ${modalForm.incidentTitle} to ${modalForm.studentName}`);
    setShowAssignModal(false);

    // Refresh list
    const updated = await behaviourService.getAssignedIncidents();
    setAssignedList(updated);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to revoke/delete this assigned incident?')) return;
    await behaviourService.deleteAssignedIncident(id);
    setAssignedList(prev => prev.filter(item => item._id !== id));
    showToast('Incident assignment revoked successfully.');
  };

  const filteredList = useMemo(() => {
    return assignedList.filter(item => {
      const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.incidentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.remarks || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = !classFilter || item.className === classFilter;
      const matchesSection = !sectionFilter || item.section === sectionFilter;
      const matchesType = typeFilter === 'all' || item.pointType === typeFilter;
      return matchesSearch && matchesClass && matchesSection && matchesType;
    });
  }, [assignedList, searchQuery, classFilter, sectionFilter, typeFilter]);

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

      {/* Top Filter & Criteria Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-zinc-500" />
            Filter Incident Assignments
          </h2>
          <Button
            onClick={() => setShowAssignModal(true)}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span style={{ color: '#ffffff' }}>ASSIGN NEW INCIDENT</span>
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
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
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

        {(classFilter || sectionFilter || searchQuery || typeFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
            <span className="text-zinc-500">Filtered Results: <strong>{filteredList.length}</strong> records</span>
            <button
              onClick={() => { setClassFilter(''); setSectionFilter(''); setSearchQuery(''); setTypeFilter('all'); }}
              className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Table & Export Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-950">Assigned Incidents History</h3>
            <p className="text-[11px] text-zinc-500">Showing {filteredList.length} recorded incidents</p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => exportToCSV(exportData, 'Assigned_Incidents')} 
              variant="outline" size="icon" className="h-8 w-8 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Download CSV"
            >
              <Download className="h-3.5 w-3.5 text-zinc-700" />
            </Button>
            <Button 
              onClick={() => exportToExcel(exportData, 'Assigned_Incidents', 'Incidents')} 
              variant="outline" size="icon" className="h-8 w-8 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Export Excel"
            >
              <FileText className="h-3.5 w-3.5 text-zinc-700" />
            </Button>
            <Button 
              onClick={() => exportToPDF(exportData, 'Assigned_Incidents', 'Assigned Behaviour Incidents')} 
              variant="outline" size="icon" className="h-8 w-8 border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer rounded-xl" title="Download PDF"
            >
              <Download className="h-3.5 w-3.5 text-zinc-700" />
            </Button>
            <Button 
              onClick={() => printData('Assigned Behaviour Incidents', exportData)} 
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
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-zinc-400">Loading assignments...</td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-zinc-500">
                    <Shield className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-700">No incident assignments recorded.</p>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Click "Assign New Incident" above to award or deduct points.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const isPositive = item.point > 0;
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
          <div className="bg-white border border-zinc-200 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
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

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 text-xs">
              {/* Select Student */}
              <div className="space-y-1.5">
                <Label className="font-bold text-zinc-700">Select Student *</Label>
                <select
                  value={modalForm.admissionNo}
                  onChange={handleStudentSelect}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  required
                >
                  {students.map(s => (
                    <option key={s._id || s.admissionNo} value={s.admissionNo}>
                      {s.admissionNo} - {s.firstName} {s.lastName || ''} ({s.className || 'Class 1'}, Sec {s.section || 'A'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Incident Template */}
              <div className="space-y-1.5">
                <Label className="font-bold text-zinc-700">Select Incident *</Label>
                <select
                  value={modalForm.incidentId}
                  onChange={handleIncidentSelect}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  required
                >
                  {incidents.map(inc => (
                    <option key={inc._id} value={inc._id}>
                      [{inc.point > 0 ? `+${inc.point}` : inc.point} Pts] {inc.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Point Preview Badge */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-500 font-medium">Applied Points:</span>
                  <p className="font-black text-sm text-zinc-950">{modalForm.incidentTitle}</p>
                </div>
                <span className={`px-3 py-1 rounded-full font-black text-xs ${
                  modalForm.pointType === 'positive' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {modalForm.pointType === 'positive' ? `+${modalForm.point}` : `-${modalForm.point}`} Points
                </span>
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
                  placeholder="Enter detailed observation, witness info, or notes..."
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
