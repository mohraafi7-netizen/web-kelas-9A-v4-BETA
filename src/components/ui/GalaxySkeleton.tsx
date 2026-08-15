import * as React from 'react';
import { cn } from '@/lib/utils';

interface GalaxySkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

function GalaxySkeleton({ className, variant = 'rectangular', width, height, lines = 3, ...props }: GalaxySkeletonProps) {
  const baseStyles = 'relative overflow-hidden rounded-lg bg-slate-800/50';
  
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl',
  };

  const shimmer = (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
      <div className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={cn(baseStyles, variants[variant], 'h-3')} style={{ width: i === lines - 1 ? '60%' : '100%' }}>
            {shimmer}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={{ width, height }}
      {...props}
    >
      {shimmer}
    </div>
  );
}

export { GalaxySkeleton };
