'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, CheckCircle2, User, ChevronDown, ChevronUp, 
  AlertTriangle, ShieldCheck, RefreshCw 
} from 'lucide-react';
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

const SAMPLE_DATA = {
  name: 'Muhammad Ahmed',
  firstName: 'Muhammad',
  lastName: 'Ahmed',
  admissionNo: 'PRC-2026-00125',
  regNo: 'PRC-REG-00125',
  program: 'F.Sc Medical Lab Technology',
  session: '2026–2028',
  campus: 'Sharaqpur Sharif',
  status: 'Active',
  cardExpiry: '31/08/2028',
  isSample: true
};

export default function StudentVerifyPage() {
  const params = useParams();
  const rawId = params?.id;
  const decodedId = rawId ? decodeURIComponent(rawId) : '';

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!decodedId) {
      setStudent(SAMPLE_DATA);
      setLoading(false);
      return;
    }

    // Check if test / sample identifier
    const lower = decodedId.toLowerCase();
    if (['sample', 'preview', 'demo', 'test', 'prc-2026-00125', 'prc-reg-00125'].includes(lower)) {
      setStudent(SAMPLE_DATA);
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await api.get(`/student/public-verify/${encodeURIComponent(decodedId)}`)
          .catch(async () => {
            return await api.get(`/student/verify/${encodeURIComponent(decodedId)}`).catch(() => null);
          });

        if (res?.success && res.data) {
          const d = res.data;
          const yr = d.academicYear ? parseInt(d.academicYear, 10) : 2026;
          const sessionStr = isNaN(yr) ? '2026–2028' : `${yr}–${yr + 2}`;
          const expiryStr = isNaN(yr) ? '31/08/2028' : `31/08/${yr + 2}`;

          // Format Student ID & Reg No cleanly
          const studentId = d.admissionNo || d.rollNo || decodedId;
          const rawDigits = String(d.rollNo || d.admissionNo || '').replace(/\D/g, '');
          const regNo = d.rollNo && String(d.rollNo).toUpperCase().startsWith('PRC-REG')
            ? d.rollNo
            : (rawDigits ? `PRC-REG-${rawDigits.padStart(5, '0').slice(-5)}` : (d.rollNo || `PRC-REG-${decodedId}`));

          const programName = d.className 
            ? (d.className.toLowerCase().includes('f.sc') || d.className.toLowerCase().includes('fsc') 
                ? d.className 
                : `${d.className}${d.section ? ` (${d.section})` : ''}`)
            : 'F.Sc Medical Lab Technology';

          setStudent({
            ...d,
            name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Verified Student',
            studentId,
            regNo,
            program: programName,
            session: sessionStr,
            campus: 'Sharaqpur Sharif',
            status: d.status || 'Active',
            cardExpiry: expiryStr,
            isSample: false
          });
        } else {
          // If not found in database, check if it matches a known format or show error with fallback
          setError(res?.message || 'No verified student record found matching this card.');
        }
      } catch (err) {
        console.error('Student verification error:', err);
        setError('Unable to reach server. Please check internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [decodedId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
          Verifying Student Record...
        </p>
      </div>
    );
  }

  // If error & not sample, display sleek dark error state with option to view sample preview
  if (error && !student) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-black border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Record Not Found</h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{error}</p>
          </div>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-left text-xs font-mono">
            <span className="text-zinc-500 block text-[10px] uppercase font-sans">Scanned Code:</span>
            <span className="text-zinc-300 font-bold break-all">{decodedId || '—'}</span>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => { setError(''); setStudent(SAMPLE_DATA); }}
              className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition"
            >
              View Sample Verified Student Card
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

  const s = student || SAMPLE_DATA;
  const fullName = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Muhammad Ahmed';
  const photo = s.studentPhoto ? getPhotoUrl(s) : null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 py-8">
      {/* Main Verification Card matching reference screenshots */}
      <div className="w-full max-w-md bg-black border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        
        {/* Navy Blue College Header Banner */}
        <div className="bg-[#0b2447] border border-[#143765] rounded-2xl p-5 sm:p-6 text-center text-white shadow-lg space-y-1">
          <GraduationCap className="w-9 h-9 text-white mx-auto mb-2 stroke-[1.8]" />
          <h1 className="text-base sm:text-lg font-black tracking-wide uppercase text-white">
            PAK ROYAL COLLEGE
          </h1>
          <p className="text-xs font-semibold tracking-wider uppercase text-blue-200">
            SHARAQPUR SHARIF
          </p>
          <p className="text-[9px] sm:text-[10px] tracking-widest uppercase text-blue-300/80 font-medium">
            OFFICIAL STUDENT VERIFICATION PORTAL
          </p>
        </div>

        {/* Verified Student Badge */}
        <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-semibold text-sm pt-1">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>Verified Student</span>
        </div>

        {/* Avatar / Photo */}
        <div className="flex justify-center my-2">
          {photo ? (
            <img 
              src={photo} 
              alt={fullName} 
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md" 
            />
          ) : (
            <div className="w-14 h-14 rounded-full border border-zinc-700/80 flex items-center justify-center text-zinc-300">
              <User className="w-7 h-7 stroke-[1.5]" />
            </div>
          )}
        </div>

        {/* Student Name & Subtitle */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {fullName}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {s.isSample ? 'Sample Digital Student ID' : 'Official Digital Student ID'}
          </p>
        </div>

        {/* Primary Data Rows (Table with thin dividers) */}
        <div className="border-t border-b border-zinc-900 divide-y divide-zinc-900 text-sm">
          {/* Student ID */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-400">Student ID</span>
            <span className="text-zinc-100 font-mono font-medium">{s.studentId || s.admissionNo || 'PRC-2026-00125'}</span>
          </div>

          {/* Registration No. */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-400">Registration No.</span>
            <span className="text-zinc-100 font-mono font-medium">{s.regNo || 'PRC-REG-00125'}</span>
          </div>

          {/* Program */}
          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-zinc-400 shrink-0">Program</span>
            <span className="text-zinc-100 font-medium text-right truncate">{s.program || 'F.Sc Medical Lab Technology'}</span>
          </div>

          {/* Session */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-400">Session</span>
            <span className="text-zinc-100 font-medium">{s.session || '2026–2028'}</span>
          </div>

          {/* Campus */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-400">Campus</span>
            <span className="text-zinc-100 font-medium">{s.campus || 'Sharaqpur Sharif'}</span>
          </div>

          {/* Student Status */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-400">Student Status</span>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
              {s.status || 'Active'}
            </span>
          </div>

          {/* Card Expiry */}
          <div className="py-3 flex items-center justify-between">
            <span className="text-zinc-400">Card Expiry</span>
            <span className="text-zinc-100 font-medium">{s.cardExpiry || '31/08/2028'}</span>
          </div>
        </div>

        {/* Optional Collapsible for Additional Database Details (if real student) */}
        {!s.isSample && (s.fatherName || s.cnic || s.dob) && (
          <div className="pt-1">
            <button
              onClick={() => setShowMore(!showMore)}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              <span>More Verified Details (Father, CNIC, DOB)</span>
              {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showMore && (
              <div className="mt-2 p-3 bg-zinc-950 rounded-xl border border-zinc-900 divide-y divide-zinc-900 text-xs">
                {s.fatherName && (
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-500">Father Name:</span>
                    <span className="text-zinc-200 font-medium">{s.fatherName}</span>
                  </div>
                )}
                {s.cnic && (
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-500">CNIC / B-Form:</span>
                    <span className="text-zinc-200 font-mono">{formatCnic(s.cnic)}</span>
                  </div>
                )}
                {s.dob && (
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-500">Date of Birth:</span>
                    <span className="text-zinc-200 font-mono">{formatDateDMY(s.dob)}</span>
                  </div>
                )}
                {s.joiningDate && (
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-500">Joining Date:</span>
                    <span className="text-zinc-200 font-mono">{formatDateDMY(s.joiningDate)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom Section matching Screenshot 2 */}
        <div className="text-center pt-2 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-white font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>Officially Verified Student Record</span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            This student identity has been verified against the Pak Royal College student database.
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
            {s.isSample 
              ? 'This is an illustrative preview using fictional student information.' 
              : 'Official verification record issued by Pak Royal College.'}
          </p>
        </div>

      </div>
    </div>
  );
}
