import * as React from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

function EmptyState({ title = 'No data found', description, action, icon, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center glass rounded-2xl border border-white/5', className)}>
      <div className="w-12 h-12 rounded-xl glass border border-white/10 flex items-center justify-center mb-3 text-galaxy-300">
        {icon ?? <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 mb-5 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

export { EmptyState };
