import * as React from 'react';
import { cn } from '@/lib/utils';

interface GalaxyBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

function GalaxyBadge({ className, variant = 'default', size = 'md', children, ...props }: GalaxyBadgeProps) {
  const variants = {
    default: 'bg-galaxy-600 text-white',
    secondary: 'bg-slate-800 text-slate-300',
    outline: 'border border-slate-700 text-slate-300',
    success: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-600/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-600/20 text-red-400 border border-red-500/30',
    info: 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { GalaxyBadge };
