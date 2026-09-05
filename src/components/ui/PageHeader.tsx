import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
}

function PageHeader({ eyebrow, title, description, actions, className, align = 'left' }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-galaxy-300 mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm sm:text-base text-slate-400 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

export { PageHeader };
