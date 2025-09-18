'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownSelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function DropdownSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option...',
  className = '',
  disabled = false,
  label,
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  
  // Find the selected option
  const selectedOption = options.find((option) => option.value === value);
  
  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);
  
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);
  
  const handleSelect = (optionValue: string) => {
    console.log('Selecting option:', optionValue);
    onValueChange(optionValue);
    setOpen(false);
  };
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </label>
      )}
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between 
            px-3 py-2 h-10
            bg-white dark:bg-gray-800 
            border border-gray-300 dark:border-gray-600
            rounded-md
            text-sm
            ${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
            transition-colors
            ${className}
          `}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={`
              h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform
              ${open ? 'rotate-180' : ''}
            `}
          />
        </button>
        
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600">
            <ul 
              className="max-h-60 rounded-md py-1 overflow-auto focus:outline-none"
              role="listbox"
            >
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <li
                    key={option.value}
                    className={`
                      relative cursor-pointer select-none py-2 px-3 pr-9
                      ${isSelected 
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100' 
                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                      transition-colors
                    `}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className={`block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-orange-600 dark:text-orange-400">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}



