'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { getPhotoUrl } from '@/lib/utils';

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-blue-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-indigo-600',
  'bg-cyan-600',
];

/**
 * StaffAvatar component
 * Renders staff photo with high-fidelity object-fit cover and fallback to initials with vibrant backgrounds.
 */
export default function StaffAvatar({
  photo,
  name = '',
  firstName = '',
  lastName = '',
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl', '2xl'
  className = '',
  rounded = 'rounded-full'
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photo]);

  const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Staff';

  const getInitials = () => {
    const parts = fullName.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0]?.slice(0, 2)?.toUpperCase() || 'ST';
  };

  const resolvedUrl = !imgError ? getPhotoUrl(photo) : null;

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-20 w-20 text-xl',
    '2xl': 'h-24 w-24 text-2xl',
  }[size] || 'h-11 w-11 text-sm';

  const charCode = (fullName.charCodeAt(0) || 0) + (fullName.charCodeAt(1) || 0);
  const colorClass = AVATAR_COLORS[charCode % AVATAR_COLORS.length];

  if (resolvedUrl) {
    return (
      <div className={`${sizeClasses} ${rounded} overflow-hidden bg-zinc-100 border border-zinc-200/80 shrink-0 shadow-sm flex items-center justify-center ${className}`}>
        <img
          src={resolvedUrl}
          alt={fullName}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-top block shrink-0"
          style={{ imageOrientation: 'from-image' }}
        />
      </div>
    );
  }

  const initials = getInitials();
  const showInitials = initials && initials !== 'ST';

  return (
    <div
      className={`${sizeClasses} ${rounded} ${colorClass} text-white font-bold flex items-center justify-center shrink-0 shadow-sm select-none border border-white/20 ${className}`}
    >
      {showInitials ? initials : <User className="h-1/2 w-1/2 text-white/90" />}
    </div>
  );
}
