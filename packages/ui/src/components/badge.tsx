import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type StatusVariant = 'VALID' | 'IN_REVIEW' | 'BLOCKED' | 'UNDETERMINED' | 'INVALID' | 'DEFAULT';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: StatusVariant;
  interactive?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status = 'DEFAULT',
  interactive = false,
  className,
  children,
  ...props
}) => {
  const base = 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--nexus-radius-sm)] text-[10px] font-mono font-medium tracking-tight border uppercase transition-colors';

  const statusStyles: Record<StatusVariant, string> = {
    VALID: 'bg-[var(--nexus-valid-subtle)] text-[var(--nexus-valid)] border-[var(--nexus-valid)]/40',
    IN_REVIEW: 'bg-[var(--nexus-in-review-subtle)] text-[var(--nexus-in-review)] border-[var(--nexus-in-review)]/40',
    BLOCKED: 'bg-[var(--nexus-blocked-subtle)] text-[var(--nexus-blocked)] border-[var(--nexus-blocked)]/40 font-bold',
    UNDETERMINED: 'bg-[var(--nexus-undetermined-subtle)] text-[var(--nexus-undetermined)] border-[var(--nexus-undetermined)]/30',
    INVALID: 'bg-[var(--nexus-invalid-subtle)] text-[var(--nexus-invalid)] border-[var(--nexus-invalid)]/40 font-bold',
    DEFAULT: 'bg-[var(--nexus-surface-2)] text-[var(--nexus-text-muted)] border-[var(--nexus-border)]'
  };

  return (
    <span
      className={twMerge(
        clsx(base, statusStyles[status], interactive && 'cursor-pointer hover:brightness-125', className)
      )}
      {...props}
    >
      {children}
    </span>
  );
};
