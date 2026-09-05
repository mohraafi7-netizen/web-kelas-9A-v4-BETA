'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { usePresence } from '@/hooks/usePresence';

type OnlineStatusIndicatorProps = {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
};

function OnlineStatusIndicator({ userId, size = 'md', showText = false, className }: OnlineStatusIndicatorProps) {
  const { isOnline } = usePresence();

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const status = isOnline(userId) ? 'online' : 'offline';

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('relative flex shrink-0', sizeClasses[size])}>
        {status === 'online' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={cn('relative rounded-full', status === 'online' ? 'bg-emerald-500' : 'bg-slate-500')} />
      </span>
      {showText && (
        <span className={cn('text-xs', status === 'online' ? 'text-emerald-400' : 'text-slate-500')}>
          {status === 'online' ? 'Online' : 'Offline'}
        </span>
      )}
    </span>
  );
}

export { OnlineStatusIndicator };

