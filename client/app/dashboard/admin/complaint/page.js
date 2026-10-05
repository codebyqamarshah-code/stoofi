'use client';

import Link from 'next/link';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Search, 
  Download, 
  Printer, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Archive,
  Eye,
  X,
  Filter,
  RotateCcw,
  Calendar,
  Phone,
  User,
  GraduationCap,
  Briefcase,
  Layers,
  FileCheck,
  AlertTriangle,
  Send,
  UserCheck,
  Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import api from '@/services/api';

// Helper to get today's date in YYYY-MM-DD format
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

// Helper to format dates cleanly
function formatDate(dateVal) {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateVal;
  }
}

// Helper to format date-time
function formatDateTime(dateVal) {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateVal;
  }
}

// Priority badge renderer
function PriorityBadge({ priority }) {
  const p = (priority || 'Medium').toLowerCase();
  switch (p) {
    case 'urgent':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Urgent
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          High
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Low
        </span>
      );
    case 'medium':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Medium
        </span>
      );
  }
}

// Status badge renderer
function StatusBadge({ status }) {
  const s = status || 'Pending';
  switch (s) {
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Activity className="w-3 h-3" />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          Resolved
        </span>
      );
    case 'Closed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
          <Archive className="w-3 h-3" />
          Closed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
          {s}
        </span>
      );
  }
}

