'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface CustomSelectProps {
  options: (SelectOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  variant?: 'input' | 'pill';
  icon?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  disabled = false,
  variant = 'input',
  icon
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: SelectOption[] = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'pill') {
    return (
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="bg-accent-red text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border-none outline-none shadow-md cursor-pointer flex items-center gap-2.5 hover:brightness-110 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {selectedOption?.icon && <i className={`fa-solid ${selectedOption.icon} text-xs`}></i>}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {normalizedOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors ${
                  value === opt.value
                    ? 'bg-red-50 text-accent-red font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  {opt.icon && <i className={`fa-solid ${opt.icon} text-xs ${value === opt.value ? 'text-accent-red' : 'text-gray-400'}`}></i>}
                  {opt.label}
                </span>
                {value === opt.value && <i className="fa-solid fa-check text-xs text-accent-red"></i>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-gray-50/50 hover:bg-white text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border ${
          isOpen ? 'border-[#004f9e] ring-4 ring-blue-50 bg-white' : 'border-gray-200'
        } shadow-sm cursor-pointer flex items-center justify-between ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span className="flex items-center gap-2.5 truncate">
          {icon && <i className={`fa-solid ${icon} text-xs ${selectedOption ? 'text-[#004f9e]' : 'text-gray-400'}`}></i>}
          <span className={selectedOption ? 'font-medium text-gray-800' : 'text-gray-400 font-normal'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <i className={`fa-solid fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#004f9e]' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {normalizedOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between transition-colors ${
                value === opt.value
                  ? 'bg-blue-50 text-[#004f9e] font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && <i className="fa-solid fa-check text-xs text-[#004f9e]"></i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
