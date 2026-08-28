'use client';

import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: string;
  description?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  label?: string;
  icon?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  label,
  icon,
  className = '',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue: string | number) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
          {icon && <i className={`${icon} text-primary`}></i>}
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border rounded-xl text-left text-sm font-medium transition-all duration-200 flex items-center justify-between gap-3 shadow-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          isOpen ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-gray-200 dark:border-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedOption?.icon && (
            <i className={`${selectedOption.icon} text-primary shrink-0 text-base`}></i>
          )}
          <span className={`truncate text-gray-800 dark:text-gray-100 ${!selectedOption ? 'text-gray-400' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <i
          className={`fa-solid fa-chevron-down text-xs text-gray-400 dark:text-gray-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        ></i>
      </button>

      {/* Options Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[full] mt-1.5 bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-[9999] max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-400 text-center">Tidak ada opsi</div>
          ) : (
            options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 border-b border-gray-50 dark:border-gray-800/50 last:border-b-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 text-primary dark:text-blue-400 font-bold'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {opt.icon && (
                      <i className={`${opt.icon} ${isSelected ? 'text-primary' : 'text-gray-400'} shrink-0 text-sm`}></i>
                    )}
                    <div>
                      <p className="truncate text-sm">{opt.label}</p>
                      {opt.description && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-normal truncate mt-0.5">
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <i className="fa-solid fa-check text-xs text-primary shrink-0"></i>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
