import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { sortClassesAcademic } from "@/lib/academicUtils";

export function SearchableSelect({ options = [], value, onChange, placeholder = "Select...", name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  const updatePosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropPos({ 
        top: rect.bottom + window.scrollY + 4, 
        left: rect.left + window.scrollX, 
        width: rect.width 
      });
    }
  };

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
    updatePosition();
    setIsOpen(prev => !prev);
  };

  // Check if options are classes and sort in academic order
  const processedOptions = React.useMemo(() => {
    if (!Array.isArray(options) || options.length === 0) return [];
    
    // Check if options list looks like a class list
    const isClassList = options.some(opt => {
      const lbl = String(opt?.label || opt?.name || opt?.value || '').toLowerCase();
      return /^(class|grade|prep|nursery|kg|playgroup|play|o[-\s]?level|a[-\s]?level|\d+$)/i.test(lbl);
    });

    if (isClassList) {
      return sortClassesAcademic(options);
    }
    return options;
  }, [options]);

  const filteredOptions = (processedOptions || []).filter(opt =>
    String(opt?.label || opt?.name || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const selectedOption = (processedOptions || []).find(opt => String(opt.value) === String(value));

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className="flex h-10 w-full items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm cursor-pointer shadow-xs hover:border-zinc-500 transition-all font-medium text-zinc-950"
        onClick={handleToggle}
      >
        <span className={selectedOption ? "text-zinc-950 font-bold" : "text-zinc-400 font-medium"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{ 
            position: "absolute", 
            top: "100%", 
            left: 0, 
            width: "100%", 
            marginTop: "4px",
            zIndex: 99999 
          }}
          className="rounded-xl border border-zinc-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
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
          <div className="max-h-56 overflow-y-auto p-1 bg-white">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-xs text-zinc-500 font-medium text-center">No results found</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    String(value) === String(opt.value)
                      ? "bg-zinc-950 text-white font-bold"
                      : "text-zinc-900 hover:bg-zinc-100"
                  }`}
                  onClick={() => {
                    onChange({ target: { name, value: opt.value } });
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {opt.label || opt.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}