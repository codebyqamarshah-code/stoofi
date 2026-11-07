'use client';

import React, { useState, useEffect } from 'react';
import { User, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { getPublicVerificationUrl, formatStudentRollNo, getPhotoUrl } from '@/lib/utils';

/**
 * Scannable Verification QR Code Component for ID Cards
 */
export function StudentCardQR({ rec, size = 64, isDark = false }) {
  const [qrSrc, setQrSrc] = useState('');

  useEffect(() => {
    if (!rec) return;
    const identifier = rec.admissionNo || rec.rollNo || (rec._id ? String(rec._id) : '') || rec.staffNo || 'PRC0021';
    const verifyUrl = getPublicVerificationUrl(identifier);

    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: Math.max(size * 4, 256),
      errorCorrectionLevel: 'M',
      color: {
        dark: isDark ? '#ffffff' : '#324F91',
        light: isDark ? '#324F91' : '#ffffff'
      }
    })
      .then(setQrSrc)
      .catch(() => {});
  }, [rec, size, isDark]);

  if (!qrSrc) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="bg-white rounded-lg border border-slate-200 flex items-center justify-center animate-pulse shrink-0"
      >
        <QrCode className="w-5 h-5 text-slate-300" />
      </div>
    );
  }

  return (
    <img
      src={qrSrc}
      alt="Verification QR"
      style={{ width: size, height: size }}
      className="object-contain rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs shrink-0"
      title="Scan to verify student details"
    />
  );
}

/**
 * Pak Royal College Student ID Card — FRONT SIDE
 * Matches 1:1 with the official reference specification
 */
export function PakRoyalCardFront({ rec, schoolSetting = null, className = '', isPrint = false }) {
  if (!rec) return null;

  const fullName = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Bilal Akram';
  const fatherName = rec.fatherName || '';
  const photo = rec.studentPhoto || rec.photo || rec.staffPhoto;
  const photoUrl = getPhotoUrl(photo);
  const initial = (fullName.charAt(0) || 'S').toUpperCase();
  const rollNo = formatStudentRollNo(rec.rollNo || rec.admissionNo || 'PRC0021');
  const classDisplay = `${rec.className || 'FSC OTT'} ${rec.section ? `(${String(rec.section).replace(/^Section\s*/i, '')})` : ''}`.trim();
  const sessionText = rec.academicYear || '2026–2027';

  return (
    <div 
      className={`w-[365px] max-w-full h-[230px] bg-white rounded-none overflow-hidden border border-slate-300 shadow-md flex flex-col justify-between select-none relative font-sans text-slate-900 shrink-0 ${className}`}
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', borderRadius: '0px' }}
    >
      {/* ── TOP HEADER BAR ── */}
      <div className="relative bg-[#324F91] px-3.5 py-1.5 flex items-center justify-between overflow-hidden shrink-0">
        {/* Diagonal Translucent Polygon Overlay on Right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-20">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-white">
            <polygon points="35,0 65,0 25,100 0,100" />
            <polygon points="70,0 100,0 55,100 30,100" />
          </svg>
        </div>

        {/* Left: Crest Badge with White Ring + College Header */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="rounded-full ring-2 ring-white/95 p-0.5 bg-white shrink-0 shadow-xs">
            <img 
              src="/pak-royal-badge.png" 
              alt="Pak Royal College Crest" 
              className="w-8 h-8 rounded-full bg-white object-contain" 
            />
          </div>
          <div className="leading-tight">
            <span className="font-black text-[17px] tracking-wide uppercase text-white block">
              PAK ROYAL COLLEGE
            </span>
            <span className="text-[10.5px] text-white font-black tracking-tight leading-tight block max-w-[235px]">
              Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura
            </span>
          </div>
        </div>
      </div>

      {/* Gold Divider Line Beneath Header */}
      <div className="h-[2.5px] bg-[#d4af37] w-full shrink-0" />

      {/* ── BODY SECTION (DUAL COLUMN) ── */}
      <div className="flex items-stretch flex-1 bg-white min-h-[148px]">
        {/* Left Column: Photo Container (Grey-Blue Panel) */}
        <div className="w-[116px] shrink-0 bg-[#f0f4f8] px-2.5 py-2 flex flex-col items-center justify-center border-r border-slate-100">
          {/* Photo frame: strictly fixed size, never lets photo bleed outside */}
          <div 
            style={{
              position: 'relative',
              width: '82px',
              height: '102px',
              minWidth: '82px',
              minHeight: '102px',
              maxWidth: '82px',
              maxHeight: '102px',
              flexShrink: 0,
              borderRadius: '10px',
              border: '2px solid #324F91',
              overflow: 'hidden',
              backgroundColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}
          >
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={fullName} 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  display: 'block',
                  imageOrientation: 'from-image'
                }}
              />
            ) : null}
            <div style={{ display: photoUrl ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
              <User className="w-8 h-8 text-[#324F91]/60" />
              <span className="text-[9px] font-black mt-1 uppercase text-[#324F91]">{initial}</span>
            </div>
          </div>
          <span className="text-[10.5px] font-black tracking-[0.25em] text-[#324F91] uppercase text-center mt-1.5 block">
            STUDENT
          </span>
        </div>

        {/* Right Column: Bio Data Details */}
        <div className="flex-1 min-w-0 bg-white p-3 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black text-[#324F91] tracking-wider uppercase block">
              STUDENT IDENTITY CARD
            </span>
            <h2 className="text-[18px] font-black text-[#324F91] leading-tight truncate mt-0.5">
              {fullName}
            </h2>
            <div className="border-b border-slate-200 my-1" />

            <div className="space-y-1">
              <div>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider block">
                  FATHER&apos;S NAME
                </span>
                <span className="text-[12.5px] font-bold text-slate-900 truncate block">
                  {fatherName || '—'}
                </span>
              </div>

              <div>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider block">
                  CLASS / PROGRAMME
                </span>
                <span className="text-[13px] font-black text-[#324F91] truncate block">
                  {classDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Roll No & Session Info Capsule Box */}
          <div className="bg-[#edf2f7] rounded-lg px-2.5 py-1.5 flex items-center justify-between border border-slate-200/60 mt-1">
            <div className="flex-1">
              <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-wider block">
                ROLL NO.
              </span>
              <span className="text-[12px] font-black font-mono text-[#324F91] block">
                {rollNo}
              </span>
            </div>
            <div className="w-px h-5 bg-slate-300 mx-2 shrink-0" />
            <div className="flex-1 text-right">
              <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-wider block">
                SESSION
              </span>
              <span className="text-[12px] font-black font-mono text-[#324F91] block">
                {sessionText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER BAR ── */}
      <div 
        className="bg-[#324F91] px-3.5 h-[28px] text-white flex justify-between items-center relative select-none shrink-0"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        {/* Gold accent rectangle tab on top-left edge */}
        <div className="absolute top-0 left-3 w-8 h-[2.5px] bg-[#d4af37]" />

        <span className="font-mono text-[11px] text-white font-black tracking-tight">
          www.pakroyalcollege.edu.pk
        </span>

        <span className="font-mono text-[12px] font-black text-amber-300">
          03 111 444 810
        </span>
      </div>
    </div>
  );
}

