import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-mono font-medium rounded transition-all focus:outline-none focus:ring-1 focus:ring-[var(--nexus-accent)] disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
      primary: 'bg-[var(--nexus-accent)] text-[#090c10] hover:bg-[var(--nexus-accent-hover)] font-semibold shadow-sm',
      secondary: 'bg-[var(--nexus-surface-2)] text-[var(--nexus-text)] hover:bg-[var(--nexus-surface-hover)] border border-[var(--nexus-border)]',
      outline: 'border border-[var(--nexus-border)] text-[var(--nexus-text)] hover:bg-[var(--nexus-surface-2)] hover:border-[var(--nexus-accent)]',
      ghost: 'text-[var(--nexus-text-muted)] hover:text-[var(--nexus-text)] hover:bg-[var(--nexus-surface-2)]',
      danger: 'bg-[var(--nexus-blocked-subtle)] text-[var(--nexus-blocked)] border border-[var(--nexus-blocked)] hover:bg-[var(--nexus-blocked)] hover:text-white'
    };

    const sizes = {
      sm: 'text-xs px-2 py-0.5 h-6 gap-1',
      md: 'text-xs px-3 py-1.5 h-7 gap-1.5',
      lg: 'text-sm px-4 py-2 h-9 gap-2',
      icon: 'h-6 w-6 p-0 text-xs'
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(base, variants[variant], sizes[size], className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
