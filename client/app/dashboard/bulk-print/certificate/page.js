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
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/exportUtils';

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
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [certDate, setCertDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchStudentText, setSearchStudentText] = useState('');

  // Student list & Selection
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [generating, setGenerating] = useState(false);
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
        // By default select all returned matching students
        setSelectedIds(res.data.map(s => s._id));
      } else {
        setStudents([]);
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
      setSelectedIds([]);
      showToast('Failed to load students from database.', true);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classFilter, sectionFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchStudents();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchStudentText]);

  // Active Template
  const activeTemplate = useMemo(() => {
    return templates.find(t => t._id === selectedTemplateId) || templates[0] || null;
  }, [templates, selectedTemplateId]);

  // Selection toggles
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length && students.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s._id));
    }
  };

  // Dynamic placeholder replacer with live student & school data
  const renderStudentCertificateText = (templateText, student) => {
    if (!templateText) return '';
    const formattedDate = certDate 
      ? new Date(certDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.name || 'Student Name';
    const schoolName = schoolSetting?.schoolName || 'Stoofi Public School & College';
    const schoolAddress = schoolSetting?.address || 'Main Campus, Lahore, Pakistan';
    const schoolPhone = schoolSetting?.phone || '+92 300 1234567';
    const academicSession = sessionFilter || student.academicYear || schoolSetting?.academicYear || `${new Date().getFullYear()} [Jan-Dec]`;
    const certNumber = student.tcNo || `CERT-${new Date().getFullYear()}-${student.admissionNo || '001'}`;

    const map = {
      '[student_name]': fullName,
      '{{studentName}}': fullName,
      '[father_name]': student.fatherName || '-',
      '{{fatherName}}': student.fatherName || '-',
      '[mother_name]': student.motherName || '-',
      '[guardian_name]': student.guardianName || student.fatherName || '-',
      '[admission_no]': student.admissionNo || '-',
      '{{admissionNumber}}': student.admissionNo || '-',
      '[roll_no]': student.rollNo || '-',
      '{{rollNumber}}': student.rollNo || '-',
      '[class_name]': student.className || '-',
      '{{class}}': student.className || '-',
      '[section]': student.section || '-',
      '{{section}}': student.section || '-',
      '[academic_session]': academicSession,
      '{{academicSession}}': academicSession,
      '[academic_year]': academicSession,
      '[dob]': student.dob || '-',
      '[gender]': student.gender || '-',
      '[school_name]': schoolName,
      '{{schoolName}}': schoolName,
      '[school_address]': schoolAddress,
      '{{schoolAddress}}': schoolAddress,
      '[school_phone]': schoolPhone,
      '[certificate_date]': formattedDate,
      '{{certificateDate}}': formattedDate,
      '[issue_date]': formattedDate,
      '[date]': formattedDate,
      '[tc_no]': certNumber,
      '[certificate_no]': certNumber,
      '{{certificateNumber}}': certNumber
    };

    let result = templateText;
    Object.keys(map).forEach(placeholder => {
      result = result.split(placeholder).join(map[placeholder]);
    });
    return result;
  };

  const handlePrintBatch = () => {
    if (selectedStudents.length === 0) {
      showToast('Please select at least one student to print.', true);
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      window.print();
      setGenerating(false);
    }, 200);
  };

  const handlePrintSingle = (student) => {
    setPreviewStudent(student);
  };

  const handleExportList = (type) => {
    const selected = students.filter(s => selectedIds.includes(s._id));
    if (selected.length === 0) {
      showToast('Please select at least one student to export.', true);
      return;
    }

    const exportData = selected.map((s, idx) => ({
      'SL': idx + 1,
      'Certificate ID': `CERT-${new Date().getFullYear()}-${s.admissionNo || idx + 1}`,
      'Student Name': `${s.firstName || ''} ${s.lastName || ''}`.trim(),
      'Admission No': s.admissionNo,
      'Roll No': s.rollNo || '-',
      'Class': s.className,
      'Section': s.section || '-',
      'Father Name': s.fatherName || '-',
      'Template Title': activeTemplate?.title || 'Certificate',
      'Issue Date': certDate,
      'Academic Session': sessionFilter || s.academicYear || '2026'
    }));

    const headers = Object.keys(exportData[0] || {});
    const filename = `Issued_Certificates_${Date.now()}`;

    if (type === 'CSV') {
      exportToCSV(exportData, filename);
      showToast('CSV export downloaded successfully!');
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename, 'Certificates');
      showToast('Excel export downloaded successfully!');
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Certificate Issuance Register', filename);
      showToast('PDF summary downloaded successfully!');
    }
  };

  const selectedStudents = students.filter(s => selectedIds.includes(s._id));

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
        <p className="text-xs text-zinc-500 font-medium">Loading Certificate Generator...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
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

      {/* Printable styles override */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden, header, nav, aside, footer {
            display: none !important;
          }
          .certificate-print-canvas {
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border-width: 6px !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 2.5rem !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <Award className="h-6 w-6 text-zinc-900" />
            Generate & Print Certificates
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Generate and batch-print official Character, Leaving, Bonafide, and Merit Certificates using institutional templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/certificate"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 text-xs font-semibold shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-500" />
            Certificate Templates
          </Link>
          <div className="hidden md:flex items-center text-xs text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg">
            <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-700 transition-colors">Admin Section</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-bold">Generate Certificate</span>
          </div>
        </div>
      </div>

      {/* No Templates Warning */}
      {templates.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900 flex items-start gap-3 print:hidden">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm">No Active Certificate Templates Found</p>
            <p className="text-amber-800">
              There are no active certificate templates in the database. You must create or activate a template before generating certificates.
            </p>
            <Link
              href="/dashboard/admin/certificate"
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 underline mt-2"
            >
              Go to Certificate Templates →
            </Link>
          </div>
        </div>
      )}

      {/* Criteria Selection Bar */}
      {templates.length > 0 && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-5 space-y-4 print:hidden">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              1. Select Criteria & Certificate Configuration
            </h2>
            {activeTemplate && (
              <span className="text-[11px] font-medium text-zinc-500">
                Active Theme: <strong className="text-zinc-900 uppercase">{activeTemplate.themeStyle}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Template Selector */}
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Certificate Template <span className="text-rose-500">*</span>
              </Label>
              <select 
                value={selectedTemplateId} 
                onChange={e => setSelectedTemplateId(e.target.value)} 
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-900" 
                required
              >
                {templates.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.title} ({t.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Class Filter
              </Label>
              <select 
                value={classFilter} 
                onChange={e => setClassFilter(e.target.value)} 
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Section Filter
              </Label>
              <select 
                value={sectionFilter} 
                onChange={e => setSectionFilter(e.target.value)} 
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="">All Sections</option>
                {sections.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Certificate Issue Date
              </Label>
              <Input
                type="date"
                value={certDate}
                onChange={e => setCertDate(e.target.value)}
                className="h-9 text-xs bg-white border-zinc-300 text-zinc-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2 border-t border-zinc-100">
            {/* Academic Session Override */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Academic Session
              </Label>
              <Input
                value={sessionFilter}
                onChange={e => setSessionFilter(e.target.value)}
                placeholder="e.g. 2026 [Jan-Dec]"
                className="h-9 text-xs bg-white border-zinc-300 text-zinc-950"
              />
            </div>

            {/* Quick Search Student */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Search Students
              </Label>
              <div className="relative">
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
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results & Action Toolbar */}
      {templates.length > 0 && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-zinc-200 shadow-xs rounded-xl p-4 print:hidden">
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={toggleSelectAll} 
                className="flex items-center gap-2 text-xs font-semibold text-zinc-950 hover:text-zinc-700 cursor-pointer"
              >
                {selectedIds.length === students.length && students.length > 0 ? (
                  <CheckSquare className="h-4 w-4 text-emerald-600" />
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
              {/* Export Generated List */}
              <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                <button onClick={() => handleExportList('Excel')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 text-xs font-medium" title="Export Excel">
                  <Download className="h-3.5 w-3.5 text-emerald-600" />
                </button>
                <button onClick={() => handleExportList('CSV')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 text-xs font-medium border-l border-zinc-200" title="Export CSV">
                  <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                </button>
                <button onClick={() => handleExportList('PDF')} className="px-2.5 py-1.5 hover:bg-zinc-50 text-zinc-600 text-xs font-medium border-l border-zinc-200" title="Export PDF">
                  <Download className="h-3.5 w-3.5 text-rose-600" />
                </button>
              </div>

              {/* Refresh */}
              <Button
                onClick={fetchStudents}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 text-zinc-600 border-zinc-300 hover:bg-zinc-100"
                title="Refresh student list"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>

              {/* Batch Print Button */}
              <Button 
                onClick={handlePrintBatch} 
                disabled={selectedStudents.length === 0 || generating}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs shadow-xs flex items-center gap-2 px-5 h-9"
              >
                {generating ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Preparing...
                  </span>
                ) : (
                  <>
                    <Printer className="h-4 w-4 text-emerald-400" />
                    PRINT SELECTED ({selectedStudents.length})
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Student Certificates List */}
          {loadingStudents ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-16 text-center text-zinc-500 print:hidden">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-zinc-800" />
              <p className="text-xs font-medium">Fetching live student records from MongoDB...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-16 text-center text-zinc-500 print:hidden">
              <User className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
              <p className="text-sm font-bold text-zinc-900">No Student Records Found</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                {classFilter || sectionFilter || searchStudentText 
                  ? 'No students match your selected class, section, or search criteria.'
                  : 'Add students to the directory to generate official certificates.'}
              </p>
              <Button
                onClick={() => { setClassFilter(''); setSectionFilter(''); setSearchStudentText(''); }}
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {students.map(st => {
                const isSelected = selectedIds.includes(st._id);
                const fullName = `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.name || 'Student Name';
                const schoolName = schoolSetting?.schoolName || 'Stoofi Public School & College';
                const schoolAddress = schoolSetting?.address || 'Main Campus, Lahore, Pakistan';
                const schoolPhone = schoolSetting?.phone || '+92 300 1234567';
                const formattedDate = certDate 
                  ? new Date(certDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                  : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                
                const theme = activeTemplate?.themeStyle || 'stoofi-emerald';
                const isEmerald = theme === 'stoofi-emerald';
                const isGold = theme === 'classic-gold';
                const isNavy = theme === 'academic-navy';

                return (
                  <div 
                    key={st._id} 
                    className={`transition-all duration-200 ${
                      isSelected ? '' : 'opacity-40 print:hidden'
                    }`}
                  >
                    {/* Select Checkbox Bar in Web View */}
                    <div className="flex items-center justify-between bg-zinc-50 border border-b-0 border-zinc-200 rounded-t-xl px-4 py-2.5 print:hidden">
                      <label className="flex items-center gap-2.5 text-xs font-semibold text-zinc-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(st._id)}
                          className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-bold">{fullName}</span>
                        <span className="text-[11px] font-mono text-zinc-500 font-normal">
                          (Adm: {st.admissionNo || '-'} | Roll: {st.rollNo || '-'} | Class: {st.className || '-'} {st.section ? `- ${st.section}` : ''})
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintSingle(st)}
                          className="h-7 text-xs text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60 px-2 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                        </Button>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                        }`}>
                          {isSelected ? 'Selected' : 'Skipped'}
                        </span>
                      </div>
                    </div>

                    {/* Official Certificate Canvas */}
                    <div className={`certificate-print-canvas bg-white text-zinc-900 border-8 border-double rounded-b-xl ${!isSelected ? 'rounded-t-xl' : ''} p-8 sm:p-14 max-w-4xl mx-auto shadow-xl relative overflow-hidden ${
                      isEmerald ? 'border-emerald-800/85' :
                      isGold ? 'border-amber-600/85' :
                      isNavy ? 'border-sky-950/85' :
                      'border-zinc-800/85'
                    }`}>
                      {/* Corner Accents */}
                      <div className="absolute top-3 left-3 text-[11px] font-serif text-zinc-400 tracking-widest">★ ★ ★</div>
                      <div className="absolute top-3 right-3 text-[11px] font-serif text-zinc-400 tracking-widest">★ ★ ★</div>
                      <div className="absolute bottom-3 left-3 text-[11px] font-serif text-zinc-400 tracking-widest">★ ★ ★</div>
                      <div className="absolute bottom-3 right-3 text-[11px] font-serif text-zinc-400 tracking-widest">★ ★ ★</div>

                      {/* Header */}
                      <div className="text-center border-b-2 border-zinc-200 pb-6 mb-8">
                        <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wide font-serif text-zinc-950">
                          {schoolName}
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                          {schoolAddress} • {schoolPhone}
                        </p>
                        
                        <div className={`inline-block mt-4 px-6 py-1.5 rounded-full border ${
                          isEmerald ? 'bg-emerald-50 text-emerald-950 border-emerald-300' :
                          isGold ? 'bg-amber-50 text-amber-950 border-amber-300' :
                          isNavy ? 'bg-sky-50 text-sky-950 border-sky-300' :
                          'bg-zinc-100 text-zinc-900 border-zinc-300'
                        }`}>
                          <span className="text-sm sm:text-lg font-bold uppercase tracking-widest font-serif">
                            {activeTemplate?.headerTitle || activeTemplate?.title || 'CERTIFICATE'}
                          </span>
                        </div>

                        {activeTemplate?.headerSubtitle && (
                          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mt-2 font-serif">
                            {activeTemplate.headerSubtitle}
                          </div>
                        )}
                      </div>

                      {/* Dynamic Certificate Text Body */}
                      <div className="text-center space-y-6 text-base sm:text-lg text-zinc-800 leading-relaxed font-serif px-2 sm:px-8">
                        <p className="whitespace-pre-line text-justify sm:text-center">
                          {renderStudentCertificateText(activeTemplate?.templateBody, st)}
                        </p>
                      </div>

                      {/* Signatures & Footer */}
                      <div className="mt-16 pt-8 border-t border-zinc-300 grid grid-cols-3 text-center font-serif text-xs sm:text-sm">
                        <div>
                          <p className="font-bold text-zinc-900">{formattedDate}</p>
                          <p className="text-[11px] text-zinc-500 uppercase mt-1 border-t border-zinc-300 pt-1">
                            {activeTemplate?.footerLeft || 'Date of Issue'}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold text-zinc-900">Checked By</p>
                          <p className="text-[11px] text-zinc-500 uppercase mt-1 border-t border-zinc-300 pt-1">
                            {activeTemplate?.footerCenter || 'Class Teacher'}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold text-zinc-900">Authorized Signature</p>
                          <p className="text-[11px] text-zinc-500 uppercase mt-1 border-t border-zinc-300 pt-1">
                            {activeTemplate?.footerRight || 'Principal / Seal'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SINGLE STUDENT PREVIEW MODAL */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-4xl w-full my-6 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/70 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700" />
                <div>
                  <h2 className="text-base font-bold text-zinc-950">
                    Certificate Preview — {previewStudent.firstName} {previewStudent.lastName || ''}
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    Adm No: {previewStudent.admissionNo || '-'} | Class: {previewStudent.className || '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 h-8 px-3"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  Print
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPreviewStudent(null)} 
                  className="text-zinc-400 hover:text-zinc-700 h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body / Canvas */}
            <div className="p-6 overflow-y-auto flex-1 bg-zinc-100/60">
              <div className={`bg-white rounded-xl shadow-md border-8 border-double p-8 sm:p-12 max-w-3xl mx-auto relative ${
                activeTemplate?.themeStyle === 'stoofi-emerald' ? 'border-emerald-800/85 text-zinc-900' :
                activeTemplate?.themeStyle === 'classic-gold' ? 'border-amber-600/85 text-zinc-900' :
                activeTemplate?.themeStyle === 'academic-navy' ? 'border-sky-950/85 text-zinc-900' :
                'border-zinc-800/85 text-zinc-900'
              }`}>
                {/* Institutional Header */}
                <div className="text-center border-b pb-5 mb-6 border-zinc-200">
                  <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide font-serif text-zinc-950">
                    {schoolSetting?.schoolName || 'Stoofi Public School & College'}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {schoolSetting?.address || 'Main Campus, Lahore, Pakistan'} • {schoolSetting?.phone || '+92 300 1234567'}
                  </p>
                  <div className="inline-block mt-3 px-5 py-1 rounded-full border bg-zinc-50 border-zinc-300">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest font-serif text-zinc-900">
                      {activeTemplate?.headerTitle || activeTemplate?.title || 'CERTIFICATE'}
                    </span>
                  </div>
                  {activeTemplate?.headerSubtitle && (
                    <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mt-1.5 font-serif">
                      {activeTemplate.headerSubtitle}
                    </div>
                  )}
                </div>

                {/* Certificate Text Body */}
                <div className="text-center space-y-4 text-sm sm:text-base text-zinc-800 leading-relaxed font-serif px-2 sm:px-6">
                  <p className="whitespace-pre-line text-justify sm:text-center">
                    {renderStudentCertificateText(activeTemplate?.templateBody, previewStudent)}
                  </p>
                </div>

                {/* Signatures & Footer */}
                <div className="mt-14 pt-6 border-t border-zinc-200 grid grid-cols-3 text-center font-serif text-xs">
                  <div>
                    <p className="font-bold text-zinc-900">
                      {certDate ? new Date(certDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB')}
                    </p>
                    <p className="text-[10px] text-zinc-500 uppercase mt-1 border-t border-zinc-300 pt-1">
                      {activeTemplate?.footerLeft || 'Date of Issue'}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-zinc-900">Checked By</p>
                    <p className="text-[10px] text-zinc-500 uppercase mt-1 border-t border-zinc-300 pt-1">
                      {activeTemplate?.footerCenter || 'Class Teacher'}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-zinc-900">Authorized Signature</p>
                    <p className="text-[10px] text-zinc-500 uppercase mt-1 border-t border-zinc-300 pt-1">
                      {activeTemplate?.footerRight || 'Principal'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50/70 flex justify-end gap-2 shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPreviewStudent(null)}
                className="text-xs"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BulkPrintCertificatePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-800" />
        <p className="text-xs text-zinc-500 font-medium">Loading Certificate Generator...</p>
      </div>
    }>
      <GenerateCertificateContent />
    </Suspense>
  );
}
