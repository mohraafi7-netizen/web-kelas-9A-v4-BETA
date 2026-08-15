import * as React from 'react';
import { cn } from '@/lib/utils';

interface GalaxyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'cosmic' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  href?: string;
}

const GalaxyButton = React.forwardRef<HTMLButtonElement, GalaxyButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, href, icon, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-galaxy-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';
    
    const variants = {
      primary: 'bg-galaxy-600 hover:bg-galaxy-500 text-white shadow-lg shadow-galaxy-600/20 hover:shadow-galaxy-500/30',
      secondary: 'glass hover:bg-glass-hover text-white border border-glass-border',
      ghost: 'hover:bg-glass-hover text-slate-300 hover:text-white',
      outline: 'border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white',
      cosmic: 'bg-gradient-to-r from-galaxy-600 to-purple-600 hover:from-galaxy-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40',
      danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-2',
      md: 'px-5 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-3',
    };

    if (href) {
      return (
        <a
          href={href}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {!loading && icon}
          <span className="relative z-10">{children}</span>
        </a>
      );
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!loading && icon}
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

GalaxyButton.displayName = 'GalaxyButton';

export { GalaxyButton };
