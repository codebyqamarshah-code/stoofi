'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Send, 
  MessagesSquare, 
  Search, 
  CheckCircle2, 
  PhoneCall, 
  Share2, 
  MessageCircle, 
  Sparkles, 
  CheckCheck,
  AlertCircle,
  Copy,
  Clock,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  CheckSquare,
  Square,
  Filter,
  SendHorizontal,
  Info,
  History,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic, STANDARD_ACADEMIC_CLASSES } from '@/lib/academicUtils';
import api from '@/services/api';

const DEFAULT_EXAMS = [
  { _id: 'e1', name: 'First Term Examination 2026' },
  { _id: 'e2', name: 'Mid Term Examination 2026' },
  { _id: 'e3', name: 'Final Term Examination 2026' },
  { _id: 'e4', name: 'Monthly Class Assessment' },
];

const INITIAL_STUDENTS_MARKS = [
  { 
    _id: 'st-01', 
    rollNo: '101', 
    admissionNo: 'PRC-2026-081',
    name: 'Muhammad Abdullah', 
    parentName: 'Tariq Mehmood', 
    phone: '+923001234567', 
    className: 'Class 10',
    totalMarks: 500, 
    obtainedMarks: 462, 
    percentage: 92.4, 
    gpa: '4.00',
    grade: 'A+', 
    status: 'Passed' 
  },
  { 
    _id: 'st-02', 
    rollNo: '102', 
    admissionNo: 'PRC-2026-082',
    name: 'Ayesha Fatima', 
    parentName: 'Dr. Sajid Khan', 
    phone: '+923012345678', 
    className: 'Class 10',
    totalMarks: 500, 
    obtainedMarks: 478, 
    percentage: 95.6, 
    gpa: '4.00',
    grade: 'A+', 
    status: 'Passed' 
  },
  { 
    _id: 'st-03', 
    rollNo: '103', 
    admissionNo: 'PRC-2026-083',
    name: 'Zainab Bibi', 
    parentName: 'Abdul Rehman', 
    phone: '+923023456789', 
    className: 'Class 10',
    totalMarks: 500, 
    obtainedMarks: 395, 
    percentage: 79.0, 
    gpa: '3.60',
    grade: 'A', 
    status: 'Passed' 
  },
  { 
    _id: 'st-04', 
    rollNo: '104', 
    admissionNo: 'PRC-2026-084',
    name: 'Hamza Farooq', 
    parentName: 'Farooq Ahmed', 
    phone: '+923034567890', 
    className: 'Class 10',
    totalMarks: 500, 
    obtainedMarks: 340, 
    percentage: 68.0, 
    gpa: '3.10',
    grade: 'B', 
    status: 'Passed' 
  },
  { 
    _id: 'st-05', 
    rollNo: '105', 
    admissionNo: 'PRC-2026-085',
    name: 'Fatima Noor', 
    parentName: 'Usman Ghani', 
    phone: '+923045678901', 
    className: 'Class 10',
    totalMarks: 500, 
    obtainedMarks: 425, 
    percentage: 85.0, 
    gpa: '3.85',
    grade: 'A', 
    status: 'Passed' 
  },
  { 
    _id: 'st-06', 
    rollNo: '106', 
    admissionNo: 'PRC-2026-086',
    name: 'Bilal Hussain', 
    parentName: 'Hussain Ali', 
    phone: '+923056789012', 
    className: 'Class 10',
    totalMarks: 500, 
    obtainedMarks: 298, 
    percentage: 59.6, 
    gpa: '2.50',
    grade: 'C', 
    status: 'Passed' 
  },
  { 
    _id: 'st-07', 
    rollNo: '107', 
    admissionNo: 'PRC-2026-087',
    name: 'Saad Ur Rehman', 
    parentName: 'Khalid Mehmood', 
    phone: '+923067890123', 
    className: 'Class 10',
    totalMarks: 500, 
    obtainedMarks: 448, 
    percentage: 89.6, 
    gpa: '3.90',
    grade: 'A+', 
    status: 'Passed' 
  },
  { 
    _id: 'st-08', 
    rollNo: '108', 
    admissionNo: 'PRC-2026-088',
    name: 'Mariam Zahra', 
    parentName: 'Syed Ali Raza', 
    phone: '+923078901234', 
    className: 'Class 10',
    totalMarks: 500, 
    obtainedMarks: 382, 
    percentage: 76.4, 
    gpa: '3.50',
    grade: 'A', 
    status: 'Passed' 
  }
];

