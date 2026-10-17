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
  QrCode,
  Palette,
  Layout,
  Award,
  FileText,
  Check,
  CheckSquare,
  Square,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { downloadIdCardPDF } from '@/lib/idCardPdf';
import { getPublicVerificationUrl, formatStudentRollNo } from '@/lib/utils';
import QRCode from 'qrcode';

// Dynamic Real Scannable Verification QR Code Component for Every ID Card
function StudentCardQR({ rec, size = 52 }) {
  const [dataUrl, setDataUrl] = useState('');

  const qrUrl = useMemo(() => {
    if (!rec) return 'https://pakroyalcollege.edu.pk/verify';
    const identifier = rec.admissionNo || rec.rollNo || rec._id || rec.staffNo || 'PRC260001';
    return getPublicVerificationUrl(identifier);
  }, [rec]);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(qrUrl, {
      margin: 1,
      width: Math.max(size * 4, 240),
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }).then(url => {
      if (isMounted) setDataUrl(url);
    }).catch(err => {
      console.warn('QR Code generation error:', err);
    });
    return () => { isMounted = false; };
  }, [qrUrl, size]);

  if (!dataUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="bg-white rounded border border-zinc-200 flex items-center justify-center animate-pulse"
      >
        <QrCode className="w-4 h-4 text-zinc-300" />
      </div>
    );
  }

  return (
    <img 
      src={dataUrl} 
      alt="Verification QR Code" 
      style={{ width: size, height: size }} 
      className="rounded bg-white p-0.5 border border-zinc-200 shadow-2xs shrink-0" 
      title="Scan to verify student details"
    />
  );
}

