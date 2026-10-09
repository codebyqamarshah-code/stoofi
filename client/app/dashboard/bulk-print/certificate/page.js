'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ChevronRight, 
  Search, 
  Printer, 
  Award, 
  User, 
  CheckSquare, 
  Square, 
  Building, 
  Loader2, 
  FileCheck, 
  Download, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  ExternalLink, 
  Settings, 
  RefreshCw, 
  X, 
  Calendar, 
  Layers, 
  Eye, 
  CheckCircle2, 
  Filter,
  Crown,
  Medal,
  ShieldCheck,
  QrCode,
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { SearchableSelect } from '@/components/ui/searchable-select';

// 5 Standard Certificate Designs Config
const CERTIFICATE_DESIGNS = [
  {
    id: 'classic-gold',
    num: '1',
    name: 'Imperial Classical Gold',
    type: 'Academic Excellence / Merit',
    color: 'from-amber-600 to-yellow-800',
    border: 'border-amber-600',
    badge: 'Imperial Gold',
    desc: 'Ornate vintage gold guilloche border with official gold seal & ribbons'
  },
  {
    id: 'stoofi-emerald',
    num: '2',
    name: 'Modern Emerald Excellence',
    type: 'Character Certificate',
    color: 'from-emerald-700 to-teal-900',
    border: 'border-emerald-700',
    badge: 'Modern Emerald',
    desc: 'Geometric emerald prestige layout with verified QR code badge'
  },
  {
    id: 'royal-navy',
    num: '3',
    name: 'Royal Navy Diploma',
    type: 'Transfer Certificate',
    color: 'from-sky-900 to-indigo-950',
    border: 'border-sky-900',
    badge: 'Royal Diploma',
    desc: 'Formal parchment diploma with gold filigree and authorized clearance seal'
  },
  {
    id: 'crimson-merit',
    num: '4',
    name: 'Crimson Sports & Merit',
    type: 'Sports & Extracurricular',
    color: 'from-rose-800 to-red-950',
    border: 'border-rose-700',
    badge: 'Sports Champion',
    desc: 'Victory golden laurel wreath, star emblems, and tournament citation'
  },
  {
    id: 'minimal-tech',
    num: '5',
    name: 'Minimalist Digital Verified',
    type: 'Appreciation Certificate',
    color: 'from-zinc-800 to-black',
    border: 'border-zinc-800',
    badge: 'Digital Credential',
    desc: 'Modern Swiss minimalist credential with verified cryptographic ID'
  }
];

