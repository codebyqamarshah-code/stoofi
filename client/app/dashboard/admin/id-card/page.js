'use client';

import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  CreditCard,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Eye,
  Download,
  Printer,
  RefreshCw,
  Sparkles,
  Layers,
  GraduationCap,
  Calendar,
  Phone,
  Building,
  ShieldCheck,
  Upload,
  Camera,
  Image as ImageIcon,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { downloadIdCardPDF } from '@/lib/idCardPdf';

const THEME_STYLES = [
  { id: 'stoofi-emerald', label: '1. Emerald & Deep Navy Lanyard Badge', headerBg: 'from-emerald-700 via-teal-800 to-sky-950', border: 'border-emerald-600', accent: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { id: 'classic-navy', label: '2. Executive Navy Horizontal Pass', headerBg: 'from-sky-950 via-sky-900 to-indigo-950', border: 'border-sky-800', accent: 'bg-sky-50 text-sky-900 border-sky-300' },
  { id: 'royal-purple', label: '3. Royal Purple Academic Badge', headerBg: 'from-purple-900 via-indigo-900 to-purple-950', border: 'border-purple-600', accent: 'bg-purple-50 text-purple-900 border-purple-300' },
  { id: 'dark-slate', label: '4. Dark Luxury Obsidian Smart Card', headerBg: 'from-zinc-950 via-zinc-900 to-black', border: 'border-zinc-700', accent: 'bg-zinc-900 text-emerald-400 border-zinc-700' },
  { id: 'crimson-gold', label: '5. Heritage Crimson & Gold Crest', headerBg: 'from-rose-950 via-rose-900 to-amber-950', border: 'border-amber-600', accent: 'bg-amber-50 text-amber-900 border-amber-300' }
];

const STANDARD_CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const STANDARD_SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D'];

const FALLBACK_TEMPLATES = [
  {
    _id: 'default-student-tpl',
    title: 'Official Student Identity Card',
    role: 'Student',
    cardLayout: 'vertical',
    themeStyle: 'stoofi-emerald',
    headerText: 'OFFICIAL IDENTITY CARD',
    footerText: 'Principal Signature & Seal',
    showPhoto: true,
    showAdmissionNo: true,
    showRollNo: true,
    showClass: true,
    showSection: true,
    showFatherName: true,
    showPhone: true,
    showDob: true,
    showDesignation: false,
    showDepartment: false,
    showQrBarcode: true,
    status: 'Active',
    isDefault: true
  },
  {
    _id: 'default-staff-tpl',
    title: 'Staff & Employee Identity Card',
    role: 'Staff',
    cardLayout: 'vertical',
    themeStyle: 'dark-slate',
    headerText: 'STAFF IDENTITY CARD',
    footerText: 'HR & Administrative Seal',
    showPhoto: true,
    showAdmissionNo: false,
    showRollNo: false,
    showClass: false,
    showSection: false,
    showFatherName: false,
    showPhone: true,
    showDob: false,
    showDesignation: true,
    showDepartment: true,
    showQrBarcode: true,
    status: 'Active',
    isDefault: true
  },
  {
    _id: 'default-teacher-tpl',
    title: 'Faculty & Teacher Smart ID Card',
    role: 'Teacher',
    cardLayout: 'vertical',
    themeStyle: 'classic-navy',
    headerText: 'FACULTY IDENTITY CARD',
    footerText: 'Director of Academics',
    showPhoto: true,
    showAdmissionNo: false,
    showRollNo: false,
    showClass: false,
    showSection: false,
    showFatherName: false,
    showPhone: true,
    showDob: false,
    showDesignation: true,
    showDepartment: true,
    showQrBarcode: true,
    status: 'Active',
    isDefault: true
  }
];

export default function IdCardPage() {
  // Navigation Tabs: 'students' (Issued Student Cards) or 'templates' (Card Templates)
  const [activeTab, setActiveTab] = useState('students');

  // Real Database Students
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('All');
  const [studentSectionFilter, setStudentSectionFilter] = useState('All');

  // Templates State
  const [cards, setCards] = useState(FALLBACK_TEMPLATES);
  const [stats, setStats] = useState({ total: 3, studentCards: 1, staffCards: 2, activeCards: 3 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Template Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 3, totalPages: 1, limit: 10 });

  // Template Form Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Create Student ID Card Modal
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [creatingStudentCard, setCreatingStudentCard] = useState(false);
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    className: 'Class 10',
    section: 'Section A',
    rollNo: '',
    admissionNo: '',
    fatherName: '',
    phone: '',
    gender: 'Male',
    dob: '2008-05-14',
    studentPhoto: '',
    cardTemplate: 'stoofi-emerald'
  });

  // Preview Card Modal (for both student cards & templates)
  const [viewingCard, setViewingCard] = useState(null);
  const [printPortalRecord, setPrintPortalRecord] = useState(null);

  // Template Form State
  const [formData, setFormData] = useState({
    title: '',
    role: 'Student',
    cardLayout: 'vertical',
    themeStyle: 'stoofi-emerald',
    headerText: 'OFFICIAL IDENTITY CARD',
    footerText: 'Principal Signature & Seal',
    showPhoto: true,
    showAdmissionNo: true,
    showRollNo: true,
    showClass: true,
    showSection: true,
    showFatherName: true,
    showPhone: true,
    showDob: true,
    showDesignation: false,
    showDepartment: false,
    showQrBarcode: true,
    status: 'Active'
  });

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch Real Students from Database
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await api.get('/student?limit=200').catch(() => null);
      if (Array.isArray(res?.data)) {
        setStudentsList(res.data);
      } else if (Array.isArray(res)) {
        setStudentsList(res);
      } else {
        setStudentsList([]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudentsList([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // 2. Fetch Templates & Stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: searchQuery.trim(),
        role: roleFilter !== 'All' ? roleFilter : '',
        status: statusFilter !== 'All' ? statusFilter : ''
      });

      const [res, statsRes] = await Promise.all([
        api.get(`/id-card?${queryParams.toString()}`).catch(() => null),
        api.get('/id-card/stats').catch(() => null)
      ]);

      let loadedCards = [];
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        loadedCards = res.data;
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        let filteredFallback = [...FALLBACK_TEMPLATES];
        if (roleFilter !== 'All') filteredFallback = filteredFallback.filter(t => t.role === roleFilter);
        if (statusFilter !== 'All') filteredFallback = filteredFallback.filter(t => t.status === statusFilter);
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filteredFallback = filteredFallback.filter(t => t.title.toLowerCase().includes(q));
        }
        loadedCards = filteredFallback;
        setPagination({ total: loadedCards.length, totalPages: 1, limit: 10 });
      }

      setCards(loadedCards);

      if (statsRes?.success && statsRes.stats) {
        setStats(statsRes.stats);
      } else {
        setStats({
          total: loadedCards.length || 3,
          studentCards: loadedCards.filter(c => c.role === 'Student').length || 1,
          staffCards: loadedCards.filter(c => c.role === 'Staff' || c.role === 'Teacher').length || 2,
          activeCards: loadedCards.filter(c => c.status === 'Active').length || 3
        });
      }
    } catch (err) {
      console.warn('ID Card templates loaded from fallback:', err);
      setCards(FALLBACK_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStudents();
  }, [page, roleFilter, statusFilter]);

  // Open "Create Student ID Card" Modal
  const handleOpenCreateStudent = () => {
    const nextRoll = 100 + studentsList.length + 1;
    const nextAdm = `ADM-${Date.now()}`;
    setStudentForm({
      firstName: '',
      lastName: '',
      className: 'Class 10',
      section: 'Section A',
      rollNo: String(nextRoll),
      admissionNo: nextAdm,
      fatherName: '',
      phone: '',
      gender: 'Male',
      dob: '2008-05-14',
      studentPhoto: '',
      cardTemplate: 'stoofi-emerald'
    });
    setShowCreateStudentModal(true);
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Photo size must be less than 5MB', true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentForm(prev => ({ ...prev, studentPhoto: reader.result }));
        showToast('Profile photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setStudentForm(prev => ({ ...prev, studentPhoto: '' }));
  };

  // Submit & Save Student ID Card to Database
  const handleCreateStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentForm.firstName.trim()) {
      showToast('Student First Name is required.', true);
      return;
    }

    try {
      setCreatingStudentCard(true);
      const res = await api.post('/student', studentForm);
      if (res?.success) {
        showToast(`ID Card generated successfully for ${studentForm.firstName} ${studentForm.lastName}!`);
        setShowCreateStudentModal(false);
        fetchStudents();
        fetchData();
        setActiveTab('students');
      } else {
        showToast(res?.message || 'Failed to generate ID Card.', true);
      }
    } catch (err) {
      console.error('Error creating student ID card:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to create student card.', true);
    } finally {
      setCreatingStudentCard(false);
    }
  };

  // Print Single Card
  const handlePrintStudentCard = (student) => {
    setPrintPortalRecord(student);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Download Single PDF
  const handleDownloadStudentPDF = (student) => {
    downloadIdCardPDF(student, {
      schoolName: 'Stoofi Public School & College',
      address: 'Main Campus, Model Town, Lahore, Pakistan',
      phone: '+92 300 1234567'
    }, student.cardTemplate || 'stoofi-emerald');
    showToast(`PDF downloaded for ${student.firstName} ${student.lastName}`);
  };

  // Open Template Modal
  const handleOpenCreateTemplate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      role: 'Student',
      cardLayout: 'vertical',
      themeStyle: 'stoofi-emerald',
      headerText: 'OFFICIAL IDENTITY CARD',
      footerText: 'Principal Signature & Seal',
      showPhoto: true,
      showAdmissionNo: true,
      showRollNo: true,
      showClass: true,
      showSection: true,
      showFatherName: true,
      showPhone: true,
      showDob: true,
      showDesignation: false,
      showDepartment: false,
      showQrBarcode: true,
      uploadedBackground: '',
      status: 'Active'
    });
    setShowFormModal(true);
  };

  const handleEditTemplate = (card) => {
    setEditingId(card._id);
    setFormData({
      title: card.title || '',
      role: card.role || 'Student',
      cardLayout: card.cardLayout || 'vertical',
      themeStyle: card.themeStyle || 'stoofi-emerald',
      headerText: card.headerText || 'OFFICIAL IDENTITY CARD',
      footerText: card.footerText || 'Principal Signature & Seal',
      showPhoto: card.showPhoto !== undefined ? card.showPhoto : true,
      showAdmissionNo: card.showAdmissionNo !== undefined ? card.showAdmissionNo : true,
      showRollNo: card.showRollNo !== undefined ? card.showRollNo : true,
      showClass: card.showClass !== undefined ? card.showClass : true,
      showSection: card.showSection !== undefined ? card.showSection : true,
      showFatherName: card.showFatherName !== undefined ? card.showFatherName : true,
      showPhone: card.showPhone !== undefined ? card.showPhone : true,
      showDob: card.showDob !== undefined ? card.showDob : true,
      showDesignation: card.showDesignation !== undefined ? card.showDesignation : true,
      showDepartment: card.showDepartment !== undefined ? card.showDepartment : true,
      showQrBarcode: card.showQrBarcode !== undefined ? card.showQrBarcode : true,
      uploadedBackground: card.uploadedBackground || '',
      status: card.status || 'Active'
    });
    setShowFormModal(true);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Template title is required.', true);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        title: formData.title.trim(),
        headerText: formData.headerText.trim(),
        footerText: formData.footerText.trim()
      };

      if (editingId) {
        const res = await api.put(`/id-card/${editingId}`, payload);
        if (res?.success) {
          showToast('ID card template updated successfully!');
          fetchData();
        }
      } else {
        const res = await api.post('/id-card', payload);
        if (res?.success) {
          showToast('ID card template created successfully!');
          fetchData();
        }
      }

      setShowFormModal(false);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save template:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save template.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteConfirmItem) return;
    try {
      await api.delete(`/id-card/${deleteConfirmItem._id}`);
      showToast('Template deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Failed to delete template:', err);
      showToast('Failed to delete template.', true);
    } finally {
      setDeleteConfirmItem(null);
    }
  };

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return studentsList.filter(st => {
      const fullName = `${st.firstName || ''} ${st.lastName || ''}`.toLowerCase();
      const adm = String(st.admissionNo || '').toLowerCase();
      const roll = String(st.rollNo || '').toLowerCase();
      const q = studentSearch.trim().toLowerCase();

      const matchesSearch = !q || fullName.includes(q) || adm.includes(q) || roll.includes(q);
      const matchesClass = studentClassFilter === 'All' || st.className === studentClassFilter;
      const matchesSection = studentSectionFilter === 'All' || st.section === studentSectionFilter;

      return matchesSearch && matchesClass && matchesSection;
    });
  }, [studentsList, studentSearch, studentClassFilter, studentSectionFilter]);

  // ── ULTRA-PROFESSIONAL REAL STUDENT ID CARD RENDERER (Matching User Reference Images) ──
  const renderCardGraphic = (rec) => {
    const theme = THEME_STYLES.find(t => t.id === (rec.cardTemplate || rec.themeStyle)) || THEME_STYLES[0];
    const initial = (rec.firstName || 'S').charAt(0).toUpperCase();
    const fullName = `${rec.firstName || 'Student'} ${rec.lastName || 'Name'}`.trim();
    const admNo = rec.admissionNo || 'ADM-2026-001';
    const rollNo = rec.rollNo || '101';
    const className = rec.className || 'Class 10';
    const section = rec.section || 'Section A';
    const phone = rec.phone || '+92 300 9876543';
    const fatherName = rec.fatherName || 'Syed Ali Shah';
    const dob = rec.dob || '14/05/2008';

    // Horizontal Card Format (Design 2 Classic Navy or explicit horizontal)
    if (rec.cardTemplate === 'classic-navy' || rec.cardLayout === 'horizontal') {
      return (
        <div className="w-[340px] h-[215px] mx-auto bg-[#faf8f5] rounded-xl overflow-hidden border-2 border-zinc-300 shadow-md flex flex-col justify-between text-zinc-900 font-sans select-none relative">
          {/* Top Brand Bar */}
          <div className="bg-[#084A86] px-3.5 py-1.5 flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-black text-[10px] text-amber-300">
                S
              </div>
              <span className="font-extrabold text-[11px] tracking-wide uppercase">Stoofi Public School & College</span>
            </div>
            <span className="text-[8px] opacity-80">Lahore Campus</span>
          </div>

          {/* Body Dual-Column */}
          <div className="p-3 flex items-center gap-3.5 flex-1 bg-white">
            {/* Left: Portrait Photo Box + Barcode */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-20 h-24 rounded-xl border-2 border-[#084A86] overflow-hidden bg-zinc-100 shadow-xs flex items-center justify-center relative">
                {rec.studentPhoto ? (
                  <img src={rec.studentPhoto} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400">
                    <User className="w-8 h-8 text-zinc-400" />
                    <span className="text-[8px] font-bold mt-1 uppercase text-zinc-500">{initial}</span>
                  </div>
                )}
              </div>
              {/* Barcode representation */}
              <div className="mt-1.5 flex items-center gap-0.5 h-3">
                {[2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 2].map((w, idx) => (
                  <span key={idx} className="bg-zinc-800 h-full inline-block" style={{ width: `${w}px` }} />
                ))}
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex-1 min-w-0 text-[10.5px] space-y-1">
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black text-[9px] uppercase tracking-wider mb-0.5 shadow-2xs">
                STUDENT ID CARD
              </div>
              <h4 className="font-black text-xs text-zinc-950 truncate uppercase">{fullName}</h4>

              <div className="space-y-0.5 text-zinc-700 pt-1">
                <div className="flex"><span className="w-14 text-zinc-400 font-semibold">ID No:</span><strong className="font-mono text-zinc-950">{admNo}</strong></div>
                <div className="flex"><span className="w-14 text-zinc-400 font-semibold">Class:</span><strong className="text-[#084A86] font-bold">{className} ({section})</strong></div>
                <div className="flex"><span className="w-14 text-zinc-400 font-semibold">Roll No:</span><strong className="font-mono text-zinc-950">{rollNo}</strong></div>
                <div className="flex"><span className="w-14 text-zinc-400 font-semibold">DOB:</span><span className="text-zinc-800 font-medium">{dob}</span></div>
                <div className="flex"><span className="w-14 text-zinc-400 font-semibold">Emergency:</span><strong className="font-mono text-zinc-800 text-[9.5px]">{phone}</strong></div>
              </div>
            </div>
          </div>

          {/* Bottom Accent Bar */}
          <div className="bg-[#084A86] h-1.5 w-full" />
        </div>
      );
    }

    // Vertical Modern Lanyard Badge (Matching Image 2 Reference)
    return (
      <div className={`w-[270px] mx-auto bg-white rounded-3xl overflow-hidden border-2 ${theme.border} shadow-xl text-zinc-900 font-sans select-none relative flex flex-col`}>
        {/* Lanyard Hole Cutout Representation */}
        <div className="pt-2 pb-1 bg-white text-center">
          <div className="w-12 h-2.5 rounded-full bg-zinc-200 border border-zinc-300 mx-auto shadow-inner" />
        </div>

        {/* Top Angled Geometric Header */}
        <div className={`bg-gradient-to-r ${theme.headerBg} pt-3 pb-4 px-4 text-white text-center relative overflow-hidden`}>
          {/* Subtle geometric background angle */}
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-xs pointer-events-none" />
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <Building className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[9px] tracking-widest font-extrabold uppercase text-amber-300">STOOFI PUBLIC SCHOOL</span>
          </div>
          <h3 className="text-xs font-black tracking-wide leading-tight uppercase">CAMPUS IDENTITY BADGE</h3>
          <p className="text-[8px] text-white/70 mt-0.5">Main Campus, Model Town, Lahore</p>
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col items-center flex-1 bg-white">
          {/* Portrait Rounded-Rectangular Photo Box (Matching Reference Image 2) */}
          <div className="relative mt-1">
            <div className={`w-24 h-28 rounded-2xl border-[3px] ${theme.border} overflow-hidden bg-zinc-100 shadow-md flex items-center justify-center relative`}>
              {rec.studentPhoto ? (
                <img src={rec.studentPhoto} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400 p-2">
                  <User className="w-10 h-10 text-zinc-300" />
                  <span className="text-[9px] font-bold mt-1 text-zinc-400 uppercase">No Photo</span>
                </div>
              )}
            </div>
            {/* Verified badge icon */}
            <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs border-2 border-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Student Name & Role Badge */}
          <div className="mt-3 text-center w-full px-2">
            <h4 className="text-sm font-black text-zinc-950 uppercase tracking-tight truncate leading-tight">
              {fullName}
            </h4>
            <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider border border-emerald-300">
              STUDENT
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="w-full mt-3 space-y-1 text-[10.5px] bg-zinc-50/90 p-2.5 rounded-xl border border-zinc-200">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-semibold">ID No:</span>
              <strong className="font-mono text-zinc-950 font-bold">{admNo}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-semibold">Class & Sec:</span>
              <strong className="text-emerald-800 font-bold">{className} ({section})</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-semibold">Roll Number:</span>
              <strong className="font-mono text-zinc-950 font-bold">{rollNo}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-semibold">DOB:</span>
              <span className="text-zinc-800 font-medium">{dob}</span>
            </div>
            {fatherName && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-semibold">Guardian:</span>
                <span className="text-zinc-900 font-semibold truncate max-w-[130px]">{fatherName}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-semibold">Emergency:</span>
              <strong className="font-mono text-zinc-800 font-bold">{phone}</strong>
            </div>
          </div>

          {/* Barcode & Security Section */}
          <div className="w-full mt-3 pt-2 border-t border-zinc-200/80 flex items-center justify-between">
            <div className="flex flex-col items-start">
              {/* Realistic Barcode Lines */}
              <div className="flex items-center gap-0.5 h-4 mb-0.5">
                {[2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 1, 2, 1, 3, 1, 2, 1, 1, 2].map((w, idx) => (
                  <span key={idx} className="bg-zinc-800 h-full inline-block" style={{ width: `${w}px` }} />
                ))}
              </div>
              <span className="font-mono text-[7px] text-zinc-400 tracking-widest">{admNo}</span>
            </div>

            <div className="text-right">
              <div className="text-[8px] font-bold text-zinc-800 border-b border-zinc-400 pb-0.5 font-serif italic">
                Principal Signature
              </div>
              <span className="text-[6.5px] text-zinc-400 uppercase tracking-wider block mt-0.5">Authorized Seal</span>
            </div>
          </div>
        </div>

        {/* Bottom Accent Slash Bar */}
        <div className={`bg-gradient-to-r ${theme.headerBg} h-2 w-full`} />
      </div>
    );
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

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-zinc-900" />
            ID Card Management & Issuance
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Create official student ID cards, upload profile photos, configure design templates, and print ID badges
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            onClick={handleOpenCreateStudent}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs flex items-center gap-1.5 shadow-xs px-4 rounded-xl cursor-pointer"
            title="Create an ID card with student info & photo"
          >
            <Plus className="h-4 w-4" />
            CREATE ID CARD
          </Button>

          <Button 
            onClick={handleOpenCreateTemplate}
            variant="outline"
            className="border-zinc-300 text-zinc-800 hover:bg-zinc-100 font-semibold h-9 text-xs flex items-center gap-1.5 rounded-xl cursor-pointer"
            title="Design a new ID card template"
          >
            <Layers className="h-4 w-4 text-zinc-600" />
            Manage Templates
          </Button>

          <Link 
            href="/dashboard/admin/generate-id-card"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            title="View all generated cards in bulk view"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            View Generated Cards
          </Link>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Issued Cards</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{studentsList.length}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Enrolled student cards</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active Students</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{studentsList.length}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Ready for instant print</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Design Templates</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-2">{cards.length}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Card themes & styles</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">System Status</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">Active</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Live database synchronization</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'students'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <User className="h-4 w-4" />
          Issued Student ID Cards ({studentsList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          Card Design Templates ({cards.length})
        </button>
      </div>

      {/* TAB 1: ISSUED STUDENT ID CARDS */}
      {activeTab === 'students' && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-3.5 sm:p-4 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-zinc-50/50">
            <div className="flex items-center gap-2.5">
              <Button 
                onClick={handleOpenCreateStudent}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs flex items-center gap-1.5 shadow-2xs px-3 rounded-lg cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                CREATE ID CARD
              </Button>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-zinc-700 border border-zinc-200 shadow-2xs whitespace-nowrap">
                {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'}
              </span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <div className="relative w-full sm:w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input 
                  value={studentSearch} 
                  onChange={e => setStudentSearch(e.target.value)} 
                  placeholder="Search by student name or roll..." 
                  className="pl-8 h-8 text-xs bg-white border-zinc-300 text-zinc-950 rounded-lg" 
                />
              </div>

              <select
                value={studentClassFilter}
                onChange={e => setStudentClassFilter(e.target.value)}
                className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-medium cursor-pointer shadow-2xs"
              >
                <option value="All">All Classes</option>
                {STANDARD_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={studentSectionFilter}
                onChange={e => setStudentSectionFilter(e.target.value)}
                className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-medium cursor-pointer shadow-2xs"
              >
                <option value="All">All Sections</option>
                {STANDARD_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <Button
                onClick={fetchStudents}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-600 border-zinc-300 hover:bg-zinc-100 rounded-lg shrink-0 cursor-pointer"
                title="Refresh student list"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Student ID Cards Table */}
          <div className="overflow-x-auto min-h-[260px]">
            {loadingStudents ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-2">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                <p className="text-xs text-zinc-500">Loading student ID cards...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold bg-zinc-50/80 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-12 text-center">SL</th>
                    <th className="px-4 py-3 font-semibold">Photo</th>
                    <th className="px-4 py-3 font-semibold">Student Name</th>
                    <th className="px-4 py-3 font-semibold">Admission / Roll No</th>
                    <th className="px-4 py-3 font-semibold">Class & Section</th>
                    <th className="px-4 py-3 font-semibold">DOB</th>
                    <th className="px-4 py-3 font-semibold">Guardian / Phone</th>
                    <th className="px-4 py-3 font-semibold w-40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/70">
                  {filteredStudents.map((st, idx) => (
                    <tr key={st._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3 text-center text-zinc-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="w-9 h-11 rounded-lg border border-emerald-600 overflow-hidden bg-zinc-100 flex items-center justify-center shadow-2xs">
                          {st.studentPhoto ? (
                            <img src={st.studentPhoto} alt={st.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-xs text-emerald-800">{st.firstName?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-zinc-950 capitalize">{st.firstName} {st.lastName}</span>
                        <span className="block text-[10px] text-zinc-400 font-medium">{st.gender || 'Student'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-zinc-700 font-semibold">{st.admissionNo || '-'}</span>
                        <span className="block text-[10px] text-zinc-400 font-mono">Roll: {st.rollNo || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-zinc-800">{st.className}</span>
                        <span className="block text-[10px] text-zinc-500 font-medium">{st.section}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-600">{st.dob || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="text-zinc-800 font-medium">{st.fatherName || '-'}</span>
                        <span className="block font-mono text-[10px] text-zinc-500">{st.phone || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrintStudentCard(st)}
                            className="h-7 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-2 font-bold cursor-pointer"
                            title="Print Card"
                          >
                            <Printer className="h-3 w-3 mr-1" /> Print
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadStudentPDF(st)}
                            className="h-7 text-xs border-zinc-300 text-zinc-700 hover:bg-zinc-100 px-2 font-semibold cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="h-3 w-3 mr-1 text-emerald-600" /> PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingCard(st)}
                            className="h-7 w-7 p-0 text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                            title="Preview Card"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-zinc-500">
                <CreditCard className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
                <p className="font-bold text-zinc-800 text-sm">No Student ID Cards Found</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Click the &ldquo;CREATE ID CARD&rdquo; button above to create and issue an official card with student details and photo.
                </p>
                <div className="mt-4">
                  <Button 
                    onClick={handleOpenCreateStudent}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-4 rounded-lg cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> CREATE ID CARD
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CARD DESIGN TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
          {/* Template Toolbar */}
          <div className="p-3.5 sm:p-4 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-zinc-50/50">
            <div className="flex items-center gap-2.5">
              <Button 
                onClick={handleOpenCreateTemplate}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold h-8 text-xs flex items-center gap-1.5 shadow-xs px-3.5 rounded-lg cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Design
              </Button>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-zinc-700 border border-zinc-200 shadow-2xs whitespace-nowrap">
                {cards.length} Templates
              </span>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <div className="relative w-full sm:w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  placeholder="Search templates..." 
                  className="pl-8 h-8 text-xs bg-white border-zinc-300 text-zinc-950 rounded-lg" 
                />
              </div>

              <select
                value={roleFilter}
                onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-medium cursor-pointer shadow-2xs"
              >
                <option value="All">All Roles</option>
                <option value="Student">Student Cards</option>
                <option value="Teacher">Teacher Cards</option>
                <option value="Staff">Staff Cards</option>
              </select>

              <Button
                onClick={fetchData}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-600 border-zinc-300 hover:bg-zinc-100 rounded-lg shrink-0 cursor-pointer"
                title="Refresh templates"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Templates Table */}
          <div className="overflow-x-auto min-h-[240px]">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold bg-zinc-50/80 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">SL</th>
                  <th className="px-4 py-3 font-semibold">Card Title</th>
                  <th className="px-4 py-3 font-semibold">Target Role</th>
                  <th className="px-4 py-3 font-semibold">Theme Style</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70">
                {cards.map((c, i) => (
                  <tr key={c._id || i} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3 text-center text-zinc-400 font-mono">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-zinc-950">{c.title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800">
                        {c.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-zinc-700 font-medium">{c.themeStyle?.replace('-', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          onClick={() => setViewingCard(c)} 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Preview Design"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          onClick={() => handleEditTemplate(c)} 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                          title="Edit Template"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          onClick={() => setDeleteConfirmItem(c)} 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Template"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CREATE / ISSUE STUDENT ID CARD MODAL (WITH PHOTO UPLOAD) ── */}
      {showCreateStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-4xl w-full my-6 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-600" />
                <div>
                  <h2 className="text-base font-bold text-zinc-950">Create & Issue Student ID Card</h2>
                  <p className="text-[11px] text-zinc-500">Upload profile photo, enter student info, and choose card template</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCreateStudentModal(false)} 
                className="text-zinc-400 hover:text-zinc-700 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body: 2 Columns (Form on left, Live Card Preview on right) */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
              {/* Left Column: Form */}
              <form onSubmit={handleCreateStudentSubmit} className="lg:col-span-7 space-y-4">
                {/* ── PROFILE PHOTO UPLOAD BOX ── */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center gap-4">
                  <div className="w-16 h-20 rounded-xl border-2 border-emerald-600 overflow-hidden bg-white shadow-2xs shrink-0 flex items-center justify-center relative">
                    {studentForm.studentPhoto ? (
                      <img src={studentForm.studentPhoto} alt="Uploaded" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <span className="text-xs font-bold text-zinc-900 block">Student Profile Picture</span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Upload a clear passport-style portrait photo (PNG, JPG up to 5MB).</p>

                    <div className="flex items-center gap-2 mt-2">
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="student-photo-upload" 
                        className="hidden" 
                        onChange={handlePhotoUpload} 
                      />
                      <label 
                        htmlFor="student-photo-upload"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg cursor-pointer shadow-2xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {studentForm.studentPhoto ? 'Change Photo' : 'Upload Photo'}
                      </label>

                      {studentForm.studentPhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 text-[11px] font-semibold border border-rose-200 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">
                      First Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input 
                      value={studentForm.firstName} 
                      onChange={e => setStudentForm({ ...studentForm, firstName: e.target.value })} 
                      placeholder="e.g. Syed Qamar" 
                      className="bg-white border-zinc-300 text-xs" 
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Last Name</Label>
                    <Input 
                      value={studentForm.lastName} 
                      onChange={e => setStudentForm({ ...studentForm, lastName: e.target.value })} 
                      placeholder="e.g. Abbas" 
                      className="bg-white border-zinc-300 text-xs" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Class</Label>
                    <select
                      value={studentForm.className}
                      onChange={e => setStudentForm({ ...studentForm, className: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-950"
                    >
                      {STANDARD_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Section</Label>
                    <select
                      value={studentForm.section}
                      onChange={e => setStudentForm({ ...studentForm, section: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-950"
                    >
                      {STANDARD_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Roll Number</Label>
                    <Input 
                      value={studentForm.rollNo} 
                      onChange={e => setStudentForm({ ...studentForm, rollNo: e.target.value })} 
                      placeholder="e.g. 101" 
                      className="bg-white border-zinc-300 text-xs font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Admission No</Label>
                    <Input 
                      value={studentForm.admissionNo} 
                      onChange={e => setStudentForm({ ...studentForm, admissionNo: e.target.value })} 
                      placeholder="e.g. ADM-1791540935480" 
                      className="bg-white border-zinc-300 text-xs font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Father / Guardian Name</Label>
                    <Input 
                      value={studentForm.fatherName} 
                      onChange={e => setStudentForm({ ...studentForm, fatherName: e.target.value })} 
                      placeholder="e.g. Syed Ali Shah" 
                      className="bg-white border-zinc-300 text-xs" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Emergency Phone</Label>
                    <Input 
                      value={studentForm.phone} 
                      onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })} 
                      placeholder="e.g. +92 300 9876543" 
                      className="bg-white border-zinc-300 text-xs font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Date of Birth</Label>
                    <Input 
                      type="date"
                      value={studentForm.dob} 
                      onChange={e => setStudentForm({ ...studentForm, dob: e.target.value })} 
                      className="bg-white border-zinc-300 text-xs" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Gender</Label>
                    <select
                      value={studentForm.gender}
                      onChange={e => setStudentForm({ ...studentForm, gender: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-950"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Choose Design Template */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-200">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                    Choose Card Design Style
                  </Label>
                  <select 
                    value={studentForm.cardTemplate} 
                    onChange={e => setStudentForm({ ...studentForm, cardTemplate: e.target.value })} 
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-950"
                  >
                    {THEME_STYLES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateStudentModal(false)}
                    className="h-9 text-xs border-zinc-300 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={creatingStudentCard}
                    className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 rounded-lg cursor-pointer"
                  >
                    {creatingStudentCard ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Card...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Save & Issue ID Card
                      </span>
                    )}
                  </Button>
                </div>
              </form>

              {/* Right Column: Live Card Preview */}
              <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col items-center justify-center">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">
                  Live Card Preview
                </span>
                {renderCardGraphic(studentForm)}
                <p className="text-[10px] text-zinc-400 mt-3 text-center">
                  Updates in real time as you fill out details & upload photo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CARD PREVIEW MODAL ── */}
      {viewingCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                ID Card Preview
              </h3>
              <button onClick={() => setViewingCard(null)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2">
              {renderCardGraphic(viewingCard)}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewingCard(null)}
                className="text-xs"
              >
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDownloadStudentPDF(viewingCard)}
                  className="text-xs border-zinc-300 text-zinc-800 hover:bg-zinc-100"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" /> PDF
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handlePrintStudentCard(viewingCard)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TEMPLATE DESIGN MODAL (Manage Templates) ── */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-2xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                <h2 className="text-base font-bold text-zinc-950">
                  {editingId ? 'Edit ID Card Template Design' : 'Create New ID Card Template Design'}
                </h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFormModal(false)} 
                className="text-zinc-400 hover:text-zinc-700 h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Template Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                    placeholder="e.g. Official Student Smart ID Card 2026" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Target Role <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({ ...formData, role: e.target.value })} 
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 font-semibold" 
                    required
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher / Faculty</option>
                    <option value="Staff">Staff / Employee</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Theme Color
                  </Label>
                  <select 
                    value={formData.themeStyle} 
                    onChange={e => setFormData({ ...formData, themeStyle: e.target.value })} 
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900" 
                  >
                    {THEME_STYLES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Card Header Text
                  </Label>
                  <Input 
                    value={formData.headerText} 
                    onChange={e => setFormData({ ...formData, headerText: e.target.value })} 
                    placeholder="e.g. OFFICIAL IDENTITY CARD" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs uppercase" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Card Footer Text
                  </Label>
                  <Input 
                    value={formData.footerText} 
                    onChange={e => setFormData({ ...formData, footerText: e.target.value })} 
                    placeholder="e.g. Principal Signature & Seal" 
                    className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                  />
                </div>
              </div>

              <div className="p-4 border-t border-zinc-200 flex justify-end gap-2.5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowFormModal(false)}
                  className="h-8 text-xs border-zinc-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="h-8 text-xs bg-zinc-950 hover:bg-zinc-800 text-white font-semibold"
                >
                  {submitting ? 'Saving Design...' : 'Save Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirmItem && (
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
              Are you sure you want to permanently delete the template <strong className="text-zinc-900">&ldquo;{deleteConfirmItem.title}&rdquo;</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteConfirmItem(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleDeleteTemplate}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Delete Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEDICATED PRINT PORTAL (ISOLATED - ONLY CARD PRINTS) ── */}
      <div id="id-card-print-portal" className="hidden">
        {printPortalRecord && renderCardGraphic(printPortalRecord)}
      </div>

      {/* PRINT-ONLY STYLESHEET */}
      <style jsx global>{`
        @media print {
          html, body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          body * {
            visibility: hidden !important;
          }

          #id-card-print-portal,
          #id-card-print-portal * {
            visibility: visible !important;
          }

          #id-card-print-portal {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 10mm !important;
            background: white !important;
            z-index: 2147483647 !important;
          }

          nav, aside, header, footer, .sidebar, .navbar, .print\\:hidden, #stoofi-ai-widget {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
