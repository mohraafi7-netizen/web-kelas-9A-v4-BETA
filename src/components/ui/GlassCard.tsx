import * as React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: 'subtle' | 'default' | 'strong';
  glow?: boolean;
  children: React.ReactNode;
}

function GlassCard({ className, hover, variant = 'default', glow = false, children, ...props }: GlassCardProps) {
  const variants = {
    subtle: 'glass',
    default: 'glass-strong',
    strong: 'bg-white/6 backdrop-blur-2xl border-white/15',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        variants[variant],
        hover && 'hover:bg-white/6 hover:border-white/15 hover:-translate-y-1 hover:shadow-xl hover:shadow-galaxy-900/20',
        glow && 'cosmic-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { GlassCard };
