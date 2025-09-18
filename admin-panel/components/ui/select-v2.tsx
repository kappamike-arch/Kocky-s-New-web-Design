import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import ReactDOM from 'react-dom';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

// Store to track value-to-label mappings
const valueLabelMap = new Map<string, string>();

export function Select({ children, value, onValueChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  
  // Extract labels from children
  useEffect(() => {
    React.Children.forEach(children, (child: any) => {
      if (child?.type === SelectContent) {
        React.Children.forEach(child.props.children, (item: any) => {
          if (item?.type === SelectItem) {
            valueLabelMap.set(item.props.value, item.props.children);
          }
        });
      }
    });
  }, [children]);
  
  return (
    <div className="relative" ref={selectRef}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { 
            open, 
            setOpen, 
            value, 
            onValueChange,
            selectRef 
          });
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({ className = '', children, open, setOpen, value }: any) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors hover:bg-gray-800 ${className}`}
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectValue) {
          return React.cloneElement(child as any, { value });
        }
        return child;
      })}
      <ChevronDown className={`h-4 w-4 opacity-50 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectValue({ placeholder = 'Select...', value, children }: any) {
  // If children are provided (manual mapping), use them
  if (children) {
    return <span className="text-white">{children}</span>;
  }
  
  // Otherwise, try to get the label from our map
  const label = value ? valueLabelMap.get(value) : null;
  
  return (
    <span className={value ? 'text-white' : 'text-gray-400'}>
      {label || value || placeholder}
    </span>
  );
}

export function SelectContent({ children, open, setOpen, value, onValueChange, selectRef }: any) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  
  useEffect(() => {
    if (open && selectRef?.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [open, selectRef]);

  useEffect(() => {
    if (open) {
      const handleClickOutside = (e: MouseEvent) => {
        if (selectRef?.current && !selectRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, setOpen, selectRef]);

  if (!open) return null;
  
  const dropdown = (
    <div 
      className="fixed z-[9999] rounded-md bg-gray-800 shadow-xl border border-gray-600 overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        maxHeight: '240px',
        overflowY: 'auto'
      }}
    >
      <div className="p-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as any, { 
              setOpen, 
              onValueChange,
              currentValue: value 
            });
          }
          return child;
        })}
      </div>
    </div>
  );

  // Use portal to render dropdown at root level to avoid z-index issues
  return ReactDOM.createPortal(dropdown, document.body);
}

export function SelectItem({ value, children, setOpen, onValueChange, currentValue }: any) {
  const isSelected = currentValue === value;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store the label for this value
    if (typeof children === 'string') {
      valueLabelMap.set(value, children);
    }
    
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <button
      type="button"
      className={`
        relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm 
        outline-none transition-colors
        ${isSelected 
          ? 'bg-orange-600 text-white' 
          : 'text-gray-200 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white'
        }
      `}
      onClick={handleClick}
      role="option"
      aria-selected={isSelected}
    >
      <span className="flex-1">{children}</span>
      {isSelected && <Check className="h-4 w-4 ml-2" />}
    </button>
  );
}