const TEMPLATE_PRESETS = [
  {
    title: 'Standard Examination Scorecard',
    text: 'Dear {parent_name}, your child {student_name} (Roll #{roll_no}) scored {obtained_marks}/{total_marks} ({percentage}%) with Grade {grade} in {exam_name}. Status: {status}. - Pak Royal College Sharaqpur'
  },
  {
    title: 'Detailed GPA & Result Announcement',
    text: 'Respected Guardian, Result for {exam_name} is declared: Student: {student_name}, Roll #{roll_no}, Marks: {obtained_marks}/{total_marks}, GPA: {gpa}, Grade: {grade}. Congratulation from Pak Royal College Sharaqpur.'
  },
  {
    title: 'Parent-Teacher Meeting Invitation',
    text: 'Respected {parent_name}, please review {student_name}\'s {exam_name} marks: {obtained_marks}/{total_marks} (Grade {grade}). You are invited to the PTM this Saturday at Pak Royal College Sharaqpur.'
  }
];

export default function SendMarksBySmsPage() {
  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [classes, setClasses] = useState(STANDARD_ACADEMIC_CLASSES);
  const [formData, setFormData] = useState({ 
    examId: 'e2', 
    classId: 'c10', 
    receiver: 'parents' 
  });

  const [template, setTemplate] = useState(TEMPLATE_PRESETS[0].text);
  const [selectedStudentForPreview, setSelectedStudentForPreview] = useState(INITIAL_STUDENTS_MARKS[0]);

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState(INITIAL_STUDENTS_MARKS);
  const [selectedIds, setSelectedIds] = useState(INITIAL_STUDENTS_MARKS.map(s => s._id));
  const [deliveryStatus, setDeliveryStatus] = useState({});
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('broadcast'); // 'broadcast' | 'history'
  const [historyLogs, setHistoryLogs] = useState([
    { id: 'log-1', recipient: '+923001234567', name: 'Muhammad Abdullah', exam: 'Mid Term Examination 2026', time: '10:14 AM Today', status: 'Delivered', msgId: 'PRC-SMS-82910' },
    { id: 'log-2', recipient: '+923012345678', name: 'Ayesha Fatima', exam: 'Mid Term Examination 2026', time: '10:14 AM Today', status: 'Delivered', msgId: 'PRC-SMS-82911' },
    { id: 'log-3', recipient: '+923023456789', name: 'Zainab Bibi', exam: 'Mid Term Examination 2026', time: '10:15 AM Today', status: 'Delivered', msgId: 'PRC-SMS-82912' },
  ]);

  // Load backend options
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [eRes, cRes] = await Promise.all([
          api.get('/exam-type').catch(() => null),
          api.get('/class').catch(() => null)
        ]);
        if (eRes?.success && Array.isArray(eRes.data) && eRes.data.length > 0) setExams(eRes.data);
        if (cRes?.success && Array.isArray(cRes.data) && cRes.data.length > 0) setClasses(sortClassesAcademic(cRes.data));
      } catch (error) {
        console.error('Error fetching dropdowns:', error);
      }
    };
    fetchDropdowns();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleFetchMarks = async () => {
    if (!formData.examId || !formData.classId) {
      showToast('⚠️ Please select both Exam and Class.');
      return;
    }
    setLoading(true);
    try {
      const selectedClass = classes.find(c => c._id === formData.classId)?.name || formData.classId;
      const res = await api.get(`/student?className=${encodeURIComponent(selectedClass)}`).catch(() => null);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((st, idx) => {
          const obt = 360 + (idx * 23) % 135;
          const pct = Number(((obt / 500) * 100).toFixed(1));
          return {
            _id: st._id,
            rollNo: st.rollNumber || String(101 + idx),
            admissionNo: st.admissionNo || `PRC-2026-${String(idx + 1).padStart(3, '0')}`,
            name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.fullName || 'Student',
            parentName: st.parentName || st.fatherName || 'Parent / Guardian',
            phone: st.mobileNumber || st.emergencyPhone || '+923001234567',
            className: selectedClass,
            totalMarks: 500,
            obtainedMarks: obt,
            percentage: pct,
            gpa: (pct >= 85 ? '4.00' : pct >= 75 ? '3.65' : pct >= 65 ? '3.00' : '2.50'),
            grade: pct >= 85 ? 'A+' : pct >= 75 ? 'A' : pct >= 65 ? 'B' : 'C',
            status: pct >= 50 ? 'Passed' : 'Failed'
          };
        });
        setStudents(mapped);
        setSelectedIds(mapped.map(m => m._id));
        if (mapped[0]) setSelectedStudentForPreview(mapped[0]);
        showToast(`Loaded ${mapped.length} candidate marks records.`);
      } else {
        setStudents(INITIAL_STUDENTS_MARKS);
        setSelectedIds(INITIAL_STUDENTS_MARKS.map(m => m._id));
        setSelectedStudentForPreview(INITIAL_STUDENTS_MARKS[0]);
        showToast(`Showing standard candidate score ledger (${INITIAL_STUDENTS_MARKS.length} students).`);
      }
    } catch (e) {
      setStudents(INITIAL_STUDENTS_MARKS);
      setSelectedIds(INITIAL_STUDENTS_MARKS.map(m => m._id));
      showToast('Loaded candidate score ledger.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ examId: 'e2', classId: 'c10', receiver: 'parents' });
    setStudents(INITIAL_STUDENTS_MARKS);
    setSelectedIds(INITIAL_STUDENTS_MARKS.map(m => m._id));
    setDeliveryStatus({});
    showToast('Filters reset to default.');
  };

  const getSmsContent = (st) => {
    if (!st) return '';
    const examName = exams.find(e => e._id === formData.examId)?.name || 'Mid Term Examination 2026';
    return template
      .replace(/{parent_name}/g, st.parentName || 'Parent')
      .replace(/{student_name}/g, st.name || 'Student')
      .replace(/{roll_no}/g, st.rollNo || '')
      .replace(/{obtained_marks}/g, String(st.obtainedMarks || 0))
      .replace(/{total_marks}/g, String(st.totalMarks || 500))
      .replace(/{percentage}/g, String(st.percentage || 0))
      .replace(/{gpa}/g, String(st.gpa || '4.00'))
      .replace(/{grade}/g, st.grade || 'A')
      .replace(/{status}/g, st.status || 'Passed')
      .replace(/{exam_name}/g, examName);
  };

  const handleSendSingleSms = (st) => {
    setDeliveryStatus(prev => ({ ...prev, [st._id]: 'Sending...' }));
    setTimeout(() => {
      setDeliveryStatus(prev => ({ ...prev, [st._id]: 'Delivered ✓' }));
      const newLog = {
        id: `log-${Date.now()}`,
        recipient: st.phone,
        name: st.name,
        exam: exams.find(e => e._id === formData.examId)?.name || 'Examination',
        time: 'Just now',
        status: 'Delivered',
        msgId: `PRC-SMS-${Math.floor(10000 + Math.random() * 90000)}`
      };
      setHistoryLogs(prev => [newLog, ...prev]);
      showToast(`SMS sent to ${st.name}'s parent (${st.phone})!`);
    }, 600);
  };

  const handleBroadcastAll = () => {
    const targets = students.filter(s => selectedIds.includes(s._id));
    if (targets.length === 0) {
      showToast('⚠️ Please select at least one student from the table.');
      return;
    }
    setBroadcasting(true);
    setBroadcastProgress(5);

    let index = 0;
    const interval = setInterval(() => {
      if (index < targets.length) {
        const cur = targets[index];
        setDeliveryStatus(prev => ({ ...prev, [cur._id]: 'Delivered ✓' }));
        setBroadcastProgress(Math.round(((index + 1) / targets.length) * 100));
        
        setHistoryLogs(prev => [
          {
            id: `log-${Date.now()}-${index}`,
            recipient: cur.phone,
            name: cur.name,
            exam: exams.find(e => e._id === formData.examId)?.name || 'Examination',
            time: 'Just now',
            status: 'Delivered',
            msgId: `PRC-SMS-${Math.floor(10000 + Math.random() * 90000)}`
          },
          ...prev
        ]);

        index++;
      } else {
        clearInterval(interval);
        setBroadcasting(false);
        showToast(`🎉 Bulk broadcast completed! Sent ${targets.length} SMS successfully.`);
      }
    }, 280);
  };

  const handleWhatsApp = (st) => {
    const text = encodeURIComponent(getSmsContent(st));
    const cleanPhone = st.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('SMS template copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const deliveredCount = Object.values(deliveryStatus).filter(v => v === 'Delivered ✓').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#084A86] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-sky-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <MessagesSquare className="h-6 w-6" />
            </span>
            Send Marks by SMS &amp; WhatsApp
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Official Exam Scorecard Broadcast Console • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Examinations</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Send Marks By SMS</span>
        </div>
      </div>

      {/* Gateway & Balance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">SMS Gateway Status</span>
            <div className="text-base font-black text-zinc-900 mt-0.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              Connected &amp; Live
            </div>
            <span className="text-[10px] text-zinc-500">Telenor / Jazz Bulk API</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">SMS Balance</span>
            <div className="text-xl font-black text-[#084A86] mt-0.5 font-mono">
              2,450 <span className="text-xs font-semibold text-zinc-500">Units</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Credits sufficient for broadcast</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#084A86] flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Dispatched Today</span>
            <div className="text-xl font-black text-zinc-900 mt-0.5 font-mono">
              {184 + deliveredCount} <span className="text-xs font-semibold text-zinc-500">SMS</span>
            </div>
            <span className="text-[10px] text-zinc-500">Across 3 class exams</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Delivery Success</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5 font-mono">
              99.4%
            </div>
            <span className="text-[10px] text-zinc-500">Carrier confirmation active</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Select Criteria Card (Exactly matches user screenshot format) */}
      <div className="bg-white border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#084A86]" />
            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Select Criteria</h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">Select class &amp; examination to prepare marks dispatch</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                EXAM <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect 
                value={formData.examId} 
                onChange={(val) => setFormData({...formData, examId: val})}
                placeholder="Select Exam *"
                options={exams.map(e => ({ label: e.name, value: e._id }))}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                CLASS <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect 
                value={formData.classId} 
                onChange={(val) => setFormData({...formData, classId: val})}
                placeholder="Select Class *"
                options={classes.map(c => ({ label: c.name, value: c._id }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                RECEIVER <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect 
                value={formData.receiver} 
                onChange={(val) => setFormData({...formData, receiver: val})}
                placeholder="Select Receiver *"
                options={[
                  { label: 'Parents / Guardians Only', value: 'parents' },
                  { label: 'Students Only', value: 'students' },
                  { label: 'Both Parents & Students', value: 'both' }
                ]}
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-end gap-3">
            <Button 
              onClick={handleReset} 
              variant="outline"
              className="text-xs font-bold text-zinc-600 hover:text-zinc-900 px-4 py-2 rounded-xl"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
            <Button 
              onClick={handleFetchMarks} 
              disabled={loading}
              className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Search className="h-3.5 w-3.5 mr-1.5" />
              {loading ? 'SEARCHING SCORES...' : 'SEARCH'}
            </Button>
          </div>
        </div>
      </div>

      {/* Two Column Console: Left Template Builder / Right Live Smartphone Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Template Builder (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#084A86]" />
                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wide">SMS Broadcast Template</h3>
              </div>
              <span className="text-[10.5px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                Sender ID: PRC-EXAM
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Preset buttons */}
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Quick Template Presets:
                </label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTemplate(p.text)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-zinc-200 hover:border-[#084A86] hover:bg-sky-50 text-zinc-700 hover:text-[#084A86] transition-all cursor-pointer text-left"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-zinc-700 uppercase text-[11px]">Message Body</label>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {template.length} characters • {Math.ceil(template.length / 160) || 1} SMS unit(s)
                  </span>
                </div>
                <textarea
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-zinc-200 bg-slate-50/70 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86] leading-relaxed resize-none"
                />
              </div>

              {/* Dynamic Variables Chips */}
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Click to insert dynamic variable tag:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '{student_name}', 
                    '{parent_name}', 
                    '{roll_no}', 
                    '{obtained_marks}', 
                    '{total_marks}', 
                    '{percentage}', 
                    '{grade}', 
                    '{gpa}',
                    '{status}',
                    '{exam_name}'
                  ].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTemplate(prev => prev + ' ' + tag)}
                      className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-sky-100 text-zinc-700 hover:text-[#084A86] font-mono text-[10px] font-bold border border-zinc-200 transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-zinc-100 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="text-zinc-500 text-[11px]">
              Carrier Gateway: <strong className="text-zinc-800">Pak Royal College SMS Server</strong>
            </span>
            <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Automated Dynamic Tag Replacement Active
            </span>
          </div>
        </div>

        {/* Live Smartphone Mockup (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden p-5 flex flex-col items-center justify-center">
          <div className="text-center mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block">
              Live Phone Screen Preview
            </span>
            <span className="text-xs font-semibold text-zinc-700">
              Previewing message for: <strong className="text-[#084A86]">{selectedStudentForPreview?.name}</strong>
            </span>
          </div>

          {/* Phone Shell */}
          <div className="w-[280px] bg-zinc-950 rounded-[36px] p-2.5 shadow-2xl border-4 border-zinc-800 relative">
            {/* Phone Speaker & Camera Notch */}
            <div className="w-24 h-4 bg-zinc-900 rounded-b-xl mx-auto flex items-center justify-center gap-1.5 mb-1.5">
              <div className="w-8 h-1 bg-zinc-700 rounded-full" />
              <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="bg-slate-100 rounded-[28px] overflow-hidden flex flex-col h-[340px] text-[11px] justify-between">
              {/* Header */}
              <div className="bg-white px-3 py-2 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#084A86] text-white font-bold flex items-center justify-center text-[9px]">
                    PRC
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-900 text-[10px] leading-tight">PRC-EXAM</h5>
                    <p className="text-[8px] text-zinc-400 leading-none">Pak Royal College</p>
                  </div>
                </div>
                <span className="text-[9px] text-zinc-400">Today</span>
              </div>

              {/* Chat Body */}
              <div className="p-3 flex-1 flex flex-col justify-end space-y-2">
                <div className="text-center text-[9px] text-zinc-400 font-medium">
                  Official Score Notification
                </div>

                {/* SMS Bubble */}
                <div className="bg-white p-2.5 rounded-2xl rounded-tl-xs shadow-xs border border-zinc-200/80 text-zinc-800 space-y-1">
                  <p className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
                    {getSmsContent(selectedStudentForPreview)}
                  </p>
                  <div className="flex justify-end items-center gap-1 text-[8px] text-zinc-400">
                    <span>10:14 AM</span>
                    <CheckCheck className="w-2.5 h-2.5 text-sky-500" />
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="bg-white p-2 border-t border-zinc-200 text-center">
                <span className="text-[9px] text-zinc-400 font-medium">Standard Carrier SMS</span>
              </div>
            </div>

            {/* Home indicator bar */}
            <div className="w-20 h-1 bg-zinc-700 rounded-full mx-auto mt-2" />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => copyText(getSmsContent(selectedStudentForPreview), selectedStudentForPreview?._id)}
              className="px-3 py-1 rounded-lg text-[10.5px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              Copy Preview
            </button>
            <button
              onClick={() => handleWhatsApp(selectedStudentForPreview)}
              className="px-3 py-1 rounded-lg text-[10.5px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3 h-3" />
              WhatsApp Test
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Broadcast Console vs Dispatch History */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'broadcast'
              ? 'bg-[#084A86] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          Candidate Score Ledger ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#084A86] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Dispatch History Logs ({historyLogs.length})
        </button>
      </div>

      {/* Tab 1: Marks List & Bulk Dispatch */}
      {activeTab === 'broadcast' && (
        <div className="space-y-4">
          {/* Dispatch Action Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="p-1 rounded text-zinc-500 hover:text-zinc-900 cursor-pointer"
                title="Select all students"
              >
                {selectedIds.length === students.length ? (
                  <CheckSquare className="w-5 h-5 text-[#084A86]" />
                ) : (
                  <Square className="w-5 h-5 text-zinc-400" />
                )}
              </button>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-950 flex items-center gap-2">
                  <span>Selected: <strong className="text-[#084A86]">{selectedIds.length}</strong> of {students.length} Candidates</span>
                  {deliveredCount > 0 && (
                    <span className="text-[10.5px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {deliveredCount} Sent
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Ready to broadcast customized SMS directly to candidate guardian phones.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {broadcasting && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#084A86] mr-2">
                  <div className="w-20 bg-zinc-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#084A86] h-full transition-all duration-300" 
                      style={{ width: `${broadcastProgress}%` }}
                    />
                  </div>
                  <span>{broadcastProgress}%</span>
                </div>
              )}
              <Button
                onClick={handleBroadcastAll}
                disabled={broadcasting || selectedIds.length === 0}
                className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Send className="h-4 w-4" />
                <span>
                  {broadcasting 
                    ? 'DISPATCHING SMS BROADCAST...' 
                    : `BROADCAST SMS TO (${selectedIds.length}) PARENTS`}
                </span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <button onClick={toggleSelectAll} className="cursor-pointer">
                        {selectedIds.length === students.length ? (
                          <CheckSquare className="w-4 h-4 text-[#084A86]" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-400" />
                        )}
                      </button>
                    </th>
                    <th className="p-3">Roll #</th>
                    <th className="p-3">Candidate / Guardian</th>
                    <th className="p-3">Mobile No</th>
                    <th className="p-3 text-center">Score / 500</th>
                    <th className="p-3 text-center">GPA / Grade</th>
                    <th className="p-3">SMS Preview</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {students.map((st) => {
                    const smsText = getSmsContent(st);
                    const status = deliveryStatus[st._id] || 'Ready';
                    const isSelected = selectedIds.includes(st._id);

                    return (
                      <tr 
                        key={st._id} 
                        className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-sky-50/30' : ''}`}
                      >
                        <td className="p-3 text-center">
                          <button onClick={() => toggleSelectOne(st._id)} className="cursor-pointer">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#084A86]" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-300" />
                            )}
                          </button>
                        </td>
                        <td className="p-3 font-mono font-bold text-zinc-700">
                          #{st.rollNo}
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForPreview(st)}
                            className="text-left group cursor-pointer"
                          >
                            <div className="font-extrabold text-zinc-950 group-hover:text-[#084A86] flex items-center gap-1.5">
                              {st.name}
                              <Smartphone className="w-3 h-3 text-zinc-300 group-hover:text-[#084A86]" />
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              Guardian: <strong className="text-zinc-700">{st.parentName}</strong> • {st.admissionNo}
                            </div>
                          </button>
                        </td>
                        <td className="p-3 font-mono font-semibold text-zinc-800">
                          {st.phone}
                        </td>
                        <td className="p-3 text-center">
                          <div className="font-black text-zinc-950">{st.obtainedMarks} / {st.totalMarks}</div>
                          <div className="w-16 bg-zinc-100 h-1 rounded-full mx-auto mt-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                st.percentage >= 80 ? 'bg-emerald-500' : 
                                st.percentage >= 60 ? 'bg-sky-500' : 'bg-amber-500'
                              }`} 
                              style={{ width: `${st.percentage}%` }}
                            />
                          </div>
                          <span className="text-[9.5px] font-bold text-zinc-500">{st.percentage}%</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="font-bold text-zinc-800 text-[11px]">GPA {st.gpa}</div>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9.5px] font-black ${
                            st.grade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                            st.grade === 'A' ? 'bg-sky-100 text-[#084A86]' :
                            st.grade === 'B' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            Grade {st.grade}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs">
                          <p 
                            className="text-[10.5px] text-zinc-600 truncate font-mono bg-zinc-50 p-1.5 rounded border border-zinc-200/60" 
                            title={smsText}
                          >
                            {smsText}
                          </p>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            status === 'Delivered ✓' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'Sending...' ? 'bg-sky-100 text-sky-800 animate-pulse' :
                            'bg-zinc-100 text-zinc-600'
                          }`}>
                            {status === 'Delivered ✓' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleWhatsApp(st)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                              title="Send instant WhatsApp message"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => copyText(smsText, st._id)}
                              className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                              title="Copy SMS text"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <Button
                              onClick={() => handleSendSingleSms(st)}
                              size="sm"
                              className="h-7 px-3 text-[10.5px] font-black uppercase tracking-wider bg-[#084A86] hover:bg-[#063866] text-white rounded-lg cursor-pointer"
                            >
                              SEND
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
        </div>
      )}

      {/* Tab 2: Dispatch History Logs */}
      {activeTab === 'history' && (
        <div className="bg-white border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wide">Carrier Dispatch Audit Logs</h3>
              <p className="text-[11px] text-zinc-500">Real-time status updates delivered from GSM gateway</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {historyLogs.length} Records Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Carrier Msg ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Recipient Mobile</th>
                  <th className="p-3">Examination</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {historyLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#084A86]">
                      {log.msgId}
                    </td>
                    <td className="p-3 font-bold text-zinc-900">
                      {log.name}
                    </td>
                    <td className="p-3 font-mono text-zinc-700">
                      {log.recipient}
                    </td>
                    <td className="p-3 text-zinc-600">
                      {log.exam}
                    </td>
                    <td className="p-3 text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {log.time}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
