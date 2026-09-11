import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export function SearchableSelect({ options, value, onChange, placeholder, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = (options || []).filter(opt => 
    String(opt?.label || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const selectedOption = (options || []).find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 dark:border-zinc-200 bg-white dark:bg-zinc-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 cursor-pointer shadow-xs"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-zinc-900 dark:text-zinc-900 font-medium" : "text-zinc-500 dark:text-zinc-600"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-60 text-zinc-700 dark:text-zinc-600" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-300 dark:border-zinc-200 bg-white dark:bg-white shadow-lg">
          <div className="sticky top-0 bg-white dark:bg-white p-2 border-b border-zinc-200 dark:border-zinc-200 z-10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                className="w-full bg-zinc-50 dark:bg-zinc-50 border border-zinc-300 dark:border-zinc-200 rounded-sm pl-8 pr-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-900 focus:outline-none focus:border-zinc-600"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-2 text-xs text-zinc-500 dark:text-zinc-600 text-center">No results found.</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`cursor-pointer rounded-sm px-3 py-2 text-sm transition-colors ${
                    value === opt.value 
                      ? 'bg-zinc-800 text-white font-medium' 
                      : 'text-zinc-900 dark:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-100 hover:text-zinc-800 dark:hover:text-zinc-950'
                  }`}
                  onClick={() => {
                    onChange({ target: { name, value: opt.value } });
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
