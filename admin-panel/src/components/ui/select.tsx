import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const SelectContext = React.createContext<any>({});

export function Select({ children, value, onValueChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  
  
  // Update selectedValue when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open) {
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

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    setOpen(false);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  
  return (
    <SelectContext.Provider value={{ open, setOpen, selectedValue, handleValueChange }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className = '', children }: any) {
  const { open, setOpen } = React.useContext(SelectContext);
  
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!open);
      }}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectValue({ placeholder = 'Select...' }: any) {
  const { selectedValue } = React.useContext(SelectContext);
  return <span className={selectedValue ? '' : 'text-gray-400'}>{selectedValue || placeholder}</span>;
}

export function SelectContent({ children, className = '' }: any) {
  const { open } = React.useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-md bg-white shadow-lg border border-gray-200 max-h-48 overflow-y-auto ${className}`}>
      <div className="p-1">
        {children}
      </div>
    </div>
  );
}

export function SelectItem({ value, children }: any) {
  const { handleValueChange } = React.useContext(SelectContext);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleValueChange(value);
  };

  return (
    <button
      type="button"
      className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 text-left"
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}