function GenerateCertificateContent() {
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get('templateId') || searchParams.get('id');

  // Database Resources
  const [templates, setTemplates] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [schoolSetting, setSchoolSetting] = useState(null);
  
  // Criteria & Filters
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [activeDesignId, setActiveDesignId] = useState('classic-gold');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('2026 [Jan-Dec]');
  const [certDate, setCertDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchStudentText, setSearchStudentText] = useState('');

  // Student list & Selection
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Single Student Preview Modal
  const [previewStudent, setPreviewStudent] = useState(null);

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial templates, classes, sections, settings
  const fetchInitialData = async () => {
    try {
      setLoadingInitial(true);
      setError(null);

      const [certRes, clsRes, secRes, setRes] = await Promise.all([
        api.get('/certificate?status=Active&all=true').catch(() => null),
        api.get('/class').catch(() => null),
        api.get('/section').catch(() => null),
        api.get('/setting').catch(() => null)
      ]);

      let loadedTemplates = [];
      if (certRes?.success && Array.isArray(certRes.data)) {
        loadedTemplates = certRes.data;
        setTemplates(loadedTemplates);
        
        if (templateIdParam && loadedTemplates.some(t => t._id === templateIdParam)) {
          setSelectedTemplateId(templateIdParam);
        } else if (loadedTemplates.length > 0) {
          setSelectedTemplateId(loadedTemplates[0]._id);
        }
      }

      if (clsRes?.success && Array.isArray(clsRes.data)) {
        setClasses(clsRes.data.map(c => typeof c === 'string' ? c : c.name).filter(Boolean));
      }

      if (secRes?.success && Array.isArray(secRes.data)) {
        setSections(secRes.data.map(s => typeof s === 'string' ? s : s.name).filter(Boolean));
      }

      if (setRes?.success && setRes.data) {
        setSchoolSetting(setRes.data);
        if (setRes.data.academicYear && !sessionFilter) {
          setSessionFilter(setRes.data.academicYear);
        }
      }
    } catch (err) {
      console.error('Error initializing generator:', err);
      setError('Unable to load initial certificate resources. Please try again.');
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Sync design with template selection
  useEffect(() => {
    if (selectedTemplateId) {
      const match = templates.find(t => t._id === selectedTemplateId);
      if (match && match.themeStyle) {
        setActiveDesignId(match.themeStyle);
      }
    }
  }, [selectedTemplateId, templates]);

  // Fetch real students from MongoDB
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      setError(null);

      const params = new URLSearchParams({
        limit: '1000'
      });

      if (classFilter && classFilter !== 'All Classes' && classFilter !== 'All') {
        params.append('className', classFilter);
      }
      if (sectionFilter && sectionFilter !== 'All Sections' && sectionFilter !== 'All') {
        params.append('section', sectionFilter);
      }
      if (searchStudentText.trim()) {
        params.append('search', searchStudentText.trim());
      }

      const res = await api.get(`/student?${params.toString()}`).catch(() => null);

      if (res?.success && Array.isArray(res.data)) {
        setStudents(res.data);
        setSelectedIds(res.data.map(s => s._id));
      } else {
        setStudents([]);
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Error fetching students for certificates:', err);
      setError('Failed to fetch students. Please try again.');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classFilter, sectionFilter]);

  // Active Template
  const activeTemplate = useMemo(() => {
    if (selectedTemplateId) {
      const t = templates.find(item => item._id === selectedTemplateId);
      if (t) return t;
    }
    const currentDesign = CERTIFICATE_DESIGNS.find(d => d.id === activeDesignId) || CERTIFICATE_DESIGNS[0];
    return {
      title: currentDesign.name,
      type: currentDesign.type,
      headerTitle: currentDesign.name.toUpperCase(),
      headerSubtitle: 'TO WHOM IT MAY CONCERN',
      templateBody: 'This is to officially certify that [student_name], Son/Daughter of [father_name], bearing Admission No [admission_no] and Roll No [roll_no], of Class [class_name] (Section [section]) in this institution has achieved commendable academic performance and conduct during the Academic Session [academic_session]. We wish them great success in all future pursuits.',
      footerLeft: 'Date of Issue',
      footerCenter: 'Class Teacher',
      footerRight: 'Principal & Authorized Seal',
      themeStyle: activeDesignId
    };
  }, [templates, selectedTemplateId, activeDesignId]);

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    if (selectedIds.length === 0) {
      showToast('Please select at least one student to generate certificates.', true);
      return;
    }
    window.print();
  };

  const selectedStudents = students.filter(s => selectedIds.includes(s._id));
  const schoolName = schoolSetting?.schoolName || 'Stoofi Public School & College';
  const schoolAddress = schoolSetting?.address || schoolSetting?.city || 'Main Campus, Lahore, Pakistan';
  const currentDesign = CERTIFICATE_DESIGNS.find(d => d.id === activeDesignId) || CERTIFICATE_DESIGNS[0];

  // Helper to replace dynamic placeholders
  const formatCertificateText = (rawText, student) => {
    if (!rawText) return '';
    const stName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.name || 'Muhammad Rayyan';
    const fName = student.fatherName || 'Tariq Mehmood';
    const admNo = student.admissionNo || 'ADM-2026-101';
    const rollNo = student.rollNo || '101';
    const clsName = student.className || 'Class 10';
    const secName = student.section || 'A';
    const formattedDate = new Date(certDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedDob = student.dob ? new Date(student.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '15 August 2010';

    return rawText
      .split('[student_name]').join(stName)
      .split('[father_name]').join(fName)
      .split('[admission_no]').join(admNo)
      .split('[roll_no]').join(rollNo)
      .split('[class_name]').join(clsName)
      .split('[section]').join(secName)
      .split('[academic_session]').join(sessionFilter || '2026 [Jan-Dec]')
      .split('[academic_year]').join(sessionFilter || '2026 [Jan-Dec]')
      .split('[dob]').join(formattedDob)
      .split('[gender]').join(student.gender || 'Student')
      .split('[school_name]').join(schoolName)
      .split('[school_address]').join(schoolAddress)
      .split('[certificate_date]').join(formattedDate)
      .split('[issue_date]').join(formattedDate)
      .split('[tc_no]').join(`TC-${student.admissionNo || '2026-084'}`);
  };

  // Helper to Render High-Resolution Certificate in Selected Design
  const renderCertificateGraphic = (student, isInspect = false) => {
    const stName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.name || 'Muhammad Rayyan';
    const fName = student.fatherName || 'Tariq Mehmood';
    const admNo = student.admissionNo || 'ADM-2026-101';
    const rollNo = student.rollNo || '101';
    const clsName = student.className || 'Class 10';
    const secName = student.section || 'A';
    const formattedDate = new Date(certDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedBody = formatCertificateText(activeTemplate.templateBody, student);

    // ── DESIGN 1: Imperial Classical Gold Excellence ──
    if (activeDesignId === 'classic-gold') {
      return (
        <div className={`bg-[#fffdf8] text-zinc-900 border-8 border-double border-amber-600 p-8 sm:p-12 rounded-3xl shadow-xl w-full ${isInspect ? 'max-w-4xl' : 'max-w-full'} flex flex-col justify-between relative overflow-hidden select-none certificate-page`}>
          {/* Ornate Corner Accents */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500"></div>
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-500"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-500"></div>
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-500"></div>

          {/* Header */}
          <div className="text-center relative z-10">
            <div className="flex items-center justify-center gap-2 text-amber-700 font-serif text-xs uppercase tracking-widest font-bold mb-1">
              <Crown className="w-5 h-5 text-amber-600" />
              <span>{schoolName}</span>
            </div>
            <p className="text-[10px] text-zinc-500 tracking-wide">{schoolAddress}</p>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-3"></div>
            
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-amber-950 tracking-wider uppercase">
              {activeTemplate.headerTitle || 'Certificate of Academic Excellence'}
            </h2>
            <p className="text-xs font-semibold text-amber-800/80 uppercase tracking-widest mt-1">
              {activeTemplate.headerSubtitle || 'FOR OUTSTANDING SCHOLASTIC DISTINCTION'}
            </p>
          </div>

          {/* Body */}
          <div className="my-8 text-center space-y-4 relative z-10">
            <p className="text-xs uppercase text-zinc-500 font-bold tracking-widest">This Certificate is Proudly Bestowed Upon</p>
            <div className="text-2xl sm:text-3xl font-serif font-black text-amber-950 underline decoration-amber-400 underline-offset-8 capitalize">
              {stName}
            </div>
            <p className="text-xs font-semibold text-zinc-600">
              Son/Daughter of <strong className="text-zinc-900">{fName}</strong> | Admission No: <strong className="text-zinc-900">{admNo}</strong> | Roll No: <strong className="text-zinc-900">{rollNo}</strong>
            </p>
            <p className="text-sm text-zinc-700 max-w-2xl mx-auto leading-relaxed font-serif pt-2 italic">
              &quot;{formattedBody}&quot;
            </p>
          </div>

          {/* Footer & Gold Seal */}
          <div className="flex items-end justify-between pt-8 border-t border-amber-200/80 relative z-10">
            <div className="text-center">
              <div className="text-xs font-bold text-zinc-800">{formattedDate}</div>
              <div className="w-28 h-0.5 bg-zinc-400 mt-1 mb-0.5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerLeft || 'Date of Issue'}</p>
            </div>

            {/* Gold Ribbon Seal Graphic */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 shadow-md border-2 border-amber-200 flex items-center justify-center text-white font-serif font-bold text-center text-[9px] uppercase leading-tight p-1">
                Official Seal
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-bold text-amber-950 font-serif italic">Principal Signature</div>
              <div className="w-36 h-0.5 bg-amber-600 mt-1 mb-0.5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerRight || 'Principal & Authorized Seal'}</p>
            </div>
          </div>
        </div>
      );
    }

    // ── DESIGN 2: Modern Emerald Excellence ──
    if (activeDesignId === 'stoofi-emerald') {
      return (
        <div className={`bg-white text-zinc-900 border-4 border-emerald-700 p-8 sm:p-12 rounded-3xl shadow-xl w-full ${isInspect ? 'max-w-4xl' : 'max-w-full'} flex flex-col justify-between relative overflow-hidden select-none certificate-page`}>
          {/* Emerald Top Stripe */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-700 to-teal-800"></div>

          <div className="text-center relative z-10 pt-2">
            <div className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{schoolName}</span>
            </div>
            <p className="text-[10px] text-zinc-500">{schoolAddress}</p>
            
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight uppercase mt-3">
              {activeTemplate.headerTitle || 'Character & Conduct Certificate'}
            </h2>
            <span className="inline-block mt-1 px-3 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {activeTemplate.headerSubtitle || 'TO WHOM IT MAY CONCERN'}
            </span>
          </div>

          <div className="my-8 text-center space-y-3 relative z-10">
            <p className="text-xs uppercase text-zinc-500 font-bold">This is to officially certify that</p>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight capitalize">
              {stName}
            </div>
            <div className="inline-flex items-center gap-3 text-xs font-semibold text-zinc-600 bg-emerald-50/60 px-4 py-1.5 rounded-full border border-emerald-100">
              <span>Adm No: <strong className="text-emerald-950">{admNo}</strong></span>
              <span>•</span>
              <span>Class: <strong className="text-emerald-950">{clsName} ({secName})</strong></span>
              <span>•</span>
              <span>Session: <strong className="text-emerald-950">{sessionFilter}</strong></span>
            </div>
            <p className="text-sm text-zinc-700 max-w-2xl mx-auto leading-relaxed pt-3 font-medium">
              {formattedBody}
            </p>
          </div>

          <div className="flex items-end justify-between pt-8 border-t border-emerald-100 relative z-10">
            <div className="text-center">
              <div className="text-xs font-bold text-zinc-800">{formattedDate}</div>
              <div className="w-28 h-0.5 bg-emerald-600 mt-1 mb-0.5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerLeft || 'Date of Issue'}</p>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>VERIFIED STOOFI ID: {admNo}</span>
            </div>

            <div className="text-center">
              <div className="text-xs font-bold text-emerald-950">Head of Institution</div>
              <div className="w-36 h-0.5 bg-emerald-700 mt-1 mb-0.5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerRight || 'Principal Signature'}</p>
            </div>
          </div>
        </div>
      );
    }

    // ── DESIGN 3: Royal Navy Diploma ──
    if (activeDesignId === 'royal-navy') {
      return (
        <div className={`bg-[#f9fafc] text-zinc-900 border-6 border-sky-950 p-8 sm:p-12 rounded-2xl shadow-xl w-full ${isInspect ? 'max-w-4xl' : 'max-w-full'} flex flex-col justify-between relative overflow-hidden select-none certificate-page`}>
          <div className="absolute inset-2 border-2 border-amber-500/80 rounded-lg pointer-events-none"></div>

          <div className="text-center relative z-10">
            <div className="text-xs font-black uppercase text-sky-900 tracking-widest">{schoolName}</div>
            <p className="text-[10px] text-zinc-500">{schoolAddress}</p>
            
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-sky-950 tracking-wider uppercase mt-3">
              {activeTemplate.headerTitle || 'School Leaving & Transfer Diploma'}
            </h2>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mt-1">
              {activeTemplate.headerSubtitle || 'OFFICIAL RECORD OF CLEARANCE & ADVANCEMENT'}
            </p>
          </div>

          <div className="my-8 text-center space-y-3 relative z-10">
            <p className="text-xs uppercase text-zinc-500 font-bold">This is to certify that</p>
            <div className="text-2xl sm:text-3xl font-serif font-black text-sky-950 capitalize">
              {stName}
            </div>
            <p className="text-xs font-semibold text-zinc-600">
              Father Name: <strong className="text-zinc-900">{fName}</strong> | Class: <strong className="text-sky-900">{clsName} ({secName})</strong>
            </p>
            <p className="text-sm text-zinc-700 max-w-2xl mx-auto leading-relaxed pt-2 font-serif">
              {formattedBody}
            </p>
          </div>

          <div className="flex items-end justify-between pt-8 border-t border-sky-200 relative z-10">
            <div className="text-center">
              <div className="text-xs font-bold text-zinc-800">{formattedDate}</div>
              <div className="w-28 h-0.5 bg-sky-900 mt-1 mb-0.5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerLeft || 'Prepared By / Date'}</p>
            </div>

            <div className="text-center">
              <div className="text-xs font-bold text-sky-950 font-serif">Checked by Administration</div>
              <div className="w-36 h-0.5 bg-sky-900 mt-1 mb-0.5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerCenter || 'Administrative Seal'}</p>
            </div>

            <div className="text-center">
              <div className="text-xs font-bold text-sky-950 font-serif">Principal & Registrar</div>
              <div className="w-36 h-0.5 bg-sky-950 mt-1 mb-0.5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerRight || 'Authorized Signatory'}</p>
            </div>
          </div>
        </div>
      );
    }

    // ── DESIGN 4: Crimson Sports & Merit ──
    if (activeDesignId === 'crimson-merit') {
      return (
        <div className={`bg-[#fffbfb] text-zinc-900 border-4 border-rose-800 p-8 sm:p-12 rounded-3xl shadow-xl w-full ${isInspect ? 'max-w-4xl' : 'max-w-full'} flex flex-col justify-between relative overflow-hidden select-none certificate-page`}>
          <div className="text-center relative z-10">
            <div className="text-xs font-black uppercase text-rose-900 tracking-wider flex items-center justify-center gap-1.5">
              <Medal className="w-5 h-5 text-amber-500" />
              <span>{schoolName}</span>
            </div>
            <p className="text-[10px] text-zinc-500">{schoolAddress}</p>
            
            <h2 className="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight uppercase mt-3">
              {activeTemplate.headerTitle || 'Certificate of Sports & Merit'}
            </h2>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mt-1">
              {activeTemplate.headerSubtitle || 'EXCELLENCE IN ATHLETICS & SPORTSMANSHIP'}
            </p>
          </div>

          <div className="my-8 text-center space-y-3 relative z-10">
            <p className="text-xs uppercase text-zinc-500 font-bold">Proudly Awarded to Champion</p>
            <div className="text-2xl sm:text-3xl font-black text-rose-950 capitalize">
              {stName}
            </div>
            <p className="text-xs font-bold text-rose-900 bg-rose-50 inline-block px-4 py-1 rounded-full border border-rose-200">
              Admission No: {admNo} | Class: {clsName} ({secName})
            </p>
            <p className="text-sm text-zinc-700 max-w-2xl mx-auto leading-relaxed pt-2 font-medium">
              {formattedBody}
            </p>
          </div>

          <div className="flex items-end justify-between pt-8 border-t border-rose-200 relative z-10">
            <div className="text-center">
              <div className="text-xs font-bold text-zinc-800">{formattedDate}</div>
              <div className="w-28 h-0.5 bg-rose-800 mt-1 mb-0.5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerLeft || 'Date of Event'}</p>
            </div>

            <div className="text-center">
              <div className="text-xs font-bold text-rose-950">Sports Coordinator</div>
              <div className="w-32 h-0.5 bg-rose-800 mt-1 mb-0.5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerCenter || 'Sports Director'}</p>
            </div>

            <div className="text-center">
              <div className="text-xs font-bold text-rose-950">Principal / Patron</div>
              <div className="w-36 h-0.5 bg-rose-800 mt-1 mb-0.5"></div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerRight || 'Principal Seal'}</p>
            </div>
          </div>
        </div>
      );
    }

    // ── DESIGN 5: Minimalist Digital Verified Certificate ──
    return (
      <div className={`bg-white text-zinc-900 border-2 border-zinc-900 p-8 sm:p-12 rounded-2xl shadow-xl w-full ${isInspect ? 'max-w-4xl' : 'max-w-full'} flex flex-col justify-between relative overflow-hidden select-none certificate-page`}>
        <div className="text-center relative z-10">
          <div className="text-xs font-extrabold uppercase text-zinc-900 tracking-widest flex items-center justify-center gap-1.5">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            <span>{schoolName}</span>
          </div>
          <p className="text-[10px] text-zinc-500">{schoolAddress}</p>
          
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight uppercase mt-3">
            {activeTemplate.headerTitle || 'Certificate of Appreciation'}
          </h2>
          <span className="inline-block mt-1 px-3 py-0.5 text-[10px] font-bold uppercase rounded bg-zinc-100 text-zinc-800 border border-zinc-300">
            {activeTemplate.headerSubtitle || 'IN RECOGNITION OF VALUABLE CONTRIBUTIONS'}
          </span>
        </div>

        <div className="my-8 text-center space-y-3 relative z-10">
          <p className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">This credential is presented to</p>
          <div className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight capitalize">
            {stName}
          </div>
          <div className="text-xs font-mono text-zinc-600">
            Admission No: <strong>{admNo}</strong> | Class: <strong>{clsName} ({secName})</strong>
          </div>
          <p className="text-sm text-zinc-700 max-w-2xl mx-auto leading-relaxed pt-2">
            {formattedBody}
          </p>
        </div>

        <div className="flex items-end justify-between pt-8 border-t border-zinc-200 relative z-10">
          <div className="text-center">
            <div className="text-xs font-bold text-zinc-800 font-mono">{formattedDate}</div>
            <div className="w-28 h-0.5 bg-zinc-900 mt-1 mb-0.5"></div>
            <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerLeft || 'Date of Presentation'}</p>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
            <QrCode className="w-4 h-4 text-zinc-900" />
            <span>ID: STO-CERT-{student._id ? String(student._id).slice(-6).toUpperCase() : '2026-X'}</span>
          </div>

          <div className="text-center">
            <div className="text-xs font-bold text-zinc-950">Principal & Authorized Seal</div>
            <div className="w-36 h-0.5 bg-zinc-900 mt-1 mb-0.5"></div>
            <p className="text-[10px] text-zinc-500 uppercase font-semibold">{activeTemplate.footerRight || 'Digital Authorized Sign'}</p>
          </div>
        </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Award className="w-6 h-6 text-zinc-900" />
            Generate Certificates
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Select from 5 certificate designs, filter enrolled students, and download or print high-resolution certificates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/dashboard/admin/certificate"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold hover:bg-zinc-50 transition-colors shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-500" />
            Certificate Templates ({templates.length})
          </Link>
          <div className="hidden md:flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg">
            <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-700 transition-colors">Admin Section</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-semibold">Generate Certificate</span>
          </div>
        </div>
      </div>

      {/* ── 5 INTERACTIVE CERTIFICATE DESIGN SELECTOR TABS ── */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl p-5 print:hidden">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Step 1: Choose Certificate Design (5 Available Layouts)
            </h2>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Active: {currentDesign.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CERTIFICATE_DESIGNS.map((design) => {
            const isSelected = activeDesignId === design.id;
            return (
              <button
                key={design.id}
                type="button"
                onClick={() => {
                  setActiveDesignId(design.id);
                  const match = templates.find(t => t.themeStyle === design.id);
                  if (match) setSelectedTemplateId(match._id);
                }}
                className={`text-left p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    isSelected ? 'bg-amber-600 text-white' : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    Design {design.num}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">{design.badge}</span>
                </div>

                <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${design.color} mb-2.5`}></div>

                <div className="font-bold text-xs text-zinc-900 leading-tight mb-1">{design.name}</div>
                <p className="text-[10px] text-zinc-500 leading-snug line-clamp-2">{design.desc}</p>

                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-amber-200 flex items-center gap-1 text-[10px] font-bold text-amber-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Selected Design
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SEARCH CRITERIA & FILTERS ── */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl p-5 space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Step 2: Filter Students & Issue Date
          </h2>
          <span className="text-xs text-zinc-400">Real-time Student Database</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Design Template Dropdown */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700">Design Template <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              name="selectedTemplateId"
              value={selectedTemplateId} 
              onChange={e => setSelectedTemplateId(e.target.value)}
              options={CERTIFICATE_DESIGNS.map(d => ({ value: d.id, label: `Design ${d.num}: ${d.name}` }))}
              placeholder="Select Template..."
            />
          </div>

          {/* Class Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700">Class Filter</Label>
            <SearchableSelect
              name="classFilter"
              value={classFilter} 
              onChange={e => setClassFilter(e.target.value)}
              options={[{ value: '', label: 'All Classes' }, ...classes.map(c => ({ value: c, label: c }))]}
              placeholder="All Classes"
            />
          </div>

          {/* Section Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700">Section Filter</Label>
            <SearchableSelect
              name="sectionFilter"
              value={sectionFilter} 
              onChange={e => setSectionFilter(e.target.value)}
              options={[{ value: '', label: 'All Sections' }, ...sections.map(s => ({ value: s, label: s }))]}
              placeholder="All Sections"
            />
          </div>

          {/* Issue Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700">Certificate Issue Date</Label>
            <Input
              type="date"
              value={certDate}
              onChange={e => setCertDate(e.target.value)}
              className="h-9 text-xs bg-white border-zinc-300 text-zinc-950"
            />
          </div>
        </div>

        {/* Quick Search Student by Text */}
        <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input
              value={searchStudentText}
              onChange={e => setSearchStudentText(e.target.value)}
              placeholder="Search by student name, admission number, roll number..."
              className="pl-8 h-9 text-xs bg-white border-zinc-300 text-zinc-950 focus-visible:ring-1 focus-visible:ring-zinc-900"
            />
            {searchStudentText && (
              <button 
                onClick={() => setSearchStudentText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            type="button"
            onClick={fetchStudents}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs h-9 px-4 shrink-0"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" /> Filter
          </Button>
        </div>
      </div>

      {/* ── ACTION BAR & PRINT TOOLS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-zinc-200 shadow-xs rounded-2xl p-4 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={toggleSelectAll} 
            className="flex items-center gap-2 text-xs font-semibold text-zinc-950 hover:text-zinc-700 cursor-pointer"
          >
            {selectedIds.length === students.length && students.length > 0 ? (
              <CheckSquare className="h-4 w-4 text-amber-600" />
            ) : (
              <Square className="h-4 w-4 text-zinc-400" />
            )}
            Select All ({students.length})
          </button>
          <span className="text-xs text-zinc-300">|</span>
          <span className="text-xs text-zinc-500">
            Selected for Print: <strong className="text-zinc-950 font-bold">{selectedStudents.length}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handlePrint}
            disabled={selectedStudents.length === 0}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9 text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Selected Certificates ({selectedStudents.length})
          </Button>
        </div>
      </div>

      {/* ── STUDENTS LIST TABLE (UI VIEW) ── */}
      {loadingStudents ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-500 print:hidden">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-amber-600" />
          <p className="text-sm font-semibold">Loading students for certificate generation...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-500 print:hidden">
          <Award className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
          <h3 className="text-sm font-bold text-zinc-800">No Students Found</h3>
          <p className="text-xs text-zinc-500 mt-1">Please select an academic class or adjust your search filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">Select</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Class (Section)</th>
                  <th className="py-3 px-4">Father Name</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {students.map((student) => {
                  const isSelected = selectedIds.includes(student._id);
                  const stName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.name || 'Muhammad Rayyan';

                  return (
                    <tr 
                      key={student._id}
                      onClick={() => toggleSelect(student._id)}
                      className={`hover:bg-zinc-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => toggleSelect(student._id)}>
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Square className="h-4 w-4 text-zinc-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-700">
                          {stName.charAt(0)}
                        </div>
                        {stName}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-900 font-bold">{student.admissionNo || '—'}</td>
                      <td className="py-3 px-4 text-zinc-700">{student.rollNo || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-800">
                          {student.className || '—'} {student.section ? `(${student.section})` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-700">{student.fatherName || '—'}</td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewStudent(student)}
                          className="h-7 text-xs text-amber-800 hover:bg-amber-50 hover:text-amber-900 px-2"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Preview Certificate
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PRINT RENDERING (HIDDEN ON SCREEN, VISIBLE ON PRINT) ── */}
      <div className="hidden print:block space-y-12">
        {selectedStudents.map(student => (
          <div key={student._id} className="page-break-after">
            {renderCertificateGraphic(student, false)}
          </div>
        ))}
      </div>

      {/* ── SINGLE CERTIFICATE PREVIEW MODAL ── */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-sm text-zinc-900">
                  Certificate Preview — {previewStudent.firstName} {previewStudent.lastName} ({currentDesign.name})
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewStudent(null)} 
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center bg-zinc-100/60 overflow-y-auto">
              {renderCertificateGraphic(previewStudent, true)}
            </div>

            <div className="p-4 border-t border-zinc-100 flex items-center justify-end gap-2 bg-white">
              <Button 
                variant="outline" 
                onClick={() => setPreviewStudent(null)} 
                className="h-9 text-xs border-zinc-200 text-zinc-700"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setSelectedIds([previewStudent._id]);
                  setTimeout(() => window.print(), 200);
                }}
                className="h-9 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" /> Print This Certificate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINT-ONLY STYLESHEET ── */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, aside, header, footer, .sidebar, .navbar, .print\\:hidden {
            display: none !important;
          }
          .certificate-page {
            page-break-inside: avoid !important;
            page-break-after: always !important;
            width: 100% !important;
            height: 96vh !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function BulkPrintCertificatePage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-zinc-500">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-zinc-400" />
        <span className="text-xs font-semibold">Loading certificates generator...</span>
      </div>
    }>
      <GenerateCertificateContent />
    </Suspense>
  );
}
