'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight, User, Phone, Mail, MapPin, Calendar, BookOpen,
  GraduationCap, Users, FileText, Download, Printer, ArrowLeft,
  BadgeCheck, Home, Heart, Briefcase, Hash, Clock, Shield,
  Activity, AlertCircle, Edit, Plus, CheckCircle, Layers, School
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { exportToExcel } from '@/lib/exportUtils';
import { getPhotoUrl, formatDateDMY } from '@/lib/utils';
import StudentAvatar from '@/components/student/StudentAvatar';

// ─── Helpers ────────────────────────────────────────────────────────────────
const getInitials = (student) => {
  const f = student?.firstName?.charAt(0) || '';
  const l = student?.lastName?.charAt(0) || '';
  return (f + l).toUpperCase() || 'S';
};

const fmtDate = (d) => formatDateDMY(d);

const formatCnic = (val) => {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '');
  if (digits.length === 13) {
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  }
  return String(val);
};

// ─── Reusable InfoRow ────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0">
      <div className="mt-0.5 h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-zinc-700 uppercase font-bold tracking-wide">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 break-words ${highlight ? 'text-zinc-900' : 'text-zinc-700'}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

// ─── Section Card ────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-100 bg-zinc-50">
        <Icon className="h-4 w-4 text-zinc-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">{title}</h3>
      </div>
      <div className="px-5 pb-2">{children}</div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function StudentProfilePage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [studentRes, enrollRes] = await Promise.allSettled([
          api.get(`/student/${id}`),
          api.get(`/enrollment?studentId=${id}`)
        ]);

        if (studentRes.status === 'fulfilled') {
          const res = studentRes.value;
          const s = res?.data || (res?._id ? res : null);
          if (s) setStudent(s);
        }

        if (enrollRes.status === 'fulfilled' && enrollRes.value?.success) {
          setEnrollments(enrollRes.value.data || []);
        }
      } catch (err) {
        console.error('Failed to load student or enrollments:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Export to Excel ──
  const handleExportExcel = () => {
    if (!student) return;
    const row = {
      'Admission No':       student.admissionNo || '—',
      'Roll No':            student.rollNo || '—',
      'First Name':         student.firstName || '—',
      'Last Name':          student.lastName || '—',
      'Full Name':          `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      'Father Name':        student.fatherName || '—',
      'Father CNIC':        formatCnic(student.fatherCnic) || student.fatherCnic || '—',
      'Father Occupation':  student.fatherOccupation || '—',
      'Mother Name':        student.motherName || '—',
      'Mother Occupation':  student.motherOccupation || '—',
      'Date of Birth':      formatDateDMY(student.dob),
      'Gender':             student.gender || '—',
      'Religion':           student.religion || 'Islam',
      'Blood Group':        student.bloodGroup || '—',
      'Nationality':        student.nationality || 'Pakistani',
      'Class':              student.className || '—',
      'Section':            student.section || '—',
      'Academic Year':      student.academicYear || '2026',
      'Type':               student.type || 'Regular',
      'Phone':              student.phone || '—',
      'Email':              student.email || '—',
      'Present Address':    student.currentAddress || student.address || '—',
      'Permanent Address':  student.permanentAddress || '—',
      'City':               student.city || '—',
      'Father Phone':       student.fatherPhone || '—',
      'Mother Phone':       student.motherPhone || '—',
      'Emergency Contact':  student.emergencyContact || '—',
      'Joining Date':       formatDateDMY(student.joiningDate || student.admissionDate),
      'Previous School':    student.previousSchool || student.previousSchoolName || '—',
      'CNIC / B-Form':      formatCnic(student.cnic || student.bForm) || student.cnic || student.bForm || '—',
      'Medical History':    student.medicalHistory || '—',
      'Remarks':            student.remarks || student.otherInfo || '—',
    };
    exportToExcel(
      [row],
      `Student_${student.firstName || ''}_${student.lastName || ''}_${student.admissionNo || 'Profile'}`,
      'Student Profile'
    );
  };

  // ── Print ──
  const handlePrint = () => {
    if (!student) return;
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
    const win = window.open('', '_blank', 'height=750,width=920');
    if (!win) { alert('Pop-up blocked. Please allow pop-ups.'); return; }
    const now = new Date().toLocaleString();
    const yr  = new Date().getFullYear();
    const address = student.currentAddress || student.address || '—';
    const permAddress = student.permanentAddress || '—';
    const prevSchool = student.previousSchool || student.previousSchoolName || '—';
    const cnicVal = formatCnic(student.cnic || student.bForm) || student.cnic || student.bForm || '—';
    const fatherCnicVal = formatCnic(student.fatherCnic) || student.fatherCnic || '—';
    const joining = student.joiningDate || student.admissionDate || '—';

    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Student Profile - ${fullName}</title>
<style>@page{size:A4;margin:12mm 15mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#09090b;background:#fff;margin:0;padding:20px;font-size:11px}
.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #09090b;padding-bottom:10px;margin-bottom:16px}
.brand{font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:-0.3px}
.brand-sub{font-size:10px;color:#52525b;margin-top:2px}
.meta{text-align:right;font-size:10px;color:#52525b}
.hero{display:flex;align-items:center;gap:16px;background:#f4f4f5;border-radius:12px;padding:14px;margin-bottom:20px}
.avatar{width:60px;height:60px;border-radius:12px;background:#09090b;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;flex-shrink:0}
.hero-name{font-size:17px;font-weight:900;margin:0 0 6px}
.badge{display:inline-block;background:#09090b;color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;margin-right:4px}
.section-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#52525b;border-bottom:1px solid #e4e4e7;padding-bottom:5px;margin:16px 0 8px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 24px}
.row{display:flex;padding:5px 0;border-bottom:1px solid #f4f4f5}
.lbl{color:#71717a;font-size:9.5px;min-width:120px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px}
.val{color:#09090b;font-weight:600;font-size:10.5px}
.footer{margin-top:20px;border-top:1px solid #e4e4e7;padding-top:8px;display:flex;justify-content:space-between;font-size:9px;color:#71717a}
</style></head><body>
<div class="header">
  <div><div class="brand">STOOFI School Management ERP</div><div class="brand-sub">Official Student Profile Record</div></div>
  <div class="meta"><div>Printed: <strong>${now}</strong></div></div>
</div>
<div class="hero">
  <div class="avatar">${getInitials(student)}</div>
  <div>
    <div class="hero-name">${fullName}</div>
    <span class="badge">${student.admissionNo||'—'}</span>
    <span class="badge">${student.className||''} ${student.section||''}</span>
    <span class="badge">${student.gender||'—'}</span>
    <span class="badge">${student.type||'Regular'}</span>
  </div>
</div>
<div class="section-title">Personal Information</div>
<div class="grid2">
  <div class="row"><span class="lbl">Date of Birth</span><span class="val">${fmtDate(student.dob)}</span></div>
  <div class="row"><span class="lbl">Gender</span><span class="val">${student.gender||'—'}</span></div>
  <div class="row"><span class="lbl">Religion</span><span class="val">${student.religion||'Islam'}</span></div>
  <div class="row"><span class="lbl">Blood Group</span><span class="val">${student.bloodGroup||'—'}</span></div>
  <div class="row"><span class="lbl">Nationality</span><span class="val">${student.nationality||'Pakistani'}</span></div>
  <div class="row"><span class="lbl">CNIC / B-Form</span><span class="val">${cnicVal}</span></div>
</div>
<div class="section-title">Contact Information</div>
<div class="grid2">
  <div class="row"><span class="lbl">Phone</span><span class="val">${student.phone||'—'}</span></div>
  <div class="row"><span class="lbl">Email</span><span class="val">${student.email||'—'}</span></div>
  <div class="row"><span class="lbl">City</span><span class="val">${student.city||'—'}</span></div>
  <div class="row"><span class="lbl">Emergency Contact</span><span class="val">${student.emergencyContact||'—'}</span></div>
  <div class="row"><span class="lbl">Present Address</span><span class="val">${address}</span></div>
  <div class="row"><span class="lbl">Permanent Address</span><span class="val">${permAddress}</span></div>
</div>
<div class="section-title">Academic Information</div>
<div class="grid2">
  <div class="row"><span class="lbl">Class</span><span class="val">${student.className||'—'}</span></div>
  <div class="row"><span class="lbl">Section</span><span class="val">${student.section||'—'}</span></div>
  <div class="row"><span class="lbl">Roll No</span><span class="val">${student.rollNo||'—'}</span></div>
  <div class="row"><span class="lbl">Admission No</span><span class="val">${student.admissionNo||'—'}</span></div>
  <div class="row"><span class="lbl">Academic Year</span><span class="val">${student.academicYear||'2026'}</span></div>
  <div class="row"><span class="lbl">Student Type</span><span class="val">${student.type||'Regular'}</span></div>
  <div class="row"><span class="lbl">Joining Date</span><span class="val">${fmtDate(joining)}</span></div>
  <div class="row"><span class="lbl">Previous School</span><span class="val">${prevSchool}</span></div>
</div>
<div class="section-title">Parent / Guardian Information</div>
<div class="grid2">
  <div class="row"><span class="lbl">Father Name</span><span class="val">${student.fatherName||'—'}</span></div>
  <div class="row"><span class="lbl">Father CNIC</span><span class="val">${fatherCnicVal}</span></div>
  <div class="row"><span class="lbl">Father Occupation</span><span class="val">${student.fatherOccupation||'—'}</span></div>
  <div class="row"><span class="lbl">Father Phone</span><span class="val">${student.fatherPhone||'—'}</span></div>
  <div class="row"><span class="lbl">Mother Name</span><span class="val">${student.motherName||'—'}</span></div>
  <div class="row"><span class="lbl">Mother Occupation</span><span class="val">${student.motherOccupation||'—'}</span></div>
  <div class="row"><span class="lbl">Mother Phone</span><span class="val">${student.motherPhone||'—'}</span></div>
  <div class="row"><span class="lbl">Guardian Phone</span><span class="val">${student.guardianPhone||'—'}</span></div>
</div>
<div class="footer">
  <span>Official Document — Stoofi ERP System</span>
  <span>Confidential &copy; ${yr} Stoofi PRO. All Rights Reserved.</span>
</div>
</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  // ─── States ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 font-medium">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-20 w-20 rounded-full bg-zinc-100 flex items-center justify-center">
          <User className="h-10 w-10 text-zinc-950" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Student Not Found</h2>
        <p className="text-sm text-zinc-500">No student record found for ID: {id}</p>
        <Link href="/dashboard/students">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Student List
          </Button>
        </Link>
      </div>
    );
  }

  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
  const photoUrl = getPhotoUrl(student);
  const presentAddress = student.currentAddress || student.address;
  const permanentAddress = student.permanentAddress;
  const prevSchool = student.previousSchool || student.previousSchoolName;
  const cnicVal = formatCnic(student.cnic || student.bForm) || student.cnic || student.bForm || '—';
  const fatherCnicVal = formatCnic(student.fatherCnic) || student.fatherCnic || '—';
  const joining = student.joiningDate || student.admissionDate;
  const remarksVal = student.remarks || student.otherInfo;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/dashboard/students" className="hover:text-zinc-700 transition-colors">Student List</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-700 font-semibold truncate max-w-[160px]">{fullName}</span>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-2 bg-zinc-900 w-full" />
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">

          {/* Avatar */}
          <div className="relative shrink-0">
            <StudentAvatar
              photo={photoUrl}
              firstName={student.firstName}
              lastName={student.lastName}
              size="xl"
              rounded="rounded-2xl"
              className="border-4 border-zinc-200 shadow-sm"
            />
            <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-white border-2 border-white flex items-center justify-center">
              <BadgeCheck className="h-3.5 w-3.5 text-zinc-950" />
            </div>
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-950 text-white px-3 py-1 rounded-full">
                <Hash className="h-3 w-3" /> {student.admissionNo || '—'}
              </span>
              {student.studentCode && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <Shield className="h-3 w-3 text-emerald-600" /> Permanent ID: {student.studentCode}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
                <BookOpen className="h-3 w-3" /> {student.className || '—'} — {student.section || '—'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
                <User className="h-3 w-3" /> {student.gender || '—'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
                <Shield className="h-3 w-3" /> {student.type || 'Regular'}
              </span>
            </div>
            {student.phone && (
              <p className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {student.phone}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href={`/dashboard/students/${id}/edit`}>
              <Button
                variant="outline"
                className="border-zinc-300 text-zinc-800 hover:bg-zinc-100 font-bold text-xs h-9 px-4 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Edit className="h-3.5 w-3.5 text-zinc-700" /> Edit Profile
              </Button>
            </Link>
            <Button
              onClick={handleExportExcel}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs h-9 px-4 flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export Excel
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-semibold text-xs h-9 px-4 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Link href="/dashboard/students">
              <Button
                variant="ghost"
                className="text-zinc-500 hover:text-zinc-900 font-semibold text-xs h-9 px-3 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Personal + Contact */}
        <div className="space-y-6">
          <SectionCard title="Personal Information" icon={User}>
            <InfoRow icon={Calendar}   label="Date of Birth" value={fmtDate(student.dob)} highlight />
            <InfoRow icon={User}       label="Gender"        value={student.gender} />
            <InfoRow icon={Heart}      label="Blood Group"   value={student.bloodGroup} />
            <InfoRow icon={BookOpen}   label="Religion"      value={student.religion || 'Islam'} />
            <InfoRow icon={Shield}     label="Nationality"   value={student.nationality || 'Pakistani'} />
            <InfoRow icon={FileText}   label="CNIC / B-Form" value={cnicVal} />
          </SectionCard>

          <SectionCard title="Contact Information" icon={Phone}>
            <InfoRow icon={Phone}  label="Phone"             value={student.phone} highlight />
            <InfoRow icon={Mail}   label="Email"             value={student.email} />
            <InfoRow icon={MapPin} label="Present Address"   value={presentAddress} />
            <InfoRow icon={Home}   label="Permanent Address" value={permanentAddress} />
            <InfoRow icon={Home}   label="City"              value={student.city} />
            <InfoRow icon={Phone}  label="Emergency Contact" value={student.emergencyContact} />
          </SectionCard>
        </div>

        {/* Column 2: Academic */}
        <div className="space-y-6">
          <SectionCard title="Academic Information" icon={GraduationCap}>
            <InfoRow icon={BookOpen}  label="Class"         value={student.className} highlight />
            <InfoRow icon={Users}     label="Section"       value={student.section} />
            <InfoRow icon={Hash}      label="Roll No"       value={student.rollNo} />
            <InfoRow icon={Hash}      label="Admission No"  value={student.admissionNo} />
            <InfoRow icon={Calendar}  label="Academic Year" value={student.academicYear || '2026'} />
            <InfoRow icon={Shield}    label="Student Type"  value={student.type || 'Regular'} />
            <InfoRow icon={Clock}     label="Joining Date"  value={fmtDate(joining)} />
            <InfoRow icon={BookOpen}  label="Prev. School"  value={prevSchool} />
          </SectionCard>
        </div>

        {/* Column 3: Parents + Docs */}
        <div className="space-y-6">
          <SectionCard title="Parent / Guardian Info" icon={Users}>
            <InfoRow icon={User}      label="Father Name"       value={student.fatherName} highlight />
            <InfoRow icon={FileText}  label="Father CNIC"       value={fatherCnicVal} />
            <InfoRow icon={Briefcase} label="Father Occupation" value={student.fatherOccupation} />
            <InfoRow icon={Phone}     label="Father Phone"      value={student.fatherPhone} />
            <InfoRow icon={User}      label="Mother Name"       value={student.motherName} />
            <InfoRow icon={Briefcase} label="Mother Occupation" value={student.motherOccupation} />
            <InfoRow icon={Phone}     label="Mother Phone"      value={student.motherPhone} />
            <InfoRow icon={Phone}     label="Guardian Phone"    value={student.guardianPhone} />
          </SectionCard>

          <SectionCard title="Health & Documents" icon={FileText}>
            <InfoRow icon={Activity} label="Medical / Allergies" value={student.medicalHistory} />
            <InfoRow icon={FileText} label="TC No"               value={student.tcNo} />
            <InfoRow icon={AlertCircle} label="Remarks"          value={remarksVal} />
          </SectionCard>
        </div>

      </div>

      {/* Academic Program Enrollments (One Student -> Multiple Enrollments) */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <School className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                Academic Program Enrollments
              </h3>
              <p className="text-xs text-zinc-500">
                All registered program offerings, batches, and academic stages for this permanent student profile.
              </p>
            </div>
          </div>
          <Link href="/dashboard/students/add">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Program Enrollment
            </Button>
          </Link>
        </div>

        <div className="p-6">
          {enrollments.length === 0 ? (
            <div className="text-center py-6 text-zinc-400 text-xs">
              <School className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
              <p>Primary legacy enrollment active: {student.className || 'General Program'} ({student.section || 'A'}).</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Use the button above to add an accredited Program Offering enrollment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((enr) => (
                <div
                  key={enr._id}
                  className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-emerald-300 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-900">{enr.programName || enr.offeringTitle}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      enr.enrollmentStatus === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : enr.enrollmentStatus === 'Completed'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {enr.enrollmentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-1.5 text-xs text-zinc-600">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Admission No</span>
                      <span className="font-mono font-bold text-zinc-800">{enr.admissionNumber || student.admissionNo}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Roll No</span>
                      <span className="font-mono font-bold text-zinc-800">{enr.rollNumber || student.rollNo}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Session / Year</span>
                      <span className="font-medium text-zinc-800">{enr.academicYear || student.academicYear}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Section / Shift</span>
                      <span className="font-medium text-zinc-800">{enr.sectionName || student.section || 'A'} ({enr.shift || 'Morning'})</span>
                    </div>
                  </div>

                  {enr.affiliationName && (
                    <div className="pt-2 border-t border-zinc-200/60 text-[11px] text-zinc-500">
                      Affiliation Body: <strong className="text-zinc-700">{enr.affiliationName}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Qualifications & Documents Grid */}
      {(student.qualifications?.length > 0 || student.documents?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Qualifications */}
          {student.qualifications?.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-100 bg-zinc-50">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Prior Academic Qualifications
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {student.qualifications.map((q, i) => (
                  <div key={i} className="p-3 rounded-lg border border-zinc-100 bg-zinc-50 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-zinc-900">
                      <span>{q.qualification}</span>
                      <span className="text-emerald-600">{q.percentage || `${q.obtainedMarks}/${q.totalMarks}`}</span>
                    </div>
                    <div className="text-zinc-500 text-[11px]">
                      {q.institution || q.awardingBody} — Passing Year: {q.completionYear || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Checklist */}
          {student.documents?.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-100 bg-zinc-50">
                <FileText className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Admission Documents Verification
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {student.documents.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-3.5 w-3.5 ${d.verified ? 'text-emerald-600' : 'text-zinc-400'}`} />
                      <span className="font-medium text-zinc-800">{d.docType}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      d.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {d.status || (d.verified ? 'Verified' : 'Pending')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
