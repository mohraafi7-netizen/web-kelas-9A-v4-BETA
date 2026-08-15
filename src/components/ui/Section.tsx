import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

function Section({ className, title, subtitle, children, ...props }: SectionProps) {
  return (
    <section className={cn('py-16 sm:py-20 lg:py-24', className)} {...props}>
      {(title || subtitle) && (
        <div className="text-center mb-12 sm:mb-16">
          {title && (
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-lg text-slate-400 max-w-2xl mx-auto">{subtitle}</p>}
          {(title || subtitle) && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-galaxy-500/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-galaxy-500" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-galaxy-500/50" />
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export { Section };
