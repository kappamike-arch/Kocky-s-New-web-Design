import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export function Textarea({ className = '', ...props }: TextareaProps) {
  // Default styles that can be overridden by className
  const defaultClasses = 'flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  // If no custom className is provided, use default light theme styles
  const finalClassName = className 
    ? `${defaultClasses} ${className}` 
    : `${defaultClasses} border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-gray-400`;
  
  return (
    <textarea
      className={finalClassName}
      {...props}
    />
  );
}
