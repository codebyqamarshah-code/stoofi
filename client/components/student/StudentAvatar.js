'use client';

import React, { useState } from 'react';

/**
 * Robust Student Avatar component.
 * Displays photo if available and successfully loaded.
 * If image fails to load (404, network error, or invalid path),
 * gracefully falls back to initials with an attractive, professional gradient background.
 */
export default function StudentAvatar({
  photo,
  firstName = '',
  lastName = '',
  size = 'md', // 'sm' (28px), 'md' (32px), 'lg' (40px), 'xl' (96px)
  className = '',
  rounded = 'rounded-full'
}) {
  const [imgError, setImgError] = useState(false);

  const getInitials = () => {
    const f = (firstName || '').trim().charAt(0).toUpperCase();
    const l = (lastName || '').trim().charAt(0).toUpperCase();
    return f || l || 'S';
  };

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-7 w-7 text-xs',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
    xl: 'h-24 w-24 text-2xl'
  }[size] || 'h-8 w-8 text-xs';

  // Palette of subtle, elegant backgrounds based on name initial
  const colorIndex = (getInitials().charCodeAt(0) || 0) % 5;
  const bgStyles = [
    'bg-blue-50 text-blue-800 border-blue-200',
    'bg-emerald-50 text-emerald-800 border-emerald-200',
    'bg-purple-50 text-purple-800 border-purple-200',
    'bg-amber-50 text-amber-900 border-amber-200',
    'bg-rose-50 text-rose-800 border-rose-200'
  ][colorIndex];

  const hasPhoto = Boolean(photo && typeof photo === 'string' && photo.trim() && !imgError);

  return (
    <div
      className={`${sizeClasses} ${rounded} overflow-hidden border shrink-0 flex items-center justify-center font-bold select-none ${
        hasPhoto ? 'border-zinc-200 bg-zinc-100' : bgStyles
      } ${className}`}
    >
      {hasPhoto ? (
        <img
          src={photo}
          alt=""
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-black uppercase tracking-wider">{getInitials()}</span>
      )}
    </div>
  );
}
