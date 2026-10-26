'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MONTHS = [
  { value: '01', label: '01 - Jan' },
  { value: '02', label: '02 - Feb' },
  { value: '03', label: '03 - Mar' },
  { value: '04', label: '04 - Apr' },
  { value: '05', label: '05 - May' },
  { value: '06', label: '06 - Jun' },
  { value: '07', label: '07 - Jul' },
  { value: '08', label: '08 - Aug' },
  { value: '09', label: '09 - Sep' },
  { value: '10', label: '10 - Oct' },
  { value: '11', label: '11 - Nov' },
  { value: '12', label: '12 - Dec' },
];

function formatDisplayDate(val) {
  if (!val) return '';
  const str = String(val).trim();
  // Match ISO YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${d}/${m}/${y}`;
  }
  return str;
}

export function DobInput({
  value = '',
  onChange,
  className = '',
  name = 'dob',
  minYear = 1970,
  maxYear = 2026,
  label = 'Date of Birth',
  required = false
}) {
  const [textVal, setTextVal] = useState(formatDisplayDate(value));
  const [mode, setMode] = useState('input'); // 'input' or 'dropdowns'
  const calendarRef = useRef(null);

  useEffect(() => {
    setTextVal(formatDisplayDate(value));
  }, [value]);

  // Handle typing numbers directly
  const handleTextChange = (e) => {
    const raw = e.target.value;
    // Allow user to backspace or delete cleanly
    if (!raw) {
      setTextVal('');
      if (onChange) onChange('');
      return;
    }

    // Digits only
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }

    setTextVal(formatted);

    // If complete 8 digits (DD/MM/YYYY), notify parent
    if (digits.length === 8) {
      const dd = digits.slice(0, 2);
      const mm = digits.slice(2, 4);
      const yyyy = digits.slice(4, 8);
      const dmy = `${dd}/${mm}/${yyyy}`;
      if (onChange) onChange(dmy);
    } else {
      if (onChange) onChange(formatted);
    }
  };

  // Handle calendar picker
  const handleCalendarPick = (e) => {
    const picked = e.target.value; // YYYY-MM-DD
    if (!picked) return;
    const parts = picked.split('-');
    if (parts.length === 3) {
      const dmy = `${parts[2]}/${parts[1]}/${parts[0]}`;
      setTextVal(dmy);
      if (onChange) onChange(dmy);
    }
  };

  const openCalendar = () => {
    if (calendarRef.current) {
      try {
        if (typeof calendarRef.current.showPicker === 'function') {
          calendarRef.current.showPicker();
        } else {
          calendarRef.current.focus();
        }
      } catch (_) {
        calendarRef.current.focus();
      }
    }
  };

  // Parse current textVal to Day, Month, Year
  const getParts = () => {
    const clean = String(textVal || '').trim();
    const parts = clean.split(/[-/.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return { d: parts[2].padStart(2, '0'), m: parts[1].padStart(2, '0'), y: parts[0] };
      }
      return { d: parts[0].padStart(2, '0'), m: parts[1].padStart(2, '0'), y: parts[2] };
    }
    return { d: '', m: '', y: '' };
  };

  const currentParts = getParts();

  const handleDropdownChange = (d, m, y) => {
    if (d && m && y) {
      const dmy = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      setTextVal(dmy);
      if (onChange) onChange(dmy);
    } else if (!d && !m && !y) {
      setTextVal('');
      if (onChange) onChange('');
    }
  };

  const yearsList = [];
  for (let yr = maxYear; yr >= minYear; yr--) {
    yearsList.push(String(yr));
  }

  // Calculate age if valid
  let ageBadge = null;
  if (textVal && textVal.length === 10) {
    const parts = textVal.split('/');
    if (parts.length === 3) {
      const dd = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10);
      const yyyy = parseInt(parts[2], 10);
      if (!isNaN(dd) && !isNaN(mm) && !isNaN(yyyy) && yyyy > 1900 && yyyy <= maxYear) {
        const birthDate = new Date(yyyy, mm - 1, dd);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age >= 0 && age < 120) {
          ageBadge = `${age} yrs`;
        }
      }
    }
  }

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          {label} {required && <span className="text-rose-500">*</span>}
        </Label>
        <button
          type="button"
          onClick={() => setMode(mode === 'input' ? 'dropdowns' : 'input')}
          className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <SlidersHorizontal className="w-3 h-3" />
          {mode === 'input' ? 'Select Day/Month/Year' : 'Type DD/MM/YYYY'}
        </button>
      </div>

      {mode === 'input' ? (
        <div className="relative flex items-center">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="DD/MM/YYYY (e.g. 15/08/2005)"
            value={textVal}
            onChange={handleTextChange}
            className="h-10 text-xs font-mono font-bold pr-20 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 rounded-xl shadow-xs"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {textVal && (
              <button
                type="button"
                onClick={() => {
                  setTextVal('');
                  if (onChange) onChange('');
                }}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer rounded"
                title="Clear date"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {ageBadge && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {ageBadge}
              </span>
            )}

            <button
              type="button"
              onClick={openCalendar}
              className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg cursor-pointer transition-colors"
              title="Open calendar picker"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Hidden native date input for calendar popup */}
          <input
            ref={calendarRef}
            type="date"
            onChange={handleCalendarPick}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-1.5">
            {/* Day */}
            <select
              value={currentParts.d}
              onChange={(e) => handleDropdownChange(e.target.value, currentParts.m, currentParts.y)}
              className="h-10 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-2 text-xs font-semibold"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
                <option key={d} value={d}>Day {d}</option>
              ))}
            </select>

            {/* Month */}
            <select
              value={currentParts.m}
              onChange={(e) => handleDropdownChange(currentParts.d, e.target.value, currentParts.y)}
              className="h-10 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-2 text-xs font-semibold"
            >
              <option value="">Month</option>
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Year */}
            <select
              value={currentParts.y}
              onChange={(e) => handleDropdownChange(currentParts.d, currentParts.m, e.target.value)}
              className="h-10 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-2 text-xs font-semibold"
            >
              <option value="">Year</option>
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
            <span>Selected: <strong className="text-zinc-900 dark:text-zinc-100">{textVal || 'None'}</strong></span>
            {ageBadge && <span className="font-bold text-emerald-600">Age: {ageBadge}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default DobInput;
