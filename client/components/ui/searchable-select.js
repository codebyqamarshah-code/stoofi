import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export function SearchableSelect({ options, value, onChange, placeholder, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropPos, setDropPos] = useState({});
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current && !wrapperRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setIsOpen(prev => !prev);
  };

  const filteredOptions = (options || []).filter(opt =>
    String(opt?.label || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const selectedOption = (options || []).find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm cursor-pointer shadow-sm hover:border-zinc-400 transition-colors"
        onClick={handleToggle}
      >
        <span className={selectedOption ? "text-zinc-900 font-medium" : "text-zinc-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{ position: "fixed", top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 99999 }}
          className="rounded-md border border-zinc-200 bg-white shadow-2xl overflow-hidden"
        >
          <div className="p-2 border-b border-zinc-100 bg-white">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-8 pr-2 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto bg-white">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-xs text-zinc-400 text-center">No results found.</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`cursor-pointer px-3 py-2.5 text-sm transition-colors ${
                    value === opt.value
                      ? "bg-emerald-50 text-emerald-800 font-semibold border-l-2 border-emerald-500"
                      : "text-zinc-800 hover:bg-zinc-50"
                  }`}
                  onClick={() => {
                    onChange({ target: { name, value: opt.value } });
                    setIsOpen(false);
                    setSearchTerm("");
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