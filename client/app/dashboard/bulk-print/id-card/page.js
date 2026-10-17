'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Printer, 
  CreditCard, 
  User, 
  Users,
  CheckSquare, 
  Square, 
  Building, 
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  QrCode,
  Sparkles,
  Layers,
  X,
  FileCheck,
  CheckCircle2,
  Download,
  Award,
  Crown,
  Sparkle,
  BadgeCheck,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic, STANDARD_ACADEMIC_CLASSES, STANDARD_SECTIONS_LIST } from '@/lib/academicUtils';
import api from '@/services/api';
import { downloadIdCardPDF, downloadBatchIdCardsPDF } from '@/lib/idCardPdf';
import { formatDateDMY, getPublicVerificationUrl, formatStudentRollNo } from '@/lib/utils';
import QRCode from 'qrcode';

// Dynamic Live QR Code Component for Every Student Card (Scannable on all phones)
function StudentCardQR({ rec, isDark = false }) {
  const [qrSrc, setQrSrc] = useState('');
  useEffect(() => {
    if (!rec) return;
    const identifier = rec.admissionNo || rec.rollNo || rec._id || 'PRC260001';
    const verifyUrl = getPublicVerificationUrl(identifier);

    QRCode.toDataURL(verifyUrl, { 
      margin: 1, 
      width: 220, 
      errorCorrectionLevel: 'M',
      color: { 
        dark: isDark ? '#ffffff' : '#084A86', 
        light: isDark ? '#09090b' : '#ffffff' 
      } 
    })
      .then(setQrSrc)
      .catch(() => {});
  }, [rec, isDark]);

  if (!qrSrc) {
    return <div className="w-14 h-14 bg-zinc-100 rounded border border-zinc-200 animate-pulse" />;
  }
  return (
    <img 
      src={qrSrc} 
      alt="Verification QR" 
      className={`w-14 h-14 object-contain rounded border p-0.5 shadow-2xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`} 
      title="Scan to verify student details"
    />
  );
}

// 5 Standard Design Styles Config
const CARD_DESIGNS = [
  {
    id: 'stoofi-emerald',
    num: '1',
    name: 'Modern Emerald Badge',
    layout: 'vertical',
    color: 'from-emerald-700 to-teal-900',
    border: 'border-emerald-600',
    badge: 'Vertical Badge',
    desc: 'Modern school badge with emerald accents, student avatar & QR'
  },
  {
    id: 'classic-navy',
    num: '2',
    name: 'Executive Navy Smart Card',
    layout: 'horizontal',
    color: 'from-sky-900 to-indigo-950',
    border: 'border-sky-800',
    badge: 'Horizontal Smart Card',
    desc: 'Classic horizontal layout with dual photo & bio data columns'
  },
  {
    id: 'royal-purple',
    num: '3',
    name: 'Royal Academic Pass',
    layout: 'vertical',
    color: 'from-purple-800 to-indigo-900',
    border: 'border-purple-600',
    badge: 'Vertical Academic Pass',
    desc: 'Royal academic gradient badge with distinct class tags & barcode'
  },
  {
    id: 'dark-slate',
    num: '4',
    name: 'Dark Luxury Obsidian Card',
    layout: 'vertical',
    color: 'from-zinc-900 to-black',
    border: 'border-zinc-700',
    badge: 'Dark Obsidian Edition',
    desc: 'High-contrast luxury dark theme with digital smart chip'
  },
  {
    id: 'crimson-gold',
    num: '5',
    name: 'Heritage Crimson & Gold Crest',
    layout: 'vertical',
    color: 'from-rose-950 to-amber-950',
    border: 'border-amber-600',
    badge: 'Heritage Gold Crest',
    desc: 'Traditional college heraldic design with gold double-borders'
  }
];

