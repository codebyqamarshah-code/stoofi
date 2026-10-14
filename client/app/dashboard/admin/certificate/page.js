'use client';

import Link from 'next/link';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Award,
  FileText,
  Download,
  Printer,
  FileCheck,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Layers,
  Sparkles,
  ExternalLink,
  Filter,
  RefreshCw,
  Crown,
  Medal,
  ShieldCheck,
  QrCode,
  BadgeCheck,
  Camera,
  Upload,
  Calendar,
  GraduationCap,
  User,
  Users,
  Check,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import { downloadCertificatePDF } from '@/lib/certificatePdf';

const CERT_TYPE_OPTIONS = [
  'Character Certificate',
  'Transfer Certificate',
  'Bonafide Certificate',
  'Academic Excellence / Merit',
  'Sports & Extracurricular',
  'Appreciation Certificate',
  'Leaving Certificate',
  'Custom Certificate'
];

const THEME_STYLES = [
  { id: 'classic-gold', label: '1. Imperial Classical Gold', border: 'border-amber-600', bg: 'bg-amber-50/50', accent: 'text-amber-800', ribbon: 'bg-amber-600' },
  { id: 'stoofi-emerald', label: '2. Modern Emerald Excellence', border: 'border-emerald-700', bg: 'bg-emerald-50/50', accent: 'text-emerald-800', ribbon: 'bg-emerald-600' },
  { id: 'royal-navy', label: '3. Royal Navy Diploma', border: 'border-sky-900', bg: 'bg-sky-50/40', accent: 'text-sky-950', ribbon: 'bg-sky-900' },
  { id: 'crimson-merit', label: '4. Crimson Sports & Merit', border: 'border-rose-700', bg: 'bg-rose-50/40', accent: 'text-rose-900', ribbon: 'bg-rose-700' },
  { id: 'minimal-tech', label: '5. Minimalist Digital Verified', border: 'border-zinc-800', bg: 'bg-zinc-50/50', accent: 'text-zinc-900', ribbon: 'bg-zinc-800' },
  { id: 'academic-navy', label: 'Academic Navy', border: 'border-sky-900', bg: 'bg-sky-50/40', accent: 'text-sky-950', ribbon: 'bg-sky-900' },
  { id: 'modern-slate', label: 'Modern Slate', border: 'border-zinc-800', bg: 'bg-zinc-50/50', accent: 'text-zinc-900', ribbon: 'bg-zinc-800' }
];

const STANDARD_CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const STANDARD_SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D'];

const PLACEHOLDER_TAGS = [
  { tag: '[student_name]', label: 'Student Name' },
  { tag: '[father_name]', label: 'Father Name' },
  { tag: '[admission_no]', label: 'Admission No' },
  { tag: '[roll_no]', label: 'Roll No' },
  { tag: '[class_name]', label: 'Class' },
  { tag: '[section]', label: 'Section' },
  { tag: '[academic_session]', label: 'Academic Year' },
  { tag: '[dob]', label: 'Date of Birth' },
  { tag: '[gender]', label: 'Gender' },
  { tag: '[school_name]', label: 'School Name' },
  { tag: '[school_address]', label: 'School Address' },
  { tag: '[certificate_date]', label: 'Issue Date' },
  { tag: '[tc_no]', label: 'TC / Cert No' }
];

const CERTIFICATE_FIELDS = [
  { key: 'showSchoolHeader', label: 'School Name & Header Crest', desc: 'Display institutional logo/crest, school name, and campus location', icon: Crown },
  { key: 'showStudentPhoto', label: 'Student Portrait Photo', desc: 'Display student passport photo frame on certificate', icon: Camera },
  { key: 'showAdmissionNo', label: 'Admission Number / ID', desc: 'Official student registration or enrollment code', icon: FileText },
  { key: 'showRollNo', label: 'Examination Roll Number', desc: 'Assigned classroom roll number badge', icon: Award },
  { key: 'showClass', label: 'Class Grade', desc: 'Current enrolled academic grade (e.g. Class 10)', icon: GraduationCap },
  { key: 'showSection', label: 'Section Badge', desc: 'Designated classroom section (e.g. Section A)', icon: Layers },
  { key: 'showFatherName', label: 'Father / Guardian Name', desc: 'Parent or legal guardian name citation', icon: Users },
  { key: 'showDob', label: 'Date of Birth (DOB)', desc: 'Official birth date from institutional admission register', icon: Calendar },
  { key: 'showIssueDate', label: 'Date of Issue', desc: 'Award and presentation date for this certificate', icon: Calendar },
  { key: 'showSeal', label: 'Official Institutional Seal', desc: 'Embossed institutional seal medallion with gold/emerald ribbons', icon: ShieldCheck },
  { key: 'showQrBarcode', label: 'Verification QR / Barcode', desc: 'Scannable digital verification code representation', icon: QrCode },
  { key: 'showSignatureLeft', label: 'Left Signatory (Date / Prepared By)', desc: 'Left authorization line for date or administrative clerk', icon: FileCheck },
  { key: 'showSignatureCenter', label: 'Center Signatory (Class Teacher)', desc: 'Middle authorization line for in-charge or academic coordinator', icon: User },
  { key: 'showSignatureRight', label: 'Right Signatory (Principal Signature & Seal)', desc: 'Main clearance line for Principal or Head of Institution', icon: Award }
];

const DEFAULT_SAMPLE_STUDENT = {
  firstName: 'Muhammad',
  lastName: 'Rayyan',
  studentName: 'Muhammad Rayyan',
  fatherName: 'Tariq Mehmood',
  admissionNo: 'ADM-2026-101',
  rollNo: '101',
  className: 'Class 10',
  section: 'Section A',
  academicSession: '2026 [Jan-Dec]',
  dob: '2008-05-14',
  gender: 'Male',
  studentPhoto: '',
  certificateDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  certificateNumber: 'TC-2026-084'
};

