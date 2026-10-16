import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Converts any date string (ISO, YYYY-MM-DD, etc.) into Day/Month/Year format (DD/MM/YYYY)
// Strictly formats as 2-digit Day / 2-digit Month / 4-digit Year (e.g. 15/08/2026)
export function formatDateDMY(dateInput) {
  if (!dateInput) return '—';
  try {
    const raw = String(dateInput).trim();
    if (!raw || raw === '—' || raw === '-' || raw === 'null' || raw === 'undefined') return '—';
    const str = raw.split('T')[0].split(' ')[0].trim();
    const parts = str.split(/[-/.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD -> DD/MM/YYYY
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY or DD/MM/YYYY -> DD/MM/YYYY
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
    }
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return raw;
  } catch (e) {
    return String(dateInput || '—');
  }
}

// Resolves student/user photo URL safely across local and production deployments
export function getPhotoUrl(photoPath) {
  if (!photoPath) return null;
  const p = typeof photoPath === 'object' ? (photoPath.photo || photoPath.studentPhoto) : photoPath;
  if (!p || typeof p !== 'string') return null;
  const trimmed = p.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  let baseUrl = '';
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      baseUrl = 'https://stoofi-backend.vercel.app';
    } else {
      baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    }
  } else {
    baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'https://stoofi-backend.vercel.app';
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${cleanPath}`;
}

