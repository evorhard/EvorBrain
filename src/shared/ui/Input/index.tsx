/**
 * Input Component
 * 
 * Reusable input component
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-gray-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          {
            'border-gray-300 focus-visible:ring-blue-600': !error,
            'border-red-500 focus-visible:ring-red-600': error,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';