import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Ensure default date formatting across the software strictly adheres to DD/MM/YYYY (en-GB)
if (typeof Date.prototype.toLocaleDateString === 'function') {
  try {
    const originalToLocaleDateString = Date.prototype.toLocaleDateString;
    Date.prototype.toLocaleDateString = function (locales, options) {
      return originalToLocaleDateString.call(this, locales || 'en-GB', options);
    };
  } catch (_) {}
}

// Converts any date string (ISO, YYYY-MM-DD, Excel serials, etc.) into Day/Month/Year format (DD/MM/YYYY)
// Strictly formats as 2-digit Day / 2-digit Month / 4-digit Year (e.g. 15/08/2026)
export function formatDateDMY(dateInput) {
  if (!dateInput) return '—';
  try {
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      const dd = String(dateInput.getDate()).padStart(2, '0');
      const mm = String(dateInput.getMonth() + 1).padStart(2, '0');
      const yyyy = dateInput.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }

    const raw = String(dateInput).trim();
    if (!raw || raw === '—' || raw === '-' || raw === 'null' || raw === 'undefined') return '—';

    // Helper to convert Excel serial number to DD/MM/YYYY
    const excelSerialToDMY = (serial) => {
      if (serial >= 1000 && serial <= 80000) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const msPerDay = 24 * 60 * 60 * 1000;
        const d = new Date(excelEpoch.getTime() + serial * msPerDay);
        if (!isNaN(d.getTime()) && d.getUTCFullYear() > 1900 && d.getUTCFullYear() < 2100) {
          const day = String(d.getUTCDate()).padStart(2, '0');
          const month = String(d.getUTCMonth() + 1).padStart(2, '0');
          const year = d.getUTCFullYear();
          return `${day}/${month}/${year}`;
        }
      }
      return null;
    };

    // 1. Direct serial number check (e.g. 37810, 39174)
    if (/^\d{4,6}(\.\d+)?$/.test(raw)) {
      const conv = excelSerialToDMY(Math.floor(parseFloat(raw)));
      if (conv) return conv;
    }

    const str = raw.split('T')[0].split(' ')[0].trim();
    const parts = str.split(/[-/.]/);
    if (parts.length === 3) {
      // Check if any component is a serial year > 2100 (e.g. 01/01/37810 or 37810-01-01)
      for (const p of parts) {
        const n = parseInt(p, 10);
        if (n > 2100 && n <= 80000) {
          const conv = excelSerialToDMY(n);
          if (conv) return conv;
        }
      }

      if (parts[0].length === 4) {
        // YYYY-MM-DD -> DD/MM/YYYY
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY or DD/MM/YYYY -> DD/MM/YYYY
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
      } else if (parts[2].length === 2) {
        const yFull = parseInt(parts[2], 10) > 50 ? `19${parts[2]}` : `20${parts[2]}`;
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${yFull}`;
      }
    }

    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      // If parsed year is corrupted or huge (e.g. 37810), try Excel serial fallback
      if (d.getFullYear() > 2100 && d.getFullYear() <= 80000) {
        const conv = excelSerialToDMY(d.getFullYear());
        if (conv) return conv;
      }
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
  
  // If it's already a valid base64 data URI, HTTP(S) URL, or blob
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Reject strings that are obviously not image paths (e.g., 'null', 'undefined', 'none', single letters, etc.)
  if (trimmed.length < 4 || /^(null|undefined|none|n\/a|na|-|—)$/i.test(trimmed)) {
    return null;
  }

  // Check if string has an image-like format or extension (including .jfif)
  const hasImageExt = /\.(jpe?g|png|webp|gif|svg|bmp|avif|jfif)$/i.test(trimmed.split('?')[0]);
  const isUploadPath = trimmed.includes('upload') || trimmed.startsWith('/uploads/');

  if (!hasImageExt && !isUploadPath && !trimmed.startsWith('/')) {
    return null;
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

  // Format the path cleanly under /uploads/
  let cleanPath = trimmed;
  if (cleanPath.startsWith('/uploads/')) {
    // Already good
  } else if (cleanPath.startsWith('uploads/')) {
    cleanPath = `/${cleanPath}`;
  } else if (cleanPath.startsWith('/')) {
    cleanPath = `/uploads${cleanPath}`;
  } else {
    cleanPath = `/uploads/${cleanPath}`;
  }

  return `${baseUrl}${cleanPath}`;
}

// Generates or retrieves a persistent unique Device ID for browser/system recognition
export function getClientDeviceId() {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = localStorage.getItem('stoofi_device_id');
    if (!id) {
      // Create a unique persistent fingerprint
      const rnd = Math.random().toString(36).substring(2, 12);
      const time = Date.now().toString(36);
      id = `dev_${time}_${rnd}`;
      localStorage.setItem('stoofi_device_id', id);
    }
    return id;
  } catch (e) {
    return 'browser_unknown';
  }
}

// Friendly device name from user-agent
export function getClientDeviceName() {
  if (typeof window === 'undefined') return 'Web Client';
  try {
    const ua = navigator.userAgent;
    let browser = 'Browser';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Safari/')) browser = 'Safari';
    else if (ua.includes('Firefox/')) browser = 'Firefox';

    let os = 'OS';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    return `${browser} on ${os}`;
  } catch (e) {
    return 'Web Browser';
  }
}

// Generate the official scannable verification URL for student ID card QR code
export function getPublicVerificationUrl(identifier) {
  if (!identifier) return 'https://pakroyalcollege.edu.pk/verify';
  const cleanId = encodeURIComponent(String(identifier).trim());
  let baseUrl = 'https://stoofi.vercel.app';
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (origin.startsWith('http://') || origin.startsWith('https://')) {
      baseUrl = origin;
    }
  }
  return `${baseUrl}/verify/student/${cleanId}`;
}

// Formats Roll No to start with PRC followed by 4 digits (e.g. PRC0001, PRC0002)
export function formatStudentRollNo(rollNo, fallbackIndex = 1) {
  if (!rollNo && !fallbackIndex) return 'PRC0001';
  const raw = String(rollNo || fallbackIndex).trim();
  if (!raw || raw === '—' || raw === '-') return `PRC${String(fallbackIndex || 1).padStart(4, '0')}`;
  
  // Extract number from string (e.g. "PRC260001" -> 1, "PRC0001" -> 1, "1" -> 1)
  const numMatch = raw.match(/\d+/);
  if (numMatch) {
    const num = parseInt(numMatch[0], 10);
    // If the number was a large concatenated timestamp/code like 260001, take sequence
    const finalNum = num > 9999 ? (num % 10000 || fallbackIndex || 1) : num;
    return `PRC${String(finalNum).padStart(4, '0')}`;
  }
  return `PRC${String(fallbackIndex || 1).padStart(4, '0')}`;
}
