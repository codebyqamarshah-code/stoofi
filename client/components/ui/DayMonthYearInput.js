'use client';

import React, { useState, useEffect } from 'react';

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

export function DayMonthYearInput({ 
  name, 
  value = '', 
  onChange, 
  minYear = 1990, 
  maxYear = 2035, 
  required = false,
  label = ''
}) {
  const parseDate = (val) => {
    if (!val) return { d: '', m: '', y: '' };
    const str = String(val).trim();
    if (str.includes('T')) {
      const [y, m, d] = str.split('T')[0].split('-');
      return { 
        d: d ? String(parseInt(d, 10)).padStart(2, '0') : '', 
        m: m ? String(parseInt(m, 10)).padStart(2, '0') : '', 
        y: y || '' 
      };
    }
    if (str.includes('-')) {
      const parts = str.split('-');
      if (parts[0].length === 4) {
        return { 
          d: parts[2] ? String(parseInt(parts[2], 10)).padStart(2, '0') : '', 
          m: parts[1] ? String(parseInt(parts[1], 10)).padStart(2, '0') : '', 
          y: parts[0] || '' 
        };
      }
      return { 
        d: parts[0] ? String(parseInt(parts[0], 10)).padStart(2, '0') : '', 
        m: parts[1] ? String(parseInt(parts[1], 10)).padStart(2, '0') : '', 
        y: parts[2] || '' 
      };
    }
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts[2]?.length === 4) {
        return { 
          d: parts[0] ? String(parseInt(parts[0], 10)).padStart(2, '0') : '', 
          m: parts[1] ? String(parseInt(parts[1], 10)).padStart(2, '0') : '', 
          y: parts[2] || '' 
        };
      }
    }
    return { d: '', m: '', y: '' };
  };

  const initial = parseDate(value);
  const [day, setDay] = useState(initial.d);
  const [month, setMonth] = useState(initial.m);
  const [year, setYear] = useState(initial.y);

  useEffect(() => {
    const parsed = parseDate(value);
    setDay(parsed.d);
    setMonth(parsed.m);
    setYear(parsed.y);
  }, [value]);

  const emitChange = (d, m, y) => {
    if (d && m && y) {
      const isoStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      if (onChange) onChange({ target: { name, value: isoStr } });
    } else if (!d && !m && !y) {
      if (onChange) onChange({ target: { name, value: '' } });
    }
  };

  const yearsList = [];
  for (let yr = maxYear; yr >= minYear; yr--) {
    yearsList.push(String(yr));
  }

  return (
    <div className="space-y-1 w-full">
      <div className="grid grid-cols-3 gap-2">
        {/* Day Select */}
        <div>
          <select
            value={day}
            onChange={(e) => {
              const newD = e.target.value;
              setDay(newD);
              emitChange(newD, month, year);
            }}
            className="flex h-10 w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-xs font-semibold text-zinc-950 shadow-xs hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86] transition-all cursor-pointer"
          >
            <option value="">Day (DD)</option>
            {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>
        </div>

        {/* Month Select */}
        <div>
          <select
            value={month}
            onChange={(e) => {
              const newM = e.target.value;
              setMonth(newM);
              emitChange(day, newM, year);
            }}
            className="flex h-10 w-full rounded-xl border border-zinc-300 bg-white px-2 py-2 text-xs font-semibold text-zinc-950 shadow-xs hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86] transition-all cursor-pointer"
          >
            <option value="">Month (MM)</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Year Select */}
        <div>
          <select
            value={year}
            onChange={(e) => {
              const newY = e.target.value;
              setYear(newY);
              emitChange(day, month, newY);
            }}
            className="flex h-10 w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-xs font-semibold text-zinc-950 shadow-xs hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86] transition-all cursor-pointer"
          >
            <option value="">Year (YYYY)</option>
            {yearsList.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium px-1 pt-0.5">
        <span className="text-zinc-600">Format: <strong className="text-zinc-900">Day / Month / Year</strong></span>
        {day && month && year ? (
          <span className="text-[#084A86] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {day}/{month}/{year}
          </span>
        ) : required ? (
          <span className="text-rose-500 font-semibold">* Required</span>
        ) : null}
      </div>
    </div>
  );
}

export default DayMonthYearInput;
