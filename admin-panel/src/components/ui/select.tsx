import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Select({ children, value, onValueChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { open, setOpen, value, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({ className = '', children, open, setOpen }: any) {
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${className}`}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder = 'Select...', value }: any) {
  return <span className={value ? '' : 'text-gray-400'}>{value || placeholder}</span>;
}

export function SelectContent({ children, open, setOpen, onValueChange }: any) {
  if (!open) return null;
  
  return (
    <>
      <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
      <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
        <div className="p-1">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as any, { setOpen, onValueChange });
            }
            return child;
          })}
        </div>
      </div>
    </>
  );
}

export function SelectItem({ value, children, setOpen, onValueChange }: any) {
  return (
    <button
      type="button"
      className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

