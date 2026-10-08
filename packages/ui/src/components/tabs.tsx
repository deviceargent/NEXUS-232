import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, activeId, onChange, className }) => {
  return (
    <div
      className={twMerge(
        'flex items-center gap-1 border-b border-[var(--nexus-border)] bg-[var(--nexus-surface)] px-2 overflow-x-auto select-none no-scrollbar',
        className
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border-b-2 transition-all cursor-pointer whitespace-nowrap',
              isActive
                ? 'border-[var(--nexus-accent)] text-[var(--nexus-accent)] font-semibold bg-[var(--nexus-accent-subtle)]/30'
                : 'border-transparent text-[var(--nexus-text-muted)] hover:text-[var(--nexus-text)] hover:bg-[var(--nexus-surface-2)]'
            )}
          >
            {tab.icon && <span className="opacity-80">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-[var(--nexus-surface-2)] text-[var(--nexus-text-dim)] border border-[var(--nexus-border)]">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
