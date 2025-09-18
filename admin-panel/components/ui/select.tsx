import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Select({ children, value, onValueChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  
  // Ensure value is always a string, not an object
  const safeValue = typeof value === 'object' && value !== null 
    ? (value.value || String(value))
    : value;
  
  // Debug log
  useEffect(() => {
    console.log('Select component - open state:', open, 'value:', safeValue);
  }, [open, safeValue]);
  
  return (
    <div className="relative" ref={selectRef} style={{ position: 'relative' }}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { 
            open, 
            setOpen, 
            value: safeValue, 
            onValueChange,
            selectRef 
          });
        }
        // Convert non-React elements to string if they're objects
        return typeof child === 'object' && child !== null ? String(child) : child;
      })}
    </div>
  );
}

export function SelectTrigger({ className = '', children, open, setOpen, value }: any) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Trigger clicked, current open:', open, 'setting to:', !open);
    setOpen((prev: boolean) => !prev);
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
        if (React.isValidElement(child)) {
          // Pass value to child component, ensuring it's not an object
          const valueToPass = typeof value === 'object' && value !== null 
            ? (value.value || String(value))
            : value;
          return React.cloneElement(child as any, { value: valueToPass });
        }
        // If child is not a React element, convert to string
        return typeof child === 'object' && child !== null ? String(child) : child;
      })}
      <ChevronDown className={`h-4 w-4 opacity-50 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectValue({ placeholder = 'Select...', value, children }: any) {
  // Map of values to display labels
  const labelMap: Record<string, string> = {
    'MOBILE_BAR': 'Mobile Bar',
    'FOOD_TRUCK': 'Food Truck',
    'CATERING': 'Catering',
    'PER_PERSON': 'Per Person',
    'PER_HOUR': 'Per Hour',
    'FLAT_RATE': 'Flat Rate',
    'DRINKS': 'Drinks',
    'FOOD': 'Food',
    'RENTALS': 'Rentals',
    'SUPPLIES': 'Supplies',
    'EACH': 'Each',
    'DOZEN': 'Dozen',
    'CASE': 'Case',
    'HOUR': 'Hour',
    'HOURLY': 'Hourly',
    'DAILY': 'Daily',
    'EVENT': 'Per Event',
    'all': 'All Sections'  // Add this for the "all" value
  };
  
  // Debug logging
  console.log('SelectValue received value:', value, 'placeholder:', placeholder);
  
  // If children are provided (manual mapping), use them
  if (children) {
    // Make sure children is a string or valid React element
    const childContent = typeof children === 'object' && children !== null && 'value' in children 
      ? String(children.value || children.label || children)
      : String(children);
    return <span className="text-white">{childContent}</span>;
  }
  
  // Handle if value is an object (shouldn't happen but defensive coding)
  let displayValue = placeholder;
  if (value) {
    if (typeof value === 'object' && value !== null) {
      // If value is an object with value/label, use the label
      displayValue = value.label || value.value || String(value);
    } else {
      // Normal string value
      displayValue = labelMap[value] || value;
    }
  }
  
  console.log('SelectValue displaying:', displayValue);
  
  return (
    <span className={value ? 'text-white' : 'text-gray-400'}>
      {String(displayValue)}
    </span>
  );
}

export function SelectContent({ children, open, setOpen, value, onValueChange, selectRef }: any) {
  useEffect(() => {
    if (open) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        // Check if click is inside the select or its dropdown
        const isInsideSelect = selectRef?.current?.contains(target);
        const isInsideDropdown = target.closest('[data-select-dropdown]');
        
        if (!isInsideSelect && !isInsideDropdown) {
          console.log('Clicked outside, closing dropdown');
          setOpen(false);
        }
      };
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          console.log('ESC pressed, closing dropdown');
          setOpen(false);
        }
      };
      
      // Use capture phase for better event handling
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, setOpen, selectRef]);

  if (!open) return null;
  
  return (
    <div 
      data-select-dropdown="true"
      className="absolute z-[9999] mt-1 w-full rounded-md bg-gray-800 shadow-xl border border-gray-600"
      style={{
        maxHeight: '240px',
        overflowY: 'auto',
        minWidth: '100%'
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
          // Ensure non-React elements are converted to strings
          if (typeof child === 'object' && child !== null) {
            return String(child);
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function SelectItem({ value, children, setOpen, onValueChange, currentValue }: any) {
  const isSelected = currentValue === value;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('SelectItem clicked:', value, 'Current:', currentValue);
    
    // Call the value change handler
    if (onValueChange) {
      onValueChange(value);
      console.log('Called onValueChange with:', value);
    }
    
    // Close the dropdown immediately
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
      onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
      role="option"
      aria-selected={isSelected}
    >
      <span className="flex-1 text-left">
        {typeof children === 'object' && children !== null && 'value' in children 
          ? String(children.label || children.value || children)
          : String(children)}
      </span>
      {isSelected && <Check className="h-4 w-4 ml-2 flex-shrink-0" />}
    </button>
  );
}