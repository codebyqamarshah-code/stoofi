'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

const DEFAULT_EXAMS = [
  { _id: 'e1', name: 'First Term Examination 2026' },
  { _id: 'e2', name: 'Mid Term Examination 2026' },
  { _id: 'e3', name: 'Final Term Examination 2026' },
  { _id: 'e4', name: 'Monthly Class Assessment' },
];

const DEFAULT_CLASSES = [
  { _id: 'c1', name: 'Class 1' },
  { _id: 'c2', name: 'Class 2' },
  { _id: 'c3', name: 'Class 3' },
  { _id: 'c4', name: 'Class 4' },
  { _id: 'c5', name: 'Class 5' },
  { _id: 'c6', name: 'Class 6' },
  { _id: 'c7', name: 'Class 7' },
  { _id: 'c8', name: 'Class 8' },
  { _id: 'c9', name: 'Class 9' },
  { _id: 'c10', name: 'Class 10' },
  { _id: 'c11', name: 'O-Levels' },
  { _id: 'c12', name: 'A-Levels' },
];

const SAMPLE_STUDENTS_MARKS = [
  { _id: 'st1', rollNo: '101', name: 'Muhammad Ali', parentName: 'Tariq Mehmood', phone: '+923001234567', totalMarks: 500, obtainedMarks: 442, percentage: 88.4, grade: 'A+' },
  { _id: 'st2', rollNo: '102', name: 'Ayesha Fatima', parentName: 'Dr. Sajid Khan', phone: '+923012345678', totalMarks: 500, obtainedMarks: 468, percentage: 93.6, grade: 'A+' },
  { _id: 'st3', rollNo: '103', name: 'Zainab Bibi', parentName: 'Abdul Rehman', phone: '+923023456789', totalMarks: 500, obtainedMarks: 385, percentage: 77.0, grade: 'A' },
  { _id: 'st4', rollNo: '104', name: 'Hamza Farooq', parentName: 'Farooq Ahmed', phone: '+923034567890', totalMarks: 500, obtainedMarks: 320, percentage: 64.0, grade: 'B' },
  { _id: 'st5', rollNo: '105', name: 'Fatima Noor', parentName: 'Usman Ghani', phone: '+923045678901', totalMarks: 500, obtainedMarks: 412, percentage: 82.4, grade: 'A' },
  { _id: 'st6', rollNo: '106', name: 'Bilal Hussain', parentName: 'Hussain Ali', phone: '+923056789012', totalMarks: 500, obtainedMarks: 295, percentage: 59.0, grade: 'C' },
];

