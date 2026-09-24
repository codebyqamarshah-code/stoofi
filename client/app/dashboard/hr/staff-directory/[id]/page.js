'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight, User, Phone, Mail, MapPin, Calendar, BookOpen,
  GraduationCap, Users, FileText, Download, Printer, ArrowLeft,
  BadgeCheck, Home, Heart, Briefcase, Hash, Clock, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

import { exportToExcel } from '@/lib/exportUtils';

// ─── Helpers ────────────────────────────────────────────────────────────────
const getPhotoUrl = (staff) => {
  if (!staff?.photo && !staff?.staffPhoto) return null;
  const p = staff.photo || staff.staffPhoto;
  if (p.startsWith('data:') || p.startsWith('http')) return p;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || '';
  return `${baseUrl}${p.startsWith('/') ? '' : '/'}${p}`;
};

const getInitials = (staff) => {
  const f = staff?.firstName?.charAt(0) || '';
  const l = staff?.lastName?.charAt(0) || '';
  return (f + l).toUpperCase() || 'S';
};

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return d; }
};

// ─── Reusable InfoRow ────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0">
      <div className="mt-0.5 h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">{label}</p>
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
export default function StaffProfilePage() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        let res = await api.get(`/staff/${id}`).catch(() => null);
        if (!res?.data && !res?._id) {
          res = await api.get(`/teacher/${id}`).catch(() => null);
        }
        const s = res?.data || (res?._id ? res : null);
        if (s) setStaff(s);
      } catch (err) {
        console.error('Failed to load staff:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Export to Excel ──
  const handleExportExcel = () => {
    if (!staff) return;
    const row = {
      'Admission No':       staff.admissionNo || '—',
      'Roll No':            staff.rollNo || '—',
      'First Name':         staff.firstName || '—',
      'Last Name':          staff.lastName || '—',
      'Full Name':          `${staff.firstName || ''} ${staff.lastName || ''}`.trim(),
      'Father Name':        staff.fatherName || '—',
      'Mother Name':        staff.motherName || '—',
      'Date of Birth':      staff.dob || '—',
      'Gender':             staff.gender || '—',
      'Religion':           staff.religion || '—',
      'Blood Group':        staff.bloodGroup || '—',
      'Nationality':        staff.nationality || '—',
      'Class':              staff.className || '—',
      'Section':            staff.section || '—',
      'Academic Year':      staff.academicYear || '2026 [Jan-Dec]',
      'Type':               staff.type || 'Regular',
      'Phone':              staff.phone || '—',
      'Email':              staff.email || '—',
      'Address':            staff.address || '—',
      'City':               staff.city || '—',
      'Father Occupation':  staff.fatherOccupation || '—',
      'Father Phone':       staff.fatherPhone || '—',
      'Mother Phone':       staff.motherPhone || '—',
      'Emergency Contact':  staff.emergencyContact || '—',
      'Joining Date':       staff.joiningDate || '—',
      'Previous School':    staff.previousSchool || '—',
      'CNIC / B-Form':      staff.cnic || '—',
      'Remarks':            staff.remarks || '—',
    };
    exportToExcel(
      [row],
      `Staff_${staff.firstName || ''}_${staff.lastName || ''}_${staff.admissionNo || 'Profile'}`,
      'Staff Profile'
    );
  };

  // ── Print ──
  const handlePrint = () => {
    if (!staff) return;
    const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.trim();
    const win = window.open('', '_blank', 'height=750,width=920');
    if (!win) { alert('Pop-up blocked. Please allow pop-ups.'); return; }
    const now = new Date().toLocaleString();
    const yr  = new Date().getFullYear();
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Staff Profile - ${fullName}</title>
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
  <div><div class="brand">STOOFI School Management ERP</div><div class="brand-sub">Official Staff Profile Record</div></div>
  <div class="meta"><div>Printed: <strong>${now}</strong></div></div>
</div>
<div class="hero">
  <div class="avatar">${getInitials(staff)}</div>
  <div>
    <div class="hero-name">${fullName}</div>
    <span class="badge">${staff.admissionNo||'—'}</span>
    <span class="badge">${staff.className||''} ${staff.section||''}</span>
    <span class="badge">${staff.gender||'—'}</span>
    <span class="badge">${staff.type||'Regular'}</span>
  </div>
</div>
<div class="section-title">Personal Information</div>
<div class="grid2">
  <div class="row"><span class="lbl">Date of Birth</span><span class="val">${staff.dob||'—'}</span></div>
  <div class="row"><span class="lbl">Gender</span><span class="val">${staff.gender||'—'}</span></div>
  <div class="row"><span class="lbl">Religion</span><span class="val">${staff.religion||'—'}</span></div>
  <div class="row"><span class="lbl">Blood Group</span><span class="val">${staff.bloodGroup||'—'}</span></div>
  <div class="row"><span class="lbl">Nationality</span><span class="val">${staff.nationality||'—'}</span></div>
  <div class="row"><span class="lbl">CNIC / B-Form</span><span class="val">${staff.cnic||'—'}</span></div>
</div>
<div class="section-title">Contact Information</div>
<div class="grid2">
  <div class="row"><span class="lbl">Phone</span><span class="val">${staff.phone||'—'}</span></div>
  <div class="row"><span class="lbl">Email</span><span class="val">${staff.email||'—'}</span></div>
  <div class="row"><span class="lbl">City</span><span class="val">${staff.city||'—'}</span></div>
  <div class="row"><span class="lbl">Address</span><span class="val">${staff.address||'—'}</span></div>
</div>
<div class="section-title">Academic Information</div>
<div class="grid2">
  <div class="row"><span class="lbl">Class</span><span class="val">${staff.className||'—'}</span></div>
  <div class="row"><span class="lbl">Section</span><span class="val">${staff.section||'—'}</span></div>
  <div class="row"><span class="lbl">Roll No</span><span class="val">${staff.rollNo||'—'}</span></div>
  <div class="row"><span class="lbl">Admission No</span><span class="val">${staff.admissionNo||'—'}</span></div>
  <div class="row"><span class="lbl">Academic Year</span><span class="val">${staff.academicYear||'2026 [Jan-Dec]'}</span></div>
  <div class="row"><span class="lbl">Staff Type</span><span class="val">${staff.type||'Regular'}</span></div>
  <div class="row"><span class="lbl">Joining Date</span><span class="val">${staff.joiningDate||'—'}</span></div>
  <div class="row"><span class="lbl">Previous School</span><span class="val">${staff.previousSchool||'—'}</span></div>
</div>
<div class="section-title">Parent / Guardian Information</div>
<div class="grid2">
  <div class="row"><span class="lbl">Father Name</span><span class="val">${staff.fatherName||'—'}</span></div>
  <div class="row"><span class="lbl">Mother Name</span><span class="val">${staff.motherName||'—'}</span></div>
  <div class="row"><span class="lbl">Father Occupation</span><span class="val">${staff.fatherOccupation||'—'}</span></div>
  <div class="row"><span class="lbl">Father Phone</span><span class="val">${staff.fatherPhone||'—'}</span></div>
  <div class="row"><span class="lbl">Mother Phone</span><span class="val">${staff.motherPhone||'—'}</span></div>
  <div class="row"><span class="lbl">Emergency Contact</span><span class="val">${staff.emergencyContact||'—'}</span></div>
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
          <p className="text-sm text-zinc-500 font-medium">Loading staff profile...</p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-20 w-20 rounded-full bg-zinc-100 flex items-center justify-center">
          <User className="h-10 w-10 text-zinc-300" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Staff Not Found</h2>
        <p className="text-sm text-zinc-500">No staff record found for ID: {id}</p>
        <Link href="/dashboard/staffs">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff List
          </Button>
        </Link>
      </div>
    );
  }

  const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.trim();
  const photoUrl = getPhotoUrl(staff);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/dashboard/staffs" className="hover:text-zinc-700 transition-colors">Staff List</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-700 font-semibold truncate max-w-[160px]">{fullName}</span>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-2 bg-zinc-900 w-full" />
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 rounded-2xl border-4 border-zinc-200 overflow-hidden bg-zinc-900 flex items-center justify-center shadow-sm">
              {photoUrl ? (
                <img src={photoUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-white">{getInitials(staff)}</span>
              )}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-zinc-900 border-2 border-white flex items-center justify-center">
              <BadgeCheck className="h-3.5 w-3.5 text-white" />
            </div>
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-900 text-white px-3 py-1 rounded-full">
                <Hash className="h-3 w-3" /> {staff.admissionNo || '—'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
                <BookOpen className="h-3 w-3" /> {staff.className || '—'} — {staff.section || '—'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
                <User className="h-3 w-3" /> {staff.gender || '—'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
                <Shield className="h-3 w-3" /> {staff.type || 'Regular'}
              </span>
            </div>
            {staff.phone && (
              <p className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {staff.phone}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
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
            <Link href="/dashboard/staffs">
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
            <InfoRow icon={Calendar}   label="Date of Birth" value={fmtDate(staff.dob)} highlight />
            <InfoRow icon={User}       label="Gender"        value={staff.gender} />
            <InfoRow icon={Heart}      label="Blood Group"   value={staff.bloodGroup} />
            <InfoRow icon={BookOpen}   label="Religion"      value={staff.religion} />
            <InfoRow icon={Shield}     label="Nationality"   value={staff.nationality} />
            <InfoRow icon={FileText}   label="CNIC / B-Form" value={staff.cnic} />
          </SectionCard>

          <SectionCard title="Contact Information" icon={Phone}>
            <InfoRow icon={Phone}  label="Phone"   value={staff.phone} highlight />
            <InfoRow icon={Mail}   label="Email"   value={staff.email} />
            <InfoRow icon={MapPin} label="Address" value={staff.address} />
            <InfoRow icon={Home}   label="City"    value={staff.city} />
          </SectionCard>
        </div>

        {/* Column 2: Academic */}
        <div className="space-y-6">
          <SectionCard title="Academic Information" icon={GraduationCap}>
            <InfoRow icon={BookOpen}  label="Class"         value={staff.className} highlight />
            <InfoRow icon={Users}     label="Section"       value={staff.section} />
            <InfoRow icon={Hash}      label="Roll No"       value={staff.rollNo} />
            <InfoRow icon={Hash}      label="Admission No"  value={staff.admissionNo} />
            <InfoRow icon={Calendar}  label="Academic Year" value={staff.academicYear || '2026 [Jan-Dec]'} />
            <InfoRow icon={Shield}    label="Staff Type"  value={staff.type || 'Regular'} />
            <InfoRow icon={Clock}     label="Joining Date"  value={fmtDate(staff.joiningDate)} />
            <InfoRow icon={BookOpen}  label="Prev. School"  value={staff.previousSchool} />
          </SectionCard>
        </div>

        {/* Column 3: Parents + Docs */}
        <div className="space-y-6">
          <SectionCard title="Parent / Guardian Info" icon={Users}>
            <InfoRow icon={User}      label="Father Name"       value={staff.fatherName} highlight />
            <InfoRow icon={User}      label="Mother Name"       value={staff.motherName} />
            <InfoRow icon={Briefcase} label="Father Occupation" value={staff.fatherOccupation} />
            <InfoRow icon={Phone}     label="Father Phone"      value={staff.fatherPhone} />
            <InfoRow icon={Phone}     label="Mother Phone"      value={staff.motherPhone} />
            <InfoRow icon={Phone}     label="Emergency Contact" value={staff.emergencyContact} />
          </SectionCard>

          <SectionCard title="Documents & Remarks" icon={FileText}>
            <InfoRow icon={FileText} label="TC No"   value={staff.tcNo} />
            <InfoRow icon={FileText} label="Remarks" value={staff.remarks} />
          </SectionCard>
        </div>

      </div>
    </div>
  );
}
