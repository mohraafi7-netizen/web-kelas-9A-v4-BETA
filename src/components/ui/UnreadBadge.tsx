import * as React from 'react';
import { cn } from '@/lib/utils';

type UnreadBadgeProps = {
  count: number;
  className?: string;
  size?: 'sm' | 'md';
};

function formatCount(n: number) {
  if (n > 99) return '99+';
  if (n < 0) return '0';
  return String(n);
}

function UnreadBadge({ count, className, size = 'sm' }: UnreadBadgeProps) {
  if (!count || count <= 0) return null;
  const isCompact = size === 'sm';
  return (
    <span
      aria-label={`${count} unread`}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white leading-none tabular-nums',
        'bg-gradient-to-br from-rose-500 to-pink-600 ring-1 ring-white/20 shadow',
        isCompact ? 'min-w-[16px] h-4 px-1 text-[10px]' : 'min-w-[20px] h-5 px-1.5 text-[11px]',
        className
      )}
    >
      {formatCount(count)}
    </span>
  );
}

export { UnreadBadge };