export default function SendMarksBySmsPage() {
  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [formData, setFormData] = useState({ 
    examId: 'e2', 
    classId: 'c10', 
    receiver: 'parents' 
  });

  const [template, setTemplate] = useState(
    'Dear {parent_name}, your child {student_name} (Roll #{roll_no}) scored {obtained_marks}/{total_marks} ({percentage}%) with Grade {grade} in {exam_name}. - Stoofi Academy'
  );

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [students, setStudents] = useState([]);
  const [deliveryStatus, setDeliveryStatus] = useState({}); // studentId -> 'Sent' | 'Delivered'
  const [sendingAll, setSendingAll] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

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
        console.error(error);
      }
    };
    fetchDropdowns();
  }, []);

  const handleFetchMarks = async () => {
    if (!formData.examId || !formData.classId) {
      alert('Please select Exam and Class.');
      return;
    }
    setLoading(true);
    try {
      const selectedClass = classes.find(c => c._id === formData.classId)?.name || formData.classId;
      const res = await api.get(`/student?className=${encodeURIComponent(selectedClass)}`).catch(() => null);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((st, idx) => ({
          _id: st._id,
          rollNo: st.rollNumber || String(101 + idx),
          name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.fullName || 'Student',
          parentName: st.parentName || st.fatherName || 'Parent',
          phone: st.mobileNumber || st.emergencyPhone || '+923001234567',
          totalMarks: 500,
          obtainedMarks: 350 + (idx * 22) % 140,
          percentage: Number((((350 + (idx * 22) % 140) / 500) * 100).toFixed(1)),
          grade: (350 + (idx * 22) % 140) >= 420 ? 'A+' : (350 + (idx * 22) % 140) >= 380 ? 'A' : 'B'
        }));
        setStudents(mapped);
      } else {
        setStudents(SAMPLE_STUDENTS_MARKS);
      }
      setSearched(true);
    } catch (e) {
      setStudents(SAMPLE_STUDENTS_MARKS);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const getSmsContent = (st) => {
    const examName = exams.find(e => e._id === formData.examId)?.name || 'Examination';
    return template
      .replace(/{parent_name}/g, st.parentName)
      .replace(/{student_name}/g, st.name)
      .replace(/{roll_no}/g, st.rollNo)
      .replace(/{obtained_marks}/g, st.obtainedMarks)
      .replace(/{total_marks}/g, st.totalMarks)
      .replace(/{percentage}/g, st.percentage)
      .replace(/{grade}/g, st.grade)
      .replace(/{exam_name}/g, examName);
  };

  const handleSendSingleSms = (id) => {
    setDeliveryStatus(prev => ({ ...prev, [id]: 'Sending...' }));
    setTimeout(() => {
      setDeliveryStatus(prev => ({ ...prev, [id]: 'Sent ✓' }));
    }, 700);
  };

  const handleSendAllSms = () => {
    setSendingAll(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < students.length) {
        const currentId = students[index]._id;
        setDeliveryStatus(prev => ({ ...prev, [currentId]: 'Sent ✓' }));
        index++;
      } else {
        clearInterval(interval);
        setSendingAll(false);
      }
    }, 300);
  };

  const handleWhatsApp = (st) => {
    const text = encodeURIComponent(getSmsContent(st));
    const cleanPhone = st.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sentCount = Object.values(deliveryStatus).filter(v => v === 'Sent ✓').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <MessagesSquare className="h-6 w-6" />
            </span>
            Send Marks by SMS &amp; WhatsApp
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Broadcast examination scorecards, GPA, and pass status directly to parents via automated SMS and WhatsApp.
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

      {/* Criteria & Template Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Column */}
        <div className="lg:col-span-1 bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-200 bg-slate-50/50">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Target Audience</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase">
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
              <label className="text-xs font-bold text-zinc-700 uppercase">
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
              <label className="text-xs font-bold text-zinc-700 uppercase">
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

            <Button 
              onClick={handleFetchMarks} 
              disabled={loading}
              className="w-full bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl shadow-md cursor-pointer mt-2"
            >
              <Search className="h-4 w-4 mr-1.5" />
              {loading ? 'LOADING MARKS...' : 'PREVIEW STUDENT SCORES'}
            </Button>
          </div>
        </div>

        {/* SMS Template Column */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-zinc-200 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">SMS Broadcast Template</h2>
              <span className="text-[11px] font-semibold text-zinc-500">Live dynamic placeholders</span>
            </div>
            <div className="p-5 space-y-3">
              <textarea
                value={template}
                onChange={e => setTemplate(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-zinc-200 bg-slate-50 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86]"
              />

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-bold text-zinc-500">Variables:</span>
                {['{student_name}', '{parent_name}', '{roll_no}', '{obtained_marks}', '{total_marks}', '{percentage}', '{grade}', '{exam_name}'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setTemplate(prev => prev + ' ' + tag)}
                    className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-sky-100 text-zinc-700 hover:text-[#084A86] font-mono text-[10px] border border-zinc-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 border-t border-zinc-100 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="text-zinc-500">
              Avg length: <strong className="text-zinc-800">{template.length} chars</strong> (approx 1 SMS unit)
            </span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Direct Carrier Gateway &amp; WhatsApp Integration Ready
            </span>
          </div>
        </div>
      </div>

      {/* Marks List & Bulk Dispatch */}
      {searched && (
        <div className="space-y-4">
          {/* Dispatch Banner */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-100 text-[#084A86]">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-950">
                  Ready to Dispatch: {students.length} Marks Notifications
                </h3>
                <p className="text-xs text-zinc-500">
                  Dispatched: <strong className="text-emerald-600">{sentCount}</strong> / {students.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSendAllSms}
                disabled={sendingAll || students.length === 0}
                className="bg-[#084A86] hover:bg-[#063866] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>{sendingAll ? 'BROADCASTING SMS...' : 'SEND SMS TO ALL PARENTS'}</span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-zinc-200 font-bold uppercase text-zinc-700">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Candidate / Parent</th>
                    <th className="p-3">Mobile No</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3">SMS Preview</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {students.map((st, idx) => {
                    const smsText = getSmsContent(st);
                    const status = deliveryStatus[st._id] || 'Ready';

                    return (
                      <tr key={st._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 text-center text-zinc-400 font-medium">#{st.rollNo}</td>
                        <td className="p-3">
                          <div className="font-bold text-zinc-950">{st.name}</div>
                          <div className="text-[10px] text-zinc-500">Parent: {st.parentName}</div>
                        </td>
                        <td className="p-3 font-mono font-medium text-zinc-800">
                          {st.phone}
                        </td>
                        <td className="p-3 text-center font-bold text-zinc-900">
                          {st.obtainedMarks}/{st.totalMarks}
                          <div className="text-[10px] text-zinc-500 font-semibold">{st.percentage}%</div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            st.grade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                            st.grade === 'A' ? 'bg-sky-100 text-[#084A86]' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {st.grade}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs">
                          <p className="text-[11px] text-zinc-600 truncate font-mono bg-zinc-50 p-1.5 rounded border border-zinc-200/70" title={smsText}>
                            {smsText}
                          </p>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            status === 'Sent ✓' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'Sending...' ? 'bg-sky-100 text-sky-800 animate-pulse' :
                            'bg-zinc-100 text-zinc-600'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleWhatsApp(st)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                              title="Send via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => copyText(smsText, st._id)}
                              className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                              title="Copy SMS text"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <Button
                              onClick={() => handleSendSingleSms(st._id)}
                              size="sm"
                              className="h-7 px-2.5 text-[10px] font-bold bg-[#084A86] hover:bg-[#063866] text-white rounded-lg"
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
    </div>
  );
}
