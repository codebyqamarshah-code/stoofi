'use client';

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const hiddenDateRef = React.useRef(null);

  React.useEffect(() => {
    if (value !== undefined) {
      setTextValue(toDisplayDMY(value));
    }
  }, [value]);

  const handleTextChange = (e) => {
    const inputVal = e.target.value;
    if (!inputVal) {
      setTextValue('');
      if (onChange) {
        onChange({
          ...e,
          target: { ...e.target, name: name || props.name, value: '', dmy: '' }
        });
      }
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

    const iso = toISO(formatted);
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          name: name || props.name,
          value: digits.length === 8 ? iso : formatted,
          dmy: formatted
        }
      });
    }
  };

  const handleHiddenPickerChange = (e) => {
    const isoVal = e.target.value;
    if (isoVal) {
      const dmy = toDisplayDMY(isoVal);
      setTextValue(dmy);
      if (onChange) {
        onChange({
          ...e,
          target: {
            ...e.target,
            name: name || props.name,
            value: isoVal,
            dmy
          }
        });
      }
    }
  };

  const openPicker = () => {
    if (disabled || readOnly) return;
    try {
      if (hiddenDateRef.current?.showPicker) {
        hiddenDateRef.current.showPicker();
      } else {
        hiddenDateRef.current?.focus();
        hiddenDateRef.current?.click();
      }
    } catch (_) {}
  };

  const isoForHidden = toISO(textValue);

  return (
    <div className="relative flex items-center w-full min-w-0">
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
      
      {/* Calendar Trigger and Native Picker */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2.5 pointer-events-auto">
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || readOnly}
          onClick={openPicker}
          aria-label="Select date"
          className="text-zinc-400 hover:text-zinc-700 transition-colors p-0.5 rounded cursor-pointer disabled:pointer-events-none disabled:opacity-50"
        >
          <Calendar className="h-4 w-4" />
        </button>
        <input
          ref={hiddenDateRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled || readOnly}
          value={isoForHidden || ''}
          min={min}
          max={max}
          onChange={handleHiddenPickerChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto"
          style={{ width: '32px', right: 0, left: 'auto' }}
        />
      </div>
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
