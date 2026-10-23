'use client';

import * as React from "react"
import { createPortal } from "react-dom"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDisplayDMY(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (!s || s === 'null' || s === 'undefined' || s === '—' || s === '-') return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, d] = s.split('T')[0].split('-');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
  } catch (e) {}
  return s;
}

function toISO(dmy) {
  if (!dmy) return '';
  const s = String(dmy).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parts = s.split(/[\/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
      const dd = parts[0].padStart(2, '0');
      const mm = parts[1].padStart(2, '0');
      const yyyy = parts[2];
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
  }
  return s;
}

function parseDMYParts(dmy) {
  const iso = toISO(dmy);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return { year: y, month: m - 1, day: d };
    }
  }
  return null;
}

const DateInput = React.forwardRef(function DateInput(
  {
    className,
    value,
    defaultValue,
    onChange,
    placeholder = "dd/mm/yyyy",
    disabled,
    readOnly,
    name,
    id,
    min,
    max,
    ...props
  },
  ref
) {
  const [textValue, setTextValue] = React.useState(() => toDisplayDMY(value || defaultValue || ''));
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [popoverPos, setPopoverPos] = React.useState({ top: 0, left: 0 });

  const today = React.useMemo(() => new Date(), []);
  const parsedCurrent = parseDMYParts(textValue);

  const [viewYear, setViewYear] = React.useState(() => parsedCurrent?.year || today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(() =>
    parsedCurrent ? parsedCurrent.month : today.getMonth()
  );

  const wrapperRef = React.useRef(null);
  const popoverRef = React.useRef(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (value !== undefined) {
      const formatted = toDisplayDMY(value);
      setTextValue(formatted);
      const parsed = parseDMYParts(formatted);
      if (parsed) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      }
    }
  }, [value]);

  const updatePopoverPosition = React.useCallback(() => {
    if (!wrapperRef.current || typeof window === 'undefined') return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const popoverWidth = 272;
    const popoverHeight = 310;

    let top = rect.bottom + 6;
    if (window.innerHeight - rect.bottom < popoverHeight && rect.top > popoverHeight) {
      top = rect.top - popoverHeight - 6;
    }

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - popoverWidth - 12);
    }

    setPopoverPos({ top, left });
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    updatePopoverPosition();

    const handleOutsideClick = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePopoverPosition();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, updatePopoverPosition]);

  const emitChange = (isoVal, dmyVal) => {
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || props.name,
          id: id,
          value: isoVal,
          dmy: dmyVal
        },
        currentTarget: {
          name: name || props.name,
          id: id,
          value: isoVal,
          dmy: dmyVal
        },
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      onChange(syntheticEvent);
    }
  };

  const handleTextChange = (e) => {
    const inputVal = e.target.value;
    if (!inputVal) {
      setTextValue('');
      emitChange('', '');
      return;
    }

    const digits = inputVal.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = digits;
    }

    setTextValue(formatted);

    if (digits.length === 8) {
      const iso = toISO(formatted);
      const parsed = parseDMYParts(formatted);
      if (parsed) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      }
      emitChange(iso, formatted);
    } else {
      emitChange(formatted, formatted);
    }
  };

  const toggleCalendar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || readOnly) return;
    if (!isOpen) {
      const parsed = parseDMYParts(textValue);
      if (parsed) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      } else {
        const now = new Date();
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
      }
      updatePopoverPosition();
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelectDay = (day) => {
    const dd = String(day).padStart(2, '0');
    const mm = String(viewMonth + 1).padStart(2, '0');
    const yyyy = String(viewYear);
    const dmy = `${dd}/${mm}/${yyyy}`;
    const iso = `${yyyy}-${mm}-${dd}`;
    setTextValue(dmy);
    emitChange(iso, dmy);
    setIsOpen(false);
  };

  const handleSelectToday = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    const dmy = `${dd}/${mm}/${yyyy}`;
    const iso = `${yyyy}-${mm}-${dd}`;
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setTextValue(dmy);
    emitChange(iso, dmy);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTextValue('');
    emitChange('', '');
    setIsOpen(false);
  };

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const yearOptions = React.useMemo(() => {
    const currentY = new Date().getFullYear();
    const list = [];
    for (let y = currentY + 10; y >= 1940; y--) {
      list.push(y);
    }
    return list;
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex items-center w-full min-w-0">
      <input
        ref={ref}
        type="text"
        id={id}
        name={name}
        disabled={disabled}
        readOnly={readOnly}
        value={textValue}
        onChange={handleTextChange}
        placeholder={placeholder}
        maxLength={10}
        autoComplete="off"
        data-slot="input"
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 pr-9 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 font-medium",
          className
        )}
        {...props}
      />

      {/* Calendar Trigger Button */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2">
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || readOnly}
          onClick={toggleCalendar}
          aria-label="Open calendar"
          className={cn(
            "p-1 rounded-md transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50",
            isOpen
              ? "text-blue-600 bg-blue-50"
              : "text-blue-600 hover:text-blue-700 hover:bg-blue-50/60"
          )}
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {/* Interactive Calendar Popover via Portal */}
      {mounted && isOpen && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              width: '272px',
              zIndex: 99999
            }}
            className="bg-white border border-zinc-200 rounded-xl shadow-2xl p-3 select-none animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header: Prev, Month Select, Year Select, Next */}
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1 flex-1 justify-center">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="text-xs font-bold text-zinc-800 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md px-1.5 py-1 outline-none focus:border-blue-500 cursor-pointer"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m.slice(0, 3)}
                    </option>
                  ))}
                </select>

                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="text-xs font-bold text-zinc-800 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md px-1.5 py-1 outline-none focus:border-blue-500 cursor-pointer"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-bold uppercase text-zinc-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isSelected =
                  parsedCurrent &&
                  parsedCurrent.year === viewYear &&
                  parsedCurrent.month === viewMonth &&
                  parsedCurrent.day === day;

                const isToday =
                  today.getFullYear() === viewYear &&
                  today.getMonth() === viewMonth &&
                  today.getDate() === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={cn(
                      "h-8 w-full rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer",
                      isSelected
                        ? "bg-blue-600 text-white font-bold shadow-sm"
                        : isToday
                        ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-zinc-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <span className="text-[10px] font-mono text-zinc-400">
                {textValue || 'dd/mm/yyyy'}
              </span>
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Today
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
});

const Input = React.forwardRef(function Input(
  {
    className,
    type,
    ...props
  },
  ref
) {
  if (type === "date") {
    return <DateInput ref={ref} className={className} {...props} />;
  }

  return (
    <InputPrimitive
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  );
});

export { Input, toDisplayDMY, toISO }
