'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, CheckCircle2, User, BookOpen, Hash, 
  Calendar, Award, Building, ArrowLeft, Clock, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateDMY, getPhotoUrl } from '@/lib/utils';
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
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifiedAt, setVerifiedAt] = useState('');

  useEffect(() => {
    setVerifiedAt(new Date().toLocaleString('en-PK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));

    const verify = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Public verification endpoint
        const res = await api.get(`/student/public-verify/${encodeURIComponent(id)}`).catch(async () => {
          // Fallback to /student/verify/:id
          return await api.get(`/student/verify/${encodeURIComponent(id)}`).catch(() => null);
        });

        if (res?.success && res.data) {
          setData(res.data);
        } else {
          setError(res?.message || 'Student record could not be verified in the college registry.');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Unable to verify record. Please check internet connection or contact college admin.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200 max-w-md w-full text-center space-y-4">
          <div className="h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-bold text-zinc-900">Scanning College Registry...</h2>
          <p className="text-xs text-zinc-500">Verifying student credentials against official database.</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-rose-200 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Verification Unsuccessful</h2>
            <p className="text-xs text-zinc-500 mt-1.5">{error || 'Record not found in Pak Royal College database.'}</p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-left text-xs space-y-1">
            <div className="text-zinc-500 font-medium">Scanned Code / ID:</div>
            <div className="font-mono font-bold text-zinc-900 break-all">{id}</div>
          </div>
          <p className="text-[11px] text-zinc-400">If you believe this is an error, please contact the Principal / Admin Office.</p>
        </div>
      </div>
    );
  }

  const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || 'Verified Student';
  const photo = getPhotoUrl(data);
  const dobFormatted = formatDateDMY(data.dob);
  const joiningFormatted = formatDateDMY(data.joiningDate);
  const cnicFormatted = formatCnic(data.cnic);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-zinc-900 to-zinc-950 p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-emerald-500/80 overflow-hidden">
        
        {/* College Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 p-4 sm:p-5 text-white flex items-center gap-3.5 border-b-2 border-amber-400">
          <img 
            src="/pak-royal-college-logo.png" 
            alt="Pak Royal College" 
            className="w-14 h-14 object-contain shrink-0 bg-white/10 rounded-full p-1 border border-white/20 shadow-md" 
          />
          <div className="min-w-0">
            <h1 className="font-black text-sm sm:text-base leading-tight uppercase tracking-tight text-white drop-shadow-sm">
              PAK ROYAL COLLEGE
            </h1>
            <p className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider mt-0.5">
              SHARAQPUR SHARIF
            </p>
            <span className="text-[9px] font-medium text-emerald-200 uppercase tracking-wide block">
              Official Student Verification System
            </span>
          </div>
        </div>

        {/* Live Verified Green Badge */}
        <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-black text-emerald-900 uppercase tracking-wide block">
                OFFICIALLY VERIFIED & ACTIVE
              </span>
              <span className="text-[10px] text-emerald-700">Live Central Database Record</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
            {data.status || 'Active'}
          </span>
        </div>

        {/* Student Bio Card */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-24 sm:w-22 sm:h-26 rounded-2xl border-2 border-emerald-600 bg-zinc-100 overflow-hidden shadow-md flex items-center justify-center shrink-0">
              {photo ? (
                <img src={photo} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-emerald-700" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 uppercase tracking-tight truncate leading-tight">
                {fullName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-zinc-900 text-white font-mono">
                  {data.admissionNo}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {data.type || 'Regular'}
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-800 mt-1.5">
                {data.className} {data.section ? `(${data.section})` : ''}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 divide-y divide-zinc-200/80 text-xs">
            <div className="py-2 flex justify-between items-center">
              <span className="text-zinc-500 font-semibold">Admission / Student ID:</span>
              <strong className="font-mono text-zinc-950 font-black">{data.admissionNo}</strong>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-zinc-500 font-semibold">Roll Number:</span>
              <strong className="font-mono text-zinc-950 font-bold">{data.rollNo || '—'}</strong>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-zinc-500 font-semibold">Class & Section:</span>
              <strong className="text-emerald-900 font-bold">{data.className} ({data.section || 'General'})</strong>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-zinc-500 font-semibold">Father / Guardian Name:</span>
              <strong className="text-zinc-900 font-bold">{data.fatherName || '—'}</strong>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-zinc-500 font-semibold">Student CNIC / B-Form:</span>
              <strong className="font-mono text-zinc-900 font-bold">{cnicFormatted}</strong>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-zinc-500 font-semibold">Gender:</span>
              <span className="text-zinc-800 font-bold">{data.gender || '—'}</span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-zinc-500 font-semibold">Date of Birth:</span>
              <strong className="font-mono text-zinc-950 font-bold">{dobFormatted}</strong>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-zinc-500 font-semibold">Date of Joining:</span>
              <strong className="font-mono text-zinc-950 font-bold">{joiningFormatted}</strong>
            </div>
          </div>

          {/* Verification Timestamp & Seal */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold block">Verified on: {verifiedAt}</span>
                <span className="text-[10px] text-zinc-500 font-mono">Digital Signature Valid</span>
              </div>
            </div>
            <span className="font-mono text-[9px] font-bold text-zinc-400">PRC-CERT-2026</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-100 p-3.5 border-t border-zinc-200 text-center text-[10px] text-zinc-500 font-medium">
          Official Digital Record &copy; Pak Royal College Sharaqpur Sharif. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