export default function CertificatePage() {
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalTypes: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Search, Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [templateModalTab, setTemplateModalTab] = useState('design'); // 'design' | 'fields'
  const [viewingCert, setViewingCert] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Issue Certificate for Student Modal state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [schoolSetting, setSchoolSetting] = useState(null);
  const [printPortalRecord, setPrintPortalRecord] = useState(null);

  // Form data for Template Customizer
  const [formData, setFormData] = useState({
    title: '',
    type: 'Character Certificate',
    description: '',
    headerTitle: '',
    headerSubtitle: 'TO WHOM IT MAY CONCERN',
    templateBody: 'This is to certify that [student_name], Son/Daughter of [father_name], bearing Admission No [admission_no] and Roll No [roll_no], is/was a bona fide student of Class [class_name] (Section [section]) in this institution for the Academic Session [academic_session]. During their stay, their conduct and academic character were exemplary. We wish them success in all future endeavors.',
    footerLeft: 'Date of Issue',
    footerCenter: 'Class Teacher / Checked By',
    footerRight: 'Principal / Authorized Seal',
    themeStyle: 'classic-gold',
    uploadedBackground: '',
    status: 'Active',
    showSchoolHeader: true,
    showStudentPhoto: true,
    showAdmissionNo: true,
    showRollNo: true,
    showClass: true,
    showSection: true,
    showFatherName: true,
    showDob: true,
    showGender: true,
    showIssueDate: true,
    showQrBarcode: true,
    showSeal: true,
    showSignatureLeft: true,
    showSignatureCenter: true,
    showSignatureRight: true
  });

  // Issue Form for Student Certificate Modal
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    studentName: 'Muhammad Rayyan',
    fatherName: 'Tariq Mehmood',
    admissionNo: 'ADM-2026-101',
    rollNo: '101',
    className: 'Class 10',
    section: 'Section A',
    dob: '2008-05-14',
    gender: 'Male',
    studentPhoto: '',
    templateId: '',
    themeStyle: 'classic-gold',
    headerTitle: 'CERTIFICATE OF ACADEMIC EXCELLENCE',
    headerSubtitle: 'FOR OUTSTANDING SCHOLASTIC DISTINCTION',
    templateBody: 'This is to officially certify that [student_name], Son/Daughter of [father_name], bearing Admission No [admission_no] and Roll No [roll_no], of Class [class_name] (Section [section]) has achieved commendable academic performance and conduct during the Academic Session [academic_session]. We wish them great success in all future pursuits.',
    certificateDate: new Date().toISOString().split('T')[0],
    academicSession: '2026 [Jan-Dec]',
    footerLeft: 'Date of Issue',
    footerCenter: 'Class Teacher',
    footerRight: 'Principal & Authorized Seal',
    showSchoolHeader: true,
    showStudentPhoto: true,
    showAdmissionNo: true,
    showRollNo: true,
    showClass: true,
    showSection: true,
    showFatherName: true,
    showDob: true,
    showGender: true,
    showIssueDate: true,
    showQrBarcode: true,
    showSeal: true,
    showSignatureLeft: true,
    showSignatureCenter: true,
    showSignatureRight: true
  });

  const textareaRef = useRef(null);

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial templates & school settings
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: searchQuery.trim(),
        type: typeFilter !== 'All' ? typeFilter : '',
        status: statusFilter !== 'All' ? statusFilter : ''
      });

      const [res, statsRes, setRes] = await Promise.all([
        api.get(`/certificate?${queryParams.toString()}`),
        api.get('/certificate/stats').catch(() => null),
        api.get('/setting').catch(() => null)
      ]);

      if (res?.success) {
        setCards(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }

      if (statsRes?.success && statsRes.stats) {
        setStats(statsRes.stats);
      }

      if (setRes?.success && setRes.data) {
        setSchoolSetting(setRes.data);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch certificate templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, typeFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch students list for the Issue Certificate modal
  const loadStudents = async () => {
    if (studentsList.length > 0) return;
    try {
      setLoadingStudents(true);
      const res = await api.get('/student?limit=300');
      if (res?.success && Array.isArray(res.data)) {
        setStudentsList(res.data);
      }
    } catch (e) {
      console.error('Failed to load students:', e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const insertPlaceholder = (tag) => {
    if (!textareaRef.current) {
      setFormData(prev => ({ ...prev, templateBody: prev.templateBody + ' ' + tag }));
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = formData.templateBody || '';
    const updated = current.substring(0, start) + tag + current.substring(end);
    setFormData(prev => ({ ...prev, templateBody: updated }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB', true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, uploadedBackground: reader.result }));
        showToast('Custom certificate template background image loaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTemplateModalTab('design');
    setFormData({
      title: '',
      type: 'Character Certificate',
      description: '',
      headerTitle: '',
      headerSubtitle: 'TO WHOM IT MAY CONCERN',
      templateBody: 'This is to certify that [student_name], Son/Daughter of [father_name], bearing Admission No [admission_no] and Roll No [roll_no], is/was a bona fide student of Class [class_name] (Section [section]) in this institution for the Academic Session [academic_session]. During their stay, their conduct and academic character were exemplary. We wish them success in all future endeavors.',
      footerLeft: 'Date of Issue',
      footerCenter: 'Class Teacher / Checked By',
      footerRight: 'Principal / Authorized Seal',
      themeStyle: 'classic-gold',
      uploadedBackground: '',
      status: 'Active',
      showSchoolHeader: true,
      showStudentPhoto: true,
      showAdmissionNo: true,
      showRollNo: true,
      showClass: true,
      showSection: true,
      showFatherName: true,
      showDob: true,
      showGender: true,
      showIssueDate: true,
      showQrBarcode: true,
      showSeal: true,
      showSignatureLeft: true,
      showSignatureCenter: true,
      showSignatureRight: true
    });
    setShowFormModal(true);
  };

  const handleEdit = (cert) => {
    setEditingId(cert._id);
    setTemplateModalTab('design');
    setFormData({
      title: cert.title || '',
      type: cert.type || 'Transfer Certificate',
      description: cert.description || '',
      headerTitle: cert.headerTitle || '',
      headerSubtitle: cert.headerSubtitle || 'TO WHOM IT MAY CONCERN',
      templateBody: cert.templateBody || '',
      footerLeft: cert.footerLeft || 'Date of Issue',
      footerCenter: cert.footerCenter || 'Class Teacher / Checked By',
      footerRight: cert.footerRight || 'Principal / Authorized Seal',
      themeStyle: cert.themeStyle || 'classic-gold',
      uploadedBackground: cert.uploadedBackground || '',
      status: cert.status || 'Active',
      showSchoolHeader: cert.showSchoolHeader !== false,
      showStudentPhoto: cert.showStudentPhoto !== false,
      showAdmissionNo: cert.showAdmissionNo !== false,
      showRollNo: cert.showRollNo !== false,
      showClass: cert.showClass !== false,
      showSection: cert.showSection !== false,
      showFatherName: cert.showFatherName !== false,
      showDob: cert.showDob !== false,
      showGender: cert.showGender !== false,
      showIssueDate: cert.showIssueDate !== false,
      showQrBarcode: cert.showQrBarcode !== false,
      showSeal: cert.showSeal !== false,
      showSignatureLeft: cert.showSignatureLeft !== false,
      showSignatureCenter: cert.showSignatureCenter !== false,
      showSignatureRight: cert.showSignatureRight !== false
    });
    setShowFormModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Certificate title is required.', true);
      return;
    }
    if (!formData.type.trim()) {
      showToast('Certificate type is required.', true);
      return;
    }
    if (!formData.templateBody.trim()) {
      showToast('Certificate template content is required.', true);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        title: formData.title.trim(),
        type: formData.type.trim(),
        description: (formData.description || '').trim(),
        headerTitle: (formData.headerTitle || '').trim() || formData.title.trim().toUpperCase(),
        headerSubtitle: (formData.headerSubtitle || 'TO WHOM IT MAY CONCERN').trim(),
        templateBody: formData.templateBody.trim(),
        footerLeft: (formData.footerLeft || 'Date of Issue').trim(),
        footerCenter: (formData.footerCenter || 'Class Teacher / Checked By').trim(),
        footerRight: (formData.footerRight || 'Principal / Authorized Seal').trim()
      };

      if (editingId) {
        const res = await api.put(`/certificate/${editingId}`, payload);
        if (res?.success) {
          showToast('Certificate template updated successfully!');
          fetchData();
        }
      } else {
        const res = await api.post('/certificate', payload);
        if (res?.success) {
          showToast('Certificate template created successfully!');
          fetchData();
        }
      }

      setShowFormModal(false);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save certificate template:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save certificate template.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cert) => {
    try {
      const res = await api.patch(`/certificate/${cert._id}/status`);
      if (res?.success) {
        setCards(prev => prev.map(c => c._id === cert._id ? { ...c, status: res.data.status } : c));
        showToast(res.message || `Status updated to ${res.data.status}`);
        const statsRes = await api.get('/certificate/stats').catch(() => null);
        if (statsRes?.success) setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast(err?.response?.data?.message || 'Failed to update status.', true);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await api.delete(`/certificate/${deleteConfirmItem._id}`);
      if (res?.success) {
        showToast('Certificate template deleted successfully.');
        setDeleteConfirmItem(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete certificate template:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to delete certificate template.', true);
    }
  };

  // Open Issue Certificate for Student Modal
  const handleOpenIssueModal = (targetTemplate = null) => {
    loadStudents();
    const tpl = targetTemplate || cards[0] || formData;
    setIssueForm({
      studentId: '',
      studentName: 'Muhammad Rayyan',
      fatherName: 'Tariq Mehmood',
      admissionNo: 'ADM-2026-101',
      rollNo: '101',
      className: 'Class 10',
      section: 'Section A',
      dob: '2008-05-14',
      gender: 'Male',
      studentPhoto: '',
      templateId: tpl._id || '',
      themeStyle: tpl.themeStyle || 'classic-gold',
      headerTitle: tpl.headerTitle || tpl.title || 'CERTIFICATE OF ACADEMIC EXCELLENCE',
      headerSubtitle: tpl.headerSubtitle || 'FOR OUTSTANDING SCHOLASTIC DISTINCTION',
      templateBody: tpl.templateBody || 'This is to officially certify that [student_name], Son/Daughter of [father_name], bearing Admission No [admission_no] and Roll No [roll_no], of Class [class_name] (Section [section]) in this institution has achieved commendable academic performance and conduct during the Academic Session [academic_session]. We wish them great success in all future pursuits.',
      certificateDate: new Date().toISOString().split('T')[0],
      academicSession: schoolSetting?.academicYear || '2026 [Jan-Dec]',
      footerLeft: tpl.footerLeft || 'Date of Issue',
      footerCenter: tpl.footerCenter || 'Class Teacher',
      footerRight: tpl.footerRight || 'Principal & Authorized Seal',
      showSchoolHeader: tpl.showSchoolHeader !== false,
      showStudentPhoto: tpl.showStudentPhoto !== false,
      showAdmissionNo: tpl.showAdmissionNo !== false,
      showRollNo: tpl.showRollNo !== false,
      showClass: tpl.showClass !== false,
      showSection: tpl.showSection !== false,
      showFatherName: tpl.showFatherName !== false,
      showDob: tpl.showDob !== false,
      showGender: tpl.showGender !== false,
      showIssueDate: tpl.showIssueDate !== false,
      showQrBarcode: tpl.showQrBarcode !== false,
      showSeal: tpl.showSeal !== false,
      showSignatureLeft: tpl.showSignatureLeft !== false,
      showSignatureCenter: tpl.showSignatureCenter !== false,
      showSignatureRight: tpl.showSignatureRight !== false
    });
    setShowIssueModal(true);
  };

  // Auto-open Issue Certificate or Manage Templates modal if triggered via URL query param (e.g. from sidebar "Generate Certificate")
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = (params.get('action') || params.get('open') || '').toLowerCase();
      if (action === 'issue' || action === 'generate' || action === 'create') {
        handleOpenIssueModal();
      } else if (action === 'manage' || action === 'template' || action === 'templates' || action === 'settings') {
        setShowFormModal(true);
      }
    }
  }, []);

  const handleSelectStudentForIssue = (studentId) => {
    const st = studentsList.find(s => s._id === studentId);
    if (st) {
      setIssueForm(prev => ({
        ...prev,
        studentId: st._id,
        studentName: `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.name || 'Student Name',
        fatherName: st.fatherName || '',
        admissionNo: String(st.admissionNo || ''),
        rollNo: String(st.rollNo || ''),
        className: st.className || 'Class 10',
        section: st.section || 'Section A',
        dob: st.dob || '2008-05-14',
        gender: st.gender || 'Male',
        studentPhoto: st.studentPhoto || st.photo || ''
      }));
    }
  };

  const handleSelectTemplateForIssue = (templateId) => {
    const tpl = cards.find(c => c._id === templateId);
    if (tpl) {
      setIssueForm(prev => ({
        ...prev,
        templateId: tpl._id,
        themeStyle: tpl.themeStyle || 'classic-gold',
        headerTitle: tpl.headerTitle || tpl.title || 'CERTIFICATE OF EXCELLENCE',
        headerSubtitle: tpl.headerSubtitle || 'TO WHOM IT MAY CONCERN',
        templateBody: tpl.templateBody || prev.templateBody,
        footerLeft: tpl.footerLeft || 'Date of Issue',
        footerCenter: tpl.footerCenter || 'Class Teacher',
        footerRight: tpl.footerRight || 'Principal & Authorized Seal',
        showSchoolHeader: tpl.showSchoolHeader !== false,
        showStudentPhoto: tpl.showStudentPhoto !== false,
        showAdmissionNo: tpl.showAdmissionNo !== false,
        showRollNo: tpl.showRollNo !== false,
        showClass: tpl.showClass !== false,
        showSection: tpl.showSection !== false,
        showFatherName: tpl.showFatherName !== false,
        showDob: tpl.showDob !== false,
        showGender: tpl.showGender !== false,
        showIssueDate: tpl.showIssueDate !== false,
        showQrBarcode: tpl.showQrBarcode !== false,
        showSeal: tpl.showSeal !== false,
        showSignatureLeft: tpl.showSignatureLeft !== false,
        showSignatureCenter: tpl.showSignatureCenter !== false,
        showSignatureRight: tpl.showSignatureRight !== false
      }));
    }
  };

  // Photo upload in Issue Modal
  const handleIssuePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Photo size must be less than 5MB', true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setIssueForm(prev => ({ ...prev, studentPhoto: reader.result }));
        showToast('Student photo attached to certificate!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrintCertificate = (record) => {
    setPrintPortalRecord(record);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDownloadPDF = (record) => {
    downloadCertificatePDF(record, record, schoolSetting);
    showToast(`PDF Certificate downloaded for ${record.studentName || 'Student'}`);
  };

  // Helper to format certificate body text replacing placeholders
  const formatCertificateText = (rawText, studentRec) => {
    if (!rawText) return '';
    const stName = studentRec.studentName || `${studentRec.firstName || ''} ${studentRec.lastName || ''}`.trim() || 'Student Name';
    const fName = studentRec.fatherName || 'Tariq Mehmood';
    const admNo = studentRec.admissionNo || 'ADM-2026-101';
    const rollNo = studentRec.rollNo || '101';
    const clsName = studentRec.className || 'Class 10';
    const secName = studentRec.section || 'A';
    const scName = schoolSetting?.schoolName || 'Stoofi Public School & College';
    const scAddr = schoolSetting?.address || 'Main Campus, Lahore, Pakistan';
    const certDate = studentRec.certificateDate ? new Date(studentRec.certificateDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedDob = studentRec.dob ? new Date(studentRec.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '15 August 2010';

    return rawText
      .split('[student_name]').join(stName)
      .split('{{studentName}}').join(stName)
      .split('[father_name]').join(fName)
      .split('{{fatherName}}').join(fName)
      .split('[admission_no]').join(admNo)
      .split('{{admissionNumber}}').join(admNo)
      .split('[roll_no]').join(rollNo)
      .split('{{rollNumber}}').join(rollNo)
      .split('[class_name]').join(clsName)
      .split('{{class}}').join(clsName)
      .split('[section]').join(secName)
      .split('{{section}}').join(secName)
      .split('[academic_session]').join(studentRec.academicSession || '2026 [Jan-Dec]')
      .split('[academic_year]').join(studentRec.academicSession || '2026 [Jan-Dec]')
      .split('[dob]').join(formattedDob)
      .split('[gender]').join(studentRec.gender || 'Student')
      .split('[school_name]').join(scName)
      .split('[school_address]').join(scAddr)
      .split('[certificate_date]').join(certDate)
      .split('[issue_date]').join(certDate)
      .split('[tc_no]').join(`TC-${admNo || '2026-084'}`);
  };

  // ── MASTER RENDERER FOR CERTIFICATE GRAPHIC (ACROSS ALL 5 STYLES & ALL TOGGLES) ──
  const renderCertificateGraphic = (studentRec, tplOverride = null, isInspect = false) => {
    const tpl = tplOverride || formData;
    const styleId = tpl.themeStyle || 'classic-gold';
    const stName = studentRec.studentName || `${studentRec.firstName || ''} ${studentRec.lastName || ''}`.trim() || 'Muhammad Rayyan';
    const fName = studentRec.fatherName || 'Tariq Mehmood';
    const admNo = studentRec.admissionNo || 'ADM-2026-101';
    const rollNo = studentRec.rollNo || '101';
    const clsName = studentRec.className || 'Class 10';
    const secName = studentRec.section || 'A';
    const certDate = studentRec.certificateDate ? new Date(studentRec.certificateDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedBody = formatCertificateText(tpl.templateBody, studentRec);
    const photo = studentRec.studentPhoto || '';
    const scName = schoolSetting?.schoolName || 'Stoofi Public School & College';
    const scAddr = schoolSetting?.address || 'Main Campus, Lahore, Pakistan';

    // Visibility toggles
    const showHeader = tpl.showSchoolHeader !== false;
    const showPhoto = tpl.showStudentPhoto !== false;
    const showAdm = tpl.showAdmissionNo !== false;
    const showRoll = tpl.showRollNo !== false;
    const showClassFld = tpl.showClass !== false;
    const showSec = tpl.showSection !== false;
    const showFather = tpl.showFatherName !== false;
    const showDobFld = tpl.showDob !== false;
    const showSeal = tpl.showSeal !== false;
    const showQr = tpl.showQrBarcode !== false;
    const showSignLeft = tpl.showSignatureLeft !== false;
    const showSignCenter = tpl.showSignatureCenter !== false;
    const showSignRight = tpl.showSignatureRight !== false;

    // ── DESIGN 1: Imperial Classical Gold ──
    if (styleId === 'classic-gold') {
      return (
        <div className={`bg-[#fffdf8] text-zinc-900 border-8 border-double border-amber-600 p-6 sm:p-10 rounded-3xl shadow-xl w-full ${isInspect ? 'max-w-4xl' : 'max-w-full'} flex flex-col justify-between relative overflow-hidden select-none certificate-page`}>
          {/* Corner filigree accents */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500"></div>
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-500"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-500"></div>
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-500"></div>

          {/* Header */}
          <div className="text-center relative z-10">
            {showHeader && (
              <>
                <div className="flex items-center justify-center gap-2 text-amber-700 font-serif text-xs uppercase tracking-widest font-bold mb-1">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <span>{scName}</span>
                </div>
                <p className="text-[10px] text-zinc-500 tracking-wide">{scAddr}</p>
                <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-2.5"></div>
              </>
            )}

            <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-amber-950 tracking-wider uppercase mt-1">
              {tpl.headerTitle || 'Certificate of Academic Excellence'}
            </h2>
            <p className="text-[11px] font-semibold text-amber-800/80 uppercase tracking-widest mt-0.5">
              {tpl.headerSubtitle || 'FOR OUTSTANDING SCHOLASTIC DISTINCTION'}
            </p>
          </div>

          {/* Body Section with optional Student Portrait Frame */}
          <div className="my-6 text-center space-y-3 relative z-10">
            {/* Student Photo Badge (if enabled) */}
            {showPhoto && (
              <div className="flex justify-center mb-2">
                <div className="w-16 h-20 rounded-xl border-2 border-amber-500 p-0.5 bg-white shadow-md overflow-hidden flex items-center justify-center">
                  {photo ? (
                    <img src={photo} alt="Student" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Camera className="w-6 h-6 text-amber-600" />
                  )}
                </div>
              </div>
            )}

            <p className="text-[11px] uppercase text-zinc-500 font-bold tracking-widest">This Certificate is Proudly Bestowed Upon</p>
            <div className="text-2xl sm:text-3xl font-serif font-black text-amber-950 underline decoration-amber-400 underline-offset-8 capitalize">
              {stName}
            </div>

            {/* Bio line respecting toggles */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-zinc-600 pt-1">
              {showFather && <span>Son/Daughter of <strong className="text-zinc-900">{fName}</strong></span>}
              {showAdm && <span>| Adm No: <strong className="text-zinc-900">{admNo}</strong></span>}
              {showRoll && <span>| Roll No: <strong className="text-zinc-900">{rollNo}</strong></span>}
              {showClassFld && <span>| Class: <strong className="text-zinc-900">{clsName}</strong></span>}
              {showSec && <span>(<strong className="text-zinc-900">{secName}</strong>)</span>}
              {showDobFld && studentRec.dob && <span>| DOB: <strong className="text-zinc-900">{studentRec.dob}</strong></span>}
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 max-w-2xl mx-auto leading-relaxed font-serif pt-2 italic">
              &ldquo;{formattedBody}&rdquo;
            </p>
          </div>

          {/* Footer & Gold Seal */}
          <div className="flex items-end justify-between pt-6 border-t border-amber-200/80 relative z-10">
            {showSignLeft && (
              <div className="text-center">
                <div className="text-xs font-bold text-zinc-800">{certDate}</div>
                <div className="w-24 h-0.5 bg-zinc-400 mt-1 mb-0.5"></div>
                <p className="text-[9.5px] text-zinc-500 uppercase font-semibold">{tpl.footerLeft || 'Date of Issue'}</p>
              </div>
            )}

            {/* Official Seal Medallion */}
            {showSeal && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 shadow-md border-2 border-amber-200 flex items-center justify-center text-white font-serif font-bold text-center text-[8px] uppercase leading-tight p-1">
                  Official Seal
                </div>
                {showQr && (
                  <span className="text-[8px] font-mono font-bold text-amber-800 mt-1">VERIFIED: {studentRec.certificateNumber || 'CERT-OK'}</span>
                )}
              </div>
            )}

            {showSignRight && (
              <div className="text-center">
                <div className="text-xs font-bold text-amber-950 font-serif italic">Principal Signature</div>
                <div className="w-32 h-0.5 bg-amber-600 mt-1 mb-0.5"></div>
                <p className="text-[9.5px] text-zinc-500 uppercase font-semibold">{tpl.footerRight || 'Principal & Seal'}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── DESIGN 2: Modern Emerald Excellence ──
    if (styleId === 'stoofi-emerald') {
      return (
        <div className={`bg-white text-zinc-900 border-4 border-emerald-700 p-6 sm:p-10 rounded-3xl shadow-xl w-full ${isInspect ? 'max-w-4xl' : 'max-w-full'} flex flex-col justify-between relative overflow-hidden select-none certificate-page`}>
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-sky-800"></div>

          <div className="text-center relative z-10 pt-1">
            {showHeader && (
              <>
                <div className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{scName}</span>
                </div>
                <p className="text-[10px] text-zinc-500">{scAddr}</p>
              </>
            )}

            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight uppercase mt-2">
              {tpl.headerTitle || 'Character & Conduct Certificate'}
            </h2>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest mt-0.5">
              {tpl.headerSubtitle || 'TO WHOM IT MAY CONCERN'}
            </p>
          </div>

          <div className="my-6 text-center space-y-3 relative z-10">
            {showPhoto && (
              <div className="flex justify-center mb-1">
                <div className="w-16 h-20 rounded-xl border-2 border-emerald-600 p-0.5 bg-white shadow-md overflow-hidden flex items-center justify-center">
                  {photo ? (
                    <img src={photo} alt="Student" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Camera className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
              </div>
            )}

            <p className="text-[11px] uppercase text-zinc-400 font-bold">This is to officially certify that</p>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 capitalize">
              {stName}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-zinc-600">
              {showFather && <span>Father: <strong className="text-zinc-900">{fName}</strong></span>}
              {showClassFld && <span>| Class: <strong className="text-zinc-900">{clsName}</strong></span>}
              {showSec && <span>(<strong className="text-zinc-900">{secName}</strong>)</span>}
              {showAdm && <span>| Adm No: <strong className="text-zinc-900">{admNo}</strong></span>}
              {showRoll && <span>| Roll No: <strong className="text-zinc-900">{rollNo}</strong></span>}
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 max-w-2xl mx-auto leading-relaxed pt-1 font-medium">
              {formattedBody}
            </p>
          </div>

          <div className="flex items-end justify-between pt-6 border-t border-emerald-100 relative z-10">
            {showSignLeft && (
              <div className="text-center">
                <div className="text-xs font-bold text-zinc-800">{certDate}</div>
                <div className="w-24 h-0.5 bg-emerald-700 mt-1 mb-0.5"></div>
                <p className="text-[9.5px] text-zinc-500 uppercase font-semibold">{tpl.footerLeft || 'Date of Issue'}</p>
              </div>
            )}

            {showQr && (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-lg text-[9px] font-mono font-bold">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>SEC-VERIFIED</span>
              </div>
            )}

            {showSignRight && (
              <div className="text-center">
                <div className="text-xs font-bold text-emerald-900">Principal Signature</div>
                <div className="w-32 h-0.5 bg-emerald-700 mt-1 mb-0.5"></div>
                <p className="text-[9.5px] text-zinc-500 uppercase font-semibold">{tpl.footerRight || 'Authorized Signatory'}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── DESIGN 3: Royal Navy Diploma ──
    if (styleId === 'royal-navy' || styleId === 'academic-navy') {
      return (
        <div className={`bg-[#fbfcff] text-zinc-900 border-4 border-sky-900 p-6 sm:p-10 rounded-3xl shadow-xl w-full ${isInspect ? 'max-w-4xl' : 'max-w-full'} flex flex-col justify-between relative overflow-hidden select-none certificate-page`}>
          <div className="text-center relative z-10">
            {showHeader && (
              <>
                <div className="text-xs font-black uppercase text-sky-950 tracking-wider flex items-center justify-center gap-1.5">
                  <Award className="w-5 h-5 text-sky-800" />
                  <span>{scName}</span>
                </div>
                <p className="text-[10px] text-zinc-500">{scAddr}</p>
              </>
            )}

            <h2 className="text-xl sm:text-2xl font-serif font-black text-sky-950 tracking-wide uppercase mt-2">
              {tpl.headerTitle || 'School Leaving & Transfer Certificate'}
            </h2>
            <p className="text-[11px] font-bold text-sky-800 uppercase tracking-widest mt-0.5">
              {tpl.headerSubtitle || 'OFFICIAL RECORD OF CLEARANCE & ADVANCEMENT'}
            </p>
          </div>

          <div className="my-6 text-center space-y-3 relative z-10">
            {showPhoto && (
              <div className="flex justify-center mb-1">
                <div className="w-16 h-20 rounded-xl border-2 border-sky-900 p-0.5 bg-white shadow-md overflow-hidden flex items-center justify-center">
                  {photo ? (
                    <img src={photo} alt="Student" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Camera className="w-6 h-6 text-sky-800" />
                  )}
                </div>
              </div>
            )}

            <p className="text-[11px] uppercase text-zinc-500 font-bold font-serif">Record of Student Clearance Bestowed Upon</p>
            <div className="text-2xl sm:text-3xl font-serif font-black text-sky-950 capitalize">
              {stName}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-zinc-600">
              {showFather && <span>Father: <strong className="text-zinc-900">{fName}</strong></span>}
              {showAdm && <span>| Adm No: <strong className="text-zinc-900">{admNo}</strong></span>}
              {showClassFld && <span>| Class: <strong className="text-zinc-900">{clsName}</strong></span>}
              {showSec && <span>({secName})</span>}
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 max-w-2xl mx-auto leading-relaxed pt-1 font-serif italic">
              &ldquo;{formattedBody}&rdquo;
            </p>
          </div>

          <div className="flex items-end justify-between pt-6 border-t border-sky-200 relative z-10">
            {showSignLeft && (
              <div className="text-center">
                <div className="text-xs font-bold text-zinc-800">{certDate}</div>
                <div className="w-24 h-0.5 bg-sky-900 mt-1 mb-0.5"></div>
                <p className="text-[9.5px] text-zinc-500 uppercase font-semibold">{tpl.footerLeft || 'Date of Record'}</p>
              </div>
            )}

            {showSeal && (
              <div className="w-12 h-12 rounded-full border-2 border-sky-900 flex items-center justify-center text-[8px] font-bold uppercase text-sky-950 bg-sky-50">
                Seal
              </div>
            )}

            {showSignRight && (
              <div className="text-center">
                <div className="text-xs font-bold text-sky-950 font-serif">Principal / Registrar</div>
                <div className="w-32 h-0.5 bg-sky-900 mt-1 mb-0.5"></div>
                <p className="text-[9.5px] text-zinc-500 uppercase font-semibold">{tpl.footerRight || 'Authorized Clearance'}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── DESIGN 4: Crimson Sports & Merit ──
    if (styleId === 'crimson-merit') {
      return (
        <div className={`bg-[#fffbfb] text-zinc-900 border-4 border-rose-800 p-6 sm:p-10 rounded-3xl shadow-xl w-full ${isInspect ? 'max-w-4xl' : 'max-w-full'} flex flex-col justify-between relative overflow-hidden select-none certificate-page`}>
          <div className="text-center relative z-10">
            {showHeader && (
              <>
                <div className="text-xs font-black uppercase text-rose-900 tracking-wider flex items-center justify-center gap-1.5">
                  <Medal className="w-5 h-5 text-amber-500" />
                  <span>{scName}</span>
                </div>
                <p className="text-[10px] text-zinc-500">{scAddr}</p>
              </>
            )}

            <h2 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight uppercase mt-2">
              {tpl.headerTitle || 'Certificate of Sports & Merit'}
            </h2>
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest mt-0.5">
              {tpl.headerSubtitle || 'EXCELLENCE IN ATHLETICS & SPORTSMANSHIP'}
            </p>
          </div>

          <div className="my-6 text-center space-y-3 relative z-10">
            {showPhoto && (
              <div className="flex justify-center mb-1">
                <div className="w-16 h-20 rounded-xl border-2 border-rose-700 p-0.5 bg-white shadow-md overflow-hidden flex items-center justify-center">
                  {photo ? (
                    <img src={photo} alt="Student" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Camera className="w-6 h-6 text-rose-700" />
                  )}
                </div>
              </div>
            )}

            <p className="text-[11px] uppercase text-zinc-500 font-bold">Proudly Awarded to Champion</p>
            <div className="text-2xl sm:text-3xl font-black text-rose-950 capitalize">
              {stName}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-rose-900">
              {showAdm && <span>Adm No: <strong>{admNo}</strong></span>}
              {showClassFld && <span>| Class: <strong>{clsName} ({secName})</strong></span>}
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 max-w-2xl mx-auto leading-relaxed pt-1 font-medium">
              {formattedBody}
            </p>
          </div>

          <div className="flex items-end justify-between pt-6 border-t border-rose-200 relative z-10">
            {showSignLeft && (
              <div className="text-center">
                <div className="text-xs font-bold text-zinc-800">{certDate}</div>
                <div className="w-24 h-0.5 bg-rose-800 mt-1 mb-0.5"></div>
                <p className="text-[9.5px] text-zinc-500 uppercase font-semibold">{tpl.footerLeft || 'Date of Event'}</p>
              </div>
            )}

            {showSignCenter && (
              <div className="text-center">
                <div className="text-xs font-bold text-rose-950">Sports Coordinator</div>
                <div className="w-28 h-0.5 bg-rose-800 mt-1 mb-0.5"></div>
                <p className="text-[9.5px] text-zinc-500 uppercase font-semibold">{tpl.footerCenter || 'Sports Director'}</p>
              </div>
            )}

            {showSignRight && (
              <div className="text-center">
                <div className="text-xs font-bold text-rose-950">Principal / Patron</div>
                <div className="w-32 h-0.5 bg-rose-800 mt-1 mb-0.5"></div>
                <p className="text-[9.5px] text-zinc-500 uppercase font-semibold">{tpl.footerRight || 'Principal Seal'}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── DESIGN 5: Minimalist Digital Verified ──
    return (
      <div className={`bg-white text-zinc-900 border-2 border-zinc-900 p-6 sm:p-10 rounded-2xl shadow-xl w-full ${isInspect ? 'max-w-4xl' : 'max-w-full'} flex flex-col justify-between relative overflow-hidden select-none certificate-page`}>
        <div className="text-center relative z-10">
          {showHeader && (
            <>
              <div className="text-xs font-extrabold uppercase text-zinc-900 tracking-widest flex items-center justify-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>{scName}</span>
              </div>
              <p className="text-[10px] text-zinc-500">{scAddr}</p>
            </>
          )}

          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight uppercase mt-2">
            {tpl.headerTitle || 'Certificate of Appreciation'}
          </h2>
          <span className="inline-block mt-0.5 px-3 py-0.5 text-[9px] font-bold uppercase rounded bg-zinc-100 text-zinc-800 border border-zinc-300">
            {tpl.headerSubtitle || 'IN RECOGNITION OF VALUABLE CONTRIBUTIONS'}
          </span>
        </div>

        <div className="my-6 text-center space-y-3 relative z-10">
          {showPhoto && (
            <div className="flex justify-center mb-1">
              <div className="w-16 h-20 rounded-xl border border-zinc-400 p-0.5 bg-white shadow-xs overflow-hidden flex items-center justify-center">
                {photo ? (
                  <img src={photo} alt="Student" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Camera className="w-6 h-6 text-zinc-700" />
                )}
              </div>
            </div>
          )}

          <p className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">This credential is presented to</p>
          <div className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight capitalize">
            {stName}
          </div>

          <div className="text-xs font-mono text-zinc-600">
            {showAdm && <span>Admission No: <strong>{admNo}</strong></span>}
            {showClassFld && <span> | Class: <strong>{clsName} ({secName})</strong></span>}
          </div>

          <p className="text-xs sm:text-sm text-zinc-700 max-w-2xl mx-auto leading-relaxed pt-1">
            {formattedBody}
          </p>
        </div>

        <div className="flex items-end justify-between pt-6 border-t border-zinc-200 relative z-10">
          {showSignLeft && (
            <div className="text-center">
              <div className="text-xs font-bold text-zinc-800 font-mono">{certDate}</div>
              <div className="w-24 h-0.5 bg-zinc-900 mt-1 mb-0.5"></div>
              <p className="text-[9.5px] text-zinc-500 uppercase font-semibold">{tpl.footerLeft || 'Date of Presentation'}</p>
            </div>
          )}

          {showQr && (
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
              <QrCode className="w-3.5 h-3.5 text-zinc-900" />
              <span>ID: STO-CERT-VERIFIED</span>
            </div>
          )}

          {showSignRight && (
            <div className="text-center">
              <div className="text-xs font-bold text-zinc-950">Principal & Authorized Sign</div>
              <div className="w-32 h-0.5 bg-zinc-900 mt-1 mb-0.5"></div>
              <p className="text-[9.5px] text-zinc-500 uppercase font-semibold">{tpl.footerRight || 'Digital Authorized Seal'}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleExport = (type) => {
    if (cards.length === 0) {
      showToast('No templates available to export.', true);
      return;
    }

    const exportData = cards.map((item, index) => ({
      'SL': (page - 1) * 10 + index + 1,
      'Certificate Title': item.title,
      'Type': item.type,
      'Status': item.status,
      'Theme Style': item.themeStyle,
      'Updated Date': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : '-'
    }));

    const headers = Object.keys(exportData[0] || {});
    const filename = `Certificate_Templates_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Stoofi Institutional Certificate Templates');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV export downloaded successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'Certificates');
      showToast('Excel export downloaded successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Stoofi Certificate Templates', filename);
      showToast('PDF export downloaded successfully!');
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

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Award className="w-6 h-6 text-zinc-900" />
            Institutional Certificates
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure certificate designs, toggle visible credentials, and issue high-resolution diplomas for enrolled students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/dashboard/admin/generate-certificate"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-600 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Bulk Certificates
          </Link>
          <div className="hidden md:flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg">
            <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-700 transition-colors">Admin Section</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-semibold">Certificate</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Templates</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{stats.total}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Active certificate formats</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{stats.active}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Ready for issuing</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Inactive</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-700 mt-2">{stats.inactive}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Archived / Hidden</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Categories</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-950 mt-2">{stats.totalTypes || 5}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Distinct certificate types</p>
        </div>
      </div>

      {/* Main List & Table Container */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        
        {/* Table Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-zinc-50/50">
          
          {/* Left: Issue Certificate + Manage / Create Template Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button 
              onClick={() => handleOpenIssueModal()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-8 text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap px-3.5 rounded-lg transition-all cursor-pointer"
            >
              <Award className="h-3.5 w-3.5" />
              ISSUE CERTIFICATE
            </Button>
            <Button 
              onClick={handleOpenCreate}
              variant="outline"
              className="bg-white hover:bg-zinc-100 text-zinc-800 font-semibold h-8 text-xs flex items-center gap-1.5 shadow-2xs whitespace-nowrap px-3 rounded-lg border border-zinc-300 transition-all cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 text-zinc-500" />
              MANAGE TEMPLATES
            </Button>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-zinc-700 border border-zinc-200 shadow-2xs whitespace-nowrap">
              {pagination.total} {pagination.total === 1 ? 'Template' : 'Templates'}
            </span>
          </div>

          {/* Right: Search, Filters & Export Tools */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 overflow-x-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[200px] shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search templates..." 
                className="pl-8 h-8 text-xs bg-white border-zinc-300 text-zinc-950 focus-visible:ring-1 focus-visible:ring-zinc-900 rounded-lg" 
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

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium shrink-0 cursor-pointer shadow-2xs"
            >
              <option value="All">All Types</option>
              {CERT_TYPE_OPTIONS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium shrink-0 cursor-pointer shadow-2xs"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Export Toolbar */}
            <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-2xs shrink-0">
              <button onClick={() => handleExport('Excel')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer" title="Excel">
                <Download className="h-3.5 w-3.5 text-emerald-600" />
              </button>
              <button onClick={() => handleExport('CSV')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer" title="CSV">
                <FileCheck className="h-3.5 w-3.5 text-blue-600" />
              </button>
              <button onClick={() => handleExport('PDF')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors border-r border-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer" title="PDF">
                <Download className="h-3.5 w-3.5 text-rose-600" />
              </button>
              <button onClick={() => handleExport('Print')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer" title="Print">
                <Printer className="h-3.5 w-3.5 text-zinc-700" />
              </button>
            </div>

            {/* Refresh */}
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-zinc-600 border border-zinc-200 bg-white shadow-2xs hover:bg-zinc-50 rounded-lg shrink-0 transition-colors cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={fetchData} className="h-7 text-xs bg-white border-rose-200 text-rose-700 hover:bg-rose-100">
              Retry
            </Button>
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto min-h-[260px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <Loader2 className="w-7 h-7 animate-spin text-zinc-800" />
              <p className="text-xs text-zinc-500">Loading certificate templates...</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold bg-zinc-50/80 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">SL</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Design Style</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated Date</th>
                  <th className="px-4 py-3 font-semibold w-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70">
                {cards.length > 0 ? (
                  cards.map((c, i) => {
                    const slNo = (page - 1) * 10 + i + 1;
                    const isEmerald = c.themeStyle === 'stoofi-emerald';
                    const isGold = c.themeStyle === 'classic-gold';
                    const isNavy = c.themeStyle === 'royal-navy' || c.themeStyle === 'academic-navy';

                    return (
                      <tr key={c._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-center text-zinc-500 font-mono">{slNo}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-zinc-950 text-sm">{c.title}</div>
                          {c.description && (
                            <div className="text-[11px] text-zinc-500 truncate max-w-sm mt-0.5">
                              {c.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                            isEmerald ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            isGold ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            isNavy ? 'bg-sky-50 text-sky-900 border-sky-200' :
                            'bg-zinc-100 text-zinc-800 border-zinc-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isEmerald ? 'bg-emerald-600' :
                              isGold ? 'bg-amber-600' :
                              isNavy ? 'bg-sky-700' : 'bg-zinc-700'
                            }`} />
                            {THEME_STYLES.find(t => t.id === c.themeStyle)?.label || c.themeStyle || 'Classic Gold'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                              c.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-600' : 'bg-zinc-400'}`} />
                            {c.status || 'Active'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-500">
                          {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              onClick={() => setViewingCert(c)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer"
                              title="Preview Certificate"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => handleOpenIssueModal(c)}
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-amber-700 hover:text-amber-950 hover:bg-amber-50 cursor-pointer"
                              title="Issue this certificate for a student"
                            >
                              <Award className="h-3.5 w-3.5" />
                            </Button>
                            <Link
                              href={`/dashboard/admin/generate-certificate?templateId=${c._id}`}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-md text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
                              title="Generate in bulk for class"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                            </Link>
                            <Button 
                              onClick={() => handleEdit(c)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-sky-700 hover:text-sky-900 hover:bg-sky-50 cursor-pointer"
                              title="Edit Template & Visible Fields"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              onClick={() => setDeleteConfirmItem(c)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                              title="Delete Template"
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
                    <td colSpan="7" className="px-4 py-16 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Award className="w-10 h-10 text-zinc-300" />
                        <p className="font-semibold text-zinc-800 text-sm">No Certificate Templates Found</p>
                        <p className="text-xs text-zinc-400 max-w-sm">
                          {searchQuery || typeFilter !== 'All' || statusFilter !== 'All'
                            ? 'No templates match your selected search or filter criteria.' 
                            : 'Create your first certificate design template to start generating institutional student certificates.'}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button 
                            onClick={() => handleOpenIssueModal()}
                            size="sm" 
                            className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5 mr-1" />
                            Issue Certificate
                          </Button>
                          <Button 
                            onClick={handleOpenCreate} 
                            size="sm" 
                            variant="outline"
                            className="bg-white hover:bg-zinc-100 text-zinc-800 font-medium text-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Create Template
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/40 text-xs text-zinc-600">
            <div>
              Showing <span className="font-semibold text-zinc-950">{(page - 1) * 10 + 1}</span> to <span className="font-semibold text-zinc-950">{Math.min(page * 10, pagination.total)}</span> of <span className="font-semibold text-zinc-950">{pagination.total}</span> templates
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="h-7 text-xs px-2.5 bg-white border-zinc-300 cursor-pointer"
              >
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={`h-7 w-7 p-0 text-xs cursor-pointer ${
                    p === page 
                      ? 'bg-zinc-950 text-white font-bold' 
                      : 'bg-white border-zinc-300 text-zinc-700'
                  }`}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                className="h-7 text-xs px-2.5 bg-white border-zinc-300 cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── 1. MANAGE / CREATE TEMPLATE MODAL (WITH TABS & REAL-TIME LIVE PREVIEW) ── */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-5xl w-full my-6 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/80 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-600" />
                <div>
                  <h2 className="text-base font-bold text-zinc-950">
                    {editingId ? 'Manage Certificate Template Design' : 'Create Certificate Template'}
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    Customize certificate typography, themes, branding, and choose what fields to show or hide
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFormModal(false)} 
                className="text-zinc-400 hover:text-zinc-700 h-8 w-8 p-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Navigation Tabs (Design & Wording vs Visible Fields) */}
            <div className="flex items-center border-b border-zinc-200 bg-zinc-100/60 px-5 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setTemplateModalTab('design')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  templateModalTab === 'design'
                    ? 'border-amber-600 text-amber-700 bg-white shadow-2xs'
                    : 'border-transparent text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                1. Design, Wording & Typography (&ldquo;Kia Kia Likha Hai&rdquo;)
              </button>

              <button
                type="button"
                onClick={() => setTemplateModalTab('fields')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  templateModalTab === 'fields'
                    ? 'border-amber-600 text-amber-700 bg-white shadow-2xs'
                    : 'border-transparent text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                2. Visible Certificate Fields (&ldquo;Kya Show Karna Hai, Kya Hide&rdquo;)
                <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                  14 Settings
                </span>
              </button>
            </div>

            {/* Modal Body: 2 Columns (Form on left, Live Card Preview on right) */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 text-xs">
              {/* Left Column: Form & Toggles */}
              <div className="lg:col-span-7 p-5 space-y-4 border-r border-zinc-200 overflow-y-auto max-h-[75vh]">
                <form id="template-customizer-form" onSubmit={handleSave}>
                  {/* TAB 1: DESIGN & WORDING */}
                  {templateModalTab === 'design' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-zinc-800">
                            Template Title <span className="text-rose-500">*</span>
                          </Label>
                          <Input 
                            value={formData.title} 
                            onChange={e => setFormData({ ...formData, title: e.target.value })} 
                            placeholder="e.g. Imperial Academic Merit Certificate" 
                            className="bg-white border-zinc-300 text-zinc-950 text-xs" 
                            required 
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-zinc-800">
                            Certificate Category <span className="text-rose-500">*</span>
                          </Label>
                          <select 
                            value={formData.type} 
                            onChange={e => setFormData({ ...formData, type: e.target.value })} 
                            className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 cursor-pointer" 
                            required
                          >
                            {CERT_TYPE_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Theme Style */}
                        <div className="md:col-span-2 space-y-1.5 pt-1">
                          <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                            Certificate Border Theme & Color Scheme
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {THEME_STYLES.slice(0, 5).map(t => {
                              const isSelected = formData.themeStyle === t.id;
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, themeStyle: t.id })}
                                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                                    isSelected 
                                      ? 'bg-amber-50/80 border-amber-600 ring-1 ring-amber-500 shadow-2xs' 
                                      : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                                  }`}
                                >
                                  <div>
                                    <div className="font-bold text-xs text-zinc-900">{t.label}</div>
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Printed Header Title */}
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-zinc-800">
                            Printed Header Title
                          </Label>
                          <Input 
                            value={formData.headerTitle} 
                            onChange={e => setFormData({ ...formData, headerTitle: e.target.value })} 
                            placeholder="e.g. CERTIFICATE OF ACADEMIC EXCELLENCE" 
                            className="bg-white border-zinc-300 text-zinc-950 text-xs font-mono uppercase" 
                          />
                        </div>

                        {/* Subtitle / Ribbon */}
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-zinc-800">
                            Header Subtitle / Ribbon Text
                          </Label>
                          <Input 
                            value={formData.headerSubtitle} 
                            onChange={e => setFormData({ ...formData, headerSubtitle: e.target.value })} 
                            placeholder="e.g. FOR OUTSTANDING SCHOLASTIC DISTINCTION" 
                            className="bg-white border-zinc-300 text-zinc-950 text-xs uppercase" 
                          />
                        </div>
                      </div>

                      {/* Template Body with Interactive Tags */}
                      <div className="space-y-2 pt-2 border-t border-zinc-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                            Certificate Citation / Body Text (&ldquo;Kia Likha Hai&rdquo;) <span className="text-rose-500">*</span>
                          </Label>
                          <span className="text-[10px] text-zinc-400">
                            Click tag to insert dynamic student data
                          </span>
                        </div>

                        {/* Placeholder tags toolbar */}
                        <div className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                          {PLACEHOLDER_TAGS.map(item => (
                            <button
                              key={item.tag}
                              type="button"
                              onClick={() => insertPlaceholder(item.tag)}
                              className="inline-flex items-center px-2 py-0.5 rounded bg-white hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-zinc-200 text-[10.5px] font-mono font-medium text-zinc-700 transition-colors shadow-2xs cursor-pointer"
                              title={`Insert ${item.label}`}
                            >
                              + {item.tag}
                            </button>
                          ))}
                        </div>

                        <textarea
                          ref={textareaRef}
                          value={formData.templateBody}
                          onChange={e => setFormData({ ...formData, templateBody: e.target.value })}
                          placeholder="Enter the official certificate wording with placeholders..."
                          className="w-full min-h-[110px] rounded-lg border border-zinc-300 bg-white p-3 text-xs text-zinc-950 leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-900 font-sans"
                          required
                        />
                      </div>

                      {/* Signatory Labels */}
                      <div className="space-y-2 pt-2 border-t border-zinc-200">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                          Signatory Line Labels
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <span className="text-[10px] font-bold text-zinc-500 block">Left Line Label</span>
                            <Input 
                              value={formData.footerLeft} 
                              onChange={e => setFormData({ ...formData, footerLeft: e.target.value })} 
                              placeholder="e.g. Date of Issue" 
                              className="bg-white border-zinc-300 text-xs h-8" 
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-zinc-500 block">Center Line Label</span>
                            <Input 
                              value={formData.footerCenter} 
                              onChange={e => setFormData({ ...formData, footerCenter: e.target.value })} 
                              placeholder="e.g. Class Teacher" 
                              className="bg-white border-zinc-300 text-xs h-8" 
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-zinc-500 block">Right Line Label</span>
                            <Input 
                              value={formData.footerRight} 
                              onChange={e => setFormData({ ...formData, footerRight: e.target.value })} 
                              placeholder="e.g. Principal / Authorized Seal" 
                              className="bg-white border-zinc-300 text-xs h-8" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="space-y-1.5 pt-2 border-t border-zinc-200">
                        <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                          Template Status
                        </Label>
                        <select 
                          value={formData.status} 
                          onChange={e => setFormData({ ...formData, status: e.target.value })} 
                          className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs font-semibold cursor-pointer" 
                        >
                          <option value="Active">Active (Available for certificate issuing)</option>
                          <option value="Inactive">Inactive (Hidden from generator)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: VISIBLE FIELDS (KYA SHOW KARNA HAI, KYA HIDE KARNA HAI) */}
                  {templateModalTab === 'fields' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      {/* Presets Bar */}
                      <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-900">Quick Field Presets:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              showSchoolHeader: true,
                              showStudentPhoto: true,
                              showAdmissionNo: true,
                              showRollNo: true,
                              showClass: true,
                              showSection: true,
                              showFatherName: true,
                              showDob: true,
                              showGender: true,
                              showIssueDate: true,
                              showSeal: true,
                              showQrBarcode: true,
                              showSignatureLeft: true,
                              showSignatureCenter: true,
                              showSignatureRight: true
                            })}
                            className="px-2.5 py-1 text-[10px] font-bold bg-white text-amber-900 border border-amber-300 rounded-md hover:bg-amber-50 cursor-pointer shadow-2xs"
                          >
                            Show All Fields
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              showSchoolHeader: true,
                              showStudentPhoto: false,
                              showAdmissionNo: true,
                              showRollNo: false,
                              showClass: true,
                              showSection: false,
                              showFatherName: true,
                              showDob: false,
                              showGender: false,
                              showIssueDate: true,
                              showSeal: true,
                              showQrBarcode: true,
                              showSignatureLeft: true,
                              showSignatureCenter: false,
                              showSignatureRight: true
                            })}
                            className="px-2.5 py-1 text-[10px] font-bold bg-white text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-50 cursor-pointer shadow-2xs"
                          >
                            Formal Diploma
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              showSchoolHeader: true,
                              showStudentPhoto: false,
                              showAdmissionNo: true,
                              showRollNo: false,
                              showClass: true,
                              showSection: false,
                              showFatherName: false,
                              showDob: false,
                              showGender: false,
                              showIssueDate: true,
                              showSeal: true,
                              showQrBarcode: true,
                              showSignatureLeft: false,
                              showSignatureCenter: false,
                              showSignatureRight: true
                            })}
                            className="px-2.5 py-1 text-[10px] font-bold bg-white text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-50 cursor-pointer shadow-2xs"
                          >
                            Minimal Citation
                          </button>
                        </div>
                      </div>

                      {/* Field Toggles List */}
                      <div className="space-y-2">
                        {CERTIFICATE_FIELDS.map((fld) => {
                          const isEnabled = formData[fld.key] !== false;
                          const IconComp = fld.icon;
                          return (
                            <div
                              key={fld.key}
                              onClick={() => setFormData({ ...formData, [fld.key]: !isEnabled })}
                              className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                                isEnabled 
                                  ? 'bg-amber-50/40 border-amber-300' 
                                  : 'bg-zinc-50/70 border-zinc-200 opacity-60 hover:opacity-90'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  isEnabled ? 'bg-amber-600 text-white' : 'bg-zinc-200 text-zinc-500'
                                }`}>
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-xs text-zinc-950 flex items-center gap-1.5">
                                    {fld.label}
                                    {isEnabled && (
                                      <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                                        Visible
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-zinc-500">{fld.desc}</p>
                                </div>
                              </div>

                              {/* Toggle switch visual */}
                              <div className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                                isEnabled ? 'bg-amber-600 justify-end' : 'bg-zinc-300 justify-start'
                              }`}>
                                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </form>

                {/* Form Footer */}
                <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">
                    Changes reflect live on the certificate preview on right
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowFormModal(false)}
                      className="h-8 text-xs border-zinc-300 text-zinc-700 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      form="template-customizer-form"
                      disabled={submitting}
                      className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 rounded-lg shadow-xs cursor-pointer"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Save Template
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Real-Time Certificate Preview */}
              <div className="lg:col-span-5 bg-zinc-100/70 p-5 flex flex-col items-center justify-center shrink-0 overflow-y-auto">
                <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    Live Certificate Preview
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" /> Live
                  </span>
                </div>

                <div className="w-full py-2">
                  {renderCertificateGraphic(DEFAULT_SAMPLE_STUDENT, formData)}
                </div>

                <p className="text-[10px] text-zinc-400 text-center mt-3">
                  Toggling fields or changing wording instantly updates this certificate.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. ISSUE CERTIFICATE FOR STUDENT MODAL (KIS KE LIYE HAI, KIA LIKHA HAI) ── */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-5xl w-full my-6 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/80 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-600" />
                <div>
                  <h2 className="text-base font-bold text-zinc-950">Issue Official Student Certificate</h2>
                  <p className="text-[11px] text-zinc-500">
                    Select enrolled student, customize wording, and download PDF or print directly
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowIssueModal(false)} 
                className="text-zinc-400 hover:text-zinc-700 h-8 w-8 p-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 text-xs">
              {/* Left Column: Student Selection & Info */}
              <div className="lg:col-span-7 p-5 space-y-4 border-r border-zinc-200 overflow-y-auto max-h-[75vh]">
                {/* 1. Student Picker (Kis Ke Liye Hai) */}
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-700" />
                      Step 1: Choose Recipient Student (&ldquo;Kis Ky Liye Hai&rdquo;)
                    </Label>
                    {loadingStudents && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />}
                  </div>

                  <select
                    value={issueForm.studentId}
                    onChange={e => handleSelectStudentForIssue(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-amber-300 bg-white px-3 py-1.5 text-zinc-950 text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Choose Enrolled Student from Database --</option>
                    {studentsList.map(st => (
                      <option key={st._id} value={st._id}>
                        {st.firstName} {st.lastName} (Roll: {st.rollNo || '-'}, Adm: {st.admissionNo || '-'}, {st.className || 'Class 10'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Photo Upload Box */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-3">
                  <div className="w-14 h-16 rounded-lg border-2 border-amber-500 overflow-hidden bg-white shadow-2xs shrink-0 flex items-center justify-center">
                    {issueForm.studentPhoto ? (
                      <img src={issueForm.studentPhoto} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-zinc-900 block">Student Photo on Certificate</span>
                    <p className="text-[10px] text-zinc-500">Optional passport portrait badge.</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="issue-cert-photo-upload" 
                        className="hidden" 
                        onChange={handleIssuePhotoUpload} 
                      />
                      <label 
                        htmlFor="issue-cert-photo-upload"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-md cursor-pointer transition-colors shadow-2xs"
                      >
                        <Upload className="w-3 h-3" />
                        {issueForm.studentPhoto ? 'Change Photo' : 'Upload Photo'}
                      </label>
                      {issueForm.studentPhoto && (
                        <button
                          type="button"
                          onClick={() => setIssueForm({ ...issueForm, studentPhoto: '' })}
                          className="text-[10px] text-rose-600 hover:underline font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Credentials Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Student Full Name <span className="text-rose-500">*</span></Label>
                    <Input 
                      value={issueForm.studentName} 
                      onChange={e => setIssueForm({ ...issueForm, studentName: e.target.value })} 
                      className="bg-white border-zinc-300 text-xs" 
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Father / Guardian Name</Label>
                    <Input 
                      value={issueForm.fatherName} 
                      onChange={e => setIssueForm({ ...issueForm, fatherName: e.target.value })} 
                      className="bg-white border-zinc-300 text-xs" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Class Grade</Label>
                    <select
                      value={issueForm.className}
                      onChange={e => setIssueForm({ ...issueForm, className: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs font-semibold"
                    >
                      {STANDARD_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Section</Label>
                    <select
                      value={issueForm.section}
                      onChange={e => setIssueForm({ ...issueForm, section: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs font-semibold"
                    >
                      {STANDARD_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Admission No</Label>
                    <Input 
                      value={issueForm.admissionNo} 
                      onChange={e => setIssueForm({ ...issueForm, admissionNo: e.target.value })} 
                      className="bg-white border-zinc-300 text-xs font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-800">Roll Number</Label>
                    <Input 
                      value={issueForm.rollNo} 
                      onChange={e => setIssueForm({ ...issueForm, rollNo: e.target.value })} 
                      className="bg-white border-zinc-300 text-xs font-mono" 
                    />
                  </div>
                </div>

                {/* 3. Certificate Design & Wording (Kia Likha Hai) */}
                <div className="pt-3 border-t border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Step 2: Template Style & Wording (&ldquo;Kia Likha Hai&rdquo;)
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-zinc-700">Choose Certificate Template</Label>
                      <select
                        value={issueForm.templateId}
                        onChange={e => handleSelectTemplateForIssue(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs font-semibold"
                      >
                        <option value="">-- Custom / Active Template --</option>
                        {cards.map(c => (
                          <option key={c._id} value={c._id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-zinc-700">Design Border Theme</Label>
                      <select
                        value={issueForm.themeStyle}
                        onChange={e => setIssueForm({ ...issueForm, themeStyle: e.target.value })}
                        className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs font-semibold"
                      >
                        {THEME_STYLES.map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-zinc-700">Issue Date</Label>
                      <Input 
                        type="date"
                        value={issueForm.certificateDate} 
                        onChange={e => setIssueForm({ ...issueForm, certificateDate: e.target.value })} 
                        className="bg-white border-zinc-300 text-xs" 
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-zinc-700">Header Title</Label>
                      <Input 
                        value={issueForm.headerTitle} 
                        onChange={e => setIssueForm({ ...issueForm, headerTitle: e.target.value })} 
                        className="bg-white border-zinc-300 text-xs uppercase" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-zinc-700">Certificate Citation / Reason Text</Label>
                    <textarea 
                      value={issueForm.templateBody} 
                      onChange={e => setIssueForm({ ...issueForm, templateBody: e.target.value })} 
                      rows={3}
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-xs text-zinc-950 leading-relaxed font-sans" 
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowIssueModal(false)}
                    className="h-8 text-xs border-zinc-300 text-zinc-700 cursor-pointer"
                  >
                    Close
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => handleDownloadPDF(issueForm)}
                      className="h-8 text-xs border-zinc-300 text-zinc-800 hover:bg-zinc-100 font-bold px-3 rounded-lg cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Download PDF
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => handlePrintCertificate(issueForm)}
                      className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 rounded-lg shadow-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Print Certificate
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Real-Time Student Certificate Preview */}
              <div className="lg:col-span-5 bg-zinc-100/70 p-5 flex flex-col items-center justify-center shrink-0 overflow-y-auto">
                <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    Student Certificate Preview
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" /> Live
                  </span>
                </div>

                <div className="w-full py-2">
                  {renderCertificateGraphic(issueForm, issueForm)}
                </div>

                <p className="text-[10px] text-zinc-400 text-center mt-3">
                  This preview renders the student&apos;s real name, admission data, and customized wording.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. VIEW & PREVIEW MODAL (FULL SCREEN HIGH-RES) ── */}
      {viewingCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-4xl w-full my-6 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/70 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-700" />
                <div>
                  <h2 className="text-base font-bold text-zinc-950">{viewingCert.title}</h2>
                  <p className="text-[11px] text-zinc-500">Official certificate layout preview with sample student replacement</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDownloadCertificatePDF(DEFAULT_SAMPLE_STUDENT, viewingCert)}
                  className="h-8 text-xs border-zinc-300 text-zinc-800 hover:bg-zinc-100 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" /> PDF
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handlePrintCertificate({ ...DEFAULT_SAMPLE_STUDENT, ...viewingCert })}
                  className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewingCert(null)} 
                  className="text-zinc-400 hover:text-zinc-700 h-8 w-8 p-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Certificate Preview Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-zinc-100/60 flex items-center justify-center">
              {renderCertificateGraphic(DEFAULT_SAMPLE_STUDENT, viewingCert, true)}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50/70 flex items-center justify-between shrink-0">
              <span className="text-xs text-zinc-500">Theme: {THEME_STYLES.find(t => t.id === viewingCert.themeStyle)?.label || viewingCert.themeStyle}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewingCert(null)}
                className="text-xs cursor-pointer"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. DELETE CONFIRMATION MODAL ── */}
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
              Are you sure you want to permanently delete the certificate template <strong className="text-zinc-900">&ldquo;{deleteConfirmItem.title}&rdquo;</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteConfirmItem(null)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                Delete Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. DEDICATED PRINT PORTAL (ISOLATED - ONLY CERTIFICATE PRINTS) ── */}
      <div id="certificate-print-portal" className="hidden">
        {printPortalRecord && renderCertificateGraphic(printPortalRecord, printPortalRecord, true)}
      </div>

      {/* PRINT-ONLY STYLESHEET */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }

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

          #certificate-print-portal,
          #certificate-print-portal * {
            visibility: visible !important;
          }

          #certificate-print-portal {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100vh !important;
            padding: 8mm !important;
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
