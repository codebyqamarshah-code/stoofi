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
  Users,
  UserCheck,
  LogOut,
  Clock,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
  RotateCcw,
  Calendar,
  Phone,
  User,
  Building,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import api from '@/services/api';

// Helper to get current time in 12-hour format (e.g. "10:30 AM")
function getCurrentTimeFormatted() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Helper to get today's date in YYYY-MM-DD
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

export default function VisitorBookPage() {
  const [visitors, setVisitors] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedVisitorForView, setSelectedVisitorForView] = useState(null);

  const initialFormState = {
    name: '',
    noOfPerson: 1,
    phone: '',
    visitorType: 'Parent / Guardian',
    purpose: 'Meeting',
    whomToMeet: 'Principal',
    date: getTodayDateString(),
    inTime: getCurrentTimeFormatted(),
    outTime: '',
    cnic: '',
    address: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [customDate, setCustomDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formRef = useRef(null);

  // Fetch Visitors & Staff Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [visitorRes, teacherRes, staffRes] = await Promise.all([
        api.get('/visitor-book'),
        api.get('/teachers').catch(() => ({ data: [] })),
        api.get('/staff').catch(() => ({ data: [] }))
      ]);

      if (visitorRes?.success) {
        setVisitors(visitorRes.data || []);
      }

      // Populate Whom To Meet list from teachers & staff
      const combinedStaff = [
        'Principal',
        'Administrator',
        'Accountant',
        'Front Desk / Reception',
        'Class Teacher'
      ];

      if (Array.isArray(teacherRes?.data)) {
        teacherRes.data.forEach(t => {
          const name = `Teacher: ${t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim()}`;
          if (name.length > 9 && !combinedStaff.includes(name)) combinedStaff.push(name);
        });
      }

      if (Array.isArray(staffRes?.data)) {
        staffRes.data.forEach(s => {
          const name = `Staff: ${s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim()}`;
          if (name.length > 7 && !combinedStaff.includes(name)) combinedStaff.push(name);
        });
      }

      setStaffList(combinedStaff);
    } catch (err) {
      console.error('Error fetching visitor book:', err);
      setError('Failed to load visitor records. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Visitor name is required.';
    
    const num = parseInt(formData.noOfPerson, 10);
    if (isNaN(num) || num < 1) errors.noOfPerson = 'Must be at least 1 person.';

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^((\+92)|(0092)|(0))?3[0-9]{9}$|^(\+?[1-9]\d{6,14})$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number.';
    }

    if (!formData.purpose.trim()) errors.purpose = 'Purpose is required.';
    if (!formData.whomToMeet.trim()) errors.whomToMeet = 'Please select whom to meet.';
    if (!formData.date) errors.date = 'Visit date is required.';
    if (!formData.inTime.trim()) errors.inTime = 'In time is required.';

    if (formData.cnic && formData.cnic.trim() !== '') {
      if (!/^[0-9]{5}-[0-9]{7}-[0-9]{1}$|^[0-9]{13}$/.test(formData.cnic.trim())) {
        errors.cnic = 'Invalid CNIC format (e.g. 35202-1234567-1).';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save / Update
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        noOfPerson: parseInt(formData.noOfPerson, 10) || 1,
        phone: formData.phone.trim(),
        visitorType: formData.visitorType,
        purpose: formData.purpose.trim(),
        whomToMeet: formData.whomToMeet.trim(),
        date: formData.date,
        inTime: formData.inTime.trim(),
        outTime: formData.outTime ? formData.outTime.trim() : null,
        cnic: formData.cnic.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim()
      };

      if (editingId) {
        const res = await api.put(`/visitor-book/${editingId}`, payload);
        if (res?.success) {
          setVisitors(prev => prev.map(v => v._id === editingId ? res.data : v));
          showToast('Visitor record updated successfully!');
        }
      } else {
        const res = await api.post('/visitor-book', payload);
        if (res?.success) {
          setVisitors(prev => [res.data, ...prev]);
          showToast('New visitor registered successfully!');
        }
      }

      setFormData(initialFormState);
      setFormErrors({});
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save visitor:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save visitor record.', true);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Form
  const handleEdit = (visitor) => {
    setEditingId(visitor._id);
    setFormData({
      name: visitor.name || '',
      noOfPerson: visitor.noOfPerson || 1,
      phone: visitor.phone || '',
      visitorType: visitor.visitorType || 'Parent / Guardian',
      purpose: visitor.purpose || 'Meeting',
      whomToMeet: visitor.whomToMeet || 'Principal',
      date: visitor.date ? visitor.date.substring(0, 10) : getTodayDateString(),
      inTime: visitor.inTime || getCurrentTimeFormatted(),
      outTime: visitor.outTime || '',
      cnic: visitor.cnic || '',
      address: visitor.address || '',
      notes: visitor.notes || ''
    });
    setFormErrors({});
    setShowForm(true);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1-Click Check Out
  const handleCheckOut = async (visitor) => {
    try {
      const currentTime = getCurrentTimeFormatted();
      const res = await api.patch(`/visitor-book/${visitor._id}/checkout`, { outTime: currentTime });
      if (res?.success) {
        setVisitors(prev => prev.map(v => v._id === visitor._id ? res.data : v));
        showToast(`${visitor.name} checked out successfully at ${currentTime}!`);
      }
    } catch (err) {
      console.error('Failed to check out visitor:', err);
      showToast(err?.response?.data?.message || 'Failed to check out visitor.', true);
    }
  };

  // Delete Visitor
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this visitor record?')) return;

    try {
      const res = await api.delete(`/visitor-book/${id}`);
      if (res?.success) {
        setVisitors(prev => prev.filter(v => v._id !== id));
        showToast('Visitor record deleted successfully.');
      }
    } catch (err) {
      console.error('Failed to delete visitor:', err);
      showToast(err?.response?.data?.message || 'Failed to delete visitor record.', true);
    }
  };

  // Calculate Real-time Summary Cards
  const stats = useMemo(() => {
    const todayStr = getTodayDateString();
    const todayRecords = visitors.filter(v => v.date && v.date.substring(0, 10) === todayStr);
    const currentlyInside = visitors.filter(v => v.status === 'Inside' || !v.outTime);
    const checkedOutToday = todayRecords.filter(v => v.status === 'Checked Out' && v.outTime);
    const totalVisitsToday = todayRecords.length;
    const totalPersonsToday = todayRecords.reduce((sum, v) => sum + (Number(v.noOfPerson) || 1), 0);

    return {
      todayVisitors: todayRecords.length,
      currentlyInside: currentlyInside.length,
      checkedOutToday: checkedOutToday.length,
      totalVisitsToday,
      totalPersonsToday
    };
  }, [visitors]);

  // Filtered & Searched Visitors
  const filteredVisitors = useMemo(() => {
    const todayStr = getTodayDateString();
    
    return visitors.filter(v => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.phone && v.phone.includes(q)) ||
        (v.purpose && v.purpose.toLowerCase().includes(q)) ||
        (v.whomToMeet && v.whomToMeet.toLowerCase().includes(q)) ||
        (v.cnic && v.cnic.includes(q));

      // 2. Visitor Type Filter
      const matchType = typeFilter === 'All' || v.visitorType === typeFilter;

      // 3. Status Filter
      const isInside = v.status === 'Inside' || !v.outTime;
      const matchStatus = statusFilter === 'All' || 
        (statusFilter === 'Inside' && isInside) ||
        (statusFilter === 'Checked Out' && !isInside);

      // 4. Date Filter
      let matchDate = true;
      if (dateFilter === 'Today') {
        matchDate = v.date && v.date.substring(0, 10) === todayStr;
      } else if (dateFilter === 'Custom' && customDate) {
        matchDate = v.date && v.date.substring(0, 10) === customDate;
      }

      return matchSearch && matchType && matchStatus && matchDate;
    });
  }, [visitors, searchQuery, typeFilter, statusFilter, dateFilter, customDate]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage) || 1;
  const paginatedVisitors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVisitors.slice(start, start + itemsPerPage);
  }, [filteredVisitors, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, statusFilter, dateFilter, customDate]);

  // Export Data Handler
  const handleExport = (type) => {
    if (filteredVisitors.length === 0) {
      alert('No visitor records to export.');
      return;
    }

    const exportData = filteredVisitors.map(v => ({
      'Visitor Name': v.name,
      'No. of Persons': v.noOfPerson || 1,
      'Phone': v.phone || '-',
      'Visitor Type': v.visitorType || 'Parent / Guardian',
      'Purpose': v.purpose || '-',
      'Whom to Meet': v.whomToMeet || '-',
      'Date': v.date ? v.date.substring(0, 10) : '-',
      'In Time': v.inTime || '-',
      'Out Time': v.outTime || '-',
      'Status': v.outTime ? 'Checked Out' : 'Inside',
      'CNIC': v.cnic || '-',
      'Address': v.address || '-',
      'Notes': v.notes || '-'
    }));

    const headers = [
      'Visitor Name', 'No. of Persons', 'Phone', 'Visitor Type', 'Purpose', 
      'Whom to Meet', 'Date', 'In Time', 'Out Time', 'Status', 'CNIC', 'Address', 'Notes'
    ];
    const filename = `stoofi_visitor_book_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi Visitor Book');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename);
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Stoofi Visitor Book', filename);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200 ${
          toastMessage.isError 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-zinc-950 border-zinc-800 text-white'
        }`}>
          {toastMessage.isError ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Visitor Book</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage school visitors, check-ins, check-outs, and campus security logs</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-600 transition-colors">Admin Section</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Visitor Book</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. REAL-TIME STATS SUMMARY CARDS
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Today&apos;s Visitors</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{stats.todayVisitors}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Currently Inside</p>
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.currentlyInside}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Checked Out Today</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{stats.checkedOutToday}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
            <LogOut className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Visits Today</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{stats.totalVisitsToday ?? stats.todayVisitors}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ADD / EDIT VISITOR FORM CARD
      ────────────────────────────────────────────────────────────── */}
      <div ref={formRef}>
        {showForm ? (
          <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden mb-6 animate-in fade-in duration-200">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-zinc-950">
                  {editingId ? 'Edit Visitor Record' : 'Register New Visitor'}
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
                className="text-zinc-500 hover:text-zinc-950 h-8 text-xs"
              >
                Cancel
              </Button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Visitor Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Visitor Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Full Name" 
                    className={`bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950 ${formErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : ''}`} 
                  />
                  {formErrors.name && <p className="text-[11px] text-rose-600 font-medium">{formErrors.name}</p>}
                </div>

                {/* Number of Persons */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    No. of Persons <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    type="number"
                    min="1"
                    value={formData.noOfPerson} 
                    onChange={e => setFormData({...formData, noOfPerson: e.target.value})} 
                    className={`bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950 ${formErrors.noOfPerson ? 'border-rose-500 ring-1 ring-rose-500' : ''}`} 
                  />
                  {formErrors.noOfPerson && <p className="text-[11px] text-rose-600 font-medium">{formErrors.noOfPerson}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Phone Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    placeholder="03001234567" 
                    className={`bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950 ${formErrors.phone ? 'border-rose-500 ring-1 ring-rose-500' : ''}`} 
                  />
                  {formErrors.phone && <p className="text-[11px] text-rose-600 font-medium">{formErrors.phone}</p>}
                </div>

                {/* Visitor Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Visitor Type <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    value={formData.visitorType} 
                    onChange={e => setFormData({...formData, visitorType: e.target.value})} 
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                  >
                    <option value="Parent / Guardian">Parent / Guardian</option>
                    <option value="Guest">Guest</option>
                    <option value="Official">Official</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Purpose */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Purpose <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    value={formData.purpose} 
                    onChange={e => setFormData({...formData, purpose: e.target.value})} 
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Admission">Admission Inquiry</option>
                    <option value="Fee Related">Fee Related</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Inquiry">General Inquiry</option>
                    <option value="Official Work">Official Work</option>
                    <option value="Delivery">Delivery / Courier</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Whom to Meet */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Whom to Meet <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    value={formData.whomToMeet} 
                    onChange={e => setFormData({...formData, whomToMeet: e.target.value})} 
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                  >
                    {staffList.map((st, i) => (
                      <option key={i} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Visit Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Visit Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    type="date"
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950" 
                  />
                </div>

                {/* In Time */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    In Time <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={formData.inTime} 
                    onChange={e => setFormData({...formData, inTime: e.target.value})} 
                    placeholder="10:30 AM" 
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950" 
                  />
                </div>

                {/* Out Time (Optional on edit) */}
                {editingId && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 uppercase">Out Time</Label>
                    <Input 
                      value={formData.outTime} 
                      onChange={e => setFormData({...formData, outTime: e.target.value})} 
                      placeholder="01:15 PM" 
                      className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950" 
                    />
                  </div>
                )}

                {/* CNIC / ID Number */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">CNIC / ID Number (Optional)</Label>
                  <Input 
                    value={formData.cnic} 
                    onChange={e => setFormData({...formData, cnic: e.target.value})} 
                    placeholder="35202-1234567-1" 
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950" 
                  />
                  {formErrors.cnic && <p className="text-[11px] text-rose-600 font-medium">{formErrors.cnic}</p>}
                </div>

                {/* Address */}
                <div className="space-y-1.5 lg:col-span-2">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Address (Optional)</Label>
                  <Input 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    placeholder="City / Address" 
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-950" 
                  />
                </div>

                {/* Remarks / Notes */}
                <div className="space-y-1.5 lg:col-span-4">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Remarks / Notes</Label>
                  <textarea 
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                    placeholder="Enter additional remarks or meeting notes..." 
                    rows={2}
                    className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 resize-none" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData(initialFormState);
                  }}
                  className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingId ? 'UPDATE VISITOR' : 'REGISTER VISITOR'}
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN VISITOR LIST & FILTER CARD
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden flex flex-col">
        {/* Top Filter and Action Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-950">Visitor Directory</h2>
              <p className="text-xs text-zinc-500">Showing all checked-in and completed visits</p>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => {
                  setFormData(initialFormState);
                  setEditingId(null);
                  setFormErrors({});
                  setShowForm(true);
                }} 
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-9 px-4 text-xs rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Visitor</span>
              </Button>
            </div>
          </div>

          {/* Search, Filter Dropdowns, and Export */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, purpose..." 
                className="pl-9 bg-zinc-50 border-zinc-200 text-zinc-950 text-xs rounded-xl h-10 focus-visible:ring-zinc-950"
              />
            </div>

            {/* Visitor Type Filter */}
            <div>
              <select 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-zinc-950 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              >
                <option value="All">All Visitor Types</option>
                <option value="Parent / Guardian">Parent / Guardian</option>
                <option value="Guest">Guest</option>
                <option value="Official">Official</option>
                <option value="Vendor">Vendor</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-zinc-950 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
              >
                <option value="All">All Statuses</option>
                <option value="Inside">Currently Inside</option>
                <option value="Checked Out">Checked Out</option>
              </select>
            </div>

            {/* Export Toolbar */}
            <div className="flex items-center justify-end border border-zinc-200 rounded-xl bg-zinc-50 overflow-hidden h-10">
              <button onClick={() => handleExport('CSV')} className="flex-1 p-2 hover:bg-zinc-200 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-bold" title="Export CSV">
                CSV
              </button>
              <button onClick={() => handleExport('Excel')} className="flex-1 p-2 hover:bg-zinc-200 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-bold" title="Export Excel">
                Excel
              </button>
              <button onClick={() => handleExport('PDF')} className="flex-1 p-2 hover:bg-zinc-200 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-bold" title="Export PDF">
                PDF
              </button>
              <button onClick={() => handleExport('Print')} className="p-2.5 hover:bg-zinc-200 text-zinc-600 transition-colors" title="Print">
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Visitor Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-zinc-600 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3.5">Visitor Name</th>
                <th className="px-3 py-3.5">Persons</th>
                <th className="px-3 py-3.5">Phone</th>
                <th className="px-3 py-3.5">Type</th>
                <th className="px-4 py-3.5">Purpose</th>
                <th className="px-4 py-3.5">Whom to Meet</th>
                <th className="px-3 py-3.5">Date</th>
                <th className="px-3 py-3.5">In / Out</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-950 mb-2" />
                    <p className="text-xs font-medium">Loading visitor records...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-rose-600">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xs font-bold">{error}</p>
                    <Button onClick={fetchData} size="sm" variant="outline" className="mt-3 text-xs border-zinc-300">
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry
                    </Button>
                  </td>
                </tr>
              ) : paginatedVisitors.length > 0 ? (
                paginatedVisitors.map((v) => {
                  const isInside = v.status === 'Inside' || !v.outTime;
                  return (
                    <tr key={v._id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3 font-bold text-zinc-950">
                        {v.name}
                        {v.cnic && <span className="block text-[10px] text-zinc-400 font-normal">ID: {v.cnic}</span>}
                      </td>

                      {/* No of Persons */}
                      <td className="px-3 py-3 font-semibold text-zinc-800">
                        {v.noOfPerson || 1}
                      </td>

                      {/* Phone */}
                      <td className="px-3 py-3 text-zinc-700 font-mono text-[11px]">
                        {v.phone || '-'}
                      </td>

                      {/* Type */}
                      <td className="px-3 py-3 text-zinc-600 font-medium">
                        {v.visitorType || 'Parent'}
                      </td>

                      {/* Purpose */}
                      <td className="px-4 py-3 text-zinc-800 font-medium max-w-[140px] truncate">
                        {v.purpose}
                      </td>

                      {/* Whom to Meet */}
                      <td className="px-4 py-3 text-zinc-700 font-medium max-w-[140px] truncate">
                        {v.whomToMeet || '-'}
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 text-zinc-600 whitespace-nowrap">
                        {v.date ? v.date.substring(0, 10) : '-'}
                      </td>

                      {/* In / Out Times */}
                      <td className="px-3 py-3 whitespace-nowrap text-zinc-700 font-mono text-[11px]">
                        <div>In: <span className="font-bold text-zinc-950">{v.inTime || '-'}</span></div>
                        <div>Out: <span className={v.outTime ? 'text-zinc-600' : 'text-zinc-400 italic'}>{v.outTime || 'Inside'}</span></div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isInside
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}>
                          {isInside && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                          {isInside ? 'Inside' : 'Checked Out'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                        {/* 1-Click Check Out button */}
                        {isInside && (
                          <Button 
                            onClick={() => handleCheckOut(v)} 
                            size="sm" 
                            variant="outline"
                            className="h-7 text-[11px] font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 px-2.5 rounded-lg"
                            title="Check out visitor now"
                          >
                            <LogOut className="w-3 h-3 mr-1" />
                            <span>Out</span>
                          </Button>
                        )}

                        {/* View Details */}
                        <Button 
                          onClick={() => setSelectedVisitorForView(v)} 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-zinc-700 border-zinc-200 hover:bg-zinc-100 px-2 rounded-lg"
                          title="View complete record"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {/* Edit */}
                        <Button 
                          onClick={() => handleEdit(v)} 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-zinc-700 border-zinc-200 hover:bg-zinc-100 px-2 rounded-lg"
                          title="Edit record"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button 
                          onClick={() => handleDelete(v._id)} 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-rose-600 border-rose-200 hover:bg-rose-50 px-2 rounded-lg"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-500">
                    <Users className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                    <p className="text-sm font-semibold text-zinc-700">No visitor records found.</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {searchQuery || typeFilter !== 'All' || statusFilter !== 'All' 
                        ? 'Try adjusting your search query or filter options.' 
                        : 'Click "+ Add Visitor" above to register a new school guest.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 bg-zinc-50/50">
          <div>
            Showing {filteredVisitors.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
            {Math.min(currentPage * itemsPerPage, filteredVisitors.length)} of {filteredVisitors.length} entries
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="h-7 px-2.5 text-xs text-zinc-700 border-zinc-300 disabled:opacity-40"
              >
                Previous
              </Button>
              
              <span className="text-xs font-bold text-zinc-800 px-2">
                Page {currentPage} of {totalPages}
              </span>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-7 px-2.5 text-xs text-zinc-700 border-zinc-300 disabled:opacity-40"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. VIEW VISITOR DETAILS MODAL
      ────────────────────────────────────────────────────────────── */}
      {selectedVisitorForView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200">
            {/* Modal Header */}
            <div className="p-5 bg-zinc-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">{selectedVisitorForView.name}</h3>
                  <p className="text-xs text-zinc-400 leading-tight mt-0.5">{selectedVisitorForView.visitorType || 'Visitor'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVisitorForView(null)} 
                className="p-1.5 rounded-full hover:bg-white/20 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Phone</p>
                  <p className="font-bold text-zinc-950 text-sm mt-0.5">{selectedVisitorForView.phone || 'N/A'}</p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">No. of Persons</p>
                  <p className="font-bold text-zinc-950 text-sm mt-0.5">{selectedVisitorForView.noOfPerson || 1}</p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Purpose</p>
                  <p className="font-bold text-zinc-950 text-sm mt-0.5">{selectedVisitorForView.purpose}</p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Whom to Meet</p>
                  <p className="font-bold text-zinc-950 text-sm mt-0.5">{selectedVisitorForView.whomToMeet || 'N/A'}</p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Visit Date</p>
                  <p className="font-bold text-zinc-950 text-sm mt-0.5">
                    {selectedVisitorForView.date ? selectedVisitorForView.date.substring(0, 10) : 'N/A'}
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Status</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedVisitorForView.status === 'Inside' || !selectedVisitorForView.outTime
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}>
                    {selectedVisitorForView.status === 'Inside' || !selectedVisitorForView.outTime ? 'Inside Campus' : 'Checked Out'}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">In Time</p>
                  <p className="font-bold text-zinc-950 text-sm mt-0.5">{selectedVisitorForView.inTime || '-'}</p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Out Time</p>
                  <p className="font-bold text-zinc-950 text-sm mt-0.5">{selectedVisitorForView.outTime || 'Inside'}</p>
                </div>
              </div>

              {selectedVisitorForView.cnic && (
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">CNIC / ID Number</p>
                  <p className="font-semibold text-zinc-950 mt-0.5">{selectedVisitorForView.cnic}</p>
                </div>
              )}

              {selectedVisitorForView.address && (
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Address</p>
                  <p className="font-semibold text-zinc-950 mt-0.5">{selectedVisitorForView.address}</p>
                </div>
              )}

              {selectedVisitorForView.notes && (
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Remarks / Meeting Notes</p>
                  <p className="font-normal text-zinc-700 mt-1 whitespace-pre-wrap">{selectedVisitorForView.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-100 flex justify-end">
              <Button 
                onClick={() => setSelectedVisitorForView(null)} 
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
