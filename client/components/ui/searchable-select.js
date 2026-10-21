'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";
import { sortClassesAcademic, normalizeClassName } from "@/lib/academicUtils";

export function SearchableSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select...", 
  name, 
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0, maxHeight: 260 });
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      // Always position downwards below the trigger
      const availableBelow = Math.max(140, window.innerHeight - rect.bottom - 16);
      const maxDropdownHeight = Math.min(260, availableBelow);

      setDropPos({ 
        top: rect.bottom + 4, 
        left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)), 
        width: rect.width,
        maxHeight: maxDropdownHeight
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current && !wrapperRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (isOpen) {
        updatePosition();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(prev => !prev);
  };

  // Normalize options into { value, label } and sort classes in academic order
  const processedOptions = React.useMemo(() => {
    if (!Array.isArray(options) || options.length === 0) return [];
    
    // Standardize all input formats (strings, numbers, objects)
    const standardized = options.map(opt => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { value: String(opt), label: String(opt) };
      }
      if (opt && typeof opt === 'object') {
        const val = opt.value ?? opt.name ?? opt.label ?? '';
        const lbl = opt.label ?? opt.name ?? opt.value ?? '';
        return { ...opt, value: String(val), label: String(lbl) };
      }
      return { value: '', label: '' };
    }).filter(opt => opt.value !== '' || opt.label !== '');

    // Check if options list looks like a class list
    const isClassList = standardized.some(opt => {
      const lbl = String(opt.label || opt.value || '').toLowerCase();
      return /^(class|grade|prep|nursery|kg|playgroup|play|o[-\s]?level|a[-\s]?level|\d+$)/i.test(lbl);
    });

    if (isClassList) {
      return sortClassesAcademic(standardized);
    }
    return standardized;
  }, [options]);

  const filteredOptions = (processedOptions || []).filter(opt =>
    String(opt?.label || opt?.value || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  // Safely extract primitive value whether caller passed string, number, or event/object
  const cleanVal = (value && typeof value === 'object') ? (value.target?.value ?? value.value ?? '') : value;

  const selectedOption = (processedOptions || []).find(opt => {
    if (cleanVal === undefined || cleanVal === null || cleanVal === '') return false;
    if (String(opt.value) === String(cleanVal)) return true;
    if (String(opt.label) === String(cleanVal)) return true;
    const normOpt = normalizeClassName(opt.value || opt.label);
    const normVal = normalizeClassName(cleanVal);
    return normOpt && normVal && normOpt.toLowerCase() === normVal.toLowerCase();
  });

  const defaultTriggerClasses = "flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm cursor-pointer shadow-xs hover:border-zinc-400 transition-all font-medium text-zinc-950 gap-2 overflow-hidden";

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className={className || defaultTriggerClasses}
        onClick={handleToggle}
      >
        <span className={`truncate leading-normal min-w-0 flex-1 ${selectedOption ? "text-zinc-950 font-bold" : "text-zinc-400 font-medium"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{ 
            position: "fixed", 
            top: `${dropPos.top}px`, 
            left: `${dropPos.left}px`, 
            width: `${dropPos.width}px`, 
            maxHeight: `${(dropPos.maxHeight || 260) + 56}px`,
            zIndex: 999999 
          }}
          className="rounded-xl border border-zinc-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        >
          {processedOptions.length > 5 && (
            <div className="p-2 border-b border-zinc-200 bg-zinc-50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  className="w-full bg-white border border-zinc-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          <div 
            style={{ maxHeight: `${dropPos.maxHeight || 240}px` }} 
            className="overflow-y-auto p-1 bg-white"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-xs text-zinc-500 font-medium text-center">No results found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(value) === String(opt.value) || String(value) === String(opt.label);
                return (
                  <div
                    key={String(opt.value || opt.label)}
                    className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-zinc-950 text-white font-bold"
                        : "text-zinc-900 hover:bg-zinc-100"
                    }`}
                    onClick={() => {
                      if (typeof onChange === 'function') {
                        const optVal = String(opt.value ?? opt.label ?? '');
                        if (name) {
                          onChange({ target: { name, value: optVal } });
                        } else {
                          onChange(optVal, { target: { name: '', value: optVal } });
                        }
                      }
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {opt.label || opt.name || opt.value}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}