'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight, User, Phone, Mail, MapPin, Calendar,
  GraduationCap, Users, FileText, Download, Printer, ArrowLeft,
  BadgeCheck, Home, Heart, Briefcase, Hash, Clock, Shield, Building,
  DollarSign, Share2, Award, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { exportToExcel } from '@/lib/exportUtils';
import { formatDateDMY, getPhotoUrl } from '@/lib/utils';
import StaffAvatar from '@/components/staff/StaffAvatar';

const DEMO_STAFF = [
  {
    id: 'demo-1', _id: 'demo-1', staffNo: 'PRCS0001', name: 'Dr. Amina Khalid', firstName: 'Amina', lastName: 'Khalid',
    fatherName: 'Khalid Mehmood', designation: 'Principal', department: 'Administration', role: 'Admin',
    phone: '+92-300-1234567', mobile: '+92-300-1234567', email: 'amina.khalid@stoofi.edu',
    status: 'Active', dateOfJoining: '2021-03-15', dateOfBirth: '1982-05-12', gender: 'Female', maritalStatus: 'Married',
    basicSalary: 120000, allowances: 25000, deductions: 5000,
    bankName: 'Meezan Bank', accountNo: '0101-0102030405', accountName: 'Dr. Amina Khalid',
    branchName: 'Main Boulevard, Lahore', currentAddress: 'House 14-B, Model Town, Lahore', permanentAddress: 'House 14-B, Model Town, Lahore',
    qualifications: 'Ph.D in Education Administration, M.Phil', experience: '12 Years in Educational Leadership'
  },
  {
    id: 'demo-2', _id: 'demo-2', staffNo: 'PRCS0002', name: 'Mr. Tariq Mahmood', firstName: 'Tariq', lastName: 'Mahmood',
    fatherName: 'Mahmood Alam', designation: 'Teacher', department: 'Science', role: 'Teacher',
    phone: '+92-321-9876543', mobile: '+92-321-9876543', email: 'tariq.mahmood@stoofi.edu',
    status: 'Active', dateOfJoining: '2022-06-01', dateOfBirth: '1988-11-20', gender: 'Male', maritalStatus: 'Married',
    basicSalary: 65000, allowances: 10000, deductions: 2000,
    bankName: 'Habib Bank Limited (HBL)', accountNo: '0234-9876543210', accountName: 'Tariq Mahmood',
    branchName: 'DHA Phase 5, Lahore', currentAddress: 'Apartment 3A, Gulberg III, Lahore', permanentAddress: 'Village 45-GB, Faisalabad',
    qualifications: 'M.Sc Physics, B.Ed', experience: '6 Years in High School Teaching'
  },
  {
    id: 'demo-3', _id: 'demo-3', staffNo: 'PRCS0003', name: 'Ms. Sana Iqbal', firstName: 'Sana', lastName: 'Iqbal',
    fatherName: 'Muhammad Iqbal', designation: 'Accountant', department: 'Finance', role: 'Staff',
    phone: '+92-333-4567890', mobile: '+92-333-4567890', email: 'sana.iqbal@stoofi.edu',
    status: 'Active', dateOfJoining: '2023-01-10', dateOfBirth: '1993-08-14', gender: 'Female', maritalStatus: 'Single',
    basicSalary: 55000, allowances: 8000, deductions: 1500,
    bankName: 'Bank Alfalah', accountNo: '1004-5678901234', accountName: 'Sana Iqbal',
    branchName: 'Johar Town, Lahore', currentAddress: 'House 88, Sector C, Bahria Town, Lahore', permanentAddress: 'House 88, Sector C, Bahria Town, Lahore',
    qualifications: 'B.Com, ACCA Finalist', experience: '4 Years Corporate & School Accounts'
  },
  {
    id: 'demo-4', _id: 'demo-4', staffNo: 'PRCS0004', name: 'Mr. Ali Hassan', firstName: 'Ali', lastName: 'Hassan',
    fatherName: 'Hassan Raza', designation: 'Admin Officer', department: 'Administration', role: 'Staff',
    phone: '+92-345-6543210', mobile: '+92-345-6543210', email: 'ali.hassan@stoofi.edu',
    status: 'Active', dateOfJoining: '2023-07-20', dateOfBirth: '1991-03-25', gender: 'Male', maritalStatus: 'Married',
    basicSalary: 48000, allowances: 6000, deductions: 1000,
    bankName: 'MCB Bank', accountNo: '0987-1234567890', accountName: 'Ali Hassan',
    branchName: 'Mall Road, Lahore', currentAddress: 'House 12, Street 4, Cavalry Ground, Lahore', permanentAddress: 'House 12, Street 4, Cavalry Ground, Lahore',
    qualifications: 'MBA in Human Resources', experience: '3 Years School Administration'
  },
  {
    id: 'demo-5', _id: 'demo-5', staffNo: 'PRCS0005', name: 'Ms. Rabia Noor', firstName: 'Rabia', lastName: 'Noor',
    fatherName: 'Noor Muhammad', designation: 'IT Coordinator', department: 'IT', role: 'Staff',
    phone: '+92-311-7890123', mobile: '+92-311-7890123', email: 'rabia.noor@stoofi.edu',
    status: 'Inactive', dateOfJoining: '2024-02-14', dateOfBirth: '1995-10-05', gender: 'Female', maritalStatus: 'Single',
    basicSalary: 60000, allowances: 10000, deductions: 2000,
    bankName: 'Faysal Bank', accountNo: '3001-4455667788', accountName: 'Rabia Noor',
    branchName: 'Ferozepur Road, Lahore', currentAddress: 'House 5, Eden Gardens, Lahore', permanentAddress: 'House 5, Eden Gardens, Lahore',
    qualifications: 'BS Computer Science', experience: '5 Years Network & Systems Administration'
  },
];