export default function ComplaintPage() {
  // Main Data States
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals & Panels
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewComplaint, setViewComplaint] = useState(null);
  const [statusModalComplaint, setStatusModalComplaint] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const initialFormState = {
    source: 'Parent', // Parent, Student, Staff
    complainantName: '',
    selectedStudentId: '',
    selectedStaffId: '',
    studentName: '',
    studentClass: '',
    studentRoll: '',
    staffName: '',
    staffRole: '',
    phone: '',
    complaintType: 'Academic', // Academic, Administrative
    subject: '',
    description: '',
    priority: 'Medium', // Low, Medium, High, Urgent
    assignedTo: 'Unassigned',
    complaintDate: getTodayDateString(),
    file: null
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Status Modal State
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: 'In Progress',
    actionTaken: '',
    resolutionNotes: '',
    resolvedBy: ''
  });
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [customDate, setCustomDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Toast notifier
  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [complaintRes, studentRes, teacherRes, staffRes] = await Promise.all([
        api.get('/complaint'),
        api.get('/students').catch(() => ({ data: [] })),
        api.get('/teachers').catch(() => ({ data: [] })),
        api.get('/staff').catch(() => ({ data: [] }))
      ]);

      if (complaintRes?.success) {
        setComplaints(complaintRes.data || []);
      }

      // Process Students
      const studentItems = Array.isArray(studentRes?.data) ? studentRes.data : [];
      setStudents(studentItems);

      // Process Staff & Teachers for assignments & staff source
      const combinedStaff = [];
      if (Array.isArray(teacherRes?.data)) {
        teacherRes.data.forEach(t => {
          const name = t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim();
          if (name) {
            combinedStaff.push({
              _id: t._id,
              name: `Teacher: ${name}`,
              plainName: name,
              role: 'Teacher',
              phone: t.phone || t.mobile || ''
            });
          }
        });
      }
      if (Array.isArray(staffRes?.data)) {
        staffRes.data.forEach(s => {
          const name = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim();
          if (name) {
            combinedStaff.push({
              _id: s._id,
              name: `Staff: ${name} (${s.designation || s.role || 'Staff'})`,
              plainName: name,
              role: s.designation || s.role || 'Staff',
              phone: s.phone || s.mobile || ''
            });
          }
        });
      }

      // Add default ERP administrative options
      const standardRoles = [
        { _id: 'admin_1', name: 'Principal / Headmaster', plainName: 'Principal', role: 'Admin', phone: '' },
        { _id: 'admin_2', name: 'Vice Principal / Academic Incharge', plainName: 'Vice Principal', role: 'Admin', phone: '' },
        { _id: 'admin_3', name: 'School Administration Office', plainName: 'Administration Office', role: 'Admin', phone: '' },
        { _id: 'admin_4', name: 'Accountant / Fee Department', plainName: 'Fee Department', role: 'Accounts', phone: '' }
      ];

      setStaffList([...standardRoles, ...combinedStaff]);
    } catch (err) {
      console.error('Error fetching complaint data:', err);
      setError('Failed to load complaint data. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Dynamic Complainant Selection when Source changes
  const handleSourceChange = (newSource) => {
    setFormData(prev => ({
      ...prev,
      source: newSource,
      complainantName: '',
      selectedStudentId: '',
      selectedStaffId: '',
      studentName: '',
      studentClass: '',
      studentRoll: '',
      staffName: '',
      staffRole: '',
      phone: ''
    }));
    setFormErrors({});
  };

  // Handle Student Selection (For Parent or Student source)
  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s._id === studentId);
    if (!student) return;

    const studentFullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.name || 'Student';
    const classInfo = student.className ? `${student.className} - ${student.section || ''}` : '';
    const rollInfo = student.rollNo || student.admissionNo || '';

    if (formData.source === 'Parent') {
      const parentName = student.fatherName || student.guardianName || student.motherName || '';
      const parentPhone = student.fatherPhone || student.guardianPhone || student.phone || student.emergencyContact || '';

      setFormData(prev => ({
        ...prev,
        selectedStudentId: studentId,
        studentName: studentFullName,
        studentClass: classInfo,
        studentRoll: rollInfo,
        complainantName: parentName,
        phone: parentPhone
      }));
    } else if (formData.source === 'Student') {
      const studentPhone = student.phone || student.emergencyContact || student.fatherPhone || '';

      setFormData(prev => ({
        ...prev,
        selectedStudentId: studentId,
        studentName: studentFullName,
        studentClass: classInfo,
        studentRoll: rollInfo,
        complainantName: studentFullName,
        phone: studentPhone
      }));
    }
  };

  // Handle Staff Selection (For Staff source)
  const handleStaffSelect = (staffId) => {
    const staff = staffList.find(s => s._id === staffId);
    if (!staff) return;

    setFormData(prev => ({
      ...prev,
      selectedStaffId: staffId,
      staffName: staff.plainName,
      staffRole: staff.role,
      complainantName: staff.plainName,
      phone: staff.phone || prev.phone
    }));
  };

  // Validate Add/Edit Form
  const validateForm = () => {
    const errors = {};

    if (!formData.complainantName.trim()) {
      errors.complainantName = formData.source === 'Parent' 
        ? 'Parent / Guardian name is required.' 
        : formData.source === 'Student' 
        ? 'Student name is required.' 
        : 'Staff member name is required.';
    }

    if (formData.source === 'Parent' && !formData.studentName.trim()) {
      errors.studentName = 'Please select or enter the associated student.';
    }

    if (formData.phone && formData.phone.trim()) {
      const cleaned = formData.phone.replace(/[\s\-()]/g, '');
      if (cleaned.length < 7 || cleaned.length > 15 || /^0+$/.test(cleaned)) {
        errors.phone = 'Please enter a valid phone number (e.g. 03331234567).';
      }
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Complaint subject is required.';
    }

    if (!formData.description.trim()) {
      errors.description = 'Complaint description is required.';
    }

    if (!formData.complaintDate) {
      errors.complaintDate = 'Complaint date is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Complaint (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append('source', formData.source);
      payload.append('complainantName', formData.complainantName.trim());
      payload.append('complaintType', formData.complaintType);
      payload.append('subject', formData.subject.trim());
      payload.append('description', formData.description.trim());
      payload.append('priority', formData.priority);
      payload.append('assignedTo', formData.assignedTo || 'Unassigned');
      payload.append('complaintDate', formData.complaintDate);
      payload.append('phone', formData.phone ? formData.phone.trim() : '');

      if (formData.selectedStudentId) payload.append('studentId', formData.selectedStudentId);
      if (formData.studentName) payload.append('studentName', formData.studentName);
      if (formData.studentClass) payload.append('studentClass', formData.studentClass);
      if (formData.studentRoll) payload.append('studentRoll', formData.studentRoll);

      if (formData.selectedStaffId) payload.append('staffId', formData.selectedStaffId);
      if (formData.staffName) payload.append('staffName', formData.staffName);
      if (formData.staffRole) payload.append('staffRole', formData.staffRole);

      if (formData.file) {
        payload.append('file', formData.file);
      }

      let res;
      if (editingId) {
        res = await api.put(`/complaint/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res?.success) {
          setComplaints(prev => prev.map(c => c._id === editingId ? res.data : c));
          showToast(`Complaint ${res.data.complaintId || ''} updated successfully!`);
        }
      } else {
        res = await api.post('/complaint', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res?.success) {
          setComplaints(prev => [res.data, ...prev]);
          showToast(`Complaint registered successfully (${res.data.complaintId || 'CMP'}).`);
        }
      }

      // Reset form
      setFormData(initialFormState);
      setFormErrors({});
      setShowForm(false);
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error saving complaint:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save complaint.', true);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Action
  const handleEdit = (complaint) => {
    setEditingId(complaint._id);
    setFormData({
      source: complaint.source || 'Parent',
      complainantName: complaint.complainantName || complaint.complaintBy || '',
      selectedStudentId: complaint.studentId || '',
      selectedStaffId: complaint.staffId || '',
      studentName: complaint.studentName || '',
      studentClass: complaint.studentClass || '',
      studentRoll: complaint.studentRoll || '',
      staffName: complaint.staffName || '',
      staffRole: complaint.staffRole || '',
      phone: complaint.phone || '',
      complaintType: complaint.complaintType || 'Academic',
      subject: complaint.subject || '',
      description: complaint.description || '',
      priority: complaint.priority || 'Medium',
      assignedTo: complaint.assignedTo || complaint.assigned || 'Unassigned',
      complaintDate: complaint.complaintDate ? complaint.complaintDate.substring(0, 10) : getTodayDateString(),
      file: null
    });
    setFormErrors({});
    setShowForm(true);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Open Status Transition Modal
  const handleOpenStatusModal = (complaint) => {
    setStatusModalComplaint(complaint);
    setStatusUpdateData({
      status: complaint.status === 'Pending' ? 'In Progress' : complaint.status === 'In Progress' ? 'Resolved' : complaint.status,
      actionTaken: complaint.actionTaken || '',
      resolutionNotes: complaint.resolutionNotes || '',
      resolvedBy: complaint.resolvedBy || ''
    });
  };

  // Submit Status Change
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalComplaint) return;

    if (statusUpdateData.status === 'Resolved' && !statusUpdateData.actionTaken.trim() && !statusUpdateData.resolutionNotes.trim()) {
      showToast('Please enter the Action Taken or Resolution Notes to resolve.', true);
      return;
    }

    try {
      setStatusUpdating(true);
      const res = await api.patch(`/complaint/${statusModalComplaint._id}/status`, {
        status: statusUpdateData.status,
        actionTaken: statusUpdateData.actionTaken.trim(),
        resolutionNotes: statusUpdateData.resolutionNotes.trim(),
        resolvedBy: statusUpdateData.resolvedBy.trim()
      });

      if (res?.success) {
        setComplaints(prev => prev.map(c => c._id === statusModalComplaint._id ? res.data : c));
        if (viewComplaint && viewComplaint._id === statusModalComplaint._id) {
          setViewComplaint(res.data);
        }
        showToast(`Complaint status updated to ${statusUpdateData.status}!`);
        setStatusModalComplaint(null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to update status', true);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Quick Reassign Handler
  const handleQuickAssign = async (complaintId, newAssignee) => {
    try {
      const res = await api.patch(`/complaint/${complaintId}/assign`, { assignedTo: newAssignee });
      if (res?.success) {
        setComplaints(prev => prev.map(c => c._id === complaintId ? res.data : c));
        if (viewComplaint && viewComplaint._id === complaintId) {
          setViewComplaint(res.data);
        }
        showToast(`Assigned to ${newAssignee}!`);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to reassign', true);
    }
  };

  // Delete Action
  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const res = await api.delete(`/complaint/${deleteConfirmId}`);
      if (res?.success) {
        setComplaints(prev => prev.filter(c => c._id !== deleteConfirmId));
        if (viewComplaint && viewComplaint._id === deleteConfirmId) {
          setViewComplaint(null);
        }
        showToast('Complaint deleted successfully.');
      }
    } catch (err) {
      console.error('Error deleting complaint:', err);
      showToast(err?.response?.data?.message || 'Failed to delete complaint.', true);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Real-time Summary Cards
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const closed = complaints.filter(c => c.status === 'Closed').length;

    return { total, pending, inProgress, resolved, closed };
  }, [complaints]);

  // Multi-Filter & Search Pipeline
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      // 1. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const idMatch = (c.complaintId || '').toLowerCase().includes(query);
        const nameMatch = (c.complainantName || c.complaintBy || '').toLowerCase().includes(query);
        const phoneMatch = (c.phone || '').includes(query);
        const subjectMatch = (c.subject || '').toLowerCase().includes(query);
        const descMatch = (c.description || '').toLowerCase().includes(query);
        const studentMatch = (c.studentName || '').toLowerCase().includes(query);
        const staffMatch = (c.staffName || '').toLowerCase().includes(query);
        const assignedMatch = (c.assignedTo || c.assigned || '').toLowerCase().includes(query);

        if (!idMatch && !nameMatch && !phoneMatch && !subjectMatch && !descMatch && !studentMatch && !staffMatch && !assignedMatch) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'All' && c.status !== statusFilter) {
        return false;
      }

      // 3. Source Filter
      if (sourceFilter !== 'All' && c.source !== sourceFilter) {
        return false;
      }

      // 4. Complaint Type Filter
      if (typeFilter !== 'All' && c.complaintType !== typeFilter) {
        return false;
      }

      // 5. Priority Filter
      if (priorityFilter !== 'All' && (c.priority || 'Medium') !== priorityFilter) {
        return false;
      }

      // 6. Assigned To Filter
      if (assignedFilter !== 'All') {
        const assigned = c.assignedTo || c.assigned || 'Unassigned';
        if (assigned !== assignedFilter) return false;
      }

      // 7. Date Filter
      if (dateFilter === 'Today') {
        const todayStr = getTodayDateString();
        const cDate = c.complaintDate ? c.complaintDate.substring(0, 10) : c.date;
        if (cDate !== todayStr) return false;
      } else if (dateFilter === 'Custom' && customDate) {
        const cDate = c.complaintDate ? c.complaintDate.substring(0, 10) : c.date;
        if (cDate !== customDate) return false;
      }

      return true;
    });
  }, [complaints, searchQuery, statusFilter, sourceFilter, typeFilter, priorityFilter, assignedFilter, dateFilter, customDate]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSourceFilter('All');
    setTypeFilter('All');
    setPriorityFilter('All');
    setAssignedFilter('All');
    setDateFilter('All');
    setCustomDate('');
    setCurrentPage(1);
  };

  // Pagination Slice
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredComplaints.slice(start, start + itemsPerPage);
  }, [filteredComplaints, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Export Filtered Records
  const handleExport = (type) => {
    if (filteredComplaints.length === 0) {
      showToast('No complaint records to export', true);
      return;
    }

    const exportData = filteredComplaints.map(c => ({
      'Complaint ID': c.complaintId || '-',
      'Source': c.source || '-',
      'Complainant Name': c.complainantName || c.complaintBy || '-',
      'Phone': c.phone || '-',
      'Student / Staff Info': c.source === 'Parent' || c.source === 'Student' 
        ? `${c.studentName || ''} (${c.studentClass || ''})`.trim() 
        : c.staffRole ? `${c.staffName || ''} - ${c.staffRole}` : '-',
      'Complaint Type': c.complaintType || '-',
      'Subject': c.subject || '-',
      'Priority': c.priority || 'Medium',
      'Assigned To': c.assignedTo || c.assigned || 'Unassigned',
      'Complaint Date': formatDate(c.complaintDate || c.date),
      'Status': c.status || 'Pending',
      'Action Taken': c.actionTaken || '-',
      'Resolved By': c.resolvedBy || '-',
      'Resolved Date': formatDate(c.resolvedDate)
    }));

    const headers = Object.keys(exportData[0] || {});
    const filename = `Complaints_${getTodayDateString()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi PRO - Complaint Management Report');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV export downloaded successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'Complaints');
      showToast('Excel file downloaded successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Stoofi PRO - Complaints Report', filename);
      showToast('PDF file downloaded successfully!');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-4 ${
            toastMessage.isError 
              ? 'bg-rose-50 text-rose-800 border-rose-200' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toastMessage.isError ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-zinc-400 hover:text-zinc-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Complaint Management</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Track, assign, and resolve academic and administrative complaints</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={() => {
              if (showForm && !editingId) {
                setShowForm(false);
              } else {
                setEditingId(null);
                setFormData(initialFormState);
                setFormErrors({});
                setShowForm(true);
              }
            }}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-sm flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            {showForm && !editingId ? 'Close Form' : 'Add Complaint'}
          </Button>

          <div className="flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-2 rounded-lg">
            <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-700 transition-colors">Admin Section</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-semibold">Complaint</span>
          </div>
        </div>
      </div>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div 
          onClick={() => { setStatusFilter('All'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-sm ${statusFilter === 'All' ? 'ring-2 ring-zinc-900 border-zinc-900' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-zinc-950">{stats.total}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">All complaints</p>
          </div>
        </div>

        {/* Pending */}
        <div 
          onClick={() => { setStatusFilter('Pending'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-sm ${statusFilter === 'Pending' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-700">{stats.pending}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Awaiting action</p>
          </div>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => { setStatusFilter('In Progress'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-sm ${statusFilter === 'In Progress' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-blue-700">{stats.inProgress}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Being investigated</p>
          </div>
        </div>

        {/* Resolved */}
        <div 
          onClick={() => { setStatusFilter('Resolved'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-sm ${statusFilter === 'Resolved' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-700">{stats.resolved}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Action completed</p>
          </div>
        </div>

        {/* Closed */}
        <div 
          onClick={() => { setStatusFilter('Closed'); setCurrentPage(1); }}
          className={`cursor-pointer bg-white border rounded-xl p-4 transition-all hover:shadow-sm ${statusFilter === 'Closed' ? 'ring-2 ring-zinc-500 border-zinc-500' : 'border-zinc-200'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Closed</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-zinc-800">{stats.closed}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Archived records</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form (if open) + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* ADD / EDIT COMPLAINT FORM */}
        {showForm && (
          <div ref={formRef} className="xl:col-span-1">
            <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden sticky top-6">
              <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-900" />
                  <h2 className="text-base font-bold text-zinc-950">
                    {editingId ? 'Edit Complaint' : 'Register New Complaint'}
                  </h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData(initialFormState);
                    setFormErrors({});
                  }}
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form className="p-5 space-y-4" onSubmit={handleSave}>
                
                {/* 1. SOURCE SELECTOR TABS */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Complaint Source <span className="text-rose-500">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-lg">
                    {['Parent', 'Student', 'Staff'].map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => handleSourceChange(src)}
                        className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                          formData.source === src 
                            ? 'bg-white text-zinc-950 shadow-xs' 
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        {src === 'Parent' ? 'Parent / Guardian' : src}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. DYNAMIC LOOKUP ACCORDING TO SOURCE */}
                {formData.source === 'Parent' && (
                  <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-lg border border-zinc-200/80">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                        <span>Select Student (Auto-fills Parent Info)</span>
                        <span className="text-[10px] text-zinc-400">Database Lookup</span>
                      </Label>
                      <select
                        value={formData.selectedStudentId}
                        onChange={(e) => handleStudentSelect(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                      >
                        <option value="">-- Choose Student from School Directory --</option>
                        {students.map(s => {
                          const sName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name;
                          return (
                            <option key={s._id} value={s._id}>
                              {sName} {s.className ? `(Class: ${s.className}${s.section ? `-${s.section}` : ''})` : ''} - Parent: {s.fatherName || s.guardianName || 'N/A'}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-zinc-600">Parent / Guardian Name *</Label>
                        <Input 
                          value={formData.complainantName}
                          onChange={e => setFormData({ ...formData, complainantName: e.target.value })}
                          placeholder="e.g. Muhammad Aslam"
                          className="h-8 text-xs bg-white border-zinc-300"
                        />
                        {formErrors.complainantName && <p className="text-[11px] text-rose-500">{formErrors.complainantName}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-zinc-600">Student Name *</Label>
                        <Input 
                          value={formData.studentName}
                          onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                          placeholder="e.g. Ali Aslam"
                          className="h-8 text-xs bg-white border-zinc-300"
                        />
                        {formErrors.studentName && <p className="text-[11px] text-rose-500">{formErrors.studentName}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {formData.source === 'Student' && (
                  <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-lg border border-zinc-200/80">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                        <span>Select Student</span>
                        <span className="text-[10px] text-zinc-400">Database Lookup</span>
                      </Label>
                      <select
                        value={formData.selectedStudentId}
                        onChange={(e) => handleStudentSelect(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                      >
                        <option value="">-- Choose Student --</option>
                        {students.map(s => {
                          const sName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name;
                          return (
                            <option key={s._id} value={s._id}>
                              {sName} {s.className ? `(Class: ${s.className}${s.section ? `-${s.section}` : ''})` : ''} {s.rollNo ? `- Roll: ${s.rollNo}` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Student Name *</Label>
                      <Input 
                        value={formData.complainantName}
                        onChange={e => setFormData({ ...formData, complainantName: e.target.value, studentName: e.target.value })}
                        placeholder="Student Full Name"
                        className="h-8 text-xs bg-white border-zinc-300"
                      />
                      {formErrors.complainantName && <p className="text-[11px] text-rose-500">{formErrors.complainantName}</p>}
                    </div>
                  </div>
                )}

                {formData.source === 'Staff' && (
                  <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-lg border border-zinc-200/80">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                        <span>Select Staff Member / Teacher</span>
                        <span className="text-[10px] text-zinc-400">Directory</span>
                      </Label>
                      <select
                        value={formData.selectedStaffId}
                        onChange={(e) => handleStaffSelect(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                      >
                        <option value="">-- Choose Staff Member / Teacher --</option>
                        {staffList.map(s => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Staff Member Name *</Label>
                      <Input 
                        value={formData.complainantName}
                        onChange={e => setFormData({ ...formData, complainantName: e.target.value, staffName: e.target.value })}
                        placeholder="Staff Name"
                        className="h-8 text-xs bg-white border-zinc-300"
                      />
                      {formErrors.complainantName && <p className="text-[11px] text-rose-500">{formErrors.complainantName}</p>}
                    </div>
                  </div>
                )}

                {/* 3. PHONE & DATE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">Phone Number</Label>
                    <Input 
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 03331234567"
                      className="bg-white border-zinc-300 text-zinc-950 text-xs"
                    />
                    {formErrors.phone && <p className="text-[11px] text-rose-500">{formErrors.phone}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Complaint Date <span className="text-rose-500">*</span>
                    </Label>
                    <Input 
                      type="date"
                      value={formData.complaintDate}
                      onChange={e => setFormData({ ...formData, complaintDate: e.target.value })}
                      className="bg-white border-zinc-300 text-zinc-950 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* 4. TYPE & PRIORITY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Complaint Type <span className="text-rose-500">*</span>
                    </Label>
                    <select
                      value={formData.complaintType}
                      onChange={e => setFormData({ ...formData, complaintType: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                      required
                    >
                      <option value="Academic">Academic</option>
                      <option value="Administrative">Administrative</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">Priority</Label>
                    <select
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* 5. ASSIGNED TO */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">Assigned To</Label>
                  <select
                    value={formData.assignedTo}
                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  >
                    <option value="Unassigned">-- Leave Unassigned --</option>
                    {staffList.map(s => (
                      <option key={s._id} value={s.plainName}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. SUBJECT */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">
                    Subject / Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Teacher attendance issue / Fee discrepancy"
                    className="bg-white border-zinc-300 text-zinc-950 text-xs"
                    required
                  />
                  {formErrors.subject && <p className="text-[11px] text-rose-500">{formErrors.subject}</p>}
                </div>

                {/* 7. DESCRIPTION */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">
                    Description <span className="text-rose-500">*</span>
                  </Label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full details of the complaint..."
                    rows={3}
                    className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 resize-y"
                    required
                  />
                  {formErrors.description && <p className="text-[11px] text-rose-500">{formErrors.description}</p>}
                </div>

                {/* 8. OPTIONAL ATTACHMENT */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                    <span>Supporting Document / Evidence</span>
                    <span className="text-[10px] text-zinc-400">Optional (Image/PDF)</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <input 
                      ref={fileInputRef}
                      type="file"
                      onChange={e => setFormData({ ...formData, file: e.target.files[0] || null })}
                      className="text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-800 hover:file:bg-zinc-200 cursor-pointer"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    />
                    {formData.file && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setFormData({ ...formData, file: null });
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="h-6 px-2 text-xs text-rose-500 hover:text-rose-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs py-2.5 shadow-xs"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving to Database...
                      </span>
                    ) : (
                      editingId ? 'UPDATE COMPLAINT' : 'REGISTER COMPLAINT'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* COMPLAINTS LIST TABLE & FILTERS */}
        <div className={showForm ? 'xl:col-span-2' : 'xl:col-span-3'}>
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
            
            {/* Top Toolbar: Search, Filters & Export */}
            <div className="p-4 border-b border-zinc-200 space-y-3 bg-zinc-50/40">
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-950">Complaint Records</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {filteredComplaints.length} records
                  </span>
                </div>

                {/* Export Bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                    <button 
                      onClick={() => handleExport('Copy')} 
                      className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1" 
                      title="Copy"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Copy</span>
                    </button>
                    <button 
                      onClick={() => handleExport('Excel')} 
                      className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1" 
                      title="Excel"
                    >
                      <Download className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button 
                      onClick={() => handleExport('CSV')} 
                      className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1" 
                      title="CSV"
                    >
                      <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                      <span className="hidden sm:inline">CSV</span>
                    </button>
                    <button 
                      onClick={() => handleExport('PDF')} 
                      className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1" 
                      title="PDF"
                    >
                      <Download className="h-3.5 w-3.5 text-rose-600" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button 
                      onClick={() => handleExport('Print')} 
                      className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors text-xs font-medium flex items-center gap-1" 
                      title="Print"
                    >
                      <Printer className="h-3.5 w-3.5 text-zinc-700" />
                      <span className="hidden sm:inline">Print</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Multi-Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                
                {/* Search */}
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    value={searchQuery} 
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by ID, name, phone, subject..." 
                    className="pl-8 h-8 text-xs bg-white border-zinc-300 text-zinc-950 focus-visible:ring-1 focus-visible:ring-zinc-900"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="h-8 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Source Filter */}
                <div>
                  <select
                    value={sourceFilter}
                    onChange={e => { setSourceFilter(e.target.value); setCurrentPage(1); }}
                    className="h-8 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  >
                    <option value="All">All Sources</option>
                    <option value="Parent">Parent</option>
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <select
                    value={priorityFilter}
                    onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                    className="h-8 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  >
                    <option value="All">All Priorities</option>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-1">
                  <select
                    value={dateFilter}
                    onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
                    className="h-8 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  >
                    <option value="All">All Dates</option>
                    <option value="Today">Today</option>
                    <option value="Custom">Pick Date</option>
                  </select>

                  {(searchQuery || statusFilter !== 'All' || sourceFilter !== 'All' || priorityFilter !== 'All' || typeFilter !== 'All' || dateFilter !== 'All') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleResetFilters}
                      className="h-8 px-2 text-zinc-400 hover:text-zinc-800"
                      title="Reset all filters"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

              </div>

              {/* Custom Date Input if selected */}
              {dateFilter === 'Custom' && (
                <div className="flex items-center gap-2 pt-1 max-w-xs">
                  <Label className="text-xs text-zinc-600 font-medium">Select Date:</Label>
                  <Input 
                    type="date"
                    value={customDate}
                    onChange={e => { setCustomDate(e.target.value); setCurrentPage(1); }}
                    className="h-8 text-xs bg-white border-zinc-300"
                  />
                </div>
              )}

            </div>

            {/* Error State */}
            {error && (
              <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{error}</span>
                </div>
                <Button size="sm" variant="outline" onClick={fetchData} className="h-7 text-xs bg-white border-rose-200 text-rose-700 hover:bg-rose-100">
                  Retry
                </Button>
              </div>
            )}

            {/* Table Content */}
            <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-800" />
                  <p className="text-xs text-zinc-500 font-medium">Loading complaints from database...</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold bg-zinc-50/70 border-b border-zinc-200">
                    <tr>
                      <th className="px-3.5 py-3 font-semibold">Complaint ID</th>
                      <th className="px-3.5 py-3 font-semibold">Complainant</th>
                      <th className="px-3.5 py-3 font-semibold">Type</th>
                      <th className="px-3.5 py-3 font-semibold">Subject</th>
                      <th className="px-3.5 py-3 font-semibold">Priority</th>
                      <th className="px-3.5 py-3 font-semibold">Assigned To</th>
                      <th className="px-3.5 py-3 font-semibold">Date</th>
                      <th className="px-3.5 py-3 font-semibold">Status</th>
                      <th className="px-3.5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/70">
                    {paginatedComplaints.length > 0 ? (
                      paginatedComplaints.map((c) => {
                        const complainant = c.complainantName || c.complaintBy || 'Anonymous';
                        const assignedPerson = c.assignedTo || c.assigned || 'Unassigned';

                        return (
                          <tr key={c._id} className="hover:bg-zinc-50/80 transition-colors">
                            
                            {/* ID */}
                            <td className="px-3.5 py-3">
                              <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-[11px] border border-zinc-200">
                                {c.complaintId || 'CMP-2026-0000'}
                              </span>
                            </td>

                            {/* Complainant & Source */}
                            <td className="px-3.5 py-3">
                              <div className="space-y-0.5">
                                <div className="font-semibold text-zinc-950 flex items-center gap-1.5">
                                  <span>{complainant}</span>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                    c.source === 'Parent' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                    c.source === 'Student' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {c.source || 'General'}
                                  </span>
                                </div>
                                {c.phone && (
                                  <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>{c.phone}</span>
                                  </div>
                                )}
                                {c.studentName && c.source === 'Parent' && (
                                  <div className="text-[10px] text-zinc-400">
                                    Student: {c.studentName} {c.studentClass ? `(${c.studentClass})` : ''}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Type */}
                            <td className="px-3.5 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                                c.complaintType === 'Academic' 
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                                  : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                              }`}>
                                {c.complaintType || 'Academic'}
                              </span>
                            </td>

                            {/* Subject */}
                            <td className="px-3.5 py-3 max-w-[200px]">
                              <div className="font-medium text-zinc-900 truncate" title={c.subject}>
                                {c.subject}
                              </div>
                              <div className="text-[11px] text-zinc-400 truncate" title={c.description}>
                                {c.description}
                              </div>
                            </td>

                            {/* Priority */}
                            <td className="px-3.5 py-3">
                              <PriorityBadge priority={c.priority} />
                            </td>

                            {/* Assigned To */}
                            <td className="px-3.5 py-3">
                              {assignedPerson !== 'Unassigned' ? (
                                <span className="font-medium text-zinc-800 flex items-center gap-1">
                                  <UserCheck className="w-3 h-3 text-zinc-500" />
                                  {assignedPerson}
                                </span>
                              ) : (
                                <span className="text-zinc-400 italic">Unassigned</span>
                              )}
                            </td>

                            {/* Date */}
                            <td className="px-3.5 py-3 text-zinc-600 whitespace-nowrap">
                              {formatDate(c.complaintDate || c.date || c.createdAt)}
                            </td>

                            {/* Status Badge & Quick Resolve */}
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <button 
                                onClick={() => handleOpenStatusModal(c)}
                                className="cursor-pointer hover:opacity-80 transition-opacity text-left"
                                title="Click to update status or resolve"
                              >
                                <StatusBadge status={c.status} />
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="px-3.5 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                
                                {/* View Details */}
                                <Button 
                                  onClick={() => setViewComplaint(c)} 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                                  title="View Full Details & History"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>

                                {/* Quick Status Dialog */}
                                <Button 
                                  onClick={() => handleOpenStatusModal(c)} 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  title="Change Status / Add Resolution"
                                >
                                  <Activity className="h-3.5 w-3.5" />
                                </Button>

                                {/* Edit */}
                                <Button 
                                  onClick={() => handleEdit(c)} 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                                  title="Edit Complaint"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>

                                {/* Delete */}
                                <Button 
                                  onClick={() => setDeleteConfirmId(c._id)} 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                  title="Delete Complaint"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>

                              </div>
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                              <Archive className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-900">No complaint records found</p>
                            <p className="text-xs text-zinc-500">
                              {searchQuery || statusFilter !== 'All' 
                                ? 'No complaints match the selected search or filter criteria.' 
                                : 'There are no complaints registered in the system yet.'}
                            </p>
                            {(searchQuery || statusFilter !== 'All') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleResetFilters} 
                                className="mt-2 text-xs border-zinc-200"
                              >
                                Clear All Filters
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="p-3.5 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 bg-zinc-50/40">
              <div>
                Showing {filteredComplaints.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} entries
              </div>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="h-7 px-2.5 text-xs text-zinc-700 border-zinc-200 bg-white hover:bg-zinc-50"
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1 text-zinc-400">...</span>}
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-7 w-7 p-0 text-xs font-medium ${
                          currentPage === page 
                            ? 'bg-zinc-950 text-white hover:bg-zinc-800' 
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || loading || totalPages === 0}
                  className="h-7 px-2.5 text-xs text-zinc-700 border-zinc-200 bg-white hover:bg-zinc-50"
                >
                  Next
                </Button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: VIEW COMPLAINT DETAILS & AUDIT HISTORY               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-sm bg-zinc-900 text-white px-2.5 py-0.5 rounded">
                  {viewComplaint.complaintId || 'CMP'}
                </span>
                <StatusBadge status={viewComplaint.status} />
                <PriorityBadge priority={viewComplaint.priority} />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewComplaint(null)} 
                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-800">
              
              {/* Section 1: Complaint Core Details */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-zinc-700" />
                  {viewComplaint.subject}
                </h3>
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-700 whitespace-pre-wrap leading-relaxed">
                  {viewComplaint.description}
                </div>
              </div>

              {/* Section 2: Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-zinc-50/70 border border-zinc-200">
                
                {/* Complainant info */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Complainant Info</span>
                  <div className="font-semibold text-zinc-950 text-sm">
                    {viewComplaint.complainantName || viewComplaint.complaintBy}
                  </div>
                  <div className="text-zinc-600 flex items-center gap-1">
                    <User className="w-3 h-3 text-zinc-400" />
                    Source: <span className="font-medium text-zinc-900">{viewComplaint.source || 'General'}</span>
                  </div>
                  {viewComplaint.phone && (
                    <div className="text-zinc-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      {viewComplaint.phone}
                    </div>
                  )}
                  {viewComplaint.studentName && (
                    <div className="text-zinc-600 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-zinc-400" />
                      Student: {viewComplaint.studentName} {viewComplaint.studentClass ? `(${viewComplaint.studentClass})` : ''}
                    </div>
                  )}
                </div>

                {/* Assignment & Categorization */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Assignment & Meta</span>
                  <div className="text-zinc-600 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-zinc-400" />
                    Type: <span className="font-medium text-zinc-900">{viewComplaint.complaintType}</span>
                  </div>
                  <div className="text-zinc-600 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-zinc-400" />
                    Assigned To: <span className="font-semibold text-zinc-900">{viewComplaint.assignedTo || viewComplaint.assigned || 'Unassigned'}</span>
                  </div>
                  <div className="text-zinc-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    Date: <span className="font-medium text-zinc-900">{formatDate(viewComplaint.complaintDate || viewComplaint.date)}</span>
                  </div>
                  {viewComplaint.attachmentUrl && (
                    <div className="pt-1">
                      <a 
                        href={viewComplaint.attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-medium text-[11px] transition-colors"
                      >
                        <Paperclip className="w-3 h-3" />
                        View Attached Evidence
                      </a>
                    </div>
                  )}
                </div>

              </div>

              {/* Section 3: Resolution Summary (if resolved or closed) */}
              {(viewComplaint.status === 'Resolved' || viewComplaint.status === 'Closed' || viewComplaint.actionTaken) && (
                <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Resolution & Action Taken
                    </span>
                    {viewComplaint.resolvedDate && (
                      <span className="text-[10px] text-emerald-700">
                        Resolved on: {formatDateTime(viewComplaint.resolvedDate)}
                      </span>
                    )}
                  </div>
                  <div className="text-zinc-900 font-medium whitespace-pre-wrap">
                    {viewComplaint.actionTaken || 'No action summary recorded.'}
                  </div>
                  {viewComplaint.resolutionNotes && (
                    <div className="text-[11px] text-zinc-600 border-t border-emerald-200/60 pt-1.5">
                      <span className="font-semibold">Notes: </span>{viewComplaint.resolutionNotes}
                    </div>
                  )}
                  {viewComplaint.resolvedBy && (
                    <div className="text-[10px] text-emerald-800">
                      Resolved By: <span className="font-semibold">{viewComplaint.resolvedBy}</span>
                    </div>
                  )}
                  {viewComplaint.closedDate && (
                    <div className="text-[10px] text-zinc-500">
                      Closed on: {formatDateTime(viewComplaint.closedDate)}
                    </div>
                  )}
                </div>
              )}

              {/* Section 4: Audit Trail / History */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-zinc-500" />
                  Audit Trail & History
                </span>
                
                <div className="border border-zinc-200 rounded-lg p-3 divide-y divide-zinc-100 bg-zinc-50/30">
                  {viewComplaint.history && viewComplaint.history.length > 0 ? (
                    viewComplaint.history.map((h, i) => (
                      <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                            {h.action}
                          </div>
                          {h.notes && <div className="text-[11px] text-zinc-600 pl-3">{h.notes}</div>}
                        </div>
                        <div className="text-right text-[10px] text-zinc-400 shrink-0">
                          <div>{h.user || 'Admin'}</div>
                          <div>{formatDateTime(h.date)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-400 italic py-1 text-center">Initial complaint record created.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const comp = viewComplaint;
                  setViewComplaint(null);
                  handleEdit(comp);
                }}
                className="text-xs"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit Complaint
              </Button>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  onClick={() => {
                    const comp = viewComplaint;
                    handleOpenStatusModal(comp);
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold"
                >
                  Change Status / Resolve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setViewComplaint(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: STATUS UPDATE / RESOLUTION WORKFLOW                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {statusModalComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-lg w-full overflow-hidden">
            
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <h3 className="font-bold text-sm text-zinc-950">
                  Update Status - {statusModalComplaint.complaintId || 'CMP'}
                </h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStatusModalComplaint(null)} 
                className="h-7 w-7 p-0 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-5 space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700">Select Next Status</Label>
                <select
                  value={statusUpdateData.status}
                  onChange={e => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
                  required
                >
                  <option value="Pending">Pending (Awaiting investigation)</option>
                  <option value="In Progress">In Progress (Active resolution)</option>
                  <option value="Resolved">Resolved (Action completed)</option>
                  <option value="Closed">Closed (Archived)</option>
                </select>
              </div>

              {/* If Resolving, ask for Action Taken */}
              {statusUpdateData.status === 'Resolved' && (
                <div className="space-y-3 bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-200">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-emerald-950">
                      Action Taken / Resolution Summary <span className="text-rose-500">*</span>
                    </Label>
                    <textarea 
                      value={statusUpdateData.actionTaken}
                      onChange={e => setStatusUpdateData({ ...statusUpdateData, actionTaken: e.target.value })}
                      placeholder="Describe what specific action was taken to resolve this complaint..."
                      rows={3}
                      className="flex w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700 resize-y"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-emerald-900">Resolved By (Staff / Admin Name)</Label>
                    <Input 
                      value={statusUpdateData.resolvedBy}
                      onChange={e => setStatusUpdateData({ ...statusUpdateData, resolvedBy: e.target.value })}
                      placeholder="e.g. Principal / Academic Coordinator"
                      className="h-8 text-xs bg-white border-emerald-300"
                    />
                  </div>
                </div>
              )}

              {/* Optional Resolution Notes for any transition */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">Internal Remarks / Notes</Label>
                <textarea 
                  value={statusUpdateData.resolutionNotes}
                  onChange={e => setStatusUpdateData({ ...statusUpdateData, resolutionNotes: e.target.value })}
                  placeholder="Optional audit notes regarding this status change..."
                  rows={2}
                  className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 resize-y"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setStatusModalComplaint(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={statusUpdating}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs"
                >
                  {statusUpdating ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Update Status'
                  )}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: DELETE CONFIRMATION                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-950">Confirm Deletion</h3>
                <p className="text-xs text-zinc-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              Are you sure you want to permanently delete this complaint record from the database?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteConfirmId(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Delete Record
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
