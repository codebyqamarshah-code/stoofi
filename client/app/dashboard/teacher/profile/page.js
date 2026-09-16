'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase, Hash, Shield, BadgeCheck, GraduationCap, Award
} from 'lucide-react';

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

export default function TeacherProfilePage() {
  const { user } = useAuth();
  
  if (!user) {
    return <div className="p-8 text-center text-zinc-500">Loading Profile...</div>;
  }

  const getInitials = () => {
    const n = user?.name || user?.email || 'T';
    return n.charAt(0).toUpperCase();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Profile Card */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative h-28 w-28 rounded-full border-4 border-white shadow-lg bg-zinc-900 text-white flex items-center justify-center text-4xl font-black shrink-0 overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            getInitials()
          )}
        </div>

        <div className="flex-1 text-center sm:text-left relative z-10 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
              {user.name || 'Teacher Profile'}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 w-fit mx-auto sm:mx-0">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified {user.role}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-medium text-zinc-600 mt-4">
            <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
              <Mail className="h-4 w-4 text-zinc-400" />
              {user.email || '—'}
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
              <Briefcase className="h-4 w-4 text-zinc-400" />
              Staff ID: {user.staffId || 'TCH-' + Math.floor(Math.random() * 10000)}
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title="Personal Details" icon={User}>
            <InfoRow icon={User} label="Full Name" value={user.name || '—'} highlight />
            <InfoRow icon={Calendar} label="Date of Birth" value={user.dob || '—'} />
            <InfoRow icon={User} label="Gender" value={user.gender || '—'} />
            <InfoRow icon={User} label="Marital Status" value={user.maritalStatus || '—'} />
          </SectionCard>
          
          <SectionCard title="Contact Info" icon={Phone}>
            <InfoRow icon={Phone} label="Phone Number" value={user.phone || '—'} highlight />
            <InfoRow icon={Mail} label="Email Address" value={user.email || '—'} />
            <InfoRow icon={MapPin} label="Current Address" value={user.address || '—'} />
          </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Professional Information" icon={Briefcase}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <InfoRow icon={Hash} label="Staff ID" value={user.staffId || '—'} highlight />
              <InfoRow icon={Briefcase} label="Designation" value={user.designation || 'Senior Teacher'} />
              <InfoRow icon={GraduationCap} label="Department" value={user.department || 'Academics'} />
              <InfoRow icon={Calendar} label="Joining Date" value={user.joiningDate || '—'} />
              <InfoRow icon={Award} label="Qualification" value={user.qualification || 'M.Sc / B.Ed'} />
              <InfoRow icon={Briefcase} label="Experience" value={user.experience || '—'} />
            </div>
          </SectionCard>

          <SectionCard title="Account Security" icon={Shield}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <InfoRow icon={Shield} label="System Role" value={user.role} highlight />
              <InfoRow icon={User} label="Username" value={user.username || user.email} />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