const fmtDate = (d) => formatDateDMY(d);

function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0">
      <div className="mt-0.5 h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">{label}</p>
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
        <Icon className="h-4 w-4 text-[#009966]" />
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
    if (!id || id === 'undefined') {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        let res = await api.get(`/staff/${id}`).catch(() => null);
        let s = res?.data || (res?._id ? res : null);

        if (!s) {
          // If direct ID lookup didn't succeed, search in staff list
          const allRes = await api.get('/staff?limit=1000').catch(() => null);
          const list = allRes?.data || (Array.isArray(allRes) ? allRes : []);
          if (Array.isArray(list)) {
            s = list.find(item =>
              String(item._id) === String(id) ||
              String(item.id) === String(id) ||
              String(item.staffNo) === String(id)
            );
          }
        }

        if (s) {
          const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Staff Member';
          setStaff({
            ...s,
            id: s._id || s.id || id,
            _id: s._id || s.id || id,
            name: fullName,
            phone: s.mobile || s.phone || '',
            mobile: s.mobile || s.phone || '',
            photo: s.staffPhoto || s.photo || null,
            staffPhoto: s.staffPhoto || s.photo || null
          });
        }
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
      'Joining Date': fmtDate(staff.dateOfJoining || staff.joiningDate || staff.joinDate),
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
          <div className="h-10 w-10 border-4 border-[#009966] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 font-medium">Loading staff profile...</p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-20 w-20 rounded-full bg-zinc-100 flex items-center justify-center">
          <User className="h-10 w-10 text-zinc-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Staff Member Not Found</h2>
        <p className="text-sm text-zinc-500">No staff record was found matching ID: {id}</p>
        <Link href="/dashboard/hr/staff-directory">
          <Button className="bg-[#009966] hover:bg-[#008055] text-white">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff Directory
          </Button>
        </Link>
      </div>
    );
  }

  const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || staff.name || 'Staff Member';
  const hasDocuments = Boolean(staff.cnicFront || staff.cnicBack || staff.cv || staff.lastDegree);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 print:hidden">
        <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/dashboard/hr" className="hover:text-zinc-700 transition-colors">HR</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/dashboard/hr/staff-directory" className="hover:text-zinc-700 transition-colors">Staff Directory</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-700 font-semibold truncate max-w-[200px]">{fullName}</span>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-2.5 bg-[#009966] w-full" />
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <StaffAvatar
              photo={staff.photo || staff.staffPhoto}
              name={fullName}
              firstName={staff.firstName}
              lastName={staff.lastName}
              size="2xl"
              rounded="rounded-2xl"
              className="h-24 w-24 border-2 border-white shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center">
              <BadgeCheck className="h-4 w-4 text-[#009966]" />
            </div>
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {staff.staffNo && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full border border-zinc-200">
                  <Hash className="h-3 w-3" /> Staff ID: {staff.staffNo}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-[#009966] px-3 py-1 rounded-full border border-emerald-200 uppercase">
                <Shield className="h-3 w-3" /> {staff.role || 'Teacher'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
                <Building className="h-3 w-3" /> {staff.department || 'Academics'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
                <Briefcase className="h-3 w-3" /> {staff.designation || 'Faculty Member'}
              </span>
            </div>
            {(staff.mobile || staff.phone || staff.email) && (
              <p className="mt-2 text-xs text-zinc-500 flex flex-wrap items-center gap-3">
                {(staff.mobile || staff.phone) && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" /> {staff.mobile || staff.phone}
                  </span>
                )}
                {staff.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" /> {staff.email}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
            <Button
              onClick={handleExportExcel}
              className="bg-[#009966] hover:bg-[#008055] text-white font-semibold text-xs h-9 px-4 flex items-center gap-2 cursor-pointer shadow-sm"
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
            <InfoRow icon={Calendar} label="Date of Birth" value={fmtDate(staff.dateOfBirth || staff.dob)} highlight />
            <InfoRow icon={User} label="Gender" value={staff.gender} />
            <InfoRow icon={Heart} label="Marital Status" value={staff.maritalStatus} />
            <InfoRow icon={User} label="Father Name" value={staff.fatherName} />
            <InfoRow icon={Hash} label="CNIC / ID Card" value={staff.cnic} />
            <InfoRow icon={Phone} label="Emergency Contact" value={staff.emergencyMobile} />
          </SectionCard>

          <SectionCard title="Contact & Address" icon={MapPin}>
            <InfoRow icon={Phone} label="Primary Mobile" value={staff.mobile || staff.phone} highlight />
            <InfoRow icon={Mail} label="Official Email" value={staff.email} />
            <InfoRow icon={Home} label="Current Address" value={staff.currentAddress} />
            <InfoRow icon={MapPin} label="Permanent Address" value={staff.permanentAddress} />
          </SectionCard>
        </div>

        {/* Column 2: Professional & Qualifications */}
        <div className="space-y-6">
          <SectionCard title="Employment Details" icon={Briefcase}>
            <InfoRow icon={Clock} label="Joining Date" value={fmtDate(staff.dateOfJoining || staff.joiningDate || staff.joinDate)} highlight />
            <InfoRow icon={Shield} label="Staff Role" value={staff.role || 'Teacher'} />
            <InfoRow icon={Building} label="Department" value={staff.department || 'Academics'} />
            <InfoRow icon={Briefcase} label="Designation" value={staff.designation || 'Faculty'} />
            <InfoRow icon={GraduationCap} label="Qualifications" value={staff.qualifications} />
            <InfoRow icon={Award} label="Experience" value={staff.experience} />
          </SectionCard>

          <SectionCard title="Social Profiles" icon={Share2}>
            <InfoRow icon={Share2} label="Facebook" value={staff.facebook} />
            <InfoRow icon={Share2} label="LinkedIn" value={staff.linkedin} />
            <InfoRow icon={Share2} label="Twitter / X" value={staff.twitter} />
            <InfoRow icon={Share2} label="Instagram" value={staff.instagram} />
          </SectionCard>
        </div>

        {/* Column 3: Payroll & Bank Details */}
        <div className="space-y-6">
          <SectionCard title="Payroll & Compensation" icon={DollarSign}>
            <InfoRow
              icon={DollarSign}
              label="Basic Salary"
              value={staff.basicSalary || staff.salary ? `PKR ${Number(staff.basicSalary || staff.salary).toLocaleString()}` : '—'}
              highlight
            />
            <InfoRow
              icon={DollarSign}
              label="Allowances"
              value={staff.allowances ? `PKR ${Number(staff.allowances).toLocaleString()}` : '—'}
            />
            <InfoRow
              icon={DollarSign}
              label="Deductions"
              value={staff.deductions ? `PKR ${Number(staff.deductions).toLocaleString()}` : '—'}
            />
          </SectionCard>

          <SectionCard title="Bank Account Information" icon={Building}>
            <InfoRow icon={Building} label="Bank Name" value={staff.bankName} highlight />
            <InfoRow icon={User} label="Account Title" value={staff.accountName} />
            <InfoRow icon={Hash} label="Account Number" value={staff.accountNo} />
            <InfoRow icon={MapPin} label="Branch / IFSC" value={staff.branchName || staff.ifscCode} />
          </SectionCard>

          {/* Uploaded Documents */}
          {hasDocuments && (
            <SectionCard title="Uploaded Documents" icon={FileText}>
              <div className="space-y-2 pt-2">
                {staff.cnicFront && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-xs font-semibold text-zinc-700">CNIC Front</span>
                    <a href={staff.cnicFront} target="_blank" rel="noopener noreferrer" className="text-xs text-[#009966] font-bold flex items-center gap-1 hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </a>
                  </div>
                )}
                {staff.cnicBack && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-xs font-semibold text-zinc-700">CNIC Back</span>
                    <a href={staff.cnicBack} target="_blank" rel="noopener noreferrer" className="text-xs text-[#009966] font-bold flex items-center gap-1 hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </a>
                  </div>
                )}
                {staff.cv && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-xs font-semibold text-zinc-700">Resume / CV</span>
                    <a href={staff.cv} target="_blank" rel="noopener noreferrer" className="text-xs text-[#009966] font-bold flex items-center gap-1 hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </a>
                  </div>
                )}
                {staff.lastDegree && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-xs font-semibold text-zinc-700">Degree / Certificate</span>
                    <a href={staff.lastDegree} target="_blank" rel="noopener noreferrer" className="text-xs text-[#009966] font-bold flex items-center gap-1 hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </a>
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
