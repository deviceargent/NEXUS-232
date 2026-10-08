import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={twMerge(
          clsx(
            'w-full bg-[var(--nexus-surface)] border border-[var(--nexus-border)] text-[var(--nexus-text)] text-xs font-mono rounded px-2.5 py-1.5 focus:outline-none focus:border-[var(--nexus-accent)] focus:ring-1 focus:ring-[var(--nexus-accent)] placeholder:text-[var(--nexus-text-dim)] disabled:opacity-50 transition-colors',
            error && 'border-[var(--nexus-blocked)] focus:border-[var(--nexus-blocked)] focus:ring-[var(--nexus-blocked)]',
            className
          )
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
