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

export function SelectTrigger({ className = '', children, open, setOpen }: any) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Trigger clicked, open state:', !open);
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
      {children}
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
    'EVENT': 'Per Event'
  };
  
  // If children are provided (manual mapping), use them
  if (children) {
    return <span className="text-white">{children}</span>;
  }
  
  // Get the display label
  const displayValue = value ? (labelMap[value] || value) : placeholder;
  
  return (
    <span className={value ? 'text-white' : 'text-gray-400'}>
      {displayValue}
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
      className="absolute z-[9999] mt-1 w-full rounded-md bg-gray-800 shadow-xl border border-gray-600 overflow-hidden"
      style={{
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
    
    // Close the dropdown after a short delay to ensure the value updates
    setTimeout(() => {
      setOpen(false);
    }, 50);
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
      <span className="flex-1 text-left">{children}</span>
      {isSelected && <Check className="h-4 w-4 ml-2 flex-shrink-0" />}
    </button>
  );
}