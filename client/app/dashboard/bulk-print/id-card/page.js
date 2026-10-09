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
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

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
  const [activeDesignId, setActiveDesignId] = useState('stoofi-emerald');
  const [role, setRole] = useState('Student');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolSetting, setSchoolSetting] = useState(null);

  // Layout & View Options
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [previewCard, setPreviewCard] = useState(null);

  // Initial Metadata Fetch
  useEffect(() => {
    fetchMetadata();
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

      if (tplRes?.success && Array.isArray(tplRes.data)) {
        setTemplates(tplRes.data);
        const defaultTpl = tplRes.data.find(t => t.role === 'Student') || tplRes.data[0];
        if (defaultTpl) {
          setSelectedTemplateId(defaultTpl._id);
          if (defaultTpl.themeStyle) setActiveDesignId(defaultTpl.themeStyle);
        }
      }

      if (clsRes?.success && Array.isArray(clsRes.data)) {
        setClasses(sortClassesAcademic(clsRes.data.map(c => c.name || c)));
      }

      if (secRes?.success && Array.isArray(secRes.data)) {
        setSections(secRes.data.map(s => s.name || s));
      }

      if (setRes?.success && setRes.data) {
        setSchoolSetting(setRes.data);
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
        if (selectedClass) params.append('className', selectedClass);
        if (selectedSection) params.append('section', selectedSection);

        const res = await api.get(`/student?${params.toString()}`).catch(() => null);
        if (res?.success && Array.isArray(res.data)) {
          list = res.data;
        }
      } else {
        const params = new URLSearchParams({ limit: '1000' });
        if (selectedRole === 'Teacher') params.append('role', 'Teacher');

        const res = await api.get(`/staff?${params.toString()}`).catch(() => null);
        if (res?.success && Array.isArray(res.data)) {
          list = res.data;
        }
      }

      setRecords(list);
      setSelectedIds(list.map(r => r._id));
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

  const handlePrint = () => {
    window.print();
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
  const schoolName = schoolSetting?.schoolName || 'Stoofi Public School & College';
  const schoolAddress = schoolSetting?.address || schoolSetting?.city || 'Main Campus, Lahore, Pakistan';
  const schoolPhone = schoolSetting?.phone || '+92 300 1234567';

  // Active Design Object
  const currentDesign = CARD_DESIGNS.find(d => d.id === activeDesignId) || CARD_DESIGNS[0];

  // Helper to Render Individual Card in Selected Design
  const renderCardGraphic = (rec, isInspectModal = false) => {
    const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Cardholder Name';
    const photo = rec.photo || rec.studentPhoto || rec.staffPhoto;
    const phone = rec.phone || rec.mobile || rec.guardianPhone || schoolPhone;
    const admNo = rec.admissionNo || rec.staffNo || 'ADM-2026-001';
    const rollNo = rec.rollNo || '101';
    const className = rec.className || 'Class 10';
    const section = rec.section || 'A';
    const fatherName = rec.fatherName || 'Guardian / Father';
    const bloodGroup = rec.bloodGroup || 'O+';
    const designation = rec.designation || (role === 'Teacher' ? 'Senior Faculty' : 'Staff Member');
    const department = rec.department || 'Academics';

    // ── DESIGN 1: Modern Emerald Vertical Badge ──
    if (activeDesignId === 'stoofi-emerald') {
      return (
        <div className={`bg-white text-zinc-900 rounded-2xl overflow-hidden shadow-md border-2 border-emerald-600 w-full ${isInspectModal ? 'max-w-[340px] h-[500px]' : 'h-[460px]'} flex flex-col justify-between select-none relative`}>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-4 text-center text-white relative">
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-200">OFFICIAL STUDENT IDENTITY CARD</div>
            <h3 className="font-black text-sm leading-tight mt-0.5 truncate">{schoolName}</h3>
            <p className="text-[9px] text-emerald-100/80 truncate">{schoolAddress}</p>
          </div>

          {/* Photo & Bio */}
          <div className="p-3.5 flex flex-col items-center text-center flex-1 bg-white">
            <div className="w-20 h-20 rounded-full border-3 border-emerald-500 overflow-hidden bg-emerald-50 shadow-md mb-2 flex items-center justify-center shrink-0">
              {photo ? (
                <img src={photo.startsWith('http') || photo.startsWith('data:') ? photo : `http://localhost:5000/${photo}`} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-2xl font-black text-emerald-800 uppercase">{name.charAt(0)}</div>
              )}
            </div>

            <h4 className="font-black text-base text-zinc-950 leading-tight truncate max-w-[240px]">{name}</h4>
            <span className="inline-block mt-1 px-3 py-0.5 text-[10px] font-extrabold rounded-full uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
              {role}
            </span>

            {/* Details Table */}
            <div className="w-full mt-3 space-y-1 text-[11px] text-left bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
              {role === 'Student' ? (
                <>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Admission No:</span><span className="font-bold text-zinc-900">{admNo}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Class & Section:</span><span className="font-bold text-emerald-800">{className} ({section})</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Roll Number:</span><span className="font-bold text-zinc-900">{rollNo}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Father Name:</span><span className="font-bold text-zinc-900 truncate max-w-[130px]">{fatherName}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Blood Group:</span><span className="font-extrabold text-rose-600">{bloodGroup}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Staff ID:</span><span className="font-bold text-zinc-900">{admNo}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Designation:</span><span className="font-bold text-emerald-800">{designation}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Department:</span><span className="font-bold text-zinc-900">{department}</span></div>
                </>
              )}
              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Emergency:</span><span className="font-mono text-zinc-800 text-[10px] font-bold">{phone}</span></div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-emerald-50 px-3.5 py-2 text-[10px] text-zinc-600 flex justify-between items-center border-t border-emerald-200">
            <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-emerald-900">
              <QrCode className="h-4 w-4 text-emerald-700" />
              <span>VERIFIED ID</span>
            </div>
            <span className="font-extrabold text-zinc-800 text-[9px]">Principal Signature</span>
          </div>
        </div>
      );
    }

    // ── DESIGN 2: Executive Navy Horizontal Smart Card ──
    if (activeDesignId === 'classic-navy') {
      return (
        <div className={`bg-white text-zinc-900 rounded-xl overflow-hidden shadow-md border-2 border-sky-900 w-full ${isInspectModal ? 'max-w-[420px] h-[260px]' : 'h-[250px]'} flex flex-col justify-between select-none`}>
          {/* Header Stripe */}
          <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 px-3.5 py-2 flex items-center justify-between border-b-2 border-amber-500 text-white">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-white/10 flex items-center justify-center font-black text-xs uppercase text-amber-400 border border-amber-400/40">
                ST
              </div>
              <div>
                <h3 className="font-black text-xs leading-tight uppercase tracking-tight text-white">{schoolName}</h3>
                <p className="text-[9px] text-sky-200 truncate">{schoolAddress}</p>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-sky-950 px-2.5 py-0.5 rounded shadow-xs">
              {role}
            </span>
          </div>

          {/* Body Dual-Column */}
          <div className="p-3 flex items-center gap-3.5 flex-1 bg-white">
            <div className="w-20 h-24 rounded-lg border-2 border-sky-800 overflow-hidden bg-sky-50 shadow-xs shrink-0 flex items-center justify-center">
              {photo ? (
                <img src={photo.startsWith('http') || photo.startsWith('data:') ? photo : `http://localhost:5000/${photo}`} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-sky-900">{name.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0 text-[11px] space-y-1">
              <h4 className="font-black text-sm text-sky-950 truncate">{name}</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-zinc-600">
                {role === 'Student' ? (
                  <>
                    <div><span className="text-zinc-400 font-medium">Adm No:</span> <strong className="text-zinc-950">{admNo}</strong></div>
                    <div><span className="text-zinc-400 font-medium">Roll No:</span> <strong className="text-zinc-950">{rollNo}</strong></div>
                    <div><span className="text-zinc-400 font-medium">Class:</span> <strong className="text-sky-900 font-bold">{className}</strong></div>
                    <div><span className="text-zinc-400 font-medium">Sec:</span> <strong className="text-zinc-950">{section}</strong></div>
                    <div className="col-span-2 truncate"><span className="text-zinc-400 font-medium">Father:</span> <strong className="text-zinc-950">{fatherName}</strong></div>
                  </>
                ) : (
                  <>
                    <div><span className="text-zinc-400 font-medium">Staff ID:</span> <strong className="text-zinc-950">{admNo}</strong></div>
                    <div className="truncate"><span className="text-zinc-400 font-medium">Desig:</span> <strong className="text-sky-900 font-bold">{designation}</strong></div>
                    <div className="col-span-2 truncate"><span className="text-zinc-400 font-medium">Dept:</span> <strong className="text-zinc-950">{department}</strong></div>
                  </>
                )}
                <div className="col-span-2 truncate"><span className="text-zinc-400 font-medium">Phone:</span> <strong className="text-zinc-950 font-mono text-[10px]">{phone}</strong></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-sky-50 px-3.5 py-1.5 text-[9px] text-sky-900 flex justify-between items-center border-t border-sky-200">
            <span className="font-mono font-bold">STO-ID-{admNo}</span>
            <span className="font-bold text-sky-950">Authorized Campus Seal & Sign</span>
          </div>
        </div>
      );
    }

    // ── DESIGN 3: Royal Purple Academic Pass ──
    if (activeDesignId === 'royal-purple') {
      return (
        <div className={`bg-white text-zinc-900 rounded-2xl overflow-hidden shadow-md border-2 border-purple-600 w-full ${isInspectModal ? 'max-w-[340px] h-[500px]' : 'h-[460px]'} flex flex-col justify-between select-none`}>
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-4 text-center text-white relative">
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-purple-200 flex items-center justify-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" /> ACADEMIC EXCELLENCE CARD
            </div>
            <h3 className="font-black text-sm leading-tight mt-0.5 truncate">{schoolName}</h3>
            <p className="text-[9px] text-purple-200/80 truncate">{schoolAddress}</p>
          </div>

          <div className="p-3.5 flex flex-col items-center text-center flex-1 bg-white">
            <div className="w-20 h-20 rounded-2xl border-3 border-purple-600 overflow-hidden bg-purple-50 shadow-md mb-2 flex items-center justify-center shrink-0">
              {photo ? (
                <img src={photo.startsWith('http') || photo.startsWith('data:') ? photo : `http://localhost:5000/${photo}`} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-2xl font-black text-purple-900 uppercase">{name.charAt(0)}</div>
              )}
            </div>

            <h4 className="font-black text-base text-zinc-950 leading-tight truncate max-w-[240px]">{name}</h4>
            <span className="inline-block mt-1 px-3 py-0.5 text-[10px] font-extrabold rounded-full uppercase bg-purple-100 text-purple-900 border border-purple-300">
              {role}
            </span>

            <div className="w-full mt-3 space-y-1 text-[11px] text-left bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
              {role === 'Student' ? (
                <>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Admission No:</span><span className="font-bold text-zinc-900">{admNo}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Class:</span><span className="font-bold text-purple-900">{className} (Sec {section})</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Roll No:</span><span className="font-bold text-zinc-900">{rollNo}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Father:</span><span className="font-bold text-zinc-900 truncate max-w-[130px]">{fatherName}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Blood Group:</span><span className="font-bold text-rose-600">{bloodGroup}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Staff ID:</span><span className="font-bold text-zinc-900">{admNo}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Designation:</span><span className="font-bold text-purple-900">{designation}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500 font-medium">Department:</span><span className="font-bold text-zinc-900">{department}</span></div>
                </>
              )}
              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Phone:</span><span className="font-mono text-zinc-800 text-[10px] font-bold">{phone}</span></div>
            </div>
          </div>

          <div className="bg-purple-50 px-3.5 py-2 text-[10px] text-purple-900 flex justify-between items-center border-t border-purple-200">
            <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold">
              <QrCode className="h-4 w-4 text-purple-800" />
              <span>PASS-{admNo}</span>
            </div>
            <span className="font-extrabold text-zinc-800 text-[9px]">Registrar Seal</span>
          </div>
        </div>
      );
    }

    // ── DESIGN 4: Dark Luxury Obsidian Digital Card ──
    if (activeDesignId === 'dark-slate') {
      return (
        <div className={`bg-zinc-950 text-white rounded-2xl overflow-hidden shadow-xl border-2 border-zinc-700 w-full ${isInspectModal ? 'max-w-[340px] h-[500px]' : 'h-[460px]'} flex flex-col justify-between select-none`}>
          <div className="bg-gradient-to-r from-zinc-900 to-black p-4 text-center border-b border-zinc-800 text-white relative">
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" /> DIGITAL SMART CARD
            </div>
            <h3 className="font-black text-sm leading-tight mt-0.5 truncate text-white">{schoolName}</h3>
            <p className="text-[9px] text-zinc-400 truncate">{schoolAddress}</p>
          </div>

          <div className="p-3.5 flex flex-col items-center text-center flex-1 bg-zinc-900/90">
            <div className="w-20 h-20 rounded-2xl border-2 border-emerald-500/80 overflow-hidden bg-zinc-950 shadow-inner mb-2 flex items-center justify-center shrink-0">
              {photo ? (
                <img src={photo.startsWith('http') || photo.startsWith('data:') ? photo : `http://localhost:5000/${photo}`} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-2xl font-black text-emerald-400 uppercase">{name.charAt(0)}</div>
              )}
            </div>

            <h4 className="font-black text-base text-white leading-tight truncate max-w-[240px]">{name}</h4>
            <span className="inline-block mt-1 px-3 py-0.5 text-[10px] font-extrabold rounded-full uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-700">
              {role}
            </span>

            <div className="w-full mt-3 space-y-1 text-[11px] text-left bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800">
              {role === 'Student' ? (
                <>
                  <div className="flex justify-between"><span className="text-zinc-400 font-medium">Admission No:</span><span className="font-bold text-white">{admNo}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400 font-medium">Class / Section:</span><span className="font-bold text-emerald-400">{className} ({section})</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400 font-medium">Roll No:</span><span className="font-bold text-white">{rollNo}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400 font-medium">Father Name:</span><span className="font-bold text-zinc-300 truncate max-w-[130px]">{fatherName}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400 font-medium">Blood Group:</span><span className="font-bold text-rose-400">{bloodGroup}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-zinc-400 font-medium">Staff ID:</span><span className="font-bold text-white">{admNo}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400 font-medium">Designation:</span><span className="font-bold text-emerald-400">{designation}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400 font-medium">Department:</span><span className="font-bold text-zinc-300">{department}</span></div>
                </>
              )}
              <div className="flex justify-between"><span className="text-zinc-400 font-medium">Emergency:</span><span className="font-mono text-emerald-400 text-[10px] font-bold">{phone}</span></div>
            </div>
          </div>

          <div className="bg-black px-3.5 py-2 text-[10px] text-zinc-400 flex justify-between items-center border-t border-zinc-800">
            <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-emerald-400">
              <QrCode className="h-4 w-4 text-emerald-400" />
              <span>DIGITAL ID</span>
            </div>
            <span className="font-bold text-zinc-300 text-[9px]">Verified Smart Chip</span>
          </div>
        </div>
      );
    }

    // ── DESIGN 5: Heritage Crimson & Gold Crest Badge ──
    return (
      <div className={`bg-amber-50/40 text-zinc-900 rounded-2xl overflow-hidden shadow-md border-3 border-amber-600 w-full ${isInspectModal ? 'max-w-[340px] h-[500px]' : 'h-[460px]'} flex flex-col justify-between select-none`}>
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 p-4 text-center text-white border-b-2 border-amber-500 relative">
          <div className="text-[9px] font-black uppercase tracking-widest text-amber-300">COLLEGE IDENTITY BADGE</div>
          <h3 className="font-black text-sm leading-tight mt-0.5 truncate text-white">{schoolName}</h3>
          <p className="text-[9px] text-amber-200/80 truncate">{schoolAddress}</p>
        </div>

        <div className="p-3.5 flex flex-col items-center text-center flex-1 bg-white">
          <div className="w-20 h-20 rounded-full border-3 border-amber-500 overflow-hidden bg-amber-50 shadow-md mb-2 flex items-center justify-center shrink-0">
            {photo ? (
              <img src={photo.startsWith('http') || photo.startsWith('data:') ? photo : `http://localhost:5000/${photo}`} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-2xl font-black text-rose-950 uppercase">{name.charAt(0)}</div>
            )}
          </div>

          <h4 className="font-black text-base text-zinc-950 leading-tight truncate max-w-[240px]">{name}</h4>
          <span className="inline-block mt-1 px-3 py-0.5 text-[10px] font-extrabold rounded-full uppercase bg-amber-100 text-rose-950 border border-amber-400">
            {role}
          </span>

          <div className="w-full mt-3 space-y-1 text-[11px] text-left bg-amber-50/40 p-2.5 rounded-xl border border-amber-200">
            {role === 'Student' ? (
              <>
                <div className="flex justify-between"><span className="text-zinc-600 font-medium">Admission No:</span><span className="font-bold text-zinc-950">{admNo}</span></div>
                <div className="flex justify-between"><span className="text-zinc-600 font-medium">Class / Section:</span><span className="font-bold text-rose-900">{className} ({section})</span></div>
                <div className="flex justify-between"><span className="text-zinc-600 font-medium">Roll No:</span><span className="font-bold text-zinc-950">{rollNo}</span></div>
                <div className="flex justify-between"><span className="text-zinc-600 font-medium">Father Name:</span><span className="font-bold text-zinc-950 truncate max-w-[130px]">{fatherName}</span></div>
                <div className="flex justify-between"><span className="text-zinc-600 font-medium">Blood Group:</span><span className="font-bold text-rose-700">{bloodGroup}</span></div>
              </>
            ) : (
              <>
                <div className="flex justify-between"><span className="text-zinc-600 font-medium">Staff ID:</span><span className="font-bold text-zinc-950">{admNo}</span></div>
                <div className="flex justify-between"><span className="text-zinc-600 font-medium">Designation:</span><span className="font-bold text-rose-900">{designation}</span></div>
                <div className="flex justify-between"><span className="text-zinc-600 font-medium">Department:</span><span className="font-bold text-zinc-950">{department}</span></div>
              </>
            )}
            <div className="flex justify-between"><span className="text-zinc-600 font-medium">Emergency:</span><span className="font-mono text-zinc-950 text-[10px] font-bold">{phone}</span></div>
          </div>
        </div>

        <div className="bg-amber-100/60 px-3.5 py-2 text-[10px] text-amber-950 flex justify-between items-center border-t border-amber-300">
          <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-rose-950">
            <QrCode className="h-4 w-4 text-rose-900" />
            <span>CREST-{admNo}</span>
          </div>
          <span className="font-black text-rose-950 text-[9px]">Head of Institution</span>
        </div>
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
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700">Target Role <span className="text-rose-500">*</span></Label>
              <SearchableSelect
                name="role"
                value={role} 
                onChange={e => setRole(e.target.value)} 
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
                onChange={e => setSelectedTemplateId(e.target.value)} 
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
                  onChange={e => setClassFilter(e.target.value)}
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
                  onChange={e => setClassFilter(e.target.value)}
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
                  onChange={e => setSectionFilter(e.target.value)} 
                  options={[{ value: '', label: 'All Sections' }, ...sections.map(s => ({ value: s, label: s }))]}
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
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 text-xs shadow-xs flex items-center justify-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" /> 
                {loading ? 'Searching...' : 'Search'}
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

          <Button 
            type="button" 
            onClick={handlePrint}
            disabled={selectedIds.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Selected ({selectedIds.length})
          </Button>
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
          <h3 className="text-sm font-bold text-zinc-800">No Records Found</h3>
          <p className="text-xs text-zinc-500 mt-1">Try searching with a different class, section, or keyword filter.</p>
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setPreviewCard(rec)}
                          className="h-7 text-xs text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50 px-2"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> Inspect
                        </Button>
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
                className="h-9 text-xs border-zinc-200 text-zinc-700"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setSelectedIds([previewCard._id]);
                  setTimeout(() => window.print(), 200);
                }}
                className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" /> Print Single Card
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINT-ONLY OPTIMIZATION STYLESHEET ── */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, aside, header, footer, .sidebar, .navbar, .print\\:hidden {
            display: none !important;
          }
          .grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
            page-break-inside: avoid;
          }
          .rounded-2xl, .rounded-xl {
            border-radius: 8px !important;
            box-shadow: none !important;
            border: 1px solid #d4d4d8 !important;
          }
        }
      `}</style>
    </div>
  );
}