const THEME_STYLES = [
  { id: 'classic-navy', label: '1. Executive Navy Horizontal Pass (Pak Royal College)', headerBg: 'from-[#06335d] via-[#084A86] to-[#0a58a0]', border: 'border-[#084A86]', accent: 'bg-sky-50 text-sky-900 border-sky-300' },
  { id: 'stoofi-emerald', label: '2. Emerald & Deep Navy Lanyard Badge (Vertical)', headerBg: 'from-emerald-700 via-teal-800 to-sky-950', border: 'border-emerald-600', accent: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { id: 'royal-purple', label: '3. Royal Purple Academic Badge', headerBg: 'from-purple-900 via-indigo-900 to-purple-950', border: 'border-purple-600', accent: 'bg-purple-50 text-purple-900 border-purple-300' },
  { id: 'dark-slate', label: '4. Dark Luxury Obsidian Smart Card', headerBg: 'from-zinc-950 via-zinc-900 to-black', border: 'border-zinc-700', accent: 'bg-zinc-900 text-emerald-400 border-zinc-700' },
  { id: 'crimson-gold', label: '5. Heritage Crimson & Gold Crest', headerBg: 'from-rose-950 via-rose-900 to-amber-950', border: 'border-amber-600', accent: 'bg-amber-50 text-amber-900 border-amber-300' }
];

const STANDARD_CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const STANDARD_SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D'];

const FALLBACK_TEMPLATES = [
  {
    _id: 'default-student-tpl',
    title: 'Executive Navy Horizontal Smart Pass',
    role: 'Student',
    cardLayout: 'horizontal',
    themeStyle: 'classic-navy',
    headerText: 'PAK ROYAL COLLEGE',
    subHeaderText: 'Sharaqpur Sharif Campus',
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
    showSignature: true,
    status: 'Active',
    isDefault: true
  },
  {
    _id: 'default-staff-tpl',
    title: 'Staff & Employee Identity Card',
    role: 'Staff',
    cardLayout: 'vertical',
    themeStyle: 'dark-slate',
    headerText: 'PAK ROYAL COLLEGE',
    subHeaderText: 'Sharaqpur Sharif Campus',
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
    showSignature: true,
    status: 'Active',
    isDefault: true
  },
  {
    _id: 'default-teacher-tpl',
    title: 'Faculty & Teacher Smart ID Card',
    role: 'Teacher',
    cardLayout: 'horizontal',
    themeStyle: 'classic-navy',
    headerText: 'PAK ROYAL COLLEGE',
    subHeaderText: 'Faculty of Academics - Sharaqpur',
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
    showSignature: true,
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
    academicYear: '2026-2027',
    className: 'Class 10',
    section: 'Section A',
    rollNo: '',
    admissionNo: '',
    fatherName: '',
    phone: '',
    gender: 'Male',
    dob: '2008-05-14',
    studentPhoto: '',
    cardTemplate: 'classic-navy'
  });

  // Edit Student ID Card Modal
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [updatingStudentCard, setUpdatingStudentCard] = useState(false);
  const [editStudentForm, setEditStudentForm] = useState({
    firstName: '',
    lastName: '',
    academicYear: '2026-2027',
    className: 'Class 10',
    section: 'Section A',
    rollNo: '',
    admissionNo: '',
    fatherName: '',
    phone: '',
    gender: 'Male',
    dob: '2008-05-14',
    studentPhoto: '',
    cardTemplate: 'classic-navy'
  });

  // Delete Student ID Card State
  const [deleteStudentConfirm, setDeleteStudentConfirm] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(false);

  // Preview Card Modal (for both student cards & templates)
  const [viewingCard, setViewingCard] = useState(null);
  const [printPortalRecord, setPrintPortalRecord] = useState(null);

  const [templateModalTab, setTemplateModalTab] = useState('design'); // 'design' | 'fields'

  // Template Form State
  const [formData, setFormData] = useState({
    title: '',
    role: 'Student',
    cardLayout: 'horizontal',
    themeStyle: 'classic-navy',
    headerText: 'PAK ROYAL COLLEGE',
    subHeaderText: 'Sharaqpur Sharif Campus',
    footerText: 'Principal Signature & Seal',
    showPhoto: true,
    showAdmissionNo: true,
    showRollNo: true,
    showClass: true,
    showSection: true,
    showFatherName: true,
    showPhone: true,
    showDob: true,
    showQrBarcode: true,
    showSignature: true,
    showDesignation: false,
    showDepartment: false,
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
    const currentYear = new Date().getFullYear();
    const nextAdm = `ADM-${currentYear}-${String(100 + studentsList.length + 1).padStart(3, '0')}`;
    setStudentForm({
      firstName: '',
      lastName: '',
      academicYear: `${currentYear}-${currentYear + 1}`,
      className: 'Class 10',
      section: 'Section A',
      rollNo: String(nextRoll),
      admissionNo: nextAdm,
      fatherName: '',
      phone: '',
      gender: 'Male',
      dob: '2008-05-14',
      studentPhoto: '',
      cardTemplate: 'classic-navy'
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
      const currentYear = new Date().getFullYear();
      const payload = {
        ...studentForm,
        cardTemplate: studentForm.cardTemplate || 'classic-navy',
        cardLayout: studentForm.cardTemplate === 'classic-navy' ? 'horizontal' : 'vertical',
        themeStyle: studentForm.cardTemplate || 'classic-navy',
        firstName: studentForm.firstName.trim(),
        lastName: (studentForm.lastName || '').trim(),
        academicYear: studentForm.academicYear || `${currentYear}-${currentYear + 1}`,
        className: studentForm.className || 'Class 10',
        section: studentForm.section || 'Section A',
        gender: studentForm.gender || 'Male',
        dob: studentForm.dob || '2008-05-14',
        admissionNo: studentForm.admissionNo || `ADM-${currentYear}-${Date.now()}`
      };
      const res = await api.post('/student', payload);
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
      schoolName: 'PAK ROYAL COLLEGE SHARAQPUR',
      address: 'Sharaqpur Sharif Campus, Sheikhupura, Punjab',
      phone: '+92 300 1234567'
    }, student.cardTemplate || student.themeStyle || 'classic-navy');
    showToast(`PDF downloaded for ${student.firstName} ${student.lastName}`);
  };

  // Open Edit Student ID Card Modal
  const handleOpenEditStudent = (student) => {
    setEditingStudent(student);
    setEditStudentForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      academicYear: student.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      className: student.className || 'Class 10',
      section: student.section || 'Section A',
      rollNo: String(student.rollNo || ''),
      admissionNo: String(student.admissionNo || ''),
      fatherName: student.fatherName || '',
      phone: student.phone || '',
      gender: student.gender || 'Male',
      dob: student.dob || '2008-05-14',
      studentPhoto: student.studentPhoto || student.photo || '',
      cardTemplate: student.cardTemplate || student.themeStyle || 'classic-navy'
    });
    setShowEditStudentModal(true);
  };

  // Handle Photo Upload in Edit Modal
  const handleEditPhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Photo size must be less than 5MB', true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditStudentForm(prev => ({ ...prev, studentPhoto: reader.result }));
        showToast('Profile photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveEditPhoto = () => {
    setEditStudentForm(prev => ({ ...prev, studentPhoto: '' }));
  };

  // Submit Updated Student ID Card
  const handleEditStudentSubmit = async (e) => {
    e.preventDefault();
    if (!editStudentForm.firstName.trim()) {
      showToast('Student First Name is required.', true);
      return;
    }

    try {
      setUpdatingStudentCard(true);
      const currentYear = new Date().getFullYear();
      const payload = {
        ...editStudentForm,
        cardTemplate: editStudentForm.cardTemplate || 'classic-navy',
        cardLayout: editStudentForm.cardTemplate === 'classic-navy' ? 'horizontal' : 'vertical',
        themeStyle: editStudentForm.cardTemplate || 'classic-navy',
        firstName: editStudentForm.firstName.trim(),
        lastName: (editStudentForm.lastName || '').trim(),
        academicYear: editStudentForm.academicYear || `${currentYear}-${currentYear + 1}`,
        className: editStudentForm.className || 'Class 10',
        section: editStudentForm.section || 'Section A',
        gender: editStudentForm.gender || 'Male',
        dob: editStudentForm.dob || '2008-05-14',
        admissionNo: editStudentForm.admissionNo || `ADM-${currentYear}-${Date.now()}`
      };
      const res = await api.put(`/student/${editingStudent._id}`, payload);
      if (res?.success) {
        showToast(`ID Card for ${editStudentForm.firstName} ${editStudentForm.lastName} updated successfully!`);
        setShowEditStudentModal(false);
        setEditingStudent(null);
        fetchStudents();
        fetchData();
      } else {
        showToast(res?.message || 'Failed to update ID Card.', true);
      }
    } catch (err) {
      console.error('Error updating student ID card:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to update student card.', true);
    } finally {
      setUpdatingStudentCard(false);
    }
  };

  // Confirm Delete Student ID Card
  const handleDeleteStudentSubmit = async () => {
    if (!deleteStudentConfirm) return;
    try {
      setDeletingStudent(true);
      const res = await api.delete(`/student/${deleteStudentConfirm._id}`);
      if (res?.success) {
        showToast('Student ID Card deleted successfully!');
        setDeleteStudentConfirm(null);
        fetchStudents();
        fetchData();
      } else {
        showToast(res?.message || 'Failed to delete ID card.', true);
      }
    } catch (err) {
      console.error('Failed to delete student ID card:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to delete student ID card.', true);
    } finally {
      setDeletingStudent(false);
    }
  };

  // Open Template Modal
  const handleOpenCreateTemplate = () => {
    setEditingId(null);
    setTemplateModalTab('design');
    setFormData({
      title: '',
      role: 'Student',
      cardLayout: 'horizontal',
      themeStyle: 'classic-navy',
      headerText: 'PAK ROYAL COLLEGE',
      subHeaderText: 'Sharaqpur Sharif Campus',
      footerText: 'Principal Signature & Seal',
      showPhoto: true,
      showAdmissionNo: true,
      showRollNo: true,
      showClass: true,
      showSection: true,
      showFatherName: true,
      showPhone: true,
      showDob: true,
      showQrBarcode: true,
      showSignature: true,
      showDesignation: false,
      showDepartment: false,
      uploadedBackground: '',
      status: 'Active'
    });
    setShowFormModal(true);
  };

  const handleEditTemplate = (card) => {
    setEditingId(card._id);
    setTemplateModalTab('design');
    setFormData({
      title: card.title || '',
      role: card.role || 'Student',
      cardLayout: card.cardLayout || 'horizontal',
      themeStyle: card.themeStyle || 'classic-navy',
      headerText: card.headerText || 'PAK ROYAL COLLEGE',
      subHeaderText: card.subHeaderText || 'Sharaqpur Sharif Campus',
      footerText: card.footerText || 'Principal Signature & Seal',
      showPhoto: card.showPhoto !== undefined ? card.showPhoto : true,
      showAdmissionNo: card.showAdmissionNo !== undefined ? card.showAdmissionNo : true,
      showRollNo: card.showRollNo !== undefined ? card.showRollNo : true,
      showClass: card.showClass !== undefined ? card.showClass : true,
      showSection: card.showSection !== undefined ? card.showSection : true,
      showFatherName: card.showFatherName !== undefined ? card.showFatherName : true,
      showPhone: card.showPhone !== undefined ? card.showPhone : true,
      showDob: card.showDob !== undefined ? card.showDob : true,
      showQrBarcode: card.showQrBarcode !== undefined ? card.showQrBarcode : true,
      showSignature: card.showSignature !== undefined ? card.showSignature : true,
      showDesignation: card.showDesignation !== undefined ? card.showDesignation : true,
      showDepartment: card.showDepartment !== undefined ? card.showDepartment : true,
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
        subHeaderText: (formData.subHeaderText || 'Sharaqpur Sharif Campus').trim(),
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

  // ── ULTRA-PROFESSIONAL REAL STUDENT ID CARD RENDERER (Pak Royal College Sharaqpur) ──
  const renderCardGraphic = (rec, tplOverride = null) => {
    const activeTpl = tplOverride || cards.find(c => c._id === rec.cardTemplate || c.themeStyle === rec.cardTemplate) || {};
    
    // Default to classic-navy horizontal if unspecified
    const themeKey = tplOverride?.themeStyle || rec.cardTemplate || rec.themeStyle || activeTpl.themeStyle || 'classic-navy';
    const theme = THEME_STYLES.find(t => t.id === themeKey) || THEME_STYLES[0];
    
    // Check horizontal layout
    const isHorizontal = (tplOverride?.cardLayout || rec.cardLayout || activeTpl.cardLayout) === 'horizontal' || 
                         themeKey === 'classic-navy' || 
                         rec.cardTemplate === 'classic-navy' ||
                         !rec.cardTemplate;

    // Field visibility flags (strictly honors template overrides or saved template flags)
    const showPhoto = tplOverride ? tplOverride.showPhoto : (rec.showPhoto !== undefined ? rec.showPhoto : (activeTpl.showPhoto !== undefined ? activeTpl.showPhoto : true));
    const showAdmissionNo = tplOverride ? tplOverride.showAdmissionNo : (rec.showAdmissionNo !== undefined ? rec.showAdmissionNo : (activeTpl.showAdmissionNo !== undefined ? activeTpl.showAdmissionNo : true));
    const showRollNo = tplOverride ? tplOverride.showRollNo : (rec.showRollNo !== undefined ? rec.showRollNo : (activeTpl.showRollNo !== undefined ? activeTpl.showRollNo : true));
    const showClass = tplOverride ? tplOverride.showClass : (rec.showClass !== undefined ? rec.showClass : (activeTpl.showClass !== undefined ? activeTpl.showClass : true));
    const showSection = tplOverride ? tplOverride.showSection : (rec.showSection !== undefined ? rec.showSection : (activeTpl.showSection !== undefined ? activeTpl.showSection : true));
    const showDob = tplOverride ? tplOverride.showDob : (rec.showDob !== undefined ? rec.showDob : (activeTpl.showDob !== undefined ? activeTpl.showDob : true));
    const showFatherName = tplOverride ? tplOverride.showFatherName : (rec.showFatherName !== undefined ? rec.showFatherName : (activeTpl.showFatherName !== undefined ? activeTpl.showFatherName : true));
    const showPhone = tplOverride ? tplOverride.showPhone : (rec.showPhone !== undefined ? rec.showPhone : (activeTpl.showPhone !== undefined ? activeTpl.showPhone : true));
    const showQrBarcode = tplOverride ? tplOverride.showQrBarcode : (rec.showQrBarcode !== undefined ? rec.showQrBarcode : (activeTpl.showQrBarcode !== undefined ? activeTpl.showQrBarcode : true));
    const showSignature = tplOverride ? tplOverride.showSignature : (rec.showSignature !== undefined ? rec.showSignature : (activeTpl.showSignature !== undefined ? activeTpl.showSignature : true));

    const headerText = 'PAK ROYAL COLLEGE';
    const subHeaderText = 'Sharaqpur Sharif, Distt. Sheikhupura';
    const footerText = 'M. Umer W';
    const roleBadge = (tplOverride?.role || rec.role || 'Student').toUpperCase();

    const initial = (rec.firstName || 'S').charAt(0).toUpperCase();
    const fullName = `${rec.firstName || 'Student'} ${rec.lastName || 'Name'}`.trim();
    const admNo = rec.admissionNo || 'ADM-2026-001';
    const rollNo = formatStudentRollNo(rec.rollNo || rec.admissionNo);
    const className = rec.className || 'Class 10';
    const section = rec.section || 'Section A';
    const phone = rec.phone || '+92 300 1234567';
    const fatherName = rec.fatherName || '';
    const dob = rec.dob || '14/05/2008';

    // Horizontal Card Format (Executive Navy Horizontal Pass)
    if (isHorizontal) {
      return (
        <div className="w-[365px] h-[225px] mx-auto bg-white rounded-none overflow-hidden border-2 border-[#084A86] shadow-xl flex flex-col justify-between text-zinc-900 font-sans select-none relative">
          {/* Top Brand Bar */}
          <div className="bg-gradient-to-r from-[#06335d] via-[#084A86] to-[#0a58a0] px-3 py-1.5 flex items-center justify-between text-white border-b-2 border-amber-400">
            <div className="flex items-center gap-2.5">
              {/* Badge with White Circular Ring */}
              <div className="rounded-full ring-2 ring-white/95 p-0.5 bg-white/20 shrink-0">
                <img 
                  src="/pak-royal-badge.png" 
                  alt="Pak Royal College Crest" 
                  className="w-8 h-8 rounded-full bg-white object-contain shadow-xs border border-white" 
                />
              </div>
              <div className="leading-tight">
                <span className="font-black text-[12px] tracking-wide uppercase text-white block">
                  {headerText}
                </span>
                <span className="text-[7.5px] text-amber-300 font-bold tracking-wider block">
                  {subHeaderText}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[7px] text-slate-200 font-semibold uppercase tracking-wider block">SESSION</span>
              <span className="text-[8.5px] font-black text-amber-300 font-mono block">2026–2027</span>
            </div>
          </div>

          {/* Body Dual-Column + QR Code */}
          <div className="p-2.5 flex items-stretch gap-2.5 flex-1 bg-gradient-to-b from-white to-slate-50/70">
            {/* Left: Portrait Photo Box */}
            {showPhoto && (
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="w-[78px] h-[98px] rounded-none border-[2px] border-[#084A86] overflow-hidden bg-slate-100 shadow-xs flex items-center justify-center relative">
                  {rec.studentPhoto ? (
                    <img src={rec.studentPhoto} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-400 p-1">
                      <User className="w-8 h-8 text-[#084A86]/60" />
                      <span className="text-[8px] font-black mt-1 uppercase text-[#084A86]">{initial}</span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs border border-white">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                </div>
              </div>
            )}

            {/* Middle: Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[8px] uppercase tracking-wider shadow-2xs mb-1">
                  <Award className="w-2.5 h-2.5" />
                  <span>STUDENT IDENTITY CARD</span>
                </div>
                <h4 className="font-black text-[12px] text-zinc-950 uppercase tracking-tight truncate leading-tight">
                  {fullName}
                </h4>
              </div>

              <div className="space-y-0.5 text-[9.5px] text-zinc-700 pt-1 border-t border-zinc-200/70">
                <div className="flex items-center">
                  <span className="w-20 text-zinc-400 font-semibold text-[8.5px]">Name:</span>
                  <span className="text-zinc-950 font-black truncate">{fullName}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-20 text-zinc-400 font-semibold text-[8.5px]">Father's Name:</span>
                  <span className="text-zinc-800 font-bold truncate max-w-[110px]">{fatherName || '—'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-20 text-zinc-400 font-semibold text-[8.5px]">Class:</span>
                  <strong className="text-[#084A86] font-extrabold">{className} {showSection ? `(${section})` : ''}</strong>
                </div>
                <div className="flex items-center">
                  <span className="w-20 text-zinc-400 font-semibold text-[8.5px]">Roll No:</span>
                  <strong className="font-mono text-zinc-950 font-bold">{rollNo}</strong>
                </div>
              </div>
            </div>

            {/* Right: Real Working Scannable QR Code */}
            {showQrBarcode && (
              <div className="flex flex-col items-center justify-center shrink-0 pl-1 border-l border-zinc-200/80">
                <StudentCardQR rec={rec} size={54} />
                <span className="text-[6.5px] font-black text-[#084A86] uppercase tracking-wider mt-1">
                  Scan to Verify
                </span>
                <span className="font-mono text-[6.5px] text-zinc-400 font-bold">{rollNo}</span>
              </div>
            )}
          </div>

          {/* Bottom Footer Bar */}
          <div className="bg-[#084A86] px-2.5 py-1 text-white flex justify-between items-center text-[7.5px] border-t-2 border-amber-400">
            <span className="font-mono text-[7px] text-slate-200">pakroyalcollege.edu.pk</span>

            {/* Middle Instruction Box */}
            <div className="text-center px-1.5 py-0.5 rounded bg-white/10 border border-white/20 max-w-[175px] leading-tight">
              <span className="text-[6.5px] text-white font-medium block">
                Property of Pak Royal College. If found, please return.
              </span>
              <span className="text-[6.5px] text-amber-300 font-bold font-mono block">
                Contact: 03 111 444 810
              </span>
            </div>

            {/* Right: Signature */}
            <div className="text-right shrink-0">
              <div 
                className="font-serif italic text-amber-300 font-bold tracking-wider leading-none" 
                style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Caveat', cursive", fontSize: "11px" }}
              >
                M. Umer W
              </div>
              <span className="font-semibold text-[6.5px] text-slate-200 block">Authorized Signature</span>
            </div>
          </div>
        </div>
      );
    }


    // Vertical Modern Lanyard Badge
    return (
      <div className={`w-[270px] mx-auto bg-white rounded-3xl overflow-hidden border-2 ${theme.border} shadow-xl text-zinc-900 font-sans select-none relative flex flex-col`}>
        {/* Lanyard Hole Cutout Representation */}
        <div className="pt-2 pb-1 bg-white text-center">
          <div className="w-12 h-2.5 rounded-full bg-zinc-200 border border-zinc-300 mx-auto shadow-inner" />
        </div>

        {/* Top Angled Geometric Header with Official Badge */}
        <div className={`bg-gradient-to-r ${theme.headerBg} pt-2.5 pb-3 px-3 text-white text-center relative overflow-hidden`}>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <img 
              src="/pak-royal-badge.png" 
              alt="Pak Royal College Crest" 
              className="w-7 h-7 rounded-full bg-white object-contain shadow-xs border border-white"
            />
            <div className="text-left">
              <span className="text-[10px] tracking-wider font-extrabold uppercase text-amber-300 block leading-tight">
                {headerText}
              </span>
              <p className="text-[7.5px] text-white/80 leading-none">{subHeaderText}</p>
            </div>
          </div>
          <div className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[8.5px] font-black tracking-wider uppercase">
            {roleBadge} PASS
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 flex flex-col items-center flex-1 bg-white">
          {/* Portrait Photo Box */}
          {showPhoto && (
            <div className="relative mt-0.5">
              <div className={`w-22 h-26 rounded-2xl border-[3px] ${theme.border} overflow-hidden bg-zinc-100 shadow-md flex items-center justify-center relative`}>
                {rec.studentPhoto ? (
                  <img src={rec.studentPhoto} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 p-2">
                    <User className="w-9 h-9 text-zinc-300" />
                    <span className="text-[9px] font-bold mt-1 text-zinc-400 uppercase">{initial}</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs border-2 border-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Student Name */}
          <div className="mt-2 text-center w-full px-2">
            <h4 className="text-sm font-black text-zinc-950 uppercase tracking-tight truncate leading-tight">
              {fullName}
            </h4>
          </div>

          {/* Detailed Info Grid */}
          <div className="w-full mt-2.5 space-y-1 text-[10px] bg-zinc-50/90 p-2.5 rounded-xl border border-zinc-200">
            {showAdmissionNo && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-semibold">ID No:</span>
                <strong className="font-mono text-zinc-950 font-bold">{admNo}</strong>
              </div>
            )}
            {showClass && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-semibold">Class & Sec:</span>
                <strong className="text-[#084A86] font-bold">{className} {showSection ? `(${section})` : ''}</strong>
              </div>
            )}
            {showRollNo && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-semibold">Roll Number:</span>
                <strong className="font-mono text-zinc-950 font-bold">{rollNo}</strong>
              </div>
            )}
            {showDob && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-semibold">DOB:</span>
                <span className="text-zinc-800 font-medium">{dob}</span>
              </div>
            )}
            {showFatherName && fatherName && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-semibold">Guardian:</span>
                <span className="text-zinc-900 font-semibold truncate max-w-[130px]">{fatherName}</span>
              </div>
            )}
            {showPhone && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-semibold">Emergency:</span>
                <strong className="font-mono text-zinc-800 font-bold">{phone}</strong>
              </div>
            )}
          </div>

          {/* Real QR Code & Security Section */}
          {(showQrBarcode || showSignature) && (
            <div className="w-full mt-2.5 pt-2 border-t border-zinc-200/80 flex items-center justify-between">
              {showQrBarcode ? (
                <div className="flex items-center gap-1.5">
                  <StudentCardQR rec={rec} size={42} />
                  <div className="flex flex-col">
                    <span className="text-[6.5px] font-black text-[#084A86] uppercase tracking-wider">Scan to Verify</span>
                    <span className="font-mono text-[6.5px] text-zinc-400">{admNo}</span>
                  </div>
                </div>
              ) : <div />}

              {showSignature && (
                <div className="text-right">
                  <div className="text-[8px] font-bold text-zinc-800 border-b border-zinc-400 pb-0.5 font-serif italic">
                    {footerText}
                  </div>
                  <span className="text-[6.5px] text-zinc-400 uppercase tracking-wider block mt-0.5">Authorized Seal</span>
                </div>
              )}
            </div>
          )}
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEditStudent(st)}
                            className="h-7 w-7 p-0 text-zinc-600 hover:text-sky-700 hover:bg-sky-50 cursor-pointer"
                            title="Edit Card Details"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteStudentConfirm(st)}
                            className="h-7 w-7 p-0 text-zinc-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            title="Delete Card"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* ── EDIT STUDENT ID CARD MODAL (WITH LIVE PREVIEW & PHOTO EDIT) ── */}
      {showEditStudentModal && editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-4xl w-full my-6 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sky-600" />
                <div>
                  <h2 className="text-base font-bold text-zinc-950">Edit Student ID Card Details</h2>
                  <p className="text-[11px] text-zinc-500">Update photo, credentials, class, roll number, and card styling</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowEditStudentModal(false);
                  setEditingStudent(null);
                }} 
                className="text-zinc-400 hover:text-zinc-700 h-8 w-8 p-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body: 2 Columns (Form on left, Live Card Preview on right) */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
              {/* Left Column: Form */}
              <form onSubmit={handleEditStudentSubmit} className="lg:col-span-7 space-y-4">
                {/* ── PROFILE PHOTO UPLOAD BOX ── */}
                <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-2xl flex items-center gap-4">
                  <div className="w-16 h-20 rounded-xl border-2 border-sky-600 overflow-hidden bg-white shadow-2xs shrink-0 flex items-center justify-center relative">
                    {editStudentForm.studentPhoto ? (
                      <img src={editStudentForm.studentPhoto} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-sky-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <span className="text-xs font-bold text-zinc-900 block">Student Profile Picture</span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Upload a clear portrait photo (PNG, JPG up to 5MB).</p>

                    <div className="flex items-center gap-2 mt-2">
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="student-edit-photo-upload" 
                        className="hidden" 
                        onChange={handleEditPhotoUpload} 
                      />
                      <label 
                        htmlFor="student-edit-photo-upload"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold rounded-lg cursor-pointer shadow-2xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {editStudentForm.studentPhoto ? 'Change Photo' : 'Upload Photo'}
                      </label>

                      {editStudentForm.studentPhoto && (
                        <button
                          type="button"
                          onClick={handleRemoveEditPhoto}
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
                      value={editStudentForm.firstName} 
                      onChange={e => setEditStudentForm({ ...editStudentForm, firstName: e.target.value })} 
                      placeholder="e.g. Syed Qamar" 
                      className="bg-white border-zinc-300 text-xs" 
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Last Name</Label>
                    <Input 
                      value={editStudentForm.lastName} 
                      onChange={e => setEditStudentForm({ ...editStudentForm, lastName: e.target.value })} 
                      placeholder="e.g. Abbas" 
                      className="bg-white border-zinc-300 text-xs" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Class</Label>
                    <select
                      value={editStudentForm.className}
                      onChange={e => setEditStudentForm({ ...editStudentForm, className: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-950"
                    >
                      {STANDARD_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Section</Label>
                    <select
                      value={editStudentForm.section}
                      onChange={e => setEditStudentForm({ ...editStudentForm, section: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-950"
                    >
                      {STANDARD_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Roll Number</Label>
                    <Input 
                      value={editStudentForm.rollNo} 
                      onChange={e => setEditStudentForm({ ...editStudentForm, rollNo: e.target.value })} 
                      placeholder="e.g. 101" 
                      className="bg-white border-zinc-300 text-xs font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Admission No</Label>
                    <Input 
                      value={editStudentForm.admissionNo} 
                      onChange={e => setEditStudentForm({ ...editStudentForm, admissionNo: e.target.value })} 
                      placeholder="e.g. ADM-101" 
                      className="bg-white border-zinc-300 text-xs font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Father / Guardian Name</Label>
                    <Input 
                      value={editStudentForm.fatherName} 
                      onChange={e => setEditStudentForm({ ...editStudentForm, fatherName: e.target.value })} 
                      placeholder="e.g. Syed Ali Shah" 
                      className="bg-white border-zinc-300 text-xs" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Emergency Phone</Label>
                    <Input 
                      value={editStudentForm.phone} 
                      onChange={e => setEditStudentForm({ ...editStudentForm, phone: e.target.value })} 
                      placeholder="e.g. +92 300 9876543" 
                      className="bg-white border-zinc-300 text-xs font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Date of Birth</Label>
                    <Input 
                      type="date"
                      value={editStudentForm.dob} 
                      onChange={e => setEditStudentForm({ ...editStudentForm, dob: e.target.value })} 
                      className="bg-white border-zinc-300 text-xs" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Gender</Label>
                    <select
                      value={editStudentForm.gender}
                      onChange={e => setEditStudentForm({ ...editStudentForm, gender: e.target.value })}
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
                    value={editStudentForm.cardTemplate} 
                    onChange={e => setEditStudentForm({ ...editStudentForm, cardTemplate: e.target.value })} 
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
                    onClick={() => {
                      setShowEditStudentModal(false);
                      setEditingStudent(null);
                    }}
                    className="h-9 text-xs border-zinc-300 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updatingStudentCard}
                    className="h-9 text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 rounded-lg cursor-pointer"
                  >
                    {updatingStudentCard ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Save Changes
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
                {renderCardGraphic(editStudentForm)}
                <p className="text-[10px] text-zinc-400 mt-3 text-center">
                  Updates in real time as you edit details & photo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE STUDENT ID CARD MODAL ── */}
      {deleteStudentConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-950">Delete ID Card</h3>
                <p className="text-xs text-zinc-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete the student ID card for{' '}
              <strong className="text-zinc-900 font-bold">
                {deleteStudentConfirm.firstName} {deleteStudentConfirm.lastName}
              </strong>{' '}
              ({deleteStudentConfirm.admissionNo || deleteStudentConfirm.rollNo || 'Student'})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteStudentConfirm(null)}
                disabled={deletingStudent}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleDeleteStudentSubmit}
                disabled={deletingStudent}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                {deletingStudent ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Delete ID Card
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── CARD PREVIEW MODAL ── */}
      {viewingCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#084A86]" />
                ID Card Preview - Pak Royal College
              </h3>
              <button onClick={() => setViewingCard(null)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2 flex items-center justify-center">
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
                  className="bg-[#084A86] hover:bg-[#06335d] text-white text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TEMPLATE DESIGN & FIELD SETTINGS MODAL (Manage Templates) ── */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-5xl w-full my-6 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Top Header */}
            <div className="p-4 sm:px-6 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-zinc-950 flex items-center gap-2">
                    {editingId ? 'Edit ID Card Template & Settings' : 'Create New ID Card Template & Settings'}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Live Customizer
                    </span>
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    Configure card layout, theme colors, branding text, and customize which student fields are visible on the card.
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFormModal(false)} 
                className="text-zinc-400 hover:text-zinc-700 h-8 w-8 p-0 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body: 2-Column Split View (Form on Left, Live Card Preview on Right) */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
              {/* Left Column: Settings Form */}
              <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between space-y-4">
                {/* Setting Navigation Tabs */}
                <div className="flex items-center rounded-xl bg-zinc-100 p-1 border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setTemplateModalTab('design')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      templateModalTab === 'design'
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 text-emerald-600" />
                    1. Layout & Styling
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateModalTab('fields')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      templateModalTab === 'fields'
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                    2. Card Fields Visibility
                  </button>
                </div>

                <form id="template-customizer-form" onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                  {/* ── TAB 1: DESIGN & STYLING ── */}
                  {templateModalTab === 'design' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      {/* Template Title & Target Role */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1.5">
                          <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                            Template Title <span className="text-rose-500">*</span>
                          </Label>
                          <Input 
                            value={formData.title} 
                            onChange={e => setFormData({ ...formData, title: e.target.value })} 
                            placeholder="e.g. Official Student Smart Badge 2026" 
                            className="bg-white border-zinc-300 text-zinc-950 text-xs h-9" 
                            required 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                            Target Role <span className="text-rose-500">*</span>
                          </Label>
                          <select 
                            value={formData.role} 
                            onChange={e => setFormData({ ...formData, role: e.target.value })} 
                            className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-zinc-950 text-xs font-bold cursor-pointer" 
                            required
                          >
                            <option value="Student">Student</option>
                            <option value="Teacher">Teacher / Faculty</option>
                            <option value="Staff">Staff / Employee</option>
                          </select>
                        </div>
                      </div>

                      {/* Card Orientation / Layout Switcher */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                          Card Orientation / Format
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, cardLayout: 'vertical' })}
                            className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
                              formData.cardLayout === 'vertical'
                                ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                                : 'border-zinc-200 bg-white hover:border-zinc-300'
                            }`}
                          >
                            <div className="w-7 h-10 rounded-md border-2 border-zinc-400 bg-zinc-100 flex flex-col justify-between p-0.5 shrink-0">
                              <div className="w-full h-1.5 bg-zinc-400 rounded-2xs" />
                              <div className="w-3 h-3 rounded-full bg-zinc-300 mx-auto" />
                              <div className="w-full h-2 bg-zinc-200 rounded-2xs" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-zinc-950">Vertical Lanyard Badge</div>
                              <div className="text-[10px] text-zinc-500">Standard portrait badge with top lanyard slot</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, cardLayout: 'horizontal' })}
                            className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
                              formData.cardLayout === 'horizontal'
                                ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                                : 'border-zinc-200 bg-white hover:border-zinc-300'
                            }`}
                          >
                            <div className="w-10 h-7 rounded-md border-2 border-zinc-400 bg-zinc-100 flex items-center justify-between p-0.5 shrink-0">
                              <div className="w-3 h-4 rounded-xs bg-zinc-300" />
                              <div className="w-4 h-3 bg-zinc-200 rounded-2xs" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-zinc-950">Horizontal Smart Card</div>
                              <div className="text-[10px] text-zinc-500">Landscape card with dual-column photo & bio</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Theme Style & Color Palette */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                          Theme Color & Style (5 Palettes)
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {THEME_STYLES.map(t => {
                            const isSelected = formData.themeStyle === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, themeStyle: t.id })}
                                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${t.headerBg} shrink-0 shadow-2xs border border-white`} />
                                  <span className="font-bold text-xs text-zinc-900 truncate">{t.label}</span>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Branding Text Customization */}
                      <div className="pt-2 border-t border-zinc-200 space-y-3">
                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
                          Card Header & Signatory Branding
                        </span>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-zinc-700">Card Header Title</Label>
                          <Input 
                            value={formData.headerText} 
                            onChange={e => setFormData({ ...formData, headerText: e.target.value })} 
                            placeholder="e.g. PAK ROYAL COLLEGE" 
                            className="bg-white border-zinc-300 text-zinc-950 text-xs uppercase h-8" 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-zinc-700">Campus / Sub-Header Line</Label>
                          <Input 
                            value={formData.subHeaderText} 
                            onChange={e => setFormData({ ...formData, subHeaderText: e.target.value })} 
                            placeholder="e.g. Sharaqpur Sharif Campus" 
                            className="bg-white border-zinc-300 text-zinc-950 text-xs h-8" 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-zinc-700">Signature / Footer Text</Label>
                          <Input 
                            value={formData.footerText} 
                            onChange={e => setFormData({ ...formData, footerText: e.target.value })} 
                            placeholder="e.g. Principal Signature & Authorized Seal" 
                            className="bg-white border-zinc-300 text-zinc-950 text-xs h-8" 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── TAB 2: VISIBLE CARD FIELDS (CARD MAI KYA SHOW HO, KYA HIDE HO) ── */}
                  {templateModalTab === 'fields' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      {/* Presets Bar */}
                      <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-zinc-700">Quick Field Presets:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              showPhoto: true,
                              showAdmissionNo: true,
                              showRollNo: true,
                              showClass: true,
                              showSection: true,
                              showDob: true,
                              showFatherName: true,
                              showPhone: true,
                              showQrBarcode: true,
                              showSignature: true
                            })}
                            className="px-2.5 py-1 text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300 rounded-md hover:bg-emerald-50 cursor-pointer shadow-2xs"
                          >
                            Show All Fields
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              showPhoto: true,
                              showAdmissionNo: true,
                              showRollNo: false,
                              showClass: true,
                              showSection: true,
                              showDob: false,
                              showFatherName: false,
                              showPhone: true,
                              showQrBarcode: true,
                              showSignature: true
                            })}
                            className="px-2.5 py-1 text-[10px] font-bold bg-white text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-50 cursor-pointer shadow-2xs"
                          >
                            Minimal Badge
                          </button>
                        </div>
                      </div>

                      {/* Field Toggles Grid */}
                      <div className="space-y-2">
                        {[
                          { key: 'showPhoto', label: 'Student Profile Photo', desc: 'Display portrait photo frame on the ID card', icon: Camera },
                          { key: 'showAdmissionNo', label: 'Admission No / ID Number', desc: 'Official student registration or staff ID', icon: FileText },
                          { key: 'showRollNo', label: 'Examination Roll Number', desc: 'Assigned classroom roll number', icon: Award },
                          { key: 'showClass', label: 'Class Grade', desc: 'Current enrolled academic class', icon: GraduationCap },
                          { key: 'showSection', label: 'Section', desc: 'Specific section badge (e.g. Section A)', icon: Layers },
                          { key: 'showDob', label: 'Date of Birth (DOB)', desc: 'Official student date of birth', icon: Calendar },
                          { key: 'showFatherName', label: 'Guardian / Father Name', desc: 'Parent or legal guardian name', icon: Users },
                          { key: 'showPhone', label: 'Emergency Contact Phone', desc: 'Campus emergency telephone number', icon: Phone },
                          { key: 'showQrBarcode', label: 'Barcode / Security Code', desc: 'Scannable barcode lines representation', icon: QrCode },
                          { key: 'showSignature', label: 'Principal Signature & Seal', desc: 'Institutional seal and signature line', icon: ShieldCheck }
                        ].map((fld) => {
                          const isEnabled = formData[fld.key] !== false;
                          const IconComp = fld.icon;
                          return (
                            <div
                              key={fld.key}
                              onClick={() => setFormData({ ...formData, [fld.key]: !isEnabled })}
                              className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                                isEnabled 
                                  ? 'bg-emerald-50/40 border-emerald-300' 
                                  : 'bg-zinc-50/70 border-zinc-200 opacity-60 hover:opacity-90'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  isEnabled ? 'bg-emerald-600 text-white' : 'bg-zinc-200 text-zinc-500'
                                }`}>
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-xs text-zinc-950 flex items-center gap-1.5">
                                    {fld.label}
                                    {isEnabled && (
                                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                        Visible
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-zinc-500">{fld.desc}</p>
                                </div>
                              </div>

                              {/* Toggle switch visual */}
                              <div className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                                isEnabled ? 'bg-emerald-600 justify-end' : 'bg-zinc-300 justify-start'
                              }`}>
                                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                              </div>
                            </div>
                          );
                        })}

                        {/* Extra Staff Fields if Role != Student */}
                        {formData.role !== 'Student' && (
                          <div className="pt-2 border-t border-zinc-200 space-y-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Staff / Faculty Fields:</span>
                            {[
                              { key: 'showDesignation', label: 'Designation / Rank', desc: 'Academic or admin position' },
                              { key: 'showDepartment', label: 'Department', desc: 'Faculty department division' }
                            ].map((fld) => {
                              const isEnabled = formData[fld.key] !== false;
                              return (
                                <div
                                  key={fld.key}
                                  onClick={() => setFormData({ ...formData, [fld.key]: !isEnabled })}
                                  className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                                    isEnabled ? 'bg-emerald-50/40 border-emerald-300' : 'bg-zinc-50/70 border-zinc-200 opacity-60'
                                  }`}
                                >
                                  <div>
                                    <div className="font-bold text-xs text-zinc-950">{fld.label}</div>
                                    <p className="text-[10px] text-zinc-500">{fld.desc}</p>
                                  </div>
                                  <div className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                                    isEnabled ? 'bg-emerald-600 justify-end' : 'bg-zinc-300 justify-start'
                                  }`}>
                                    <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </form>

                {/* Form Footer Buttons */}
                <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">
                    Changes reflect live on the preview card
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowFormModal(false)}
                      className="h-9 text-xs border-zinc-300 text-zinc-700 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      form="template-customizer-form"
                      disabled={submitting}
                      className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 rounded-lg shadow-xs cursor-pointer"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Template...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Save Template Design
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Real-Time Card Preview */}
              <div className="lg:col-span-5 bg-zinc-100/70 p-5 flex flex-col items-center justify-center shrink-0">
                <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-zinc-200/80">
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    Live Card Preview
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live
                  </span>
                </div>

                <div className="py-2 w-full flex items-center justify-center">
                  {renderCardGraphic({
                    firstName: 'Muhammad',
                    lastName: 'Ali',
                    admissionNo: 'ADM-2026-089',
                    rollNo: '24',
                    className: 'Class 10',
                    section: 'Section A',
                    dob: '14/05/2008',
                    fatherName: 'Syed Tariq Shah',
                    phone: '+92 300 9876543',
                    designation: 'Senior Faculty',
                    department: 'Computer Science',
                    role: formData.role || 'Student',
                    studentPhoto: studentForm.studentPhoto || ''
                  }, formData)}
                </div>

                <div className="mt-4 p-3 bg-white border border-zinc-200 rounded-xl w-full text-center">
                  <div className="text-[10px] font-bold text-zinc-800">
                    Layout: {formData.cardLayout === 'horizontal' ? 'Horizontal Smart Card' : 'Vertical Lanyard Badge'}
                  </div>
                  <p className="text-[9.5px] text-zinc-500 mt-0.5">
                    As you toggle fields or change colors on the left, this ID card updates immediately.
                  </p>
                </div>
              </div>
            </div>
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
