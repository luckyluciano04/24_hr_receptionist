'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
      primary:
        'bg-slate-950 text-white shadow-[0_18px_50px_-18px_rgba(15,23,42,0.55)] hover:-translate-y-0.5 hover:bg-slate-800',
      secondary:
        'border border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50',
      outline:
        'border border-slate-300 bg-transparent text-slate-900 hover:-translate-y-0.5 hover:bg-slate-950 hover:text-white',
      ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-5 py-3 text-sm',
      lg: 'px-8 py-3.5 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
