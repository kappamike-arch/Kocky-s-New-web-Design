import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({ className = '', checked, onCheckedChange, ...props }: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
  };
  
  return (
    <label className="relative inline-flex items-center">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={handleChange}
        {...props}
      />
      <div className={`h-4 w-4 rounded border border-gray-300 bg-white ${checked ? 'bg-gray-900 border-gray-900' : ''} ${className}`}>
        {checked && (
          <Check className="h-3 w-3 text-white absolute top-0.5 left-0.5" />
        )}
      </div>
    </label>
  );
}