/**
 * Pak Royal College Student ID Card — BACK SIDE
 * Matches 1:1 with the official reference specification
 */
export function PakRoyalCardBack({ rec, schoolSetting = null, className = '', isPrint = false }) {
  if (!rec) return null;

  const rollNo = formatStudentRollNo(rec.rollNo || rec.admissionNo || 'PRC0021');

  return (
    <div 
      className={`w-[365px] max-w-full h-[230px] bg-white rounded-none overflow-hidden border border-slate-300 shadow-md flex flex-col justify-between select-none relative font-sans text-slate-900 shrink-0 ${className}`}
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', borderRadius: '0px' }}
    >
      {/* ── TOP HEADER BAR WITH AUTHORIZED SIGNATURE ON RIGHT ── */}
      <div className="relative bg-[#324F91] px-3 py-1.5 flex items-center justify-between overflow-hidden shrink-0">
        {/* Diagonal Translucent Polygon Overlay on Right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-20">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-white">
            <polygon points="35,0 65,0 25,100 0,100" />
            <polygon points="70,0 100,0 55,100 30,100" />
          </svg>
        </div>

        {/* Left: Crest Badge + College Header */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="rounded-full ring-2 ring-white/95 p-0.5 bg-white shrink-0 shadow-xs">
            <img 
              src="/pak-royal-badge.png" 
              alt="Pak Royal College Crest" 
              className="w-8 h-8 rounded-full bg-white object-contain" 
            />
          </div>
          <div className="leading-tight">
            <span className="font-black text-[16.5px] tracking-wide uppercase text-white block">
              PAK ROYAL COLLEGE
            </span>
            <span className="text-[10.5px] text-white font-black tracking-tight leading-tight block max-w-[225px]">
              Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura
            </span>
          </div>
        </div>

        {/* Right: Gold Authorized Signature m. umer w */}
        <div className="flex flex-col items-center justify-center shrink-0 pr-1 relative z-10">
          <img 
            src="/signature-gold.png" 
            alt="Authorized Signature" 
            className="h-4 w-auto object-contain filter drop-shadow-xs" 
            style={{ height: '16px' }}
          />
          <div className="w-20 h-px bg-white/40 my-0.5" />
          <span className="font-bold text-[7.5px] text-white block leading-none">
            Authorized signature
          </span>
        </div>
      </div>

      {/* Gold Divider Line Beneath Header */}
      <div className="h-[2.5px] bg-[#d4af37] w-full shrink-0" />

      {/* ── BODY SECTION (DUAL COLUMN: CARDHOLDER INFO & QR CODE) ── */}
      <div className="flex items-stretch flex-1 bg-white min-h-[148px]">
        {/* Left Column: Instructions & Return Address */}
        <div className="flex-1 min-w-0 bg-white px-3 py-1 flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] font-black text-[#324F91] tracking-wider uppercase mb-0.5">
              CARDHOLDER INFORMATION
            </h4>
            <div className="text-[11.5px] font-black text-slate-950 leading-snug space-y-0.5">
              <p className="font-black text-slate-950 leading-tight">This card is non-transferable.</p>
              <p className="font-black text-slate-950 leading-tight">Carry it while on college premises.</p>
              <p className="font-black text-slate-950 leading-tight">Report loss to the college office.</p>
            </div>
          </div>

          <div className="border-b border-slate-200 w-full my-0.5" />

          <div className="space-y-0.5">
            <span className="text-[8.5px] font-black text-slate-600 uppercase tracking-wider block">
              IF FOUND, PLEASE RETURN TO
            </span>
            <span className="font-black text-[13px] text-[#324F91] block leading-tight">
              Pak Royal College
            </span>
            <span className="text-[10.5px] text-slate-950 font-black leading-tight block">
              Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura
            </span>
            <span className="text-[11.5px] font-black text-[#324F91] block leading-tight">
              Contact: 03 111 444 810
            </span>
          </div>

          <p className="text-[10px] text-slate-900 font-black not-italic mt-0.5 block tracking-tight">
            Property of Pak Royal College.
          </p>
        </div>

        {/* Right Column: Scannable QR Code Panel */}
        <div className="w-[110px] shrink-0 p-1.5 flex flex-col items-center justify-center">
          <div className="bg-[#f0f4f8] rounded-xl p-2 flex flex-col items-center justify-center border border-slate-200/80 w-full shadow-2xs">
            <StudentCardQR rec={rec} size={58} />
            <span className="text-[7.5px] font-black text-[#324F91] uppercase tracking-wider mt-1 text-center block">
              SCAN STUDENT QR
            </span>
            <span className="font-mono text-[10.5px] font-black text-[#324F91] text-center block">
              {rollNo}
            </span>
          </div>
        </div>
      </div>

      {/* ── FOOTER BAR ── */}
      <div 
        className="bg-[#324F91] px-3.5 h-[28px] text-white flex justify-between items-center relative select-none shrink-0"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        {/* Gold accent rectangle tab on top-left edge */}
        <div className="absolute top-0 left-3 w-8 h-[2.5px] bg-[#d4af37]" />

        <span className="font-mono text-[11px] text-white font-black tracking-tight">
          www.pakroyalcollege.edu.pk
        </span>

        <span className="font-mono text-[12px] font-black text-amber-300">
          03 111 444 810
        </span>
      </div>
    </div>
  );
}

/**
 * Pak Royal College Student ID Card — BOTH SIDES (Front & Back)
 */
export function PakRoyalCardBoth({ rec, schoolSetting = null, className = '', isInspectModal = false, stacked = false }) {
  if (!rec) return null;

  const isStacked = stacked || isInspectModal;
  const layoutClass = isStacked 
    ? 'flex flex-col items-center justify-center gap-4' 
    : 'flex flex-col xl:flex-row items-center justify-center gap-4';

  return (
    <div className={`${layoutClass} ${className}`}>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 print:hidden">
          Front Side
        </span>
        <PakRoyalCardFront rec={rec} schoolSetting={schoolSetting} />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 print:hidden">
          Back Side
        </span>
        <PakRoyalCardBack rec={rec} schoolSetting={schoolSetting} />
      </div>
    </div>
  );
}
