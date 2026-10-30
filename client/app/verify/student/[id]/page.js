'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, CheckCircle2, User, 
  AlertTriangle, Briefcase, RefreshCw 
} from 'lucide-react';
import { formatDateDMY, getPhotoUrl, formatStudentRollNo } from '@/lib/utils';
import api from '@/services/api';

function formatCnic(val) {
  if (!val) return '—';
  const digits = String(val).replace(/\D/g, '');
  if (digits.length === 13) {
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  }
  return String(val);
}

export default function StudentVerifyPage() {
  const params = useParams();
  const rawId = params?.id;
  const decodedId = rawId ? decodeURIComponent(rawId).trim() : '';

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!decodedId) {
      setError('No identification code scanned.');
      setLoading(false);
      return;
    }

    const fetchRecord = async () => {
      try {
        setLoading(true);
        setError('');

        // Attempt 1: Direct browser fetch to /api/student/public-verify (works for all external QR scans without auth)
        let json = null;
        try {
          const res = await fetch(`/api/student/public-verify/${encodeURIComponent(decodedId)}`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
          });
          if (res.ok) {
            json = await res.json();
          } else {
            const errJson = await res.json().catch(() => null);
            if (errJson && errJson.message) {
              setError(errJson.message);
            }
          }
        } catch (_) {}

        // Attempt 2: Fallback to axios api client if fetch failed
        if (!json || !json.data) {
          try {
            const apiRes = await api.get(`/student/public-verify/${encodeURIComponent(decodedId)}`);
            if (apiRes?.success && apiRes.data) {
              json = apiRes;
            }
          } catch (e2) {
            if (!error && e2?.response?.data?.message) {
              setError(e2.response.data.message);
            }
          }
        }

        // Attempt 3: Try verify endpoint as backup
        if (!json || !json.data) {
          try {
            const res3 = await fetch(`/api/student/verify/${encodeURIComponent(decodedId)}`, {
              headers: { 'Accept': 'application/json' },
              cache: 'no-store'
            });
            if (res3.ok) {
              json = await res3.json();
            }
          } catch (_) {}
        }

        if (json?.success && json.data) {
          const d = json.data;
          const isStaff = !!d.isStaff;
          const yr = d.academicYear ? parseInt(d.academicYear, 10) : 2026;
          const sessionStr = isNaN(yr) ? '2026–2028' : `${yr}–${yr + 2}`;
          const expiryStr = isNaN(yr) ? '31/08/2028' : `31/08/${yr + 2}`;

          const studentId = d.admissionNo || d.rollNo || decodedId;
          const rawDigits = String(d.rollNo || d.admissionNo || '').replace(/\D/g, '');
          const regNo = d.rollNo && String(d.rollNo).toUpperCase().startsWith('PRC-REG')
            ? d.rollNo
            : (rawDigits ? `PRC-REG-${rawDigits.padStart(5, '0').slice(-5)}` : (d.rollNo || `PRC-REG-${decodedId}`));

          const programName = d.className 
            ? (d.className.toLowerCase().includes('f.sc') || d.className.toLowerCase().includes('fsc') 
                ? d.className 
                : `${d.className}${d.section ? ` (${d.section})` : ''}`)
            : (isStaff ? (d.designation || 'Staff') : 'F.Sc Medical Lab Technology');

          setStudent({
            ...d,
            name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Verified Person',
            studentId,
            regNo,
            program: programName,
            session: isStaff ? 'Permanent' : sessionStr,
            campus: 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura',
            status: d.status || 'Active',
            cardExpiry: isStaff ? 'Valid' : expiryStr,
            isStaff
          });
          setError('');
        } else {
          // Record not found in database — DO NOT display dummy student!
          setStudent(null);
          if (!error) {
            setError(`No verified record found for scanned code: ${decodedId}`);
          }
        }
      } catch (err) {
        console.error('Record verification error:', err);
        setStudent(null);
        setError(`Unable to verify scanned code (${decodedId}). Please check internet connection.`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [decodedId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
          Verifying Official Record...
        </p>
      </div>
    );
  }

  // If error or student not found, display clear, transparent Record Not Found screen
  if (!student || error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Record Not Found</h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              {error || `No verified record exists for identification code:`}
            </p>
          </div>
          <div className="p-3 bg-black rounded-xl border border-zinc-800 text-left text-xs font-mono">
            <span className="text-zinc-500 block text-[10px] uppercase font-sans">Scanned Code:</span>
            <span className="text-amber-400 font-bold break-all">{decodedId || '—'}</span>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Scan
            </button>
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const s = student;
  const fullName = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Verified Person';
  const photo = s.photo ? getPhotoUrl(s.photo) : null;
  const isStaff = !!s.isStaff;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 py-8">
      {/* Main Verification Card */}
      <div className="w-full max-w-md bg-black border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        
        {/* Navy Blue College Header Banner */}
        <div className="bg-[#0b2447] border border-[#143765] rounded-2xl p-5 sm:p-6 text-center text-white shadow-lg space-y-1">
          <GraduationCap className="w-9 h-9 text-white mx-auto mb-2 stroke-[1.8]" />
          <h1 className="text-base sm:text-lg font-black tracking-wide uppercase text-white">
            PAK ROYAL COLLEGE
          </h1>
          <p className="text-[10px] font-semibold tracking-wide text-blue-200 leading-tight">
            Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura
          </p>
          <p className="text-[9px] sm:text-[10px] tracking-widest uppercase text-blue-300/80 font-medium">
            OFFICIAL DIGITAL VERIFICATION PORTAL
          </p>
        </div>

        {/* Verified Badge */}
        <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-semibold text-sm pt-1">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{isStaff ? 'Verified Staff Member' : 'Verified Student'}</span>
        </div>

        {/* Avatar / Photo */}
        <div className="flex justify-center my-2">
          {photo ? (
            <img 
              src={photo} 
              alt={fullName}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
              }}
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md" 
              style={{ objectFit: 'cover', objectPosition: 'center 15%' }} 
            />
          ) : null}
          <div className={`w-14 h-14 rounded-full border border-zinc-700/80 items-center justify-center text-zinc-300 ${photo ? 'hidden' : 'flex'}`}>
            {isStaff ? <Briefcase className="w-7 h-7 stroke-[1.5]" /> : <User className="w-7 h-7 stroke-[1.5]" />}
          </div>
        </div>

        {/* Person Name & Subtitle */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {fullName}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {isStaff ? 'Official Digital Staff ID' : 'Official Digital Student ID'}
          </p>
        </div>

        {/* Primary Data Rows */}
        <div className="border-t border-b border-zinc-900 divide-y divide-zinc-900 text-sm">
          {/* Identifier Row */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-400">{isStaff ? 'Staff ID' : 'Student ID'}</span>
            <span className="text-zinc-100 font-mono font-medium">{s.admissionNo || s.rollNo || s.studentId}</span>
          </div>

          {/* Roll No / Staff No */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-400">{isStaff ? 'Staff No.' : 'Roll No.'}</span>
            <span className="text-amber-400 font-mono font-bold tracking-wider">
              {isStaff ? s.rollNo : formatStudentRollNo(s.rollNo || s.studentId || 1)}
            </span>
          </div>

          {/* Father's Name if student */}
          {s.fatherName ? (
            <div className="py-3 flex items-center justify-between">
              <span className="text-zinc-400">Father's Name</span>
              <span className="text-zinc-100 font-medium">{s.fatherName}</span>
            </div>
          ) : null}

          {/* Program or Designation */}
          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-zinc-400 shrink-0">{isStaff ? 'Designation / Dept' : 'Program'}</span>
            <span className="text-zinc-100 font-medium text-right truncate">
              {isStaff ? `${s.designation || 'Staff'}${s.department ? ` — ${s.department}` : ''}` : (s.program || 'F.Sc Medical Lab Technology')}
            </span>
          </div>

          {/* Session */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-400">{isStaff ? 'Tenure' : 'Session'}</span>
            <span className="text-zinc-100 font-medium">{s.session || '2026–2028'}</span>
          </div>

          {/* Campus */}
          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-zinc-400 shrink-0">Campus</span>
            <span className="text-zinc-100 font-medium text-right text-xs">
              {s.campus || 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura'}
            </span>
          </div>

          {/* Status */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-400">Status</span>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
              {s.status || 'Active'}
            </span>
          </div>

          {/* Card Expiry */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-400">Card Validity</span>
            <span className="text-zinc-100 font-medium">{s.cardExpiry || 'Valid'}</span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center pt-2 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-white font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>Officially Verified Record</span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            This identity has been verified against the official Pak Royal College database.
          </p>
          <div className="pt-2">
            <a 
              href="https://pakroyalcollege.edu.pk" 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs text-zinc-300 hover:text-white transition-colors"
            >
              www.pakroyalcollege.edu.pk
            </a>
          </div>
          <p className="text-[10px] text-zinc-500">
            Official verification record issued by Pak Royal College.
          </p>
        </div>

      </div>
    </div>
  );
}
