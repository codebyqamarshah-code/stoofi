'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight, User, Phone, Mail, MapPin, Calendar, BookOpen,
  GraduationCap, Users, FileText, Download, Printer, ArrowLeft,
  BadgeCheck, Home, Heart, Briefcase, Hash, Clock, Shield, Building,
  DollarSign, Share2, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { exportToExcel } from '@/lib/exportUtils';

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

export default function StaffProfilePage() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        let res = await api.get(`/staff/${id}`).catch(() => null);
        if (!res?.data && !res?._id) {
          // If not found by direct id, check in staff list
          const allRes = await api.get('/staff').catch(() => null);
          if (allRes?.success && Array.isArray(allRes.data)) {
            const match = allRes.data.find(s => s._id === id || s.id === id);
            if (match) res = { success: true, data: match };
          }
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

  const handleExportExcel = () => {
    if (!staff) return;
    const row = {
      'Staff ID': staff.staffNo || '—',
      'First Name': staff.firstName || '—',
      'Last Name': staff.lastName || '—',
      'Role': staff.role || 'Teacher',
      'Department': staff.department || 'Academics',
      'Designation': staff.designation || 'Faculty',
      'Email': staff.email || '—',
      'Mobile': staff.mobile || staff.phone || '—',
      'Gender': staff.gender || '—',
      'Joining Date': staff.dateOfJoining || staff.joiningDate || '—',
      'Basic Salary': staff.basicSalary || staff.salary || '—',
      'Bank Name': staff.bankName || '—',
      'Account Number': staff.accountNo || '—'
    };
    exportToExcel([row], `Staff_${staff.firstName || 'Profile'}`, 'Staff Details');
  };

  const handlePrint = () => {
    window.print();
  };

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
          <User className="h-10 w-10 text-zinc-950" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Staff Not Found</h2>
        <p className="text-sm text-zinc-500">No staff record found for ID: {id}</p>
        <Link href="/dashboard/hr/staff-directory">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff Directory
          </Button>
        </Link>
      </div>
    );
  }

  const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || staff.name || 'Staff Member';
  const photoUrl = getPhotoUrl(staff);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 print:hidden">
        <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/dashboard/hr/staff-directory" className="hover:text-zinc-700 transition-colors">Staff Directory</Link>
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
                <span className="text-3xl font-black text-zinc-950">{getInitials(staff)}</span>
              )}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-white border-2 border-white flex items-center justify-center">
              <BadgeCheck className="h-3.5 w-3.5 text-zinc-950" />
            </div>
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-zinc-950 px-3 py-1 rounded-full">
                <Hash className="h-3 w-3" /> Staff ID: {staff.staffNo || '1'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 uppercase">
                <Shield className="h-3 w-3" /> {staff.role || 'Teacher'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
                <Building className="h-3 w-3" /> {staff.department || 'Academics'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
                <Briefcase className="h-3 w-3" /> {staff.designation || 'Faculty Member'}
              </span>
            </div>
            {(staff.mobile || staff.phone) && (
              <p className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {staff.mobile || staff.phone} • <Mail className="h-3.5 w-3.5 ml-1" /> {staff.email || '—'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
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
              <Printer className="h-3.5 w-3.5" /> Print Profile
            </Button>
            <Link href="/dashboard/hr/staff-directory">
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

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Personal & Contact */}
        <div className="space-y-6">
          <SectionCard title="Personal Details" icon={User}>
            <InfoRow icon={Calendar}   label="Date of Birth"     value={fmtDate(staff.dateOfBirth || staff.dob)} highlight />
            <InfoRow icon={User}       label="Gender"            value={staff.gender} />
            <InfoRow icon={Heart}      label="Marital Status"    value={staff.maritalStatus} />
            <InfoRow icon={User}       label="Father Name"       value={staff.fatherName} />
            <InfoRow icon={Phone}      label="Emergency Contact" value={staff.emergencyMobile} />
          </SectionCard>

          <SectionCard title="Contact & Address" icon={MapPin}>
            <InfoRow icon={Phone}  label="Mobile Number"     value={staff.mobile || staff.phone} highlight />
            <InfoRow icon={Mail}   label="Official Email"     value={staff.email} />
            <InfoRow icon={Home}   label="Current Address"   value={staff.currentAddress} />
            <InfoRow icon={MapPin} label="Permanent Address" value={staff.permanentAddress} />
          </SectionCard>
        </div>

        {/* Column 2: Professional & Qualifications */}
        <div className="space-y-6">
          <SectionCard title="Employment Details" icon={Briefcase}>
            <InfoRow icon={Clock}          label="Joining Date"    value={fmtDate(staff.dateOfJoining || staff.joiningDate)} highlight />
            <InfoRow icon={Shield}         label="Staff Role"      value={staff.role || 'Teacher'} />
            <InfoRow icon={Building}       label="Department"      value={staff.department || 'Academics'} />
            <InfoRow icon={Briefcase}      label="Designation"     value={staff.designation || 'Faculty'} />
            <InfoRow icon={GraduationCap}  label="Qualifications"  value={staff.qualifications} />
            <InfoRow icon={Award}          label="Experience"      value={staff.experience} />
          </SectionCard>

          <SectionCard title="Social Profiles" icon={Share2}>
            <InfoRow icon={Share2} label="Facebook Profile" value={staff.facebook} />
            <InfoRow icon={Share2} label="LinkedIn Profile" value={staff.linkedin} />
            <InfoRow icon={Share2} label="Twitter Profile"  value={staff.twitter} />
          </SectionCard>
        </div>

        {/* Column 3: Payroll & Bank Details */}
        <div className="space-y-6">
          <SectionCard title="Payroll & Salary" icon={DollarSign}>
            <InfoRow icon={DollarSign} label="Basic Salary (PKR)" value={staff.basicSalary || staff.salary ? `PKR ${Number(staff.basicSalary || staff.salary).toLocaleString()}` : '—'} highlight />
            <InfoRow icon={DollarSign} label="Allowances (PKR)"   value={staff.allowances ? `PKR ${Number(staff.allowances).toLocaleString()}` : '—'} />
            <InfoRow icon={DollarSign} label="Deductions (PKR)"   value={staff.deductions ? `PKR ${Number(staff.deductions).toLocaleString()}` : '—'} />
          </SectionCard>

          <SectionCard title="Bank Account Information" icon={Building}>
            <InfoRow icon={Building} label="Bank Name"       value={staff.bankName} highlight />
            <InfoRow icon={User}     label="Account Title"   value={staff.accountName} />
            <InfoRow icon={Hash}     label="Account Number"  value={staff.accountNo} />
            <InfoRow icon={MapPin}   label="Branch / IFSC"   value={staff.branchName || staff.ifscCode} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
