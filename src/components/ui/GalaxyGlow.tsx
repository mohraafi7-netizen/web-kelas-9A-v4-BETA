import * as React from 'react';
import { cn } from '@/lib/utils';

interface GalaxyGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'purple' | 'blue' | 'cyan' | 'mixed';
  children?: React.ReactNode;
}

function GalaxyGlow({ className, size = 'md', color = 'mixed', children, ...props }: GalaxyGlowProps) {
  const sizes = {
    sm: 'w-16 h-16 blur-xl',
    md: 'w-32 h-32 blur-2xl',
    lg: 'w-48 h-48 blur-3xl',
    xl: 'w-64 h-64 blur-[100px]',
  };

  const colors = {
    purple: 'bg-purple-500/20',
    blue: 'bg-blue-500/20',
    cyan: 'bg-cyan-500/20',
    mixed: 'bg-gradient-to-r from-purple-500/15 to-cyan-500/15',
  };

  return (
    <div
      className={cn('absolute rounded-full pointer-events-none', sizes[size], colors[color], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { GalaxyGlow };