export default function BulkPrintIdCardPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [activeDesignId, setActiveDesignId] = useState('classic-navy');
  const [role, setRole] = useState('Student');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize with standard academic classes & sections so they are immediately available
  const [classes, setClasses] = useState(STANDARD_ACADEMIC_CLASSES);
  const [sections, setSections] = useState(STANDARD_SECTIONS_LIST);
  const [records, setRecords] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolSetting, setSchoolSetting] = useState(null);

  // Layout & View Options
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [previewCard, setPreviewCard] = useState(null);
  const [printPortalRecords, setPrintPortalRecords] = useState([]);

  // Initial Metadata & Records Fetch
  useEffect(() => {
    fetchMetadata();
    executeSearch('Student', '', '');
  }, []);

  // Sync template with active design selection
  useEffect(() => {
    if (selectedTemplateId) {
      const match = templates.find(t => t._id === selectedTemplateId);
      if (match && match.themeStyle) {
        setActiveDesignId(match.themeStyle);
      }
    }
  }, [selectedTemplateId, templates]);

  // When role changes, auto-select matching template and refresh records
  useEffect(() => {
    const matchingTemplate = templates.find(t => t.role === role && t.status === 'Active');
    if (matchingTemplate) {
      setSelectedTemplateId(matchingTemplate._id);
      if (matchingTemplate.themeStyle) {
        setActiveDesignId(matchingTemplate.themeStyle);
      }
    }
    executeSearch(role, classFilter, sectionFilter);
  }, [role, templates]);

  const fetchMetadata = async () => {
    try {
      const [tplRes, clsRes, secRes, setRes] = await Promise.all([
        api.get('/id-card?status=Active').catch(() => null),
        api.get('/class').catch(() => null),
        api.get('/section').catch(() => null),
        api.get('/setting').catch(() => null)
      ]);

      let availableTemplates = [];
      if (tplRes?.success && Array.isArray(tplRes.data) && tplRes.data.length > 0) {
        availableTemplates = tplRes.data;
      } else {
        availableTemplates = [
          { _id: 'tpl-emerald', title: 'Modern Emerald Vertical Badge', role: 'Student', themeStyle: 'stoofi-emerald', status: 'Active' },
          { _id: 'tpl-navy', title: 'Executive Navy Horizontal Smart Card', role: 'Student', themeStyle: 'classic-navy', status: 'Active' },
          { _id: 'tpl-purple', title: 'Royal Purple Academic Pass', role: 'Student', themeStyle: 'royal-purple', status: 'Active' },
          { _id: 'tpl-dark', title: 'Dark Luxury Obsidian Digital Card', role: 'Student', themeStyle: 'dark-slate', status: 'Active' },
          { _id: 'tpl-crimson', title: 'Heritage Crimson & Gold Crest Badge', role: 'Student', themeStyle: 'crimson-gold', status: 'Active' }
        ];
      }

      setTemplates(availableTemplates);
      const defaultTpl = availableTemplates.find(t => t.role === 'Student') || availableTemplates[0];
      if (defaultTpl) {
        setSelectedTemplateId(defaultTpl._id);
        if (defaultTpl.themeStyle) setActiveDesignId(defaultTpl.themeStyle);
      }

      // ── Merge DB classes with standard academic classes ──
      let rawClasses = [];
      if (Array.isArray(clsRes)) rawClasses = clsRes;
      else if (Array.isArray(clsRes?.data)) rawClasses = clsRes.data;
      else if (Array.isArray(clsRes?.classes)) rawClasses = clsRes.classes;

      const extractedClassNames = rawClasses
        .map(c => (typeof c === 'string' ? c : c?.name || c?.className || c?.title))
        .filter(Boolean);

      const allUniqueClasses = Array.from(new Set([...STANDARD_ACADEMIC_CLASSES, ...extractedClassNames]));
      setClasses(sortClassesAcademic(allUniqueClasses));

      // ── Merge DB sections with standard sections ──
      let rawSections = [];
      if (Array.isArray(secRes)) rawSections = secRes;
      else if (Array.isArray(secRes?.data)) rawSections = secRes.data;
      else if (Array.isArray(secRes?.sections)) rawSections = secRes.sections;

      const extractedSectionNames = rawSections
        .map(s => (typeof s === 'string' ? s : s?.name || s?.section))
        .filter(Boolean)
        .map(s => String(s).replace(/^Section\s*/i, '').trim());

      const allUniqueSections = Array.from(new Set([...STANDARD_SECTIONS_LIST, ...extractedSectionNames]));
      setSections(allUniqueSections);

      if (setRes?.success && setRes.data) {
        setSchoolSetting(setRes.data);
      } else {
        setSchoolSetting({
          schoolName: 'Pak Royal College Sharaqpur',
          schoolCode: 'PRC-001',
          phone: '+92 300 1234567',
          email: 'info@pakroyalcollege.edu.pk',
          address: 'Sharaqpur Sharif, Sheikhupura, Punjab, Pakistan'
        });
      }
    } catch (err) {
      console.error('Error loading metadata for ID cards:', err);
    }
  };

  const executeSearch = async (selectedRole = role, selectedClass = classFilter, selectedSection = sectionFilter) => {
    setLoading(true);
    try {
      let list = [];
      if (selectedRole === 'Student') {
        const params = new URLSearchParams({ limit: '1000' });
        if (selectedClass && selectedClass !== 'All Classes' && selectedClass !== 'All') {
          params.append('className', selectedClass);
        }
        if (selectedSection && selectedSection !== 'All Sections' && selectedSection !== 'All') {
          params.append('section', selectedSection);
        }

        const res = await api.get(`/student?${params.toString()}`).catch(() => null);
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
      } else {
        const params = new URLSearchParams({ limit: '1000' });
        if (selectedRole === 'Teacher') params.append('role', 'Teacher');

        const res = await api.get(`/staff?${params.toString()}`).catch(() => null);
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
      }
      setRecords(list || []);
      setSelectedIds((list || []).map(r => r._id));
    } catch (error) {
      console.error('Error fetching records for ID cards:', error);
      setRecords([]);
      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(role, classFilter, sectionFilter);
  };

  const handleResetFilters = () => {
    setClassFilter('');
    setSectionFilter('');
    setSearchQuery('');
    executeSearch(role, '', '');
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r._id));
    }
  };

  const handlePrint = (recordsToPrint = null) => {
    const list = recordsToPrint || (selectedRecords.length > 0 ? selectedRecords : filteredRecords);
    if (!list || list.length === 0) return;
    setPrintPortalRecords(list);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintSingle = (rec) => {
    if (!rec) return;
    setPrintPortalRecords([rec]);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDownloadSinglePDF = (rec) => {
    if (!rec) return;
    downloadIdCardPDF(rec, schoolSetting, activeDesignId);
  };

  const handleDownloadBatchPDF = () => {
    const list = selectedRecords.length > 0 ? selectedRecords : filteredRecords;
    if (!list || list.length === 0) return;
    if (list.length === 1) {
      downloadIdCardPDF(list[0], schoolSetting, activeDesignId);
    } else {
      downloadBatchIdCardsPDF(list, schoolSetting, activeDesignId);
    }
  };

  // Filtered records by live search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const query = searchQuery.toLowerCase().trim();
    return records.filter(r => {
      const name = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
      const adm = String(r.admissionNo || r.staffNo || '').toLowerCase();
      const roll = String(r.rollNo || '').toLowerCase();
      const phone = String(r.phone || r.mobile || '').toLowerCase();
      const cls = String(r.className || r.department || '').toLowerCase();
      return name.includes(query) || adm.includes(query) || roll.includes(query) || phone.includes(query) || cls.includes(query);
    });
  }, [records, searchQuery]);

  const selectedRecords = filteredRecords.filter(r => selectedIds.includes(r._id));
  const schoolName = schoolSetting?.schoolName || 'Pak Royal College Sharaqpur';
  const schoolAddress = schoolSetting?.address || schoolSetting?.city || 'Sharaqpur Sharif, Punjab, Pakistan';
  const schoolPhone = schoolSetting?.phone || '+92 300 1234567';

  // Active Design Object
  const currentDesign = CARD_DESIGNS.find(d => d.id === activeDesignId) || CARD_DESIGNS[0];

  // Helper to Render Individual Card in Selected Design
  const renderCardGraphic = (rec, isInspectModal = false) => {
    const activeTpl = templates.find(t => t._id === selectedTemplateId || t.themeStyle === activeDesignId) || {};
    const showPhoto = activeTpl.showPhoto !== undefined ? activeTpl.showPhoto : true;
    const showAdmissionNo = activeTpl.showAdmissionNo !== undefined ? activeTpl.showAdmissionNo : true;
    const showRollNo = activeTpl.showRollNo !== undefined ? activeTpl.showRollNo : true;
    const showClass = activeTpl.showClass !== undefined ? activeTpl.showClass : true;
    const showSection = activeTpl.showSection !== undefined ? activeTpl.showSection : true;
    const showDob = activeTpl.showDob !== undefined ? activeTpl.showDob : true;
    const showFatherName = activeTpl.showFatherName !== undefined ? activeTpl.showFatherName : true;
    const showPhone = activeTpl.showPhone !== undefined ? activeTpl.showPhone : true;
    const showQrBarcode = activeTpl.showQrBarcode !== undefined ? activeTpl.showQrBarcode : true;
    const showSignature = activeTpl.showSignature !== undefined ? activeTpl.showSignature : true;

    const brandHeader = activeTpl.headerText || schoolName || 'Pak Royal College Sharaqpur';
    const brandSubHeader = activeTpl.subHeaderText || schoolAddress || 'Sharaqpur Sharif, Punjab, Pakistan';
    const brandFooter = activeTpl.footerText || 'Principal Signature';

    const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Cardholder Name';
    const photo = rec.studentPhoto || rec.photo || rec.staffPhoto;
    const phone = rec.phone || rec.mobile || rec.guardianPhone || schoolPhone;
    const admNo = rec.admissionNo || rec.staffNo || 'ADM-2026-001';
    const rollNo = rec.rollNo || '101';
    const className = rec.className || 'Class 10';
    const section = rec.section || 'A';
    const fatherName = rec.fatherName || 'Guardian / Father';
    const dob = formatDateDMY(rec.dob) || '14/05/2008';
    const designation = rec.designation || (role === 'Teacher' ? 'Senior Faculty' : 'Staff Member');
    const department = rec.department || 'Academics';

    const getPhotoUrl = (p) => {
      if (!p) return null;
      if (p.startsWith('http') || p.startsWith('data:')) return p;
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
      return `${apiBase}${p.startsWith('/') ? '' : '/'}${p}`;
    };
    const photoUrl = getPhotoUrl(photo);

    // ── DESIGN 1: Modern Emerald Vertical Lanyard Badge (Matching Reference Image 2) ──
    if (activeDesignId === 'stoofi-emerald') {
      return (
        <div className={`bg-white text-zinc-900 rounded-3xl overflow-hidden shadow-xl border-2 border-emerald-600 w-full ${isInspectModal ? 'max-w-[340px]' : ''} flex flex-col justify-between select-none relative`}>
          {/* Header Banner with Official Pak Royal College Crest */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 p-3 text-white relative overflow-hidden flex items-center gap-3">
            <img 
              src="/pak-royal-college-logo.png" 
              alt="Pak Royal College" 
              className="w-12 h-12 object-contain drop-shadow-md shrink-0 bg-white/10 rounded-full p-0.5 border border-white/20" 
            />
            <div className="min-w-0 text-left">
              <h3 className="font-black text-xs sm:text-sm leading-tight uppercase tracking-tight text-white drop-shadow-xs truncate">
                PAK ROYAL COLLEGE
              </h3>
              <p className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider mt-0.5">
                SHARAQPUR
              </p>
              <span className="text-[7.5px] font-medium text-emerald-200/90 tracking-wide uppercase block">
                Affiliated & Registered
              </span>
            </div>
          </div>

          {/* Photo & Bio */}
          <div className="p-3.5 flex flex-col items-center text-center flex-1 bg-white">
            {/* Portrait Rounded-Rectangular Photo Box */}
            {showPhoto && (
              <div className="relative mt-1">
                <div className="w-24 h-28 rounded-2xl border-[3px] border-emerald-600 overflow-hidden bg-zinc-100 shadow-md flex items-center justify-center relative">
                  {photoUrl ? (
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-emerald-700 p-2">
                      <span className="text-3xl font-black text-emerald-700 uppercase">{name.charAt(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-2.5 text-center w-full px-2">
              <h4 className="text-sm font-black text-zinc-950 uppercase tracking-tight truncate leading-tight">{name}</h4>
              <span className="inline-block mt-1 px-3 py-0.5 text-[9px] font-black rounded-full uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                {role}
              </span>
            </div>

            {/* Details Table */}
            <div className="w-full mt-2.5 space-y-1 text-[10.5px] text-left bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
              {role === 'Student' ? (
                <>
                  {showAdmissionNo && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">ID No:</span><strong className="font-mono text-zinc-950">{admNo}</strong></div>
                  )}
                  {showClass && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Class & Sec:</span><strong className="text-emerald-800 font-bold">{className} {showSection ? `(${section})` : ''}</strong></div>
                  )}
                  {showRollNo && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Roll Number:</span><strong className="font-mono text-zinc-950">{rollNo}</strong></div>
                  )}
                  {showDob && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">DOB:</span><span className="text-zinc-800 font-medium">{dob}</span></div>
                  )}
                  {showFatherName && fatherName && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Guardian:</span><span className="font-bold text-zinc-900 truncate max-w-[130px]">{fatherName}</span></div>
                  )}
                </>
              ) : (
                <>
                  {showAdmissionNo && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Staff ID:</span><strong className="font-mono text-zinc-950">{admNo}</strong></div>
                  )}
                  <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Designation:</span><strong className="text-emerald-800 font-bold">{designation}</strong></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Department:</span><strong className="font-bold text-zinc-900">{department}</strong></div>
                </>
              )}
              {showPhone && (
                <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Emergency:</span><strong className="font-mono text-zinc-800 text-[9.5px]">{phone}</strong></div>
              )}
            </div>

            {/* Real Unique Scannable Verification QR Code & Signature */}
            <div className="w-full mt-2.5 pt-2 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StudentCardQR rec={rec} />
                <div className="text-left">
                  <span className="text-[7.5px] font-black text-emerald-800 uppercase tracking-wider block">Scan to Verify</span>
                  <span className="font-mono text-[8px] font-black text-zinc-800 tracking-tight block">{admNo}</span>
                </div>
              </div>
              {showSignature && (
                <div className="text-right">
                  <div className="text-[7.5px] font-bold text-zinc-800 border-b border-zinc-400 pb-0.5 font-serif italic">
                    {brandFooter}
                  </div>
                  <span className="text-[6px] text-zinc-400 uppercase tracking-wider block mt-0.5">Authorized Seal</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Accent */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 h-2 w-full" />
        </div>
      );
    }

    // ── DESIGN 2: Executive Navy Horizontal Smart Card (Matching Reference Image 3) ──
    // ── DESIGN 2: Executive Navy Horizontal Smart Card (Matching Reference Image 3) ──
    if (activeDesignId === 'classic-navy') {
      return (
        <div className={`bg-white text-zinc-900 rounded-none overflow-hidden shadow-xl border-2 border-[#084A86] w-full ${isInspectModal ? 'max-w-[420px]' : ''} flex flex-col justify-between select-none relative`}>
          {/* Header Stripe */}
          <div className="bg-gradient-to-r from-[#06335d] via-[#084A86] to-[#0a58a0] px-3.5 py-1.5 flex items-center justify-between border-b-2 border-amber-400 text-white">
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
                <h3 className="font-black text-[12px] tracking-wide uppercase text-white block">PAK ROYAL COLLEGE</h3>
                <p className="text-[7.5px] text-amber-300 font-bold tracking-wider block">Sharaqpur Sharif, Distt. Sheikhupura</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[7px] text-slate-200 font-semibold uppercase tracking-wider block">SESSION</span>
              <span className="text-[8.5px] font-black text-amber-300 font-mono block">2026–2027</span>
            </div>
          </div>

          {/* Body Dual-Column */}
          <div className="p-2.5 flex items-stretch gap-2.5 flex-1 bg-gradient-to-b from-white to-slate-50/70">
            {/* Left: Portrait Photo Box */}
            {showPhoto && (
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="w-[78px] h-[98px] rounded-2xl border-[2.5px] border-[#084A86] overflow-hidden bg-slate-100 shadow-xs flex items-center justify-center relative">
                  {photoUrl ? (
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-400 p-1">
                      <User className="w-8 h-8 text-[#084A86]/60" />
                      <span className="text-[8px] font-black mt-1 uppercase text-[#084A86]">{name.charAt(0)}</span>
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
                <h4 className="font-black text-[12.5px] text-zinc-950 uppercase tracking-tight truncate leading-tight">
                  {name}
                </h4>
              </div>

              <div className="space-y-0.5 text-[9.5px] text-zinc-700 pt-1 border-t border-zinc-200/70">
                <div className="flex items-center">
                  <span className="w-20 text-zinc-400 font-semibold text-[8.5px]">Name:</span>
                  <span className="text-zinc-950 font-black truncate">{name}</span>
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

            {/* Right: Scannable Verification QR Code */}
            {showQrBarcode && (
              <div className="flex flex-col items-center justify-center shrink-0 pl-1 border-l border-zinc-200/80">
                <StudentCardQR rec={rec} isDark={false} />
                <span className="text-[6.5px] font-black text-[#084A86] uppercase tracking-wider mt-1">
                  Scan to Verify
                </span>
                <span className="font-mono text-[6.5px] text-zinc-400 font-bold">{rollNo}</span>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="bg-[#084A86] px-2.5 py-1 text-white flex justify-between items-center text-[7.5px] border-t-2 border-amber-400">
            <span className="font-mono text-[7px] text-slate-200">pakroyalcollege.edu.pk</span>

            {/* Middle Instruction Box */}
            <div className="text-center px-1.5 py-0.5 rounded bg-white/10 border border-white/20 max-w-[175px] leading-tight">
              <span className="text-[6.5px] text-white font-medium block">
                Property of Pak Royal College. If found, please return.
              </span>
              <span className="text-[6.5px] text-amber-300 font-bold font-mono block">
                Helpline: 03 111 444 810
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


    // ── DESIGN 3: Royal Purple Academic Pass ──
    if (activeDesignId === 'royal-purple') {
      return (
        <div className={`bg-white text-zinc-900 rounded-3xl overflow-hidden shadow-xl border-2 border-purple-600 w-full ${isInspectModal ? 'max-w-[340px]' : ''} flex flex-col justify-between select-none`}>
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-3 text-white relative flex items-center gap-3">
            <img 
              src="/pak-royal-college-logo.png" 
              alt="Pak Royal College" 
              className="w-12 h-12 object-contain drop-shadow-md shrink-0 bg-white/10 rounded-full p-0.5 border border-white/20" 
            />
            <div className="min-w-0 text-left">
              <h3 className="font-black text-xs sm:text-sm leading-tight uppercase tracking-tight text-white drop-shadow-xs truncate">
                PAK ROYAL COLLEGE
              </h3>
              <p className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider mt-0.5">
                SHARAQPUR
              </p>
              <span className="text-[7.5px] font-medium text-purple-200/90 tracking-wide uppercase block">
                Academic Excellence Pass
              </span>
            </div>
          </div>

          <div className="p-3.5 flex flex-col items-center text-center flex-1 bg-white">
            {showPhoto && (
              <div className="relative mt-1">
                <div className="w-24 h-28 rounded-2xl border-[3px] border-purple-600 overflow-hidden bg-purple-50 shadow-md flex items-center justify-center relative">
                  {photoUrl ? (
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-purple-900">
                      <User className="w-10 h-10 text-purple-300" />
                      <span className="text-[9px] font-bold mt-1 text-purple-700 uppercase">{name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-purple-700 text-amber-300 flex items-center justify-center shadow-xs border-2 border-white">
                  <Crown className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            <div className="mt-2.5 text-center w-full px-2">
              <h4 className="text-sm font-black text-zinc-950 uppercase tracking-tight truncate leading-tight">{name}</h4>
              <span className="inline-block mt-1 px-3 py-0.5 text-[9px] font-black rounded-full uppercase bg-purple-100 text-purple-900 border border-purple-300">
                {role}
              </span>
            </div>

            <div className="w-full mt-2.5 space-y-1 text-[10.5px] text-left bg-purple-50/40 p-2.5 rounded-xl border border-purple-100">
              {role === 'Student' ? (
                <>
                  {showAdmissionNo && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">ID No:</span><strong className="font-mono text-zinc-950">{admNo}</strong></div>
                  )}
                  {showClass && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Class:</span><strong className="text-purple-900 font-bold">{className} {showSection ? `(${section})` : ''}</strong></div>
                  )}
                  {showRollNo && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Roll No:</span><strong className="font-mono text-zinc-950">{rollNo}</strong></div>
                  )}
                  {showDob && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">DOB:</span><span className="text-zinc-800 font-medium">{dob}</span></div>
                  )}
                  {showFatherName && fatherName && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Guardian:</span><span className="font-bold text-zinc-900 truncate max-w-[130px]">{fatherName}</span></div>
                  )}
                </>
              ) : (
                <>
                  {showAdmissionNo && (
                    <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Staff ID:</span><strong className="font-mono text-zinc-950">{admNo}</strong></div>
                  )}
                  <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Designation:</span><strong className="text-purple-900 font-bold">{designation}</strong></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Department:</span><strong className="font-bold text-zinc-900">{department}</strong></div>
                </>
              )}
              {showPhone && (
                <div className="flex justify-between items-center"><span className="text-zinc-500 font-medium">Emergency:</span><strong className="font-mono text-zinc-800 text-[9.5px]">{phone}</strong></div>
              )}
            </div>

            {(showQrBarcode || showSignature) && (
              <div className="w-full mt-2.5 pt-2 border-t border-zinc-200 flex items-center justify-between">
                {showQrBarcode ? (
                  <div className="flex items-center gap-2">
                    <StudentCardQR rec={rec} isDark={false} />
                    <div className="text-left">
                      <span className="text-[7.5px] font-black text-purple-900 uppercase tracking-wider block">Scan to Verify</span>
                      <span className="font-mono text-[7.5px] font-bold text-zinc-700 block">{admNo}</span>
                    </div>
                  </div>
                ) : <div />}
                {showSignature && (
                  <div className="text-right">
                    <div className="text-[7.5px] font-bold text-zinc-800 border-b border-zinc-400 pb-0.5 font-serif italic">
                      {brandFooter}
                    </div>
                    <span className="text-[6px] text-zinc-400 uppercase tracking-wider block mt-0.5">Official Seal</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 h-2 w-full" />
        </div>
      );
    }

    // ── DESIGN 4: Dark Luxury Obsidian Digital Card ──
    if (activeDesignId === 'dark-slate') {
      return (
        <div className={`bg-zinc-950 text-white rounded-3xl overflow-hidden shadow-2xl border-2 border-zinc-700 w-full ${isInspectModal ? 'max-w-[340px]' : ''} flex flex-col justify-between select-none`}>
          <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-zinc-800 text-white relative flex items-center gap-3">
            <img 
              src="/pak-royal-college-logo.png" 
              alt="Pak Royal College" 
              className="w-12 h-12 object-contain drop-shadow-md shrink-0 bg-white/10 rounded-full p-0.5 border border-white/20" 
            />
            <div className="min-w-0 text-left">
              <h3 className="font-black text-xs sm:text-sm leading-tight uppercase tracking-tight text-white drop-shadow-xs truncate">
                PAK ROYAL COLLEGE
              </h3>
              <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider mt-0.5">
                SHARAQPUR
              </p>
              <span className="text-[7.5px] font-medium text-zinc-400 tracking-wide uppercase block">
                Digital Smart ID Card
              </span>
            </div>
          </div>

          <div className="p-3.5 flex flex-col items-center text-center flex-1 bg-zinc-900/90">
            {showPhoto && (
              <div className="relative mt-1">
                <div className="w-24 h-28 rounded-2xl border-[3px] border-emerald-500/80 overflow-hidden bg-zinc-950 shadow-inner flex items-center justify-center relative">
                  {photoUrl ? (
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-emerald-400">
                      <span className="text-3xl font-black uppercase text-emerald-400">{name.charAt(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-2.5 text-center w-full px-2">
              <h4 className="text-sm font-black text-white uppercase tracking-tight truncate leading-tight">{name}</h4>
              <span className="inline-block mt-1 px-3 py-0.5 text-[9px] font-black rounded-full uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-700">
                {role}
              </span>
            </div>

            <div className="w-full mt-2.5 space-y-1 text-[10.5px] text-left bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
              {role === 'Student' ? (
                <>
                  {showAdmissionNo && (
                    <div className="flex justify-between items-center"><span className="text-zinc-400 font-medium">ID No:</span><strong className="font-mono text-white">{admNo}</strong></div>
                  )}
                  {showClass && (
                    <div className="flex justify-between items-center"><span className="text-zinc-400 font-medium">Class & Sec:</span><strong className="text-emerald-400 font-bold">{className} {showSection ? `(${section})` : ''}</strong></div>
                  )}
                  {showRollNo && (
                    <div className="flex justify-between items-center"><span className="text-zinc-400 font-medium">Roll No:</span><strong className="font-mono text-white">{rollNo}</strong></div>
                  )}
                  {showDob && (
                    <div className="flex justify-between items-center"><span className="text-zinc-400 font-medium">DOB:</span><span className="text-zinc-300 font-medium">{dob}</span></div>
                  )}
                  {showFatherName && fatherName && (
                    <div className="flex justify-between items-center"><span className="text-zinc-400 font-medium">Guardian:</span><span className="font-bold text-zinc-200 truncate max-w-[130px]">{fatherName}</span></div>
                  )}
                </>
              ) : (
                <>
                  {showAdmissionNo && (
                    <div className="flex justify-between items-center"><span className="text-zinc-400 font-medium">Staff ID:</span><strong className="font-mono text-white">{admNo}</strong></div>
                  )}
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-medium">Designation:</span><strong className="text-emerald-400 font-bold">{designation}</strong></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-medium">Department:</span><strong className="font-bold text-zinc-200">{department}</strong></div>
                </>
              )}
              {showPhone && (
                <div className="flex justify-between items-center"><span className="text-zinc-400 font-medium">Emergency:</span><strong className="font-mono text-emerald-400 text-[9.5px]">{phone}</strong></div>
              )}
            </div>

            {(showQrBarcode || showSignature) && (
              <div className="w-full mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between">
                {showQrBarcode ? (
                  <div className="flex items-center gap-2">
                    <StudentCardQR rec={rec} isDark={true} />
                    <div className="text-left">
                      <span className="text-[7.5px] font-black text-emerald-400 uppercase tracking-wider block">Smart Verified</span>
                      <span className="font-mono text-[7.5px] font-bold text-zinc-400 block">{admNo}</span>
                    </div>
                  </div>
                ) : <div />}
                {showSignature && (
                  <div className="text-right">
                    <div className="text-[7.5px] font-bold text-zinc-300 border-b border-zinc-700 pb-0.5 font-serif italic">
                      {brandFooter}
                    </div>
                    <span className="text-[6px] text-emerald-400 uppercase tracking-wider block mt-0.5">Verified Chip</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-emerald-600 h-1.5 w-full" />
        </div>
      );
    }

    // ── DESIGN 5: Heritage Crimson & Gold Crest Badge ──
    return (
      <div className={`bg-white text-zinc-900 rounded-3xl overflow-hidden shadow-xl border-3 border-amber-600 w-full ${isInspectModal ? 'max-w-[340px]' : ''} flex flex-col justify-between select-none`}>
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 p-3 text-white border-b-2 border-amber-500 relative flex items-center gap-3">
          <img 
            src="/pak-royal-college-logo.png" 
            alt="Pak Royal College" 
            className="w-12 h-12 object-contain drop-shadow-md shrink-0 bg-white/10 rounded-full p-0.5 border border-white/20" 
          />
          <div className="min-w-0 text-left">
            <h3 className="font-black text-xs sm:text-sm leading-tight uppercase tracking-tight text-white drop-shadow-xs truncate">
              PAK ROYAL COLLEGE
            </h3>
            <p className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider mt-0.5">
              SHARAQPUR
            </p>
            <span className="text-[7.5px] font-medium text-amber-200/80 tracking-wide uppercase block">
              Institutional Heritage Pass
            </span>
          </div>
        </div>

        <div className="p-3.5 flex flex-col items-center text-center flex-1 bg-white">
          {showPhoto && (
            <div className="relative mt-1">
              <div className="w-24 h-28 rounded-2xl border-[3px] border-amber-600 overflow-hidden bg-amber-50/50 shadow-md flex items-center justify-center relative">
                {photoUrl ? (
                  <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-rose-950">
                    <span className="text-3xl font-black uppercase text-rose-950">{name.charAt(0)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-2.5 text-center w-full px-2">
            <h4 className="text-sm font-black text-zinc-950 uppercase tracking-tight truncate leading-tight">{name}</h4>
            <span className="inline-block mt-1 px-3 py-0.5 text-[9px] font-black rounded-full uppercase bg-amber-100 text-rose-950 border border-amber-400">
              {role}
            </span>
          </div>

          <div className="w-full mt-2.5 space-y-1 text-[10.5px] text-left bg-amber-50/30 p-2.5 rounded-xl border border-amber-200">
            {role === 'Student' ? (
              <>
                {showAdmissionNo && (
                  <div className="flex justify-between items-center"><span className="text-zinc-600 font-medium">ID No:</span><strong className="font-mono text-zinc-950">{admNo}</strong></div>
                )}
                {showClass && (
                  <div className="flex justify-between items-center"><span className="text-zinc-600 font-medium">Class & Sec:</span><strong className="text-rose-900 font-bold">{className} {showSection ? `(${section})` : ''}</strong></div>
                )}
                {showRollNo && (
                  <div className="flex justify-between items-center"><span className="text-zinc-600 font-medium">Roll No:</span><strong className="font-mono text-zinc-950">{rollNo}</strong></div>
                )}
                {showDob && (
                  <div className="flex justify-between items-center"><span className="text-zinc-600 font-medium">DOB:</span><span className="text-zinc-800 font-medium">{dob}</span></div>
                )}
                {showFatherName && fatherName && (
                  <div className="flex justify-between items-center"><span className="text-zinc-600 font-medium">Guardian:</span><span className="font-bold text-zinc-950 truncate max-w-[130px]">{fatherName}</span></div>
                )}
              </>
            ) : (
              <>
                {showAdmissionNo && (
                  <div className="flex justify-between items-center"><span className="text-zinc-600 font-medium">Staff ID:</span><strong className="font-mono text-zinc-950">{admNo}</strong></div>
                )}
                <div className="flex justify-between items-center"><span className="text-zinc-600 font-medium">Designation:</span><strong className="text-rose-900 font-bold">{designation}</strong></div>
                <div className="flex justify-between items-center"><span className="text-zinc-600 font-medium">Department:</span><strong className="font-bold text-zinc-950">{department}</strong></div>
              </>
            )}
            {showPhone && (
              <div className="flex justify-between items-center"><span className="text-zinc-600 font-medium">Emergency:</span><strong className="font-mono text-zinc-950 text-[9.5px]">{phone}</strong></div>
            )}
          </div>

          {(showQrBarcode || showSignature) && (
            <div className="w-full mt-2.5 pt-2 border-t border-amber-200 flex items-center justify-between">
              {showQrBarcode ? (
                <div className="flex items-center gap-2">
                  <StudentCardQR rec={rec} isDark={false} />
                  <div className="text-left">
                    <span className="text-[7.5px] font-black text-amber-900 uppercase tracking-wider block">Crest Verified</span>
                    <span className="font-mono text-[7.5px] font-bold text-zinc-700 block">{admNo}</span>
                  </div>
                </div>
              ) : <div />}
              {showSignature && (
                <div className="text-right">
                  <div className="text-[7.5px] font-bold text-rose-950 border-b border-amber-400 pb-0.5 font-serif italic">
                    {brandFooter}
                  </div>
                  <span className="text-[6px] text-amber-700 uppercase tracking-wider block mt-0.5">Presidential Seal</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-rose-950 via-amber-700 to-rose-950 h-2 w-full" />
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            Generate & Print ID Cards
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Choose from 5 premium card designs, select individual or batch students/staff, and download or print high-resolution cards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/id-card">
            <Button variant="outline" className="border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold h-9 flex items-center gap-1.5 shadow-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
              Manage Templates ({templates.length})
            </Button>
          </Link>
          <div className="hidden md:flex items-center text-xs text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span>Admin</span>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-900 font-semibold">Generate ID Cards</span>
          </div>
        </div>
      </div>

      {/* ── 5 INTERACTIVE CARD DESIGN SELECTOR TABS ── */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl p-5 print:hidden">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Step 1: Select ID Card Design (5 Available Layouts)
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Active: {currentDesign.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CARD_DESIGNS.map((design) => {
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
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    Design {design.num}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase">{design.layout}</span>
                </div>

                <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${design.color} mb-2.5`}></div>

                <div className="font-bold text-xs text-zinc-900 leading-tight mb-1">{design.name}</div>
                <p className="text-[10px] text-zinc-500 leading-snug line-clamp-2">{design.desc}</p>

                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected Design
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SEARCH CRITERIA & FILTERS ── */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl p-5 print:hidden">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Step 2: Search Students / Staff Criteria</h2>
          </div>
          <span className="text-xs text-zinc-400">Connected to Database</span>
        </div>

        <form onSubmit={handleSearchSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Role Filter */}
            {/* Role Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700">Target Role <span className="text-rose-500">*</span></Label>
              <SearchableSelect
                name="role"
                value={role} 
                onChange={e => {
                  const val = e?.target?.value ?? e;
                  setRole(val);
                  executeSearch(val, classFilter, sectionFilter);
                }} 
                options={[
                  { value: 'Student', label: 'Student' },
                  { value: 'Teacher', label: 'Teacher' },
                  { value: 'Staff', label: 'Staff / Faculty' }
                ]}
              />
            </div>

            {/* Template Selector Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700">Design Template</Label>
              <SearchableSelect
                name="selectedTemplateId"
                value={selectedTemplateId} 
                onChange={e => {
                  const val = e?.target?.value ?? e;
                  setSelectedTemplateId(val);
                  const match = CARD_DESIGNS.find(d => d.id === val);
                  if (match) setActiveDesignId(match.id);
                }} 
                options={[
                  ...CARD_DESIGNS.map(d => ({ value: d.id, label: `Design ${d.num}: ${d.name}` }))
                ]}
                placeholder="Select Card Design"
              />
            </div>

            {/* Class Filter (For Student) */}
            {role === 'Student' ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">Class</Label>
                <SearchableSelect
                  name="classFilter"
                  value={classFilter} 
                  onChange={e => {
                    const val = e?.target?.value ?? e;
                    setClassFilter(val);
                    executeSearch(role, val, sectionFilter);
                  }}
                  options={[{ value: '', label: 'All Classes' }, ...classes.map(c => ({ value: c, label: c }))]}
                  placeholder="All Classes"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">Department</Label>
                <Input 
                  placeholder="e.g. Science, Admin..."
                  value={classFilter}
                  onChange={e => {
                    setClassFilter(e.target.value);
                    executeSearch(role, e.target.value, sectionFilter);
                  }}
                  className="h-9 text-xs"
                />
              </div>
            )}

            {/* Section Filter (For Student) */}
            {role === 'Student' ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">Section</Label>
                <SearchableSelect
                  name="sectionFilter"
                  value={sectionFilter} 
                  onChange={e => {
                    const val = e?.target?.value ?? e;
                    setSectionFilter(val);
                    executeSearch(role, classFilter, val);
                  }} 
                  options={[{ value: '', label: 'All Sections' }, ...sections.map(s => ({ value: s, label: `Section ${s}` }))]}
                  placeholder="All Sections"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">Keyword Search</Label>
                <Input 
                  placeholder="Search name or ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-200" /> 
                {loading ? 'Generating...' : 'Generate Cards'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="h-9 px-3 text-xs border-zinc-200 hover:bg-zinc-100 text-zinc-600"
                title="Reset Filters"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* ── ACTION BAR & PRINT TOOLS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-zinc-200 shadow-xs rounded-2xl p-4 print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <button 
            type="button" 
            onClick={toggleSelectAll} 
            className="flex items-center gap-2 text-xs font-semibold text-zinc-800 hover:text-zinc-950 cursor-pointer"
          >
            {selectedIds.length === filteredRecords.length && filteredRecords.length > 0 ? (
              <CheckSquare className="h-4 w-4 text-emerald-600" />
            ) : (
              <Square className="h-4 w-4 text-zinc-400" />
            )}
            Select All ({filteredRecords.length})
          </button>
          <span className="text-zinc-300">|</span>
          <span className="text-xs text-zinc-600">
            Selected: <strong className="text-emerald-700">{selectedIds.length}</strong> of {filteredRecords.length}
          </span>
        </div>

        {/* View Switcher & Print Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-zinc-200 p-0.5 bg-zinc-50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Cards Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Table View
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              onClick={() => handlePrint()}
              disabled={filteredRecords.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
              <Printer className="h-3.5 w-3.5" />
              Print Cards ({selectedIds.length > 0 ? selectedIds.length : filteredRecords.length})
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={handleDownloadBatchPDF}
              disabled={filteredRecords.length === 0}
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold h-9 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              Download PDF ({selectedIds.length > 0 ? selectedIds.length : filteredRecords.length})
            </Button>
          </div>
        </div>
      </div>

      {/* ── RECORDS / CARDS DISPLAY ── */}
      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-500">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-emerald-600" />
          <p className="text-sm font-semibold">Loading student & staff ID cards...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-500">
          <CreditCard className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
          <h3 className="text-sm font-bold text-zinc-800">No ID Cards Found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">No records found for the selected filters. You can create a new student ID card from the ID Card creation page.</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Link 
              href="/dashboard/admin/id-card"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" /> Create ID Card
            </Link>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">Select</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Admission / Roll No</th>
                  <th className="py-3 px-4">{role === 'Student' ? 'Class & Sec' : 'Department'}</th>
                  <th className="py-3 px-4">{role === 'Student' ? 'Father Name' : 'Designation'}</th>
                  <th className="py-3 px-4">Emergency Phone</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredRecords.map(rec => {
                  const isSelected = selectedIds.includes(rec._id);
                  const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Cardholder';
                  const photo = rec.photo || rec.studentPhoto || rec.staffPhoto;

                  return (
                    <tr 
                      key={rec._id} 
                      onClick={() => toggleSelect(rec._id)}
                      className={`hover:bg-zinc-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => toggleSelect(rec._id)}>
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Square className="h-4 w-4 text-zinc-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-900 flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0">
                          {photo ? (
                            <img src={photo.startsWith('http') || photo.startsWith('data:') ? photo : `http://localhost:5000/${photo}`} alt={name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs text-zinc-600">{name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{name}</p>
                          <p className="text-[10px] text-zinc-400">{rec.gender || 'Regular'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-700">
                        <span className="font-bold text-zinc-900">{rec.admissionNo || rec.staffNo || '—'}</span>
                        {rec.rollNo && <span className="text-[10px] text-zinc-400 ml-1.5">(Roll: {rec.rollNo})</span>}
                      </td>
                      <td className="py-3 px-4 text-zinc-700">
                        {role === 'Student' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-800">
                            {rec.className || '—'} {rec.section ? `(${rec.section})` : ''}
                          </span>
                        ) : (
                          <span>{rec.department || 'Academics'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-700">
                        {role === 'Student' ? (rec.fatherName || '—') : (rec.designation || 'Faculty Member')}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 font-mono text-[11px]">
                        {rec.phone || rec.mobile || rec.guardianPhone || '—'}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePrintSingle(rec)}
                            className="h-7 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-2 font-bold cursor-pointer"
                            title="Print Card"
                          >
                            <Printer className="h-3 w-3 mr-1" /> Print
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownloadSinglePDF(rec)}
                            className="h-7 text-xs border-zinc-300 text-zinc-700 hover:bg-zinc-100 px-2 font-semibold cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="h-3 w-3 mr-1 text-emerald-600" /> PDF
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setPreviewCard(rec)}
                            className="h-7 text-xs text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50 px-1.5 cursor-pointer"
                            title="Preview"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecords.map(rec => {
            const isSelected = selectedIds.includes(rec._id);

            return (
              <div 
                key={rec._id} 
                onClick={() => toggleSelect(rec._id)}
                className={`relative cursor-pointer transition-all duration-200 group ${
                  isSelected ? 'ring-2 ring-emerald-500 rounded-2xl shadow-lg scale-[1.01]' : 'opacity-65 hover:opacity-95 hover:shadow-md'
                } ${!isSelected ? 'print:hidden' : ''}`}
              >
                {/* Floating Select Badge */}
                <div className="absolute top-2.5 right-2.5 z-10 print:hidden">
                  {isSelected ? (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Selected
                    </span>
                  ) : (
                    <span className="bg-zinc-900/70 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Click to Select
                    </span>
                  )}
                </div>

                {/* Inspect Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewCard(rec);
                  }}
                  className="absolute bottom-2.5 right-2.5 z-10 print:hidden bg-white/90 hover:bg-white text-zinc-700 hover:text-emerald-700 text-[10px] font-semibold px-2 py-1 rounded-md shadow-xs border border-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" /> Inspect
                </button>

                {/* Render Selected Design Graphic */}
                {renderCardGraphic(rec, false)}

                {/* Visible Card Action Bar */}
                <div 
                  className="mt-3 pt-2.5 border-t border-zinc-200/80 flex items-center justify-between gap-1.5 print:hidden bg-zinc-50/70 p-2 rounded-xl"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handlePrintSingle(rec)}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                    title="Print this card only"
                  >
                    <Printer className="h-3 w-3" /> Print
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadSinglePDF(rec)}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-[11px] font-bold transition-colors cursor-pointer"
                    title="Download card as clean PDF"
                  >
                    <Download className="h-3 w-3 text-emerald-700" /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewCard(rec)}
                    className="inline-flex items-center justify-center p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
                    title="Preview card"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SINGLE CARD INSPECTION / DOWNLOAD MODAL ── */}
      {previewCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-zinc-900">ID Card Preview — {previewCard.firstName} {previewCard.lastName}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewCard(null)} 
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center bg-zinc-100/60 overflow-y-auto">
              {renderCardGraphic(previewCard, true)}
            </div>

            <div className="p-4 border-t border-zinc-100 flex items-center justify-end gap-2 bg-white">
              <Button 
                variant="outline" 
                onClick={() => setPreviewCard(null)} 
                className="h-9 text-xs border-zinc-200 text-zinc-700 cursor-pointer"
              >
                Close
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => handleDownloadSinglePDF(previewCard)}
                className="h-9 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF
              </Button>
              <Button 
                type="button"
                onClick={() => handlePrintSingle(previewCard)}
                className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" /> Print Single Card
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEDICATED PRINT PORTAL (100% ISOLATED — ONLY THE CARD PRINTS) ── */}
      <div id="id-card-print-portal" className="hidden">
        {(printPortalRecords.length > 0 ? printPortalRecords : (selectedRecords.length > 0 ? selectedRecords : filteredRecords)).map((rec, idx) => (
          <div key={rec._id || idx} className="id-card-print-item mb-6">
            {renderCardGraphic(rec, true)}
          </div>
        ))}
      </div>

      {/* ── PRINT-ONLY OPTIMIZATION STYLESHEET ── */}
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

          /* Hide ALL standard document elements */
          body * {
            visibility: hidden !important;
          }

          /* Show ONLY the print portal and its contents */
          #id-card-print-portal,
          #id-card-print-portal * {
            visibility: visible !important;
          }

          #id-card-print-portal {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 20px !important;
            justify-content: center !important;
            align-items: flex-start !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            z-index: 2147483647 !important;
          }

          .id-card-print-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 12px !important;
          }

          nav, aside, header, footer, .sidebar, .navbar, .print\\:hidden, #stoofi-ai-widget {
            display: none !important;
          }

          @page {
            margin: 8mm;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
