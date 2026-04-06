"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, User, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select User",
  label = "User",
  idKey = "userId",
  nameKey = "name",
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedOption = (options || []).find(opt => String(opt[idKey]) === String(value));

  const filteredOptions = (options || []).filter(opt =>
    String(opt[nameKey] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(opt[idKey] || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-charcoal/40 px-1">
        {label} {required && <span className="text-primary">*</span>}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-11 w-full rounded-xl border flex items-center justify-between px-4 text-[13px] font-bold transition-all outline-none bg-white/50
          ${isOpen ? "border-primary ring-4 ring-primary/5" : "border-primary/10 hover:border-primary/30"}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <User size={16} className="text-primary/40 shrink-0" />
          <span className="truncate text-charcoal">
            {selectedOption ? `${selectedOption[idKey]} - ${selectedOption[nameKey]}` : placeholder}
          </span>
        </div>
        <ChevronDown size={14} className={`text-charcoal/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 mt-2 w-full max-w-sm rounded-3xl bg-white p-3 shadow-2xl premium-border-glow overflow-hidden"
          >
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/20" size={14} />
              <input
                type="text"
                autoFocus
                placeholder="Search name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-primary/10 bg-slate-50 pl-10 pr-4 text-[11px] font-bold text-charcoal outline-none focus:border-primary/30"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt[idKey]}
                    type="button"
                    onClick={() => {
                      onChange(opt[idKey]);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-[11px] font-bold transition-all
                      ${String(opt[idKey]) === String(value)
                        ? "bg-primary/5 text-primary"
                        : "text-charcoal/60 hover:bg-slate-50 hover:text-charcoal"}`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[12px]">{opt[nameKey]}</span>
                      <span className="text-[9px] opacity-40 uppercase tracking-widest leading-none mt-0.5">ID: {opt[idKey]}</span>
                    </div>
                    {String(opt[idKey]) === String(value) && <Check size={14} />}
                  </button>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[10px] font-bold text-charcoal/20 uppercase tracking-widest">No results found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
