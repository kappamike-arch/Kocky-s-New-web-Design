import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
  asChild?: boolean;
}

// Button variants function for external use
export function buttonVariants({
  variant = 'default',
  size = 'md',
}: {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
} = {}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    link: 'text-gray-900 underline-offset-4 hover:underline',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  };
  
  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
}

export function Button({ 
  variant = 'default', 
  size = 'md', 
  className = '', 
  children,
  asChild = false,
  ...props 
}: ButtonProps) {
  const combinedClasses = `${buttonVariants({ variant, size })} ${className}`;
  
  if (asChild) {
    return <>{children}</>;
  }
  
  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}

