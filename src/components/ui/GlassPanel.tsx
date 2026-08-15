import * as React from 'react';
import { cn } from '@/lib/utils';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

function GlassPanel({ className, hover, glow, children, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'glass-panel rounded-2xl transition-all duration-300',
        hover && 'hover:bg-glass-hover hover:border-glass-hover hover:-translate-y-0.5 hover:shadow-xl hover:shadow-galaxy-900/20',
        glow && 'cosmic-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { GlassPanel };
